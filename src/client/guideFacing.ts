import { Entity, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const TURN_RATE = Math.PI // At most 180 degrees per second.
const ANGLE_TOLERANCE = .01

// Only the local guide turns. Keep render-rate smoothing separate from the
// slower marker/route checks so a turn never advances in 100 ms jumps.
export class GuideFacing {
  private yaw?: number

  constructor(private readonly guide: Entity | null) {}

  update(dt: number, player: Vector3 | undefined): void {
    if (this.guide === null || !player || dt <= 0) return
    const guide = Transform.getOrNull(this.guide)
    if (!guide) return
    const dx = player.x - guide.position.x, dz = player.z - guide.position.z
    // A player overlapping the guide gives an unstable facing direction.
    if (dx * dx + dz * dz < .36) return
    if (this.yaw === undefined) {
      const q = guide.rotation
      this.yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x))
    }
    const desired = Math.atan2(dx, dz)
    const difference = Math.atan2(Math.sin(desired - this.yaw), Math.cos(desired - this.yaw))
    if (Math.abs(difference) <= ANGLE_TOLERANCE) return
    // A delayed frame must not become a sudden large rotation.
    const elapsed = Math.min(dt, .05)
    const limit = TURN_RATE * elapsed
    const eased = difference * (1 - Math.exp(-7 * elapsed))
    this.yaw += Math.max(-limit, Math.min(limit, eased))
    this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw))
    Transform.getMutable(this.guide).rotation = Quaternion.fromEulerDegrees(0, this.yaw * 180 / Math.PI, 0)
  }
}
