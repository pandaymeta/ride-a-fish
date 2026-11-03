/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'

export const state = {
  display: 'none' as 'flex' | 'none', popup: '', popupOpacity: 0,
  popupColor: { r: 0, g: 0.67, b: 1, a: 1 }
}

export function PowerupHud() {
  return <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { top: 0, left: 0 }, display: state.display, pointerFilter: 'none' }}>
    <Label value={state.popup} font="serif" color={state.popupColor} fontSize={30} uiTransform={{ width: 480, height: 48, positionType: 'absolute', position: { top: 320, left: '35%' }, opacity: state.popupOpacity, pointerFilter: 'none' }} />
  </UiEntity>
}
