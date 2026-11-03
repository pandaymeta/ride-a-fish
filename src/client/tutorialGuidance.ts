import { Animator, AssetLoad, Billboard, engine, Entity, GltfContainer, GltfNodeModifiers, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { GuideFacing } from './guideFacing'
import { BOARDING_ARROW } from '../shared/boarding'
import { nearestDockLanding } from '../shared/dockSurfaces'
import { routeAroundLobbyIsland } from '../shared/lobbyIsland'
import { segmentCrossesSand } from '../shared/sandCollision'
import type { ArenaSnapshot, FishState, PlayerProfile } from '../shared/messages'
import { TUTORIAL_COMPLETE } from '../shared/tutorial'
import { chooseTutorialTarget, TutorialPoint, TutorialTarget } from '../shared/tutorialTargets'
import { TutorialTrail } from './tutorialTrail'

// Each client owns its guide facing, marker and route; none are replicated to other players.
export class TutorialGuidance {
  private readonly arrow = engine.addEntity()
  private readonly trail = new TutorialTrail()
  private timer = 1
  private markerTimer = 0
  private readonly facing: GuideFacing
  private previousSteps = -1
  private target?: TutorialTarget
  private path: TutorialPoint[] = []
  private visible = false

  constructor(private guide: Entity | null) {
    this.facing = new GuideFacing(guide)
    Transform.create(this.arrow, { scale: Vector3.create(5.5, 5.5, 5.5) })
    GltfContainer.create(this.arrow, { src: BOARDING_ARROW, visibleMeshesCollisionMask: 0, invisibleMeshesCollisionMask: 0 })
    Animator.create(this.arrow, { states: [{ clip: 'ArmatureAction', playing: true, loop: true, speed: 1, weight: 1 }] })
    GltfNodeModifiers.create(this.arrow, { modifiers: [{ path: '', castShadows: false }] })
    Billboard.create(this.arrow, { billboardMode: 7 })
    VisibilityComponent.create(this.arrow, { visible: false })
    AssetLoad.create(this.arrow, { assets: ['assets/Images/ui/rean/tutorial-arrow-rounded-proportional.png'] })
  }

  update(dt: number, profile: PlayerProfile | undefined, snapshot: ArenaSnapshot, mine: FishState | undefined,
    position: Vector3 | undefined, riding: boolean, hidden: boolean,
    available: (kind: TutorialTarget['kind'], id: number) => boolean): TutorialTarget | undefined {
    this.timer += dt; this.markerTimer += dt
    const g = this.guide === null ? undefined : Transform.getOrNull(this.guide)
    const p = Transform.getOrNull(engine.PlayerEntity)?.position
    this.facing.update(dt, p)
    if (g && this.markerTimer >= .1) {
      Transform.getMutable(this.arrow).position = Vector3.create(g.position.x, g.position.y + 1.35, g.position.z)
      this.markerTimer = 0
    }
    const show = !!profile && !hidden && ((profile.tutorialSteps === 0 && !(profile.tutorialDialogues & 1))
      || (profile.tutorialSteps === TUTORIAL_COMPLETE && !(profile.tutorialDialogues & 2)))
    if (show !== this.visible) { VisibilityComponent.getMutable(this.arrow).visible = show; this.visible = show }
    if (!profile || !mine || !position || !riding || hidden || profile.tutorialSteps === TUTORIAL_COMPLETE) {
      this.trail.hide(); this.target = undefined; this.path = []; return
    }
    if (this.timer >= .15 || profile.tutorialSteps !== this.previousSteps || (this.target && this.target.kind !== 'dock' && !available(this.target.kind, this.target.id))) {
      this.timer = 0; this.previousSteps = profile.tutorialSteps
      const next = chooseTutorialTarget(profile.tutorialSteps, snapshot, mine, position,
        from => nearestDockLanding({ ...from, y: position.y }, Infinity), available, this.target)
      const changed = next?.kind !== this.target?.kind || next?.id !== this.target?.id
      if (changed) {
        console.log('[TUTORIAL] Trail target:', next?.kind ?? 'waiting', next?.id ?? '')
      }
      this.target = next
      const blocked = this.path.length > 0 && segmentCrossesSand(position, this.path[0], .2)
      if (changed || blocked || !this.path.length) {
        this.path = []
        this.trail.resetPath()
      }
      if (next && !this.path.length) {
        let from: TutorialPoint = position
        for (let n = 0; n < 8; n++) {
          const point = routeAroundLobbyIsland(from, next, 0, .75)
          if (Math.hypot(point.x - from.x, point.z - from.z) < .2) break
          this.path.push(point)
          if (point === next) break
          from = point
        }
      } else if (next) {
        this.path[this.path.length - 1] = { x: next.x, z: next.z }
      }
    }
    while (this.path.length > 1 && Math.hypot(position.x - this.path[0].x, position.z - this.path[0].z) < 1.2) {
      this.path.shift(); this.trail.resetPath()
    }
    const distance = this.target ? Math.hypot(position.x - this.target.x, position.z - this.target.z) : 0
    const stop = this.target?.kind === 'food' ? .4 : this.target?.kind === 'dock' ? 2.5 : .8
    this.trail.update(dt, distance > stop ? position : undefined, this.path)
    return this.target
  }
}
