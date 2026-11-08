export const BOUNDARY_LABEL_SHOW_DISTANCE = 6
export const BOUNDARY_LABEL_HIDE_DISTANCE = 8

// Hysteresis keeps the label from flickering at the proximity threshold.
export function nearOceanBoundary(distance: number, radius: number, visible: boolean): boolean {
  return Number.isFinite(distance) && Math.abs(distance - radius) <=
    (visible ? BOUNDARY_LABEL_HIDE_DISTANCE : BOUNDARY_LABEL_SHOW_DISTANCE)
}

export function nearestBoundaryPoint(point: { x: number; z: number }, centerX: number, centerZ: number,
  radius: number): { x: number; z: number } {
  const dx = point.x - centerX, dz = point.z - centerZ
  const distance = Math.hypot(dx, dz)
  if (distance < .001) return { x: centerX, z: centerZ + radius }
  return { x: centerX + dx / distance * radius, z: centerZ + dz / distance * radius }
}

// Follow the shortest arc each render frame. Exponential damping has the same response at any frame rate.
export function smoothBoundaryPoint(current: { x: number; z: number }, target: { x: number; z: number },
  centerX: number, centerZ: number, radius: number, dt: number): { x: number; z: number } {
  const from = Math.atan2(current.z - centerZ, current.x - centerX)
  const to = Math.atan2(target.z - centerZ, target.x - centerX)
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  const angle = from + delta * (1 - Math.exp(-12 * Math.max(0, Math.min(dt, .1))))
  return { x: centerX + Math.cos(angle) * radius, z: centerZ + Math.sin(angle) * radius }
}
