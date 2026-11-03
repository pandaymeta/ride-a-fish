/** @jsx ReactEcs.createElement */
import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { actions } from '../client/state'

/** @ui-action */
function selectFish(slot: number) { actions.selectIndexFish(slot) }

/** @ui-component */
export function FishBookTile(props: { slot: number; width: number; height: number; image: string; uvs: number[]; imageSize: number; imageLeft: number; imageTop: number; stroke: number; radius: number; outline: { r: number; g: number; b: number; a: number } }) {
  return <UiEntity uiTransform={{ width: props.width, height: props.height, borderWidth: props.stroke, borderColor: props.outline, borderRadius: props.radius }} uiBackground={{ texture: { src: 'assets/Images/ui/book/fish-tile-uniform.png' }, textureMode: 'stretch' }} onMouseDown={() => selectFish(props.slot)}>
    <UiEntity uiTransform={{ width: props.imageSize, height: props.imageSize, positionType: 'absolute', position: { left: props.imageLeft, top: props.imageTop }, pointerFilter: 'none' }} uiBackground={{ texture: { src: props.image }, textureMode: 'stretch', uvs: props.uvs }} />
  </UiEntity>
}
