// The grant sample has exactly one player-hunting NPC; other species stay collectible-only.
export const SHARK_SPECIES = 4
export const SHARK_RULES = {
  swimHeight: 0.6, bodyScale: 2, startValue: 1000, spawnProtection: 5, detectionRange: 31.25, loseRange: 46.875,
  roamSpeed: 3.75, chaseSpeed: 6.25, fleeSpeed: 6.25,
  wanderRadius: 46.875, fleeDistance: 15.625, thinkInterval: 0.1,
  turnSpeed: 3.8, edgeMargin: 3.1
} as const

export function isShark(fish: { owner: string; species: number }): boolean {
  return !fish.owner && fish.species === SHARK_SPECIES
}
