import { chooseDockSeaPoint } from './tutorialSpawns'
import { distanceSquared } from '../shared/eating'
import { BOOST_DURATION, POWERUP_COUNT_PER_KIND, POWERUP_RESPAWN_SECONDS,
  PowerupGrant, PowerupState, powerupEatRadius, SHIELD_DURATION, SHIELD_POWERUP } from '../shared/powerups'
import { chooseAreaRespawnPoint, SpawnBlocker } from './respawnPoints'
import { areaAtPoint } from '../shared/areaBalance'
import { OCEAN_AREAS } from '../shared/oceanAreas'

export interface PowerupRider {
  id: number; owner: string; x: number; z: number; mass: number; tracking: boolean
  powerShield: number; boost: number
}
interface Powerup extends PowerupState { respawnAt: number; nearDock: boolean; area: number }
export interface PowerupEvent { type: 'powerup'; owner: string; grant: PowerupGrant }

export class ArenaPowerups {
  readonly items: Powerup[] = []
  readonly events: PowerupEvent[] = []
  private nextId = 1
  private nextEvent = 0
  private session = 'power-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  constructor(private blockers: () => SpawnBlocker[]) {}

  initialize(): void {
    for (let area = 0; area < OCEAN_AREAS.length; area++) for (let kind = 0; kind < 2; kind++) for (let i = 0; i < POWERUP_COUNT_PER_KIND; i++) {
      const item = { id: this.nextId++, kind, area, x: 80, z: 80, respawnAt: 1, nearDock: area === 0 && i === 0 }
      this.items.push(item)
      if (this.place(item)) item.respawnAt = 0
    }
  }

  step(dt: number, now: number, tick: number, riders: readonly PowerupRider[]): void {
    for (const rider of riders) {
      if (!rider.owner) continue
      rider.powerShield = Math.max(0, rider.powerShield - dt)
      rider.boost = Math.max(0, rider.boost - dt)
      if (!rider.tracking) continue
      const radius = powerupEatRadius(rider.mass)
      for (const item of this.items) {
        if (item.respawnAt !== 0 || distanceSquared(rider.x, rider.z, item.x, item.z) >= radius * radius) continue
        item.respawnAt = now + POWERUP_RESPAWN_SECONDS
        if (item.kind === SHIELD_POWERUP) rider.powerShield = SHIELD_DURATION
        else rider.boost = BOOST_DURATION
        this.events.push({ type: 'powerup', owner: rider.owner, grant: {
          eventId: this.session + ':' + (++this.nextEvent), eater: rider.id, tick, target: item.id, kind: item.kind,
          powerShield: rider.powerShield, boost: rider.boost
        } })
      }
    }
    for (const item of this.items) if (item.respawnAt > 0 && item.respawnAt <= now) {
      if (this.place(item)) { item.id = this.nextId++; item.respawnAt = 0 }
      else item.respawnAt = now + 1
    }
    // Keep one of each type available in every area, even when both copies were just collected.
    // Replacements use a new id and a clear position away from riders, never the just-collected spot.
    for (let area = 0; area < OCEAN_AREAS.length; area++) for (let kind = 0; kind < 2; kind++) {
      if (this.items.some(item => item.area === area && item.kind === kind && item.respawnAt === 0)) continue
      const replacement = this.items.find(item => item.area === area && item.kind === kind && item.respawnAt > 0)
      if (!replacement) continue
      if (this.place(replacement)) { replacement.id = this.nextId++; replacement.respawnAt = 0 }
      else replacement.respawnAt = Math.min(replacement.respawnAt, now + .25)
    }
  }

  snapshot(): PowerupState[] {
    return this.items.filter(p => p.respawnAt === 0).map(({ id, kind, x, z }) => ({ id, kind, x, z }))
  }

  private place(item: Powerup): boolean {
    const blockers = this.blockers()
    blockers.push({ x: item.x, z: item.z, clearance: 8 })
    for (const other of this.items) if (other !== item) blockers.push({ x: other.x, z: other.z, clearance: 12 })
    const allowed = (p: { x: number; z: number }) => areaAtPoint(p) === item.area
    const point = (item.nearDock ? chooseDockSeaPoint(blockers, 10, 27, allowed) : undefined)
      ?? chooseAreaRespawnPoint(item.area, blockers, allowed)
    if (!point) return false
    item.x = point.x; item.z = point.z
    return true
  }
}
