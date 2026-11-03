import { engine, Entity, InputAction, inputSystem, MeshCollider, PointerEvents,
  PointerEventType, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { nearestDockLanding } from '../shared/dockSurfaces'
import type { FishState } from '../shared/messages'
import { ArenaView } from './view'

// A single local prompt; no added dock geometry or network position stream.
export class DockDisembark {
  private prompt: Entity
  private active = false
  private clock = 1
  private eligible = false

  constructor(private view: ArenaView, private request: () => void) {
    this.prompt = engine.addEntity()
    Transform.create(this.prompt, { scale: Vector3.create(1.5, 1.5, 1.5) })
  }

  update(dt: number, mine: FishState | undefined, riding: boolean, pending: boolean): void {
    this.clock += dt
    const available = riding && mine?.boardState === 2 && !pending && !this.view.localFishAirborne
    if (this.clock >= 0.1 || !available) {
      this.clock = 0
      const position = this.view.localFishPosition
      const landing = available && position ? nearestDockLanding(position) : undefined
      this.eligible = !!landing
      if (landing) Transform.getMutable(this.prompt).position = Vector3.create(landing.x, landing.y + 0.7, landing.z)
      if (this.eligible !== this.active) {
        this.active = this.eligible
        if (this.active) {
          MeshCollider.setSphere(this.prompt, 1)
          pointerEventsSystem.onProximityDown({ entity: this.prompt, opts: {
            button: InputAction.IA_PRIMARY, hoverText: 'Dock', maxDistance: 6, showHighlight: false
          } }, () => { if (this.eligible) this.request() })
        } else {
          pointerEventsSystem.removeOnProximityDown(this.prompt)
          PointerEvents.deleteFrom(this.prompt); MeshCollider.deleteFrom(this.prompt)
        }
      }
    }
    if (this.eligible && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) this.request()
  }
}
