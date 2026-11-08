import { Animator, Billboard, engine, Entity, GltfContainer, GltfNodeModifiers, InputAction, inputSystem, MeshCollider, PointerEventType,
  pointerEventsSystem, PointerEvents, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARDING_ARROW, BOARDING_RANGE, BOARDING_SPOT_NAMES, withinBoardingRange } from '../shared/boarding'
import type { FishState } from '../shared/messages'
import { state } from '../ui/RideHud'
import { ArenaView } from './view'
import { getPlatform, isMobile } from '@dcl/sdk/platform'

// These guide entities are local-only. Slot ownership comes from the server, never a client race.
export class DockBoarding {
  private rings: Entity[] = []
  private arrow: Entity
  private prompt: Entity
  private shown = -1
  private interacting = false
  private clock = 0
  get canRide(): boolean { return this.interacting }
  get promptPosition(): Vector3 | undefined { return Transform.getOrNull(this.prompt)?.position }

  constructor(private view: ArenaView, private request: () => void) {
    for (const name of BOARDING_SPOT_NAMES) {
      const entity = engine.getEntityOrNullByName(name)
      if (entity === null) throw new Error('Missing boarding ring: ' + name)
      this.rings.push(entity)
      VisibilityComponent.createOrReplace(entity, { visible: false })
      GltfNodeModifiers.createOrReplace(entity, { modifiers: [{ path: '', castShadows: false }] })
    }
    this.arrow = engine.addEntity()
    Transform.create(this.arrow, { scale: Vector3.create(5.5, 5.5, 5.5) })
    GltfContainer.create(this.arrow, { src: BOARDING_ARROW, visibleMeshesCollisionMask: 0, invisibleMeshesCollisionMask: 0 })
    Animator.create(this.arrow, { states: [{ clip: 'ArmatureAction', playing: true, loop: true, speed: 1, weight: 1 }] })
    GltfNodeModifiers.create(this.arrow, { modifiers: [{ path: '', castShadows: false }] })
    Billboard.create(this.arrow, { billboardMode: 7 })
    VisibilityComponent.create(this.arrow, { visible: false })
    this.prompt = engine.addEntity()
    Transform.create(this.prompt, { scale: Vector3.create(1.5, 1.5, 1.5) })
  }

  update(dt: number, mine: FishState | undefined, phase: string, seated: boolean, available: boolean, pending: boolean, queuePosition: number, arrowUnlocked = true): void {
    this.clock += Math.min(dt, 0.1)
    const slot = mine && mine.boardState < 2 && phase === 'lobby' && !seated ? mine.boardSlot : -1
    const show = slot >= 0 && slot < this.rings.length ? slot : -1
    if (show !== this.shown) {
      if (this.shown >= 0) VisibilityComponent.getMutable(this.rings[this.shown]).visible = false
      if (show >= 0) VisibilityComponent.getMutable(this.rings[show]).visible = true
      this.shown = show
      if (show >= 0) console.log('[BOARDING] Your reserved berth:', show + 1)
    }
    if (VisibilityComponent.get(this.arrow).visible !== (show >= 0 && arrowUnlocked)) VisibilityComponent.getMutable(this.arrow).visible = show >= 0 && arrowUnlocked
    const fish = mine && this.view.fish.get(mine.id)
    if (show >= 0 && fish) {
      Transform.getMutable(this.rings[show]).rotation = Quaternion.fromEulerDegrees(0, this.clock * 28, 0)
      const p = Transform.get(fish.root).position
      Transform.getMutable(this.arrow).position = Vector3.create(p.x, p.y + 2.35, p.z)
      Transform.getMutable(this.prompt).position = Vector3.create(p.x, p.y + .8, p.z)
    }
    const player = Transform.getOrNull(engine.PlayerEntity)?.position
    const interact = show >= 0 && phase === 'lobby' && mine?.boardState === 0 && available && !pending && state.indexDisplay !== 'flex'
      && !!player && withinBoardingRange(player, mine)
    if (interact !== this.interacting) {
      this.interacting = interact
      if (interact) {
        MeshCollider.setSphere(this.prompt, 1)
        pointerEventsSystem.onProximityDown({ entity: this.prompt,
          opts: { button: InputAction.IA_PRIMARY, hoverText: 'Ride', maxDistance: BOARDING_RANGE, showHighlight: false,
            showFeedback: getPlatform() === null || isMobile() } },
          () => { if (this.interacting) this.request() })
      } else {
        pointerEventsSystem.removeOnProximityDown(this.prompt)
        PointerEvents.deleteFrom(this.prompt)
        MeshCollider.deleteFrom(this.prompt)
      }
    }
    // The same eligible range accepts E even if native proximity misses a facing/occlusion test.
    if (interact && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) this.request()
    const hint = phase === 'lobby' && available && queuePosition > 0 && !mine
      ? 'Waiting for a fish · Queue ' + queuePosition : ''
    state.boardingMessage = hint
    state.boardingDisplay = hint ? 'flex' : 'none'
  }
}
