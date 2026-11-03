/** @jsx ReactEcs.createElement */
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import type { Color4 } from '@dcl/sdk/math'

const OUTLINE = { r: 0, g: 0, b: 0, a: 1 }
const DIRECTIONS = [
  [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071],
  [1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071]
]
export interface ArcadeTextProps {
  value: string; width: number; height: number; fontSize: number
  color?: Color4; outlineColor?: Color4; align?: 'left' | 'center' | 'right'; outline?: boolean
}

// Share the book's built-in bold serif face across desktop and mobile.
export function ArcadeText(props: ArcadeTextProps) {
  const directions = props.outline === false ? [] : DIRECTIONS
  const stroke = Math.min(3.2, Math.max(1.25, props.fontSize * 0.06))
  const value = '<b>' + props.value + '</b>'
  const textAlign = props.align === 'left' ? 'middle-left' : props.align === 'right' ? 'middle-right' : 'middle-center'
  return <UiEntity uiTransform={{ width: props.width, height: props.height, pointerFilter: 'none' }}>
    {directions.map(([x, y], index) => <Label key={index} value={value}
      font="serif" fontSize={props.fontSize} color={props.outlineColor ?? OUTLINE} textAlign={textAlign} textWrap="nowrap"
      uiTransform={{ width: props.width, height: props.height, positionType: 'absolute', position: { left: x * stroke, top: y * stroke }, pointerFilter: 'none' }} />)}
    <Label value={value} font="serif" fontSize={props.fontSize}
      color={props.color ?? { r: 1, g: 1, b: 1, a: 1 }} textAlign={textAlign} textWrap="nowrap"
      uiTransform={{ width: props.width, height: props.height, positionType: 'absolute', position: { left: 0, top: 0 }, pointerFilter: 'none' }} />
  </UiEntity>
}
