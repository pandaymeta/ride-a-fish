/** @jsx ReactEcs.createElement */
import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { actions } from '../client/state'
import { INDEX_BOOK, textureReady } from '../client/startupTextures'
import { FishBookTile } from './FishBookTile'

export interface State {
  tileRadius: number
  width: number
  height: number
  offsetX: number
  offsetY: number
  nameX: number
  nameY: number
  nameW: number
  nameH: number
  nameFont: number
  portraitX: number
  portraitY: number
  portraitSize: number
  rarityX: number
  rarityY: number
  rarityW: number
  rarityH: number
  rarityFont: number
  titleX: number
  titleY: number
  titleW: number
  titleH: number
  titleFont: number
  discoveryX: number
  discoveryY: number
  discoveryW: number
  discoveryH: number
  discoveryFont: number
  closeX: number
  closeY: number
  closeSize: number
  closeFont: number
  statIconX: number
  statIconSize: number
  statTextX: number
  statTextW: number
  statH: number
  statFont: number
  statY0: number
  statY1: number
  statY2: number
  statY3: number
  statDividerY: number
  statDividerX: number
  statDividerW: number
  tileW: number
  tileImageSize: number
  tileImageLeft: number
  selectedStroke: number
  col0: number
  row0: number
  rowH0: number
  rowImageTop0: number
  col1: number
  row1: number
  rowH1: number
  rowImageTop1: number
  col2: number
  row2: number
  rowH2: number
  rowImageTop2: number
  col3: number
  row3: number
  rowH3: number
  rowImageTop3: number
  col4: number
  row4: number
  rowH4: number
  rowImageTop4: number
  selectedName: string
  portrait: string
  rarity: string
  discovered: string
  caught: string
  largest: string
  cashValue: string
  bestTime: string
  tile0Image: string
  tile0Outline: { r: number; g: number; b: number; a: number }
  tile1Image: string
  tile1Outline: { r: number; g: number; b: number; a: number }
  tile2Image: string
  tile2Outline: { r: number; g: number; b: number; a: number }
  tile3Image: string
  tile3Outline: { r: number; g: number; b: number; a: number }
  tile4Image: string
  tile4Outline: { r: number; g: number; b: number; a: number }
  tile5Image: string
  tile5Outline: { r: number; g: number; b: number; a: number }
  tile6Image: string
  tile6Outline: { r: number; g: number; b: number; a: number }
  tile7Image: string
  tile7Outline: { r: number; g: number; b: number; a: number }
  tile8Image: string
  tile8Outline: { r: number; g: number; b: number; a: number }
  tile9Image: string
  tile9Outline: { r: number; g: number; b: number; a: number }
  tile10Image: string
  tile10Outline: { r: number; g: number; b: number; a: number }
  tile11Image: string
  tile11Outline: { r: number; g: number; b: number; a: number }
  tile12Image: string
  tile12Outline: { r: number; g: number; b: number; a: number }
  tile13Image: string
  tile13Outline: { r: number; g: number; b: number; a: number }
  tile14Image: string
  tile14Outline: { r: number; g: number; b: number; a: number }
  tile15Image: string
  tile15Outline: { r: number; g: number; b: number; a: number }
  tile16Image: string
  tile16Outline: { r: number; g: number; b: number; a: number }
  tile17Image: string
  tile17Outline: { r: number; g: number; b: number; a: number }
  tile18Image: string
  tile18Outline: { r: number; g: number; b: number; a: number }
  tile19Image: string
  tile19Outline: { r: number; g: number; b: number; a: number }
  tile20Image: string
  tile20Outline: { r: number; g: number; b: number; a: number }
  tile21Image: string
  tile21Outline: { r: number; g: number; b: number; a: number }
  tile22Image: string
  tile22Outline: { r: number; g: number; b: number; a: number }
  tile23Image: string
  tile23Outline: { r: number; g: number; b: number; a: number }
  tile24Image: string
  tile24Outline: { r: number; g: number; b: number; a: number }
  portraitUvs: number[]
  tile0Uvs: number[]
  tile1Uvs: number[]
  tile2Uvs: number[]
  tile3Uvs: number[]
  tile4Uvs: number[]
  tile5Uvs: number[]
  tile6Uvs: number[]
  tile7Uvs: number[]
  tile8Uvs: number[]
  tile9Uvs: number[]
  tile10Uvs: number[]
  tile11Uvs: number[]
  tile12Uvs: number[]
  tile13Uvs: number[]
  tile14Uvs: number[]
  tile15Uvs: number[]
  tile16Uvs: number[]
  tile17Uvs: number[]
  tile18Uvs: number[]
  tile19Uvs: number[]
  tile20Uvs: number[]
  tile21Uvs: number[]
  tile22Uvs: number[]
  tile23Uvs: number[]
  tile24Uvs: number[]
}
export const state: State = {
  "width": 1337.6000000000001,
  "height": 752.8000000000001,
  "offsetX": -668.8000000000001,
  "offsetY": -376.40000000000003,
  "nameX": 172.8,
  "nameY": 100,
  "nameW": 436.8,
  "nameH": 57.6,
  "nameFont": 34.4,
  "portraitX": 232,
  "portraitY": 176.8,
  "portraitSize": 288,
  "rarityX": 196.8,
  "rarityY": 416,
  "rarityW": 144,
  "rarityH": 43.2,
  "rarityFont": 23.200000000000003,
  "titleX": 768,
  "titleY": 51.2,
  "titleW": 408,
  "titleH": 69.60000000000001,
  "titleFont": 56,
  "discoveryX": 798.4000000000001,
  "discoveryY": 116.80000000000001,
  "discoveryW": 360,
  "discoveryH": 36.800000000000004,
  "discoveryFont": 27.200000000000003,
  "closeX": 1203.2,
  "closeY": 60.800000000000004,
  "closeSize": 48,
  "closeFont": 32,
  "statIconX": 168.8,
  "statIconSize": 48,
  "statTextX": 238.4,
  "statTextW": 336.8,
  "statH": 44,
  "statFont": 25.6,
  "statY0": 484,
  "statY1": 536,
  "statY2": 587.2,
  "statY3": 637.6,
  "statDividerY": 681.6,
  "statDividerX": 156.8,
  "statDividerW": 442.40000000000003,
  "tileW": 91.2,
  "tileImageSize": 86.4,
  "tileImageLeft": 0,
  "selectedStroke": 2.4000000000000004,
  "col0": 709.6,
  "row0": 171.20000000000002,
  "rowH0": 91.2,
  "rowImageTop0": 0,
  "col1": 815.2,
  "row1": 275.2,
  "rowH1": 91.2,
  "rowImageTop1": 0,
  "col2": 920.8000000000001,
  "row2": 379.20000000000005,
  "rowH2": 91.2,
  "rowImageTop2": 0,
  "col3": 1026.4,
  "row3": 483.20000000000005,
  "rowH3": 91.2,
  "rowImageTop3": 0,
  "col4": 1132,
  "row4": 587.2,
  "rowH4": 91.2,
  "rowImageTop4": 0,
  "selectedName": "<b>UNDISCOVERED</b>",
  "portrait": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "rarity": "<b>Common</b>",
  "discovered": "<b>0 / 4 Discovered</b>",
  "caught": "<b>Caught:  0</b>",
  "largest": "<b>Largest:  --</b>",
  "cashValue": "<b>Coin value:  2</b>",
  "bestTime": "<b>Best Time:  --</b>",
  "tile0Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile0Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 1
  },
  "tile1Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile1Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile2Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile2Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile3Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile3Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile4Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile4Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile5Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile5Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile6Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile6Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile7Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile7Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile8Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile8Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile9Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile9Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile10Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile10Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile11Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile11Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile12Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile12Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile13Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile13Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile14Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile14Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile15Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile15Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile16Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile16Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile17Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile17Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile18Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile18Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile19Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile19Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile20Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile20Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile21Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile21Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile22Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile22Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile23Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile23Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "tile24Image": "assets/Images/ui/book/fish-silhouettes-uniform.png",
  "tile24Outline": {
    "r": 0.4,
    "g": 0.24,
    "b": 0.11,
    "a": 0
  },
  "portraitUvs": [
    0,
    0.75,
    0,
    1,
    0.125,
    1,
    0.125,
    0.75
  ],
  "tile0Uvs": [
    0,
    0.75,
    0,
    1,
    0.125,
    1,
    0.125,
    0.75
  ],
  "tile1Uvs": [
    0.125,
    0.75,
    0.125,
    1,
    0.25,
    1,
    0.25,
    0.75
  ],
  "tile2Uvs": [
    0.25,
    0.75,
    0.25,
    1,
    0.375,
    1,
    0.375,
    0.75
  ],
  "tile3Uvs": [
    0.375,
    0.75,
    0.375,
    1,
    0.5,
    1,
    0.5,
    0.75
  ],
  "tile4Uvs": [
    0.5,
    0.75,
    0.5,
    1,
    0.625,
    1,
    0.625,
    0.75
  ],
  "tile5Uvs": [
    0.625,
    0.75,
    0.625,
    1,
    0.75,
    1,
    0.75,
    0.75
  ],
  "tile6Uvs": [
    0.75,
    0.75,
    0.75,
    1,
    0.875,
    1,
    0.875,
    0.75
  ],
  "tile7Uvs": [
    0.875,
    0.75,
    0.875,
    1,
    1,
    1,
    1,
    0.75
  ],
  "tile8Uvs": [
    0,
    0.5,
    0,
    0.75,
    0.125,
    0.75,
    0.125,
    0.5
  ],
  "tile9Uvs": [
    0.125,
    0.5,
    0.125,
    0.75,
    0.25,
    0.75,
    0.25,
    0.5
  ],
  "tile10Uvs": [
    0.25,
    0.5,
    0.25,
    0.75,
    0.375,
    0.75,
    0.375,
    0.5
  ],
  "tile11Uvs": [
    0.375,
    0.5,
    0.375,
    0.75,
    0.5,
    0.75,
    0.5,
    0.5
  ],
  "tile12Uvs": [
    0.5,
    0.5,
    0.5,
    0.75,
    0.625,
    0.75,
    0.625,
    0.5
  ],
  "tile13Uvs": [
    0.625,
    0.5,
    0.625,
    0.75,
    0.75,
    0.75,
    0.75,
    0.5
  ],
  "tile14Uvs": [
    0.75,
    0.5,
    0.75,
    0.75,
    0.875,
    0.75,
    0.875,
    0.5
  ],
  "tile15Uvs": [
    0.875,
    0.5,
    0.875,
    0.75,
    1,
    0.75,
    1,
    0.5
  ],
  "tile16Uvs": [
    0,
    0.25,
    0,
    0.5,
    0.125,
    0.5,
    0.125,
    0.25
  ],
  "tile17Uvs": [
    0.125,
    0.25,
    0.125,
    0.5,
    0.25,
    0.5,
    0.25,
    0.25
  ],
  "tile18Uvs": [
    0.25,
    0.25,
    0.25,
    0.5,
    0.375,
    0.5,
    0.375,
    0.25
  ],
  "tile19Uvs": [
    0.375,
    0.25,
    0.375,
    0.5,
    0.5,
    0.5,
    0.5,
    0.25
  ],
  "tile20Uvs": [
    0.5,
    0.25,
    0.5,
    0.5,
    0.625,
    0.5,
    0.625,
    0.25
  ],
  "tile21Uvs": [
    0.625,
    0.25,
    0.625,
    0.5,
    0.75,
    0.5,
    0.75,
    0.25
  ],
  "tile22Uvs": [
    0.75,
    0.25,
    0.75,
    0.5,
    0.875,
    0.5,
    0.875,
    0.25
  ],
  "tile23Uvs": [
    0.875,
    0.25,
    0.875,
    0.5,
    1,
    0.5,
    1,
    0.25
  ],
  "tile24Uvs": [
    0,
    0,
    0,
    0.25,
    0.125,
    0.25,
    0.125,
    0
  ],
  "tileRadius": 12.8
}

