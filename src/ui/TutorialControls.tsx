/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { useInteraction } from './interaction'
import { TutorialKeycap } from './TutorialKeycap'

export interface State { moveVisible: boolean; jumpVisible: boolean; moveLabel: string }
export const state: State = { moveVisible: false, jumpVisible: false, moveLabel: 'Move' }

/** @ui-component */
export function TutorialControls() {
  const move = useInteraction({
    base: { uiTransform: { width: 180, height: 36, margin: { left: 5, right: 5 }, padding: 6, borderRadius: 10,
      flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' }, uiBackground: { color: { r: 0, g: .018, b: .025, a: .86 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.moveVisible !== true)
  const jump = useInteraction({
    base: { uiTransform: { width: 132, height: 36, margin: { left: 5, right: 5 }, padding: 6, borderRadius: 10,
      flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' }, uiBackground: { color: { r: 0, g: .018, b: .025, a: .86 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.jumpVisible !== true)
  return <UiEntity uiTransform={{ width: '100%', height: 36, positionType: 'absolute', position: { left: 0, bottom: 96 },
    flexDirection: 'row', justifyContent: 'center', pointerFilter: 'none' }}>
    <UiEntity {...move}>
      <UiEntity uiTransform={{ width: 108, height: 24, flexDirection: 'row', justifyContent: 'space-between', pointerFilter: 'none' }}>
        <UiEntity uiTransform={{ width: 24, height: 24, pointerFilter: 'none' }}><TutorialKeycap label="W" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, pointerFilter: 'none' }}><TutorialKeycap label="A" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, pointerFilter: 'none' }}><TutorialKeycap label="S" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, pointerFilter: 'none' }}><TutorialKeycap label="D" /></UiEntity>
      </UiEntity>
      <Label value={`<b>${state.moveLabel}</b>`} font="sans-serif" fontSize={16} color={{ r: 1, g: 1, b: 1, a: 1 }} textAlign="middle-left" textWrap="nowrap"
        uiTransform={{ width: 52, height: 24, padding: 0, margin: { left: 8 }, pointerFilter: 'none' }} />
    </UiEntity>
    <UiEntity {...jump}>
      <UiEntity uiTransform={{ width: 64, height: 24, borderWidth: 2, borderRadius: 6,
        borderColor: { r: .94, g: .94, b: .94, a: 1 }, justifyContent: 'center', alignItems: 'center', pointerFilter: 'none' }}
        uiBackground={{ color: { r: .035, g: .045, b: .05, a: 1 } }}>
        <Label value="<b>SPACE</b>" font="sans-serif" fontSize={14} color={{ r: .96, g: .43, b: .24, a: 1 }} textAlign="middle-center" textWrap="nowrap"
          uiTransform={{ width: 60, height: 20, padding: 0, pointerFilter: 'none' }} />
      </UiEntity>
      <Label value="<b>Jump</b>" font="sans-serif" fontSize={16} color={{ r: 1, g: 1, b: 1, a: 1 }} textAlign="middle-left" textWrap="nowrap"
        uiTransform={{ width: 48, height: 24, padding: 0, margin: { left: 8 }, pointerFilter: 'none' }} />
    </UiEntity>
  </UiEntity>
}
