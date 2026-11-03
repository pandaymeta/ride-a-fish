import { chooseDockSeaPoint } from './tutorialSpawns'
import { foodOutsideDock } from './foodClearance'
import type { DockLanding } from '../shared/dockSurfaces'
import { BOARDING_SPOTS, BOARDING_TIMEOUT } from '../shared/boarding'
import { ARENA_TICK_SECONDS, FISH_JUMP_COOLDOWN } from '../shared/fishJump'
import { insideLobbyIsland } from '../shared/lobbyIsland'
import { SharkContact } from './sharkContact'
import { SharkBrain, type SharkBody } from './sharkBrain'
import { isShark, SHARK_RULES } from '../shared/shark'
import { ARENA_MAX_PLAYER_Y, ENTRY_POINTS, ENTRY_SHIELD, FOOD_COUNT, MAX_RIDERS, SEA, SPECIES } from '../shared/config'
import { FoodState, PickupNotice, SharkTouch } from '../shared/messages'
import { NpcAnchor } from '../shared/npcs'
import { createFoodSpawns } from './foodSpawns'
import { chooseRespawnPoint, FOOD_SPACING, SpawnBlocker, SpawnPoint } from './respawnPoints'
import { distanceSquared, fishInEatingContact, foodEatRadius } from '../shared/eating'
import { ArenaPowerups, PowerupEvent } from './powerups'
import { insideLagoon, LAGOON_CENTER_X, LAGOON_CENTER_Z } from '../shared/lagoon'

interface Fish extends SharkBody {
  boardingUntil: number
  dockLanding?: DockLanding
  powerShield: number; boost: number
}
interface Food extends FoodState { respawnAt: number }
export type ArenaEvent =
  | PowerupEvent
  | { type: 'catch'; owner: string; species: number; mass: number }
  | { type: 'end'; owner: string; reason: string }
  | { type: 'eaten'; owner: string; eventId: string; byShark: boolean }
  | { type: 'growth'; owner: string; mass: number }
  | { type: 'pickup'; owner: string; pickup: Omit<PickupNotice, 'cashTotal'> }

export class Arena {
  readonly fish = new Map<number, Fish>()
  readonly food: Food[] = []
  readonly events: ArenaEvent[] = []
  readonly powerups = new ArenaPowerups(() => this.powerupBlockers())
  private sharkBrain = new SharkBrain()
  private sharkContact = new SharkContact()
  private nextId = 1
  private nextFoodId = 0
  private pickupSequence = 0
  private session = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  private pending: { at: number; slot: number; x: number; z: number }[] = []
  time = 0
  tick = 0

  constructor(private readonly anchors: NpcAnchor[]) {
    for (const anchor of anchors) this.spawnNpc(anchor)
    createFoodSpawns(FOOD_COUNT, anchors).forEach(point => {
      this.food.push({ id: this.nextFoodId++, ...point, respawnAt: 0 })
    })
    this.powerups.initialize()
  }

  getMount(owner: string): Fish | undefined {
    return Array.from(this.fish.values()).find(f => f.owner === owner)
  }

  reserve(owner: string, slot: number): boolean {
    if (this.getMount(owner)) return true
    if (Array.from(this.fish.values()).filter(f => f.owner).length >= MAX_RIDERS) return false
    const p = BOARDING_SPOTS[slot]
    if (!p) return false
    this.fish.set(this.nextId, { id: this.nextId++, owner, species: 0, skin: 0, slot: -1,
      x: p.x, z: p.z, mass: 1, yaw: p.yaw, shield: 0, tracking: false, tutorialProtected: false, powerShield: 0, boost: 0,
      boardState: 0, boardSlot: slot, boardingUntil: 0 })
    return true
  }

  beginBoarding(owner: string, id: number): boolean {
    const f = this.getMount(owner)
    if (!f || f.id !== id || f.boardState !== 0) return false
    f.boardState = 1; f.boardingUntil = this.time + BOARDING_TIMEOUT
    return true
  }

  finishBoarding(owner: string, id: number, tutorialProtected: boolean): boolean {
    const f = this.getMount(owner)
    if (!f || f.id !== id || f.boardState !== 1 || this.time > f.boardingUntil
      || this.time < f.boardingUntil - BOARDING_TIMEOUT + 0.8) return false
    f.boardState = 2; f.tracking = true
    f.tutorialProtected = tutorialProtected
    f.shield = tutorialProtected ? 0 : ENTRY_SHIELD
    return true
  }

  beginDocking(owner: string, slot: number, landing: DockLanding): boolean {
    const f = this.getMount(owner)
    if (!f || f.boardState !== 2 || !BOARDING_SPOTS[slot]) return false
    f.boardState = 3; f.boardSlot = slot; f.tracking = false
    f.boardingUntil = this.time + BOARDING_TIMEOUT + 5
    f.dockLanding = landing; f.jumpTick = 0; f.motion = 0
    return true
  }

