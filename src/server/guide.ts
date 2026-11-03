import { engine, getWorldPosition } from '@dcl/sdk/ecs'
import { room } from '../shared/messages'
import { GUIDE_NAME, GUIDE_RANGE } from '../shared/tutorial'
import { ProgressStore } from './progress'

interface PlayerPosition { x: number; y: number; z: number }
// Only the server offers/acknowledges dialogue; the client never submits lesson progress.
export function registerGuide(store: ProgressStore, playerAtDock: (address: string) => PlayerPosition | undefined,
  sendProfile: (address: string) => void): void {
  const pending = new Map<string, number>()
  function nearby(address: string): boolean {
    const guide = engine.getEntityOrNullByName(GUIDE_NAME), player = playerAtDock(address)
    if (guide === null || !player) return false
    const p = getWorldPosition(engine, guide)
    return Math.hypot(player.x - p.x, player.z - p.z) <= GUIDE_RANGE + 0.5 && Math.abs(player.y - p.y) <= 2
  }
  room.onMessage('guideTalk', (_, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    if (!nearby(address)) return
    const kind = store.dialogue(address)
    if (kind === undefined) { sendProfile(address); return }
    pending.set(address, kind)
    void room.send('guideDialogue', { kind }, { to: [address] })
  })
  room.onMessage('guideAcknowledge', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase(), offer = pending.get(address)
    if (offer === undefined || offer !== data.kind || !nearby(address)) return
    if (store.acknowledgeGuide(address, data.kind)) {
      pending.delete(address)
      sendProfile(address)
    }
  })
}