/** @ui-action */
function closeBook() { actions.closeIndex() }

/** @ui-component */
export function FishIndexBook() {
  return <UiEntity uiTransform={{ width: state.width, height: state.height, positionType: 'absolute', position: { left: '50%', top: '50%' }, margin: { left: state.offsetX, top: state.offsetY }, pointerFilter: 'block' }}
    uiBackground={textureReady(INDEX_BOOK) ? { texture: { src: INDEX_BOOK }, textureMode: 'stretch' }
      : { color: { r: .99, g: .86, b: .69, a: 1 } }}>
    <Label value={state.selectedName} font="serif" fontSize={state.nameFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-center" textWrap="nowrap" uiTransform={{ width: state.nameW, height: state.nameH, positionType: 'absolute', position: { left: state.nameX, top: state.nameY }, pointerFilter: 'none' }} />
    {textureReady(state.portrait)
      ? <UiEntity uiTransform={{ width: state.portraitSize, height: state.portraitSize, positionType: 'absolute', position: { left: state.portraitX, top: state.portraitY }, pointerFilter: 'none' }} uiBackground={{ texture: { src: state.portrait }, textureMode: 'stretch', uvs: state.portraitUvs }} />
      : <Label value="?" font="serif" fontSize={state.portraitSize * .35} color={{ r: .4, g: .24, b: .11, a: 1 }} textAlign="middle-center"
          uiTransform={{ width: state.portraitSize, height: state.portraitSize, positionType: 'absolute', position: { left: state.portraitX, top: state.portraitY }, pointerFilter: 'none' }} />}
    <Label value={state.rarity} font="serif" fontSize={state.rarityFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-center" textWrap="nowrap" uiTransform={{ width: state.rarityW, height: state.rarityH, positionType: 'absolute', position: { left: state.rarityX, top: state.rarityY }, pointerFilter: 'none' }} />
    <Label value={"<b>FISH INDEX</b>"} font="serif" fontSize={state.titleFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-center" textWrap="nowrap" uiTransform={{ width: state.titleW, height: state.titleH, positionType: 'absolute', position: { left: state.titleX, top: state.titleY }, pointerFilter: 'none' }} />
    <Label value={state.discovered} font="serif" fontSize={state.discoveryFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-center" textWrap="nowrap" uiTransform={{ width: state.discoveryW, height: state.discoveryH, positionType: 'absolute', position: { left: state.discoveryX, top: state.discoveryY }, pointerFilter: 'none' }} />
    <UiEntity uiTransform={{ width: state.statIconSize, height: state.statH, positionType: 'absolute', position: { left: state.statIconX, top: state.statY0 }, pointerFilter: 'none' }} uiBackground={{ texture: { src: 'assets/Images/ui/book/stat-hook.png' }, textureMode: 'stretch' }} />
    <Label value={state.caught} font="serif" fontSize={state.statFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-left" textWrap="nowrap" uiTransform={{ width: state.statTextW, height: state.statH, positionType: 'absolute', position: { left: state.statTextX, top: state.statY0 }, pointerFilter: 'none' }} />
    <UiEntity uiTransform={{ width: state.statIconSize, height: state.statH, positionType: 'absolute', position: { left: state.statIconX, top: state.statY1 }, pointerFilter: 'none' }} uiBackground={{ texture: { src: 'assets/Images/ui/book/stat-ruler.png' }, textureMode: 'stretch' }} />
    <Label value={state.largest} font="serif" fontSize={state.statFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-left" textWrap="nowrap" uiTransform={{ width: state.statTextW, height: state.statH, positionType: 'absolute', position: { left: state.statTextX, top: state.statY1 }, pointerFilter: 'none' }} />
    <UiEntity uiTransform={{ width: state.statIconSize, height: state.statH, positionType: 'absolute', position: { left: state.statIconX, top: state.statY2 }, pointerFilter: 'none' }} uiBackground={{ texture: { src: 'assets/Images/ui/book/stat-coin.png' }, textureMode: 'stretch' }} />
    <Label value={state.cashValue} font="serif" fontSize={state.statFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-left" textWrap="nowrap" uiTransform={{ width: state.statTextW, height: state.statH, positionType: 'absolute', position: { left: state.statTextX, top: state.statY2 }, pointerFilter: 'none' }} />
    <UiEntity uiTransform={{ width: state.statIconSize, height: state.statH, positionType: 'absolute', position: { left: state.statIconX, top: state.statY3 }, pointerFilter: 'none' }} uiBackground={{ texture: { src: 'assets/Images/ui/book/stat-clock.png' }, textureMode: 'stretch' }} />
    <Label value={state.bestTime} font="serif" fontSize={state.statFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-left" textWrap="nowrap" uiTransform={{ width: state.statTextW, height: state.statH, positionType: 'absolute', position: { left: state.statTextX, top: state.statY3 }, pointerFilter: 'none' }} />
    <UiEntity uiTransform={{ width: state.statDividerW, height: 1, positionType: 'absolute', position: { left: state.statDividerX, top: state.statDividerY }, pointerFilter: 'none' }} uiBackground={{ color: { r: .57, g: .34, b: .17, a: .45 } }} />
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH0, positionType: 'absolute', position: { left: state.col0, top: state.row0 } }}>
      <FishBookTile slot={0} width={state.tileW} height={state.rowH0} image={state.tile0Image} uvs={state.tile0Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop0} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile0Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH0, positionType: 'absolute', position: { left: state.col1, top: state.row0 } }}>
      <FishBookTile slot={1} width={state.tileW} height={state.rowH0} image={state.tile1Image} uvs={state.tile1Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop0} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile1Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH0, positionType: 'absolute', position: { left: state.col2, top: state.row0 } }}>
      <FishBookTile slot={2} width={state.tileW} height={state.rowH0} image={state.tile2Image} uvs={state.tile2Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop0} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile2Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH0, positionType: 'absolute', position: { left: state.col3, top: state.row0 } }}>
      <FishBookTile slot={3} width={state.tileW} height={state.rowH0} image={state.tile3Image} uvs={state.tile3Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop0} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile3Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH0, positionType: 'absolute', position: { left: state.col4, top: state.row0 } }}>
      <FishBookTile slot={4} width={state.tileW} height={state.rowH0} image={state.tile4Image} uvs={state.tile4Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop0} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile4Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH1, positionType: 'absolute', position: { left: state.col0, top: state.row1 } }}>
      <FishBookTile slot={5} width={state.tileW} height={state.rowH1} image={state.tile5Image} uvs={state.tile5Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop1} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile5Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH1, positionType: 'absolute', position: { left: state.col1, top: state.row1 } }}>
      <FishBookTile slot={6} width={state.tileW} height={state.rowH1} image={state.tile6Image} uvs={state.tile6Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop1} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile6Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH1, positionType: 'absolute', position: { left: state.col2, top: state.row1 } }}>
      <FishBookTile slot={7} width={state.tileW} height={state.rowH1} image={state.tile7Image} uvs={state.tile7Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop1} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile7Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH1, positionType: 'absolute', position: { left: state.col3, top: state.row1 } }}>
      <FishBookTile slot={8} width={state.tileW} height={state.rowH1} image={state.tile8Image} uvs={state.tile8Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop1} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile8Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH1, positionType: 'absolute', position: { left: state.col4, top: state.row1 } }}>
      <FishBookTile slot={9} width={state.tileW} height={state.rowH1} image={state.tile9Image} uvs={state.tile9Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop1} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile9Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH2, positionType: 'absolute', position: { left: state.col0, top: state.row2 } }}>
      <FishBookTile slot={10} width={state.tileW} height={state.rowH2} image={state.tile10Image} uvs={state.tile10Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop2} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile10Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH2, positionType: 'absolute', position: { left: state.col1, top: state.row2 } }}>
      <FishBookTile slot={11} width={state.tileW} height={state.rowH2} image={state.tile11Image} uvs={state.tile11Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop2} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile11Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH2, positionType: 'absolute', position: { left: state.col2, top: state.row2 } }}>
      <FishBookTile slot={12} width={state.tileW} height={state.rowH2} image={state.tile12Image} uvs={state.tile12Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop2} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile12Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH2, positionType: 'absolute', position: { left: state.col3, top: state.row2 } }}>
      <FishBookTile slot={13} width={state.tileW} height={state.rowH2} image={state.tile13Image} uvs={state.tile13Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop2} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile13Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH2, positionType: 'absolute', position: { left: state.col4, top: state.row2 } }}>
      <FishBookTile slot={14} width={state.tileW} height={state.rowH2} image={state.tile14Image} uvs={state.tile14Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop2} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile14Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH3, positionType: 'absolute', position: { left: state.col0, top: state.row3 } }}>
      <FishBookTile slot={15} width={state.tileW} height={state.rowH3} image={state.tile15Image} uvs={state.tile15Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop3} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile15Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH3, positionType: 'absolute', position: { left: state.col1, top: state.row3 } }}>
      <FishBookTile slot={16} width={state.tileW} height={state.rowH3} image={state.tile16Image} uvs={state.tile16Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop3} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile16Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH3, positionType: 'absolute', position: { left: state.col2, top: state.row3 } }}>
      <FishBookTile slot={17} width={state.tileW} height={state.rowH3} image={state.tile17Image} uvs={state.tile17Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop3} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile17Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH3, positionType: 'absolute', position: { left: state.col3, top: state.row3 } }}>
      <FishBookTile slot={18} width={state.tileW} height={state.rowH3} image={state.tile18Image} uvs={state.tile18Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop3} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile18Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH3, positionType: 'absolute', position: { left: state.col4, top: state.row3 } }}>
      <FishBookTile slot={19} width={state.tileW} height={state.rowH3} image={state.tile19Image} uvs={state.tile19Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop3} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile19Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH4, positionType: 'absolute', position: { left: state.col0, top: state.row4 } }}>
      <FishBookTile slot={20} width={state.tileW} height={state.rowH4} image={state.tile20Image} uvs={state.tile20Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop4} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile20Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH4, positionType: 'absolute', position: { left: state.col1, top: state.row4 } }}>
      <FishBookTile slot={21} width={state.tileW} height={state.rowH4} image={state.tile21Image} uvs={state.tile21Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop4} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile21Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH4, positionType: 'absolute', position: { left: state.col2, top: state.row4 } }}>
      <FishBookTile slot={22} width={state.tileW} height={state.rowH4} image={state.tile22Image} uvs={state.tile22Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop4} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile22Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH4, positionType: 'absolute', position: { left: state.col3, top: state.row4 } }}>
      <FishBookTile slot={23} width={state.tileW} height={state.rowH4} image={state.tile23Image} uvs={state.tile23Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop4} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile23Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.tileW, height: state.rowH4, positionType: 'absolute', position: { left: state.col4, top: state.row4 } }}>
      <FishBookTile slot={24} width={state.tileW} height={state.rowH4} image={state.tile24Image} uvs={state.tile24Uvs} imageSize={state.tileImageSize} imageLeft={state.tileImageLeft} imageTop={state.rowImageTop4} stroke={state.selectedStroke} radius={state.tileRadius} outline={state.tile24Outline} />
    </UiEntity>
    <UiEntity uiTransform={{ width: state.closeSize, height: state.closeSize, positionType: 'absolute', position: { left: state.closeX, top: state.closeY } }} onMouseDown={() => closeBook()}>
      <Label value="<b>X</b>" font="serif" fontSize={state.closeFont} color={{ r: 0.27, g: 0.13, b: 0.075, a: 1 }} textAlign="middle-center" uiTransform={{ width: state.closeSize, height: state.closeSize, pointerFilter: 'none' }} />
    </UiEntity>
  </UiEntity>
}
