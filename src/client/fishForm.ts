import { AvatarEmoteCommand, AvatarLocomotionSettings, ColliderLayer, EmoteState, engine, Entity,
  getWorldPosition, GltfContainer, InputModifier, MainCamera, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo, stopEmote } from '~system/RestrictedActions'
import { getSceneInformation } from '~system/Runtime'
import { BOARDING_SPOTS } from '../shared/boarding'
import { SEA_Y, SPEED } from '../shared/config'
import { ArenaView } from './view'
import { playBoardingWalk, playRiderSittingPose, RIDER_SITTING_ANIMATION } from './riderPose'
import type { DockLanding } from '../shared/dockSurfaces'
import { landAtLobby } from './lobbyLanding'

const BRIDGE_COLLIDER_MODELS = new Set([
  'Wooden_Bridge_01A_Module_1.glb',
  'Wooden_Bridge_01A_Module_2-walkable.glb',
  'Wooden_Pillar_01A-walkable.glb',
  'Wooden_Pillar_02A-walkable.glb'
])
const SITTING_POSE_RETRY_MS = 500

export class FishForm {
  fishId: number | undefined
  phase: 'lobby' | 'transforming' | 'fish' | 'docking' | 'returning' = 'lobby'
  readyToRide = false
  private operation = 0
  private transition: Promise<unknown> = Promise.resolve()
  private keepSitting = false
  private needsSittingPose = false
  private sittingPoseHash?: string
  private sittingPoseRequest?: Promise<void>
  private sittingPoseRetryAt = 0
  private previousInput: ReturnType<typeof InputModifier.getOrNull> = null
  private previousLocomotion: ReturnType<typeof AvatarLocomotionSettings.getOrNull> = null

  private dockMasks = new Map<Entity, Pick<ReturnType<typeof GltfContainer.get>, 'visibleMeshesCollisionMask' | 'invisibleMeshesCollisionMask'>>()

  constructor(private view: ArenaView) {
    // Release a legacy scripted camera when hot-reloading into native swimming.
    const camera = MainCamera.getMutableOrNull(engine.CameraEntity)
    if (camera) camera.virtualCameraEntity = undefined
    void this.loadSittingPoseHash()
    AvatarEmoteCommand.onChange(engine.PlayerEntity, command => {
      if (!this.keepSitting || !command) return
      const started = (command.state ?? EmoteState.ES_STARTED) === EmoteState.ES_STARTED
      const isSceneEmote = command.emoteUrn.startsWith('urn:decentraland:off-chain:scene-emote:')
      const sitting = command.emoteUrn === RIDER_SITTING_ANIMATION || (command.loop && isSceneEmote
        && (!this.sittingPoseHash || command.emoteUrn.endsWith(`-${this.sittingPoseHash}-true`)))
      if (sitting || started) this.needsSittingPose = !sitting || !started
    })
  }

  private async loadSittingPoseHash(): Promise<void> {
    try {
      // Explorer can return scene metadata directly, while other runtimes use a Promise.
      const scene = await getSceneInformation({})
      this.sittingPoseHash = scene.content.find(asset => asset.file === RIDER_SITTING_ANIMATION)?.hash
    } catch {
      // Keep using the scene-emote fallback when metadata is unavailable.
    }
  }

