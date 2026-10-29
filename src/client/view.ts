import { Billboard, ColliderLayer, engine, Entity, GltfContainer, Material, MeshCollider,
  MeshRenderer, TextShape, Transform } from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { fishScale, SEA_Y, SPECIES } from '../shared/config'
import { ArenaSnapshot, FishState } from '../shared/messages'

interface FishView { root: Entity; body: Entity; label: Entity; scale: number; state: FishState; labelText: string }

export class ArenaView {
  readonly fish = new Map<number, FishView>()
  private food = new Map<number, Entity>()
  private seats = new Map<number, Entity>()

  apply(snapshot: ArenaSnapshot, keepMount?: number): void {
    const present = new Set(snapshot.fish.map(f => f.id))
    for (const [id, view] of this.fish) {
      if (!present.has(id) && id !== keepMount) {
        engine.removeEntity(view.root)
        this.fish.delete(id); this.seats.delete(id)
      }
    }
    for (const state of snapshot.fish) {
      const current = this.fish.get(state.id)
      if (current) current.state = state
      else this.fish.set(state.id, this.createFish(state))
    }
    const foodIds = new Set(snapshot.food.map(f => f.id))
    for (const [id, entity] of this.food) {
      if (!foodIds.has(id)) { engine.removeEntity(entity); this.food.delete(id) }
    }
    for (const food of snapshot.food) {
      if (this.food.has(food.id)) continue
      const entity = engine.addEntity()
      Transform.create(entity, { position: Vector3.create(food.x, SEA_Y, food.z), scale: Vector3.create(0.24, 0.24, 0.24) })
      MeshRenderer.setSphere(entity)
      Material.setPbrMaterial(entity, { albedoColor: { r: 1, g: 0.78, b: 0.22, a: 1 },
        emissiveColor: Color3.create(1, 0.55, 0.08), emissiveIntensity: 0.8, roughness: 0.8 })
      this.food.set(food.id, entity)
    }
  }

  update(dt: number, myMass: number): void {
    const alpha = 1 - Math.exp(-dt * 14)
    for (const [id, view] of this.fish) {
      const t = Transform.getMutable(view.root)
      t.position.x += (view.state.x - t.position.x) * alpha
      t.position.z += (view.state.z - t.position.z) * alpha
      t.rotation = Quaternion.slerp(t.rotation, Quaternion.fromEulerDegrees(0, view.state.yaw * 180 / Math.PI, 0), alpha)
      view.scale += (fishScale(view.state.mass) - view.scale) * (1 - Math.exp(-dt * 4))
      const body = Transform.getMutable(view.body)
      body.scale = Vector3.create(view.scale, view.scale, view.scale)
      const seat = this.seats.get(id)
      if (seat) Transform.getMutable(seat).position.y = this.seatTop(id) - 0.09
      const protectedFish = view.state.shield > 0
      const npc = !view.state.owner
      const tooBig = view.state.mass >= myMass
      const cue = npc ? (tooBig ? 'NEED' : 'EAT')
        : protectedFish ? 'SAFE' : view.state.mass > myMass ? 'DANGER' : view.state.mass < myMass ? 'EAT' : 'EQUAL'
      const label = npc && tooBig ? 'SIZE ' + view.state.mass + '\nNEED ' + (view.state.mass + 1) : cue + '  ' + view.state.mass
      if (view.labelText !== label) {
        view.labelText = label
        const text = TextShape.getMutable(view.label)
        text.text = label
        text.textColor = npc && tooBig ? Color4.create(1, 0.8, 0.4, 1)
          : protectedFish ? Color4.create(0.5, 0.9, 1, 1)
          : view.state.mass > myMass ? Color4.create(1, 0.42, 0.38, 1)
          : view.state.mass < myMass ? Color4.create(0.5, 1, 0.65, 1) : Color4.create(1, 1, 1, 1)
      }
      Transform.getMutable(view.label).position.y = SPECIES[view.state.species].height * view.scale / 2 + (view.state.owner ? 2.3 : 0.65)
    }
  }

  seatTop(id: number): number {
    const view = this.fish.get(id)
    return view ? SPECIES[view.state.species].height * view.scale / 2 - 0.45 : 0
  }

  createSeat(id: number): Entity {
    const view = this.fish.get(id)
    if (!view) throw new Error('The fish is not ready.')
    const seat = engine.addEntity()
    Transform.create(seat, { parent: view.root, position: Vector3.create(0, this.seatTop(id) - 0.09, 0),
      scale: Vector3.create(1.2, 0.18, 1.2) })
    // A rendered support avoids relying solely on invisible mobile colliders.
    MeshRenderer.setBox(seat)
    MeshCollider.setBox(seat, ColliderLayer.CL_PHYSICS)
    Material.setPbrMaterial(seat, { albedoColor: { r: 0.07, g: 0.32, b: 0.4, a: 1 }, roughness: 1 })
    this.seats.set(id, seat)
    return seat
  }

  removeSeat(id: number): void {
    const seat = this.seats.get(id)
    if (seat) engine.removeEntity(seat)
    this.seats.delete(id)
  }

  private createFish(state: FishState): FishView {
    const root = engine.addEntity()
    Transform.create(root, { position: Vector3.create(state.x, SEA_Y, state.z),
      rotation: Quaternion.fromEulerDegrees(0, state.yaw * 180 / Math.PI, 0) })
    const body = engine.addEntity()
    const scale = fishScale(state.mass)
    Transform.create(body, { parent: root, scale: Vector3.create(scale, scale, scale) })
    GltfContainer.create(body, { src: SPECIES[state.species].model, visibleMeshesCollisionMask: 0,
      invisibleMeshesCollisionMask: 0 })
    const label = engine.addEntity()
    Transform.create(label, { parent: root, position: Vector3.create(0, 2, 0) })
    TextShape.create(label, { text: '', fontSize: 2.4, outlineWidth: 0.12, outlineColor: Color3.Black() })
    Billboard.create(label, { billboardMode: 2 })
    return { root, body, label, state, scale, labelText: '' }
  }
}
