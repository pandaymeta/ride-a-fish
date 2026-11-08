import { AssetLoad, Billboard, BillboardMode, engine, Entity, Font, GltfContainer,
  GltfNodeModifiers, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'
import { SPECIES } from '../shared/config'

type FishRarity = typeof SPECIES[number]['rarity']
const RARITY_COLORS: Record<FishRarity, Color3> = {
  Common: Color3.create(0.86, 0.9, 0.95),
  Uncommon: Color3.create(0.4, 0.95, 0.52),
  Rare: Color3.create(0.3, 0.65, 1),
  Epic: Color3.create(0.79, 0.43, 1),
  Secret: Color3.create(1, 0.35, 0.48)
}

const BADGE_MODELS: Record<FishRarity, string> = {
  Common: 'assets/Models/rarity-pill-common-v1.glb',
  Uncommon: 'assets/Models/rarity-pill-uncommon-v1.glb',
  Rare: 'assets/Models/rarity-pill-rare-v1.glb',
  Epic: 'assets/Models/rarity-pill-epic-v1.glb',
  Secret: 'assets/Models/rarity-pill-secret-v1.glb'
}

// One tiny rounded mesh replaces three primitive renderers. Only nearby labels
// own renderers, so fish outside the label range cost no badge materials.
export class NpcRarityBadge {
  private static preloaded = false
  private root: Entity
  private text?: Entity
  private background?: Entity
  private alpha = -1
  private visible = false

  static preload(): void {
    if (this.preloaded) return
    this.preloaded = true
    const owner = engine.addEntity()
    Transform.create(owner)
    AssetLoad.create(owner, { assets: Object.values(BADGE_MODELS) })
  }

  constructor(parent: Entity, private rarity: FishRarity) {
    this.root = engine.addEntity()
    Transform.create(this.root, { parent })
    Billboard.create(this.root, { billboardMode: BillboardMode.BM_ALL })
    VisibilityComponent.create(this.root, { visible: false, propagateToChildren: true })
  }

  hide(): void {
    if (!this.visible) return
    this.visible = false
    VisibilityComponent.createOrReplace(this.root, { visible: false, propagateToChildren: true })
    this.removeVisuals()
  }

  update(number: Entity, size: number, parentScale: number, fishHeight: number): void {
    if (!(VisibilityComponent.getOrNull(number)?.visible ?? false)) {
      this.hide()
      return
    }
    this.ensureVisuals()
    const t = Transform.getMutable(this.root)
    t.position.y = fishHeight / 2 + (0.25 + size * 0.3) / parentScale
    const scale = size * 0.8 / parentScale
    t.scale = Vector3.create(scale, scale, scale)
    const alpha = TextShape.get(number).textColor?.a ?? 1
    if (Math.abs(alpha - this.alpha) > 0.025) {
      this.alpha = alpha
      const color = RARITY_COLORS[this.rarity]
      TextShape.getMutable(this.text!).textColor = Color4.create(color.r, color.g, color.b, alpha)
      GltfNodeModifiers.createOrReplace(this.background!, { modifiers: [{ path: '', castShadows: false,
        material: { material: { $case: 'unlit', unlit: {
          diffuseColor: Color4.create(0.015, 0.02, 0.025, alpha * 0.95), alphaTest: 0, castShadows: false
        } } }
      }] })
    }
    if (!this.visible) {
      this.visible = true
      VisibilityComponent.createOrReplace(this.root, { visible: true, propagateToChildren: true })
    }
  }

  dispose(): void {
    this.removeVisuals()
    engine.removeEntity(this.root)
  }

  private ensureVisuals(): void {
    if (this.background !== undefined) return
    this.background = engine.addEntity()
    Transform.create(this.background, { parent: this.root })
    GltfContainer.create(this.background, { src: BADGE_MODELS[this.rarity],
      visibleMeshesCollisionMask: 0, invisibleMeshesCollisionMask: 0 })
    this.text = engine.addEntity()
    Transform.create(this.text, { parent: this.root, position: Vector3.create(0, 0, -0.035) })
    const color = RARITY_COLORS[this.rarity]
    TextShape.create(this.text, { text: '<b>' + this.rarity + '</b>', fontSize: 6,
      font: Font.F_SANS_SERIF, fontAutoSize: false, width: 5, height: 2, textWrapping: false,
      textColor: Color4.create(color.r, color.g, color.b, 1) })
    this.alpha = -1
  }

  private removeVisuals(): void {
    if (this.background !== undefined) engine.removeEntity(this.background)
    if (this.text !== undefined) engine.removeEntity(this.text)
    this.background = undefined
    this.text = undefined
    this.alpha = -1
  }
}
