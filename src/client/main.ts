import { MovementHints } from './movementHints'
import { TUTORIAL_COMPLETE } from '../shared/tutorial'
import { TutorialClient } from './tutorial'
import { BOARDING_SPOTS } from '../shared/boarding'
import { DockDisembark } from './dockDisembark'
import { DockBoarding } from './dockBoarding'
import { insideLobbyIsland } from '../shared/lobbyIsland'
import { engine, Transform } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/src/players'
import { isStateSyncronized } from '@dcl/sdk/network'
import { COLLECTIBLE_SPECIES, collectedSpeciesCount, onPlatform, SEA_Y, SPECIES, STAGE } from '../shared/config'
import { ArenaSnapshot, PlayerProfile, room } from '../shared/messages'
import { setupUi } from '../ui'
import { actions } from './state'
import { state } from '../ui/RideHud'
import { FishForm } from './fishForm'
import { ArenaView } from './view'
import { PickupEffects } from './pickupEffects'
import { PowerupClient } from './powerups'
import { EatenSound } from './eatenSound'
import { setupIndex, updateIndexProfile } from './indexPanel'
import { startOceanFoam } from './oceanFoam'
import { SandFootprints } from './sandFootprints'
import { StoolSeating } from './stoolSeating'
import { waitingForTextures } from './startupTextures'

