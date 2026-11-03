import { LOBBY_ISLAND, routeAroundLobbyIsland } from '../shared/lobbyIsland'
import type { FishState } from '../shared/messages'
import { SHARK_RULES } from '../shared/shark'
import { distanceSquared, fishInEatingContact } from '../shared/eating'
import { fishBodyScale } from '../shared/fishGeometry'
import { constrainToLagoon, insideLagoon } from '../shared/lagoon'

export interface SharkBody extends FishState { tracking: boolean; tutorialProtected: boolean }
interface Point { x: number; z: number }

function canHunt(shark: SharkBody, rider: SharkBody): boolean {
  return rider.mass < shark.mass && !rider.tutorialProtected && rider.shield <= 0 && (rider.powerShield ?? 0) <= 0
}

// One bounded scan of arena riders per decision; no pathfinding, timers or client authority.
export class SharkBrain {
  private turnRate = 0
  private swimSpeed = 0
  private routeSide = 0
  private nextThink = 0
  private nextRoam = 0
  private targetId?: number
  private goal?: Point

  reset(): void { this.turnRate = 0; this.swimSpeed = 0; this.routeSide = 0; this.nextThink = 0; this.nextRoam = 0; this.targetId = undefined; this.goal = undefined }

  update(dt: number, now: number, shark: SharkBody, fish: readonly SharkBody[]): void {
    // Keep roaming for lobby spectators even when there are no arena riders.
    if (shark.shield > 0) {
      shark.motion = 0; this.reset(); return
    }
    let target = this.targetId === undefined ? undefined : fish.find(f => f.id === this.targetId && f.owner && f.tracking)
    const validTarget = target && (shark.motion === 2 ? target.mass > shark.mass : canHunt(shark, target))
    if (now >= this.nextThink || (this.targetId !== undefined && !validTarget)) {
      this.nextThink = now + SHARK_RULES.thinkInterval
      let threat: SharkBody | undefined, prey: SharkBody | undefined
      let threatDistance = SHARK_RULES.detectionRange ** 2, preyDistance = threatDistance
      for (const rider of fish) {
        if (!rider.owner || !rider.tracking) continue
        const distance = distanceSquared(shark.x, shark.z, rider.x, rider.z)
        if (rider.mass > shark.mass && distance <= threatDistance) {
          threat = rider; threatDistance = distance
        } else if (distance <= preyDistance && canHunt(shark, rider)) {
          prey = rider; preyDistance = distance
        }
      }
      // Keep an acquired target through short range/edge changes.
      if (!threat && !prey && validTarget && target && distanceSquared(shark.x, shark.z, target.x, target.z) <= SHARK_RULES.loseRange ** 2) {
        if (target.mass > shark.mass) threat = target
        else prey = target
      }
      target = threat ?? prey
      this.targetId = target?.id
      shark.motion = threat ? 2 : prey ? 1 : 0
      if (target) { this.goal = undefined; this.nextRoam = 0 }
      if (threat) this.goal = this.fleePoint(shark, threat)
    }
    if (shark.motion === 1 && target) {
      // Arrive with the measured head against the fish, rather than swimming its center past it.
      if (fishInEatingContact(shark, target)) { this.goal = undefined; this.swimSpeed = 0; this.turnRate = 0; return }
      const dx = target.x - shark.x, dz = target.z - shark.z
      const distance = Math.max(0.001, Math.hypot(dx, dz))
      const standOff = 0.346154 * fishBodyScale(shark)
      this.goal = { x: target.x - dx / distance * standOff, z: target.z - dz / distance * standOff }
    }
    if (!this.targetId && (!this.goal || now >= this.nextRoam || distanceSquared(shark.x, shark.z, this.goal.x, this.goal.z) < 1)) {
      const angle = Math.random() * Math.PI * 2
      const radius = (0.3 + Math.random() * 0.7) * SHARK_RULES.wanderRadius
      this.goal = { x: shark.x + Math.cos(angle) * radius, z: shark.z + Math.sin(angle) * radius }
      constrainToLagoon(this.goal, SHARK_RULES.edgeMargin)
      this.nextRoam = now + 2 + Math.random() * 3
    }
    if (!this.goal) return
    const steeringGoal = routeAroundLobbyIsland(shark, this.goal, this.routeSide, SHARK_RULES.edgeMargin)
    if (steeringGoal === this.goal) this.routeSide = 0
    else if (!this.routeSide) {
      const island = LOBBY_ISLAND, rx = island.shoreRadiusX + 6, rz = island.shoreRadiusZ + 6
      const start = Math.atan2((shark.z - island.z) / rz, (shark.x - island.x) / rx)
      const waypoint = Math.atan2((steeringGoal.z - island.z) / rz, (steeringGoal.x - island.x) / rx)
      this.routeSide = Math.atan2(Math.sin(waypoint - start), Math.cos(waypoint - start)) >= 0 ? 1 : -1
    }
    const dx = steeringGoal.x - shark.x, dz = steeringGoal.z - shark.z
    const distance = Math.hypot(dx, dz)
    if (distance < 0.05) return
    const desired = Math.atan2(dx, dz)
    const turn = Math.atan2(Math.sin(desired - shark.yaw), Math.cos(desired - shark.yaw))
    const desiredRate = Math.max(-SHARK_RULES.turnSpeed, Math.min(SHARK_RULES.turnSpeed, turn / Math.max(dt, 0.001)))
    this.turnRate += Math.max(-12 * dt, Math.min(12 * dt, desiredRate - this.turnRate))
    const turnStep = this.turnRate * dt
    if (Math.abs(turnStep) > Math.abs(turn) && turnStep * turn >= 0) { shark.yaw += turn; this.turnRate = 0 }
    else shark.yaw += turnStep
    const speed = shark.motion === 2 ? SHARK_RULES.fleeSpeed : shark.motion === 1 ? SHARK_RULES.chaseSpeed : SHARK_RULES.roamSpeed
    this.swimSpeed += Math.max(-5 * dt, Math.min(5 * dt, speed - this.swimSpeed))
    const travel = Math.min(distance, this.swimSpeed * dt)
    const next = { x: shark.x + Math.sin(shark.yaw) * travel, z: shark.z + Math.cos(shark.yaw) * travel }
    if (!insideLagoon(next.x, next.z, SHARK_RULES.edgeMargin)) {
      constrainToLagoon(next, SHARK_RULES.edgeMargin)
      this.nextThink = 0; this.nextRoam = 0
    }
    shark.x = next.x; shark.z = next.z
  }

  private fleePoint(shark: SharkBody, threat: SharkBody): Point {
    const away = Math.atan2(shark.z - threat.z, shark.x - threat.x)
    let best: Point = { x: shark.x, z: shark.z }, bestScore = -Infinity
    // Sideways alternatives keep the shark swimming along a shore instead of pinning against it.
    for (const offset of [0, -Math.PI / 3, Math.PI / 3, -Math.PI / 2, Math.PI / 2]) {
      const angle = away + offset
      const point = { x: shark.x + Math.cos(angle) * SHARK_RULES.fleeDistance,
        z: shark.z + Math.sin(angle) * SHARK_RULES.fleeDistance }
      constrainToLagoon(point, SHARK_RULES.edgeMargin)
      const travel = distanceSquared(shark.x, shark.z, point.x, point.z)
      if (travel < 1) continue
      const score = distanceSquared(point.x, point.z, threat.x, threat.z) + travel * 0.1
      if (score > bestScore) { best = point; bestScore = score }
    }
    return best
  }
}
