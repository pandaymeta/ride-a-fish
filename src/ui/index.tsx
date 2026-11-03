/** @jsx ReactEcs.createElement */
import ReactEcs, { UiEntity, ReactEcsRenderer, ScreenInsetArea } from '@dcl/sdk/react-ecs'
import { PowerupHud } from './PowerupHud'
import { RideHud } from './RideHud'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(() => (
    <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
      <ScreenInsetArea>
        <PowerupHud />
      </ScreenInsetArea>
      <ScreenInsetArea>
        <RideHud />
      </ScreenInsetArea>
    </UiEntity>
  ))
}
