import type { ArenaSnapshot, FishState } from './messages'
import { TUTORIAL_FOOD, TUTORIAL_FISH, TUTORIAL_SPEED, TUTORIAL_SHIELD, TUTORIAL_BEFORE_DOCK } from './tutorial'
import { SHIELD_POWERUP } from './powerups'

export interface TutorialPoint { x: number; z: number }
export interface TutorialTarget extends TutorialPoint { kind: 'food' | 'fish' | 'speed' | 'shield' | 'dock'; id: number }
type Available = (kind: TutorialTarget['kind'], id: number) => boolean
function nearest<T extends TutorialPoint & { id: number }>(items: readonly T[], from: TutorialPoint, preferredId?: number): T | undefined {
  let best: T | undefined, distance = Infinity
  for (const item of items) {
    const d = (item.x - from.x) ** 2 + (item.z - from.z) ** 2
    if (d < distance) { best = item; distance = d }
  }
  const previous = preferredId === undefined ? undefined : items.find(item => item.id === preferredId)
  if (previous) {
    const previousDistance = (previous.x - from.x) ** 2 + (previous.z - from.z) ** 2
    // Keep nearly equal targets stable; switch when another is at least 20% closer.
    if (distance >= previousDistance * .64) return previous
  }
  return best
}
// Only directs the client. Confirmed server events remain the sole source of quest credit.
export function chooseTutorialTarget(steps: number, snapshot: ArenaSnapshot, mine: FishState,
  from: TutorialPoint, dock: (from: TutorialPoint) => TutorialPoint | undefined,
  available: Available = () => true, previous?: TutorialTarget): TutorialTarget | undefined {
  if ((steps & TUTORIAL_BEFORE_DOCK) === TUTORIAL_BEFORE_DOCK) {
    const p = dock(from)
    return p ? { ...p, kind: 'dock', id: 0 } : undefined
  }
  if (!(steps & TUTORIAL_FOOD) || !(steps & TUTORIAL_FISH)) {
    if (steps & TUTORIAL_FOOD) {
      const fish = nearest(snapshot.fish.filter(f => !f.owner && f.mass < mine.mass && f.shield <= 0 && available('fish', f.id)), from,
        previous?.kind === 'fish' ? previous.id : undefined)
      if (fish) return { x: fish.x, z: fish.z, kind: 'fish', id: fish.id }
    }
    const food = nearest(snapshot.food.filter(f => available('food', f.id)), from, previous?.kind === 'food' ? previous.id : undefined)
    return food ? { ...food, kind: 'food' } : undefined
  }
  const powerups = (snapshot.powerups ?? []).filter(p => p.kind === SHIELD_POWERUP
    ? !(steps & TUTORIAL_SHIELD) && available('shield', p.id)
    : !(steps & TUTORIAL_SPEED) && available('speed', p.id))
  const power = nearest(powerups, from, previous?.kind === 'shield' || previous?.kind === 'speed' ? previous.id : undefined)
  return power ? { x: power.x, z: power.z, id: power.id, kind: power.kind === SHIELD_POWERUP ? 'shield' : 'speed' } : undefined
}
