import { engine, Entity, InputModifier, MainCamera, TouchScreenControls, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { LOBBY, LOBBY_LOOK_AT, SEA, SEA_Y } from '../shared/config'
import { ArenaView } from './view'

export class FishForm {
  fishId: number | undefined
  phase: 'lobby' | 'transforming' | 'fish' | 'returning' = 'lobby'
  private forwardZ = 1
  private camera: Entity | undefined
  private target: Entity | undefined
  private previousInput: ReturnType<typeof InputModifier.getOrNull> = null
  private previousTouch: ReturnType<typeof TouchScreenControls.getOrNull> = null

  constructor(private view: ArenaView) {}

  async transform(id: number): Promise<boolean> {
    if (this.phase !== 'lobby') return false
    const fish = this.view.fish.get(id)
    if (!fish) return false
    this.phase = 'transforming'; this.fishId = id
    this.forwardZ = fish.state.z > (SEA.minZ + SEA.maxZ) / 2 ? -1 : 1
    this.previousInput = InputModifier.getOrNull(engine.PlayerEntity)
    this.previousTouch = TouchScreenControls.getOrNull(engine.RootEntity)
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({
      disableWalk: true, disableJog: true, disableRun: true, disableJump: true,
      disableDoubleJump: true, disableGliding: true, disableEmote: true
    }) })
    try {
      // The editor-authored sea modifier hides every human avatar in the arena.
      // Input drives the authoritative fish; its camera needs no rider, seat, or moving platform.
      const moved = await movePlayerTo({
        newRelativePosition: Vector3.create(fish.state.x, SEA_Y, fish.state.z),
        avatarTarget: Vector3.create(fish.state.x, SEA_Y, fish.state.z + 3)
      })
      if (!moved.success || this.phase !== 'transforming') throw new Error('Fish transformation did not finish.')
      TouchScreenControls.hideAll()
      TouchScreenControls.hideCrosshair()
      TouchScreenControls.showJoystick()
      this.target = engine.addEntity()
      Transform.create(this.target, { parent: fish.root, position: Vector3.create(0, 0.4, 0) })
      this.camera = engine.addEntity()
      Transform.create(this.camera, { position: Vector3.create(fish.state.x, 10, fish.state.z - this.forwardZ * 11) })
      VirtualCamera.create(this.camera, { lookAtEntity: this.target,
        defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.25) } })
      MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: this.camera })
      this.phase = 'fish'
      return true
    } catch (error) {
      console.error('[CLIENT] Fish transformation failed.', String(error))
      await this.returnToLobby()
      return false
    }
  }

  steering(x: number, z: number): { x: number; z: number } {
    return { x: x * this.forwardZ, z: z * this.forwardZ }
  }

  update(): void {
    if (this.camera === undefined || this.fishId === undefined) return
    const view = this.view.fish.get(this.fishId)
    if (!view) return
    const fish = Transform.get(view.root)
    Transform.getMutable(this.camera).position = Vector3.create(
      fish.position.x, SEA_Y + 7 + view.scale * 2, fish.position.z - this.forwardZ * (9 + view.scale * 2))
    if (this.target !== undefined) Transform.getMutable(this.target).position.y = view.scale * 0.25
  }

  async returnToLobby(): Promise<void> {
    if (this.phase === 'returning') return
    this.phase = 'returning'
    try {
      const moved = await movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: LOBBY_LOOK_AT })
      if (!moved.success) await movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: LOBBY_LOOK_AT })
    } catch (error) {
      console.error('[CLIENT] Lobby return needs retry.', String(error))
    } finally {
      if (MainCamera.has(engine.CameraEntity)) MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined
      if (this.camera !== undefined) engine.removeEntity(this.camera)
      if (this.target !== undefined) engine.removeEntity(this.target)
      this.camera = this.target = undefined
      this.fishId = undefined
      if (this.previousInput) InputModifier.createOrReplace(engine.PlayerEntity, this.previousInput)
      else InputModifier.deleteFrom(engine.PlayerEntity)
      if (this.previousTouch) TouchScreenControls.createOrReplace(engine.RootEntity, {
        ...this.previousTouch, touchInputs: this.previousTouch.touchInputs.map(input => ({ ...input }))
      })
      else TouchScreenControls.deleteFrom(engine.RootEntity)
      this.phase = 'lobby'
    }
  }
}
