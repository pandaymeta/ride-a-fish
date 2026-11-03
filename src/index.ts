import './shared/messages'
import { isServer } from '~system/EngineApi'
import { startClient } from './client/main'
import { preloadStartupTextures, useEmbeddedIslandSand } from './client/startupTextures'
import { loadSceneLayout } from './shared/sceneLayout'

export async function main() {
  const role = await isServer({})
  if (!role.isServer) {
    useEmbeddedIslandSand()
    preloadStartupTextures()
  }
  await loadSceneLayout()
  if (role.isServer) {
    const { startServer } = await import('./server/main')
    startServer()
  } else startClient()
}

