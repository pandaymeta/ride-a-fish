import { AssetLoad, AudioSource, EngineInfo, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { SPEED } from '../shared/config'
import { islandRadius } from '../shared/islandProfile'
import { LOBBY_ISLAND } from '../shared/lobbyIsland'

const SURF = 'assets/Audio/cozy-island/island-surf.ogg'
const WAKE = 'assets/Audio/cozy-island/swim-wake.ogg'
const JUMP = 'assets/Audio/cozy-island/jump-splash.ogg'
const LAND = 'assets/Audio/cozy-island/landing-splash.ogg'
const MUSIC = 'assets/Audio/cozy-island/island-music.ogg'
const MUSIC_LENGTH = 173
const MUSIC_PAUSE = 38

type Point = { x: number; z: number }

function source(audioClipUrl: string, volume: number, loop = false): Entity {
  const entity = engine.addEntity()
  Transform.create(entity)
  AudioSource.create(entity, { audioClipUrl, volume, global: true, loop, playing: false })
  return entity
}

function shoreDistance({ x, z }: Point): number {
  const island = LOBBY_ISLAND
  const dx = (x - island.x) / island.shoreRadiusX, dz = (z - island.z) / island.shoreRadiusZ
  const edge = island.irregular ? islandRadius(Math.atan2(dz, dx)) : 1
  return (Math.hypot(dx, dz) - edge) * Math.min(island.shoreRadiusX, island.shoreRadiusZ)
}

export class IslandAudio {
  private readonly surf = source(SURF, 0, true)
  private readonly wake = source(WAKE, 0, true)
  private readonly jump = source(JUMP, 0.33)
  private readonly land = source(LAND, 0.49)
  private readonly music = source(MUSIC, 0)
  private mixTime = 0
  private musicTime = -4
  private hadFish = false
  private lastX = 0
  private lastZ = 0

  constructor() {
    const loader = engine.addEntity()
    Transform.create(loader)
    AssetLoad.create(loader, { assets: [SURF, WAKE, JUMP, LAND, MUSIC] })
  }

  splash(landing: boolean): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) return
    AudioSource.playSound(landing ? this.land : this.jump, landing ? LAND : JUMP)
  }

  update(dt: number, player: Point, fish: Point | undefined, airborne: boolean, boosted: boolean, talking: boolean): void {
    if (EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden) {
      this.hadFish = false
      this.mixTime = 0
      if (this.musicTime >= 0) this.musicTime = -4
      for (const entity of [this.surf, this.wake, this.jump, this.land, this.music]) {
        if (AudioSource.get(entity).playing) AudioSource.stopSound(entity)
      }
      return
    }

    this.mixTime += dt
    if (!fish) this.hadFish = false
    if (this.mixTime < 0.085) return
    const elapsed = this.mixTime
    this.mixTime = 0
    const speed = fish && this.hadFish ? Math.hypot(fish.x - this.lastX, fish.z - this.lastZ) / elapsed : 0
    if (fish) {
      this.lastX = fish.x; this.lastZ = fish.z; this.hadFish = true
    }

    this.musicTime += elapsed
    if (this.musicTime >= MUSIC_LENGTH) this.musicTime = -MUSIC_PAUSE
    const musicPlaying = this.musicTime >= 0
    const musicLevel = talking ? 0.06 : fish ? 0.12 : 0.17
    const surfLevel = 0.27 * Math.max(0, 1 - Math.max(0, shoreDistance(fish ?? player)) / 48)
    const wakeLevel = fish && !airborne && !boosted && speed <= SPEED * 2.5
      ? 0.24 * Math.min(1, Math.max(0, (speed - 0.28) / (SPEED - 0.28))) : 0
    this.mix(this.surf, SURF, surfLevel * (musicPlaying ? 0.78 : 1), elapsed)
    this.mix(this.wake, WAKE, wakeLevel, elapsed)

    if (musicPlaying) this.mix(this.music, MUSIC, musicLevel, elapsed)
    else if (AudioSource.get(this.music).playing) AudioSource.stopSound(this.music)
  }

  private mix(entity: Entity, clip: string, level: number, dt: number): void {
    const audio = AudioSource.get(entity)
    const volume = audio.volume ?? 0
    const next = volume + (level - volume) * (1 - Math.exp(-dt * 8))
    if (level <= 0.006 && next <= 0.008) {
      if (audio.playing) {
        AudioSource.stopSound(entity)
        AudioSource.getMutable(entity).volume = 0
      }
      return
    }
    if (Math.abs(next - volume) > 0.003) AudioSource.getMutable(entity).volume = next
    if (!audio.playing && next > 0.008) AudioSource.playSound(entity, clip)
  }
}
