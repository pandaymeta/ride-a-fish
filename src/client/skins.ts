import { engine, InputAction, pointerEventsSystem } from '@dcl/sdk/ecs'
import { actions } from './state'

export function setupSkinDisplays(): void {
  const pending = [
    { name: 'Clownfish Skin Display', hoverText: 'Choose Clownfish', action: () => actions.selectClownfish() },
    { name: 'Amber Darter Skin Display', hoverText: 'Choose Amber Darter', action: () => actions.selectAmberDarter() }
  ]
  let clock = 1
  engine.addSystem(dt => {
    if (!pending.length) return
    clock += dt
    if (clock < 1) return
    clock = 0
    for (let i = pending.length - 1; i >= 0; i--) {
      const display = pending[i]
      const entity = engine.getEntityOrNullByName(display.name)
      if (entity === null) continue
      pointerEventsSystem.onPointerDown({ entity, opts: { button: InputAction.IA_POINTER,
        hoverText: display.hoverText, maxDistance: 8 } }, display.action)
      pending.splice(i, 1)
    }
  })
}
