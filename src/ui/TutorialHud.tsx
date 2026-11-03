/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { useInteraction } from './interaction'
import { actions } from '../client/state'
import { TutorialControls } from './TutorialControls'
import { TutorialQuestRow } from './TutorialQuestRow'
import { GUIDE_BUTTON, GUIDE_FRAME, GUIDE_NAMEPLATE, textureReady } from '../client/startupTextures'

export interface State {
  questVisible: boolean; dialogueVisible: boolean
  rideDone: boolean; foodDone: boolean; fishDone: boolean; speedDone: boolean; shieldDone: boolean; dockDone: boolean
  rideLabel: string; foodLabel: string; fishLabel: string; speedLabel: string; shieldLabel: string; dockLabel: string
  speech: string; button: string
}
export const state: State = {
  questVisible: false, dialogueVisible: false,
  rideDone: false, foodDone: false, fishDone: false, speedDone: false, shieldDone: false, dockDone: false,
  rideLabel: 'Ride a fish', foodLabel: 'Eat a food', fishLabel: 'Eat a fish', speedLabel: 'Collect a Speedbooster',
  shieldLabel: 'Collect a Shield', dockLabel: 'Return to Dock', speech: '', button: '<b>[E] Next</b>'
}

const dialogueTextColor = { r: .46, g: .30, b: .19, a: 1 }
const dialogueFontSize = 23

/** @ui-action */
function acknowledge() { actions.acknowledgeGuide() }

/** @ui-component */
export function TutorialHud() {
  const quest = useInteraction({
    base: { uiTransform: { width: 270, height: 216, positionType: 'absolute', position: { right: 32, top: 220 },
      padding: 12, flexDirection: 'column', borderRadius: 10, pointerFilter: 'none' }, uiBackground: { color: { r: .95, g: .84, b: .65, a: .96 } } },
    active: { uiTransform: { display: 'none' } }
  }, state.questVisible !== true)
  const dialogue = useInteraction({
    base: { uiTransform: { width: '100%', height: '19%', minHeight: 156, positionType: 'absolute', position: { left: 0, bottom: '10%' },
      flexDirection: 'column', alignItems: 'center', pointerFilter: 'none' } },
    active: { uiTransform: { display: 'none' } }
  }, state.dialogueVisible !== true)
  const button = useInteraction({
    base: { uiTransform: { width: '38%', minWidth: 150, height: '24%', positionType: 'absolute', position: { bottom: '10%' },
      alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
      uiBackground: textureReady(GUIDE_BUTTON)
        ? { texture: { src: GUIDE_BUTTON }, textureMode: 'stretch' }
        : { color: { r: .99, g: .92, b: .80, a: 1 } } },
    hover: { uiBackground: { color: { r: 1, g: .95, b: .8, a: 1 } } },
    press: { uiBackground: { color: { r: .88, g: .79, b: .63, a: 1 } } }
  })
  return <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { top: 0, left: 0 }, pointerFilter: 'none' }}>
    <UiEntity {...quest}>
      <Label value="<b>Tutorial Quests</b>" font="serif" fontSize={21} color={{ r: .24, g: .11, b: .04, a: 1 }} textAlign="middle-left"
        uiTransform={{ width: '100%', height: 30, pointerFilter: 'none' }} />
      <TutorialQuestRow title={state.rideLabel} complete={state.rideDone} />
      <TutorialQuestRow title={state.foodLabel} complete={state.foodDone} />
      <TutorialQuestRow title={state.fishLabel} complete={state.fishDone} />
      <TutorialQuestRow title={state.speedLabel} complete={state.speedDone} />
      <TutorialQuestRow title={state.shieldLabel} complete={state.shieldDone} />
      <TutorialQuestRow title={state.dockLabel} complete={state.dockDone} />
    </UiEntity>
    <TutorialControls />
    <UiEntity {...dialogue}>
      <UiEntity uiTransform={{ width: '41%', minWidth: 305, maxWidth: '94%', height: '100%', flexDirection: 'column', alignItems: 'center', pointerFilter: 'block' }}
        uiBackground={textureReady(GUIDE_FRAME) ? { texture: { src: GUIDE_FRAME }, textureMode: 'stretch' }
          : { color: { r: .99, g: .86, b: .69, a: 1 } }}>
        <UiEntity uiTransform={{ width: '25%', minWidth: 110, height: '34%', positionType: 'absolute', position: { top: '-17%' },
          alignSelf: 'center', justifyContent: 'center', alignItems: 'center', pointerFilter: 'none' }}
          uiBackground={textureReady(GUIDE_NAMEPLATE) ? { texture: { src: GUIDE_NAMEPLATE }, textureMode: 'stretch' }
            : { color: { r: .98, g: .79, b: .57, a: 1 } }}>
          <Label value="<b>REAN</b>" font="serif" fontSize={26} color={{ r: .3, g: .14, b: .06, a: 1 }} textAlign="middle-center"
            uiTransform={{ width: '100%', height: '100%', pointerFilter: 'none' }} />
        </UiEntity>
        <Label value={state.speech} font="serif" fontSize={dialogueFontSize} color={dialogueTextColor} textAlign="middle-center" textWrap="wrap"
          uiTransform={{ width: '84%', height: '52%', positionType: 'absolute', position: { top: '12%' }, alignSelf: 'center', pointerFilter: 'none' }} />
        <UiEntity {...button} onMouseDown={() => acknowledge()}>
          <Label value={state.button} font="serif" fontSize={dialogueFontSize} color={dialogueTextColor} textAlign="middle-center"
            uiTransform={{ width: '100%', height: '100%', pointerFilter: 'none' }} />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  </UiEntity>
}
