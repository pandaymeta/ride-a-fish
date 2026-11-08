import { LAGOON_BOUNDS } from './lagoon'
import { FISH_JUMP_HEIGHT } from './fishJump'
import { FISH_MODELS } from './fishAssets'
import { insideLobbyIsland, lobbySurfaceY } from './lobbyIsland'
import { SHARK_RULES } from './shark'
import { AREA_FOOD_COUNTS } from './areaBalance'

export const WORLD_NAME = 'entenium.dcl.eth'
export const MAX_RIDERS = 10
export const SPEED = 5
export const ENTRY_SHIELD = 10
export const FOOD_COUNT = AREA_FOOD_COUNTS.reduce((sum, count) => sum + count, 0)
// Visible waterline; bodies sit a quarter of their height below this surface.
export const SEA_Y = 7.05
export const OCEAN_FLOOR_Y = 0.35
export const STAGE = { minX: 71, maxX: 121, minZ: 74.125, maxZ: 117.875, top: 10.1 }
export const ARENA_MAX_PLAYER_Y = SEA_Y + 3.5 + FISH_JUMP_HEIGHT

export function setStageHeight(top: number): void {
  STAGE.top = top
}
export const LOBBY = { x: 96, y: STAGE.top + 0.15, z: 101.5 }
export const LOBBY_LOOK_AT = { x: 96, y: SEA_Y, z: 80 }
export const SEA = LAGOON_BOUNDS
export const ENTRY_POINTS = [
  { x: 57.6, z: 128 }, { x: 134.4, z: 128 }, { x: 57.6, z: 48 }, { x: 134.4, z: 48 }
]

export const PLAYER_SKINS = [
  { id: 'clownfish', name: 'Clownfish', ...FISH_MODELS.clownfish }
] as const

// Keep collection indices stable so existing saved discoveries remain valid.
export const SPECIES = [
  { id: 'lime-fish', name: 'Blue Tang', rarity: 'Common', mass: 2, population: 19,
    ...FISH_MODELS.common, hint: 'Reach size 3 to collect a Blue Tang.' },
  { id: 'pufferfish', name: 'Reef Angelfish', rarity: 'Uncommon', mass: 6, population: 17,
    ...FISH_MODELS.uncommon, hint: 'A few visit Common waters. Find more in Uncommon at size 100.' },
  { id: 'bigeye-tuna', name: 'Red Reef Fish', rarity: 'Rare', mass: 18, population: 4,
    ...FISH_MODELS.rare, hint: 'An occasional Common visitor. More appear in Uncommon waters.' },
  { id: 'potato-grouper', name: 'Coming Soon', rarity: 'Epic', mass: 36, population: 0,
    ...FISH_MODELS.rare, hint: 'Coming soon.' },
  { id: 'blacktip-reef-shark', name: 'Hammerhead Shark', rarity: 'Secret', mass: SHARK_RULES.startValue, population: 1,
    ...FISH_MODELS.shark, hint: 'Outgrow the roaming shark to collect it (starts at 1,000).' }
] as const
export const COLLECTIBLE_SPECIES = SPECIES.map((fish, index) => ({ ...fish, index })).filter(fish => fish.population > 0)
export function collectedSpeciesCount(counts: readonly number[]): number {
  return COLLECTIBLE_SPECIES.filter(fish => (counts[fish.index] ?? 0) > 0).length
}

export function onPlatform(position: { x: number; y: number; z: number }): boolean {
  return insideLobbyIsland(position.x, position.z) && Math.abs(position.y - lobbySurfaceY(position.x, position.z)) <= 1.5
}

export function fishScale(mass: number): number {
  return Math.min(2.2, 0.45 * Math.cbrt(Math.max(1, mass)))
}

export function eatRadius(mass: number): number {
  return 0.85 * fishScale(mass)
}

export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}
