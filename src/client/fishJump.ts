import { ARENA_TICK_SECONDS, FISH_JUMP_COOLDOWN, FISH_JUMP_DURATION, fishJumpHeight, fishJumpVelocity } from '../shared/fishJump'

// Predict the owner's jump immediately; snapshots replay its approved start for
// other riders without sending a new position message every frame.
export class FishJump {
  private age = FISH_JUMP_DURATION
  private cooldown = 0
  private held = false
  private lastTick = 0
  private predicted = false

  get height(): number { return fishJumpHeight(this.age) }
  get velocity(): number { return fishJumpVelocity(this.age) }
  get airborne(): boolean { return this.age < FISH_JUMP_DURATION }

  reset(): void {
    this.age = FISH_JUMP_DURATION; this.cooldown = 0; this.predicted = false
  }

  sync(startTick: number, snapshotTick: number): void {
    if (startTick <= 0 || startTick === this.lastTick) return
    this.lastTick = startTick
    if (this.predicted) { this.predicted = false; return }
    const age = Math.max(0, (snapshotTick - startTick) * ARENA_TICK_SECONDS)
    this.age = Math.min(age, FISH_JUMP_DURATION)
    this.cooldown = Math.max(0, FISH_JUMP_COOLDOWN - age)
  }

  update(dt: number, enabled: boolean, held: boolean): boolean {
    this.age = Math.min(FISH_JUMP_DURATION, this.age + dt)
    this.cooldown = Math.max(0, this.cooldown - dt)
    const pressed = held && !this.held
    this.held = held
    if (!enabled || !pressed || this.cooldown > 0 || this.age < FISH_JUMP_DURATION) return false
    this.age = 0; this.cooldown = FISH_JUMP_COOLDOWN; this.predicted = true
    return true
  }
}
