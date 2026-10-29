import { clamp, eatRadius, ENTRY_POINTS, ENTRY_SHIELD, MAX_RIDERS, SEA, SPECIES, SPEED } from '../shared/config'
import { FishState, FoodState } from '../shared/messages'

interface Fish extends FishState {
  dx: number; dz: number; inputAge: number; lastSeq: number; turnAt: number
}
interface Food extends FoodState { respawnAt: number }
export type ArenaEvent =
  | { type: 'catch'; owner: string; species: number; mass: number }
  | { type: 'end'; owner: string; reason: string }
  | { type: 'growth'; owner: string; mass: number }

export class Arena {
  readonly fish = new Map<number, Fish>()
  readonly food: Food[] = []
  readonly events: ArenaEvent[] = []
  private nextId = 1
  private pending: { at: number; species: number }[] = []
  time = 0
  tick = 0

  constructor() {
    for (let s = 0; s < SPECIES.length; s++) {
      for (let n = 0; n < SPECIES[s].population; n++) this.spawnNpc(s)
    }
    for (let n = 0; n < 30; n++) {
      const p = this.randomPoint()
      this.food.push({ id: n, ...p, respawnAt: 0 })
    }
    // Ensure the first run starts with a readable trail away from each entry.
    ENTRY_POINTS.forEach((p, i) => {
      for (let j = 0; j < 3; j++) Object.assign(this.food[i * 3 + j], { x: p.x, z: p.z + j * 1.2 })
    })
  }

  getMount(owner: string): Fish | undefined {
    return Array.from(this.fish.values()).find(f => f.owner === owner)
  }

  enter(owner: string): boolean {
    if (this.getMount(owner)) return true
    if (Array.from(this.fish.values()).filter(f => f.owner).length >= MAX_RIDERS) return false
    const scored = ENTRY_POINTS.map(p => ({ p, clearance: Math.min(...Array.from(this.fish.values())
      .filter(f => f.mass > 1).map(f => Math.hypot(f.x - p.x, f.z - p.z))) }))
    scored.sort((a, b) => b.clearance - a.clearance)
    const { p } = scored[0]
    this.fish.set(this.nextId, {
      id: this.nextId++, owner, species: 0, ...p, mass: 1, yaw: 0,
      shield: ENTRY_SHIELD, dx: 0, dz: 0, inputAge: 0, lastSeq: -1, turnAt: 0
    })
    return true
  }

  steer(owner: string, seq: number, x: number, z: number): void {
    const f = this.getMount(owner)
    if (!f || !Number.isFinite(x) || !Number.isFinite(z) || !Number.isInteger(seq) || seq <= f.lastSeq) return
    const length = Math.max(1, Math.hypot(x, z))
    f.dx = clamp(x / length, -1, 1)
    f.dz = clamp(z / length, -1, 1)
    f.inputAge = 0
    f.lastSeq = seq
  }

  leave(owner: string, reason = 'You returned to the shore.'): void {
    const f = this.getMount(owner)
    if (!f) return
    this.fish.delete(f.id)
    this.events.push({ type: 'end', owner, reason })
  }

