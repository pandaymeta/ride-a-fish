import { eatRadius } from './config'
import { ContactFish, sharkBodyContact } from './fishContactGeometry'
import { isShark } from './shark'

export function foodEatRadius(mass: number): number { return eatRadius(mass) + 0.25 }
export function fishEatRadius(eaterMass: number, preyMass: number): number {
  return eatRadius(eaterMass) + eatRadius(preyMass) * 0.4
}
export function distanceSquared(x: number, z: number, otherX: number, otherZ: number): number {
  const dx = x - otherX, dz = z - otherZ
  return dx * dx + dz * dz
}

export function fishInEatingContact(eater: ContactFish, prey: ContactFish): boolean {
  if (isShark(eater)) return sharkBodyContact(eater, prey)
  const reach = fishEatRadius(eater.mass, prey.mass)
  return distanceSquared(eater.x, eater.z, prey.x, prey.z) <= reach * reach
}
