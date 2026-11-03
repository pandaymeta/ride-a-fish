import type { FishState } from './messages'
import { fishBodyScale, fishWaterHeight } from './fishGeometry'

interface Vector { x: number; y: number; z: number }
export interface ContactPose extends Vector { qx: number; qy: number; qz: number; qw: number }
export interface ContactFish extends FishState { y?: number; pose?: ContactPose }
interface Box { center: Vector; axes: Vector[]; half: number[] }
const dot = (a: Vector, b: Vector): number => a.x * b.x + a.y * b.y + a.z * b.z
const cross = (a: Vector, b: Vector): Vector => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })

function box(fish: ContactFish, scale: number, offsetY: number, offsetZ: number, width: number, height: number, length: number): Box {
  const p = fish.pose
  const x = p?.qx ?? 0, y = p?.qy ?? Math.sin(fish.yaw / 2), z = p?.qz ?? 0, w = p?.qw ?? Math.cos(fish.yaw / 2)
  const axes = [
    { x: 1 - 2 * (y * y + z * z), y: 2 * (x * y + z * w), z: 2 * (x * z - y * w) },
    { x: 2 * (x * y - z * w), y: 1 - 2 * (x * x + z * z), z: 2 * (y * z + x * w) },
    { x: 2 * (x * z + y * w), y: 2 * (y * z - x * w), z: 1 - 2 * (x * x + y * y) }
  ]
  return { center: { x: (p?.x ?? fish.x) + scale * (axes[1].x * offsetY + axes[2].x * offsetZ),
    y: (p?.y ?? fish.y ?? fishWaterHeight(fish, scale)) + scale * (axes[1].y * offsetY + axes[2].y * offsetZ),
    z: (p?.z ?? fish.z) + scale * (axes[1].z * offsetY + axes[2].z * offsetZ) }, axes,
    half: [width * scale, height * scale, length * scale] }
}

function overlaps(a: Box, b: Box): boolean {
  const delta = { x: b.center.x - a.center.x, y: b.center.y - a.center.y, z: b.center.z - a.center.z }
  const separated = (axis: Vector): boolean => {
    if (dot(axis, axis) < 0.000001) return false
    let reach = 0
    for (let n = 0; n < 3; n++) reach += Math.abs(dot(a.axes[n], axis)) * a.half[n] + Math.abs(dot(b.axes[n], axis)) * b.half[n]
    return Math.abs(dot(delta, axis)) > reach + 0.015
  }
  for (const axis of a.axes) if (separated(axis)) return false
  for (const axis of b.axes) if (separated(axis)) return false
  for (const ax of a.axes) for (const bx of b.axes) if (separated(cross(ax, bx))) return false
  return true
}

// Model-fitted hammerhead and trunk volumes; thin fins and tail do not cause distant bites.
// Rendered quaternions include wave pitch, roll and jumps on the contact-reporting client.
export function sharkBodyContact(shark: ContactFish, prey: ContactFish): boolean {
  const scale = fishBodyScale(shark), small = fishBodyScale(prey)
  const body = box(prey, small, 0, 0, 0.265, 0.402, 0.49)
  return overlaps(box(shark, scale, 0.035, 0.395, 0.375, 0.155, 0.105), body)
    || overlaps(box(shark, scale, -0.03, 0.04, 0.16, 0.20, 0.24), body)
}
