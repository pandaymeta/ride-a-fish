import { engine, InputAction, inputSystem, Transform } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/src/players'
import { isStateSyncronized } from '@dcl/sdk/network'
import { LOBBY, LOBBY_LOOK_AT, PORTAL, PORTAL_HEIGHT_TOLERANCE, PORTAL_RADIUS, SPECIES, STAGE } from '../shared/config'
import { movePlayerTo } from '~system/RestrictedActions'
import { ArenaSnapshot, PlayerProfile, room } from '../shared/messages'
import { setupUi } from '../ui'
import { actions } from './state'
import { state } from '../ui/RideHud'
import { FishForm } from './fishForm'
import { ArenaView } from './view'

export function startClient(): void {
  setupUi()
  const view = new ArenaView()
  const form = new FishForm(view)
  let snapshot: ArenaSnapshot = { tick: 0, fish: [], food: [] }
  let profile: PlayerProfile | undefined
  let address = '', lastSnapshot = 0, helloClock = 0, inputClock = 0, enterClock = 0, seq = 0
  let portalLatch = false, entering = false, pendingReturn = false, noticeUntil = 0
  let sceneReady = false
  let recovering = false, lastRecovery = 0

  function notice(message: string): void {
    state.notice = message
    noticeUntil = Date.now() + 4500
  }
  actions.toggleIndex = () => { state.indexDisplay = state.indexDisplay === 'flex' ? 'none' : 'flex' }
  actions.returnToLobby = () => {
    pendingReturn = true
    void room.send('leave', {})
    if (form.phase !== 'lobby') void form.returnToLobby()
  }
  room.onMessage('notice', data => { entering = false; notice(data.message) })
  room.onMessage('profile', data => {
    profile = data
    state.collection = 'Fish Index  ' + data.counts.filter(n => n > 0).length + ' / 3'
    state.best = 'Personal best  ' + data.best
    state.result = data.result ? data.result + (data.peak ? '  Peak: ' + data.peak : '') : ''
    const labels = SPECIES.map((fish, i) => data.counts[i] > 0
      ? fish.name + '  ·  ' + data.counts[i] + ' caught  ·  best ' + data.largest[i]
      : '???  ·  ' + fish.hint)
    state.clown = labels[0]; state.puffer = labels[1]; state.shark = labels[2]
  })
  room.onMessage('snapshot', data => {
    snapshot = data; lastSnapshot = Date.now()
    const mine = data.fish.find(f => f.owner === address)
    view.apply(data, form.fishId)
    if (!mine) {
      entering = false
      pendingReturn = false
      if (form.phase === 'fish' || form.phase === 'transforming') {
        void form.returnToLobby()
        state.indexDisplay = 'none'
      }
    } else if (form.phase === 'lobby' && !pendingReturn) {
      entering = false
      state.indexDisplay = 'none'
      void form.transform(mine.id).then(ok => { if (!ok) actions.returnToLobby() })
    }
  })

  engine.addSystem(dt => {
    const player = getPlayer()
    if (!player || !Transform.has(engine.PlayerEntity)) return
    address = player.userId.toLowerCase()
    // Static scene authoring is a separate editor operation; never fake missing layout in runtime code.
    sceneReady = engine.getEntityOrNullByName('Sea Portal') !== null
    const alive = Date.now() - lastSnapshot < 3500 && lastSnapshot > 0
    const mine = snapshot.fish.find(f => f.owner === address)
    helloClock += dt; inputClock += dt; enterClock += dt
    if (isStateSyncronized() && helloClock >= (profile ? 5 : 1)) {
      helloClock = 0; void room.send('hello', {})
    }
    state.save = !alive ? 'The sea server is waking up…' : !profile ? 'Loading your collection…'
      : profile.guest ? 'Guest visit · collection lasts this session'
      : profile.saved ? 'Collection saved' : 'Saving your collection…'
    if (!sceneReady) { state.phase = 'Scene setup pending'; state.mass = 'Lobby and sea are being connected.'; return }
    if (form.phase === 'fish' && mine) {
      state.phase = mine.shield > 0 ? 'PvP protection  ' + Math.ceil(mine.shield) + 's' : 'Collect fish. Watch other players.'
      state.mass = 'Fish size  ' + mine.mass
      state.returnDisplay = 'flex'
      if (inputClock >= 0.1 && alive) {
        inputClock = 0
        const x = Number(inputSystem.isPressed(InputAction.IA_RIGHT)) - Number(inputSystem.isPressed(InputAction.IA_LEFT))
        const z = Number(inputSystem.isPressed(InputAction.IA_FORWARD)) - Number(inputSystem.isPressed(InputAction.IA_BACKWARD))
        void room.send('steer', { seq: ++seq, ...form.steering(x, z) })
      }
    } else {
      state.phase = form.phase === 'lobby' ? 'Wooden spectator stage' : form.phase === 'transforming' ? 'Transforming into a fish…' : 'Returning to the stage…'
      state.mass = 'Step into the circle to become a fish'
      state.returnDisplay = form.phase === 'lobby' ? 'none' : 'flex'
      const pos = Transform.get(engine.PlayerEntity).position
      const inside = Math.hypot(pos.x - PORTAL.x, pos.z - PORTAL.z) < PORTAL_RADIUS
        && Math.abs(pos.y - PORTAL.y) < PORTAL_HEIGHT_TOLERANCE
      if (!inside) portalLatch = false
      if (inside && !portalLatch && !entering && form.phase === 'lobby' && alive && profile) {
        portalLatch = true; entering = true; enterClock = 0
        void room.send('enter', {})
      }
      if (entering && enterClock > 4) { entering = false; portalLatch = false }
      if (form.phase === 'lobby' && pos.y < STAGE.top - 1.5 && !recovering && Date.now() - lastRecovery > 3000) {
        recovering = true; lastRecovery = Date.now()
        void movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: LOBBY_LOOK_AT })
          .catch(error => console.error('[CLIENT] Stage recovery failed.', String(error)))
          .finally(() => { recovering = false })
      }
    }
    if (pendingReturn && alive && inputClock >= 1) { inputClock = 0; void room.send('leave', {}) }
    view.update(dt, mine?.mass ?? 1, mine?.id)
    form.update()
    if (Date.now() > noticeUntil) state.notice = form.phase === 'fish'
      ? 'Static fish cannot attack · DANGER marks larger rival fish'
      : 'Watch the arena, then step into the circle. Discoveries survive each run.'
  })
  console.log('[CLIENT] Ride A Fish client ready; waiting for the sea server.')
}
