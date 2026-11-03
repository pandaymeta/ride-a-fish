import type { Vector3 } from '@dcl/sdk/math'
import { InputAction, inputSystem } from '@dcl/sdk/ecs'
import { getPlatform, isMobile } from '@dcl/sdk/platform'
import { state } from '../ui/TutorialControls'

export class MovementHints {
  private spawnPending = true
  private swimPending = false
  private jumpPending = false
  private wasRiding = false
  private previous?: { x: number; z: number }
  private moved = 0

  update(ready: boolean, phase: string, riding: boolean, settled: boolean, blocked: boolean,
    player: Vector3, fish: Vector3 | undefined, airborne: boolean): void {
    if (riding !== this.wasRiding) {
      if (riding) { this.swimPending = true; this.jumpPending = true }
      this.previous = undefined; this.moved = 0; this.wasRiding = riding
    }
    const eligible = ready && !blocked && (riding ? settled : phase === 'lobby')
    const position = riding ? fish : player
    if (eligible && position) {
      const held = inputSystem.isPressed(InputAction.IA_FORWARD) || inputSystem.isPressed(InputAction.IA_BACKWARD)
        || inputSystem.isPressed(InputAction.IA_LEFT) || inputSystem.isPressed(InputAction.IA_RIGHT)
      if (held && this.previous) {
        const distance = Math.hypot(position.x - this.previous.x, position.z - this.previous.z)
        // Ignore teleports and boarding corrections; only horizontal travel dismisses WASD.
        if (distance < 1.5) this.moved += distance
        if (this.moved >= .2) {
          if (riding) this.swimPending = false
          else this.spawnPending = false
        }
      }
      this.previous = { x: position.x, z: position.z }
      if (riding && airborne) this.jumpPending = false
    } else this.previous = undefined
    const keyboard = getPlatform() !== null && !isMobile()
    state.moveVisible = eligible && keyboard && (riding ? this.swimPending : this.spawnPending)
    state.jumpVisible = eligible && keyboard && riding && this.jumpPending
    state.moveLabel = riding ? 'Swim' : 'Move'
  }
}
