import { ISLAND_OUTLINE } from './islandProfile'

// Cache the exposed edge of both authored sand meshes; the submerged skirt remains swimmable.
const PROFILE = [[0.13, 1], [0.24265, 0.9], [0.35475, 0.78], [0.45011, 0.64], [0.5, 0.48]] as const
function shorelineFactor(height: number): number {
  for (let n = 1; n < PROFILE.length; n++) {
    const [lowY, lowRadius] = PROFILE[n - 1], [highY, highRadius] = PROFILE[n]
    if (height <= highY) {
      const t = Math.max(0, (height - lowY) / (highY - lowY))
      return lowRadius + (highRadius - lowRadius) * t
    }
  }
  return 0.48
}
interface Point { x: number; z: number }
interface SandCollider { points: Point[]; minX: number; maxX: number; minZ: number; maxZ: number }
const colliders: SandCollider[] = []

export function clearSandCollisions(): void { colliders.length = 0 }

export function addSandCollision(position: { x: number; y: number; z: number }, scale: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number; w: number }, waterY: number, waterline?: typeof ISLAND_OUTLINE): void {
  // Block the exposed sand plus 20 cm of shallow shore, rather than the deep skirt.
  // Cache this once; airborne fish still use the same dry-land blocker.
  const useLegacyProfile = !waterline && Math.abs(rotation.x) + Math.abs(rotation.z) < 0.001
  const factor = useLegacyProfile ? shorelineFactor((waterY - 0.2 - position.y) / scale.y) : 1
  const q = rotation
  const xx = 1 - 2 * (q.y * q.y + q.z * q.z), xz = 2 * (q.x * q.z + q.y * q.w)
  const zx = 2 * (q.x * q.z - q.y * q.w), zz = 1 - 2 * (q.x * q.x + q.y * q.y)
  const points = (waterline ?? ISLAND_OUTLINE).map(([x, z]) => ({ x: position.x + xx * x * scale.x * factor + xz * z * scale.z * factor,
    z: position.z + zx * x * scale.x * factor + zz * z * scale.z * factor }))
  colliders.push({ points, minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
    minZ: Math.min(...points.map(p => p.z)), maxZ: Math.max(...points.map(p => p.z)) })
}

function contact(point: Point, collider: SandCollider, radius: number): { x: number; z: number; inside: boolean; distance2: number } | undefined {
  if (point.x < collider.minX - radius || point.x > collider.maxX + radius || point.z < collider.minZ - radius || point.z > collider.maxZ + radius) return
  let inside = false, distance2 = Infinity, nearestX = 0, nearestZ = 0
  const polygon = collider.points
  for (let n = 0, previous = polygon.length - 1; n < polygon.length; previous = n++) {
    const a = polygon[previous], b = polygon[n]
    if ((a.z > point.z) !== (b.z > point.z) && point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z) + a.x) inside = !inside
    const dx = b.x - a.x, dz = b.z - a.z
    const fraction = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz)))
    const x = a.x + dx * fraction, z = a.z + dz * fraction
    const squared = (point.x - x) ** 2 + (point.z - z) ** 2
    if (squared < distance2) { distance2 = squared; nearestX = x; nearestZ = z }
  }
  return inside || distance2 < radius * radius ? { x: nearestX, z: nearestZ, inside, distance2 } : undefined
}

export function insideSandCollision(x: number, z: number, radius = 0): boolean {
  return colliders.some(collider => !!contact({ x, z }, collider, radius))
}

export function resolveSandCollision(point: Point, radius: number): void {
  // The dry shoreline stays solid while airborne: jumping cannot board the lobby.
  // Correct only the inward component, so holding a diagonal slides along the shoreline.
  for (let pass = 0; pass < 3; pass++) {
    let changed = false
    for (const collider of colliders) {
      const hit = contact(point, collider, radius)
      if (!hit) continue
      let nx = point.x - hit.x, nz = point.z - hit.z
      const distance = Math.sqrt(hit.distance2)
      if (hit.inside) { nx = -nx; nz = -nz }
      if (distance < 0.000001) { nx = 1; nz = 0 }
      else { nx /= distance; nz /= distance }
      point.x = hit.x + nx * (radius + 0.01)
      point.z = hit.z + nz * (radius + 0.01)
      changed = true
    }
    if (!changed) break
  }
}

function segmentDistance2(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dz = b.z - a.z
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / Math.max(0.000001, dx * dx + dz * dz)))
  return (p.x - a.x - dx * t) ** 2 + (p.z - a.z - dz * t) ** 2
}

// Exact cached shore segments let the shark approach shallow water directly.
export function segmentCrossesSand(from: Point, goal: Point, radius: number): boolean {
  for (const collider of colliders) {
    if (Math.max(from.x, goal.x) < collider.minX - radius || Math.min(from.x, goal.x) > collider.maxX + radius
      || Math.max(from.z, goal.z) < collider.minZ - radius || Math.min(from.z, goal.z) > collider.maxZ + radius) continue
    if (contact(from, collider, radius) || contact(goal, collider, radius)) return true
    const dx = goal.x - from.x, dz = goal.z - from.z, polygon = collider.points
    for (let n = 0, previous = polygon.length - 1; n < polygon.length; previous = n++) {
      const a = polygon[previous], b = polygon[n], ex = b.x - a.x, ez = b.z - a.z
      const cross = dx * ez - dz * ex
      if (Math.abs(cross) > 0.000001) {
        const ax = a.x - from.x, az = a.z - from.z
        const t = (ax * ez - az * ex) / cross, u = (ax * dz - az * dx) / cross
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true
      }
      if (Math.min(segmentDistance2(a, from, goal), segmentDistance2(b, from, goal),
        segmentDistance2(from, a, b), segmentDistance2(goal, a, b)) < radius * radius) return true
    }
  }
  return false
}
