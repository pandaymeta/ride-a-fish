import { triggerSceneEmote } from '~system/RestrictedActions'

export const RIDER_SITTING_ANIMATION = 'assets/animations/Sit_Edge2_emote.glb'
// Measured Avatar_Hips height stays constant throughout the supplied clip.
export { RIDER_HIP_HEIGHT } from '../shared/fishGeometry'

export async function playRiderSittingPose(): Promise<void> {
  const result = await triggerSceneEmote({ src: RIDER_SITTING_ANIMATION, loop: true })
  if (!result.success) throw new Error('Could not play Sit on Edge 2.')
}

export async function playBoardingWalk(): Promise<void> {
  const result = await triggerSceneEmote({ src: 'assets/animations/Dock_Boarding_Walk_emote.glb', loop: true })
  if (!result.success) throw new Error('Could not play the boarding step.')
}
