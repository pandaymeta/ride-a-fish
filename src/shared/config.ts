export const WORLD_NAME = 'entenium.dcl.eth'
export const MAX_RIDERS = 4
export const SPEED = 4
export const ENTRY_SHIELD = 10
export const SEA_Y = 1.4
export const LOBBY = { x: 32, y: 0.3, z: 7 }
export const PORTAL = { x: 32, y: 1, z: 12 }
export const SEA = { minX: 7, maxX: 57, minZ: 24, maxZ: 57 }
export const ENTRY_POINTS = [
  { x: 14, z: 27 }, { x: 50, z: 27 }, { x: 14, z: 52 }, { x: 50, z: 52 }
]

export const SPECIES = [
  { id: 'clownfish', name: 'Clownfish', mass: 2, population: 6, speed: 2.4,
    model: 'assets/Models/clownfish.glb', height: 1.0833, hint: 'Follow the food near the shallows.' },
  { id: 'pufferfish', name: 'Puffer Fish', mass: 6, population: 4, speed: 2,
    model: 'assets/Models/pufferfish.glb', height: 1.5455, hint: 'Grow past size 6 before approaching.' },
  { id: 'reef-shark', name: 'Blacktip Reef Shark', mass: 18, population: 2, speed: 3.4,
    model: 'assets/Models/reef-shark.glb', height: 0.8235, hint: 'A dangerous catch. Reach size 19 first.' }
] as const

export function fishScale(mass: number): number {
  return Math.min(3, Math.cbrt(Math.max(1, mass)))
}

export function eatRadius(mass: number): number {
  return 0.65 * fishScale(mass)
}

export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}
