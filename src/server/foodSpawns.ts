import { chooseDockSeaPoint } from './tutorialSpawns'
import { foodOutsideDock } from './foodClearance'
import { ENTRY_POINTS, SEA } from '../shared/config'
import { NpcAnchor } from '../shared/npcs'
import { insideLagoon } from '../shared/lagoon'
import { FOOD_SPACING, randomSeaPoint, SEA_EDGE_MARGIN, SpawnPoint } from './respawnPoints'


// Best-candidate sampling fills open areas without creating rows or tight clusters.
export function createFoodSpawns(count: number, anchors: readonly NpcAnchor[]): SpawnPoint[] {
  const points: SpawnPoint[] = []
  const valid = (p: SpawnPoint): boolean =>
    insideLagoon(p.x, p.z, SEA_EDGE_MARGIN) && foodOutsideDock(p) &&
    p.x >= SEA.minX + SEA_EDGE_MARGIN && p.x <= SEA.maxX - SEA_EDGE_MARGIN &&
    p.z >= SEA.minZ + SEA_EDGE_MARGIN && p.z <= SEA.maxZ - SEA_EDGE_MARGIN &&
    ENTRY_POINTS.every(entry => Math.hypot(entry.x - p.x, entry.z - p.z) >= 4) &&
    anchors.every(fish => Math.hypot(fish.x - p.x, fish.z - p.z) >= 3) &&
    points.every(food => Math.hypot(food.x - p.x, food.z - p.z) >= FOOD_SPACING)

  // Two of the existing foods support growth from 1 to 3 before the first Blue Tang.
  for (let n = 0; n < 2 && points.length < count; n++) {
    const blockers = [...anchors.map(f => ({ ...f, clearance: 3 })),
      ...points.map(p => ({ ...p, clearance: FOOD_SPACING }))]
    const point = chooseDockSeaPoint(blockers, n === 0 ? 14 : 22, n === 0 ? 22 : 32, foodOutsideDock)
    if (point && valid(point)) points.push(point)
  }
  // One off-centre starter food per entry, rather than a straight trail.
  for (const entry of ENTRY_POINTS) {
    if (points.length >= count) break
    const forward = entry.z > (SEA.minZ + SEA.maxZ) / 2 ? -1 : 1
    for (let attempt = 0; attempt < 64; attempt++) {
      const angle = (Math.random() - 0.5) * Math.PI * 0.85
      const distance = 5 + Math.random() * 2
      const point = { x: entry.x + Math.sin(angle) * distance,
        z: entry.z + forward * Math.cos(angle) * distance }
      if (valid(point)) { points.push(point); break }
    }
  }
  while (points.length < count) {
    let best: SpawnPoint | undefined
    let clearance = -1
    for (let sample = 0; sample < 128; sample++) {
      const point = randomSeaPoint()
      if (!valid(point)) continue
      const gap = points.length ? Math.min(...points.map(food => Math.hypot(food.x - point.x, food.z - point.z))) : Infinity
      if (gap > clearance) { best = point; clearance = gap }
    }
    if (!best) throw new Error('The requested food count cannot fit with the current minimum spacing.')
    points.push(best)
  }
  return points
}
