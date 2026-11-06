import './shared/messages'
import { isServer } from '~system/EngineApi'
import { getRealm } from '~system/Runtime'
import { startClient } from './client/main'
import { startOceanFoam } from './client/oceanFoam'
import { preloadStartupTextures, useEmbeddedIslandSand } from './client/startupTextures'
import { loadSceneLayout } from './shared/sceneLayout'

export async function main() {
  const role = await isServer({})
  if (!role.isServer) {
    useEmbeddedIslandSand()
    preloadStartupTextures()
    startOceanFoam()
  }
  await loadSceneLayout()
  const realm = await getRealm({}).then(result => result.realmInfo, () => undefined)
  const localPreview = realm?.isPreview === true && realm.realmName === 'LocalPreview'
    && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::[0-9]+)?(?:\/|$)/.test(realm.baseUrl)
  if (role.isServer) {
    const { startServer } = await import('./server/main')
    startServer(localPreview)
  } else startClient(localPreview)
}

