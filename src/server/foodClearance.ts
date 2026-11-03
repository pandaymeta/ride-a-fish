import { BOARDING_SPOTS } from '../shared/boarding'
import { SEA_Y } from '../shared/config'
import { nearestDockLanding } from '../shared/dockSurfaces'
import type { SpawnPoint } from './respawnPoints'

export const FOOD_DOCK_CLEARANCE = 10

// Read the authored dock footprint and berths; only checked when food is placed.
export function foodOutsideDock(point: SpawnPoint): boolean {
  const radiusSquared = FOOD_DOCK_CLEARANCE * FOOD_DOCK_CLEARANCE
  for (const spot of BOARDING_SPOTS) {
    if ((point.x - spot.x) ** 2 + (point.z - spot.z) ** 2 < radiusSquared) return false
  }
  return nearestDockLanding({ x: point.x, y: SEA_Y, z: point.z }, FOOD_DOCK_CLEARANCE) === undefined
}
