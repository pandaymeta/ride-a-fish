import { engine, getWorldPosition, getWorldRotation, GltfContainer, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARDING_SPOTS } from './boarding'
import { SEA_Y } from './config'

export interface DockLanding { x: number; y: number; z: number }
interface DockSurface { center: Vector3; rotation: Quaternion; halfX: number; halfZ: number }
export const DOCK_RANGE = 4.5
const surfaces: DockSurface[] = []

// Read the actual walkable plank collision bounds once, including its GLB node transform.
// The editor remains the source of truth for every plank and berth placement.
export function loadDockSurfaces(): void {
  surfaces.length = 0
  for (const [entity, gltf] of engine.getEntitiesWith(GltfContainer, Transform)) {
    if (!gltf.src.endsWith('/wooden_plank_walkable.glb')) continue
    const position = getWorldPosition(engine, entity)
    if (!BOARDING_SPOTS.some(spot => Math.hypot(spot.x - position.x, spot.z - position.z) < 8)) continue
    const scale = { ...Transform.get(entity).scale }
    let parent = Transform.get(entity).parent
    while (parent && parent !== engine.RootEntity) {
      const t = Transform.getOrNull(parent)
      if (!t) break
      scale.x *= t.scale.x; scale.y *= t.scale.y; scale.z *= t.scale.z
      parent = t.parent
    }
    const rotation = getWorldRotation(engine, entity)
    const top = Vector3.rotate(Vector3.create(-0.00064 * scale.x, 0.2809 * scale.y, -0.00001 * scale.z), rotation)
    const center = Vector3.add(position, top)
    if (center.y < SEA_Y + 0.3 || center.y > SEA_Y + 4) continue
    surfaces.push({ center, rotation, halfX: Math.abs(scale.x) * 0.352,
      halfZ: Math.abs(scale.z) * 1.528 })
  }
  if (!surfaces.length) throw new Error('No walkable dock planks found near the boarding slots.')
  console.log('[DOCK] Walkable plank surfaces:', surfaces.length)
}

export function nearestDockLanding(position: DockLanding, range = DOCK_RANGE): DockLanding | undefined {
  let best: DockLanding | undefined, distance = range * range
  for (const surface of surfaces) {
    const q = surface.rotation
    const local = Vector3.rotate(Vector3.subtract(position, surface.center), { x: -q.x, y: -q.y, z: -q.z, w: q.w })
    const x = Math.max(-surface.halfX + 0.22, Math.min(surface.halfX - 0.22, local.x))
    const z = Math.max(-surface.halfZ + 0.22, Math.min(surface.halfZ - 0.22, local.z))
    const point = Vector3.add(surface.center, Vector3.rotate(Vector3.create(x, 0.08, z), q))
    const d = (point.x - position.x) ** 2 + (point.z - position.z) ** 2
    if (d <= distance) { best = point; distance = d }
  }
  return best
}
