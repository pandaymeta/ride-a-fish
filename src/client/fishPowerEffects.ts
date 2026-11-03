import { AssetLoad, engine, Entity, GltfNodeModifiers, Material, MaterialTransparencyMode,
  Transform } from '@dcl/sdk/ecs'

import { FISH_MODELS } from '../shared/fishAssets'
import { RIDER_SITTING_ANIMATION } from './riderPose'
import { SHIELD_TEXTURE, textureReady } from './startupTextures'

export class FishPowerEffects {
  private shielded = false
  private originalModifiers: Parameters<typeof GltfNodeModifiers.createOrReplace>[1] | null = null
  constructor(private body: Entity) {}

  static preload(): void {
    const owner = engine.addEntity()
    Transform.create(owner)
    AssetLoad.create(owner, { assets: [FISH_MODELS.clownfish.model, RIDER_SITTING_ANIMATION] })
  }

  update(shield: boolean): void {
    shield = shield && textureReady(SHIELD_TEXTURE)
    const shieldChanged = shield !== this.shielded
    if (shieldChanged) {
      this.shielded = shield
      if (shield) {
        const original = GltfNodeModifiers.getOrNull(this.body)
        this.originalModifiers = original ? JSON.parse(JSON.stringify(original)) : null
        GltfNodeModifiers.createOrReplace(this.body, { modifiers: [{ path: '',
          material: { material: { $case: 'pbr', pbr: {
            texture: Material.Texture.Common({ src: SHIELD_TEXTURE }),
            albedoColor: { r: 1, g: 1, b: 1, a: 0.65 },
            metallic: 0, roughness: 0.85, transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
          } } }
        }] })
      } else this.restoreMaterial()
    }
  }

  dispose(): void {
    if (this.shielded) this.restoreMaterial()
  }

  private restoreMaterial(): void {
    if (this.originalModifiers) GltfNodeModifiers.createOrReplace(this.body, this.originalModifiers)
    else GltfNodeModifiers.deleteFrom(this.body)
    this.originalModifiers = null
  }

}
