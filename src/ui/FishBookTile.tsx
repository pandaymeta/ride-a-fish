/** @jsx ReactEcs.createElement */
import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { actions } from '../client/state'
import { INDEX_TILE, textureReady } from '../client/startupTextures'

/** @ui-action */
function selectFish(slot: number) { actions.selectIndexFish(slot) }

/** @ui-component */
export function FishBookTile(props: { slot: number; width: number; height: number; image: string; uvs: number[]; imageSize: number; imageLeft: number; imageTop: number; stroke: number; radius: number; outline: { r: number; g: number; b: number; a: number } }) {
  return <UiEntity uiTransform={{ width: props.width, height: props.height, borderWidth: props.stroke, borderColor: props.outline, borderRadius: props.radius }}
    uiBackground={textureReady(INDEX_TILE) ? { texture: { src: INDEX_TILE }, textureMode: 'stretch' }
      : { color: { r: .82, g: .65, b: .49, a: 1 } }} onMouseDown={() => selectFish(props.slot)}>
    {textureReady(props.image)
      ? <UiEntity uiTransform={{ width: props.imageSize, height: props.imageSize, positionType: 'absolute', position: { left: props.imageLeft, top: props.imageTop }, pointerFilter: 'none' }} uiBackground={{ texture: { src: props.image }, textureMode: 'stretch', uvs: props.uvs }} />
      : <Label value="?" font="serif" fontSize={props.height * .38} color={{ r: .4, g: .24, b: .11, a: 1 }}
          textAlign="middle-center" uiTransform={{ width: '100%', height: '100%', pointerFilter: 'none' }} />}
  </UiEntity>
}
