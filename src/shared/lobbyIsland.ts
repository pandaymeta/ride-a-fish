import { segmentCrossesSand } from './sandCollision'
import { islandRadius } from './islandProfile'
// Shared island footprint: scene placement is read once by loadSceneLayout.
export const LOBBY_ISLAND = { x: 96, z: 96, radiusX: 20, radiusZ: 17.5, centerY: 7.25, halfHeight: 2.28, irregular: false, shoreHeight: 0, shoreRadiusX: 20, shoreRadiusZ: 17.5 }
export function insideLobbyIsland(x: number, z: number, margin = 0): boolean {
  const i = LOBBY_ISLAND
  const dx = (x - i.x) / i.shoreRadiusX, dz = (z - i.z) / i.shoreRadiusZ
  const radius = (i.irregular ? islandRadius(Math.atan2(dz, dx)) : 1) + margin / Math.min(i.shoreRadiusX, i.shoreRadiusZ)
  return dx * dx + dz * dz <= radius * radius
}
export function lobbySurfaceY(x: number, z: number): number {
  const i = LOBBY_ISLAND
  const r2 = ((x - i.x) / i.radiusX) ** 2 + ((z - i.z) / i.radiusZ) ** 2
  if (!i.irregular) return i.centerY + i.halfHeight * Math.sqrt(Math.max(0, 1 - r2))
  const angle = Math.atan2((z - i.z) / i.radiusZ, (x - i.x) / i.radiusX)
  const r = Math.sqrt(r2) / islandRadius(angle)
  const slope = Math.min(1, Math.max(0, (r - 0.48) / 0.52)) ** 1.7
  return i.centerY + i.halfHeight + (i.shoreHeight - i.halfHeight) * slope
}
export function constrainOutsideLobbyIsland(point: { x: number; z: number }, margin = 3): void {
  if (!insideLobbyIsland(point.x, point.z, margin)) return
  const i = LOBBY_ISLAND, rx = i.shoreRadiusX, rz = i.shoreRadiusZ
  const dx = (point.x - i.x) / rx, dz = (point.z - i.z) / rz
  const angle = Math.atan2(dz, dx)
  const r = (i.irregular ? islandRadius(angle) : 1) + (margin + 0.1) / Math.min(rx, rz)
  point.x = i.x + Math.cos(angle) * rx * r
  point.z = i.z + Math.sin(angle) * rz * r
}
// A short shoreline waypoint keeps the shark from steering through the safe island.
export function routeAroundLobbyIsland(from: { x: number; z: number }, goal: { x: number; z: number }, preferredTurn = 0, clearance = 3): { x: number; z: number } {
  if (!segmentCrossesSand(from, goal, clearance)) return goal
  const i = LOBBY_ISLAND, rx = i.shoreRadiusX + 6, rz = i.shoreRadiusZ + 6
  const ax = (from.x - i.x) / rx, az = (from.z - i.z) / rz
  const bx = (goal.x - i.x) / rx, bz = (goal.z - i.z) / rz
  const start = Math.atan2(az, ax), end = Math.atan2(bz, bx)
  const turn = Math.atan2(Math.sin(end - start), Math.cos(end - start))
  const angle = start + ((preferredTurn || turn) >= 0 ? 0.5 : -0.5)
  const shore = i.irregular ? islandRadius(angle) : 1
  // Follow the same asymmetric coast used by the rendered island and body collisions.
  // Keeping the radial clearance outside the long end avoids steering into its sand.
  const padding = clearance + 2
  return { x: i.x + Math.cos(angle) * (i.shoreRadiusX * shore + padding),
    z: i.z + Math.sin(angle) * (i.shoreRadiusZ * shore + padding) }
}
