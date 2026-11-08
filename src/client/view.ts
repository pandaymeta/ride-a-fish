import { FISH_SWIM_CLIP } from '../shared/fishAssets'
import { Animator, AvatarAnchorPointType, AvatarAttach, EngineInfo, engine, Entity, GltfContainer, InputAction, inputSystem, Material,
  MeshRenderer, PlayerIdentityData, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { ARENA_MAX_PLAYER_Y, PLAYER_SKINS, SEA_Y, SPECIES } from '../shared/config'
import { isShark } from '../shared/shark'
import type { SharkTouch } from '../shared/messages'
import { SharkMotion } from './sharkMotion'
import { fishBodyScale, fishWaterHeight, riderSeatOffsetY } from '../shared/fishGeometry'
import { fishInEatingContact } from '../shared/eating'
import { NPC_SLOTS } from '../shared/npcs'
import { areaAtPoint } from '../shared/areaBalance'
import { ArenaSnapshot, FishState, FoodState, room } from '../shared/messages'
import { createFishNumber, NPC_NUMBER_DISTANCE, NUMBER_UPDATE_INTERVAL, PlayerFishNumbers, updateFishNumber } from './fishNumbers'
import { FishMount } from './fishMount'
import { FishWaveMotion } from './fishWaveMotion'
import { FishJump } from './fishJump'
import { NpcRarityBadge } from './npcRarityBadge'
import { PickupPrediction } from './pickupPrediction'
import type { LocalPickup } from './pickupPrediction'
import type { LocalPowerControls } from './powerups'
import { FishPowerEffects } from './fishPowerEffects'
import { FishPowerBadges } from './fishPowerBadges'
import { FishWaterEffects } from './fishWaterEffects'

const FOOD_MATERIAL = {
  albedoColor: { r: 101 / 255, g: 235 / 255, b: 53 / 255, a: 1 },
  castShadows: false, metallic: 0, roughness: 0.55, specularIntensity: 0.2, emissiveIntensity: 0
}
const REMOTE_RIDER_ATTACH_DISTANCE = 8
const REMOTE_RIDER_DETACH_DISTANCE = 12
// Unity Explorer places the position anchor 0.75 m below the avatar root.
const AVATAR_POSITION_ANCHOR_LIFT = 0.75

interface FishView {
  root: Entity; body: Entity; waveMotion?: FishWaveMotion; jump?: FishJump; sharkMotion?: SharkMotion; powerEffects?: FishPowerEffects; waterEffects?: FishWaterEffects; label?: Entity; rarityBadge?: NpcRarityBadge; scale: number; state: FishState
  authored: boolean; moving: boolean; animationSpeed: number; npcPlaying?: boolean
  attached: boolean; lastX: number; lastZ: number; movingUntil: number
  riderAnchor?: { entity: Entity; lift?: number }
}

export class ArenaView {
  readonly fish = new Map<number, FishView>()
  private food = new Map<number, Entity>()
  private foodPool: Entity[] = []
  private confirmedFood = new Map<number, number>()
  private confirmedFish = new Map<number, number>()
  private foodTargets: FoodState[] = []
  private npcTargets: FishState[] = []
  private confirmedMass = 0
  private npcPickupPosition = (fish: FishState): { x: number; z: number } => {
    const view = this.fish.get(fish.id)
    return view && isShark(fish) ? Transform.get(view.root).position : fish
  }
  private prediction = new PickupPrediction((kind, id, visible) => this.pickupVisibility(kind, id, visible),
    pickup => this.contact(pickup))
  private playerNumbers = new PlayerFishNumbers()
  private powerBadges = new FishPowerBadges()
  private numberClock = 0
  private mount?: FishMount
  private mountedFish?: number
  private sharkId?: number
  private populationLogged = false

  constructor(private contact: (pickup: LocalPickup) => void = () => {},
    private readonly localSplash?: (landing: boolean) => void) {
    FishPowerEffects.preload()
    NpcRarityBadge.preload()
  }

  tutorialAvailable(kind: 'food' | 'fish', id: number): boolean {
    const entity = kind === 'food' ? this.food.get(id) : this.fish.get(id)?.root
    return entity !== undefined && (VisibilityComponent.getOrNull(entity)?.visible ?? true)
  }

  get localFishPosition(): Vector3 | undefined {
    return this.mount ? Transform.get(this.mount.root).position : undefined
  }

  localSharkContact(id: number | undefined): Omit<SharkTouch, 'tick'> | undefined {
    const rider = id === undefined ? undefined : this.fish.get(id)
    const shark = this.sharkId === undefined ? undefined : this.fish.get(this.sharkId)
    if (!rider || !shark || !this.localRiderSeated || !rider.state.owner) return
    if (shark.state.mass <= rider.state.mass || rider.state.shield > 0 || (rider.state.powerShield ?? 0) > 0) return
    const r = Transform.get(rider.root), s = Transform.get(shark.root)
    const yaw = (q: Quaternion) => Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.x * q.x + q.y * q.y))
    const pose = (t: typeof r) => ({ ...t.position, qx: t.rotation.x, qy: t.rotation.y, qz: t.rotation.z, qw: t.rotation.w })
    const sharkPose = pose(s), riderPose = pose(r)
    const touching = fishInEatingContact({ ...shark.state, yaw: yaw(s.rotation), pose: sharkPose },
      { ...rider.state, yaw: yaw(r.rotation), pose: riderPose })
    return touching ? { eater: shark.state.id, prey: rider.state.id, sharkPose, riderPose } : undefined
  }

  sharkContactDiagnostics(id: number | undefined): unknown {
    const rider = id === undefined ? undefined : this.fish.get(id)
    const shark = this.sharkId === undefined ? undefined : this.fish.get(this.sharkId)
    if (!rider || !shark) return { available: false }
    const r = Transform.get(rider.root), s = Transform.get(shark.root)
    const yaw = (q: Quaternion) => Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.x * q.x + q.y * q.y))
    const predator = { ...shark.state, x: s.position.x, z: s.position.z, yaw: yaw(s.rotation) }
    const prey = { ...rider.state, x: r.position.x, z: r.position.z, yaw: yaw(r.rotation) }
    return { available: true, visibleHeadContact: fishInEatingContact(predator, prey),
      shark: { x: predator.x, z: predator.z, yaw: predator.yaw }, fish: { x: prey.x, z: prey.z } }
  }

  get localRiderSeated(): boolean { return this.mount?.isSeated ?? false }
  get awaitingMovementRelease(): boolean { return this.mount?.awaitingMovementRelease ?? false }
  get mountFailed(): boolean { return this.mount?.failed ?? false }

  waitForLocalFishSeat(id: number, recheck = false): Promise<boolean> {
    return this.mountedFish === id && this.mount ? this.mount.waitForSeat(recheck) : Promise.resolve(false)
  }

  mountLocalFish(id: number, onReseated: () => void): Vector3 {
    this.prediction.clear()
    this.confirmedMass = 0
    const view = this.fish.get(id)
    if (!view || view.authored) throw new Error('Player fish is not ready.')
    this.mount?.dispose()
    this.clearRiderAnchor(view)
    const t = Transform.getMutable(view.root)
    t.parent = engine.RootEntity
    t.position = Vector3.create(view.state.x, fishWaterHeight(view.state, view.scale), view.state.z)
    t.rotation = Quaternion.fromEulerDegrees(0, view.state.yaw * 180 / Math.PI, 0)
    view.attached = false
    this.mountedFish = id
    view.jump?.reset()
    this.mount = new FishMount(view.root, () => PLAYER_SKINS[view.state.skin].height * view.scale,
      () => Math.max(0.9, view.scale * 0.7 + 0.1), onReseated, () => view.state.mass)
    return this.mount.position
  }

  get localFishAirborne(): boolean {
    return this.mountedFish !== undefined && !!this.fish.get(this.mountedFish)?.jump?.airborne
  }

  pauseLocalFish(): Promise<void> { return this.mount?.suspend() ?? Promise.resolve() }

  releaseLocalFish(id: number, hide = true): Promise<void> {
    let settled = Promise.resolve()
    this.prediction.clear()
    this.confirmedMass = 0
    if (this.mountedFish === id) { settled = this.mount?.dispose() ?? settled; this.mount = undefined; this.mountedFish = undefined }
    const view = this.fish.get(id)
    if (!view || view.authored) return settled
    VisibilityComponent.createOrReplace(view.root, { visible: !hide })
    view.jump?.reset()
    const transform = Transform.getMutable(view.root)
    transform.parent = engine.RootEntity
    transform.position = Vector3.create(view.state.x, fishWaterHeight(view.state, view.scale), view.state.z)
    view.attached = false
    return settled
  }

  confirmPickup(kind: number, target: number, tick: number, mass = 0): void {
    this.prediction.confirm(kind, target)
    this.confirmedMass = Math.max(this.confirmedMass, mass)
    if (kind === 0) {
      this.confirmedFood.set(target, tick)
      this.foodTargets = this.foodTargets.filter(food => food.id !== target)
      const entity = this.food.get(target)
      if (entity !== undefined) { engine.removeEntity(entity); this.food.delete(target) }
    } else {
      this.confirmedFish.set(target, tick)
      this.npcTargets = this.npcTargets.filter(fish => fish.id !== target)
      const view = this.fish.get(target)
      if (view?.authored) {
        view.waterEffects?.dispose()
        this.setNpcAnimation(view, false)
        VisibilityComponent.createOrReplace(view.root, { visible: false })
        view.rarityBadge?.dispose()
        if (view.label !== undefined) engine.removeEntity(view.label)
        this.fish.delete(target)
      }
    }
  }

  apply(snapshot: ArenaSnapshot, keepFish?: number): void {
    if (!this.populationLogged && snapshot.food.length > 0) {
      this.populationLogged = true
      console.log('[AREA SUPPLY]', JSON.stringify(Array.from({ length: 6 }, (_, area) => ({
        area,
        fish: [0, 1, 2].map(species => snapshot.fish.filter(f => !f.owner && f.species === species && areaAtPoint(f) === area).length),
        food: snapshot.food.filter(f => areaAtPoint(f) === area).length,
        shield: snapshot.powerups?.filter(p => p.kind === 0 && areaAtPoint(p) === area).length ?? 0,
        speed: snapshot.powerups?.filter(p => p.kind === 1 && areaAtPoint(p) === area).length ?? 0
      }))))
    }
    for (const [id, tick] of this.confirmedFood) if (snapshot.tick >= tick) this.confirmedFood.delete(id)
    for (const [id, tick] of this.confirmedFish) if (snapshot.tick >= tick) this.confirmedFish.delete(id)
    const fishStates = snapshot.fish.filter(f => !this.confirmedFish.has(f.id))
    const foodStates = snapshot.food.filter(f => !this.confirmedFood.has(f.id))
    const present = new Set(fishStates.map(f => f.id))
    const foodIds = new Set(foodStates.map(f => f.id))
    this.foodTargets = foodStates
    this.npcTargets = fishStates.filter(f => !f.owner)
    this.prediction.reconcile(foodIds, present)
    for (const [id, view] of this.fish) {
      if (!present.has(id) && id !== keepFish) {
        view.rarityBadge?.dispose()
        view.powerEffects?.dispose()
        view.waterEffects?.dispose()
        if (view.authored) {
          this.setNpcAnimation(view, false)
          VisibilityComponent.createOrReplace(view.root, { visible: false })
          if (view.label !== undefined) engine.removeEntity(view.label)
        } else {
          if (view.label !== undefined) engine.removeEntity(view.label)
          engine.removeEntity(view.body)
          if (view.riderAnchor) engine.removeEntity(view.riderAnchor.entity)
          engine.removeEntity(view.root)
        }
        this.fish.delete(id)
      }
    }
    for (const state of fishStates) {
      const current = this.fish.get(state.id)
      if (current) {
        current.moving = Math.hypot(state.x - current.state.x, state.z - current.state.z) > 0.015
        current.state = state
        current.jump?.sync(state.jumpTick ?? 0, snapshot.tick)
        current.sharkMotion?.push(snapshot.tick, state)
      } else {
        const view = this.createFish(state, snapshot.tick)
        if (view) this.fish.set(state.id, view)
      }
    }
    for (const [id, entity] of this.food) {
      if (!foodIds.has(id)) {
        VisibilityComponent.createOrReplace(entity, { visible: false })
        this.foodPool.push(entity); this.food.delete(id)
      }
    }
    for (const food of foodStates) {
      if (this.food.has(food.id)) continue
      const pooled = this.foodPool.pop()
      const entity = pooled ?? engine.addEntity()
      const size = areaAtPoint(food) === 1 ? 0.72 : 0.48
      const position = Vector3.create(food.x, SEA_Y + size / 4, food.z)
      const scale = Vector3.create(size, size, size)
      if (pooled !== undefined) {
        const transform = Transform.getMutable(entity)
        transform.position = position
        transform.scale = scale
      }
      else {
        Transform.create(entity, { position, scale })
        MeshRenderer.setSphere(entity)
        Material.setPbrMaterial(entity, FOOD_MATERIAL)
      }
      VisibilityComponent.createOrReplace(entity, { visible: true })
      this.food.set(food.id, entity)
    }
  }

  update(dt: number, myMass: number, myFishId?: number, followPlayer = false, predictPickups = followPlayer, localPower?: LocalPowerControls): void {
    this.mount?.update(dt, localPower?.speedMultiplier ?? 1, followPlayer && predictPickups)
    const alpha = 1 - Math.exp(-dt * 14)
    const playerStates: FishState[] = []
    this.numberClock += dt
    const updateNumbers = this.numberClock >= NUMBER_UPDATE_INTERVAL
    if (updateNumbers) this.numberClock = 0
    const camera = Transform.getOrNull(engine.CameraEntity)?.position
    const local = Transform.getOrNull(engine.PlayerEntity)?.position
    if (predictPickups && followPlayer && this.localRiderSeated && myFishId !== undefined && local && local.y <= ARENA_MAX_PLAYER_Y) {
      const mine = this.fish.get(myFishId)
      const position = mine && this.mount && this.mountedFish === myFishId ? Transform.get(mine.root).position : local
      this.prediction.update(dt, position, Math.max(myMass, this.confirmedMass), this.foodTargets, this.npcTargets, this.npcPickupPosition)
    } else this.prediction.clear()
    const waveTime = Date.now() * 0.001
    const sceneVisible = !EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden
    const remotePlayers = new Map<string, { position: Vector3; rotation: Quaternion }>()
    for (const [entity, identity, transform] of engine.getEntitiesWith(PlayerIdentityData, Transform)) {
      if (entity !== engine.PlayerEntity) remotePlayers.set(identity.address.toLowerCase(), transform)
    }
    this.powerBadges.beginFrame()
    for (const [id, view] of this.fish) {
      const boosting = id === myFishId ? !!localPower?.boosting : (view.state.boost ?? 0) > 0
      const rider = view.state.owner && view.state.boardState === 2 && id !== myFishId && id !== this.mountedFish
        ? remotePlayers.get(view.state.owner.toLowerCase()) : undefined
      const remotePosition = rider?.position
      // The avatar can return to shore before its fish's final snapshot arrives.
      const range = view.riderAnchor?.lift === undefined ? REMOTE_RIDER_ATTACH_DISTANCE : REMOTE_RIDER_DETACH_DISTANCE
      const riderPosition = remotePosition && remotePosition.y >= SEA_Y - 0.75 && remotePosition.y <= ARENA_MAX_PLAYER_Y
        && Math.hypot(remotePosition.x - view.state.x, remotePosition.z - view.state.z) < range
        ? remotePosition : undefined
      if (!riderPosition) this.clearRiderAnchor(view)
      if (!view.authored) {
        view.scale += (fishBodyScale(view.state) - view.scale) * (1 - Math.exp(-dt * 4))
        const swimHeight = fishWaterHeight(view.state, view.scale)
        const t = Transform.getMutable(view.root)
        if (id === this.mountedFish && this.mount) {
          view.moving = this.mount.moving
        } else if (id === myFishId && followPlayer && Transform.has(engine.PlayerEntity)) {
          const position = Transform.get(engine.PlayerEntity).position
          if (Math.hypot(position.x - view.lastX, position.z - view.lastZ) > 0.001) view.movingUntil = Date.now() + 140
          view.lastX = position.x; view.lastZ = position.z
          view.moving = Date.now() < view.movingUntil
          if (!view.attached) {
            t.parent = engine.PlayerEntity
            t.position = Vector3.create(0, swimHeight - position.y, 0)
            t.rotation = Quaternion.Identity()
            view.attached = true
          } else if (Math.abs(t.position.y - (swimHeight - position.y)) > 0.001) t.position.y = swimHeight - position.y
        } else {
          if (!riderPosition) {
            t.position.x += (view.state.x - t.position.x) * alpha
            t.position.z += (view.state.z - t.position.z) * alpha
          }
          const heading = riderPosition && rider && view.riderAnchor?.lift !== undefined
            ? rider.rotation : Quaternion.fromEulerDegrees(0, view.state.yaw * 180 / Math.PI, 0)
          t.rotation = Quaternion.slerp(t.rotation, heading, alpha)
        }
        if (!view.attached && Math.abs(t.position.y - swimHeight) > 0.001) t.position.y = swimHeight
        if (Math.abs(Transform.get(view.body).scale.y - view.scale) > 0.0001) {
          Transform.getMutable(view.body).scale = Vector3.create(view.scale, view.scale, view.scale)
        }
        // One clip continues without resetting its cursor when speed changes.
        // Player animations stay active at every distance.
        const speed = view.moving ? boosting ? 1.45 : 1 : 0.45
        if (speed !== view.animationSpeed) {
          Animator.getMutable(view.body).states[0].speed = speed
          view.animationSpeed = speed
        }
      } else {
        if (isShark(view.state)) {
          const t = Transform.getMutable(view.root)
          const pose = view.sharkMotion!.sample(dt)
          t.position.x = pose.x; t.position.z = pose.z
          t.position.y = fishWaterHeight(view.state, t.scale.y)
          t.rotation = Quaternion.fromEulerDegrees(0, pose.yaw * 180 / Math.PI, 0)
          const targetScale = fishBodyScale(view.state)
          if (Math.abs(t.scale.y - targetScale) > 0.001) {
            const scale = t.scale.y + (targetScale - t.scale.y) * (1 - Math.exp(-dt * 4))
            t.scale = Vector3.create(scale, scale, scale)
          }
        }
        view.scale = Transform.get(view.body).scale.y
        if (updateNumbers) {
          const position = Transform.get(view.root).position
          const range = view.npcPlaying ? 36 : 30
          // The shark always animates; only stationary collectible NPCs pause at a distance.
          const playing = (isShark(view.state) || (sceneVisible && !!camera
            && Vector3.distanceSquared(camera, position) < range * range))
            && (VisibilityComponent.getOrNull(view.root)?.visible ?? true)
            && !this.prediction.hidden(1, id)
          this.setNpcAnimation(view, playing)
        }
      }
      const localMount = id === this.mountedFish && !!this.mount
      const jumpReady = localMount && followPlayer && predictPickups && this.localRiderSeated && !this.mount!.awaitingMovementRelease
      if (view.jump?.update(dt, jumpReady, localMount && inputSystem.isPressed(InputAction.IA_JUMP))) {
        void room.send('jump', { fishId: id })
      }
      const jumpHeight = view.jump?.height ?? 0
      if (view.waveMotion) {
        const ready = view.state.boardState === 2 && (localMount ? followPlayer && predictPickups && this.localRiderSeated : !view.attached)
        const moving = isShark(view.state) || view.moving
        const bodyHeight = (view.state.owner ? PLAYER_SKINS[view.state.skin].height : SPECIES[view.state.species].height) * view.scale
        const tilt = view.waveMotion.update(view.root, fishWaterHeight(view.state, view.scale), waveTime, dt,
          moving, boosting, ready, bodyHeight,
          localMount ? this.mount!.steering : 0, jumpHeight, view.jump?.velocity ?? 0, view.jump?.airborne ?? false)
        if (riderPosition) {
          const seatOffset = riderSeatOffsetY(bodyHeight)
          // Wake and badge systems use the scene-space pose. The visible mesh follows the renderer.
          const pose = Transform.getMutable(view.root)
          const offset = Vector3.rotate(Vector3.create(0, seatOffset, 0), pose.rotation)
          pose.position = Vector3.subtract(riderPosition, offset)
          if (local) this.updateRiderAnchor(view, riderPosition, local, seatOffset, tilt)
        }
      }
      if (view.waterEffects) {
        const height = view.state.owner ? PLAYER_SKINS[view.state.skin].height : SPECIES[view.state.species].height
        const visible = view.state.boardState === 2 && sceneVisible && (id !== myFishId || followPlayer)
          && (VisibilityComponent.getOrNull(view.root)?.visible ?? true) && !this.prediction.hidden(1, id)
        const fast = boosting || (isShark(view.state) && (view.state.motion ?? 0) > 0)
        view.waterEffects.update(dt, height * view.scale, fast, visible, camera, jumpHeight,
          jumpReady ? this.localSplash : undefined)
      }
      if (view.powerEffects) {
        const shielded = (view.state.powerShield ?? 0) > 0 || (id === myFishId && !!localPower?.shieldPreview)
        view.powerEffects.update(shielded, boosting)
        if (sceneVisible && (id !== myFishId || followPlayer)
          && (VisibilityComponent.getOrNull(view.root)?.visible ?? true)) {
          const shieldSeconds = Math.max(view.state.powerShield ?? 0, id === myFishId && localPower?.shieldPreview ? 30 : 0)
          this.powerBadges.show(view.root, shieldSeconds, view.state.boost ?? 0, view.scale, id === myFishId)
        }
      }
      if (view.state.owner) {
        if (view.state.boardState === 2 && (id !== myFishId || followPlayer)) playerStates.push(view.state)
      } else if (view.label !== undefined && updateNumbers && camera && local && !this.prediction.hidden(1, id)) {
        const position = Transform.get(view.root).position
        const size = updateFishNumber(view.label, view.state.mass, myMass,
          Vector3.distance(camera, position), Vector3.distance(local, position), NPC_NUMBER_DISTANCE, view.scale)
        const height = SPECIES[view.state.species].height
        Transform.getMutable(view.label).position.y = height / 2 + (0.25 + size * 1.15) / view.scale
        view.rarityBadge?.update(view.label, size, view.scale, height)
      }
    }
    this.powerBadges.endFrame()
    this.playerNumbers.update(dt, playerStates, myMass)
  }

  private updateRiderAnchor(view: FishView, rider: Vector3, observer: Vector3, seatOffset: number, tilt: Quaternion): void {
    if (!view.riderAnchor) {
      const entity = engine.addEntity()
      Transform.create(entity, { position: Vector3.create(0, -1024, 0) })
      AvatarAttach.create(entity, { avatarId: view.state.owner, anchorPointId: AvatarAnchorPointType.AAPT_POSITION })
      view.riderAnchor = { entity }
    }
    const anchor = view.riderAnchor
    if (anchor.lift === undefined) {
      // Wait for the renderer to resolve the attachment before moving the model to it.
      const rendered = Vector3.add(observer, Transform.get(anchor.entity).position)
      if (Math.hypot(rendered.x - rider.x, rendered.z - rider.z) > 2) return
      const lift = rider.y - rendered.y
      if (Math.abs(lift - AVATAR_POSITION_ANCHOR_LIFT) < 0.25) anchor.lift = AVATAR_POSITION_ANCHOR_LIFT
      else if (Math.abs(lift) < 0.25) anchor.lift = 0
      else return
    }
    const offset = Vector3.rotate(Vector3.create(0, -seatOffset, 0), tilt)
    offset.y += anchor.lift
    const current = Transform.get(view.body)
    if (current.parent === anchor.entity && Vector3.distanceSquared(current.position, offset) < 0.000001
      && Math.abs(current.rotation.x - tilt.x) < 0.0005 && Math.abs(current.rotation.y - tilt.y) < 0.0005
      && Math.abs(current.rotation.z - tilt.z) < 0.0005 && Math.abs(current.rotation.w - tilt.w) < 0.0005) return
    const body = Transform.getMutable(view.body)
    body.parent = anchor.entity
    body.position = offset
    body.rotation = tilt
  }

  private clearRiderAnchor(view: FishView): void {
    if (!view.riderAnchor) return
    if (view.riderAnchor.lift !== undefined) {
      const body = Transform.getMutable(view.body)
      body.parent = view.root
      body.position = Vector3.Zero()
      body.rotation = Quaternion.Identity()
    }
    engine.removeEntity(view.riderAnchor.entity)
    view.riderAnchor = undefined
  }

  private pickupVisibility(kind: number, id: number, visible: boolean): void {
    if (kind === 0) {
      const entity = this.food.get(id)
      if (entity !== undefined) VisibilityComponent.createOrReplace(entity, { visible })
      return
    }
    const view = this.fish.get(id)
    if (!view?.authored) return
    VisibilityComponent.createOrReplace(view.root, { visible })
    if (!visible) this.setNpcAnimation(view, false)
    if (!visible) {
      if (view.label !== undefined) VisibilityComponent.createOrReplace(view.label, { visible: false })
      view.rarityBadge?.hide()
    }
  }

  private setNpcAnimation(view: FishView, playing: boolean): void {
    const speed = isShark(view.state) ? (view.state.motion ?? 0) > 0 ? 1.35 : 1 : 0.55
    if (view.npcPlaying === playing && view.animationSpeed === speed) return
    const animator = Animator.getMutableOrNull(view.body)
    const animation = animator?.states.find(state => state.clip === FISH_SWIM_CLIP)
    if (!animation) return
    animation.playing = playing; animation.speed = speed
    view.npcPlaying = playing; view.animationSpeed = speed
  }

  private createFish(state: FishState, tick: number): FishView | undefined {
    const authored = !state.owner
    let root: Entity, body: Entity
    const scale = fishBodyScale(state)
    if (authored) {
      const entity = engine.getEntityOrNullByName(NPC_SLOTS[state.slot]?.name ?? '')
      if (entity === null || !Transform.has(entity)) return
      root = body = entity
      // Reuse the authored model while its live position comes from the server.
      const transform = Transform.getMutable(root)
      transform.position.x = state.x; transform.position.z = state.z
      if (isShark(state)) {
        transform.scale = Vector3.create(scale, scale, scale)
        transform.position.y = fishWaterHeight(state, scale)
      }
      transform.rotation = Quaternion.fromEulerDegrees(0, state.yaw * 180 / Math.PI, 0)
      VisibilityComponent.createOrReplace(root, { visible: true })
    } else {
      root = engine.addEntity()
      Transform.create(root, { position: Vector3.create(state.x, fishWaterHeight(state, scale), state.z),
        rotation: Quaternion.fromEulerDegrees(0, state.yaw * 180 / Math.PI, 0) })
      body = engine.addEntity()
      Transform.create(body, { parent: root, scale: Vector3.create(scale, scale, scale) })
      GltfContainer.create(body, { src: PLAYER_SKINS[state.skin].model, visibleMeshesCollisionMask: 0,
        invisibleMeshesCollisionMask: 0 })
    }
    const animationSpeed = authored ? isShark(state) ? 1 : 0.55 : 0.45
    Animator.createOrReplace(body, { states: [{ clip: FISH_SWIM_CLIP, playing: true, loop: true,
      speed: animationSpeed, weight: 1, shouldReset: false }] })
    let label: Entity | undefined
    let rarityBadge: NpcRarityBadge | undefined
    if (authored) {
      label = engine.addEntity()
      Transform.create(label, { parent: root, position: Vector3.create(0, 2, 0) })
      createFishNumber(label)
      rarityBadge = new NpcRarityBadge(root, SPECIES[state.species].rarity)
    }
    if (isShark(state)) this.sharkId = state.id
    const waveMotion = !authored || isShark(state) ? new FishWaveMotion() : undefined
    const jump = state.owner ? new FishJump() : undefined
    jump?.sync(state.jumpTick ?? 0, tick)
    const sharkMotion = isShark(state) ? new SharkMotion() : undefined
    sharkMotion?.push(tick, state)
    const powerEffects = authored ? undefined : new FishPowerEffects(body)
    const waterEffects = !authored || isShark(state) ? new FishWaterEffects(root) : undefined
    return { root, body, waveMotion, jump, sharkMotion, powerEffects, waterEffects, label, rarityBadge, state, scale, authored, moving: false, animationSpeed,
      attached: false, lastX: state.x, lastZ: state.z, movingUntil: 0 }
  }
}
