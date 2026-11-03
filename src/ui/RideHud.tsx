/** @jsx ReactEcs.createElement */
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { actions } from '../client/state'
import { COIN_TEXTURE, INDEX_ICON, textureReady } from '../client/startupTextures'
import { ArcadeText } from '../client/arcadeText'
import { FishIndexBook } from './FishIndexBook'
import { TutorialHud } from './TutorialHud'

export interface State {
  limeTitle: string; limeTitleSize: number; limePanelUvs: number[]; limeMetric: string; limeRarity: string
  limeTint: { r: number; g: number; b: number; a: number }; limePanel: { r: number; g: number; b: number; a: number }; limeRarityColor: { r: number; g: number; b: number; a: number }
  pufferTitle: string; pufferTitleSize: number; pufferPanelUvs: number[]; pufferMetric: string; pufferRarity: string
  pufferTint: { r: number; g: number; b: number; a: number }; pufferPanel: { r: number; g: number; b: number; a: number }; pufferRarityColor: { r: number; g: number; b: number; a: number }
  tunaTitle: string; tunaTitleSize: number; tunaPanelUvs: number[]; tunaMetric: string; tunaRarity: string
  tunaTint: { r: number; g: number; b: number; a: number }; tunaPanel: { r: number; g: number; b: number; a: number }; tunaRarityColor: { r: number; g: number; b: number; a: number }
  grouperTitle: string; grouperTitleSize: number; grouperPanelUvs: number[]; grouperMetric: string; grouperRarity: string
  grouperTint: { r: number; g: number; b: number; a: number }; grouperPanel: { r: number; g: number; b: number; a: number }; grouperRarityColor: { r: number; g: number; b: number; a: number }
  sharkTitle: string; sharkTitleSize: number; sharkPanelUvs: number[]; sharkMetric: string; sharkRarity: string
  sharkTint: { r: number; g: number; b: number; a: number }; sharkPanel: { r: number; g: number; b: number; a: number }; sharkRarityColor: { r: number; g: number; b: number; a: number }
  cash: string; cashFontSize: number; cashIconSize: number; collectionFontSize: number; indexIconSize: number
  cashRight: `${number}%`; cashTop: number; cashTextWidth: number; indexRight: `${number}%`; indexTop: number
  cashTint: { r: number; g: number; b: number; a: number }; indexTint: { r: number; g: number; b: number; a: number }
  phase: string; mass: string; collection: string; save: string; notice: string; result: string
  best: string; lime: string; puffer: string; tuna: string; grouper: string; shark: string
  indexProgress: string; indexFooter: string; indexBest: string
  skinChoice: string; clownfishChoice: string; amberChoice: string
  boardingMessage: string; boardingDisplay: 'none' | 'flex'; indexDisplay: 'flex' | 'none'; skinDisplay: 'flex' | 'none'
}
export const state: State = {
  limeTitle: '???', limeTitleSize: 36, limePanelUvs: [0.673828125,0.048828125,0.673828125,0.326171875,0.951171875,0.326171875,0.951171875,0.048828125], limeMetric: '2', limeRarity: 'Common',
  limeTint: { r: 0, g: 0, b: 0, a: 1 }, limePanel: { r: 1, g: 1, b: 1, a: 1 }, limeRarityColor: { r: 0.9, g: 0.95, b: 1, a: 1 },
  pufferTitle: '???', pufferTitleSize: 36, pufferPanelUvs: [0.673828125,0.048828125,0.673828125,0.326171875,0.951171875,0.326171875,0.951171875,0.048828125], pufferMetric: '6', pufferRarity: 'Uncommon',
  pufferTint: { r: 0, g: 0, b: 0, a: 1 }, pufferPanel: { r: 1, g: 1, b: 1, a: 1 }, pufferRarityColor: { r: 0.9, g: 0.95, b: 1, a: 1 },
  tunaTitle: '???', tunaTitleSize: 36, tunaPanelUvs: [0.673828125,0.048828125,0.673828125,0.326171875,0.951171875,0.326171875,0.951171875,0.048828125], tunaMetric: '18', tunaRarity: 'Rare',
  tunaTint: { r: 0, g: 0, b: 0, a: 1 }, tunaPanel: { r: 1, g: 1, b: 1, a: 1 }, tunaRarityColor: { r: 0.9, g: 0.95, b: 1, a: 1 },
  grouperTitle: '???', grouperTitleSize: 36, grouperPanelUvs: [0.673828125,0.048828125,0.673828125,0.326171875,0.951171875,0.326171875,0.951171875,0.048828125], grouperMetric: '36', grouperRarity: 'Epic',
  grouperTint: { r: 0, g: 0, b: 0, a: 1 }, grouperPanel: { r: 1, g: 1, b: 1, a: 1 }, grouperRarityColor: { r: 0.9, g: 0.95, b: 1, a: 1 },
  sharkTitle: '???', sharkTitleSize: 36, sharkPanelUvs: [0.673828125,0.048828125,0.673828125,0.326171875,0.951171875,0.326171875,0.951171875,0.048828125], sharkMetric: '1,000', sharkRarity: 'Secret',
  sharkTint: { r: 0, g: 0, b: 0, a: 1 }, sharkPanel: { r: 1, g: 1, b: 1, a: 1 }, sharkRarityColor: { r: 0.9, g: 0.95, b: 1, a: 1 },
  cash: '0', cashFontSize: 48, cashIconSize: 60, collectionFontSize: 22, indexIconSize: 96,
  cashRight: '2%', cashTop: 14, cashTextWidth: 36, indexRight: '0.5%', indexTop: 74,
  cashTint: { r: 0.06, g: 0.24, b: 0.13, a: 0.98 }, indexTint: { r: 0.27, g: 0.8, b: 0.96, a: 1 },
  phase: 'Welcome to Ride A Fish', mass: 'Walk to your Clownfish at the dock',
  collection: 'Fish Index  0 / 4', save: 'Connecting to the sea…',
  notice: 'Collect fish. Avoid the shark and bigger players.', result: '', best: 'Personal best  0',
  lime: '???  ·  Eat food, then catch a Lime Fish at size 3.',
  puffer: '???  ·  Reach size 7 to collect a Puffer Fish.',
  tuna: '???  ·  Reach size 19 to collect a Bigeye Tuna.',
  grouper: '???  ·  Reach size 37 to collect the Potato Grouper.',
  shark: '???  ·  Outgrow the roaming shark (starts at 1,000).',
  indexProgress: '0/4', indexFooter: '0 / 4 COLLECTED', indexBest: 'PERSONAL BEST 0',
  skinChoice: 'Selected: Clownfish', clownfishChoice: 'Clownfish  SELECTED', amberChoice: 'Amber Darter',
  boardingMessage: '', boardingDisplay: 'none', indexDisplay: 'none', skinDisplay: 'none'
}


