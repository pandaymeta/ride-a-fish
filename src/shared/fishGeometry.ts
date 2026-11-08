import { fishScale, OCEAN_FLOOR_Y, PLAYER_SKINS, SEA_Y, SPECIES } from './config'
import { isShark, SHARK_RULES } from './shark'
import type { FishState } from './messages'

export function fishBodyScale(fish: Pick<FishState, 'owner' | 'species' | 'mass'>): number {
  const modelScale = fish.owner ? PLAYER_SKINS[0].modelScale : SPECIES[fish.species].modelScale
  return fishScale(fish.mass) * modelScale * (isShark(fish) ? SHARK_RULES.bodyScale : 1)
}

export function fishWaterHeight(fish: Pick<FishState, 'owner' | 'species' | 'mass' | 'skin'>, scale = fishBodyScale(fish)): number {
  const height = fish.owner ? PLAYER_SKINS[fish.skin].height : SPECIES[fish.species].height
  const bodyHeight = height * scale
  // Player fish rest with roughly 40% of the body below the waterline.
  const waterline = fish.owner ? 0.10 : 0.25
  return Math.max(SEA_Y + bodyHeight * waterline, OCEAN_FLOOR_Y + 0.03 + bodyHeight * 0.5)
}

export const RIDER_HIP_HEIGHT = 0.155

export function riderSeatOffsetY(bodyHeight: number): number {
  return bodyHeight / 2 - RIDER_HIP_HEIGHT + 0.05
}

export function fishSeatY(fish: Pick<FishState, 'owner' | 'species' | 'mass' | 'skin'>): number {
  return fishWaterHeight(fish) + riderSeatOffsetY(PLAYER_SKINS[fish.skin].height * fishBodyScale(fish))
}
