import { AssetLoad, ColliderLayer, engine, Entity, Material, MaterialTransparencyMode, MeshRenderer,
  RaycastQueryType, raycastSystem, TextureWrapMode, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { SEA_Y } from '../shared/config'

const TEXTURE = 'assets/Images/sand-footprint.png'
const LIMIT = 40
const LIFETIME = 7
const FADE_TIME = 2.5
const STEP_DISTANCE = 0.62
const STEP_INTERVAL = 0.15
interface Mark { entity: Entity; remaining: number; opacity: number }

// Client-only, bounded decals. One short ground query per step; none while standing or riding.
export class SandFootprints {
  private readonly probe = engine.addEntity()
  private readonly sand = new Set<Entity>()
  private readonly marks: Mark[] = []
  private previous: Vector3 | undefined
  private walked = 0
  private next = 0
  private side = -1
  private sampleClock = 0
  private fadeClock = 0
  private stepClock = STEP_INTERVAL
  private pending = false
  private request = 0
  private requestAge = 0

  constructor(private canWalk: () => boolean) {
    Transform.create(this.probe)
    AssetLoad.create(this.probe, { assets: [TEXTURE] })
    for (const name of ['Sand Dune', 'Sand Dune_2']) {
      const entity = engine.getEntityOrNullByName(name)
      if (entity !== null) this.sand.add(entity)
    }
    engine.addSystem(dt => this.update(dt), undefined, 'sand-footprints')
  }

  private update(dt: number): void {
    this.fadeClock += dt
    this.sampleClock += dt
    this.stepClock += dt
    if (this.fadeClock >= 0.1) {
      this.fade(this.fadeClock)
      this.fadeClock = 0
    }
    if (this.pending) {
      this.requestAge += dt
      if (this.requestAge > 0.5) {
        raycastSystem.removeRaycasterEntity(this.probe)
        this.request++; this.pending = false
      }
    }
    if (this.sampleClock < 0.05) return
    this.sampleClock = 0
    const player = Transform.getOrNull(engine.PlayerEntity)
    if (!player || !this.canWalk()) {
      this.previous = undefined; this.walked = 0
      return
    }
    const p = player.position
    if (!this.previous) { this.previous = { ...p }; return }
    const dx = p.x - this.previous.x, dz = p.z - this.previous.z
    const distance = Math.hypot(dx, dz)
    const rise = p.y - this.previous.y
    this.previous = { ...p }
    // Ignore teleports, boarding slides and the airborne part of a jump.
    if (distance > 2 || Math.abs(rise) > 0.16) { this.walked = 0; return }
    if (distance < 0.008) return
    this.walked += distance
    if (this.walked < STEP_DISTANCE || this.stepClock < STEP_INTERVAL || this.pending) return
    this.walked = 0; this.stepClock = 0
    const forward = Vector3.create(dx / distance, 0, dz / distance)
    const right = Vector3.create(forward.z, 0, -forward.x)
    const side = this.side
    const foot = { x: p.x + right.x * side * 0.115 - forward.x * 0.05,
      y: p.y, z: p.z + right.z * side * 0.115 - forward.z * 0.05 }
    Transform.getMutable(this.probe).position = { x: foot.x, y: foot.y + 0.35, z: foot.z }
    const request = ++this.request
    this.pending = true; this.requestAge = 0
    raycastSystem.registerGlobalDirectionRaycast({ entity: this.probe, opts: {
      direction: Vector3.create(0, -1, 0), maxDistance: 0.85,
      queryType: RaycastQueryType.RQT_QUERY_ALL, collisionMask: ColliderLayer.CL_PHYSICS
    } }, result => {
      if (request !== this.request) return
      this.pending = false
      if (!this.canWalk()) return
      // Use the nearest hit of ANY surface: grass and dock colliders must hide sand beneath.
      let hit = result.hits[0]
      for (const candidate of result.hits) if (!hit || candidate.length < hit.length) hit = candidate
      if (!hit?.position || !hit.normalHit || hit.entityId === undefined
        || !this.sand.has(hit.entityId as Entity) || hit.normalHit.y < 0.65
        || hit.position.y < SEA_Y + 0.03 || Math.abs(foot.y - hit.position.y) > 0.24) return
      this.stamp(hit.position, hit.normalHit, forward, side)
      this.side = -side
    })
  }

  private stamp(position: Vector3, normal: Vector3, direction: Vector3, side: number): void {
    let mark = this.marks[this.next]
    if (!mark) {
      const entity = engine.addEntity()
      Transform.create(entity)
      MeshRenderer.setPlane(entity)
      Material.setPbrMaterial(entity, {
        texture: Material.Texture.Common({ src: TEXTURE, wrapMode: TextureWrapMode.TWM_CLAMP,
          tiling: { x: -side, y: 1 }, offset: { x: side > 0 ? 1 : 0, y: 0 } }),
        albedoColor: { r: 0.38, g: 0.25, b: 0.12, a: 0.62 },
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
        metallic: 0, roughness: 1, specularIntensity: 0, castShadows: false
      })
      VisibilityComponent.create(entity, { visible: false })
      mark = { entity, remaining: 0, opacity: 0 }
      this.marks.push(mark)
    }
    this.next = (this.next + 1) % LIMIT
    const n = Vector3.normalize(normal)
    const forward = Vector3.normalize(Vector3.subtract(direction, Vector3.scale(n, Vector3.dot(direction, n))))
    const right = Vector3.normalize(Vector3.cross(n, forward))
    const toeOut = 0.07 * side
    const toeDirection = Vector3.add(Vector3.scale(forward, Math.cos(toeOut)), Vector3.scale(right, Math.sin(toeOut)))
    const transform = Transform.getMutable(mark.entity)
    transform.position = Vector3.add(position, Vector3.scale(n, 0.012))
    transform.rotation = Quaternion.lookRotation(Vector3.scale(n, -1), toeDirection)
    transform.scale = Vector3.create(0.22, 0.4, 1)
    VisibilityComponent.getMutable(mark.entity).visible = true
    mark.remaining = LIFETIME
    this.setOpacity(mark, 0.62)
  }

  private fade(dt: number): void {
    for (const mark of this.marks) {
      if (mark.remaining <= 0) continue
      mark.remaining = Math.max(0, mark.remaining - dt)
      if (mark.remaining === 0) {
        VisibilityComponent.getMutable(mark.entity).visible = false
        continue
      }
      const alpha = Math.round(0.62 * Math.min(1, mark.remaining / FADE_TIME) * 24) / 24
      this.setOpacity(mark, alpha)
    }
  }

  private setOpacity(mark: Mark, alpha: number): void {
    if (alpha === mark.opacity) return
    mark.opacity = alpha
    const material = Material.getMutable(mark.entity).material
    if (material?.$case === 'pbr' && material.pbr.albedoColor) material.pbr.albedoColor.a = alpha
  }
}
