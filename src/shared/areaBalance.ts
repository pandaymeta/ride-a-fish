import { LAGOON_CENTER_X, LAGOON_CENTER_Z } from './lagoon'
import { oceanAreaIndex } from './oceanAreas'

export const AREA_FOOD_COUNTS = [20, 30] as const
export const AREA_FOOD_GROWTH = [1, 5] as const
const NPC_GROWTH = [[2, 6, 18], [10, 25, 75]] as const

export function areaAtPoint(point: { x: number; z: number }): number {
  return oceanAreaIndex(Math.hypot(point.x - LAGOON_CENTER_X, point.z - LAGOON_CENTER_Z))
}

export function foodGrowthAt(point: { x: number; z: number }): number {
  return AREA_FOOD_GROWTH[areaAtPoint(point) as 0 | 1] ?? 1
}

export function npcGrowthMass(species: number, point: { x: number; z: number }, fallback: number): number {
  const area = areaAtPoint(point)
  return area < NPC_GROWTH.length ? NPC_GROWTH[area][species as 0 | 1 | 2] ?? fallback : fallback
}

export function npcRespawnSeconds(species: number, area: number): number {
  if (species === 2) return area === 0 ? 45 : 20
  if (species === 1) return area === 0 ? 12 : 10
  return 8
}
