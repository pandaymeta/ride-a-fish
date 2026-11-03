import { AvatarAnchorPointType, AvatarAttach, ColliderLayer, engine, Entity, getWorldPosition,
  AssetLoad, GltfContainer, InputAction, InputModifier, inputSystem, MeshCollider, PointerEvents, pointerEventsSystem, timers,
  Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo, stopEmote, triggerSceneEmote } from '~system/RestrictedActions'

const SITTING_ANIMATION = 'assets/animations/Stool_Idle_emote.glb'
const SEAT_HEIGHT = 0.6742 // Measured top of the Wooden Stool GLB, in model metres.
const MOVE_KEYS = [InputAction.IA_FORWARD, InputAction.IA_BACKWARD, InputAction.IA_LEFT,
  InputAction.IA_RIGHT, InputAction.IA_JUMP]
interface Stool { entity: Entity; seat: Entity }

export class StoolSeating {
  private readonly support = engine.addEntity()
  private readonly hips = engine.addEntity()
  private active?: Stool
  private mode: 'idle' | 'moving' | 'seated' | 'leaving' = 'idle'
  private operation = 0
  private releaseKeys = true
  private standingPosition = Vector3.Zero()
  private rootPosition = Vector3.Zero()
  private facing = Vector3.Forward()
  private previousInput: ReturnType<typeof InputModifier.getOrNull> = null
  private previousMasks?: { visibleMeshesCollisionMask?: number; invisibleMeshesCollisionMask?: number }

  get busy(): boolean { return this.mode !== 'idle' }

  constructor(private canSit: () => boolean) {
    Transform.create(this.support)
    AssetLoad.create(this.support, { assets: [SITTING_ANIMATION] })
    Transform.create(this.hips)
    for (const name of ['Wooden Stool', 'Wooden Stool_2']) {
      const entity = engine.getEntityOrNullByName(name)
      if (entity === null || !GltfContainer.has(entity)) continue
      const seat = engine.addEntity()
      Transform.create(seat, { parent: entity, position: Vector3.create(0, SEAT_HEIGHT, 0) })
      const stool = { entity, seat }
      pointerEventsSystem.onPointerDown({ entity, opts: { button: InputAction.IA_POINTER,
        hoverText: 'Sit', maxDistance: 3, showFeedback: true } }, () => {
        if (this.active?.entity === entity && this.mode === 'seated') void this.stand()
        else if (!this.busy) void this.sit(stool)
      })
    }
    engine.addSystem(() => this.update(), undefined, 'stool-seating')
  }

  cancel(): void {
    ++this.operation
    this.cleanup()
  }

