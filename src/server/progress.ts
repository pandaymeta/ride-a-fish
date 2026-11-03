import { completeTutorialLesson, readTutorial, TUTORIAL_FISH, tutorialDialogue } from '../shared/tutorial'
import { Storage } from '@dcl/sdk/server'
import { PlayerProfile, Progress } from '../shared/messages'
import { SPECIES } from '../shared/config'

interface RecordState {
  progress: Progress; guest: boolean; revision: number; savedRevision: number; saving: boolean
  peak: number; result: string
}
const KEY = 'ride-a-fish-progress-v3'
const PREVIOUS_KEY = 'ride-a-fish-progress-v2'
const LEGACY_KEY = 'ride-a-fish-progress-v1'

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
      const previous = !guest && raw === null ? await Storage.player.get<Progress>(address, PREVIOUS_KEY) : null
      const source = raw ?? previous
      const legacy = !guest && source === null ? await Storage.player.get<Progress>(address, LEGACY_KEY) : null
      // Preserve v2 collections; failed reads never become fresh saves.
      const progress: Progress = source === null ? { version: 3, cash: 0,
        counts: this.numbers([0, this.integer(legacy?.counts?.[1]), 0, 0]),
        largest: this.numbers([0, this.integer(legacy?.largest?.[1]), 0, 0]), best: this.integer(legacy?.best) }
        : { version: 3, cash: this.integer(source.cash ?? source.food), counts: this.numbers(source.counts),
          largest: this.numbers(source.largest), best: this.integer(source.best) }
      progress.tutorial = readTutorial(source?.tutorial)
      this.players.set(address, { progress, guest, revision: 0, savedRevision: 0, saving: false,
        peak: 0, result: 'Find your Clownfish at the dock and press E to ride. Collect smaller fish and avoid larger predators.' })
      return true
    } catch (error) {
      console.error('[SERVER] Collection load failed; preserving existing storage.', String(error))
      return false
    }
  }

  lesson(address: string, bit: number): boolean {
    const p = this.players.get(address)
    if (!p || !completeTutorialLesson(p.progress.tutorial!, bit)) return false
    p.revision++
    return true
  }

  needsFirstCatch(address: string): boolean {
    const tutorial = this.players.get(address)?.progress.tutorial
    return !!tutorial && (tutorial.steps & TUTORIAL_FISH) === 0
  }

  dialogue(address: string): number | undefined {
    const p = this.players.get(address)
    return p ? tutorialDialogue(p.progress.tutorial!) : undefined
  }

  acknowledgeGuide(address: string, kind: number): boolean {
    const p = this.players.get(address)
    if (!p || this.dialogue(address) !== kind) return false
    p.progress.tutorial!.dialogues |= 1 << kind
    p.revision++
    return true
  }

  start(address: string, mass = 1): void {
    const p = this.players.get(address)
    if (p) { p.peak = mass; p.result = '' }
  }

  grow(address: string, mass: number): void {
    const p = this.players.get(address)
    if (!p) return
    p.peak = Math.max(p.peak, mass)
    if (mass > p.progress.best) { p.progress.best = mass; p.revision++ }
  }

  collectCash(address: string, amount: number): number {
    const p = this.players.get(address)
    if (!p || !Number.isInteger(amount) || amount <= 0) return p?.progress.cash ?? 0
    p.progress.cash = this.integer(p.progress.cash) + amount
    p.revision++
    return p.progress.cash
  }

  catch(address: string, species: number, mass: number): boolean {
    const p = this.players.get(address)
    if (!p || species < 0 || species >= SPECIES.length) return false
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
    return { tutorialSteps: p.progress.tutorial!.steps, tutorialDialogues: p.progress.tutorial!.dialogues,
      cash: this.integer(p.progress.cash), counts: [...p.progress.counts], largest: [...p.progress.largest], best: p.progress.best,
      peak: p.peak, guest: p.guest, saved: !p.guest && p.savedRevision === p.revision, result: p.result }
  }

  async flush(address: string): Promise<void> {
    const p = this.players.get(address)
    if (!p || p.guest || p.saving || p.savedRevision === p.revision) return
    p.saving = true
    const revision = p.revision
    const snapshot: Progress = { ...p.progress, tutorial: { ...p.progress.tutorial! }, counts: [...p.progress.counts], largest: [...p.progress.largest] }
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
    return SPECIES.map((_, i) => this.integer(Array.isArray(value) ? value[i] : 0))
  }
}
