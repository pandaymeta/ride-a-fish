import type { Vector3 } from '@dcl/sdk/math'
import type { ArenaSnapshot, FishState } from '../shared/messages'
import type { TutorialTarget } from '../shared/tutorialTargets'
import { TutorialGuidance } from './tutorialGuidance'
import { Animator, engine, Entity, getWorldPosition, InputAction, inputSystem, PointerEventType,
  pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import { room, PlayerProfile } from '../shared/messages'
import { onPlatform } from '../shared/config'
import { GUIDE_DEFEAT_LINES, GUIDE_INTERACTION_NAME, GUIDE_LINES, GUIDE_NAME, GUIDE_RANGE, TUTORIAL_COMPLETE,
  TUTORIAL_LESSONS, readTutorial, tutorialDialogue, tutorialFishArrow } from '../shared/tutorial'
import { state } from '../ui/TutorialHud'
import { actions } from './state'

type DefeatKind = keyof typeof GUIDE_DEFEAT_LINES

export class TutorialClient {
  private readonly guidance: TutorialGuidance
  private openedAt = -100
  private readonly guide: Entity | null
  private readonly clicker: Entity | null
  private profile?: PlayerProfile
  private nearby = false
  private listening = false
  private available = false
  private obscured = false
  private clock = 0
  private sampleClock = 0
  private requestedAt = -100
  private speechKind?: number | DefeatKind
  private speechPage = 0
  private pendingDefeat?: DefeatKind
  private lastDefeatEvent?: string
  private acknowledging?: number
  private ackAt = -100
  private animationUntil = 0
  private paintedSteps = -1
  get busy(): boolean { return state.dialogueVisible || this.clock - this.requestedAt < 3 }
  get interacting(): boolean { return this.listening || this.busy }

  constructor() {
    this.guide = engine.getEntityOrNullByName(GUIDE_NAME)
    this.clicker = engine.getEntityOrNullByName(GUIDE_INTERACTION_NAME)
    if (this.guide === null || this.clicker === null) console.log('[TUTORIAL] Guide or interaction target missing in the editor.')
    this.guidance = new TutorialGuidance(this.guide)
    actions.acknowledgeGuide = () => this.acknowledge()
    room.onMessage('guideDialogue', data => {
      if (this.clock - this.requestedAt > 3 || !this.nearby || !this.available || this.obscured
        || !GUIDE_LINES[data.kind] || !this.profile) return
      const progress = readTutorial({ version: 1, steps: this.profile.tutorialSteps, dialogues: this.profile.tutorialDialogues })
      if (tutorialDialogue(progress) !== data.kind) return
      this.openSpeech(data.kind)
      this.play(data.kind === 0 ? 'Greet' : 'Agree')
      this.animationUntil = this.clock + (data.kind === 0 ? 6.25 : 4.666667)
      console.log('[TUTORIAL] Guide dialogue:', data.kind === 0 ? 'welcome' : 'complete')
    })
  }

  apply(profile: PlayerProfile): void {
    this.profile = profile
    if (this.acknowledging !== undefined && (profile.tutorialDialogues & (1 << this.acknowledging))) this.acknowledging = undefined
    this.paint()
  }

  queueDefeat(eventId: string, cause: DefeatKind): void {
    if (this.lastDefeatEvent === eventId) return
    this.lastDefeatEvent = eventId
    this.pendingDefeat = cause
  }

  update(dt: number, available: boolean, obscured: boolean): void {
    this.clock += dt; this.sampleClock += dt
    this.available = available; this.obscured = obscured
    if (this.animationUntil > 0 && this.clock >= this.animationUntil) { this.animationUntil = 0; this.play('Idle') }
    if (this.acknowledging !== undefined && this.clock - this.ackAt >= 1 && available && this.nearby) {
      this.ackAt = this.clock
      void room.send('guideAcknowledge', { kind: this.acknowledging })
    }
    if (this.sampleClock >= .1) {
      this.sampleClock %= .1
      const player = Transform.getOrNull(engine.PlayerEntity)?.position, guide = this.guide === null ? undefined : getWorldPosition(engine, this.guide)
      this.nearby = !!player && !!guide && Math.hypot(player.x - guide.x, player.z - guide.z) <= GUIDE_RANGE
        && Math.abs(player.y - guide.y) <= 2
      if (state.dialogueVisible && (!available || obscured || (typeof this.speechKind === 'number' && !this.nearby))) {
        state.dialogueVisible = false; this.speechKind = undefined
      }
      if (this.pendingDefeat && available && !obscured && player && onPlatform(player)) {
        this.openSpeech(this.pendingDefeat)
        this.pendingDefeat = undefined
      }
      const needsSpeech = this.profile && tutorialDialogue(readTutorial({ version: 1,
        steps: this.profile.tutorialSteps, dialogues: this.profile.tutorialDialogues })) !== undefined
      const listen = !!needsSpeech && available && !obscured && this.nearby && !this.busy && this.acknowledging === undefined
      this.setInteraction(listen)
      this.paint()
    }
    if (state.dialogueVisible && this.clock - this.openedAt > .3
      && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) this.acknowledge()
    // E uses exactly the same eligible range as the visible Talk prompt.
    if (this.listening && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) this.request()
  }

  get fishArrowUnlocked(): boolean {
    return !!this.profile && tutorialFishArrow(readTutorial({ version: 1,
      steps: this.profile.tutorialSteps, dialogues: this.profile.tutorialDialogues }))
  }

  navigate(dt: number, snapshot: ArenaSnapshot, mine: FishState | undefined, position: Vector3 | undefined,
    riding: boolean, available: (kind: TutorialTarget['kind'], id: number) => boolean): void {
    this.guidance.update(dt, this.profile, snapshot, mine, position, riding,
      this.obscured || state.dialogueVisible, available)
  }

  private request(): void {
    if (!this.listening || this.busy || !this.available || this.obscured) return
    this.requestedAt = this.clock
    void room.send('guideTalk', {})
  }

  private acknowledge(): void {
    if (!state.dialogueVisible || this.speechKind === undefined || this.clock - this.openedAt < .25) return
    if (typeof this.speechKind === 'number') {
      const pages = GUIDE_LINES[this.speechKind].pages
      if (this.speechPage + 1 < pages.length) {
        this.speechPage++; this.openedAt = this.clock; this.paintSpeech(); return
      }
      this.acknowledging = this.speechKind; this.ackAt = this.clock
      void room.send('guideAcknowledge', { kind: this.speechKind })
    }
    state.dialogueVisible = false; this.speechKind = undefined
    this.paint()
  }

  private openSpeech(kind: number | DefeatKind): void {
    this.speechKind = kind
    this.speechPage = 0
    this.openedAt = this.clock
    this.requestedAt = -100
    state.dialogueVisible = true
    state.questVisible = false
    this.setInteraction(false)
    this.paintSpeech()
  }

  private paintSpeech(): void {
    if (this.speechKind === undefined) return
    const page = typeof this.speechKind === 'number' ? GUIDE_LINES[this.speechKind].pages[this.speechPage]
      : GUIDE_DEFEAT_LINES[this.speechKind]
    state.speech = '<b>' + page.text + '</b>'; state.button = '<b>[E] ' + page.button + '</b>'
  }

  private setInteraction(enabled: boolean): void {
    if (enabled === this.listening || this.clicker === null) return
    this.listening = enabled
    if (enabled) {
      pointerEventsSystem.onProximityDown({ entity: this.clicker, opts: { button: InputAction.IA_PRIMARY,
        hoverText: 'Talk', maxDistance: GUIDE_RANGE, showHighlight: false } }, () => this.request())
    } else {
      pointerEventsSystem.removeOnProximityDown(this.clicker)
    }
  }

  private paint(): void {
    const profile = this.profile
    if (!profile) return
    const complete = profile.tutorialSteps === TUTORIAL_COMPLETE
    const started = (profile.tutorialDialogues & 1) !== 0 || profile.tutorialSteps > 0
    state.questVisible = started && !this.obscured && !state.dialogueVisible && !(complete && (profile.tutorialDialogues & 2) !== 0)
    if (this.paintedSteps === profile.tutorialSteps) return
    this.paintedSteps = profile.tutorialSteps
    const done = TUTORIAL_LESSONS.map(item => (profile.tutorialSteps & item.bit) !== 0)
    const labels = TUTORIAL_LESSONS.map((item, index) => done[index] ? '<s>' + item.title + '</s>' : item.title)
    state.rideDone = done[0]; state.rideLabel = labels[0]
    state.foodDone = done[1]; state.foodLabel = labels[1]
    state.fishDone = done[2]; state.fishLabel = labels[2]
    state.speedDone = done[3]; state.speedLabel = labels[3]
    state.shieldDone = done[4]; state.shieldLabel = labels[4]
    state.dockDone = done[5]; state.dockLabel = labels[5]
  }
  private play(name: string): void {
    if (this.guide === null || !Animator.has(this.guide)) return
    const state = Animator.getClipOrNull(this.guide, name)
    if (state) { state.weight = 1; state.loop = name === 'Idle' }
    Animator.playSingleAnimation(this.guide, name, true)
  }
}
