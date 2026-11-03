/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { useInteraction } from './interaction'

/** @ui-component */
export function TutorialQuestRow(props: { title?: string; complete?: boolean }) {
  const bullet = useInteraction({
    base: { uiTransform: { width: 12, height: 12, margin: { right: 8 }, borderWidth: 2,
      borderColor: { r: .34, g: .2, b: .09, a: 1 }, borderRadius: 6, pointerFilter: 'none' },
      uiBackground: { color: { r: .34, g: .2, b: .09, a: 0 } } },
    active: { uiBackground: { color: { r: .34, g: .2, b: .09, a: 1 } } }
  }, props.complete === true)
  return <UiEntity uiTransform={{ width: '100%', height: 27, flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' }}>
    <UiEntity {...bullet} />
    <Label value={`${props.title}`} font="serif" fontSize={17} color={{ r: .24, g: .12, b: .05, a: 1 }} textAlign="middle-left"
      uiTransform={{ width: 226, height: '100%', pointerFilter: 'none' }} />
  </UiEntity>
}