  step(dt: number): void {
    this.time += dt
    this.tick++
    for (const spawn of this.pending.filter(p => p.at <= this.time)) this.spawnNpc(spawn.species)
    this.pending = this.pending.filter(p => p.at > this.time)
    const list = Array.from(this.fish.values())
    for (const f of list) {
      f.shield = Math.max(0, f.shield - dt)
      if (f.owner) {
        f.inputAge += dt
        if (f.inputAge > 0.6) f.dx = f.dz = 0
      } else this.steerNpc(f, list)
      const speed = f.owner ? SPEED : SPECIES[f.species].speed
      const margin = eatRadius(f.mass)
      f.x = clamp(f.x + f.dx * speed * dt, SEA.minX + margin, SEA.maxX - margin)
      f.z = clamp(f.z + f.dz * speed * dt, SEA.minZ + margin, SEA.maxZ - margin)
      if (Math.hypot(f.dx, f.dz) > 0.05) f.yaw = Math.atan2(f.dx, f.dz)
      if (f.owner) this.eatFood(f)
    }
    // Snapshot sizes for arbitration; one prey can be awarded only once this tick.
    const ordered = list.map(f => ({ ...f })).sort((a, b) => b.mass - a.mass || a.id - b.id)
    for (const eater of ordered) {
      if (!this.fish.has(eater.id) || eater.shield > 0) continue
      for (const prey of ordered) {
        if (eater.id === prey.id || !this.fish.has(prey.id) || prey.shield > 0 || eater.mass <= prey.mass) continue
        if (!eater.owner && !prey.owner) continue
        if (Math.hypot(eater.x - prey.x, eater.z - prey.z) > eatRadius(eater.mass) + eatRadius(prey.mass) * 0.4) continue
        this.fish.delete(prey.id)
        const live = this.fish.get(eater.id)!
        live.mass += prey.mass
        if (eater.owner) {
          this.events.push({ type: 'growth', owner: eater.owner, mass: live.mass })
          if (!prey.owner) this.events.push({ type: 'catch', owner: eater.owner, species: prey.species, mass: prey.mass })
        }
        if (prey.owner) this.events.push({ type: 'end', owner: prey.owner, reason: eater.owner
          ? 'Another rider ate your fish. Your discoveries are safe.'
          : SPECIES[eater.species].name + ' ate your fish. Your discoveries are safe.' })
        else this.pending.push({ at: this.time + 8, species: prey.species })
      }
    }
    for (const food of this.food) {
      if (food.respawnAt > 0 && food.respawnAt <= this.time) {
        Object.assign(food, this.randomPoint())
        food.respawnAt = 0
      }
    }
  }

  snapshot() {
    return {
      tick: this.tick,
      fish: Array.from(this.fish.values()).map(({ id, owner, species, x, z, yaw, mass, shield }) =>
        ({ id, owner, species, x, z, yaw, mass, shield })),
      food: this.food.filter(f => f.respawnAt === 0).map(({ id, x, z }) => ({ id, x, z }))
    }
  }

  private eatFood(f: Fish): void {
    for (const food of this.food) {
      if (food.respawnAt === 0 && Math.hypot(f.x - food.x, f.z - food.z) < eatRadius(f.mass) + 0.25) {
        food.respawnAt = this.time + 4
        f.mass++
        this.events.push({ type: 'growth', owner: f.owner, mass: f.mass })
      }
    }
  }

  private steerNpc(f: Fish, list: Fish[]): void {
    const nearby = list.filter(p => p.owner && p.shield <= 0 && Math.hypot(p.x - f.x, p.z - f.z) < 10)
      .sort((a, b) => Math.hypot(a.x - f.x, a.z - f.z) - Math.hypot(b.x - f.x, b.z - f.z))
    const target = nearby.find(p => p.mass !== f.mass)
    if (target) {
      const away = target.mass > f.mass ? -1 : 1
      const length = Math.max(0.01, Math.hypot(target.x - f.x, target.z - f.z))
      f.dx = away * (target.x - f.x) / length
      f.dz = away * (target.z - f.z) / length
    } else if (f.turnAt < this.time) {
      const yaw = Math.random() * Math.PI * 2
      f.dx = Math.sin(yaw); f.dz = Math.cos(yaw)
      f.turnAt = this.time + 1.5 + Math.random() * 3
    }
    if (f.x < SEA.minX + 3) f.dx = Math.abs(f.dx)
    if (f.x > SEA.maxX - 3) f.dx = -Math.abs(f.dx)
    if (f.z < SEA.minZ + 3) f.dz = Math.abs(f.dz)
    if (f.z > SEA.maxZ - 3) f.dz = -Math.abs(f.dz)
  }

  private spawnNpc(species: number): void {
    this.fish.set(this.nextId, { id: this.nextId++, owner: '', species, ...this.randomPoint(),
      yaw: 0, mass: SPECIES[species].mass, shield: 0, dx: 0, dz: 1, inputAge: 0, lastSeq: 0, turnAt: 0 })
  }

  private randomPoint() {
    return { x: SEA.minX + 3 + Math.random() * (SEA.maxX - SEA.minX - 6),
      z: SEA.minZ + 3 + Math.random() * (SEA.maxZ - SEA.minZ - 6) }
  }
}
