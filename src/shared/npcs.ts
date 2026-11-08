import { engine, Transform } from '@dcl/sdk/ecs'

export const NPC_SLOTS = [
  ...Array.from({ length: 5 }, (_, i) => ({ name: 'NPC Blue Tang ' + String(i + 1).padStart(2, '0'), species: 0 })),
  ...Array.from({ length: 2 }, (_, i) => ({ name: 'NPC Reef Angelfish ' + String(i + 1).padStart(2, '0'), species: 1 })),
  { name: 'NPC Red Reef Fish 01', species: 2 },
  { name: 'NPC Hammerhead Shark 01', species: 4 },
  // Append slots so the original tutorial and shark slot indices remain stable.
  ...Array.from({ length: 14 }, (_, i) => ({ name: 'NPC Blue Tang ' + String(i + 6).padStart(2, '0'), species: 0 })),
  ...Array.from({ length: 15 }, (_, i) => ({ name: 'NPC Reef Angelfish ' + String(i + 3).padStart(2, '0'), species: 1 })),
  ...Array.from({ length: 3 }, (_, i) => ({ name: 'NPC Red Reef Fish ' + String(i + 2).padStart(2, '0'), species: 2 }))
]

export interface NpcAnchor { slot: number; species: number; x: number; z: number; yaw: number }

// Placement belongs to the editor. The simulation reads it instead of pinning transforms in code.
export function readNpcAnchors(): NpcAnchor[] {
  return NPC_SLOTS.map((slot, index) => {
    const entity = engine.getEntityOrNullByName(slot.name)
    const transform = entity === null ? null : Transform.getOrNull(entity)
    if (!transform) throw new Error('Missing editor-authored fish: ' + slot.name)
    const q = transform.rotation
    return { slot: index, species: slot.species, x: transform.position.x, z: transform.position.z,
      yaw: Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z)) }
  })
}
