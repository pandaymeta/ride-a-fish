export const WORLD_NAME = 'entenium.dcl.eth'
export const MAX_RIDERS = 4
export const SPEED = 4
export const ENTRY_SHIELD = 10
export const FOOD_COUNT = 180
export const SEA_Y = 1.4
export const STAGE = { minX: 48, maxX: 112, minZ: 146, maxZ: 158, top: 8 }
export const LOBBY = { x: 80, y: STAGE.top + 0.15, z: 155 }
export const LOBBY_LOOK_AT = { x: 80, y: SEA_Y, z: 80 }
export const PORTAL = { x: 80, y: STAGE.top + 0.035, z: 150 }
export const PORTAL_RADIUS = 2.65
export const PORTAL_HEIGHT_TOLERANCE = 1.2
export const SEA = { minX: 16, maxX: 144, minZ: 16, maxZ: 144 }
export const ENTRY_POINTS = [
  { x: 48, z: 128 }, { x: 112, z: 128 }, { x: 48, z: 48 }, { x: 112, z: 48 }
]

export const SPECIES = [
  { id: 'clownfish', name: 'Clownfish', mass: 2, population: 18,
    model: 'assets/Models/clownfish-textured.glb', height: 1.0833, hint: 'Follow the food near the shallows.' },
  { id: 'pufferfish', name: 'Puffer Fish', mass: 6, population: 12,
    model: 'assets/Models/pufferfish-textured.glb', height: 1.5455, hint: 'Grow past size 6 before approaching.' },
  { id: 'reef-shark', name: 'Blacktip Reef Shark', mass: 18, population: 6,
    model: 'assets/Models/reef-shark-textured.glb', height: 0.8235, hint: 'Harmless until caught. Reach size 19 first.' }
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
