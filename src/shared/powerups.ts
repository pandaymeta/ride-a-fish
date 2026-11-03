import { eatRadius } from './config'

export const SHIELD_POWERUP = 0
export const SPEED_POWERUP = 1
export const SHIELD_DURATION = 30
export const BOOST_DURATION = 20
export const BOOST_MAX_MULTIPLIER = 50 / 30
export const POWERUP_RESPAWN_SECONDS = 10
export const POWERUP_COUNT_PER_KIND = 2
export const POWERUP_MODELS = ['assets/Models/shield-powerup.glb', 'assets/Models/speed-powerup.glb']
export const POWERUP_ICONS = ['assets/Images/shield-model-icon.png', 'assets/Images/speed-model-icon.png']

export interface PowerupState { id: number; kind: number; x: number; z: number }
export interface PowerupGrant {
  eventId: string; eater: number; tick: number; target: number; kind: number
  powerShield: number; boost: number
}
export function powerupEatRadius(mass: number): number { return eatRadius(mass) + 0.65 }
