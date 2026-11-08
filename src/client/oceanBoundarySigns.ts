import { engine, Entity, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { LAGOON_CENTER_X, LAGOON_CENTER_Z } from '../shared/lagoon'
import { formatSize, OCEAN_AREAS } from '../shared/oceanAreas'
import { nearOceanBoundary, nearestBoundaryPoint, smoothBoundaryPoint } from '../shared/oceanBoundaryLabels'

interface BoundarySign { entity: Entity; area: number; visible: boolean }

// Five editor-authored signs. Each client shows only its nearby boundary's label.
export class OceanBoundarySigns {
  private signs: BoundarySign[] = []
  private elapsed = .1

  constructor() {
    for (let area = 1; area < OCEAN_AREAS.length; area++) {
      const entity = engine.getEntityOrNullByName('Ocean Gate - ' + OCEAN_AREAS[area].name + ' North')
      if (entity === null) throw new Error('Missing editor-authored ocean gate label: ' + OCEAN_AREAS[area].name)
      const requirement = engine.getEntityOrNullByName('Ocean Gate - ' + OCEAN_AREAS[area].name + ' Requirement')
      if (requirement === null) throw new Error('Missing editor-authored ocean gate requirement: ' + OCEAN_AREAS[area].name)
      // Read the same size rule as the client and server gates, so the displayed goal stays in sync.
      TextShape.getMutable(requirement).text = '<b>Require ' + formatSize(OCEAN_AREAS[area].requiredSize) + ' Size</b>'
      VisibilityComponent.createOrReplace(entity, { visible: false, propagateToChildren: true })
      this.signs.push({ entity, area, visible: false })
    }
  }

  update(dt: number, point: { x: number; z: number } | undefined, hidden: boolean): void {
    this.elapsed += dt
    // Visibility/color checks can run at 10 Hz. A moving label must render at the full frame rate.
    const checkVisibility = this.elapsed >= .1 || hidden || !point
    if (checkVisibility) this.elapsed = 0
    const distance = checkVisibility && point ? Math.hypot(point.x - LAGOON_CENTER_X, point.z - LAGOON_CENTER_Z) : NaN
    for (const sign of this.signs) {
      const radius = OCEAN_AREAS[sign.area - 1].outerRadius
      const visible = checkVisibility ? !hidden && !!point && nearOceanBoundary(distance, radius, sign.visible) : sign.visible
      if (visible && point) {
        const position = Transform.getMutable(sign.entity).position
        // Place a newly revealed sign before showing it; never animate it across the whole ocean.
        const nearest = sign.visible
          ? smoothBoundaryPoint(position, point, LAGOON_CENTER_X, LAGOON_CENTER_Z, radius, dt)
          : nearestBoundaryPoint(point, LAGOON_CENTER_X, LAGOON_CENTER_Z, radius)
        position.x = nearest.x; position.z = nearest.z
        if (checkVisibility) {
          const color = OCEAN_AREAS[sign.area].color
          const current = TextShape.get(sign.entity).textColor
          if (!current || Math.abs(current.r - color.r) + Math.abs(current.g - color.g) + Math.abs(current.b - color.b) > .001) TextShape.getMutable(sign.entity).textColor = color
        }
      }
      if (visible !== sign.visible) {
        VisibilityComponent.createOrReplace(sign.entity, { visible, propagateToChildren: true })
        sign.visible = visible
      }
    }
  }
}
