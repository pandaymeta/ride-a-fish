import { AssetLoad, AudioSource, EngineInfo, engine, Entity, Transform } from '@dcl/sdk/ecs'

const FOOD = 'assets/Audio/food-collect.ogg'
const BITE = 'assets/Audio/fish-bite.ogg'
const DISCOVERY = 'assets/Audio/fish-discovery.ogg'

// A small local voice pool allows overlapping pickups without creating entities per catch.
export class PickupSounds {
  private voices: Entity[] = []
  private next = 0
  private audible = true

  constructor() {
    const loader = engine.addEntity()
    Transform.create(loader)
    AssetLoad.create(loader, { assets: [FOOD, BITE, DISCOVERY] })
    for (let i = 0; i < 4; i++) {
      const voice = engine.addEntity()
      Transform.create(voice)
      AudioSource.create(voice, { audioClipUrl: FOOD, playing: false, loop: false, global: true, volume: 0.65 })
      this.voices.push(voice)
    }
  }

  play(kind: number, discovery: boolean): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    const voice = this.voices[this.next++ % this.voices.length]
    AudioSource.getMutable(voice).pitch = discovery ? 1 : 1 + (Math.random() * 2 - 1) * 0.04
    AudioSource.playSound(voice, kind === 0 ? FOOD : discovery ? DISCOVERY : BITE)
  }

  update(riding: boolean): void {
    const audible = riding && !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    if (this.audible && !audible) for (const voice of this.voices) AudioSource.stopSound(voice)
    this.audible = audible
  }
}
