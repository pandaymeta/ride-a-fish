import { engine, getWorldPosition, Transform } from '@dcl/sdk/ecs'
import { SEA_Y } from './config'

export const BOARDING_SPOT_NAMES = ['Dock Boarding 1', 'Dock Boarding 2', 'Dock Boarding 3', 'Dock Boarding 4', 'Dock Boarding 5', 'Dock Boarding 6', 'Dock Boarding 7', 'Dock Boarding 8', 'Dock Boarding 9', 'Dock Boarding 10'] as const
export const BOARDING_RANGE = 5.5
export const BOARDING_CLEARANCE = 2.8
export const BOARDING_TIMEOUT = 10
export const BOARDING_ARROW = 'assets/asset-packs/arrow/arrow.glb'
export interface BoardingSpot { x: number; y: number; z: number; yaw: number }
export const BOARDING_SPOTS: BoardingSpot[] = []

export function loadBoardingSpots(): void {
  BOARDING_SPOTS.length = 0
  for (const name of BOARDING_SPOT_NAMES) {
    const entity = engine.getEntityOrNullByName(name)
    if (entity === null) throw new Error('Missing editor-authored boarding spot: ' + name)
    const p = getWorldPosition(engine, entity), q = Transform.get(entity).rotation
    BOARDING_SPOTS.push({ ...p, yaw: Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z)) })
  }
}

// One eligibility rule for the advertised prompt and authoritative boarding.
export function withinBoardingRange(player: { x: number; y: number; z: number },
  fish: { x: number; z: number }, tolerance = 0): boolean {
  return Math.hypot(player.x - fish.x, player.z - fish.z) <= BOARDING_RANGE + tolerance
    && player.y >= SEA_Y + 0.45 - tolerance && player.y <= SEA_Y + 4 + tolerance
}
