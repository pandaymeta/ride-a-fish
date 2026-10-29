/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { actions } from '../client/state'

export interface State {
  phase: string; mass: string; collection: string; save: string; notice: string; result: string
  best: string; clown: string; puffer: string; shark: string
  indexDisplay: 'flex' | 'none'; returnDisplay: 'flex' | 'none'
}
export const state: State = {
  phase: 'Welcome to Ride A Fish', mass: 'Step into the glowing floor circle',
  collection: 'Fish Index  0 / 3', save: 'Connecting to the sea…',
  notice: 'Collect static fish. Avoid bigger rival riders.', result: '', best: 'Personal best  0',
  clown: '???  ·  Follow the food near the shallows.',
  puffer: '???  ·  Grow past size 6 before approaching.',
  shark: '???  ·  Reach size 19 before hunting sharks.',
  indexDisplay: 'none', returnDisplay: 'none'
}

/** @ui-action */
function toggleIndex() { actions.toggleIndex() }
/** @ui-action */
function returnToLobby() { actions.returnToLobby() }

export function RideHud() {
  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { top: 0, left: 0 } }}>
      <UiEntity uiTransform={{ width: 480, height: 148, positionType: 'absolute', position: { top: 24, left: '35%' }, padding: 16, flexDirection: 'column', borderRadius: 16 }}
        uiBackground={{ color: { r: 0.025, g: 0.11, b: 0.16, a: 0.95 } }}>
        <Label value="RIDE A FISH" fontSize={24} color={{ r: 0.54, g: 0.95, b: 0.91, a: 1 }} uiTransform={{ width: 448, height: 30 }} />
        <Label value={state.phase} fontSize={17} uiTransform={{ width: 448, height: 24 }} />
        <Label value={state.mass} fontSize={21} uiTransform={{ width: 448, height: 30 }} />
        <Label value={state.save} fontSize={14} color={{ r: 0.74, g: 0.84, b: 0.88, a: 1 }} uiTransform={{ width: 448, height: 24 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 200, height: 52, positionType: 'absolute', position: { top: 185, left: '35%' }, borderRadius: 12 }}
        uiBackground={{ color: { r: 0.1, g: 0.35, b: 0.39, a: 0.98 } }} onMouseDown={() => toggleIndex()}>
        <Label value={state.collection} fontSize={18} uiTransform={{ width: 200, height: 52 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 256, height: 52, positionType: 'absolute', position: { top: 185, left: '49%' }, borderRadius: 12, display: state.returnDisplay }}
        uiBackground={{ color: { r: 0.37, g: 0.17, b: 0.17, a: 0.98 } }} onMouseDown={() => returnToLobby()}>
        <Label value="Return to Lobby" fontSize={18} uiTransform={{ width: 256, height: 52 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 480, height: 254, positionType: 'absolute', position: { top: 250, left: '35%' }, padding: 18, flexDirection: 'column', borderRadius: 16, display: state.indexDisplay }}
        uiBackground={{ color: { r: 0.025, g: 0.11, b: 0.16, a: 0.97 } }}>
        <Label value="YOUR FISH INDEX" fontSize={21} uiTransform={{ width: 444, height: 34 }} />
        <Label value={state.clown} fontSize={16} uiTransform={{ width: 444, height: 44 }} />
        <Label value={state.puffer} fontSize={16} uiTransform={{ width: 444, height: 44 }} />
        <Label value={state.shark} fontSize={16} uiTransform={{ width: 444, height: 44 }} />
        <Label value={state.best} fontSize={16} color={{ r: 1, g: 0.81, b: 0.4, a: 1 }} uiTransform={{ width: 444, height: 28 }} />
        <Label value={state.result} fontSize={14} uiTransform={{ width: 444, height: 34 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 560, height: 54, positionType: 'absolute', position: { bottom: 112, left: '32%' }, borderRadius: 12 }}
        uiBackground={{ color: { r: 0.025, g: 0.11, b: 0.16, a: 0.88 } }}>
        <Label value={state.notice} fontSize={19} uiTransform={{ width: 560, height: 54 }} />
      </UiEntity>
    </UiEntity>
  )
}
