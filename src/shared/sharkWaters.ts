import { constrainToLagoon, LAGOON_CENTER_X, LAGOON_CENTER_Z, LAGOON_RADIUS } from './lagoon'
import { OCEAN_AREAS } from './oceanAreas'
import { SHARK_RULES } from './shark'

// Keep the predator in Common + Uncommon even when later areas gain fish.
export function sharkRoamRadius(): number {
  return Math.min(LAGOON_RADIUS, OCEAN_AREAS[1].outerRadius)
}

export function withinSharkBoundary(point: { x: number; z: number }, margin = 0): boolean {
  const radius = Math.max(0, sharkRoamRadius() - margin)
  const dx = point.x - LAGOON_CENTER_X, dz = point.z - LAGOON_CENTER_Z
  return dx * dx + dz * dz <= radius * radius
}

export function constrainSharkToWater(point: { x: number; z: number }, margin = SHARK_RULES.edgeMargin): void {
  constrainToLagoon(point, margin, Math.max(3, margin), sharkRoamRadius())
}
