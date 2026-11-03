import { FishState, FoodState } from '../shared/messages'
import { distanceSquared, fishEatRadius, foodEatRadius } from '../shared/eating'

export interface LocalPickup {
  kind: number; target: number; species: number; x: number; z: number; value: number
}

interface Pending { expires: number }
interface Group { pending: Map<number, Pending>; blocked: Map<number, number> }
const CONFIRM_TIMEOUT = 1.25

// Predict cosmetic contact feedback only. Cash, size and discoveries remain server-owned.
export class PickupPrediction {
  private food: Group = { pending: new Map(), blocked: new Map() }
  private fish: Group = { pending: new Map(), blocked: new Map() }
  private clock = 0

  constructor(private visibility: (kind: number, id: number, visible: boolean) => void,
    private contact: (pickup: LocalPickup) => void = () => {}) {}

  update(dt: number, position: { x: number; z: number }, mass: number,
    foods: readonly FoodState[], fish: readonly FishState[],
    locateFish?: (fish: FishState) => { x: number; z: number }): void {
    this.clock += dt
    this.expire(0, this.food, mass)
    this.expire(1, this.fish, mass)
    const foodRadius = foodEatRadius(mass)
    for (const food of foods) {
      if (this.consider(0, this.food, food.id, mass, foodRadius,
        distanceSquared(position.x, position.z, food.x, food.z))) {
        this.contact({ kind: 0, target: food.id, species: -1, x: food.x, z: food.z, value: 1 })
      }
    }
    for (const prey of fish) {
      if (prey.owner || mass <= prey.mass || prey.shield > 0) continue
      const point = locateFish ? locateFish(prey) : prey
      if (this.consider(1, this.fish, prey.id, mass, fishEatRadius(mass, prey.mass),
        distanceSquared(position.x, position.z, point.x, point.z))) {
        this.contact({ kind: 1, target: prey.id, species: prey.species, x: point.x, z: point.z, value: prey.mass })
      }
    }
  }

  hidden(kind: number, id: number): boolean {
    return (kind === 0 ? this.food : this.fish).pending.has(id)
  }

  confirm(kind: number, id: number): void {
    const group = kind === 0 ? this.food : this.fish
    group.pending.delete(id)
    group.blocked.delete(id)
  }

  reconcile(foodIds: Set<number>, fishIds: Set<number>): void {
    for (const [group, ids] of [[this.food, foodIds], [this.fish, fishIds]] as const) {
      for (const id of group.pending.keys()) if (!ids.has(id)) group.pending.delete(id)
      for (const id of group.blocked.keys()) if (!ids.has(id)) group.blocked.delete(id)
    }
  }

  clear(): void {
    if (!this.food.pending.size && !this.food.blocked.size && !this.fish.pending.size && !this.fish.blocked.size) return
    for (const [kind, group] of [[0, this.food], [1, this.fish]] as const) {
      for (const id of group.pending.keys()) this.visibility(kind, id, true)
      group.pending.clear()
      group.blocked.clear()
    }
  }

  private consider(kind: number, group: Group, id: number, mass: number, radius: number, distance: number): boolean {
    if (group.pending.has(id)) return false
    if (distance > (radius + 0.2) * (radius + 0.2)) { group.blocked.delete(id); return false }
    const blockedAt = group.blocked.get(id)
    if (blockedAt !== undefined && mass <= blockedAt) return false
    if (kind === 0 ? distance >= radius * radius : distance > radius * radius) return false
    group.blocked.delete(id)
    group.pending.set(id, { expires: this.clock + CONFIRM_TIMEOUT })
    this.visibility(kind, id, false)
    return true
  }

  private expire(kind: number, group: Group, mass: number): void {
    for (const [id, pending] of group.pending) {
      if (this.clock < pending.expires) continue
      group.pending.delete(id)
      // A rejected pickup stays visible until the player leaves contact or grows.
      group.blocked.set(id, mass)
      this.visibility(kind, id, true)
    }
  }
}
