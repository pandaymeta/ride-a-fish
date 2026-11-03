/** @jsx ReactEcs.createElement */
/** @ui-component */
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { ArcadeText } from '../client/arcadeText'

export interface FishIndexCardProps {
  title: string; titleSize: number; image: string; metric: string; metricWidth: number; rarity: string
  panelUvs: number[]; rewardDisplay: 'flex' | 'none'; placeholderDisplay: 'flex' | 'none'
  imageTint: { r: number; g: number; b: number; a: number }
  panelColor: { r: number; g: number; b: number; a: number }
  rarityColor: { r: number; g: number; b: number; a: number }
}

export function FishIndexCard(props: FishIndexCardProps) {
  return <UiEntity uiTransform={{ width: 184, height: 230 }}
    uiBackground={{ texture: { src: 'assets/Images/ui/index-card-frames.png' }, textureMode: 'stretch', uvs: props.panelUvs, color: props.panelColor }}>
    <UiEntity uiTransform={{ width: 176, height: 222, positionType: 'absolute', position: { left: 4, top: 4 } }}>
    <UiEntity uiTransform={{ width: 176, height: 52, positionType: 'absolute', position: { top: 0, left: 0 } }}>
      <ArcadeText value={props.title} width={176} height={52} fontSize={props.titleSize} />
    </UiEntity>
    <UiEntity uiTransform={{ width: 152, height: 152, positionType: 'absolute', position: { top: 32, left: 12 } }}
      uiBackground={{ texture: { src: props.image }, textureMode: 'stretch', color: props.imageTint }} />
    <UiEntity uiTransform={{ width: 168, height: 28, positionType: 'absolute', position: { top: 172, left: 4 }, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', display: props.rewardDisplay }}>
      <UiEntity uiTransform={{ width: props.metricWidth, height: 28 }}>
        <ArcadeText value={props.metric} width={props.metricWidth} height={28} fontSize={26} color={{ r: 0, g: 1, b: 0, a: 1 }} />
      </UiEntity>
      <UiEntity uiTransform={{ width: 24, height: 24, margin: { left: 5 } }}
        uiBackground={{ texture: { src: 'assets/Images/golden-coin.png' }, textureMode: 'stretch' }} />
    </UiEntity>
    <UiEntity uiTransform={{ width: 176, height: 28, positionType: 'absolute', position: { top: 172, left: 0 }, display: props.placeholderDisplay }}>
      <ArcadeText value="COMING SOON" width={176} height={28} fontSize={15} color={{ r: 0.78, g: 0.82, b: 0.88, a: 1 }} />
    </UiEntity>
    <UiEntity uiTransform={{ width: 176, height: 24, positionType: 'absolute', position: { top: 198, left: 0 } }}>
      <ArcadeText value={props.rarity} width={176} height={24} fontSize={21} color={props.rarityColor} />
    </UiEntity>
    </UiEntity>
  </UiEntity>
}
