'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import { SECTION_COUNT } from '@/lib/sections'
import { damp, scroll } from '@/lib/scrollStore'

/** World-space point the camera holds in frame: the character's upper chest. */
export const LOOK_Y = 3

/** Rest pose. Everything below is expressed as an offset from these. */
const BASE_RADIUS = 80
const BASE_HEIGHT = 2
const BASE_FOV = 43

/**
 * Total azimuth swept across the page, in radians. Small on purpose — this is
 * the camera drifting around a figure that is standing still, not an orbit.
 * Push it past ~0.5 and the panels authored for the front of the room start
 * sliding out of frame.
 */
const SWEEP = 0.34

/** How far the pointer can push the camera off its rail. */
const PARALLAX_X = 3.4
const PARALLAX_Y = 2.2

const _look = new Vector3()

/**
 * The camera.
 *
 * Three motions are layered and each answers a different question:
 *   - scroll drives a slow arc and a dolly, so progress through the page is
 *     legible as movement through space;
 *   - a per-section push-in tightens the frame during each dwell and releases
 *     it during the travel, which gives the beats a breath;
 *   - the pointer adds parallax, which is the whole reason a still frame here
 *     still feels alive.
 *
 * All three are damped rather than assigned, so a fast scroll or a flicked
 * mouse eases rather than snaps.
 */
export function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const state = useRef({
    azimuth: 0,
    radius: BASE_RADIUS,
    height: BASE_HEIGHT,
    fov: BASE_FOV,
    px: 0,
    py: 0,
  })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const cur = state.current
    const p = scroll.homeProgress

    // Dwell is high in the middle of a section and drops to zero on the
    // boundaries, so the push-in peaks exactly where the copy is readable.
    const within = scroll.sectionFloat - Math.floor(scroll.sectionFloat)
    const dwell = Math.sin(Math.min(within / 0.55, 1) * Math.PI * 0.5) *
      (1 - Math.max(0, (within - 0.62) / 0.38))

    // On a narrow window the figure eats the frame, leaving no room beside it
    // for a card or a column of copy. Backing the camera off shrinks it, and
    // lowering the look target lifts it in frame, which is what opens the strip
    // along the bottom that the stacked mobile layout uses.
    // Measured against a 390x844 phone, where `narrow` saturates at 1: the
    // figure has to finish by about half the frame height for the copy under it
    // to have room, which is roughly nine world units of lift and a little more
    // distance than the old 0.42 gave.
    const narrow = MathUtils.clamp((1.5 - camera.aspect) / 0.7, 0, 1)
    const fit = 1 + narrow * 0.58

    const azimuthTarget = reduced ? 0 : Math.sin(p * Math.PI) * SWEEP
    const radiusTarget =
      (reduced ? BASE_RADIUS : BASE_RADIUS - dwell * 7 - Math.sin(p * Math.PI * 2) * 3) *
      fit
    const heightTarget = reduced ? BASE_HEIGHT : BASE_HEIGHT + p * 4.5
    const fovTarget = reduced ? BASE_FOV : BASE_FOV - dwell * 1.6

    cur.azimuth = damp(cur.azimuth, azimuthTarget, 2.2, dt)
    cur.radius = damp(cur.radius, radiusTarget, 2.4, dt)
    cur.height = damp(cur.height, heightTarget, 2.4, dt)
    cur.fov = damp(cur.fov, fovTarget, 3, dt)

    cur.px = damp(cur.px, reduced ? 0 : scroll.pointerX * PARALLAX_X, 3, dt)
    cur.py = damp(cur.py, reduced ? 0 : -scroll.pointerY * PARALLAX_Y, 3, dt)

    camera.position.set(
      Math.sin(cur.azimuth) * cur.radius + cur.px,
      cur.height + cur.py,
      Math.cos(cur.azimuth) * cur.radius,
    )

    // The look target trails the pointer by a fraction of the camera's own
    // shift. Matching it exactly would cancel the parallax out entirely.
    _look.set(cur.px * 0.35, LOOK_Y - narrow * 16 + cur.py * 0.3, 0)
    camera.lookAt(_look)

    if (Math.abs(camera.fov - cur.fov) > 0.001) {
      camera.fov = cur.fov
      camera.updateProjectionMatrix()
    }

    scroll.camAzimuth = cur.azimuth
    scroll.camRadius = cur.radius
    scroll.camFov = cur.fov
  })

  return null
}

/** Exported for the panel field, which distributes work across the same span. */
export const CAMERA_SWEEP = SWEEP
export const SECTIONS_IN_SWEEP = SECTION_COUNT
