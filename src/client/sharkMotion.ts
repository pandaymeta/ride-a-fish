import type { FishState } from '../shared/messages'
import { ARENA_TICK_SECONDS } from '../shared/fishJump'
import { constrainSharkToWater } from '../shared/sharkWaters'
interface Pose { tick: number; x: number; z: number; yaw: number }

const BUFFER_TICKS = 3
const MAX_EXTRAPOLATION_TICKS = 2

// A slightly deeper buffer absorbs the server's 100 ms snapshot cadence.
// Smooth the rendered pose instead of snapping between interpolation segments.
export class SharkMotion {
  private poses: Pose[] = []
  private playhead = 0
  private output = { x: 0, z: 0, yaw: 0 }

  push(tick: number, fish: FishState): void {
    const last = this.poses[this.poses.length - 1]
    if (last && tick <= last.tick) return
    if (!last || tick - last.tick > 20 || Math.hypot(fish.x - last.x, fish.z - last.z) > 5) {
      this.poses.length = 0; this.playhead = tick - BUFFER_TICKS
      this.output.x = fish.x; this.output.z = fish.z; this.output.yaw = fish.yaw
    }
    this.poses.push({ tick, x: fish.x, z: fish.z, yaw: fish.yaw })
    if (this.poses.length > 12) this.poses.shift()
  }

  sample(dt: number): Readonly<{ x: number; z: number; yaw: number }> {
    const poses = this.poses, latest = poses[poses.length - 1]
    if (!latest) return this.output
    const desired = latest.tick - BUFFER_TICKS
    const correction = Math.max(-0.03, Math.min(0.03, (desired - this.playhead) * 0.02))
    this.playhead = Math.min(latest.tick + MAX_EXTRAPOLATION_TICKS,
      this.playhead + Math.min(dt, 0.1) / ARENA_TICK_SECONDS * (1 + correction))
    let a = poses[0], b = a
    for (let i = 1; i < poses.length; i++) {
      b = poses[i]
      if (b.tick >= this.playhead) break
      a = b
    }
    if (this.playhead > latest.tick && poses.length > 1) { a = poses[poses.length - 2]; b = latest }
    const gap = Math.max(1, b.tick - a.tick)
    const t = a === b ? 0 : Math.max(0, Math.min(1 + MAX_EXTRAPOLATION_TICKS / gap, (this.playhead - a.tick) / gap))
    const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t
    const turn = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw))
    const yaw = a.yaw + turn * Math.min(1, t)
    const blend = 1 - Math.exp(-Math.max(0, dt) * 24)
    this.output.x += (x - this.output.x) * blend
    this.output.z += (z - this.output.z) * blend
    const yawError = yaw - this.output.yaw
    this.output.yaw += Math.atan2(Math.sin(yawError), Math.cos(yawError)) * blend
    // Extrapolation may lead the server pose briefly; keep the rendered shark inside too.
    constrainSharkToWater(this.output)
    return this.output
  }
}
