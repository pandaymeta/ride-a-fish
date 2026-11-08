import { LAGOON_CENTER_X, LAGOON_CENTER_Z, LAGOON_SCALE_X, lagoonRadius, insideLagoon } from '../shared/lagoon'
import { distanceSquared } from '../shared/eating'
import { stockedOceanRadius } from '../shared/oceanAreas'
import { OCEAN_AREAS } from '../shared/oceanAreas'

export interface SpawnPoint { x: number; z: number }
export interface SpawnBlocker extends SpawnPoint { clearance: number }
export const FOOD_SPACING = 8
export const SEA_EDGE_MARGIN = 4

export function randomSeaPoint(outerRadius = stockedOceanRadius(), innerRadius = 0): SpawnPoint {
  for (let attempt = 0; attempt < 64; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const min = innerRadius > 0 ? innerRadius + SEA_EDGE_MARGIN : 0
    const max = Math.min(lagoonRadius(angle), outerRadius) - SEA_EDGE_MARGIN
    const radius = Math.sqrt(min * min + Math.random() * (max * max - min * min))
    const point = { x: LAGOON_CENTER_X + Math.cos(angle) * radius * LAGOON_SCALE_X,
      z: LAGOON_CENTER_Z + Math.sin(angle) * radius }
    if (insideLagoon(point.x, point.z, SEA_EDGE_MARGIN)) return point
  }
  return { x: LAGOON_CENTER_X, z: LAGOON_CENTER_Z - 40 }
}

// Bounded sampling runs only on respawn and prefers open space over crowded patches.
export function chooseRespawnPoint(blockers: readonly SpawnBlocker[],
  allowed?: (point: SpawnPoint) => boolean, outerRadius = stockedOceanRadius(), innerRadius = 0): SpawnPoint | undefined {
  let best: SpawnPoint | undefined
  let bestClearance = -1
  for (let sample = 0; sample < 64; sample++) {
    const point = randomSeaPoint(outerRadius, innerRadius)
    if (!insideLagoon(point.x, point.z, SEA_EDGE_MARGIN)) continue
    if (allowed && !allowed(point)) continue
    let clearance = Infinity
    for (const blocker of blockers) {
      const gap = distanceSquared(point.x, point.z, blocker.x, blocker.z) / (blocker.clearance * blocker.clearance)
      if (gap < 1) { clearance = -1; break }
      clearance = Math.min(clearance, gap)
    }
    if (clearance > bestClearance) { best = point; bestClearance = clearance }
  }
  return best
}

export function chooseAreaRespawnPoint(area: number, blockers: readonly SpawnBlocker[],
  allowed?: (point: SpawnPoint) => boolean): SpawnPoint | undefined {
  return chooseRespawnPoint(blockers, allowed, OCEAN_AREAS[area].outerRadius,
    area > 0 ? OCEAN_AREAS[area - 1].outerRadius : 0)
}
