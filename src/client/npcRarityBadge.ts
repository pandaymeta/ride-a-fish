import { Billboard, BillboardMode, engine, Entity, Font, Material, MeshRenderer,
  TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { SPECIES } from '../shared/config'

type FishRarity = typeof SPECIES[number]['rarity']
const RARITY_COLORS: Record<FishRarity, Color3> = {
  Common: Color3.create(0.86, 0.9, 0.95),
  Uncommon: Color3.create(0.4, 0.95, 0.52),
  Rare: Color3.create(0.3, 0.65, 1),
  Epic: Color3.create(0.79, 0.43, 1),
  Secret: Color3.create(1, 0.35, 0.48)
}

// A small camera-facing pill; no textures, shadows or colliders are needed.
export class NpcRarityBadge {
  private root: Entity
  private text: Entity
  private background: Entity[] = []
  private alpha = -1
  private visible = false

  constructor(parent: Entity, private rarity: FishRarity) {
    this.root = engine.addEntity()
    Transform.create(this.root, { parent })
    Billboard.create(this.root, { billboardMode: BillboardMode.BM_ALL })
    VisibilityComponent.create(this.root, { visible: false, propagateToChildren: true })
    const height = 0.7
    const width = rarity.length * 0.46 + 0.5
    const center = this.part(Vector3.Zero(), Vector3.create(width - height, height, 0.02))
    MeshRenderer.setBox(center)
    for (const side of [-1, 1]) {
      const cap = this.part(Vector3.create(side * (width - height) / 2, 0, 0),
        Vector3.create(height, 0.02, height))
      Transform.getMutable(cap).rotation = Quaternion.fromEulerDegrees(90, 0, 0)
      MeshRenderer.setCylinder(cap, 0.5, 0.5)
    }
    this.text = engine.addEntity()
    VisibilityComponent.create(this.text, { visible: false })
    Transform.create(this.text, { parent: this.root, position: Vector3.create(0, 0, -0.035) })
    const color = RARITY_COLORS[rarity]
    TextShape.create(this.text, { text: '<b>' + rarity + '</b>', fontSize: 6, font: Font.F_SANS_SERIF, fontAutoSize: false,
      width: 5, height: 2, textWrapping: false, textColor: Color4.create(color.r, color.g, color.b, 1) })
  }

  hide(): void {
    if (!this.visible) return
    this.visible = false
    VisibilityComponent.createOrReplace(this.text, { visible: false })
    VisibilityComponent.createOrReplace(this.root, { visible: false, propagateToChildren: true })
  }

  update(number: Entity, size: number, parentScale: number, fishHeight: number): void {
    const visible = VisibilityComponent.getOrNull(number)?.visible ?? false
    if (visible) {
      const t = Transform.getMutable(this.root)
      t.position.y = fishHeight / 2 + (0.25 + size * 0.3) / parentScale
      const scale = size * 0.8 / parentScale
      t.scale = Vector3.create(scale, scale, scale)
      const alpha = TextShape.get(number).textColor?.a ?? 1
      if (Math.abs(alpha - this.alpha) > 0.025) {
        this.alpha = alpha
        const color = RARITY_COLORS[this.rarity]
        TextShape.getMutable(this.text).textColor = Color4.create(color.r, color.g, color.b, alpha)
        for (const part of this.background) {
          Material.getFlatMutable(part).diffuseColor = Color4.create(0.015, 0.02, 0.025, alpha * 0.95)
        }
      }
    }
    if (visible !== this.visible) {
      this.visible = visible
      VisibilityComponent.createOrReplace(this.text, { visible })
      VisibilityComponent.createOrReplace(this.root, { visible, propagateToChildren: true })
    }
  }

  dispose(): void {
    for (const part of this.background) engine.removeEntity(part)
    engine.removeEntity(this.text)
    engine.removeEntity(this.root)
  }

  private part(position: Vector3, scale: Vector3): Entity {
    const entity = engine.addEntity()
    Transform.create(entity, { parent: this.root, position, scale })
    Material.setBasicMaterial(entity, { diffuseColor: Color4.create(0.015, 0.02, 0.025, 0.95),
      alphaTest: 0, castShadows: false })
    this.background.push(entity)
    return entity
  }
}
