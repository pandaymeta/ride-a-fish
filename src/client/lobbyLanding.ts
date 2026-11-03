import { engine, Transform } from '@dcl/sdk/ecs'
import { movePlayerTo } from '~system/RestrictedActions'
import { LOBBY, LOBBY_LOOK_AT, onPlatform } from '../shared/config'

// A successful teleport request can still precede the avatar's physics update.
// Keep controls locked until the player has settled at the authored lobby spawn.
function waitForLanding(): Promise<boolean> {
  return new Promise(resolve => {
    let elapsed = 0, stable = 0
    const check = (dt: number): void => {
      elapsed += dt
      const p = Transform.getOrNull(engine.PlayerEntity)?.position
      const landed = !!p && onPlatform(p) && Math.hypot(p.x - LOBBY.x, p.z - LOBBY.z) < 1.5
        && Math.abs(p.y - LOBBY.y) < 0.6
      stable = landed ? stable + dt : 0
      if (stable < 0.2 && elapsed < 2) return
      engine.removeSystem(check)
      resolve(stable >= 0.2)
    }
    engine.addSystem(check)
  })
}

export async function landAtLobby(): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: LOBBY_LOOK_AT })
      if (result.success && await waitForLanding()) return
    } catch (error) {
      console.log('[CLIENT] Retrying island landing.', String(error))
    }
  }
  throw new Error('The avatar has not settled at the island spawn.')
}
