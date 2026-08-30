/**
 * Live interaction state, shared between the things that produce it (the
 * pointer raycast in CharacterParticles) and the things that consume it (the
 * camera's roll, the ambient audio layer, the debug readout).
 *
 * A plain module object for the same reason as scrollStore: every field here is
 * written and read once per frame.
 */
import { Vector3 } from 'three'

export const interaction = {
  /** Is the pointer currently over the character's surface? */
  hover: false,
  /** Damped 0..1 version of `hover`. Everything visual keys off this, so
   *  entering and leaving the character eases instead of snapping. */
  active: 0,
  /** Last hit, in the character's local space — the space the simulation and
   *  the sampled rest positions both live in. */
  point: new Vector3(),
  /** Surface normal at that hit, same space. */
  normal: new Vector3(0, 0, 1),
  /** Pointer travel direction, same space, unit length. */
  drag: new Vector3(),
  /** 0..1 pointer speed, damped. Left/right motion is weighted most heavily —
   *  it is the gesture the effect is designed around. */
  energy: 0,
  /** Decaying 0..1 kick set on the frame the pointer *arrives* on the character,
   *  independent of how fast it is moving. Because it decays on its own, arriving
   *  breaks the cloud open and the spring reforms it while the cursor is still
   *  sitting there. */
  burst: 0,
  /** Mean particle displacement as a 0..1 fraction of the scatter radius,
   *  reported back by the render pass. Drives the audio layer. */
  distortion: 0,
  /** Camera roll the rig should add, in radians. */
  roll: 0,
  /** True once the pointer has been anywhere near the character this session —
   *  the audio layer waits for this before building its graph. */
  touched: false,
}

export function resetInteraction() {
  interaction.hover = false
  interaction.active = 0
  interaction.energy = 0
  interaction.burst = 0
  interaction.distortion = 0
  interaction.roll = 0
  interaction.drag.set(0, 0, 0)
}