  finishDocking(owner: string): boolean {
    const f = this.getMount(owner)
    const spot = f && BOARDING_SPOTS[f.boardSlot]
    if (!f || f.boardState !== 3 || !spot) return false
    // Keep this exact fish and mass; parked fish never participate in arena combat.
    f.x = spot.x; f.z = spot.z; f.yaw = spot.yaw
    f.boardState = 0; f.tracking = false; f.boardingUntil = 0
    f.shield = 0; f.jumpTick = 0; f.motion = 0; f.dockLanding = undefined
    return true
  }

  jump(owner: string, fishId: number): void {
    const fish = this.getMount(owner)
    if (!fish || fish.id !== fishId || fish.boardState !== 2 || !fish.tracking) return
    if ((fish.jumpTick ?? 0) > 0 && (this.tick - fish.jumpTick!) * ARENA_TICK_SECONDS < FISH_JUMP_COOLDOWN) return
    fish.jumpTick = this.tick
  }

  observe(owner: string, position: { x: number; y: number; z: number }): void {
    const f = this.getMount(owner)
    // The server reads the engine's player transform, never a client-supplied position message.
    // A waiting fish stays reserved until its rider finishes the boarding animation.
    if (!f || f.boardState !== 2 || (!f.tracking && insideLobbyIsland(position.x, position.z)) || position.y > ARENA_MAX_PLAYER_Y || !Number.isFinite(position.x) || !Number.isFinite(position.z)) return
    if (position.x < SEA.minX || position.x > SEA.maxX || position.z < SEA.minZ || position.z > SEA.maxZ || !insideLagoon(position.x, position.z) || position.y < -3) {
      this.leave(owner, 'You left the sea. Return to the dock to ride again.'); return
    }
    const dx = position.x - f.x, dz = position.z - f.z
    if (Math.hypot(dx, dz) > 0.01) f.yaw = Math.atan2(dx, dz)
    f.x = position.x; f.z = position.z; f.tracking = true
  }

  confirmSharkContact(owner: string, report: SharkTouch): void {
    const { eater, prey, tick } = report
    const rider = this.getMount(owner), shark = this.fish.get(eater)
    if (!rider || rider.id !== prey || rider.boardState !== 2 || !rider.tracking || !shark || !isShark(shark)) return
    if (tick > this.tick || tick < this.tick - 20 || rider.mass >= shark.mass) return
    if (rider.tutorialProtected || rider.shield > 0 || rider.powerShield > 0 || shark.shield > 0) return
    this.sharkContact.confirm(this.time, shark, rider, report)
  }

  leave(owner: string, reason = 'You returned to the island lobby.'): void {
    const f = this.getMount(owner)
    if (!f) return
    this.fish.delete(f.id)
    this.events.push({ type: 'end', owner, reason })
  }

