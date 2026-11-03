import { chooseDockSeaPoint } from './tutorialSpawns'
import { distanceSquared } from '../shared/eating'
import { BOOST_DURATION, POWERUP_COUNT_PER_KIND, POWERUP_RESPAWN_SECONDS,
  PowerupGrant, PowerupState, powerupEatRadius, SHIELD_DURATION, SHIELD_POWERUP } from '../shared/powerups'
import { chooseRespawnPoint, SpawnBlocker } from './respawnPoints'

export interface PowerupRider {
  id: number; owner: string; x: number; z: number; mass: number; tracking: boolean
  powerShield: number; boost: number
}
interface Powerup extends PowerupState { respawnAt: number; nearDock: boolean }
export interface PowerupEvent { type: 'powerup'; owner: string; grant: PowerupGrant }

export class ArenaPowerups {
  readonly items: Powerup[] = []
  readonly events: PowerupEvent[] = []
  private nextId = 1
  private nextEvent = 0
  private session = 'power-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  constructor(private blockers: () => SpawnBlocker[]) {}

  initialize(): void {
    for (let kind = 0; kind < 2; kind++) for (let i = 0; i < POWERUP_COUNT_PER_KIND; i++) {
      const item = { id: this.nextId++, kind, x: 80, z: 80, respawnAt: 1, nearDock: i === 0 }
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
        else rider.boost += BOOST_DURATION
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
  }

  snapshot(): PowerupState[] {
    return this.items.filter(p => p.respawnAt === 0).map(({ id, kind, x, z }) => ({ id, kind, x, z }))
  }

  private place(item: Powerup): boolean {
    const blockers = this.blockers()
    blockers.push({ x: item.x, z: item.z, clearance: 8 })
    for (const other of this.items) if (other !== item) blockers.push({ x: other.x, z: other.z, clearance: 12 })
    const point = (item.nearDock ? chooseDockSeaPoint(blockers, 10, 27) : undefined) ?? chooseRespawnPoint(blockers)
    if (!point) return false
    item.x = point.x; item.z = point.z
    return true
  }
}
