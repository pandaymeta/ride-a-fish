import {
  AssetLoad, assetLoadLoadingStateSystem, engine, GltfContainer, GltfNodeModifiers, LoadingState, Transform
} from '@dcl/sdk/ecs'
import { POWERUP_ICONS } from '../shared/powerups'

export const COIN_TEXTURE = 'assets/Images/golden-coin.png'
export const INDEX_ICON = 'assets/Images/ui/index-book-parchment.png'
export const INDEX_BOOK = 'assets/Images/ui/book/parchment-book-uniform.png'
export const INDEX_TILE = 'assets/Images/ui/book/fish-tile-uniform.png'
export const INDEX_SILHOUETTES = 'assets/Images/ui/book/fish-silhouettes-uniform.png'
export const GUIDE_FRAME = 'assets/Images/ui/rean/dialogue-angular.png'
export const GUIDE_NAMEPLATE = 'assets/Images/ui/rean/nameplate-angular.png'
export const GUIDE_BUTTON = 'assets/Images/ui/rean/button-angular.png'
export const BOOST_TEXTURE = 'assets/Images/KOFTE/Fish_05-boost.jpg'
export const FOOTPRINT_TEXTURE = 'assets/Images/sand-footprint.png'
export const SWIM_RIPPLES_TEXTURE = 'assets/Images/reference-swim-ripples.png'
export const SWIM_SPRAY_TEXTURE = 'assets/Images/reference-swim-spray.png'

const firstUseTextures = [COIN_TEXTURE, INDEX_ICON, FOOTPRINT_TEXTURE, SWIM_RIPPLES_TEXTURE, SWIM_SPRAY_TEXTURE]
const textures = [
  ...firstUseTextures, INDEX_BOOK, INDEX_TILE, INDEX_SILHOUETTES,
  GUIDE_FRAME, GUIDE_NAMEPLATE, GUIDE_BUTTON, BOOST_TEXTURE, ...POWERUP_ICONS,
  'assets/Images/ui/book/stat-hook.png', 'assets/Images/ui/book/stat-ruler.png',
  'assets/Images/ui/book/stat-coin.png', 'assets/Images/ui/book/stat-clock.png',
  ...['07', '17', '06', '20'].map(id => 'assets/Images/ui/book/fish-' + id + '-uniform.png')
]
const loaded = new Set<string>()
let waiting = true

export function waitingForTextures(): boolean {
  return waiting
}

export function textureReady(path: string): boolean {
  return loaded.has(path)
}

export function preloadStartupTextures(): void {
  const pending = new Set(textures)
  const failed = new Set<string>()
  const retry = new Set<string>()
  const startedAt = Date.now()
  let retried = false
  let loader = request(textures)

  function request(assets: string[]) {
    const entity = engine.addEntity()
    Transform.create(entity)
    assetLoadLoadingStateSystem.registerAssetLoadLoadingStateEntity(entity, ({ asset, currentState }) => {
      if (currentState === LoadingState.FINISHED) {
        loaded.add(asset)
        pending.delete(asset)
      } else if (currentState === LoadingState.NOT_FOUND) {
        if (pending.delete(asset)) failed.add(asset)
      } else if (currentState === LoadingState.FINISHED_WITH_ERROR && pending.delete(asset)) {
        if (retried) failed.add(asset)
        else retry.add(asset)
      }
    })
    AssetLoad.create(entity, { assets })
    return entity
  }

  function finish() {
    waiting = false
    engine.removeSystem(check)
    assetLoadLoadingStateSystem.removeAssetLoadLoadingStateEntity(loader)
    if (pending.size || failed.size || retry.size) {
      console.log('[TEXTURES] Startup textures unavailable:', JSON.stringify({ pending: [...pending], failed: [...failed, ...retry] }))
    }
    // Keep the loader entities alive so Explorer can keep the textures warm for this visit.
  }

  function check() {
    const elapsed = Date.now() - startedAt
    // Cap the startup overlay. Each effect also waits for its own textures.
    if (elapsed >= 5_000 || firstUseTextures.every(textureReady)) waiting = false
    if (elapsed >= 20_000) { finish(); return }
    if (pending.size) return
    if (!retry.size) { finish(); return }
    retried = true
    assetLoadLoadingStateSystem.removeAssetLoadLoadingStateEntity(loader)
    const assets = [...retry]
    retry.clear()
    for (const asset of assets) pending.add(asset)
    loader = request(assets)
  }

  engine.addSystem(check)
}

export function useEmbeddedIslandSand(): void {
  for (const [name, model] of [
    ['Sand Dune', 'central-bay-island-seed-top-v1.glb'],
    ['Sand Dune_2', 'central-bay-island-seed-warm-v1.glb']
  ]) {
    const entity = engine.getEntityOrNullByName(name)
    if (entity === null || GltfContainer.getOrNull(entity)?.src !== 'assets/Models/' + model) continue
    const current = GltfNodeModifiers.getOrNull(entity)
    const override = current?.modifiers.find(modifier => modifier.path === 'BeachIsland')?.material?.material
    const texture = override?.$case === 'pbr' ? override.pbr.texture?.tex : undefined
    if (texture?.$case !== 'texture' || texture.texture.src !== 'assets/Images/stylized-beach-sand-1k.jpg') continue

    // These models already contain the same image and their respective sand tints.
    // Preserve other node settings, including collisions and authored transforms.
    const modifiers = GltfNodeModifiers.getMutable(entity).modifiers
    const beach = modifiers.find(modifier => modifier.path === 'BeachIsland')
    if (beach) delete beach.material
  }
}
