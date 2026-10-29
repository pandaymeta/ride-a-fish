import { Storage } from '@dcl/sdk/server'
import { PlayerProfile, Progress } from '../shared/messages'

interface RecordState {
  progress: Progress; guest: boolean; revision: number; savedRevision: number; saving: boolean
  peak: number; result: string
}
const KEY = 'ride-a-fish-progress-v1'

export class ProgressStore {
  readonly players = new Map<string, RecordState>()
  private loading = new Map<string, Promise<boolean>>()

  async load(address: string, guest: boolean): Promise<boolean> {
    if (this.players.has(address)) return true
    const pending = this.loading.get(address)
    if (pending) return pending
    const task = this.read(address, guest)
    this.loading.set(address, task)
    try { return await task } finally { this.loading.delete(address) }
  }

  private async read(address: string, guest: boolean): Promise<boolean> {
    try {
      const raw = guest ? null : await Storage.player.get<Progress>(address, KEY)
      // A failed read never becomes a fresh save and cannot overwrite a real collection.
      const progress: Progress = raw === null ? { version: 1, counts: [0, 0, 0], largest: [0, 0, 0], best: 0 }
        : { version: 1, counts: this.numbers(raw.counts), largest: this.numbers(raw.largest),
          best: this.integer(raw.best) }
      this.players.set(address, { progress, guest, revision: 0, savedRevision: 0, saving: false,
        peak: 0, result: 'Enter the portal. Eat smaller fish. Avoid bigger fish.' })
      return true
    } catch (error) {
      console.error('[SERVER] Collection load failed; preserving existing storage.', String(error))
      return false
    }
  }

  start(address: string): void {
    const p = this.players.get(address)
    if (p) { p.peak = 1; p.result = '' }
  }

  grow(address: string, mass: number): void {
    const p = this.players.get(address)
    if (!p) return
    p.peak = Math.max(p.peak, mass)
    if (mass > p.progress.best) { p.progress.best = mass; p.revision++ }
  }

  catch(address: string, species: number, mass: number): boolean {
    const p = this.players.get(address)
    if (!p || species < 0 || species > 2) return false
    const fresh = p.progress.counts[species] === 0
    p.progress.counts[species]++
    p.progress.largest[species] = Math.max(p.progress.largest[species], mass)
    p.revision++
    return fresh
  }

  end(address: string, reason: string): void {
    const p = this.players.get(address)
    if (p) p.result = reason
  }

  profile(address: string): PlayerProfile | undefined {
    const p = this.players.get(address)
    if (!p) return undefined
    return { counts: [...p.progress.counts], largest: [...p.progress.largest], best: p.progress.best,
      peak: p.peak, guest: p.guest, saved: !p.guest && p.savedRevision === p.revision, result: p.result }
  }

  async flush(address: string): Promise<void> {
    const p = this.players.get(address)
    if (!p || p.guest || p.saving || p.savedRevision === p.revision) return
    p.saving = true
    const revision = p.revision
    const snapshot: Progress = { ...p.progress, counts: [...p.progress.counts], largest: [...p.progress.largest] }
    try {
      if (await Storage.player.set(address, KEY, snapshot)) p.savedRevision = revision
      else console.error('[SERVER] Collection save pending; will retry.')
    } catch (error) {
      console.error('[SERVER] Collection save failed; will retry.', String(error))
    } finally { p.saving = false }
  }

  private integer(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  }
  private numbers(value: unknown): number[] {
    return [0, 1, 2].map(i => this.integer(Array.isArray(value) ? value[i] : 0))
  }
}
