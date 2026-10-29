import { Schemas } from '@dcl/sdk/ecs'
import { registerMessages } from '@dcl/sdk/network'

// Registered during module load, before the ECS engine seals its schema registry.
const fish = Schemas.Map({
  id: Schemas.Int, owner: Schemas.String, species: Schemas.Int,
  x: Schemas.Float, z: Schemas.Float, yaw: Schemas.Float,
  mass: Schemas.Int, shield: Schemas.Float
})
export const room = registerMessages({
  hello: Schemas.Map({}),
  enter: Schemas.Map({}),
  steer: Schemas.Map({ seq: Schemas.Int, x: Schemas.Float, z: Schemas.Float }),
  leave: Schemas.Map({}),
  snapshot: Schemas.Map({
    tick: Schemas.Int, fish: Schemas.Array(fish),
    food: Schemas.Array(Schemas.Map({ id: Schemas.Int, x: Schemas.Float, z: Schemas.Float }))
  }),
  profile: Schemas.Map({
    counts: Schemas.Array(Schemas.Int), largest: Schemas.Array(Schemas.Int),
    best: Schemas.Int, peak: Schemas.Int, guest: Schemas.Boolean,
    saved: Schemas.Boolean, result: Schemas.String
  }),
  notice: Schemas.Map({ message: Schemas.String })
})

export interface FishState {
  id: number; owner: string; species: number
  x: number; z: number; yaw: number; mass: number; shield: number
}
export interface FoodState { id: number; x: number; z: number }
export interface ArenaSnapshot { tick: number; fish: FishState[]; food: FoodState[] }
export interface Progress {
  version: number; counts: number[]; largest: number[]; best: number
}
export interface PlayerProfile {
  counts: number[]; largest: number[]; best: number; peak: number
  guest: boolean; saved: boolean; result: string
}
