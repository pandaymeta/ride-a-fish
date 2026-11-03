import { LAGOON_CENTER_X, LAGOON_CENTER_Z, LAGOON_SCALE_X, lagoonRadius, insideLagoon } from '../shared/lagoon'
import { distanceSquared } from '../shared/eating'

export interface SpawnPoint { x: number; z: number }
export interface SpawnBlocker extends SpawnPoint { clearance: number }
export const FOOD_SPACING = 8
export const SEA_EDGE_MARGIN = 4

export function randomSeaPoint(): SpawnPoint {
  for (let attempt = 0; attempt < 64; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * (lagoonRadius(angle) - SEA_EDGE_MARGIN)
    const point = { x: LAGOON_CENTER_X + Math.cos(angle) * radius * LAGOON_SCALE_X,
      z: LAGOON_CENTER_Z + Math.sin(angle) * radius }
    if (insideLagoon(point.x, point.z, SEA_EDGE_MARGIN)) return point
  }
  return { x: LAGOON_CENTER_X, z: LAGOON_CENTER_Z - 40 }
}

// Bounded sampling runs only on respawn and prefers open space over crowded patches.
export function chooseRespawnPoint(blockers: readonly SpawnBlocker[],
  allowed?: (point: SpawnPoint) => boolean): SpawnPoint | undefined {
  let best: SpawnPoint | undefined
  let bestClearance = -1
  for (let sample = 0; sample < 64; sample++) {
    const point = randomSeaPoint()
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
