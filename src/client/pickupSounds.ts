import { AssetLoad, AudioSource, EngineInfo, engine, Entity, Transform } from '@dcl/sdk/ecs'

const COIN = 'assets/Audio/coin-collect.ogg'
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
    AssetLoad.create(loader, { assets: [COIN, BITE, DISCOVERY] })
    for (let i = 0; i < 4; i++) {
      const voice = engine.addEntity()
      Transform.create(voice)
      AudioSource.create(voice, { audioClipUrl: COIN, playing: false, loop: false, global: true })
      this.voices.push(voice)
    }
  }

  play(kind: number, discovery: boolean): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    const voice = this.voices[this.next++ % this.voices.length]
    const clip = kind === 0 ? COIN : discovery ? DISCOVERY : BITE
    const audio = AudioSource.getMutable(voice)
    audio.volume = clip === COIN ? 0.50 : clip === DISCOVERY ? 0.74 : 0.95
    audio.pitch = discovery ? 1 : 1 + (Math.random() * 2 - 1) * 0.04
    AudioSource.playSound(voice, clip)
  }

  update(riding: boolean): void {
    const audible = riding && !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    if (this.audible && !audible) for (const voice of this.voices) AudioSource.stopSound(voice)
    this.audible = audible
  }
}
