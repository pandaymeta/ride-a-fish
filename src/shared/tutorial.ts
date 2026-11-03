// One saved, event-driven first-visit tutorial. Bits are stable across releases.
export const GUIDE_NAME = 'Beach Guide'
export const GUIDE_INTERACTION_NAME = 'Beach Guide Interaction'
export const GUIDE_RANGE = 3
export const TUTORIAL_RIDE = 1
export const TUTORIAL_FOOD = 2
export const TUTORIAL_FISH = 4
export const TUTORIAL_SPEED = 8
export const TUTORIAL_SHIELD = 16
export const TUTORIAL_DOCK = 32
export const TUTORIAL_BEFORE_DOCK = 31
export const TUTORIAL_COMPLETE = 63
export const GUIDE_WELCOME = 0
export const GUIDE_FINISH = 1
export interface TutorialProgress { version: number; steps: number; dialogues: number }
export const GUIDE_LINES = [
  { pages: [
    { text: 'Welcome, my dear! Ready for a little adventure?', button: 'Next' },
    { text: 'Ride on a fish and feed her to grow. Follow the arrow to guide you through.', button: 'Let’s ride!' }
  ] },
  { pages: [
    { text: 'Well done, my dear! Your fish is safely parked. Head out again and discover more fish!', button: 'Thanks!' }
  ] }
] as const
export const GUIDE_DEFEAT_LINES = {
  shark: { text: 'Shark can be naughty sometimes!', button: 'Close' },
  player: { text: "Why can't your friend be friendly?", button: 'Close' }
} as const
export const TUTORIAL_LESSONS = [
  { bit: TUTORIAL_RIDE, title: 'Ride a fish' },
  { bit: TUTORIAL_FOOD, title: 'Eat a food' },
  { bit: TUTORIAL_FISH, title: 'Eat a fish' },
  { bit: TUTORIAL_SPEED, title: 'Collect a Speedbooster' },
  { bit: TUTORIAL_SHIELD, title: 'Collect a Shield' },
  { bit: TUTORIAL_DOCK, title: 'Return to Dock' }
] as const

export function tutorialFishArrow(progress: TutorialProgress): boolean {
  const started = (progress.dialogues & 1) !== 0 || progress.steps > 0
  return started && !(progress.steps === TUTORIAL_COMPLETE && !(progress.dialogues & 2))
}
export function readTutorial(value?: TutorialProgress): TutorialProgress {
  const integer = (n: unknown, mask: number): number => typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n & mask : 0
  return { version: 1, steps: integer(value?.steps, TUTORIAL_COMPLETE), dialogues: integer(value?.dialogues, 3) }
}
export function completeTutorialLesson(progress: TutorialProgress, bit: number): boolean {
  if (bit !== TUTORIAL_RIDE && !(progress.steps & TUTORIAL_RIDE)) return false
  if (bit === TUTORIAL_DOCK && (progress.steps & TUTORIAL_BEFORE_DOCK) !== TUTORIAL_BEFORE_DOCK) return false
  if (progress.steps & bit) return false
  progress.steps |= bit
  // Boarding without talking bypasses the now-outdated welcome speech.
  if (bit === TUTORIAL_RIDE) progress.dialogues |= 1
  return true
}
export function tutorialDialogue(progress: TutorialProgress): number | undefined {
  if (progress.steps === TUTORIAL_COMPLETE) return progress.dialogues & 2 ? undefined : GUIDE_FINISH
  return progress.steps === 0 && !(progress.dialogues & 1) ? GUIDE_WELCOME : undefined
}
export function tutorialCount(steps: number): number {
  let count = 0
  for (const lesson of TUTORIAL_LESSONS) if (steps & lesson.bit) count++
  return count
}
