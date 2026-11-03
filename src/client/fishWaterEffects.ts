import { AssetLoad, engine, Entity, getWorldPosition, getWorldRotation, ParticleSystem,
  PBParticleSystem_BlendMode, PBParticleSystem_PlaybackState, PBParticleSystem_SimulationSpace,
  Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { SEA_Y } from '../shared/config'

const RIPPLES = 'assets/Images/reference-swim-ripples.png'
const SPRAY = 'assets/Images/reference-swim-spray.png'
const WHITE = { r: 1, g: 1, b: 1, a: 1 }
const CLEAR_WHITE = { ...WHITE, a: 0 }
const UP = Quaternion.fromEulerDegrees(-90, 0, 0)
const BACK_AND_UP = Quaternion.fromEulerDegrees(-65, 180, 0)

// The reference's swimming and boat-wake presets share these two sprite assets.
// Two reusable emitters per swimmer keep four players + the shark at ten systems.
export class FishWaterEffects {
  private rings: Entity
  private spray: Entity
  private last: Vector3
  private near = false
  private visible = false
  private mode = -1
  private size = -1
  private fast = false
  private jumping = false
  private splashTime = 0
  private emissionTime = 0

  constructor(private root: Entity) {
    this.last = getWorldPosition(engine, root)
    this.rings = engine.addEntity()
    this.spray = engine.addEntity()
    const position = Vector3.create(this.last.x, SEA_Y + 0.12, this.last.z)
    Transform.create(this.rings, { position: Vector3.clone(position) })
    Transform.create(this.spray, { position, rotation: UP })
    ParticleSystem.create(this.rings, {
      active: false, maxParticles: 64, rate: 3, lifetime: 1.5, gravity: 0,
      billboard: false, initialRotation: Quaternion.fromEulerDegrees(90, 0, 0),
      initialVelocitySpeed: { start: 0.3, end: 0 }, initialSize: { start: 0.5, end: 0.8 },
      sizeOverTime: { start: 0.5, end: 2 },
      colorOverTime: { start: WHITE, end: CLEAR_WHITE },
      texture: { src: RIPPLES }, blendMode: PBParticleSystem_BlendMode.PSB_ADD,
      simulationSpace: PBParticleSystem_SimulationSpace.PSS_WORLD,
      shape: ParticleSystem.Shape.Box({ size: Vector3.create(0.1, 0.001, 0.1) }),
      loop: true, prewarm: false
    })
    ParticleSystem.create(this.spray, {
      active: false, maxParticles: 64, rate: 15, lifetime: 0.3, gravity: 0.98,
      billboard: true, initialVelocitySpeed: { start: 1, end: 0 },
      initialSize: { start: 1, end: 1 }, sizeOverTime: { start: 0.5, end: 1.5 },
      colorOverTime: { start: WHITE, end: { ...WHITE, a: 34 / 255 } },
      texture: { src: SPRAY }, spriteSheet: { tilesX: 3, tilesY: 2, framesPerSecond: 24 },
      blendMode: PBParticleSystem_BlendMode.PSB_ADD,
      simulationSpace: PBParticleSystem_SimulationSpace.PSS_WORLD,
      shape: ParticleSystem.Shape.Cone({ angle: 60, radius: 0.4 }), loop: true, prewarm: false
    })
  }

  static preload(): void {
    const entity = engine.addEntity()
    Transform.create(entity)
    AssetLoad.create(entity, { assets: [RIPPLES, SPRAY] })
  }

  update(dt: number, bodyHeight: number, fast: boolean, allowed: boolean, camera?: Vector3, jumpHeight = 0, onSplash?: (landing: boolean) => void): void {
    const position = getWorldPosition(engine, this.root)
    const distance = Math.hypot(position.x - this.last.x, position.z - this.last.z)
    this.last = position
    const wasJumping = this.jumping
    this.jumping = jumpHeight > 0.001
    const teleported = distance > Math.max(4, dt * 20)
    const range = this.near ? 70 : 60
    this.near = allowed && !!camera && Vector3.distanceSquared(camera, position) < range * range
    if (!this.near || teleported) {
      this.splashTime = 0
      this.setVisible(false)
      return
    }
    if (this.jumping !== wasJumping) {
      this.startSplash(position, bodyHeight, !this.jumping)
      onSplash?.(!this.jumping)
    }
    if (this.splashTime > 0) {
      this.splashTime = Math.max(0, this.splashTime - dt)
      if (this.emissionTime > 0 && (this.emissionTime = Math.max(0, this.emissionTime - dt)) === 0) {
        // Stop emitting, but let the small burst fade naturally at its water contact point.
        ParticleSystem.getMutable(this.rings).active = false
        ParticleSystem.getMutable(this.spray).active = false
      }
      if (this.splashTime > 0) return
      this.setVisible(false)
    }
    if (this.jumping) { this.setVisible(false); return }
    const moving = distance / Math.max(dt, 0.001) > 0.12
    const mode = moving ? fast ? 2 : 1 : 0
    const size = Math.min(1.6, Math.max(0.35, bodyHeight * 0.8)) * (mode === 2 ? 0.4 : 1)
    if (mode !== this.mode || Math.abs(size - this.size) > 0.025) this.configure(mode, size)
    this.setVisible(true)
    const forward = Vector3.rotate(Vector3.Forward(), getWorldRotation(engine, this.root))
    // Fish pitch/roll follows the swell; surface ripples remain flat on the sea.
    const rotation = Quaternion.fromEulerDegrees(0, Math.atan2(forward.x, forward.z) * 180 / Math.PI, 0)
    const ring = Transform.getMutable(this.rings)
    ring.position = Vector3.create(position.x - forward.x * bodyHeight * 0.35,
      SEA_Y + 0.12, position.z - forward.z * bodyHeight * 0.35)
    ring.rotation = rotation
    const spray = Transform.getMutable(this.spray)
    spray.position = Vector3.create(position.x - forward.x * bodyHeight * 0.85,
      SEA_Y + 0.14, position.z - forward.z * bodyHeight * 0.85)
    spray.rotation = Quaternion.multiply(rotation, this.fast ? BACK_AND_UP : UP)
  }

  dispose(): void {
    engine.removeEntity(this.rings)
    engine.removeEntity(this.spray)
  }

  // Reuse the two wake emitters: no new systems, meshes, or texture downloads.
  // They stay at the water contact point while the fish travels through the air.
  private startSplash(position: Vector3, bodyHeight: number, landing: boolean): void {
    const size = Math.min(1.8, Math.max(0.95, bodyHeight * 0.95))
    this.mode = -1
    this.splashTime = landing ? 1.25 : 1.05
    this.emissionTime = 0.16
    this.setVisible(true)
    const ringTransform = Transform.getMutable(this.rings)
    ringTransform.position = Vector3.create(position.x, SEA_Y + 0.3, position.z)
    ringTransform.rotation = Quaternion.Identity()
    const sprayTransform = Transform.getMutable(this.spray)
    sprayTransform.position = Vector3.create(position.x, SEA_Y + 0.32, position.z)
    sprayTransform.rotation = UP
    const rings = ParticleSystem.getMutable(this.rings)
    rings.active = true; rings.maxParticles = 4; rings.rate = landing ? 24 : 18
    rings.blendMode = PBParticleSystem_BlendMode.PSB_ALPHA
    rings.lifetime = landing ? 1.05 : 0.85
    rings.initialSize = { start: 0.9 * size, end: 1.2 * size }
    rings.initialVelocitySpeed = { start: 0, end: 0 }
    rings.sizeOverTime = { start: 1, end: landing ? 4.5 : 3.5 }
    rings.colorOverTime = { start: WHITE, end: CLEAR_WHITE }
    rings.shape = ParticleSystem.Shape.Box({ size: Vector3.create(0.3 * size, 0.001, 0.3 * size) })
    const spray = ParticleSystem.getMutable(this.spray)
    spray.active = true; spray.maxParticles = 28; spray.rate = landing ? 160 : 100
    spray.blendMode = PBParticleSystem_BlendMode.PSB_ALPHA
    spray.lifetime = landing ? 1 : 0.8
    spray.gravity = 0.7
    spray.initialSize = { start: 0.8 * size, end: 1.2 * size }
    spray.initialVelocitySpeed = { start: 2.5 * size, end: (landing ? 4.5 : 3.5) * size }
    spray.limitVelocity = undefined
    spray.sizeOverTime = { start: 0.85, end: 1.6 }
    spray.colorOverTime = { start: WHITE, end: CLEAR_WHITE }
    spray.shape = ParticleSystem.Shape.Cone({ angle: 60, radius: (landing ? 0.65 : 0.4) * size })
  }

  private configure(mode: number, size: number): void {
    this.mode = mode; this.size = size; this.fast = mode === 2
    const rings = ParticleSystem.getMutable(this.rings)
    rings.maxParticles = 64
    rings.blendMode = PBParticleSystem_BlendMode.PSB_ADD
    rings.rate = mode === 0 ? 3 : this.fast ? 20 : 40
    rings.lifetime = mode === 0 ? 1.5 : this.fast ? 2 : 0.6
    rings.initialSize = mode === 0 ? { start: 0.5 * size, end: 0.8 * size }
      : this.fast ? { start: 2.5 * size, end: 2 * size } : { start: 1.5 * size, end: 1.8 * size }
    rings.initialVelocitySpeed = { start: 0.3 * size, end: 0 }
    rings.sizeOverTime = this.fast ? { start: 2.5, end: 5 } : { start: 0.5, end: 2 }
    rings.colorOverTime = { start: WHITE, end: this.fast ? { ...WHITE, a: 0 } : CLEAR_WHITE }
    rings.shape = ParticleSystem.Shape.Box({ size: Vector3.create(0.1 * size, 0.001, 0.1 * size) })
    const spray = ParticleSystem.getMutable(this.spray)
    spray.active = this.visible && mode > 0
    spray.maxParticles = 64
    spray.blendMode = PBParticleSystem_BlendMode.PSB_ADD
    spray.rate = this.fast ? 80 : 15
    spray.lifetime = this.fast ? 0.5 : 0.3
    spray.gravity = (this.fast ? 0.4 : 0.98) * size
    spray.initialSize = { start: size, end: size }
    spray.initialVelocitySpeed = this.fast ? { start: 20 * size, end: 10 * size } : { start: size, end: 0 }
    spray.limitVelocity = this.fast ? { speed: 2 * size, dampen: 0.1 } : undefined
    spray.sizeOverTime = this.fast ? { start: 3.5, end: 1.5 } : { start: 0.5, end: 1.5 }
    spray.colorOverTime = this.fast
      ? { start: { ...WHITE, a: 136 / 255 }, end: CLEAR_WHITE }
      : { start: WHITE, end: { ...WHITE, a: 34 / 255 } }
    spray.shape = ParticleSystem.Shape.Cone({ angle: this.fast ? 20 : 60, radius: 0.4 * size })
  }

  private setVisible(visible: boolean): void {
    if (visible === this.visible) return
    this.visible = visible
    const playback = visible ? PBParticleSystem_PlaybackState.PS_PLAYING : PBParticleSystem_PlaybackState.PS_STOPPED
    const rings = ParticleSystem.getMutable(this.rings), spray = ParticleSystem.getMutable(this.spray)
    rings.active = visible; rings.playbackState = playback
    spray.active = visible && this.mode > 0; spray.playbackState = playback
  }
}
