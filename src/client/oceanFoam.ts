import { AssetLoad, engine, Entity, GltfNodeModifiers } from '@dcl/sdk/ecs'

const FRAMES_PER_SHEET = 32
const SHEETS = Array.from({ length: 4 }, (_, i) => `assets/Images/tai-shore-foam-frames-${i}.png`)
const FRAME_COUNT = FRAMES_PER_SHEET * SHEETS.length
const SCROLL_SPEED = 0.0175 // Unity's TAI_Water_01A noise repeats per second.
const STEP = 1 / 24

export function startOceanFoam(): void {
  const bands: { name: string; entity: Entity | null }[] = [
    { name: 'Island Shore Foam A', entity: null },
    { name: 'Island Shore Foam B', entity: null }
  ]
  AssetLoad.create(engine.addEntity(), { assets: SHEETS })
  let clock = 0
  let phase = 0

  engine.addSystem(dt => {
    clock += dt
    if (clock < STEP) return
    phase = (phase + clock * SCROLL_SPEED * FRAME_COUNT) % FRAME_COUNT
    clock = 0
    const frame = Math.floor(phase)
    const mix = phase - frame

    // Alternate which mesh advances so a frame changes while that mesh is transparent.
    for (let slot = 0; slot < bands.length; slot++) {
      const band = bands[slot]
      band.entity ??= engine.getEntityOrNullByName(band.name)
      if (band.entity === null) continue
      const override = GltfNodeModifiers.getMutableOrNull(band.entity)?.modifiers[0]?.material?.material
      if (override?.$case !== 'pbr') continue
      const pbr = override.pbr
      const texture = pbr.texture?.tex
      if (texture?.$case !== 'texture' || !pbr.albedoColor || !SHEETS.includes(texture.texture.src)) continue
      const incoming = slot !== frame % 2
      const index = (frame + Number(incoming)) % FRAME_COUNT
      texture.texture.src = SHEETS[Math.floor(index / FRAMES_PER_SHEET)]
      texture.texture.offset = { x: 0, y: -(index % FRAMES_PER_SHEET) / FRAMES_PER_SHEET }
      pbr.albedoColor.a = incoming ? mix : 1 - mix
    }
  }, undefined, 'unity-shore-foam')
}
