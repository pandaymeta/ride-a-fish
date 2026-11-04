import { Billboard, BillboardMode, engine, Entity, Font, Material, MaterialTransparencyMode, MeshRenderer,
  TextAlignMode, TextShape, TextureFilterMode, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'
import { MAX_RIDERS } from '../shared/config'
import { POWERUP_ICONS, SHIELD_POWERUP, SPEED_POWERUP } from '../shared/powerups'

interface BadgePart { icon: Entity; number: Entity; value: string; visible: boolean }
interface Badge {
  root: Entity; panel: Entity; parent?: Entity; active: boolean; seen: boolean
  shield: BadgePart; speed: BadgePart; size: number; depth: number; layout?: number
}
const SLOT_WIDTH = 1.8
const SLOT_GAP = 0.25

// Native parent transforms and billboards keep markers on the rendered fish, without
// sampling the camera into a separate screen-space UI every scene tick.
export class FishPowerBadges {
  private cards: Badge[] = []

  beginFrame(): void { for (const card of this.cards) card.seen = false }

  show(parent: Entity, shield: number, speed: number, fishScale: number, local: boolean): void {
    // Shield status is public; the speed timer remains owner-only.
    speed = local ? speed : 0
    if (shield <= 0 && speed <= 0) return
    const camera = Transform.getOrNull(engine.CameraEntity)
    const fish = Transform.getOrNull(parent)
    if (!camera || !fish) return
    let card = this.cards.find(entry => entry.parent === parent)
    const distance = Vector3.distance(camera.position, fish.position)
    if (!local && distance >= (card?.active ? 42 : 38)) return
    if (!card) {
      card = this.cards.find(entry => !entry.active && !entry.seen)
      if (!card) {
        if (this.cards.length >= MAX_RIDERS) return
        card = this.create()
        this.cards.push(card)
      }
      card.parent = parent
      Transform.getMutable(card.root).parent = parent
    }
    card.active = true; card.seen = true
    const layout = (shield > 0 ? 1 : 0) | (speed > 0 ? 2 : 0)
    if (card.layout !== layout) {
      // Center a single effect; reserve fixed digit slots within each icon/count pair.
      const both = layout === 3
      const left = both ? -(SLOT_WIDTH * 2 + SLOT_GAP) / 2 : -SLOT_WIDTH / 2
      this.place(card.shield, left)
      this.place(card.speed, both ? left + SLOT_WIDTH + SLOT_GAP : left)
      card.layout = layout
    }
    const size = 0.32 + Math.min(2.2, fishScale) * 0.06
    // Local -Z on a billboard faces the camera. Put the panel just in front of
    // the fish silhouette so its own mesh cannot obscure the icons or numbers.
    const depth = Math.min(fishScale * 0.92 + 0.2, distance * 0.6)
    if (Math.abs(card.size - size) > 0.001 || Math.abs(card.depth - depth) > 0.005) {
      const panel = Transform.getMutable(card.panel)
      panel.scale = Vector3.create(size, size, size)
      panel.position.z = -depth
      card.size = size; card.depth = depth
    }
    this.updatePart(card.shield, shield)
    this.updatePart(card.speed, speed)
  }

  endFrame(): void {
    for (const card of this.cards) {
      if (card.seen) continue
      this.updatePart(card.shield, 0)
      this.updatePart(card.speed, 0)
      card.active = false
      if (card.parent !== undefined && !Transform.has(card.parent)) {
        Transform.getMutable(card.root).parent = engine.RootEntity
        card.parent = undefined
      }
    }
  }

  private create(): Badge {
    const root = engine.addEntity()
    Transform.create(root)
    Billboard.create(root, { billboardMode: BillboardMode.BM_ALL })
    const panel = engine.addEntity()
    Transform.create(panel, { parent: root })
    return { root, panel, active: false, seen: false, size: 0, depth: 0,
      shield: this.createPart(panel, POWERUP_ICONS[SHIELD_POWERUP]),
      speed: this.createPart(panel, POWERUP_ICONS[SPEED_POWERUP]) }
  }

  private createPart(parent: Entity, src: string): BadgePart {
    const icon = engine.addEntity()
    Transform.create(icon, { parent })
    MeshRenderer.setPlane(icon)
    Material.setPbrMaterial(icon, { texture: Material.Texture.Common({ src, filterMode: TextureFilterMode.TFM_TRILINEAR }),
      albedoColor: Color4.White(), castShadows: false,
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
      metallic: 0, roughness: 1, specularIntensity: 0, emissiveIntensity: 0 })
    VisibilityComponent.create(icon, { visible: false })
    const number = engine.addEntity()
    Transform.create(number, { parent, position: Vector3.create(0, 0, -0.01) })
    TextShape.create(number, { text: '', fontSize: 6.3, font: Font.F_SANS_SERIF, width: 1, height: 1,
      fontAutoSize: false, textWrapping: false, lineCount: 1,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT, textColor: Color4.White(),
      outlineColor: Color3.create(0.01, 0.06, 0.09), outlineWidth: 0.15 })
    VisibilityComponent.create(number, { visible: false })
    return { icon, number, value: '', visible: false }
  }

  private place(part: BadgePart, left: number): void {
    Transform.getMutable(part.icon).position.x = left + 0.5
    Transform.getMutable(part.number).position.x = left + 1.05
  }

  private updatePart(part: BadgePart, seconds: number): void {
    const visible = seconds > 0
    if (part.visible !== visible) {
      VisibilityComponent.createOrReplace(part.icon, { visible })
      VisibilityComponent.createOrReplace(part.number, { visible })
      part.visible = visible
    }
    const value = visible ? '<b>' + Math.ceil(seconds) + '</b>' : ''
    if (value !== part.value) {
      TextShape.getMutable(part.number).text = value
      part.value = value
    }
  }
}
