// Entry requirements are fish size, never coins. Radii are outer edges in metres.
export const OCEAN_AREAS = [
  { name: 'Common', requiredSize: 0, outerRadius: 62.69560761314979, color: { r: .87, g: .92, b: .96, a: 1 } },
  { name: 'Uncommon', requiredSize: 100, outerRadius: 110, color: { r: .32, g: .94, b: .48, a: 1 } },
  { name: 'Rare', requiredSize: 1000, outerRadius: 160, color: { r: .25, g: .62, b: 1, a: 1 } },
  { name: 'Epic', requiredSize: 10000, outerRadius: 210, color: { r: .75, g: .42, b: 1, a: 1 } },
  { name: 'Legendary', requiredSize: 100000, outerRadius: 265, color: { r: 1, g: .75, b: .18, a: 1 } },
  { name: 'Mythic', requiredSize: 1000000, outerRadius: 325, color: { r: 1, g: .30, b: .57, a: 1 } }
]
export const GRANT_STOCKED_AREAS = 2

export function unlockedAreaIndex(size: number): number {
  let index = 0
  for (let i = 1; i < OCEAN_AREAS.length; i++) if (Number.isFinite(size) && size >= OCEAN_AREAS[i].requiredSize) index = i
  return index
}

export function unlockedOceanRadius(size: number): number { return OCEAN_AREAS[unlockedAreaIndex(size)].outerRadius }
export function stockedOceanRadius(): number { return OCEAN_AREAS[GRANT_STOCKED_AREAS - 1].outerRadius }
export function oceanAreaIndex(distance: number): number {
  const index = OCEAN_AREAS.findIndex(area => distance < area.outerRadius)
  return index < 0 ? OCEAN_AREAS.length - 1 : index
}
export function formatSize(size: number): string {
  if (size >= 1000000) return (size / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M'
  if (size >= 1000) return (size / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  return Math.floor(size).toLocaleString('en-US')
}

// Clamp a rider's centre on the server too; touching a locked gate never ends a ride.
export function constrainToUnlockedOcean(point: { x: number; z: number }, size: number,
  centerX: number, centerZ: number, margin = 0): void {
  const dx = point.x - centerX, dz = point.z - centerZ
  const radius = Math.max(0, unlockedOceanRadius(size) - margin)
  const distance = Math.hypot(dx, dz)
  if (distance <= radius) return
  point.x = centerX + dx / distance * radius
  point.z = centerZ + dz / distance * radius
}
