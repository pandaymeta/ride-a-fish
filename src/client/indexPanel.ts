import { AssetLoad, engine, Transform } from '@dcl/sdk/ecs'
import type { PlayerProfile } from '../shared/messages'
import { COLLECTIBLE_SPECIES, collectedSpeciesCount, SPECIES } from '../shared/config'
import { state as hud } from '../ui/RideHud'
import { state as book } from '../ui/FishIndexBook'
import { actions } from './state'
import { pickupCanvas } from './pickupProjection'

const LAYOUT = {
  "width": 1672,
  "height": 941,
  "offsetX": -836,
  "offsetY": -470.5,
  "nameX": 216,
  "nameY": 125,
  "nameW": 546,
  "nameH": 72,
  "nameFont": 43,
  "portraitX": 290,
  "portraitY": 221,
  "portraitSize": 360,
  "rarityX": 246,
  "rarityY": 520,
  "rarityW": 180,
  "rarityH": 54,
  "rarityFont": 29,
  "titleX": 960,
  "titleY": 64,
  "titleW": 510,
  "titleH": 87,
  "titleFont": 70,
  "discoveryX": 998,
  "discoveryY": 146,
  "discoveryW": 450,
  "discoveryH": 46,
  "discoveryFont": 34,
  "closeX": 1504,
  "closeY": 76,
  "closeSize": 60,
  "closeFont": 40,
  "statIconX": 211,
  "statIconSize": 60,
  "statTextX": 298,
  "statTextW": 421,
  "statH": 55,
  "statFont": 32,
  "statY0": 605,
  "statY1": 670,
  "statY2": 734,
  "noteX": 196,
  "noteY": 807,
  "noteW": 553,
  "noteH": 43,
  "noteFont": 23,
  "tileW": 114,
  "tileImageSize": 108,
  "tileImageLeft": 0,
  "selectedStroke": 3,
  "col0": 887,
  "row0": 214,
  "rowH0": 114,
  "rowImageTop0": 0,
  "col1": 1019,
  "row1": 344,
  "rowH1": 114,
  "rowImageTop1": 0,
  "col2": 1151,
  "row2": 474,
  "rowH2": 114,
  "rowImageTop2": 0,
  "col3": 1283,
  "row3": 604,
  "rowH3": 114,
  "rowImageTop3": 0,
  "col4": 1415,
  "row4": 734,
  "rowH4": 114,
  "rowImageTop4": 0,
  "tileRadius": 16
}
const ENTRIES = [
  { species: 0, image: '07' }, { species: 1, image: '17' },
  { species: 2, image: '06' }, { species: 4, image: '20' }
]
const SHAPES = ['07', '17', '06', '20', '05']
const FUTURE_RARITIES = ['Epic', 'Legendary', 'Mythic', 'Exotic', 'Common', 'Uncommon', 'Rare']
let profile: PlayerProfile | undefined
let selected = -1
let started = false
let layoutKey = ''

function sprite(slot: number): { src: string; uvs: number[] } {
  const entry = ENTRIES[slot]
  if (entry && (profile?.counts[entry.species] ?? 0) > 0) return { src: 'assets/Images/ui/book/fish-' + entry.image + '-uniform.png', uvs: [0, 0, 0, 1, 1, 1, 1, 0] }
  const x = slot % 8 / 8, y = Math.floor(slot / 8) / 4
  return { src: 'assets/Images/ui/book/fish-silhouettes-uniform.png', uvs: [x, 1-y-.25, x, 1-y, x+.125, 1-y, x+.125, 1-y-.25] }
}

function resize(): void {
  const canvas = pickupCanvas()
  const key = canvas.safeWidth + ':' + canvas.safeHeight
  if (key === layoutKey) return
  layoutKey = key
  const scale = Math.min(.8, (canvas.safeWidth - 100) / 1672, (canvas.safeHeight - 72) / 941)
  const values: Record<string, number> = {}
  for (const [key, value] of Object.entries(LAYOUT)) values[key] = value * scale
  Object.assign(book, values)
}

export function preloadHudAssets(): void {
  const loader = engine.addEntity()
  Transform.create(loader)
  AssetLoad.create(loader, { assets: ['assets/Images/golden-coin.png', 'assets/Images/ui/index-book-parchment.png',
    'assets/Images/ui/lobby-house.png', 'assets/Images/ui/book/parchment-book-uniform.png',
    ...SHAPES.map(id => 'assets/Images/ui/book/fish-' + id + '-uniform.png'), 'assets/Images/ui/book/fish-silhouettes-uniform.png',
    'assets/Images/ui/book/fish-tile-uniform.png', 'assets/Images/ui/book/stat-hook.png', 'assets/Images/ui/book/stat-ruler.png', 'assets/Images/golden-coin.png'] })
  actions.selectIndexFish = slot => {
    if (!Number.isInteger(slot) || slot < 0 || slot >= 25) return
    selected = slot; refresh()
  }
  actions.closeIndex = () => { hud.indexDisplay = 'none' }
  if (!started) {
    started = true
    let clock = 0
    engine.addSystem(dt => { clock += dt; if (clock < .25) return; clock = 0; resize() })
  }
  refresh(); resize()
}

export function updateIndexProfile(next: PlayerProfile): void { profile = next; refresh() }

function refresh(): void {
  const found = collectedSpeciesCount(profile?.counts ?? [])
  hud.indexProgress = found + '/' + COLLECTIBLE_SPECIES.length
  hud.indexFooter = found + ' / ' + COLLECTIBLE_SPECIES.length + ' COLLECTED'
  book.discovered = '<b>' + found + ' / ' + COLLECTIBLE_SPECIES.length + ' Discovered</b>'
  if (selected < 0) {
    selected = ENTRIES.findIndex(entry => (profile?.counts[entry.species] ?? 0) > 0)
    if (selected < 0) selected = 0
  }
  const entry = ENTRIES[selected]
  const fish = entry ? SPECIES[entry.species] : undefined
  const caught = entry ? profile?.counts[entry.species] ?? 0 : 0
  book.selectedName = '<b>' + (caught > 0 ? fish!.name.toUpperCase() : 'UNDISCOVERED') + '</b>'
  const portrait = sprite(selected)
  book.portrait = portrait.src
  book.portraitUvs = portrait.uvs
  book.rarity = '<b>' + (fish?.rarity ?? FUTURE_RARITIES[(selected - 4) % FUTURE_RARITIES.length]) + '</b>'
  book.caught = '<b>Caught:  ' + caught.toLocaleString('en-US') + '</b>'
  book.largest = '<b>Largest:  ' + (entry && caught ? (profile?.largest[entry.species] ?? 0).toLocaleString('en-US') : '--') + '</b>'
  book.cashValue = '<b>Coin value:  ' + (fish ? fish.mass.toLocaleString('en-US') : '--') + '</b>'
  book.note = !fish ? 'Coming soon' : caught > 0 ? '' : fish.hint
  const tiles: Record<string, unknown> = {}
  for (let i = 0; i < 25; i++) {
    const tile = sprite(i)
    tiles['tile' + i + 'Image'] = tile.src
    tiles['tile' + i + 'Uvs'] = tile.uvs
    tiles['tile' + i + 'Outline'] = { r: .4, g: .24, b: .11, a: i === selected ? 1 : 0 }
  }
  Object.assign(book, tiles)
}
