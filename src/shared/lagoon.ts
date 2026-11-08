import { LOBBY_ISLAND } from './lobbyIsland'
import { insideSandCollision, resolveSandCollision } from './sandCollision'
import { islandRadius } from './islandProfile'

export const LAGOON_AREA_MULTIPLIER = 1.5
export const LAGOON_PLAYER_MARGIN = 2.1
export const LAGOON_ISLAND_CLEARANCE = 4.1
export let LAGOON_CENTER_X = 96
export let LAGOON_CENTER_Z = 96
export let LAGOON_CENTER = LAGOON_CENTER_Z
export const LAGOON_SCALE_X = 1
export let LAGOON_RADIUS = 78
export const LAGOON_BOUNDS = { minX: 18, maxX: 174, minZ: 18, maxZ: 174 }
export const LAGOON_AREA = { before: 0, after: 0 }

// Resize usable water, excluding the safe island and the same rider clearances.
// The previous oval's radial lobes have an analytic mean-square radius.
export function configureLagoonFromIsland(): void {
  const island = LOBBY_ISLAND
  let sum = 0
  for (let n = 0; n < 256; n++) {
    const r = (island.irregular ? islandRadius(n * Math.PI * 2 / 256) : 1)
      + LAGOON_ISLAND_CLEARANCE / Math.min(island.shoreRadiusX, island.shoreRadiusZ)
    sum += r * r
  }
  const blocked = Math.PI * island.shoreRadiusX * island.shoreRadiusZ * sum / 256
  const oldOuter = Math.PI * 1.2 * ((60.5 - LAGOON_PLAYER_MARGIN) ** 2 + 1.3)
  LAGOON_AREA.before = Math.max(1, oldOuter - blocked)
  LAGOON_AREA.after = LAGOON_AREA.before * LAGOON_AREA_MULTIPLIER
  LAGOON_RADIUS = Math.sqrt((LAGOON_AREA.after + blocked) / Math.PI) + LAGOON_PLAYER_MARGIN
  LAGOON_CENTER_X = island.x; LAGOON_CENTER_Z = island.z; LAGOON_CENTER = island.z
  Object.assign(LAGOON_BOUNDS, { minX: island.x - LAGOON_RADIUS, maxX: island.x + LAGOON_RADIUS,
    minZ: island.z - LAGOON_RADIUS, maxZ: island.z + LAGOON_RADIUS })
}

export function lagoonRadius(_angle: number): number { return LAGOON_RADIUS }

export function setLagoonRadius(radius: number): void {
  LAGOON_RADIUS = radius
  Object.assign(LAGOON_BOUNDS, { minX: LAGOON_CENTER_X - radius, maxX: LAGOON_CENTER_X + radius,
    minZ: LAGOON_CENTER_Z - radius, maxZ: LAGOON_CENTER_Z + radius })
}

export function insideLagoon(x: number, z: number, margin = 0): boolean {
  if (insideSandCollision(x, z, margin)) return false
  const dx = x - LAGOON_CENTER_X, dz = z - LAGOON_CENTER_Z
  return dx * dx + dz * dz <= (LAGOON_RADIUS - margin) ** 2
}

export function constrainToLagoon(point: { x: number; z: number }, margin = LAGOON_PLAYER_MARGIN, islandClearance = 3, outerRadius = LAGOON_RADIUS): void {
  resolveSandCollision(point, Math.max(islandClearance, margin))
  const dx = point.x - LAGOON_CENTER_X, dz = point.z - LAGOON_CENTER_Z
  const squared = dx * dx + dz * dz, radius = Math.max(0, Math.min(LAGOON_RADIUS, outerRadius) - margin)
  if (squared <= radius * radius) return
  const scale = radius / Math.sqrt(squared)
  point.x = LAGOON_CENTER_X + dx * scale
  point.z = LAGOON_CENTER_Z + dz * scale
}

// Swept movement uses body-sized contact rather than the old fixed island exclusion zone.
export function moveFishInLagoon(point: { x: number; z: number }, dx: number, dz: number, bodyRadius: number, outerRadius = LAGOON_RADIUS): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.25))
  for (let n = 0; n < steps; n++) {
    point.x += dx / steps; point.z += dz / steps
    constrainToLagoon(point, bodyRadius, bodyRadius, outerRadius)
  }
}
