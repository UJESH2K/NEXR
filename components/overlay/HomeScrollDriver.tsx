'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scroll, syncSnapshot } from '@/lib/scrollStore'
import { useScrollApi } from '@/lib/ScrollProvider'

/** Home scroll track length. Longer = slower, more cinematic pacing.
 *
 *  Sized against the card dwell, not chosen for feel: the orbit act spans 0.52 of
 *  the track, split into six ~0.1 windows, and each card holds still for ~52% of
 *  its window. At 1100 that hold is roughly 57svh of scrolling — long enough to
 *  notice a card, read it and click it without having to time anything. Shorten
 *  this and the hold shortens with it. */
export const TRACK_VH = 1100

/**
 * The spacer that gives the home page its scroll length, plus the single master
 * ScrollTrigger that writes normalised progress into the store.
 *
 * This is the only place document scroll is read. Everything else — camera,
 * cards, overlays — derives from scroll.homeProgress.
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
        // No tween here, so there is no ease to set: progress is read straight
        // off the trigger and is linear by construction.
        onUpdate: (self) => {
          scroll.homeProgress = self.progress
          syncSnapshot()
        },
      })

      // Lenis may finish measuring after this runs on a cold load.
      ScrollTrigger.refresh()

      return () => trigger.kill()
    },
    { dependencies: [lenis] },
  )

  return (
    <div
      id="home-track"
      ref={track}
      // pointer-events:none is essential, not cosmetic: this spacer covers the
      // viewport and sits above the canvas in stacking order, so without it
      // every click aimed at a 3D card would land here instead.
      style={{ height: `${TRACK_VH}svh`, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
