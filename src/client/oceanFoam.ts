import { engine, Entity, GltfNodeModifiers } from '@dcl/sdk/ecs'

// Dissolve two fixed-width coastal bands without scaling them away from the shoreline.
export function startOceanFoam(): void {
  const slots: { name: string; entity: Entity | null; previous: number; phase: number }[] = [
    { name: 'Island Shore Foam A', entity: null, previous: -1, phase: 0 },
    { name: 'Island Shore Foam B', entity: null, previous: -1, phase: Math.PI }
  ]
  let clock = 0, elapsed = 0
  engine.addSystem(dt => {
    clock += dt; elapsed += dt
    if (clock < 1 / 20) return
    clock %= 1 / 20
    for (const slot of slots) {
      if (slot.entity === null) slot.entity = engine.getEntityOrNullByName(slot.name)
      if (slot.entity === null) continue
      const threshold = 0.28 + 0.62 * (0.5 - 0.5 * Math.cos(elapsed * Math.PI * 2 / 4.5 + slot.phase))
      if (Math.abs(threshold - slot.previous) < 0.004) continue
      const override = GltfNodeModifiers.getMutableOrNull(slot.entity)?.modifiers[0]?.material?.material
      if (override?.$case !== 'pbr') continue
      override.pbr.alphaTest = threshold
      slot.previous = threshold
    }
  })
}
