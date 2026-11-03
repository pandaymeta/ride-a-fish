import { BOARDING_CLEARANCE, BOARDING_SPOTS } from '../shared/boarding'
import { room } from '../shared/messages'
import { Arena } from './arena'

// Server-only FIFO reservations; each berth has one owner and prefers the lowest free index.
export class BoardingQueue {
  private waiting: string[] = []
  constructor(private arena: Arena) {}

  join(owner: string): void {
    if (!this.arena.getMount(owner) && !this.waiting.includes(owner)) this.waiting.push(owner)
  }

  remove(owner: string): void { this.waiting = this.waiting.filter(address => address !== owner) }

  update(present: ReadonlyMap<string, unknown>): void {
    const occupied = new Set<number>()
    for (const fish of this.arena.fish.values()) {
      if (!fish.owner || fish.boardSlot < 0) continue
      const spot = BOARDING_SPOTS[fish.boardSlot]
      if (fish.boardState === 2 && Math.hypot(fish.x - spot.x, fish.z - spot.z) >= BOARDING_CLEARANCE) fish.boardSlot = -1
      else occupied.add(fish.boardSlot)
    }
    this.waiting = this.waiting.filter(address => !this.arena.getMount(address))
    for (let slot = 0; slot < BOARDING_SPOTS.length; slot++) {
      if (occupied.has(slot)) continue
      const spot = BOARDING_SPOTS[slot]
      if (Array.from(this.arena.fish.values()).some(f => f.owner && f.boardState === 2
        && Math.hypot(f.x - spot.x, f.z - spot.z) < BOARDING_CLEARANCE)) continue
      const index = this.waiting.findIndex(address => present.has(address))
      if (index < 0) break
      const owner = this.waiting[index]
      if (!this.arena.reserve(owner, slot)) break
      this.waiting.splice(index, 1)
      this.status(owner)
    }
  }

  parkingSlot(owner: string): number | undefined {
    const fish = this.arena.getMount(owner)
    if (!fish) return
    const occupied = new Set<number>()
    for (const other of this.arena.fish.values()) {
      if (other.owner && other.id !== fish.id && other.boardSlot >= 0) occupied.add(other.boardSlot)
    }
    let result: number | undefined, distance = Infinity
    BOARDING_SPOTS.forEach((spot, slot) => {
      if (occupied.has(slot)) return
      const d = (fish.x - spot.x) ** 2 + (fish.z - spot.z) ** 2
      if (d < distance) { result = slot; distance = d }
    })
    return result
  }

  status(owner: string): void {
    const fish = this.arena.getMount(owner)
    void room.send('boardingStatus', { position: fish ? 0 : Math.max(0, this.waiting.indexOf(owner) + 1), slot: fish?.boardSlot ?? -1 }, { to: [owner] })
  }
}
