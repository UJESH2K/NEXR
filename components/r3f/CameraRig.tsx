'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, type PerspectiveCamera } from 'three'
import { interaction } from '@/lib/particles/interaction'
import { ACT, easeInOutCubic, lerp, remap, scroll } from '@/lib/scrollStore'

/** Aim a little above the origin — the model is centred, so this frames the
 *  upper body rather than the midpoint. */
export const LOOK_Y = 0.35

/** Full revolutions completed during the orbit act. */
const TURNS = 2
const ORBIT_ENTRY_AZIMUTH = 0.35
const ORBIT_EXIT_AZIMUTH = ORBIT_ENTRY_AZIMUTH + Math.PI * 2 * TURNS

/** How fast the damped pose converges on the target. Higher = tighter. */
const SMOOTHING = 5

type Pose = { radius: number; height: number; fov: number; azimuth: number }

/**
 * The camera path as a pure function of scroll progress. Keeping it pure means
 * the pose is fully determined by scroll position — no accumulated drift, and
 * jumping to any progress value lands in exactly the right place.
 */
function poseFor(progress: number): Pose {
  // Act I — distant. The character is a small figure in a large dark space.
  if (progress < ACT.distantEnd) {
    return { radius: 26, height: 3, fov: 55, azimuth: 0 }
  }

  // Act II — approach. Dolly in and narrow the lens together; the narrowing
  // fov compresses the space and makes the arrival feel deliberate.
  if (progress < ACT.approachEnd) {
    const t = easeInOutCubic(remap(progress, ACT.distantEnd, ACT.approachEnd))
    return {
      radius: lerp(26, 7.5, t),
      height: lerp(3, 1.2, t),
      fov: lerp(55, 40, t),
      azimuth: lerp(0, ORBIT_ENTRY_AZIMUTH, t),
    }
  }

  // Act III — orbit. Linear in t on purpose: constant angular velocity. Easing
  // here would make the revolution visibly speed up and slow down.
  if (progress < ACT.orbitEnd) {
    const t = remap(progress, ACT.approachEnd, ACT.orbitEnd)
    return {
      radius: 7.5,
      height: 1.2,
      fov: 40,
      azimuth: ORBIT_ENTRY_AZIMUTH + t * Math.PI * 2 * TURNS,
    }
  }

  // Act IV — resolve. Pull back and rise for the closing statement.
  const t = easeInOutCubic(remap(progress, ACT.orbitEnd, 1))
  return {
    radius: lerp(7.5, 13, t),
    height: lerp(1.2, 2.5, t),
    fov: lerp(40, 45, t),
    azimuth: ORBIT_EXIT_AZIMUTH + t * 0.4,
  }
}

export function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const pose = useRef<Pose>({ radius: 26, height: 3, fov: 55, azimuth: 0 })
  const primed = useRef(false)

  useFrame((_, delta) => {
    const target = reduced
      ? { radius: 9, height: 1.4, fov: 42, azimuth: 0.5 }
      : poseFor(scroll.homeProgress)

    const current = pose.current

    // First frame: snap rather than damp, so the scene opens at the correct
    // pose instead of flying in from the default camera position.
    if (!primed.current) {
      Object.assign(current, target)
      primed.current = true
    }

    // Damp the scalars, then compose the position from them. Damping the
    // position vector directly would cut a straight chord across the arc and
    // pull the camera toward the model as it orbits.
    current.radius = MathUtils.damp(current.radius, target.radius, SMOOTHING, delta)
    current.height = MathUtils.damp(current.height, target.height, SMOOTHING, delta)
    current.fov = MathUtils.damp(current.fov, target.fov, SMOOTHING, delta)
    current.azimuth = MathUtils.damp(current.azimuth, target.azimuth, SMOOTHING, delta)

    camera.position.set(
      Math.sin(current.azimuth) * current.radius,
      current.height,
      Math.cos(current.azimuth) * current.radius,
    )
    camera.lookAt(0, LOOK_Y, 0)

    // Roll comes last, on top of the framing. It is non-zero only while the
    // pointer is actually on the character — moving the cursor anywhere else
    // leaves the camera level, which is what keeps the tilt reading as a
    // response to touching the character rather than as ambient drift.
    if (interaction.roll !== 0) camera.rotateZ(interaction.roll)

    // updateProjectionMatrix is not free; only call it when fov actually moved.
    if (Math.abs(camera.fov - current.fov) > 0.001) {
      camera.fov = current.fov
      camera.updateProjectionMatrix()
    }

    // Publish for the cards, which position themselves relative to the camera.
    scroll.camAzimuth = current.azimuth
    scroll.camRadius = current.radius
    scroll.camFov = current.fov
  })

  return null
}
