import { engine, Entity, MainCamera, Transform, UiCanvasInformation, VirtualCamera } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import { state } from '../ui/RideHud'

export interface PickupCanvas {
  width: number; height: number; aspect: number; scale: number
  left: number; top: number; safeWidth: number; safeHeight: number
}
export interface ScreenPoint { x: number; y: number }

export function pickupCanvas(): PickupCanvas {
  const info = UiCanvasInformation.getOrNull(engine.RootEntity)
  const rawWidth = info?.width || 1920
  const rawHeight = info?.height || 1080
  const scale = Math.min(rawWidth / (isMobile() ? 1600 : 1920), rawHeight / (isMobile() ? 720 : 1080))
  const inset = info?.screenInsetArea
  // The editable HUD aggregator has both renderer and component device insets.
  const left = 2 * (inset?.left ?? 0) / scale
  const top = 2 * (inset?.top ?? 0) / scale
  return { width: rawWidth / scale, height: rawHeight / scale, aspect: rawWidth / rawHeight,
    scale, left, top, safeWidth: rawWidth / scale - left - 2 * (inset?.right ?? 0) / scale,
    safeHeight: rawHeight / scale - top - 2 * (inset?.bottom ?? 0) / scale }
}

export function projectPickup(point: Vector3, canvas: PickupCanvas): ScreenPoint | null {
  const camera = Transform.getOrNull(engine.CameraEntity)
  if (!camera) return null
  const q = camera.rotation
  const local = Vector3.rotate(Vector3.subtract(point, camera.position), Quaternion.create(-q.x, -q.y, -q.z, q.w))
  if (local.z <= 0.05) return null
  const activeCamera = MainCamera.getOrNull(engine.CameraEntity)?.virtualCameraEntity
  const fov = activeCamera === undefined ? 60 : VirtualCamera.getOrNull(activeCamera as Entity)?.fov ?? 60
  const tangent = Math.tan(fov * Math.PI / 360)
  const nx = local.x / (local.z * tangent * canvas.aspect)
  const ny = local.y / (local.z * tangent)
  if (Math.abs(nx) > 1.05 || Math.abs(ny) > 1.05) return null
  return { x: (nx + 1) * canvas.width / 2, y: (1 - ny) * canvas.height / 2 }
}

export function pickupTarget(cash: boolean, canvas: PickupCanvas): ScreenPoint {
  const right = cash ? state.cashRight : state.indexRight
  const inset = right.endsWith('%') ? parseFloat(right) * canvas.safeWidth / 100 : parseFloat(right)
  return {
    x: canvas.left + canvas.safeWidth - inset - (cash ? state.cashIconSize / 2 : 58),
    y: canvas.top + (cash ? state.cashTop + 32 : state.indexTop + 58)
  }
}
