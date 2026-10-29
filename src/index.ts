import './shared/messages'
import { isServer } from '~system/EngineApi'
import { startClient } from './client/main'

export async function main() {
  const role = await isServer({})
  if (role.isServer) {
    const { startServer } = await import('./server/main')
    startServer()
  } else startClient()
}

