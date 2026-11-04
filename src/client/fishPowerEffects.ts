import { AssetLoad, engine, Entity, GltfNodeModifiers, Material, MaterialTransparencyMode,
  MeshRenderer, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { FISH_MODELS } from '../shared/fishAssets'
import { RIDER_SITTING_ANIMATION } from './riderPose'
import { BOOST_TEXTURE, textureReady } from './startupTextures'

const BUBBLE_DIAMETER = 1.42

export class FishPowerEffects {
  private shielded = false
  private boosted = false
  private bubble?: Entity
  private originalModifiers: Parameters<typeof GltfNodeModifiers.createOrReplace>[1] | null = null

  constructor(private body: Entity) {}

  static preload(): void {
    const owner = engine.addEntity()
    Transform.create(owner)
    AssetLoad.create(owner, { assets: [FISH_MODELS.clownfish.model, RIDER_SITTING_ANIMATION] })
  }

  update(shield: boolean, boost: boolean): void {
    if (shield !== this.shielded) {
      this.shielded = shield
      if (shield && this.bubble === undefined) this.bubble = this.createBubble()
      if (this.bubble !== undefined) VisibilityComponent.createOrReplace(this.bubble, { visible: shield })
    }

    boost = boost && textureReady(BOOST_TEXTURE)
    if (boost === this.boosted) return
    this.boosted = boost
    if (boost) {
      const original = GltfNodeModifiers.getOrNull(this.body)
      this.originalModifiers = original ? JSON.parse(JSON.stringify(original)) : null
      GltfNodeModifiers.createOrReplace(this.body, { modifiers: [{ path: '',
        material: { material: { $case: 'pbr', pbr: {
          texture: Material.Texture.Common({ src: BOOST_TEXTURE }),
          albedoColor: { r: 1, g: 0.28, b: 0.25, a: 0.65 },
          metallic: 0, roughness: 0.85, transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
        } } }
      }] })
    } else this.restoreMaterial()
  }

  dispose(): void {
    if (this.bubble !== undefined) engine.removeEntity(this.bubble)
    if (this.boosted) this.restoreMaterial()
  }

  private createBubble(): Entity {
    const bubble = engine.addEntity()
    // Inherit the fish body's orientation and growth from its transform.
    Transform.create(bubble, { parent: this.body, scale: Vector3.create(BUBBLE_DIAMETER, BUBBLE_DIAMETER, BUBBLE_DIAMETER) })
    MeshRenderer.setSphere(bubble)
    Material.setPbrMaterial(bubble, {
      albedoColor: { r: 1, g: 0.34, b: 0.64, a: 0.23 },
      castShadows: false,
      metallic: 0,
      roughness: 0.35,
      specularIntensity: 0.35,
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
    })
    return bubble
  }

  private restoreMaterial(): void {
    if (this.originalModifiers) GltfNodeModifiers.createOrReplace(this.body, this.originalModifiers)
    else GltfNodeModifiers.deleteFrom(this.body)
    this.originalModifiers = null
  }
}
