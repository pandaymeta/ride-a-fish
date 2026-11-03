/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity, ReactEcsRenderer, ScreenInsetArea } from '@dcl/sdk/react-ecs'
import { PowerupHud } from './PowerupHud'
import { RideHud } from './RideHud'
import { waitingForTextures } from '../client/startupTextures'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(() => waitingForTextures() ? (
    <UiEntity uiTransform={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', pointerFilter: 'none' }}>
      <Label value="Loading Ride A Fish…" fontSize={22} textAlign="middle-center"
        uiTransform={{ width: 260, height: 48, borderRadius: 8, pointerFilter: 'none' }}
        uiBackground={{ color: { r: .08, g: .15, b: .19, a: .9 } }} />
    </UiEntity>
  ) : (
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
