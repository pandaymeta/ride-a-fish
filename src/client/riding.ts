import { engine, Entity, InputModifier, MainCamera, TouchScreenControls, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo, stopEmote, triggerEmote } from '~system/RestrictedActions'
import { LOBBY, PORTAL, SEA_Y } from '../shared/config'
import { ArenaView } from './view'

export class Riding {
  mountId: number | undefined
  phase: 'lobby' | 'mounting' | 'riding' | 'returning' = 'lobby'
  private camera: Entity | undefined
  private target: Entity | undefined
  private previousInput: ReturnType<typeof InputModifier.getOrNull> = null
  private previousTouch: ReturnType<typeof TouchScreenControls.getOrNull> = null

  constructor(private view: ArenaView) {}

  async mount(id: number): Promise<boolean> {
    if (this.phase !== 'lobby') return false
    const fish = this.view.fish.get(id)
    if (!fish) return false
    this.phase = 'mounting'; this.mountId = id
    this.previousInput = InputModifier.getOrNull(engine.PlayerEntity)
    this.previousTouch = TouchScreenControls.getOrNull(engine.RootEntity)
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({
      disableWalk: true, disableJog: true, disableRun: true, disableJump: true,
      disableDoubleJump: true, disableGliding: true, disableEmote: true
    }) })
    this.view.createSeat(id)
    try {
      const moved = await movePlayerTo({
        newRelativePosition: Vector3.create(fish.state.x, SEA_Y + this.view.seatTop(id) + 0.03, fish.state.z),
        avatarTarget: Vector3.create(fish.state.x, SEA_Y + 1, fish.state.z + 3)
      })
      if (!moved.success || this.phase !== 'mounting') throw new Error('Mount transition did not finish.')
      await triggerEmote({ predefinedEmote: 'sittingChair1' })
      if (this.phase !== 'mounting') return false
      TouchScreenControls.hideAll()
      TouchScreenControls.hideCrosshair()
      TouchScreenControls.showJoystick()
      this.target = engine.addEntity()
      Transform.create(this.target, { parent: fish.root, position: Vector3.create(0, 1.5, 0) })
      this.camera = engine.addEntity()
      Transform.create(this.camera, { position: Vector3.create(fish.state.x, 11, fish.state.z - 12) })
      VirtualCamera.create(this.camera, { lookAtEntity: this.target,
        defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.25) } })
      MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: this.camera })
      this.phase = 'riding'
      return true
    } catch (error) {
      console.error('[CLIENT] Mount failed.', String(error))
      await this.returnToLobby()
      return false
    }
  }

  update(): void {
    if (this.camera === undefined || this.mountId === undefined) return
    const view = this.view.fish.get(this.mountId)
    if (!view) return
    const fish = Transform.get(view.root)
    const camera = Transform.getMutable(this.camera)
    camera.position = Vector3.create(fish.position.x, 9 + view.scale * 2, fish.position.z - 10 - view.scale * 2)
    if (this.target !== undefined) Transform.getMutable(this.target).position.y = this.view.seatTop(this.mountId) + 1.4
  }

  async returnToLobby(): Promise<void> {
    if (this.phase === 'returning') return
    this.phase = 'returning'
    try {
      await stopEmote({})
      const moved = await movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: PORTAL })
      if (!moved.success) await movePlayerTo({ newRelativePosition: LOBBY, cameraTarget: PORTAL })
    } catch (error) {
      console.error('[CLIENT] Lobby return needs retry.', String(error))
    } finally {
      if (MainCamera.has(engine.CameraEntity)) MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined
      if (this.camera !== undefined) engine.removeEntity(this.camera)
      if (this.target !== undefined) engine.removeEntity(this.target)
      if (this.mountId !== undefined) this.view.removeSeat(this.mountId)
      this.camera = this.target = undefined
      this.mountId = undefined
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