  async transform(id: number): Promise<boolean> {
    if (this.phase !== 'lobby') return false
    const fish = this.view.fish.get(id)
    if (!fish) return false
    const operation = ++this.operation
    this.phase = 'transforming'; this.fishId = id; this.readyToRide = false
    console.log('[BOARDING] Beginning dock step.', id)
    const facing = Vector3.create(fish.state.x + Math.sin(fish.state.yaw) * 10, SEA_Y,
      fish.state.z + Math.cos(fish.state.yaw) * 10)
    this.previousInput = InputModifier.getOrNull(engine.PlayerEntity)
    this.previousLocomotion = AvatarLocomotionSettings.getOrNull(engine.PlayerEntity)
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({ disableAll: true }) })
    try {
      const seat = this.view.mountLocalFish(id, () => { this.needsSittingPose = true })
      // Keep the current camera while the real avatar steps over the dock edge.
      // A short two-part path clears the lip, then lowers onto the waiting fish.
      const start = { ...Transform.get(engine.PlayerEntity).position }
      this.transition = playBoardingWalk()
      await this.transition
      if (operation !== this.operation) return false
      const step = Vector3.create(start.x + (seat.x - start.x) * 0.45,
        Math.max(start.y, seat.y) + 0.16, start.z + (seat.z - start.z) * 0.45)
      this.transition = movePlayerTo({ newRelativePosition: step, duration: 0.4, avatarTarget: facing })
      const first = await this.transition as { success?: boolean }
      if (first.success === false) throw new Error('The boarding step was interrupted.')
      if (operation !== this.operation) return false
      this.ignoreDockCollision()
      this.transition = movePlayerTo({ newRelativePosition: seat, duration: 0.5, avatarTarget: facing })
      const landed = await this.transition as { success?: boolean }
      if (landed.success === false) throw new Error('The boarding landing was interrupted.')
      await stopEmote({})
      if (operation !== this.operation) return false
      const seated = await this.view.waitForLocalFishSeat(id)
      if (operation !== this.operation) return false
      if (!seated) throw new Error('Could not settle the avatar on its fish.')
      AvatarLocomotionSettings.createOrReplace(engine.PlayerEntity, {
        walkSpeed: 3, jogSpeed: SPEED, runSpeed: SPEED,
        jumpHeight: 0, runJumpHeight: 0, doubleJumpHeight: 0, hardLandingCooldown: 0
      })
      InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({ disableAll: true }) })
      this.keepSitting = true
      this.needsSittingPose = false
      this.sittingPoseRetryAt = 0
      this.transition = this.requestSittingPose()
      await this.transition
      if (operation !== this.operation) return false
      // Let the sitting pose and avatar capsule settle before the fish can accept input.
      const settled = await this.view.waitForLocalFishSeat(id, true)
      if (operation !== this.operation) return false
      if (!settled) throw new Error('The seated avatar did not settle on its fish.')
      this.readyToRide = true
      console.log('[BOARDING] Seated; awaiting server confirmation.', id)
      return true
    } catch (error) {
      if (operation !== this.operation) return false
      console.error('[CLIENT] Fish transformation failed.', String(error))
      await this.returnToLobby()
      return false
    }
  }

  activate(id: number): void {
    if (this.phase === 'transforming' && this.fishId === id && this.readyToRide) {
      this.phase = 'fish'
      console.log('[BOARDING] Riding fish.', id)
    }
  }

  updateRiderPose(): void {
    if (!this.keepSitting || !this.needsSittingPose || this.sittingPoseRequest || !this.view.localRiderSeated) return
    const now = Date.now()
    if (now < this.sittingPoseRetryAt) return
    this.sittingPoseRetryAt = now + SITTING_POSE_RETRY_MS
    this.needsSittingPose = false
    const operation = this.operation
    void this.requestSittingPose().catch(() => {
      if (operation === this.operation) this.needsSittingPose = true
    })
  }

  private requestSittingPose(): Promise<void> {
    this.sittingPoseRequest = playRiderSittingPose().finally(() => { this.sittingPoseRequest = undefined })
    return this.sittingPoseRequest
  }

  async disembark(id: number, landing: DockLanding): Promise<boolean> {
    if (this.phase !== 'fish' || this.fishId !== id) return false
    const operation = ++this.operation
    this.phase = 'docking'; this.readyToRide = false
    this.keepSitting = false
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({ disableAll: true }) })
    try {
      // Stop reseating/swimming, but retain the support collider until the avatar reaches the dock.
      await this.view.pauseLocalFish()
      await this.sittingPoseRequest?.catch(() => {})
      if (operation !== this.operation) return false
      this.restoreDockCollision()
      await stopEmote({})
      const start = { ...Transform.get(engine.PlayerEntity).position }
      const facing = Vector3.create(landing.x + (landing.x - start.x), landing.y,
        landing.z + (landing.z - start.z))
      this.transition = playBoardingWalk()
      await this.transition
      const step = Vector3.create(start.x + (landing.x - start.x) * 0.55,
        Math.max(start.y, landing.y) + 0.25, start.z + (landing.z - start.z) * 0.55)
      this.transition = movePlayerTo({ newRelativePosition: step, duration: 0.35, avatarTarget: facing })
      const first = await this.transition as { success?: boolean }
      if (first.success === false) throw new Error('The dock step was interrupted.')
      if (operation !== this.operation) return false
      this.transition = movePlayerTo({ newRelativePosition: landing, duration: 0.45, avatarTarget: facing })
      const result = await this.transition as { success?: boolean }
      if (result.success === false) throw new Error('The dock landing was interrupted.')
      if (operation !== this.operation) return false
      await this.view.releaseLocalFish(id, false)
      await stopEmote({})
      const settled = await new Promise<boolean>(resolve => {
        let elapsed = 0, stable = 0
        const check = (dt: number): void => {
          if (operation !== this.operation) { engine.removeSystem(check); resolve(false); return }
          const p = Transform.getOrNull(engine.PlayerEntity)?.position
          elapsed += dt
          stable = p && Math.hypot(p.x - landing.x, p.z - landing.z) < 0.8
            && Math.abs(p.y - landing.y) < 0.6 ? stable + dt : 0
          if (stable < 0.2 && elapsed < 2) return
          engine.removeSystem(check); resolve(stable >= 0.2)
        }
        engine.addSystem(check)
      })
      if (operation !== this.operation) return false
      if (!settled) throw new Error('Could not settle on the dock.')
      this.fishId = undefined
      this.restoreControls()
      this.phase = 'lobby'
      console.log('[DOCK] Stepped onto platform; parking fish.', id)
      return true
    } catch (error) {
      if (operation !== this.operation) return false
      console.error('[DOCK] Dismount failed.', String(error))
      await this.returnToLobby()
      return false
    }
  }

  private ignoreDockCollision(): void {
    // The whole replacement bridge can intersect the rider, even beyond the berths.
    for (const [entity, model] of engine.getEntitiesWith(GltfContainer, Transform)) {
      const file = model.src.slice(model.src.lastIndexOf('/') + 1)
      if (!BRIDGE_COLLIDER_MODELS.has(file)) {
        if (file !== 'wooden_plank_walkable.glb' && file !== 'wooden_post.glb') continue
        const p = getWorldPosition(engine, entity)
        if (!BOARDING_SPOTS.some(spot => Math.hypot(spot.x - p.x, spot.z - p.z) < 8)) continue
      }
      const { visibleMeshesCollisionMask, invisibleMeshesCollisionMask } = model
      const visible = visibleMeshesCollisionMask ?? 0
      const invisible = invisibleMeshesCollisionMask ?? 3
      if (!((visible | invisible) & ColliderLayer.CL_PHYSICS)) continue
      this.dockMasks.set(entity, { visibleMeshesCollisionMask, invisibleMeshesCollisionMask })
      const mutable = GltfContainer.getMutable(entity)
      mutable.visibleMeshesCollisionMask = visible & ~ColliderLayer.CL_PHYSICS
      mutable.invisibleMeshesCollisionMask = invisible & ~ColliderLayer.CL_PHYSICS
    }
  }

  private restoreDockCollision(): void {
    for (const [entity, masks] of this.dockMasks) {
      const model = GltfContainer.getMutableOrNull(entity)
      if (model) Object.assign(model, masks)
    }
    this.dockMasks.clear()
  }

  private restoreControls(): void {
    if (this.previousInput) InputModifier.createOrReplace(engine.PlayerEntity, this.previousInput)
    else InputModifier.deleteFrom(engine.PlayerEntity)
    if (this.previousLocomotion) AvatarLocomotionSettings.createOrReplace(engine.PlayerEntity, this.previousLocomotion)
    else AvatarLocomotionSettings.deleteFrom(engine.PlayerEntity)
  }

  async returnToLobby(): Promise<void> {
    if (this.phase === 'returning') return
    // Emergency recovery can start in lobby state after a preview reload.
    if (this.phase === 'lobby') {
      this.previousInput = InputModifier.getOrNull(engine.PlayerEntity)
      this.previousLocomotion = AvatarLocomotionSettings.getOrNull(engine.PlayerEntity)
    }
    ++this.operation
    this.phase = 'returning'; this.readyToRide = false
    this.keepSitting = false
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({ disableAll: true }) })
    try {
      if (this.fishId !== undefined) await this.view.releaseLocalFish(this.fishId)
      await this.transition.catch(() => {})
      await this.sittingPoseRequest?.catch(() => {})
      await stopEmote({})
      await landAtLobby()
    } catch (error) {
      console.error('[CLIENT] Lobby return needs retry.', String(error))
    } finally {
      this.fishId = undefined
      this.restoreDockCollision()
      this.restoreControls()
      this.phase = 'lobby'
    }
  }
}
