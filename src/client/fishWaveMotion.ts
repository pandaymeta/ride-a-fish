import { Entity, Transform } from '@dcl/sdk/ecs'
import { Quaternion } from '@dcl/sdk/math'

const DEG = 180 / Math.PI
const HEAVE_A = 0.36
const HEAVE_B = 0.12

// Broad swells with a reliable vertical cycle in every swimming direction.
// No physics queries, extra entities, or network messages.
export class FishWaveMotion {
  private strength = 0
  private intensity = 1
  private previousHeave = 0
  private verticalSpeed = 0
  private previousYaw?: number
  private bank = 0
  private pitch = 0

  update(root: Entity, baseHeight: number, time: number, dt: number,
    moving: boolean, boosting: boolean, enabled = true, bodyHeight = 1, steering = 0, jumpHeight = 0, jumpVelocity = 0, airborne = false): void {
    const t = Transform.getMutable(root)
    const q = t.rotation
    const yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.x * q.x + q.y * q.y))
    // Boarding/reseating needs a stationary target before the swell fades in.
    this.strength = enabled ? this.strength + (1 - this.strength) * (1 - Math.exp(-dt * 2.5)) : 0
    this.intensity += ((moving ? boosting ? 1.65 : 1.35 : 1) - this.intensity) * (1 - Math.exp(-dt * 3))
    const gain = this.strength * this.intensity
    // Bank only while turning or holding A/D, then ease back to level.
    const yawStep = this.previousYaw === undefined ? 0 : Math.atan2(Math.sin(yaw - this.previousYaw), Math.cos(yaw - this.previousYaw))
    this.previousYaw = yaw
    const turn = Math.max(-1, Math.min(1, yawStep / Math.max(0.001, dt) / 0.9))
    const bankInput = Math.abs(steering) > 0 ? steering : turn
    const targetBank = enabled ? -10 * bankInput : 0
    this.bank += (targetBank - this.bank) * (1 - Math.exp(-dt * 5))

    // Small spatial phase shifts keep nearby fish in similar water while motion
    // through the map cannot cancel out the up/down cycle.
    const heaveA = time * 1.75 + t.position.x * 0.018 + t.position.z * 0.013
    const heaveB = time * 2.6 - t.position.x * 0.012 + t.position.z * 0.017
    const rawHeave = (HEAVE_A * Math.sin(heaveA) + HEAVE_B * Math.sin(heaveB)) * gain
    const dipLimit = Math.min(0.62, Math.max(0.1, bodyHeight * 0.4))
    const heave = rawHeave < 0 ? dipLimit * Math.tanh(rawHeave / dipLimit) : rawHeave
    const totalHeave = heave + jumpHeight
    const velocity = enabled ? Math.max(-1.6, Math.min(1.6, (heave - this.previousHeave) / Math.max(0.001, dt))) : 0
    this.verticalSpeed = enabled ? this.verticalSpeed + (velocity - this.verticalSpeed) * (1 - Math.exp(-dt * 8)) : 0
    this.previousHeave = heave
    // Negative X pitch lifts the nose; positive X pitch points it into a dive.
    const inertia = Math.min(1, Math.sqrt(2 / Math.max(0.1, bodyHeight)))
    // Follow the arc's tangent through its apex, rather than the saturated wave tilt.
    const targetPitch = airborne
      ? Math.max(-30, Math.min(30, -Math.atan2(jumpVelocity, 5) * DEG)) * inertia
      : -18 * Math.tanh(this.verticalSpeed * 1.8) * inertia
    this.pitch += (targetPitch - this.pitch) * (1 - Math.exp(-dt * 6))
    t.position.y = baseHeight + totalHeave
    t.rotation = Quaternion.multiply(Quaternion.fromEulerDegrees(0, yaw * DEG, 0),
      Quaternion.fromEulerDegrees(this.pitch, 0, this.bank))
  }
}
