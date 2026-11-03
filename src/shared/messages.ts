import type { TutorialProgress } from './tutorial'
import { Schemas } from '@dcl/sdk/ecs'
import { registerMessages } from '@dcl/sdk/network'
import type { ContactPose } from './fishContactGeometry'
import type { PowerupState } from './powerups'

// Registered during module load, before the ECS engine seals its schema registry.
const fish = Schemas.Map({
  id: Schemas.Int, owner: Schemas.String, species: Schemas.Int, skin: Schemas.Int, slot: Schemas.Int,
  x: Schemas.Float, z: Schemas.Float, yaw: Schemas.Float,
  mass: Schemas.Int, shield: Schemas.Float, powerShield: Schemas.Float, boost: Schemas.Float, motion: Schemas.Int, jumpTick: Schemas.Int, boardState: Schemas.Int, boardSlot: Schemas.Int
})
const contactPose = Schemas.Map({ x: Schemas.Float, y: Schemas.Float, z: Schemas.Float,
  qx: Schemas.Float, qy: Schemas.Float, qz: Schemas.Float, qw: Schemas.Float })
export const room = registerMessages({
  hello: Schemas.Map({}),
  guideTalk: Schemas.Map({}),
  guideAcknowledge: Schemas.Map({ kind: Schemas.Int }),
  guideDialogue: Schemas.Map({ kind: Schemas.Int }),
  board: Schemas.Map({ fishId: Schemas.Int }),
  dock: Schemas.Map({ fishId: Schemas.Int }),
  docked: Schemas.Map({ fishId: Schemas.Int }),
  dockReady: Schemas.Map({ fishId: Schemas.Int, x: Schemas.Float, y: Schemas.Float, z: Schemas.Float }),
  seated: Schemas.Map({ fishId: Schemas.Int }),
  boardingStatus: Schemas.Map({ position: Schemas.Int, slot: Schemas.Int }),
  selectSkin: Schemas.Map({ skin: Schemas.Int }),
  skinSelected: Schemas.Map({ skin: Schemas.Int }),
  leave: Schemas.Map({}),
  jump: Schemas.Map({ fishId: Schemas.Int }),
  eaten: Schemas.Map({ eventId: Schemas.String, byShark: Schemas.Boolean }),
  sharkTouch: Schemas.Map({ eater: Schemas.Int, prey: Schemas.Int, tick: Schemas.Int, sharkPose: contactPose, riderPose: contactPose }),
  powerup: Schemas.Map({
    eventId: Schemas.String, eater: Schemas.Int, tick: Schemas.Int, target: Schemas.Int, kind: Schemas.Int,
    powerShield: Schemas.Float, boost: Schemas.Float
  }),
  pickup: Schemas.Map({
    eventId: Schemas.String, eater: Schemas.Int, tick: Schemas.Int, kind: Schemas.Int,
    target: Schemas.Int, species: Schemas.Int, x: Schemas.Float, z: Schemas.Float,
    mass: Schemas.Int, value: Schemas.Int, cashTotal: Schemas.Int
  }),
  snapshot: Schemas.Map({
    tick: Schemas.Int, fish: Schemas.Array(fish),
    food: Schemas.Array(Schemas.Map({ id: Schemas.Int, x: Schemas.Float, z: Schemas.Float })),
    powerups: Schemas.Array(Schemas.Map({ id: Schemas.Int, kind: Schemas.Int, x: Schemas.Float, z: Schemas.Float }))
  }),
  profile: Schemas.Map({
    tutorialSteps: Schemas.Int, tutorialDialogues: Schemas.Int,
    cash: Schemas.Int,
    counts: Schemas.Array(Schemas.Int), largest: Schemas.Array(Schemas.Int),
    best: Schemas.Int, peak: Schemas.Int, guest: Schemas.Boolean,
    saved: Schemas.Boolean, result: Schemas.String
  }),
  notice: Schemas.Map({ message: Schemas.String })
})

export interface FishState {
  id: number; owner: string; species: number; skin: number; slot: number
  x: number; z: number; yaw: number; mass: number; shield: number
  powerShield?: number; boost?: number; motion?: number; jumpTick?: number
  boardState: number; boardSlot: number
}
export interface FoodState { id: number; x: number; z: number }
export interface ArenaSnapshot { tick: number; fish: FishState[]; food: FoodState[]; powerups?: PowerupState[] }
export interface Progress {
  version: number; tutorial?: TutorialProgress; counts: number[]; largest: number[]; best: number; cash?: number; food?: number
}
export interface PlayerProfile {
  tutorialSteps: number; tutorialDialogues: number
  cash: number
  counts: number[]; largest: number[]; best: number; peak: number
  guest: boolean; saved: boolean; result: string
}

export interface PickupNotice {
  eventId: string; eater: number; tick: number; kind: number; target: number; species: number
  x: number; z: number; mass: number; value: number; cashTotal: number
}

export interface SharkTouch { eater: number; prey: number; tick: number; sharkPose: ContactPose; riderPose: ContactPose }