/** @ui-action */
function toggleIndex() { actions.toggleIndex() }
/** @ui-action */
function closeIndex() { state.indexDisplay = 'none' }

export function RideHud() {
  return <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { top: 0, left: 0 }, pointerFilter: 'none' }}>
    <TutorialHud />
    <UiEntity uiTransform={{ width: 560, height: 40, positionType: 'absolute', position: { left: '50%', bottom: 28 }, margin: { left: -280 }, display: state.boardingDisplay, pointerFilter: 'none' }}>
      <ArcadeText value={state.boardingMessage} width={560} height={40} fontSize={22} />
    </UiEntity>
    <UiEntity uiTransform={{ width: 360, height: 64, positionType: 'absolute', position: { right: state.cashRight, top: state.cashTop }, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', pointerFilter: 'none' }}>
      <UiEntity uiTransform={{ width: state.cashTextWidth, height: 64 }}>
        <ArcadeText value={state.cash} width={state.cashTextWidth} height={64} fontSize={state.cashFontSize} align="left" color={{ r: 1, g: 0.8, b: 0.24, a: 1 }} outlineColor={{ r: 0.3, g: 0.13, b: 0.035, a: 1 }} />
      </UiEntity>
      {textureReady(COIN_TEXTURE)
        ? <UiEntity uiTransform={{ width: state.cashIconSize, height: state.cashIconSize, margin: { left: 8 } }} uiBackground={{ texture: { src: COIN_TEXTURE }, textureMode: 'stretch' }} />
        : <ArcadeText value="Coins" width={state.cashIconSize + 16} height={64} fontSize={18} />}
    </UiEntity>
    <UiEntity uiTransform={{ width: 116, height: 116, positionType: 'absolute', position: { right: state.indexRight, top: state.indexTop }, justifyContent: 'center', alignItems: 'center' }} onMouseDown={() => toggleIndex()}>
      {textureReady(INDEX_ICON)
        ? <UiEntity uiTransform={{ width: state.indexIconSize, height: state.indexIconSize }} uiBackground={{ texture: { src: INDEX_ICON }, textureMode: 'stretch' }} />
        : <ArcadeText value="Fish Index" width={116} height={48} fontSize={20} />}
    </UiEntity>
    <UiEntity uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: { left: 0, top: 0 }, display: state.indexDisplay, pointerFilter: 'block' }} uiBackground={{ color: { r: .02, g: .035, b: .07, a: .36 } }}>
      <FishIndexBook />
    </UiEntity>
  </UiEntity>
}
