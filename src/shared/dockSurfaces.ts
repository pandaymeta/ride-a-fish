import { ColliderLayer, engine, getWorldPosition, getWorldRotation, GltfContainer, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARDING_SPOTS } from './boarding'
import { SEA_Y } from './config'

export interface DockLanding { x: number; y: number; z: number }
interface DockSurface { center: Vector3; rotation: Quaternion; halfX: number; halfZ: number }
export const DOCK_RANGE = 4.5
const surfaces: DockSurface[] = []

// Deck tops in model-local meters, matching the invisible collision meshes.
const DECKS: Record<string, { x: number; y: number; halfX: number; halfZ: number }> = {
  'Wooden_Bridge_01A_Module_1.glb': { x: 1.005, y: 0.04, halfX: 1.01, halfZ: 1 },
  'Wooden_Bridge_01A_Module_2-walkable.glb': { x: 0, y: 0.05, halfX: 2.01, halfZ: 1 },
  'wooden_plank_walkable.glb': { x: -0.00064, y: 0.2809, halfX: 0.352, halfZ: 1.528 }
}

export function loadDockSurfaces(): void {
  surfaces.length = 0
  for (const [entity, gltf] of engine.getEntitiesWith(GltfContainer, Transform)) {
    const deck = DECKS[gltf.src.slice(gltf.src.lastIndexOf('/') + 1)]
    if (!deck || !(((gltf.invisibleMeshesCollisionMask ?? 0) | (gltf.visibleMeshesCollisionMask ?? 0)) & ColliderLayer.CL_PHYSICS)) continue
    const scale = { ...Transform.get(entity).scale }
    let parent = Transform.get(entity).parent
    while (parent && parent !== engine.RootEntity) {
      const t = Transform.getOrNull(parent)
      if (!t) break
      scale.x *= t.scale.x; scale.y *= t.scale.y; scale.z *= t.scale.z
      parent = t.parent
    }
    const rotation = getWorldRotation(engine, entity)
    const offset = Vector3.rotate(Vector3.create(deck.x * scale.x, deck.y * scale.y, 0), rotation)
    const center = Vector3.add(getWorldPosition(engine, entity), offset)
    if (center.y < SEA_Y + 0.3 || center.y > SEA_Y + 4) continue
    const surface = { center, rotation, halfX: Math.abs(scale.x) * deck.halfX, halfZ: Math.abs(scale.z) * deck.halfZ }
    if (BOARDING_SPOTS.some(spot => distanceOnWater(spot, pointOnDeck(surface, spot, 0, 0)) < 8 ** 2)) surfaces.push(surface)
  }
  // An empty dock can occur while replacing models in Creator Hub.
  console.log('[DOCK] Walkable deck surfaces:', surfaces.length)
}

function pointOnDeck(surface: DockSurface, position: DockLanding, inset: number, lift: number): DockLanding {
  const q = surface.rotation
  const local = Vector3.rotate(Vector3.subtract(position, surface.center), { x: -q.x, y: -q.y, z: -q.z, w: q.w })
  const maxX = Math.max(0, surface.halfX - inset)
  const maxZ = Math.max(0, surface.halfZ - inset)
  const x = Math.max(-maxX, Math.min(maxX, local.x))
  const z = Math.max(-maxZ, Math.min(maxZ, local.z))
  return Vector3.add(surface.center, Vector3.rotate(Vector3.create(x, lift, z), q))
}

function distanceOnWater(a: DockLanding, b: DockLanding): number {
  return (a.x - b.x) ** 2 + (a.z - b.z) ** 2
}

export function nearestDockLanding(position: DockLanding, range = DOCK_RANGE): DockLanding | undefined {
  let best: DockLanding | undefined, distance = range * range
  for (const surface of surfaces) {
    const point = pointOnDeck(surface, position, 0.22, 0.08)
    const d = distanceOnWater(point, position)
    if (d <= distance) { best = point; distance = d }
  }
  return best
}
