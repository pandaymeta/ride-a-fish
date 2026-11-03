import { AvatarAnchorPointType, AvatarAttach, AvatarNametag, Billboard, BillboardMode,
  engine, Entity, Font, PlayerIdentityData, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'
import { getPlayer } from '@dcl/sdk/src/players'
import { FishState } from '../shared/messages'

const LARGER = Color3.create(1, 0.22, 0.2)
const SMALLER_OR_EQUAL = Color3.create(0.3, 1, 0.45)
export const NPC_NUMBER_DISTANCE = 40
const PLAYER_NUMBER_DISTANCE = 100
const FADE_DISTANCE = 15
export const NUMBER_UPDATE_INTERVAL = 0.1

export function fishNumberColor(mass: number, myMass: number): Color3 {
  return mass > myMass ? LARGER : SMALLER_OR_EQUAL
}

export function createFishNumber(label: Entity): void {
  TextShape.create(label, { text: '', fontSize: 10, font: Font.F_SANS_SERIF, width: 5, height: 2,
    fontAutoSize: false, textWrapping: false, outlineWidth: 0.15, outlineColor: Color3.Black() })
  Billboard.create(label, { billboardMode: BillboardMode.BM_ALL })
}

// Keep a readable angular size as the camera zooms or the target moves away.
// A hard range limit and a short fade prevent the whole arena becoming covered in labels.
export function updateFishNumber(label: Entity, mass: number, myMass: number,
  cameraDistance: number, playerDistance: number, maxDistance: number, parentScale = 1): number {
  const visible = playerDistance < maxDistance
  if (VisibilityComponent.getOrNull(label)?.visible !== visible) {
    VisibilityComponent.createOrReplace(label, { visible })
  }
  const size = Math.max(0.1, Math.min(2.75, cameraDistance * 0.0275))
  if (!visible) return size
  const alpha = Math.min(1, (maxDistance - playerDistance) / FADE_DISTANCE)
  const color = fishNumberColor(mass, myMass)
  const value = '<b>' + mass + '</b>'
  const current = TextShape.get(label)
  if (current.text !== value || current.textColor?.r !== color.r ||
      current.textColor?.g !== color.g || current.textColor?.b !== color.b ||
      Math.abs((current.textColor?.a ?? 1) - alpha) > 0.025) {
    const text = TextShape.getMutable(label)
    text.text = value
    text.textColor = Color4.create(color.r, color.g, color.b, alpha)
  }
  const scale = size / parentScale
  const transform = Transform.getMutable(label)
  if (Math.abs(transform.scale.x - scale) > 0.005) transform.scale = Vector3.create(scale, scale, scale)
  return size
}

interface PlayerNumber { anchor: Entity; label: Entity }

// Every client creates its own labels and compares values with its own fish.
export class PlayerFishNumbers {
  private labels = new Map<string, PlayerNumber>()
  private elapsed = 0

  update(dt: number, fish: FishState[], myMass: number): void {
    this.elapsed += dt
    if (this.elapsed < NUMBER_UPDATE_INTERVAL) return
    this.elapsed = 0
    const camera = Transform.getOrNull(engine.CameraEntity)?.position
    const local = Transform.getOrNull(engine.PlayerEntity)?.position
    if (!camera || !local) return
    const byOwner = new Map(fish.map(state => [state.owner.toLowerCase(), state]))
    const localAddress = getPlayer()?.userId.toLowerCase()
    const players: { entity: Entity; address: string }[] = []
    if (localAddress) players.push({ entity: engine.PlayerEntity, address: localAddress })
    // Collect before component mutations, and resolve fresh avatar entities each pass.
    for (const [entity, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
      const address = identity.address.toLowerCase()
      if (address !== localAddress) players.push({ entity, address })
    }
    const present = new Set<string>()
    for (const { entity, address } of players) {
      const state = byOwner.get(address)
      if (!state) continue
      present.add(address)
      // Remove the old fixed-size plate; the normal player name is unaffected.
      if (AvatarNametag.has(entity)) AvatarNametag.deleteFrom(entity)
      const position = Transform.getOrNull(entity)?.position
      if (!position) continue
      const distance = address === localAddress ? 0 : Vector3.distance(local, position)
      let view = this.labels.get(address)
      if (!view && distance >= PLAYER_NUMBER_DISTANCE) continue
      if (!view) {
        const anchor = engine.addEntity()
        Transform.create(anchor, {})
        AvatarAttach.create(anchor, { avatarId: address, anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG })
        const label = engine.addEntity()
        Transform.create(label, { parent: anchor })
        createFishNumber(label)
        view = { anchor, label }
        this.labels.set(address, view)
      }
      const cameraDistance = Vector3.distance(camera, Vector3.create(position.x, position.y + 1.5, position.z))
      const size = updateFishNumber(view.label, state.mass, myMass, cameraDistance, distance, PLAYER_NUMBER_DISTANCE)
      Transform.getMutable(view.label).position.y = 0.25 + size * 0.55
    }
    for (const [address, view] of this.labels) {
      if (present.has(address)) continue
      engine.removeEntity(view.label)
      engine.removeEntity(view.anchor)
      this.labels.delete(address)
    }
  }
}
