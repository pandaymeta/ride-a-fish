import type { Vector3 } from '@dcl/sdk/math'
import { InputAction, inputSystem } from '@dcl/sdk/ecs'
import { getPlatform, isMobile } from '@dcl/sdk/platform'
import { state } from '../ui/TutorialControls'
import { pickupCanvas, projectPickup } from './pickupProjection'

export class MovementHints {
  private spawnPending = true
  private swimPending = true
  private jumpPending = true
  private wasRiding = false
  private previous?: { x: number; z: number }
  private moved = 0

  update(ready: boolean, phase: string, riding: boolean, settled: boolean, blocked: boolean,
    player: Vector3, fish: Vector3 | undefined, airborne: boolean, interaction = '', interactionPosition?: Vector3): void {
    if (riding !== this.wasRiding) {
      // A new client visit gets one set of hints; later rides and respawns consume them.
      if (riding) this.spawnPending = false
      else { this.swimPending = false; this.jumpPending = false }
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
    // Teach swimming before showing the jump hint.
    state.jumpVisible = eligible && keyboard && riding && !this.swimPending && this.jumpPending
    state.moveLabel = riding ? 'Swim' : 'Move'
    state.interactLabel = interaction
    state.interactVisible = keyboard && !blocked && !!interaction
    if (!state.moveVisible && !state.jumpVisible && !state.interactVisible) return
    const canvas = pickupCanvas()
    const anchor = projectPickup({ x: player.x, y: player.y + (riding ? .5 : 1), z: player.z }, canvas)
      ?? { x: canvas.width / 2, y: canvas.height * .55 }
    const x = anchor.x - canvas.left, y = anchor.y - canvas.top
    state.moveLeft = Math.max(16, Math.min(canvas.safeWidth - 180, x - 244))
    state.moveTop = Math.max(16, Math.min(canvas.safeHeight - 88, y - 36))
    state.jumpLeft = Math.max(16, Math.min(canvas.safeWidth - 148, x + 80))
    state.jumpTop = Math.max(16, Math.min(canvas.safeHeight - 96, y - 18))
    const target = interactionPosition ? projectPickup(interactionPosition, canvas) : null
    state.interactVisible = state.interactVisible && target !== null
    if (target) {
      state.interactLeft = Math.round(Math.max(16, Math.min(canvas.safeWidth - 128, target.x - canvas.left - 56)))
      state.interactTop = Math.round(Math.max(16, Math.min(canvas.safeHeight - 52, target.y - canvas.top - 18)))
    }
  }
}
