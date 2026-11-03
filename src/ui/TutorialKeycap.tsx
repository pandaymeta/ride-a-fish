/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'

/** @ui-component */
export function TutorialKeycap(props: { label?: string }) {
  return <UiEntity uiTransform={{ width: 24, height: 24, borderWidth: 2, borderRadius: 6,
    borderColor: { r: .94, g: .94, b: .94, a: 1 }, justifyContent: 'center', alignItems: 'center', pointerFilter: 'none' }}
    uiBackground={{ color: { r: .035, g: .045, b: .05, a: 1 } }}>
    <Label value={`<b>${props.label}</b>`} font="sans-serif" fontSize={14} color={{ r: .96, g: .43, b: .24, a: 1 }} textAlign="middle-center" textWrap="nowrap"
      uiTransform={{ width: 20, height: 20, padding: 0, pointerFilter: 'none' }} />
  </UiEntity>
}
