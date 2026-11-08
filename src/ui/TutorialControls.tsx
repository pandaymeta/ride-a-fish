/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { useInteraction } from './interaction'
import { TutorialKeycap } from './TutorialKeycap'

export interface State {
  moveVisible: boolean; jumpVisible: boolean; interactVisible: boolean
  moveLabel: string; interactLabel: string
  moveLeft: number; moveTop: number; jumpLeft: number; jumpTop: number; interactLeft: number; interactTop: number
}
export const state: State = {
  moveVisible: false, jumpVisible: false, interactVisible: false, moveLabel: 'Move', interactLabel: '',
  moveLeft: 0, moveTop: 0, jumpLeft: 0, jumpTop: 0, interactLeft: 0, interactTop: 0
}

/** @ui-component */
export function TutorialControls() {
  const move = useInteraction({
    base: { uiTransform: { width: 164, height: 72, positionType: 'absolute', position: { left: state.moveLeft, top: state.moveTop }, padding: 8, borderRadius: 10,
      flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' }, uiBackground: { color: { r: 0, g: .018, b: .025, a: .86 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.moveVisible !== true)
  const jump = useInteraction({
    base: { uiTransform: { width: 132, height: 36, positionType: 'absolute', position: { left: state.jumpLeft, top: state.jumpTop }, padding: 6, borderRadius: 10,
      flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' }, uiBackground: { color: { r: 0, g: .018, b: .025, a: .86 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.jumpVisible !== true)
  const interact = useInteraction({
    base: { uiTransform: { width: 112, height: 36, positionType: 'absolute', position: { left: state.interactLeft, top: state.interactTop },
      padding: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', pointerFilter: 'none' },
      uiBackground: { color: { r: 0, g: .018, b: .025, a: .86 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.interactVisible !== true)
  return <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { left: 0, top: 0 }, pointerFilter: 'none' }}>
    <UiEntity {...move}>
      <UiEntity uiTransform={{ width: 80, height: 52, pointerFilter: 'none' }}>
        <UiEntity uiTransform={{ width: 24, height: 24, positionType: 'absolute', position: { left: 28, top: 0 }, pointerFilter: 'none' }}><TutorialKeycap label="W" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, positionType: 'absolute', position: { left: 0, top: 28 }, pointerFilter: 'none' }}><TutorialKeycap label="A" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, positionType: 'absolute', position: { left: 28, top: 28 }, pointerFilter: 'none' }}><TutorialKeycap label="S" /></UiEntity>
        <UiEntity uiTransform={{ width: 24, height: 24, positionType: 'absolute', position: { left: 56, top: 28 }, pointerFilter: 'none' }}><TutorialKeycap label="D" /></UiEntity>
      </UiEntity>
      <Label value={`<b>${state.moveLabel}</b>`} font="sans-serif" fontSize={16} color={{ r: 1, g: 1, b: 1, a: 1 }} textAlign="middle-left" textWrap="nowrap"
        uiTransform={{ width: 52, height: 24, padding: 0, margin: { left: 8 }, pointerFilter: 'none' }} />
    </UiEntity>
    <UiEntity {...jump}>
      <UiEntity uiTransform={{ width: 64, height: 24, pointerFilter: 'none' }}>
        <UiEntity uiTransform={{ width: 64, height: 24, positionType: 'absolute', position: { left: 0, top: 0 }, borderWidth: 2, borderRadius: 6,
          borderColor: { r: .94, g: .94, b: .94, a: 1 }, pointerFilter: 'none' }}
          uiBackground={{ color: { r: .035, g: .045, b: .05, a: 1 } }} />
        <Label value="<b>SPACE</b>" font="sans-serif" fontSize={14} color={{ r: .96, g: .43, b: .24, a: 1 }} textAlign="middle-center" textWrap="nowrap"
          uiTransform={{ width: 64, height: 24, positionType: 'absolute', position: { left: 0, top: 0 }, padding: 0, pointerFilter: 'none' }} />
      </UiEntity>
      <Label value="<b>Jump</b>" font="sans-serif" fontSize={16} color={{ r: 1, g: 1, b: 1, a: 1 }} textAlign="middle-left" textWrap="nowrap"
        uiTransform={{ width: 48, height: 24, padding: 0, margin: { left: 8 }, pointerFilter: 'none' }} />
    </UiEntity>
    <UiEntity {...interact}>
      <UiEntity uiTransform={{ width: 24, height: 24, pointerFilter: 'none' }}><TutorialKeycap label="E" /></UiEntity>
      <Label value={`<b>${state.interactLabel}</b>`} font="sans-serif" fontSize={16} color={{ r: 1, g: 1, b: 1, a: 1 }} textAlign="middle-left" textWrap="nowrap"
        uiTransform={{ width: 64, height: 24, padding: 0, margin: { left: 8 }, pointerFilter: 'none' }} />
    </UiEntity>
  </UiEntity>
}
