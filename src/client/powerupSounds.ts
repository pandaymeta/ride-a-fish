import { AssetLoad, AudioSource, EngineInfo, engine, Entity, Transform } from '@dcl/sdk/ecs'

const SHIELD = 'assets/Audio/shield-collect.ogg'
const SPEED = 'assets/Audio/speed-collect.ogg'
const WATER = 'assets/Audio/boost-water.ogg'

export class PowerupSounds {
  private voices: Entity[] = []
  private next = 0
  private water: Entity
  private running = false
  private audible = true

  constructor() {
    const loader = engine.addEntity()
    Transform.create(loader)
    AssetLoad.create(loader, { assets: [SHIELD, SPEED, WATER] })
    for (let i = 0; i < 2; i++) {
      const voice = engine.addEntity()
      Transform.create(voice)
      AudioSource.create(voice, { audioClipUrl: SHIELD, global: true, playing: false, loop: false, volume: 0.85 })
      this.voices.push(voice)
    }
    this.water = engine.addEntity()
    Transform.create(this.water)
    AudioSource.create(this.water, { audioClipUrl: WATER, global: true, playing: false, loop: true, volume: 0.85 })
  }

  pickup(kind: number): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    const voice = this.voices[this.next++ % this.voices.length]
    const gum = kind === 0
    const audio = AudioSource.getMutable(voice)
    audio.volume = gum ? 0.85 : 0.70
    audio.pitch = 1 + (Math.random() * 2 - 1) * 0.025
    AudioSource.playSound(voice, gum ? SHIELD : SPEED)
  }

  update(riding: boolean, swimming: boolean): void {
    const audible = riding && !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    const running = audible && swimming
    if (running !== this.running) {
      this.running = running
      if (running) AudioSource.playSound(this.water, WATER)
      else AudioSource.stopSound(this.water)
    }
    if (this.audible && !audible) for (const voice of this.voices) AudioSource.stopSound(voice)
    this.audible = audible
  }
}
