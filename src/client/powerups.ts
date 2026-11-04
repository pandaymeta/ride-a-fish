import { AssetLoad, EngineInfo, engine, Entity, GltfContainer,
  Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import { SEA_Y } from '../shared/config'
import { distanceSquared } from '../shared/eating'
import { FishState } from '../shared/messages'
import { BOOST_MAX_MULTIPLIER, POWERUP_MODELS,
  PowerupGrant, PowerupState, powerupEatRadius, SHIELD_POWERUP } from '../shared/powerups'
import { state as hud } from '../ui/PowerupHud'
import { PowerupSounds } from './powerupSounds'

interface View { entity: Entity; state: PowerupState }
interface Pending { kind: number; until: number }
export interface LocalPowerControls { speedMultiplier: number; boosting: boolean; shieldPreview: boolean }

export class PowerupClient {
  readonly controls: LocalPowerControls = { speedMultiplier: 1, boosting: false, shieldPreview: false }
  private views = new Map<number, View>()
  private pool: Entity[][] = [[], []]
  private pending = new Map<number, Pending>()
  private blocked = new Set<number>()
  private predictedEffects = new Map<number, number>()
  private confirmed = new Map<number, number>()
  private seen = new Set<string>()
  private sounds = new PowerupSounds()
  private clock = 0
  private snapshotAge = 0
  private lastTick = 0
  private lastX = 0
  private lastZ = 0
  private lastContactClock = 0
  private hasPosition = false
  private popupUntil = 0

  constructor() {
    const loader = engine.addEntity()
    Transform.create(loader)
    AssetLoad.create(loader, { assets: [...POWERUP_MODELS] })
  }

  apply(states: readonly PowerupState[], tick: number): void {
    this.snapshotAge = 0; this.lastTick = tick
    for (const [id, confirmedAt] of this.confirmed) if (tick >= confirmedAt) this.confirmed.delete(id)
    const active = states.filter(p => !this.confirmed.has(p.id))
    const present = new Set(active.map(p => p.id))
    for (const id of this.blocked) if (!present.has(id)) this.blocked.delete(id)
    for (const [id, view] of this.views) if (!present.has(id)) {
      VisibilityComponent.createOrReplace(view.entity, { visible: false })
      this.pool[view.state.kind].push(view.entity)
      this.views.delete(id)
    }
    for (const powerup of active) {
      if (this.views.has(powerup.id)) continue
      const entity = this.pool[powerup.kind].pop() ?? this.create(powerup.kind)
      const transform = Transform.getMutable(entity)
      const gum = powerup.kind === SHIELD_POWERUP
      const yaw = powerup.id * 137.507 % 360
      transform.position = Vector3.create(powerup.x, SEA_Y + (gum ? 0.22 : 0.12), powerup.z)
      transform.rotation = Quaternion.fromEulerDegrees(gum ? 40 : 58, yaw, gum ? 0 : 15)
      VisibilityComponent.createOrReplace(entity, { visible: !this.pending.has(powerup.id) })
      this.views.set(powerup.id, { entity, state: powerup })
    }
  }

  confirm(grant: PowerupGrant, mine: FishState | undefined): void {
    if (this.seen.has(grant.eventId)) return
    this.seen.add(grant.eventId)
    if (this.seen.size > 256) this.seen.delete(this.seen.values().next().value!)
    if (mine && grant.tick >= this.lastTick) {
      mine.powerShield = grant.powerShield; mine.boost = grant.boost
      this.snapshotAge = 0
    }
    this.confirmed.set(grant.target, grant.tick)
    this.pending.delete(grant.target)
    this.blocked.delete(grant.target)
    const view = this.views.get(grant.target)
    if (view) {
      VisibilityComponent.createOrReplace(view.entity, { visible: false })
      this.pool[view.state.kind].push(view.entity)
      this.views.delete(grant.target)
    }
    if ((this.predictedEffects.get(grant.target) ?? 0) <= this.clock) this.feedback(grant.kind)
    this.predictedEffects.delete(grant.target)
  }

  updateControl(dt: number, mine: FishState | undefined, riding: boolean, alive: boolean, panelOpen: boolean): void {
    this.clock += dt; this.snapshotAge += dt
    const active = riding && alive && !!mine && !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    const boost = Math.max(0, (mine?.boost ?? 0) - this.snapshotAge)
    const boosted = active && boost > 0
    this.controls.speedMultiplier = boosted ? BOOST_MAX_MULTIPLIER : 1
    this.controls.boosting = boosted
    this.controls.shieldPreview = false
    for (const [id, pending] of this.pending) {
      if (pending.until <= this.clock || !active) {
        const view = this.views.get(id)
        if (view) {
          VisibilityComponent.createOrReplace(view.entity, { visible: true })
          if (active) this.blocked.add(id)
        }
        this.pending.delete(id)
      } else if (pending.kind === SHIELD_POWERUP) this.controls.shieldPreview = true
    }
    if (!riding) this.blocked.clear()
    for (const [id, until] of this.predictedEffects) if (until <= this.clock || !riding) this.predictedEffects.delete(id)
    hud.display = active && !panelOpen ? 'flex' : 'none'
    hud.popupOpacity = Math.max(0, Math.min(1, (this.popupUntil - this.clock) / 0.35))
  }

  updateContact(mine: FishState | undefined, position: Vector3 | undefined, active: boolean): void {
    const visible = active && !!mine && !!position && !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    const elapsed = Math.max(0.001, this.clock - this.lastContactClock)
    const moving = !!(visible && position && this.hasPosition
      && distanceSquared(position.x, position.z, this.lastX, this.lastZ) >= 0.09 * elapsed * elapsed)
    this.sounds.update(visible, this.controls.boosting && moving)
    if (visible && position) {
      this.lastX = position.x; this.lastZ = position.z; this.hasPosition = true
    } else this.hasPosition = false
    this.lastContactClock = this.clock
    if (!visible || !mine || !position) return
    const radius = powerupEatRadius(mine.mass)
    for (const [id, view] of this.views) {
      if (this.pending.has(id)) continue
      const distance = distanceSquared(position.x, position.z, view.state.x, view.state.z)
      if (distance > (radius + 0.2) * (radius + 0.2)) { this.blocked.delete(id); continue }
      if (this.blocked.has(id) || distance >= radius * radius) continue
      this.pending.set(id, { kind: view.state.kind, until: this.clock + 1.25 })
      this.predictedEffects.set(id, this.clock + 8)
      VisibilityComponent.createOrReplace(view.entity, { visible: false })
      this.feedback(view.state.kind)
    }
  }

  private feedback(kind: number): void {
    this.sounds.pickup(kind)
    hud.popup = kind === SHIELD_POWERUP ? 'Shield' : 'Speedboost'
    hud.popupColor = kind === SHIELD_POWERUP ? { r: 0, g: 0.67, b: 1, a: 1 } : { r: 1, g: 0.84, b: 0.27, a: 1 }
    this.popupUntil = this.clock + 1.5
  }

  tutorialAvailable(id: number): boolean {
    return this.views.has(id) && !this.pending.has(id) && !this.confirmed.has(id)
  }

  private create(kind: number): Entity {
    const entity = engine.addEntity()
    const scale = kind === SHIELD_POWERUP ? 0.84 : 1.2
    Transform.create(entity, { scale: Vector3.create(scale, scale, scale) })
    GltfContainer.create(entity, { src: POWERUP_MODELS[kind], visibleMeshesCollisionMask: 0, invisibleMeshesCollisionMask: 0 })
    return entity
  }
}
