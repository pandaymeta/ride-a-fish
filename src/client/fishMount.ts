import { engine, Entity, InputAction, inputSystem, MeshCollider, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { SEA_Y, SPEED } from '../shared/config'
import { constrainToLagoon, moveFishInLagoon } from '../shared/lagoon'
import { playRiderSittingPose, RIDER_HIP_HEIGHT } from './riderPose'

// Native platform motion carries the avatar; input is gated by confirmed seating.
export class FishMount {
  readonly platform: Entity
  moving = false
  steering = 0
  failed = false
  private seated = false
  private checking = false
  private releaseMovement = true
  private settleDuration = 0.5
  private boarding = true
  private disposed = false
  private stableTime = 0
  private driftTime = 0
  private boardTime = 0
  private retryWait = 0
  private attempts = 0
  private placement?: Promise<void>
  private seatPromise?: Promise<boolean>
  private finishSeat?: (success: boolean) => void

  constructor(readonly root: Entity, private height: () => number, private bodyRadius: () => number) {
    this.platform = engine.addEntity()
    Transform.create(this.platform, { parent: root, position: Vector3.create(0, this.seatHeight - 0.05, 0),
      scale: Vector3.create(1.25, 0.1, 1.25) })
    MeshCollider.setBox(this.platform, 2)
  }

  get awaitingMovementRelease(): boolean { return this.releaseMovement }

  get seatHeight(): number { return this.height() / 2 - RIDER_HIP_HEIGHT }
  get isSeated(): boolean { return this.seated && !this.disposed && !this.placement }

  get position(): Vector3 {
    const t = Transform.get(this.root)
    const offset = Vector3.rotate(Vector3.create(0, this.seatHeight + 0.05, 0), t.rotation)
    return Vector3.add(t.position, offset)
  }

  waitForSeat(recheck = false): Promise<boolean> {
    if (this.disposed || this.failed) return Promise.resolve(false)
    if (recheck && !this.finishSeat) {
      this.seated = false; this.boarding = true; this.releaseMovement = true
      this.stableTime = 0; this.boardTime = 0; this.settleDuration = 0.75
      this.seatPromise = undefined
    }
    if (this.seated) return Promise.resolve(true)
    this.checking = true
    return this.seatPromise ?? (this.seatPromise = new Promise(resolve => { this.finishSeat = resolve }))
  }

  update(dt: number, speedMultiplier = 1, enabled = true): void {
    this.moving = false; this.steering = 0
    if (this.disposed || this.failed) return
    // Keep growth, idle wave motion and an existing overlap clear of the shore too.
    const rootPose = Transform.getMutable(this.root)
    const clearance = this.bodyRadius()
    constrainToLagoon(rootPose.position, clearance, clearance)
    const platform = Transform.getMutable(this.platform)
    if (Math.abs(platform.position.y - (this.seatHeight - 0.05)) > 0.001) platform.position.y = this.seatHeight - 0.05
    if (!this.checking || (!enabled && !this.boarding)) return
    this.retryWait = Math.max(0, this.retryWait - dt)
    if (this.boarding && (this.boardTime += dt) > 10) { this.fail(); return }
    if (this.placement) return
    const player = Transform.getOrNull(engine.PlayerEntity)?.position
    const seat = this.position
    const tolerance = this.boarding ? 0.12 : 0.55
    const aligned = !!player && (player.x - seat.x) ** 2 + (player.z - seat.z) ** 2 <= tolerance ** 2
      && Math.abs(player.y - seat.y) <= 0.3
    if (aligned) {
      this.driftTime = 0
      if (!this.seated) {
        this.stableTime += Math.min(dt, 0.05)
        if (this.stableTime < this.settleDuration) return
        this.seated = true
        this.boarding = false
        this.attempts = 0
        this.finishSeat?.(true); this.finishSeat = undefined
      }
    } else {
      this.driftTime += Math.min(dt, 0.1)
      // One delayed avatar transform must not reset wave motion or reseat at the apex.
      // Persistent drift still uses the existing safe reseat/recovery path.
      if (this.boarding || !this.seated || this.driftTime >= 0.2) {
        this.seated = false; this.stableTime = 0; this.releaseMovement = true
      }
      if (this.driftTime >= 0.2 && this.retryWait <= 0) {
        if (this.attempts >= 4) { this.fail(); return }
        this.attempts++; this.retryWait = 1; this.driftTime = 0
        this.placement = this.reseat().finally(() => { this.placement = undefined })
      }
      return
    }
    if (!enabled) return
    const camera = Transform.getOrNull(engine.CameraEntity)
    const w = inputSystem.isPressed(InputAction.IA_FORWARD), s = inputSystem.isPressed(InputAction.IA_BACKWARD)
    const a = inputSystem.isPressed(InputAction.IA_LEFT), d = inputSystem.isPressed(InputAction.IA_RIGHT)
    // A held entry key must never become a swimming command when the seat unlocks.
    if (this.releaseMovement) {
      if (!w && !s && !a && !d) this.releaseMovement = false
      return
    }
    const forward = Number(w) - Number(s)
    const right = Number(d) - Number(a)
    this.steering = right
    this.moving = !!camera && (forward !== 0 || right !== 0)
    const t = Transform.getMutable(this.root)
    if (this.moving && camera) {
      const direction = Vector3.rotate(Vector3.Forward(), camera.rotation)
      const yaw = Math.atan2(direction.x, direction.z)
      const length = Math.hypot(forward, right)
      const x = (Math.sin(yaw) * forward + Math.cos(yaw) * right) / length
      const z = (Math.cos(yaw) * forward - Math.sin(yaw) * right) / length
      const step = Math.min(dt, 0.05) * SPEED * speedMultiplier
      moveFishInLagoon(t.position, x * step, z * step, this.bodyRadius())
      t.rotation = Quaternion.slerp(t.rotation, Quaternion.fromEulerDegrees(0, Math.atan2(x, z) * 180 / Math.PI, 0), 1 - Math.exp(-dt * 12))
    }
  }

  suspend(): Promise<void> {
    this.checking = false; this.seated = false; this.moving = false; this.boarding = false
    return this.placement ?? Promise.resolve()
  }

  dispose(): Promise<void> {
    this.disposed = true; this.seated = false; this.moving = false
    this.finishSeat?.(false); this.finishSeat = undefined
    engine.removeEntity(this.platform)
    // Let a previous seat teleport finish before the caller teleports back to the lobby.
    return this.placement ?? Promise.resolve()
  }

  private async reseat(): Promise<void> {
    try {
      const seat = this.position
      const forward = Vector3.rotate(Vector3.Forward(), Transform.get(this.root).rotation)
      const result = await movePlayerTo({ newRelativePosition: seat, duration: 0.12,
        avatarTarget: Vector3.create(seat.x + forward.x * 10, seat.y, seat.z + forward.z * 10) })
      if (result.success && !this.disposed && !this.boarding) await playRiderSittingPose()
    } catch (error) {
      if (!this.disposed) console.log('[CLIENT] Retrying fish seat.', String(error))
    }
  }

  private fail(): void {
    this.failed = true; this.seated = false; this.moving = false
    this.finishSeat?.(false); this.finishSeat = undefined
  }
}
