'use client'

import { useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SECTION_COUNT } from '@/lib/sections'
import { setHomeProgress, syncSnapshot } from '@/lib/scrollStore'
import { useScrollApi } from '@/lib/ScrollProvider'

/**
 * Home scroll track length, in svh.
 *
 * Sized from the pose choreography rather than picked for feel. Each beat owns
 * one sixth of the track; the character holds its pose for the first half of a
 * beat and changes over the tail. At 1800 that hold is about 150svh — long
 * enough to land on a pose, read the copy beside it and click the panel without
 * having to time anything. Shorten this and the hold shortens with it.
 */
export const TRACK_VH = 1800

/**
 * Where in a section the scroll settles when the visitor stops.
 *
 * It has to sit inside the hold and before the pose change begins (0.5, see
 * CharacterModel) or releasing the wheel would drop the figure mid-movement and
 * leave it frozen between two poses.
 */
const REST_POINT = 0.32

/**
 * The spacer that gives the home page its scroll length, plus the single master
 * ScrollTrigger that writes normalised progress into the store.
 *
 * This is the only place document scroll is read anywhere in the app. The
 * camera, sky, character pose, panels and copy all derive from
 * `scroll.homeProgress`, which means there is exactly one number to reason
 * about when the choreography is off.
 */
export function HomeScrollDriver() {
  const track = useRef<HTMLDivElement>(null)
  const { lenis } = useScrollApi()

  useGSAP(
    () => {
      const element = track.current
      if (!element) return

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          // Nearest rest point, not "the next one": snapping forward on a small
          // upward scroll is the classic way a snapped page starts fighting the
          // person using it.
          snapTo: (value: number) => {
            const nearest = Math.round(value * SECTION_COUNT - REST_POINT)
            const clamped = Math.min(Math.max(nearest, 0), SECTION_COUNT - 1)
            return (clamped + REST_POINT) / SECTION_COUNT
          },
          delay: 0.12,
          duration: { min: 0.45, max: 0.9 },
          ease: 'power2.inOut',
        },
        // No tween, so there is no ease to set: progress is read straight off
        // the trigger and is linear by construction.
        onUpdate: (self) => {
          setHomeProgress(self.progress)
          syncSnapshot()
        },
      })

      // Lenis can finish measuring after this runs on a cold load, which would
      // otherwise leave the trigger sized against a stale document height.
      ScrollTrigger.refresh()

      return () => trigger.kill()
    },
    { dependencies: [lenis] },
  )

  return (
    <div
      id="home-track"
      ref={track}
      // pointer-events:none is load-bearing, not cosmetic: this spacer covers
      // the viewport and sits above the canvas in stacking order, so without it
      // every click aimed at a 3D panel would land here instead.
      style={{ height: `${TRACK_VH}svh`, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
