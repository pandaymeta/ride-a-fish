export const FISH_JUMP_HEIGHT = 2.2
export const FISH_JUMP_DURATION = 1.8
export const FISH_JUMP_COOLDOWN = 2.3
export const ARENA_TICK_SECONDS = 0.05

export function fishJumpHeight(age: number): number {
  if (age <= 0 || age >= FISH_JUMP_DURATION) return 0
  const phase = age / FISH_JUMP_DURATION
  return 4 * FISH_JUMP_HEIGHT * phase * (1 - phase)
}

// Analytic vertical speed: fast launch, zero at the peak, accelerating descent.
export function fishJumpVelocity(age: number): number {
  if (age < 0 || age >= FISH_JUMP_DURATION) return 0
  return 4 * FISH_JUMP_HEIGHT / FISH_JUMP_DURATION * (1 - 2 * age / FISH_JUMP_DURATION)
}
