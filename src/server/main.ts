import { TUTORIAL_RIDE, TUTORIAL_FOOD, TUTORIAL_FISH, TUTORIAL_SPEED, TUTORIAL_SHIELD, TUTORIAL_DOCK } from '../shared/tutorial'
import { SPEED_POWERUP } from '../shared/powerups'
import { registerGuide } from './guide'
import { engine, PlayerIdentityData, Transform } from '@dcl/sdk/ecs'
import { fishSeatY } from '../shared/fishGeometry'
import { SEA_Y, SPECIES } from '../shared/config'
import { readNpcAnchors } from '../shared/npcs'
import { room } from '../shared/messages'
import { Arena } from './arena'
import { nearestDockLanding } from '../shared/dockSurfaces'
import { withinBoardingRange } from '../shared/boarding'
import { BoardingQueue } from './boardingQueue'
import { ProgressStore } from './progress'

export function startServer(localPreview = false): void {
  const arena = new Arena(readNpcAnchors())
  const store = new ProgressStore()
  const boarding = new BoardingQueue(arena)
  const identities = new Map<string, { guest: boolean; position?: { x: number; y: number; z: number } }>()
  const lastEnter = new Map<string, number>()
  const joining = new Set<string>()
  let reportedPreviewPosition = false
  const previewPositions = new Map<string, { position: { x: number; y: number; z: number }; at: number }>()
  const missingSince = new Map<string, number>()
  let accumulated = 0, snapshotClock = 0, profileClock = 0, saveClock = 0, boardingClock = 0

  function refreshIdentities(): void {
    identities.clear()
    for (const [entity, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
      const t = Transform.getOrNull(entity)
      const address = identity.address.toLowerCase()
      const preview = previewPositions.get(address)
      const position = t?.position ?? (preview && arena.time - preview.at < 1.5 ? preview.position : undefined)
      identities.set(address, { guest: identity.isGuest, position })
    }
  }
  function notice(address: string, message: string): void {
    void room.send('notice', { message }, { to: [address] })
  }
  function sendProfile(address: string): void {
    const profile = store.profile(address)
    if (profile) void room.send('profile', profile, { to: [address] })
  }

  function lesson(address: string, bit: number): void {
    if (store.lesson(address, bit)) {
      sendProfile(address)
      console.log('[SERVER] Tutorial lesson:', address, bit)
    }
  }
  registerGuide(store, address => {
    refreshIdentities()
    const fish = arena.getMount(address)
    return fish && fish.boardState !== 0 ? undefined : identities.get(address)?.position
  }, sendProfile)

  async function admitPlayer(address: string, guest: boolean): Promise<void> {
    if (joining.has(address)) return
    joining.add(address)
    try {
      if (!await store.load(address, guest)) {
        notice(address, 'Your collection could not be loaded. Please wait; we will retry safely.')
        return
      }
      if (!identities.has(address)) return
      sendProfile(address)
      boarding.join(address)
      boarding.update(identities)
      boarding.status(address)
    } finally {
      joining.delete(address)
    }
  }

  // The localhost headless preview can see a player identity before it receives an avatar Transform.
  // This handler is never registered on published scenes, where proximity uses engine positions.
  if (localPreview) room.onMessage('localPreviewPosition', (position, context) => {
    const address = context?.from.toLowerCase()
    if (!address || !identities.has(address)
      || ![position.x, position.y, position.z].every(value => Number.isFinite(value) && Math.abs(value) < 4096)) return
    if (!identities.get(address)?.position && !reportedPreviewPosition) {
      reportedPreviewPosition = true
      console.log('[SERVER] Local preview position fallback active.')
    }
    previewPositions.set(address, { position, at: arena.time })
  })

  room.onMessage('hello', (_, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    refreshIdentities()
    const identity = identities.get(address)
    if (identity) void admitPlayer(address, identity.guest)
  })
  room.onMessage('board', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    if (arena.time - (lastEnter.get(address) ?? -10) < 0.5) return
    lastEnter.set(address, arena.time)
    refreshIdentities()
    const player = identities.get(address)?.position, fish = arena.getMount(address)
    if (!player || !fish || fish.id !== data.fishId || fish.boardState !== 0) return
    if (!withinBoardingRange(player, fish, 0.5)) {
      notice(address, 'Walk onto the dock beside your Clownfish, then press E.'); return
    }
    arena.beginBoarding(address, fish.id)
  })
  room.onMessage('seated', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    const fish = arena.getMount(address)
    if (!fish || fish.id !== data.fishId || fish.boardState !== 1) return
    refreshIdentities()
    const player = identities.get(address)?.position
    if (!player || Math.hypot(player.x - fish.x, player.z - fish.z) > 1.1
      || Math.abs(player.y - fishSeatY(fish)) > 0.7) return
    if (arena.finishBoarding(address, fish.id, store.needsFirstCatch(address))) {
      store.start(address, fish.mass)
      lesson(address, TUTORIAL_RIDE)
      sendProfile(address)
    }
  })
  function sendDockReady(address: string): void {
    const fish = arena.getMount(address)
    if (fish?.boardState === 3 && fish.dockLanding) {
      void room.send('dockReady', { fishId: fish.id, ...fish.dockLanding }, { to: [address] })
    }
  }
  room.onMessage('dock', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    const fish = arena.getMount(address)
    if (!fish || fish.id !== data.fishId) return
    if (fish.boardState === 3) { sendDockReady(address); return }
    if (fish.boardState !== 2) return
    refreshIdentities()
    const player = identities.get(address)?.position
    if (!player) return
    const landing = nearestDockLanding(player, 5)
    if (!landing || player.y < SEA_Y - 0.75 || player.y > SEA_Y + 4) {
      notice(address, 'Swim beside the dock and press E to step off.'); return
    }
    const slot = boarding.parkingSlot(address)
    if (slot === undefined) { notice(address, 'All fish parking slots are occupied. Please wait beside the dock.'); return }
    if (arena.beginDocking(address, slot, landing)) sendDockReady(address)
  })
  room.onMessage('docked', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase(), fish = arena.getMount(address)
    if (!fish || fish.id !== data.fishId || fish.boardState !== 3 || !fish.dockLanding) return
    refreshIdentities()
    const p = identities.get(address)?.position, landing = fish.dockLanding
    if (!p || Math.hypot(p.x - landing.x, p.z - landing.z) > 1.25 || Math.abs(p.y - landing.y) > 0.8) return
    if (arena.finishDocking(address)) {
      lesson(address, TUTORIAL_DOCK)
      store.end(address, 'Your fish is safely parked. Press E beside it to ride again.')
      sendProfile(address); boarding.status(address)
    }
  })
  room.onMessage('leave', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase(), fish = arena.getMount(address)
    if (fish?.id === data.fishId && fish.boardState === 2) arena.leave(address)
  })

  room.onMessage('jump', (data, context) => {
    if (context) arena.jump(context.from.toLowerCase(), data.fishId)
  })

  room.onMessage('sharkTouch', (data, context) => {
    if (context) arena.confirmSharkContact(context.from.toLowerCase(), data)
  })

  engine.addSystem(dt => {
    refreshIdentities()
    for (const [address, player] of identities) if (player.position) arena.observe(address, player.position)
    accumulated = Math.min(accumulated + dt, 0.25)
    while (accumulated >= 0.05) { arena.step(0.05); accumulated -= 0.05 }
    for (const event of arena.events.splice(0)) {
      if (event.type === 'eaten') {
        void room.send('eaten', { eventId: event.eventId, byShark: event.byShark }, { to: [event.owner] })
      }
      if (event.type === 'growth') store.grow(event.owner, event.mass)
      if (event.type === 'powerup') {
        lesson(event.owner, event.grant.kind === SPEED_POWERUP ? TUTORIAL_SPEED : TUTORIAL_SHIELD)
        void room.send('powerup', event.grant, { to: [event.owner] })
      }
      if (event.type === 'pickup') {
        if (event.pickup.kind === 0) lesson(event.owner, TUTORIAL_FOOD)
        const cashTotal = store.collectCash(event.owner, event.pickup.value)
        void room.send('pickup', { ...event.pickup, cashTotal }, { to: [event.owner] })
      }
      if (event.type === 'catch') {
        const fresh = store.catch(event.owner, event.species, event.mass)
        lesson(event.owner, TUTORIAL_FISH)
        if (fresh) notice(event.owner, 'Discovered: ' + SPECIES[event.species].name + '!')
        sendProfile(event.owner)
      }
      if (event.type === 'end') {
        store.end(event.owner, event.reason)
        sendProfile(event.owner)
        void store.flush(event.owner)
      }
    }
    boardingClock += dt
    if (boardingClock >= 0.1) { boardingClock %= 0.1; boarding.update(identities) }
    snapshotClock += dt; profileClock += dt; saveClock += dt
    if (snapshotClock >= 0.1) {
      snapshotClock %= 0.1
      void room.send('snapshot', arena.snapshot())
    }
    if (profileClock >= 1) {
      profileClock = 0
      refreshIdentities()
      // Player identity is enough to load the profile and reserve a berth.
      // Movement and proximity still use the engine's player transform.
      for (const [address, player] of identities) {
        if (!store.players.has(address) || missingSince.has(address)) void admitPlayer(address, player.guest)
      }
      for (const address of previewPositions.keys()) if (!identities.has(address)) previewPositions.delete(address)
      for (const address of store.players.keys()) {
        if (identities.has(address)) { missingSince.delete(address); sendProfile(address); boarding.status(address); sendDockReady(address) }
        else {
          if (!missingSince.has(address)) missingSince.set(address, arena.time)
          if (arena.time - missingSince.get(address)! > 3) {
            boarding.remove(address)
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
  console.log('[SERVER] Ride A Fish ready: 10 riders, 10 protected dock berths, 8 static NPCs, 1 shark, 60 foods, native camera.')
}
