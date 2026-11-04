import { AssetLoad, AudioSource, EngineInfo, engine, Transform } from '@dcl/sdk/ecs'

const BITE = 'assets/Audio/fish-bite.ogg'

// One local voice survives removal of the fish and its teleport back to the lobby.
export class EatenSound {
  private voice = engine.addEntity()
  private seen = new Set<string>()

  constructor() {
    Transform.create(this.voice)
    AssetLoad.create(this.voice, { assets: [BITE] })
    AudioSource.create(this.voice, { audioClipUrl: BITE, playing: false, loop: false, global: true, volume: 0.95 })
  }

  play(eventId: string): void {
    if (this.seen.has(eventId)) return
    this.seen.add(eventId)
    if (this.seen.size > 32) this.seen.delete(this.seen.values().next().value!)
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    AudioSource.playSound(this.voice, BITE)
  }

  update(): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden && AudioSource.get(this.voice).playing) {
      AudioSource.stopSound(this.voice)
    }
  }
}
