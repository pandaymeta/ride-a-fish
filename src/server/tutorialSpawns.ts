import { BOARDING_SPOTS } from '../shared/boarding'
import { insideLagoon } from '../shared/lagoon'
import { LOBBY_ISLAND } from '../shared/lobbyIsland'
import { SpawnBlocker, SpawnPoint, SEA_EDGE_MARGIN } from './respawnPoints'

// Reserve a few existing pickups for an approachable first swim, shared by all players.
// Bounded sampling happens only at spawn/respawn, never in the frame update.
export function chooseDockSeaPoint(blockers: readonly SpawnBlocker[], minDistance = 6, maxDistance = 23,
  allowed?: (point: SpawnPoint) => boolean): SpawnPoint | undefined {
  const dock = BOARDING_SPOTS[0]
  if (!dock) return
  const heading = Math.atan2(dock.x - LOBBY_ISLAND.x, dock.z - LOBBY_ISLAND.z)
  let best: SpawnPoint | undefined, bestGap = -1
  for (let n = 0; n < 96; n++) {
    const angle = heading + (Math.random() - .5) * Math.PI * .95
    const radius = minDistance + Math.random() * (maxDistance - minDistance)
    const point = { x: dock.x + Math.sin(angle) * radius, z: dock.z + Math.cos(angle) * radius }
    if (!insideLagoon(point.x, point.z, SEA_EDGE_MARGIN) || (allowed && !allowed(point))) continue
    let gap = Infinity
    for (const b of blockers) {
      gap = Math.min(gap, ((point.x - b.x) ** 2 + (point.z - b.z) ** 2) / (b.clearance * b.clearance))
      if (gap < 1) break
    }
    if (gap >= 1 && gap > bestGap) { bestGap = gap; best = point }
  }
  return best
}