  step(dt: number): void {
    this.time += dt
    this.tick++
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const spawn = this.pending[i]
      if (spawn.at > this.time) continue
      const point = this.respawnPoint(spawn, true)
      if (!point) { spawn.at = this.time + 1; continue }
      this.spawnNpc({ ...this.anchors[spawn.slot], ...point, yaw: Math.random() * Math.PI * 2 })
      this.pending.splice(i, 1)
    }
    const list = Array.from(this.fish.values())
    for (const f of list) {
      if (f.owner && f.boardState !== 2) {
        if (f.boardState === 3 && this.time >= f.boardingUntil) this.finishDocking(f.owner)
        if (f.boardState === 1 && this.time >= f.boardingUntil) f.boardState = 0
        continue
      }
      f.shield = Math.max(0, f.shield - dt)
      // Static NPCs remain collectible-only; the shark has its own player-only brain.
      if (!f.owner || !f.tracking) continue
      this.eatFood(f)
    }
    this.powerups.step(dt, this.time, this.tick, list)
    this.events.push(...this.powerups.events.splice(0))
    const shark = list.find(isShark)
    if (shark) this.sharkBrain.update(dt, this.time, shark, list)
    this.sharkContact.update(this.time, shark, list)
    // Snapshot sizes for arbitration; one prey can be awarded only once this tick.
    const ordered = list.map(f => ({ ...f })).sort((a, b) => b.mass - a.mass || a.id - b.id)
    for (const eater of ordered) {
      const predator = isShark(eater)
      if ((eater.owner && eater.boardState !== 2) || (!eater.owner && !predator) || !eater.tracking || !this.fish.has(eater.id)) continue
      for (const prey of ordered) {
        if (eater.id === prey.id || !this.fish.has(prey.id) || eater.mass <= prey.mass) continue
        if (predator && !prey.owner) continue
        if (prey.owner && (prey.boardState !== 2 || !prey.tracking)) continue
        if (isShark(prey) && prey.shield > 0) continue
        // Entry grace blocks PvP both ways. A collected shield protects its holder, who can still eat unshielded prey.
        if (prey.owner && (prey.tutorialProtected || eater.shield > 0 || prey.shield > 0 || prey.powerShield > 0)) continue
        if (predator ? !this.sharkContact.canBite(this.time, eater, prey) : !fishInEatingContact(eater, prey)) continue
        this.fish.delete(prey.id)
        const live = this.fish.get(eater.id)!
        live.mass += prey.mass
        if (eater.owner) this.events.push({ type: 'growth', owner: eater.owner, mass: live.mass })
        if (!prey.owner) {
          live.tutorialProtected = false
          this.pickup(live, 1, prey.id, prey.species, prey.x, prey.z, prey.mass)
          this.events.push({ type: 'catch', owner: eater.owner, species: prey.species, mass: prey.mass })
        }
        if (prey.owner) this.events.push({ type: 'eaten', owner: prey.owner, eventId: this.session + ':eaten:' + prey.id, byShark: predator })
        if (prey.owner) this.events.push({ type: 'end', owner: prey.owner,
          reason: predator ? 'The Hammerhead Shark ate you. Your cash and discoveries are safe.'
            : 'A larger player fish ate you. Your discoveries are safe.' })
        else this.pending.push({ at: this.time + 8, slot: prey.slot, x: prey.x, z: prey.z })
      }
    }
    for (const food of this.food) {
      if (food.respawnAt > 0 && food.respawnAt <= this.time) {
        const point = this.respawnPoint(food)
        if (!point) { food.respawnAt = this.time + 1; continue }
        food.x = point.x; food.z = point.z
        // A new lifetime gets a new id so delayed pickup replies cannot hide its replacement.
        food.id = this.nextFoodId++
        food.respawnAt = 0
      }
    }
  }

  snapshot() {
    return {
      tick: this.tick,
      fish: Array.from(this.fish.values()).map(({ id, owner, species, skin, slot, x, z, yaw, mass, shield, powerShield, boost, motion, jumpTick, boardState, boardSlot }) =>
        ({ id, owner, species, skin, slot, x, z, yaw, mass, shield, powerShield, boost, motion: motion ?? 0, jumpTick: jumpTick ?? 0, boardState, boardSlot })),
      food: this.food.filter(f => f.respawnAt === 0).map(({ id, x, z }) => ({ id, x, z })),
      powerups: this.powerups.snapshot()
    }
  }

  private eatFood(f: Fish): void {
    let reach = foodEatRadius(f.mass)
    for (const food of this.food) {
      if (food.respawnAt === 0 && distanceSquared(f.x, f.z, food.x, food.z) < reach * reach) {
        food.respawnAt = this.time + 4
        f.mass++
        reach = foodEatRadius(f.mass)
        this.events.push({ type: 'growth', owner: f.owner, mass: f.mass })
        this.pickup(f, 0, food.id, -1, food.x, food.z, 1)
      }
    }
  }

  private respawnPoint(previous: SpawnPoint, npc = false): SpawnPoint | undefined {
    const blockers: SpawnBlocker[] = [{ x: previous.x, z: previous.z, clearance: npc ? 10 : FOOD_SPACING }]
    for (const entry of ENTRY_POINTS) blockers.push({ ...entry, clearance: npc ? 6 : 4 })
    // Reserve dormant food positions too, so simultaneous respawns keep their spacing.
    for (const food of this.food) if (food !== previous) {
      blockers.push({ x: food.x, z: food.z, clearance: npc ? 3 : FOOD_SPACING })
    }
    for (const fish of this.fish.values()) {
      blockers.push({ x: fish.x, z: fish.z, clearance: fish.owner ? 6 : npc ? 10 : 3 })
    }
    for (const powerup of this.powerups.items) blockers.push({ x: powerup.x, z: powerup.z, clearance: 4 })
    const starter = npc ? ('slot' in previous && previous.slot === 0) : previous === this.food[0] || previous === this.food[1]
    const allowed = npc ? undefined : foodOutsideDock
    return (starter ? chooseDockSeaPoint(blockers, npc ? 12 : 14, npc ? 25 : 32, allowed) : undefined)
      ?? chooseRespawnPoint(blockers, allowed)
  }

  private powerupBlockers(): SpawnBlocker[] {
    const blockers: SpawnBlocker[] = ENTRY_POINTS.map(p => ({ ...p, clearance: 6 }))
    for (const food of this.food) blockers.push({ x: food.x, z: food.z, clearance: 3 })
    for (const fish of this.fish.values()) blockers.push({ x: fish.x, z: fish.z, clearance: fish.owner ? 6 : 4 })
    return blockers
  }

  private pickup(fish: Fish, kind: number, target: number, species: number, x: number, z: number, value: number): void {
    this.events.push({ type: 'pickup', owner: fish.owner, pickup: {
      eventId: this.session + ':' + (++this.pickupSequence), eater: fish.id, tick: this.tick,
      kind, target, species, x, z, value, mass: fish.mass
    } })
  }

  private spawnNpc(anchor: NpcAnchor): void {
    const predator = isShark({ owner: '', species: anchor.species })
    if (predator) this.sharkBrain.reset()
    this.fish.set(this.nextId, { id: this.nextId++, owner: '', species: anchor.species, skin: 0, slot: anchor.slot,
      x: anchor.x, z: anchor.z, yaw: anchor.yaw, mass: SPECIES[anchor.species].mass,
      shield: predator ? SHARK_RULES.spawnProtection : 0, tracking: predator, tutorialProtected: false,
      powerShield: 0, boost: 0, motion: 0, boardState: 2, boardSlot: -1, boardingUntil: 0 })
  }

}
