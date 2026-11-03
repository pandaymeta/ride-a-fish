import { BOARDING_SPOTS, loadBoardingSpots } from './boarding'
import { loadDockSurfaces } from './dockSurfaces'
import { ISLAND_OUTLINE } from './islandProfile'
import { addSandCollision, clearSandCollisions } from './sandCollision'
import { configureLagoonFromIsland, LAGOON_AREA, LAGOON_CENTER_X, LAGOON_CENTER_Z, LAGOON_RADIUS } from './lagoon'
import { LOBBY_ISLAND, lobbySurfaceY, insideLobbyIsland } from './lobbyIsland'
import { engine, getWorldPosition, Transform, GltfContainer } from '@dcl/sdk/ecs'
import { getSceneInformation } from '~system/Runtime'
import { SEA_Y, ENTRY_POINTS, LOBBY, LOBBY_LOOK_AT, setStageHeight, STAGE } from './config'

interface Point { x: number; y: number; z: number }
interface SpawnPoint {
  default?: boolean
  position?: { x?: number | number[]; y?: number | number[]; z?: number | number[] }
  cameraTarget?: Point
}

function coordinate(value: number | number[] | undefined): number {
  return Array.isArray(value) ? (value[0] + value[1]) / 2 : value ?? NaN
}

function finitePoint(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)
}

// Read authored placement once before either the client or server starts.
export async function loadSceneLayout(): Promise<void> {
  const stage = engine.getEntityOrNullByName('Sand Dune')
  if (stage === null) throw new Error('Missing editor-authored lobby island.')
  loadBoardingSpots()
  loadDockSurfaces()
  const position = getWorldPosition(engine, stage)
  const scale = Transform.get(stage).scale
  // Read the authored envelope; the GLB footprint supplies its irregular shoreline.
  const q = Transform.get(stage).rotation
  const xx = 1 - 2 * (q.y * q.y + q.z * q.z), xy = 2 * (q.x * q.y - q.z * q.w), xz = 2 * (q.x * q.z + q.y * q.w)
  const yx = 2 * (q.x * q.y + q.z * q.w), yy = 1 - 2 * (q.x * q.x + q.z * q.z), yz = 2 * (q.y * q.z - q.x * q.w)
  const zx = 2 * (q.x * q.z - q.y * q.w), zy = 2 * (q.y * q.z + q.x * q.w), zz = 1 - 2 * (q.x * q.x + q.y * q.y)
  const extent = (a: number, b: number, c: number): number => Math.hypot(a * scale.x, b * scale.y, c * scale.z) / 2
  Object.assign(LOBBY_ISLAND, { x: position.x, z: position.z, centerY: position.y,
    irregular: (GltfContainer.getOrNull(stage)?.src ?? "").includes("central-bay-island"),
    radiusX: extent(xx, xy, xz), radiusZ: extent(zx, zy, zz), halfHeight: extent(yx, yy, yz) })
  const lower = engine.getEntityOrNullByName('Sand Dune_2')
  const lowerTransform = lower === null ? null : Transform.getOrNull(lower)
  const lowerPosition = lower === null ? null : getWorldPosition(engine, lower)
  const sameOutline = lower !== null && (GltfContainer.getOrNull(lower)?.src ?? '').includes('central-bay-island')
  const alignedLower = sameOutline && lowerTransform && lowerPosition && Math.hypot(lowerPosition.x - position.x, lowerPosition.z - position.z) < 0.1
  LOBBY_ISLAND.shoreRadiusX = Math.max(LOBBY_ISLAND.radiusX, alignedLower ? Math.abs(lowerTransform.scale.x) / 2 : 0)
  LOBBY_ISLAND.shoreRadiusZ = Math.max(LOBBY_ISLAND.radiusZ, alignedLower ? Math.abs(lowerTransform.scale.z) / 2 : 0)
  clearSandCollisions()
  addSandCollision(position, scale, q, SEA_Y)
  if (sameOutline && lowerPosition && lowerTransform) addSandCollision(lowerPosition, lowerTransform.scale, lowerTransform.rotation, SEA_Y)
  configureLagoonFromIsland()
  const entryOffset = LAGOON_RADIUS * 0.55
  ENTRY_POINTS.forEach((entry, index) => {
    entry.x = position.x + (index % 2 ? 1 : -1) * entryOffset
    entry.z = position.z + (index < 2 ? 1 : -1) * entryOffset
  })
  console.log('[LAYOUT] Circular arena:', JSON.stringify({ center: { x: LAGOON_CENTER_X, z: LAGOON_CENTER_Z },
    radius: LAGOON_RADIUS, usableWaterBefore: LAGOON_AREA.before, usableWaterAfter: LAGOON_AREA.after }))
  const footprint = ISLAND_OUTLINE.map(([x, z]) => ({
    x: position.x + xx * x * scale.x + xz * z * scale.z,
    z: position.z + zx * x * scale.x + zz * z * scale.z
  }))
  STAGE.minX = Math.min(...footprint.map(p => p.x)); STAGE.maxX = Math.max(...footprint.map(p => p.x))
  STAGE.minZ = Math.min(...footprint.map(p => p.z)); STAGE.maxZ = Math.max(...footprint.map(p => p.z))
  setStageHeight(position.y + LOBBY_ISLAND.halfHeight)
  Object.assign(LOBBY, { x: position.x, y: lobbySurfaceY(position.x, position.z + 5.5) + 0.15, z: position.z + 5.5 })
  try {
    const scene = await getSceneInformation({})
    const metadata = JSON.parse(scene.metadataJson) as { spawnPoints?: SpawnPoint[] }
    const spawn = metadata.spawnPoints?.find(point => point.default) ?? metadata.spawnPoints?.[0]
    if (spawn?.position) {
      const point = { x: coordinate(spawn.position.x), y: coordinate(spawn.position.y), z: coordinate(spawn.position.z) }
      if (finitePoint(point) && insideLobbyIsland(point.x, point.z)) {
        // A marker on the island can be placed fractionally inside its collision surface.
        if (point.x >= STAGE.minX && point.x <= STAGE.maxX && point.z >= STAGE.minZ && point.z <= STAGE.maxZ) {
          point.y = Math.max(point.y, lobbySurfaceY(point.x, point.z) + 0.15)
        }
        Object.assign(LOBBY, point)
      }
    }
    if (spawn?.cameraTarget && finitePoint(spawn.cameraTarget)) Object.assign(LOBBY_LOOK_AT, spawn.cameraTarget)
  } catch (error) {
    console.log('[LAYOUT] Using the authored island as the lobby spawn.', String(error))
  }
  console.log('[LAYOUT] Editor lobby loaded:', JSON.stringify({ islandTop: STAGE.top, spawn: LOBBY, boardingSpots: BOARDING_SPOTS.length }))
}
