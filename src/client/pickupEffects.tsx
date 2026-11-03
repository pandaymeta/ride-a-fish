/** @jsx ReactEcs.createElement */
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { AssetLoad, engine, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { PickupNotice } from '../shared/messages'
import { SEA_Y } from '../shared/config'
import type { LocalPickup } from './pickupPrediction'
import { PickupSounds } from './pickupSounds'
import { state } from '../ui/RideHud'
import { pickupCanvas, pickupTarget, projectPickup, ScreenPoint } from './pickupProjection'

const ICONS = ['assets/Images/KOFTE/Fish_07-card.png', 'assets/Images/KOFTE/Fish_17-card.png',
  'assets/Images/KOFTE/Fish_06-card.png', 'assets/Images/KOFTE/Fish_05-card.png',
  'assets/Images/KOFTE/Fish_20-card.png']
const MAX_CARDS = 9
interface Card {
  active: boolean; cash: boolean; age: number; duration: number; size: number
  x: number; y: number; opacity: number; image: string; uvs: number[]; rotation: number; phase: number
  start: ScreenPoint; control: ScreenPoint; finish: ScreenPoint; perpendicular: ScreenPoint
}
function uvRotation(angle: number): number[] {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [0, 0, 0, 1, 1, 1, 1, 0].map((value, i, values) => {
    const x = values[i - i % 2] - 0.5, y = values[i - i % 2 + 1] - 0.5
    return 0.5 + (i % 2 ? s * x + c * y : c * x - s * y)
  })
}
function backOut(t: number): number {
  const v = t - 1
  return 1 + 2.70158 * v * v * v + 1.70158 * v * v
}

// One capped sprite pool and one shared update, matching the Roblox reward flight.
export class PickupEffects {
  private cards: Card[] = Array.from({ length: MAX_CARDS }, (_, i) => ({
    active: false, cash: false, age: 0, duration: 0.85, size: 88,
    x: 0, y: 0, opacity: 0, rotation: 360, phase: 1.7, image: ICONS[i % ICONS.length], uvs: uvRotation(0),
    start: { x: 0, y: 0 }, control: { x: 0, y: 0 }, finish: { x: 0, y: 0 }, perpendicular: { x: 0, y: -1 }
  }))
  private seen = new Set<string>()
  private predicted = new Map<string, number>()
  private confirmedSpecies = new Set<number>()
  private predictedSpecies = new Set<number>()
  private sounds = new PickupSounds()
  private clock = 0
  private balance = -1
  private cashPulse = 0
  private indexPulse = 0
  private resting = { cashFont: state.cashFontSize, cashIcon: state.cashIconSize,
    indexFont: state.collectionFontSize, indexIcon: state.indexIconSize,
    cashTint: { ...state.cashTint }, indexTint: { ...state.indexTint } }

  constructor() {
    const owner = engine.addEntity()
    Transform.create(owner)
    AssetLoad.create(owner, { assets: ICONS })
    ReactEcsRenderer.addUiRenderer(owner, () => this.render(), {
      virtualWidth: 1920, virtualHeight: 1080, screenInset: 'none', zIndex: 200
    })
  }

  setCashBalance(value: number): void {
    if (!Number.isFinite(value) || value < this.balance) return
    this.balance = Math.max(0, Math.floor(value))
    state.cash = String(this.balance).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    state.cashTextWidth = Math.min(260, Math.max(36, state.cash.length * 28))
  }

  setCollection(counts: readonly number[]): void {
    counts.forEach((count, species) => { if (count > 0) this.confirmedSpecies.add(species) })
  }

  predict(event: LocalPickup): void {
    this.predicted.set(event.kind + ':' + event.target, this.clock + 8)
    if (this.predicted.size > 256) this.predicted.delete(this.predicted.keys().next().value!)
    this.play(event)
  }

  pickup(event: PickupNotice): void {
    if (this.seen.has(event.eventId)) return
    this.seen.add(event.eventId)
    if (this.seen.size > 256) this.seen.delete(this.seen.values().next().value!)
    this.setCashBalance(event.cashTotal)
    const key = event.kind + ':' + event.target
    const predictedUntil = this.predicted.get(key)
    this.predicted.delete(key)
    if (predictedUntil !== undefined && predictedUntil > this.clock) return
    this.play(event)
  }

  private play(event: LocalPickup): void {
    const discovery = event.kind === 1 && !this.confirmedSpecies.has(event.species) && !this.predictedSpecies.has(event.species)
    if (event.kind === 1) this.predictedSpecies.add(event.species)
    this.sounds.play(event.kind, discovery)
    const count = event.kind === 0 ? 1
      : event.value >= 36 ? 5 : event.value >= 18 ? 4 : event.value >= 6 ? 3 : 2
    for (let i = 0; i < count; i++) this.flight(event, true, i, count)
    if (event.kind === 1) this.flight(event, false, 0, 1)
  }

  private flight(event: LocalPickup, cash: boolean, index: number, count: number): void {
    const card = this.cards.find(item => !item.active)
    if (!card) { this.pulse(cash); return }
    const canvas = pickupCanvas()
    const player = Transform.getOrNull(engine.PlayerEntity)?.position
    const source = projectPickup(Vector3.create(event.x, SEA_Y, event.z), canvas)
      ?? (player ? projectPickup(player, canvas) : null)
      ?? { x: canvas.width * 0.5, y: canvas.height * 0.58 }
    const finish = pickupTarget(cash, canvas)
    const dx = finish.x - source.x, dy = finish.y - source.y
    const length = Math.hypot(dx, dy) || 1
    const perpendicular = { x: -dy / length, y: dx / length }
    const spread = cash ? (index - (count - 1) / 2) * 18 : 0
    const start = { x: source.x + perpendicular.x * spread, y: source.y + perpendicular.y * spread }
    const arc = cash ? 70 + Math.abs(spread) : 85
    card.cash = cash; card.image = cash ? 'assets/Images/golden-coin.png' : ICONS[event.species] ?? ICONS[0]
    card.size = cash ? 48 : 88; card.age = cash ? -index * 0.055 : 0
    card.duration = cash ? 0.52 + (index + 1) * 0.035 : 0.85
    card.rotation = cash ? 300 + (index + 1) * 70 : 360; card.phase = (index + 1) * 1.7
    card.start = start; card.finish = finish; card.perpendicular = perpendicular
    card.control = { x: start.x + (finish.x - start.x) * 0.48 + perpendicular.x * arc,
      y: start.y + (finish.y - start.y) * 0.48 + perpendicular.y * arc - (cash ? 45 : 55) }
    card.x = start.x; card.y = start.y; card.opacity = 1; card.uvs = uvRotation(0); card.active = true
  }

  update(dt: number, riding: boolean): void {
    this.clock += dt
    this.sounds.update(riding)
    if (!riding) {
      for (const card of this.cards) card.active = false
      this.predicted.clear()
      this.predictedSpecies.clear()
    }
    for (const [key, until] of this.predicted) if (until <= this.clock) this.predicted.delete(key)
    for (const card of this.cards) {
      if (!card.active) continue
      card.age += dt
      if (card.age < 0) continue
      const t = Math.min(1, card.age / card.duration)
      const eased = 1 - (1 - t) * (1 - t), one = 1 - eased
      const wobble = Math.sin(t * Math.PI * 2 + card.phase) * (1 - t) * 18
      card.x = one * one * card.start.x + 2 * one * eased * card.control.x + eased * eased * card.finish.x + card.perpendicular.x * wobble
      card.y = one * one * card.start.y + 2 * one * eased * card.control.y + eased * eased * card.finish.y + card.perpendicular.y * wobble
      card.opacity = t > 0.82 ? (1 - t) / 0.18 : 1
      card.uvs = uvRotation(t * card.rotation * Math.PI / 180)
      if (t >= 1) { card.active = false; this.pulse(card.cash) }
    }
    if (this.cashPulse > 0) {
      this.cashPulse = Math.max(0, this.cashPulse - dt)
      const strength = this.pulseStrength(this.cashPulse)
      state.cashFontSize = this.resting.cashFont * (1 + strength * 0.22)
      state.cashIconSize = this.resting.cashIcon * (1 + strength * 0.22)
      state.cashTint = { ...this.resting.cashTint, g: this.resting.cashTint.g + strength * 0.15 }
    }
    if (this.indexPulse > 0) {
      this.indexPulse = Math.max(0, this.indexPulse - dt)
      const strength = this.pulseStrength(this.indexPulse)
      state.collectionFontSize = this.resting.indexFont * (1 + strength * 0.22)
      state.indexIconSize = this.resting.indexIcon * (1 + strength * 0.22)
      state.indexTint = { ...this.resting.indexTint, b: this.resting.indexTint.b + strength * 0.2 }
    }
  }

  private pulse(cash: boolean): void {
    if (cash) this.cashPulse = 0.26
    else this.indexPulse = 0.26
  }
  private pulseStrength(remaining: number): number {
    const elapsed = 0.26 - remaining
    return elapsed < 0.1 ? backOut(elapsed / 0.1) : Math.pow(Math.max(0, remaining) / 0.16, 2)
  }

  private render() {
    return <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { left: 0, top: 0 }, pointerFilter: 'none' }}>
      {this.cards.map((card, index) => <UiEntity key={index} uiTransform={{
        display: card.active && card.age >= 0 ? 'flex' : 'none', width: card.size, height: card.size,
        positionType: 'absolute', position: { left: card.x - card.size / 2, top: card.y - card.size / 2 },
        opacity: card.opacity, pointerFilter: 'none'
      }}>
        <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { left: 0, top: 0 } }}
          uiBackground={{ texture: { src: card.image }, textureMode: 'stretch', uvs: card.uvs }} />

      </UiEntity>)}
    </UiEntity>
  }
}
