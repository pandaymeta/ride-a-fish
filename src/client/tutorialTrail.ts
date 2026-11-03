import { engine, Entity, Material, MaterialTransparencyMode, MeshRenderer, TextureWrapMode, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { SEA_Y } from '../shared/config'
import type { TutorialPoint } from '../shared/tutorialTargets'

const TILE = 'assets/Images/ui/rean/tutorial-arrow-rounded-proportional.png'
const MAX_SEGMENTS = 8
const WIDTH = 0.85
// Square UV tiles cover equal world distances, keeping arrow proportions intact.
const SPACING = WIDTH
const FLOW_SPEED = 1
// A bounded pool of camera-facing ribbons: no particles, physics, or network replication.
// The white repeating arrows scroll toward the goal like the Roblox tutorial Beam.
export class TutorialTrail {
  private readonly ribbons: Entity[] = []
  private readonly endpoints: { x: number; y: number; z: number }[] = []
  private phase = 0
  private visible = 0

  update(dt: number, source: Vector3 | undefined, points: readonly TutorialPoint[]): void {
    if (!source || !points.length) { this.hide(); return }
    this.phase = (this.phase + dt * FLOW_SPEED / SPACING) % 1
    const camera = Transform.getOrNull(engine.CameraEntity)?.position
    if (!camera) { this.hide(); return }
    // Move with the rendered fish and camera every frame, independently of the slow target search.
    const smoothing = 1 - Math.exp(-18 * Math.min(dt, .1))
    let start = Vector3.create(source.x, SEA_Y + 0.22, source.z), remaining = 0, count = 0
    const segments = Math.min(points.length, MAX_SEGMENTS)
    for (let i = 0; i < segments; i++) {
      const point = points[i]
      const end = this.endpoints[i] ?? (this.endpoints[i] = Vector3.create(point.x, start.y, point.z))
      end.x += (point.x - end.x) * smoothing; end.z += (point.z - end.z) * smoothing
      remaining += Vector3.distance(i === 0 ? start : this.endpoints[i - 1], end)
    }
    for (let i = 0; i < segments; i++) {
      const end = this.endpoints[i]
      const delta = Vector3.subtract(end, start), length = Vector3.length(delta)
      if (length > 0.2) {
        const entity = this.ribbon(count++)
        const direction = Vector3.scale(delta, 1 / length), center = Vector3.scale(Vector3.add(start, end), .5)
        const toCamera = Vector3.subtract(camera, center)
        let side = Vector3.cross(direction, toCamera)
        if (Vector3.lengthSquared(side) < .001) side = Vector3.create(1, 0, 0)
        side = Vector3.normalize(side)
        const normal = Vector3.normalize(Vector3.cross(side, direction))
        const t = Transform.getMutable(entity)
        t.position = center; t.rotation = Quaternion.lookRotation(Vector3.scale(normal, -1), direction)
        t.scale = Vector3.create(WIDTH, length, 1)
        // Anchor UVs at the goal so movement and route corners cannot restart the arrow pattern.
        const a = -this.phase - remaining / SPACING, b = a + length / SPACING
        // Reuse the plane's UV storage instead of allocating meshes or materials per frame.
        const uvs = MeshRenderer.getMutable(entity).mesh
        if (uvs?.$case === 'plane') {
          const v = uvs.plane.uvs
          v[0] = 0; v[1] = a; v[2] = 0; v[3] = b; v[4] = 1; v[5] = b; v[6] = 1; v[7] = a
          v[8] = 0; v[9] = a; v[10] = 0; v[11] = b; v[12] = 1; v[13] = b; v[14] = 1; v[15] = a
        }
        VisibilityComponent.getMutable(entity).visible = true
      }
      remaining -= length
      start = end
    }
    for (let n = count; n < this.visible; n++) VisibilityComponent.getMutable(this.ribbons[n]).visible = false
    this.visible = count
  }

  resetPath(): void { this.endpoints.length = 0 }

  hide(): void {
    for (let n = 0; n < this.visible; n++) VisibilityComponent.getMutable(this.ribbons[n]).visible = false
    this.visible = 0
    this.resetPath()
  }

  private ribbon(index: number): Entity {
    if (this.ribbons[index] !== undefined) return this.ribbons[index]
    const e = engine.addEntity()
    Transform.create(e)
    MeshRenderer.setPlane(e, new Array(16).fill(0))
    Material.setPbrMaterial(e, { texture: Material.Texture.Common({ src: TILE, wrapMode: TextureWrapMode.TWM_REPEAT }),
      albedoColor: { r: 1, g: 1, b: 1, a: 1 }, alphaTest: .5,
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST, castShadows: false,
      emissiveTexture: Material.Texture.Common({ src: TILE, wrapMode: TextureWrapMode.TWM_REPEAT }),
      emissiveColor: { r: 1, g: 1, b: 1 }, emissiveIntensity: 1,
      metallic: 0, roughness: 1, specularIntensity: 0 })
    VisibilityComponent.create(e, { visible: false })
    this.ribbons.push(e)
    return e
  }
}
