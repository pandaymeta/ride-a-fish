import { AssetLoad, AudioSource, EngineInfo, engine, Entity, Transform } from '@dcl/sdk/ecs'

const SHIELD = 'assets/Audio/shield-collect.ogg'
const CHILI = 'assets/Audio/speed-collect.ogg'

export class PowerupSounds {
  private voices: Entity[] = []
  private next = 0
  private audible = true

  constructor() {
    const loader = engine.addEntity()
    Transform.create(loader)
    AssetLoad.create(loader, { assets: [SHIELD, CHILI] })
    for (let i = 0; i < 2; i++) {
      const voice = engine.addEntity()
      Transform.create(voice)
      AudioSource.create(voice, { audioClipUrl: SHIELD, global: true, playing: false, loop: false })
      this.voices.push(voice)
    }
  }

  pickup(shield: boolean): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    const voice = this.voices[this.next++ % this.voices.length]
    const audio = AudioSource.getMutable(voice)
    audio.volume = shield ? 0.85 : 0.35
    audio.pitch = 1 + (Math.random() * 2 - 1) * 0.025
    AudioSource.playSound(voice, shield ? SHIELD : CHILI)
  }

  update(audible: boolean): void {
    if (this.audible && !audible) for (const voice of this.voices) AudioSource.stopSound(voice)
    this.audible = audible
  }
}