export function startClient(): void {
  startOceanFoam()
  setupIndex()
  setupUi()
  const pickups = new PickupEffects()
  const powerups = new PowerupClient()
  const eatenSound = new EatenSound()
  const view = new ArenaView(pickup => pickups.predict(pickup))
  const form = new FishForm(view)
  let snapshot: ArenaSnapshot = { tick: 0, fish: [], food: [] }
  let profile: PlayerProfile | undefined
  let address = '', lastSnapshot = 0, helloClock = 0, inputClock = 0, enterClock = 0
  let entering = false, noticeUntil = 0
  let pendingReturn: number | undefined, failedBoarding: number | undefined
  let queuePosition = 0, seatAckClock = 0
  let dockPending = false, dockRequestedAt = 0, dockAckClock = 0
  let dockedFish: number | undefined
  let sceneReady = false
  let recoveryArmed = false, lastRecovery = 0, strandedClock = 0, sharkContactClock = 0
  const tutorial = new TutorialClient()
  const movementHints = new MovementHints()
  const stools = new StoolSeating(() => form.phase === 'lobby' && !entering && !tutorial.busy)
  new SandFootprints(() => form.phase === 'lobby' && !stools.busy)
  const dock = new DockBoarding(view, () => {
    const mine = snapshot.fish.find(f => f.owner === address)
    if (form.phase !== 'lobby' || entering || stools.busy || tutorial.interacting || !mine || mine.boardState !== 0 || Date.now() - lastSnapshot > 3500) return
    entering = true; enterClock = 0
    void room.send('board', { fishId: mine.id })
  })

  const dockExit = new DockDisembark(view, () => {
    const mine = snapshot.fish.find(f => f.owner === address)
    if (form.phase !== 'fish' || !mine || mine.boardState !== 2 || dockPending || state.indexDisplay === 'flex') return
    dockPending = true; dockRequestedAt = Date.now()
    void room.send('dock', { fishId: mine.id })
  })

  function notice(message: string): void {
    state.notice = message
    noticeUntil = Date.now() + 4500
  }
  actions.toggleIndex = () => { if (tutorial.busy) return; state.indexDisplay = state.indexDisplay === 'flex' ? 'none' : 'flex' }
  actions.returnToLobby = () => {
    stools.cancel()
    if (form.phase === 'fish' && form.fishId !== undefined) {
      pendingReturn = form.fishId
      void room.send('leave', { fishId: pendingReturn })
    }
    void form.returnToLobby()
  }
  room.onMessage('boardingStatus', data => { queuePosition = data.position })
  room.onMessage('eaten', data => {
    eatenSound.play(data.eventId)
    tutorial.queueDefeat(data.eventId, data.byShark ? 'shark' : 'player')
  })
  room.onMessage('notice', data => { entering = false; dockPending = false; notice(data.message) })
  room.onMessage('dockReady', data => {
    if (dockedFish === data.fishId) { void room.send('docked', { fishId: data.fishId }); return }
    if (form.phase !== 'fish' || form.fishId !== data.fishId) return
    dockPending = true
    state.indexDisplay = 'none'
    void form.disembark(data.fishId, { x: data.x, y: data.y, z: data.z }).then(ok => {
      if (ok) { dockedFish = data.fishId; void room.send('docked', { fishId: data.fishId }) }
      else dockPending = false
    })
  })
  room.onMessage('profile', data => {
    if (data.result && data.peak > 0 && data.result !== profile?.result) {
      notice(data.result)
      console.log('[CLIENT] Run result:', data.result)
    }
    profile = data
    tutorial.apply(data)
    updateIndexProfile(data)
    pickups.setCashBalance(data.cash)
    pickups.setCollection(data.counts)
    state.collection = 'Fish Index  ' + collectedSpeciesCount(data.counts) + ' / ' + COLLECTIBLE_SPECIES.length
    state.best = 'Personal best  ' + data.best
    state.result = data.result ? data.result + (data.peak ? '  Peak: ' + data.peak : '') : ''
    const labels = SPECIES.map((fish, i) => data.counts[i] > 0
      ? fish.name + '  ·  ' + data.counts[i] + ' caught  ·  best ' + data.largest[i]
      : '???  ·  ' + fish.hint)
    state.lime = labels[0]; state.puffer = labels[1]; state.tuna = labels[2]; state.grouper = labels[3]; state.shark = labels[4]
  })
  room.onMessage('powerup', data => {
    if (form.phase !== 'fish' || form.fishId !== data.eater) return
    powerups.confirm(data, snapshot.fish.find(f => f.id === data.eater))
  })
  room.onMessage('pickup', data => {
    pickups.setCashBalance(data.cashTotal)
    if (form.phase !== 'fish' || form.fishId !== data.eater || (data.kind !== 0 && data.kind !== 1)) return
    view.confirmPickup(data.kind, data.target, data.tick, data.mass)
    pickups.pickup(data)
  })
  room.onMessage('snapshot', data => {
    if (data.tick < snapshot.tick) return
    const mine = address ? data.fish.find(f => f.owner === address) : undefined
    if (!mine && form.phase === 'fish') console.log('[CLIENT] Fish removed:', JSON.stringify({
      snapshotGapMs: Date.now() - lastSnapshot, contact: view.sharkContactDiagnostics(form.fishId)
    }))
    snapshot = data; lastSnapshot = Date.now()
    view.apply(data, form.fishId)
    powerups.apply(data.powerups ?? [], data.tick)
    if (mine?.id !== pendingReturn || mine?.boardState !== 2) pendingReturn = undefined
    if (mine?.id !== failedBoarding || mine?.boardState === 0) failedBoarding = undefined
    if (!mine) {
      entering = false
      dockPending = false; dockedFish = undefined
      if (form.phase === 'fish' || form.phase === 'transforming' || form.phase === 'docking') {
        void form.returnToLobby()
        state.indexDisplay = 'none'
      }
    } else if (mine.boardState === 0 && dockedFish === mine.id) {
      dockedFish = undefined; dockPending = false
    } else if (mine.boardState === 1 && form.phase === 'lobby' && failedBoarding !== mine.id) {
      entering = false
      state.indexDisplay = 'none'
      void form.transform(mine.id).then(ok => {
        if (ok) void room.send('seated', { fishId: mine.id })
        else if (snapshot.fish.some(f => f.id === mine.id && f.boardState === 1)) failedBoarding = mine.id
      })
    } else if (mine.boardState === 2) {
      entering = false
      form.activate(mine.id)
    } else if (mine.boardState === 0 && form.phase === 'transforming' && form.readyToRide) {
      notice('Boarding took too long. Please try again at the dock.')
      actions.returnToLobby()
    }
  })

  engine.addSystem(dt => {
    const player = getPlayer()
    if (!player || !Transform.has(engine.PlayerEntity)) return
    address = player.userId.toLowerCase()
    // Static scene authoring is a separate editor operation; never fake missing layout in runtime code.
    sceneReady = BOARDING_SPOTS.length === 10
    const alive = Date.now() - lastSnapshot < 3500 && lastSnapshot > 0
    const mine = snapshot.fish.find(f => f.owner === address)
    const playerPosition = Transform.get(engine.PlayerEntity).position
    helloClock += dt; inputClock += dt; enterClock += dt
    if (isStateSyncronized() && helloClock >= (profile ? 5 : 1)) {
      helloClock = 0; void room.send('hello', {})
    }
    state.save = !alive ? 'The sea server is waking up…' : !profile ? 'Loading your collection…'
      : profile.guest ? 'Guest visit · collection lasts this session'
      : profile.saved ? 'Collection saved' : 'Saving your collection…'
    if (!sceneReady) { state.phase = 'Scene setup pending'; state.mass = 'Lobby and sea are being connected.'; return }
    const riding = form.phase === 'fish' && mine?.boardState === 2
    if (riding && mine) {
      state.phase = mine.shield > 0 ? 'Spawn protection  ' + Math.ceil(mine.shield) + 's' : (mine.powerShield ?? 0) > 0 ? 'Shield active · Keep collecting fish.' : 'Collect fish. Avoid the shark and bigger players.'
      state.mass = 'Fish size  ' + mine.mass
    } else {
      state.phase = form.phase === 'lobby' ? 'Island dock' : form.phase === 'transforming' ? 'Boarding your Clownfish…' : form.phase === 'docking' ? 'Stepping onto the dock…' : 'Returning to the island…'
      state.mass = 'Walk to your fish and press E to ride'
      if (entering && enterClock > 3) entering = false
    }
    if (dockPending && form.phase === 'fish' && mine?.boardState === 2 && Date.now() - dockRequestedAt > 3000) dockPending = false
    dockAckClock += dt
    if (dockedFish !== undefined && mine?.boardState === 3 && dockAckClock >= 0.5) {
      dockAckClock = 0; void room.send('docked', { fishId: dockedFish })
    }
    seatAckClock += dt
    if (form.phase === 'transforming' && form.readyToRide && mine?.boardState === 1 && seatAckClock >= 0.5) {
      seatAckClock = 0; void room.send('seated', { fishId: mine.id })
    }
    if (form.phase === 'lobby' && onPlatform(playerPosition)) recoveryArmed = true
    // Normal fish troughs stay above this. A rider below it has lost support,
    // including after a reload where the previous island-visit flag is gone.
    const deepWater = (form.phase === 'lobby' || form.phase === 'fish') && playerPosition.y < SEA_Y - 0.75
    const fellFromIsland = form.phase === 'lobby' && recoveryArmed
      && !insideLobbyIsland(playerPosition.x, playerPosition.z) && playerPosition.y < STAGE.top - 1.5
    strandedClock = form.phase !== 'returning' && (deepWater || fellFromIsland) ? strandedClock + dt : 0
    if (strandedClock >= 0.45 && Date.now() - lastRecovery > 3000) {
      strandedClock = 0; lastRecovery = Date.now(); recoveryArmed = false
      console.log('[CLIENT] Recovering stranded rider:', JSON.stringify({ phase: form.phase, position: playerPosition }))
      notice('Returning you to the island…')
      actions.returnToLobby()
    }
    if (pendingReturn !== undefined && alive && inputClock >= 1) {
      inputClock = 0; void room.send('leave', { fishId: pendingReturn })
    }
    const canInteract = alive && !!profile && !waitingForTextures()
    tutorial.update(dt, canInteract && form.phase === 'lobby' && !entering && !dockPending && !stools.busy, state.indexDisplay === 'flex')
    powerups.updateControl(dt, mine, riding, alive, state.indexDisplay === 'flex')
    view.update(dt, mine?.mass ?? 1, mine?.id, riding, riding && alive && !dockPending, powerups.controls)
    movementHints.update(canInteract && profile?.tutorialSteps !== TUTORIAL_COMPLETE, form.phase, riding, view.localRiderSeated && !view.awaitingMovementRelease,
      tutorial.busy || stools.busy || entering || dockPending || state.indexDisplay === 'flex', playerPosition, view.localFishPosition, view.localFishAirborne)
    tutorial.navigate(dt, snapshot, mine, view.localFishPosition, riding && alive,
      (kind, id) => kind === 'food' || kind === 'fish' ? view.tutorialAvailable(kind, id) : powerups.tutorialAvailable(id))
    dock.update(dt, mine, form.phase, form.readyToRide, canInteract, entering || dockPending || tutorial.interacting, queuePosition, tutorial.fishArrowUnlocked)
    dockExit.update(dt, mine, riding && alive && state.indexDisplay !== 'flex', dockPending)
    sharkContactClock += dt
    if (riding && alive && sharkContactClock >= 0.05) {
      const touching = view.localSharkContact(mine?.id)
      if (touching) {
        sharkContactClock = 0
        void room.send('sharkTouch', { ...touching, tick: snapshot.tick })
      }
    }
    if (form.phase === 'fish' && view.mountFailed) {
      notice('Unable to reseat your avatar. Please enter the arena again.')
      actions.returnToLobby()
    }
    powerups.updateContact(mine, view.localFishPosition, riding && alive && !dockPending && view.localRiderSeated)
    eatenSound.update()
    pickups.update(dt, form.phase === 'fish')
    if (Date.now() > noticeUntil) state.notice = form.phase === 'fish'
      ? view.awaitingMovementRelease ? 'Release WASD, then press again to swim.'
        : 'WASD to ride · Drag to look · Scroll to zoom · Bigger players and sharks are dangerous'
      : 'Find your Clownfish at the dock and press E. Discoveries survive each run.'
  })
  console.log('[CLIENT] Ride A Fish client ready; waiting for the sea server.')
}
