import { engine, PlayerIdentityData, Transform } from '@dcl/sdk/ecs'
import { PORTAL, PORTAL_HEIGHT_TOLERANCE, PORTAL_RADIUS, SPECIES } from '../shared/config'
import { room } from '../shared/messages'
import { Arena } from './arena'
import { ProgressStore } from './progress'

export function startServer(): void {
  const arena = new Arena()
  const store = new ProgressStore()
  const identities = new Map<string, { guest: boolean; x: number; y: number; z: number }>()
  const lastInput = new Map<string, number>()
  const lastEnter = new Map<string, number>()
  const missingSince = new Map<string, number>()
  let accumulated = 0, snapshotClock = 0, profileClock = 0, saveClock = 0

  function refreshIdentities(): void {
    identities.clear()
    for (const [entity, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
      const t = Transform.getOrNull(entity)
      if (t) identities.set(identity.address.toLowerCase(), {
        guest: identity.isGuest, x: t.position.x, y: t.position.y, z: t.position.z
      })
    }
  }
  function notice(address: string, message: string): void {
    void room.send('notice', { message }, { to: [address] })
  }
  function sendProfile(address: string): void {
    const profile = store.profile(address)
    if (profile) void room.send('profile', profile, { to: [address] })
  }

  room.onMessage('hello', async (_, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    refreshIdentities()
    const identity = identities.get(address)
    if (!identity) return
    if (await store.load(address, identity.guest)) sendProfile(address)
    else notice(address, 'Your collection could not be loaded. Please wait; we will retry safely.')
  })
  room.onMessage('enter', (_, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    if (arena.time - (lastEnter.get(address) ?? -10) < 1) return
    lastEnter.set(address, arena.time)
    refreshIdentities()
    const player = identities.get(address)
    if (!player || Math.hypot(player.x - PORTAL.x, player.z - PORTAL.z) > PORTAL_RADIUS + 0.5
      || Math.abs(player.y - PORTAL.y) > PORTAL_HEIGHT_TOLERANCE) {
      notice(address, 'Step into the glowing circle on the stage to begin.'); return
    }
    if (!store.players.has(address)) { notice(address, 'Loading your collection. Try the circle shortly.'); return }
    if (arena.getMount(address)) return
    if (!arena.enter(address)) { notice(address, 'The sea has four riders. A place will open shortly.'); return }
    store.start(address)
    sendProfile(address)
  })
  room.onMessage('steer', (input, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    if (arena.time - (lastInput.get(address) ?? -1) < 0.035) return
    lastInput.set(address, arena.time)
    arena.steer(address, input.seq, input.x, input.z)
  })
  room.onMessage('leave', (_, context) => {
    if (context) arena.leave(context.from.toLowerCase())
  })

  engine.addSystem(dt => {
    accumulated = Math.min(accumulated + dt, 0.25)
    while (accumulated >= 0.05) { arena.step(0.05); accumulated -= 0.05 }
    for (const event of arena.events.splice(0)) {
      if (event.type === 'growth') store.grow(event.owner, event.mass)
      if (event.type === 'catch') {
        const fresh = store.catch(event.owner, event.species, event.mass)
        if (fresh) notice(event.owner, 'Discovered: ' + SPECIES[event.species].name + '!')
        sendProfile(event.owner)
      }
      if (event.type === 'end') {
        store.end(event.owner, event.reason)
        sendProfile(event.owner)
        void store.flush(event.owner)
      }
    }
    snapshotClock += dt; profileClock += dt; saveClock += dt
    if (snapshotClock >= 0.1) {
      snapshotClock = 0
      void room.send('snapshot', arena.snapshot())
    }
    if (profileClock >= 1) {
      profileClock = 0
      refreshIdentities()
      for (const address of store.players.keys()) {
        if (identities.has(address)) { missingSince.delete(address); sendProfile(address) }
        else {
          if (!missingSince.has(address)) missingSince.set(address, arena.time)
          if (arena.time - missingSince.get(address)! > 3) {
            arena.leave(address, 'You left the sea.')
            void store.flush(address)
          }
        }
      }
    }
    if (saveClock >= 2) {
      saveClock = 0
      for (const address of store.players.keys()) void store.flush(address)
    }
  })
  console.log('[SERVER] Ride A Fish ready: 4 riders, 3 species, authoritative eating.')
}
