import { AvatarModifierArea, AvatarModifierType, engine, Entity, getWorldPosition, getWorldRotation,
  InputModifier, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const MOVEMENT_LOCK = {
  disableWalk: true, disableJog: true, disableRun: true, disableJump: true,
  disableEmote: true, disableDoubleJump: true, disableGliding: true
}

/** A local, reusable conversation rig, created only when Rean starts speaking. */
export class DialogueCamera {
  private camera?: Entity
  private avatarArea?: Entity
  private focused = false
  private revealAfter = 0
  private previousCamera?: Entity
  private previousInput: ReturnType<typeof InputModifier.getOrNull> = null

  focus(guide: Entity): void {
    if (this.focused || !Transform.has(guide)) return
    const guidePosition = getWorldPosition(engine, guide)
    const facing = Vector3.rotate(Vector3.Forward(), getWorldRotation(engine, guide))
    const horizontal = Math.hypot(facing.x, facing.z)
    const forward = horizontal > .01 ? Vector3.create(facing.x / horizontal, 0, facing.z / horizontal) : Vector3.Forward()
    const position = Vector3.create(guidePosition.x + forward.x * 2.6,
      guidePosition.y + 1.55, guidePosition.z + forward.z * 2.6)
    const target = Vector3.create(guidePosition.x, guidePosition.y + 1.3, guidePosition.z)

    this.camera ??= engine.addEntity()
    Transform.createOrReplace(this.camera, { position, rotation: Quaternion.fromLookAt(position, target) })
    VirtualCamera.createOrReplace(this.camera, {
      fov: 42, defaultTransition: { transitionMode: VirtualCamera.Transition.Time(.75) }
    })
    const previous = MainCamera.getOrNull(engine.CameraEntity)?.virtualCameraEntity
    this.previousCamera = previous && VirtualCamera.has(previous as Entity) ? previous as Entity : undefined
    const input = InputModifier.getOrNull(engine.PlayerEntity)
    this.previousInput = input ? JSON.parse(JSON.stringify(input)) : null
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard(MOVEMENT_LOCK) })

    // This client-only area keeps nearby player avatars and nametags out of the close-up.
    // Rean is a GLB, so the avatar modifier does not hide her.
    this.avatarArea ??= engine.addEntity()
    const area = Vector3.create(6.4, 4, 6.4)
    Transform.createOrReplace(this.avatarArea, {
      position: Vector3.create(guidePosition.x, guidePosition.y + 1, guidePosition.z), scale: area
    })
    AvatarModifierArea.createOrReplace(this.avatarArea, { area, excludeIds: [], modifiers: [AvatarModifierType.AMT_HIDE_AVATARS] })
    this.revealAfter = 0
    MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: this.camera })
    this.focused = true
  }

  release(): void {
    if (!this.focused) return
    const main = MainCamera.getMutableOrNull(engine.CameraEntity)
    if (main && main.virtualCameraEntity === this.camera) {
      main.virtualCameraEntity = this.previousCamera && VirtualCamera.has(this.previousCamera) ? this.previousCamera : undefined
    }
    // Boarding and respawn can take ownership of input. Never overwrite their newer lock.
    const mode = InputModifier.getOrNull(engine.PlayerEntity)?.mode
    if (mode?.$case === 'standard' && !mode.standard.disableAll
      && Object.keys(MOVEMENT_LOCK).every(key => mode.standard[key as keyof typeof MOVEMENT_LOCK])) {
      if (this.previousInput) InputModifier.createOrReplace(engine.PlayerEntity, this.previousInput)
      else InputModifier.deleteFrom(engine.PlayerEntity)
    }
    this.focused = false
    this.previousCamera = undefined; this.previousInput = null
    // Keep the rig alive for the renderer's normal half-second camera handback blend.
    this.revealAfter = .55
  }

  update(dt: number): void {
    if (this.revealAfter <= 0) return
    this.revealAfter -= dt
    if (this.revealAfter <= 0 && this.avatarArea !== undefined) AvatarModifierArea.deleteFrom(this.avatarArea)
  }
}
