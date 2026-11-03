import type { FishState, SharkTouch } from '../shared/messages'
import type { ContactPose } from '../shared/fishContactGeometry'
import { fishWaterHeight } from '../shared/fishGeometry'
import { distanceSquared, fishInEatingContact } from '../shared/eating'

interface Target extends FishState { tracking: boolean }
interface Pose { at: number; x: number; z: number; yaw: number }

// One shark and four riders: short server-owned pose histories validate visible contact.
// No velocity prediction or overlapping delay gates can veto an on-screen bite.
export class SharkContact {
  private sharkId = -1
  private poses: Pose[] = []
  private riders = new Map<number, Pose[]>()
  private reports = new Map<number, { shark: number; tick: number; at: number }>()

  update(now: number, shark: FishState | undefined, fish: readonly Target[]): void {
    if (!shark || shark.id !== this.sharkId) {
      this.poses = []; this.reports.clear(); this.sharkId = shark?.id ?? -1
    }
    const append = (poses: Pose[], value: FishState): void => {
      poses.push({ at: now, x: value.x, z: value.z, yaw: value.yaw })
      if (poses.length > 16) poses.shift()
    }
    if (shark) append(this.poses, shark)
    const present = new Set<number>()
    for (const player of fish) {
      if (!player.owner || !player.tracking) continue
      present.add(player.id)
      let poses = this.riders.get(player.id)
      if (!poses) { poses = []; this.riders.set(player.id, poses) }
      append(poses, player)
    }
    for (const id of this.riders.keys()) if (!present.has(id)) { this.riders.delete(id); this.reports.delete(id) }
  }

  confirm(now: number, shark: FishState, prey: FishState, report: SharkTouch): void {
    const a = report.sharkPose, b = report.riderPose
    const valid = (p: ContactPose): boolean => Object.values(p).every(Number.isFinite)
      && Math.abs(p.qx * p.qx + p.qy * p.qy + p.qz * p.qz + p.qw * p.qw - 1) < 0.02
    if (!valid(a) || !valid(b)) return
    const yaw = Math.atan2(2 * (a.qw * a.qy + a.qx * a.qz), 1 - 2 * (a.qx * a.qx + a.qy * a.qy))
    const nearShark = this.poses.some(p => now - p.at <= 0.6 && distanceSquared(p.x, p.z, a.x, a.z) <= 0.75 ** 2
      && Math.abs(Math.atan2(Math.sin(p.yaw - yaw), Math.cos(p.yaw - yaw))) < 0.5)
    const nearRider = this.riders.get(prey.id)?.some(p => now - p.at <= 0.6 && distanceSquared(p.x, p.z, b.x, b.z) <= 1.35 ** 2)
    if (!nearShark || !nearRider || Math.abs(a.y - fishWaterHeight(shark)) > 1.5
      || b.y < fishWaterHeight(prey) - 1 || b.y > fishWaterHeight(prey) + 3.2) return
    if (!fishInEatingContact({ ...shark, pose: a }, { ...prey, pose: b })) return
    const previous = this.reports.get(prey.id)
    if (!previous || report.tick >= previous.tick) this.reports.set(prey.id, { shark: shark.id, tick: report.tick, at: now })
  }

  canBite(now: number, shark: FishState, prey: FishState): boolean {
    const report = this.reports.get(prey.id)
    return !!report && report.shark === shark.id && now - report.at <= 0.25
  }
}