  private async sit(stool: Stool): Promise<void> {
    if (!this.canSit() || this.busy) return
    const player = Transform.getOrNull(engine.PlayerEntity)
    const seat = getWorldPosition(engine, stool.seat)
    if (!player || Vector3.distanceSquared(player.position, seat) > 12.25) return
    const operation = ++this.operation
    this.active = stool; this.mode = 'moving'; this.releaseKeys = true
    this.standingPosition = { ...player.position }
    const table = engine.getEntityOrNullByName('Wooden Side Table')
    const target = table === null ? Vector3.add(seat, Vector3.Forward()) : getWorldPosition(engine, table)
    this.facing = Vector3.normalize(Vector3.create(target.x - seat.x, 0, target.z - seat.z))
    this.previousInput = InputModifier.getOrNull(engine.PlayerEntity)
    if (this.previousInput) this.previousInput = JSON.parse(JSON.stringify(this.previousInput))
    InputModifier.createOrReplace(engine.PlayerEntity, { mode: InputModifier.Mode.Standard({ disableAll: true }) })
    // The avatar capsule stays upright during a seated emote. Keep the visual stool clickable,
    // but use a small foot support rather than letting its solid seat push the capsule upward.
    const gltf = GltfContainer.getMutable(stool.entity)
    this.previousMasks = { visibleMeshesCollisionMask: gltf.visibleMeshesCollisionMask,
      invisibleMeshesCollisionMask: gltf.invisibleMeshesCollisionMask }
    gltf.visibleMeshesCollisionMask = (gltf.visibleMeshesCollisionMask ?? 0) & ~ColliderLayer.CL_PHYSICS
    gltf.invisibleMeshesCollisionMask = (gltf.invisibleMeshesCollisionMask ?? 3) & ~ColliderLayer.CL_PHYSICS
    AvatarAttach.createOrReplace(this.hips, { anchorPointId: AvatarAnchorPointType.AAPT_HIP })
    try {
      // Start near the seat, then measure this avatar's hips in the supplied chair-idle clip.
      this.rootPosition = Vector3.create(seat.x + this.facing.x * 0.37,
        seat.y - 0.5, seat.z + this.facing.z * 0.37)
      this.placeSupport()
      const moved = await movePlayerTo({ newRelativePosition: this.rootPosition, duration: 0.4,
        avatarTarget: Vector3.add(this.rootPosition, Vector3.scale(this.facing, 3)) })
      if (operation !== this.operation) return
      if (!moved.success) throw new Error('Could not reach the stool.')
      await this.wait(250)
      if (operation !== this.operation) return
      await this.playPose()
      await this.wait(500)
      if (operation !== this.operation) return
      const offset = Transform.get(this.hips).position
      if (offset.y > 0.05 && offset.y < 1.3) {
        this.rootPosition = Vector3.subtract(seat, offset)
        this.rootPosition.y += 0.015
        this.placeSupport()
        const aligned = await movePlayerTo({ newRelativePosition: this.rootPosition, duration: 0.2,
          avatarTarget: Vector3.add(this.rootPosition, Vector3.scale(this.facing, 3)) })
        if (operation !== this.operation) return
        if (!aligned.success) throw new Error('Could not align the stool seat.')
      }
      await this.wait(250)
      if (operation !== this.operation) return
      await this.playPose()
      if (operation !== this.operation) return
      AvatarAttach.deleteFrom(this.hips)
      this.mode = 'seated'
      this.setPrompt(stool.entity, 'Stand up')
      console.log('[STOOL] Seated.', stool.entity)
    } catch (error) {
      if (operation !== this.operation) return
      console.error('[STOOL]', String(error))
      await this.stand()
    }
  }

  private async stand(): Promise<void> {
    if (!this.active || this.mode === 'leaving') return
    const operation = ++this.operation
    this.mode = 'leaving'
    try {
      await stopEmote({})
      if (operation !== this.operation) return
      await movePlayerTo({ newRelativePosition: this.standingPosition, duration: 0.35,
        avatarTarget: Vector3.add(this.standingPosition, this.facing) })
    } finally {
      if (operation === this.operation) this.cleanup()
    }
  }

  private update(): void {
    if (!this.busy) return
    if (!this.canSit()) { this.cancel(); return }
    if (this.mode !== 'seated') return
    const held = MOVE_KEYS.some(key => inputSystem.isPressed(key))
    if (this.releaseKeys) { if (!held) this.releaseKeys = false; return }
    if (held) void this.stand()
  }

  private placeSupport(): void {
    const t = Transform.getMutable(this.support)
    t.position = Vector3.create(this.rootPosition.x, this.rootPosition.y - 0.12, this.rootPosition.z)
    t.scale = Vector3.create(0.7, 0.08, 0.7)
    MeshCollider.setBox(this.support, ColliderLayer.CL_PHYSICS)
  }

  private cleanup(): void {
    MeshCollider.deleteFrom(this.support)
    AvatarAttach.deleteFrom(this.hips)
    if (this.active && this.previousMasks && GltfContainer.has(this.active.entity)) {
      this.setPrompt(this.active.entity, 'Sit')
      const gltf = GltfContainer.getMutable(this.active.entity)
      gltf.visibleMeshesCollisionMask = this.previousMasks.visibleMeshesCollisionMask
      gltf.invisibleMeshesCollisionMask = this.previousMasks.invisibleMeshesCollisionMask
    }
    if (this.mode !== 'idle') {
      if (this.previousInput) InputModifier.createOrReplace(engine.PlayerEntity, this.previousInput)
      else InputModifier.deleteFrom(engine.PlayerEntity)
    }
    this.previousMasks = undefined; this.previousInput = null
    this.active = undefined; this.mode = 'idle'
  }

  private setPrompt(entity: Entity, label: string): void {
    for (const event of PointerEvents.getMutable(entity).pointerEvents) {
      if (event.eventInfo?.button === InputAction.IA_POINTER) event.eventInfo.hoverText = label
    }
  }

  private async playPose(): Promise<void> {
    const result = await triggerSceneEmote({ src: SITTING_ANIMATION, loop: true })
    if (!result.success) throw new Error('Could not play the stool sitting animation.')
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => timers.setTimeout(resolve, ms))
  }
}
