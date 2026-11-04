'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { useEntered } from '@/lib/useEntered'
import { setHintsVisible } from '@/lib/hintStore'

/**
 * The home scene's way-finding.
 *
 * Two jobs:
 *
 *   1. **Say once that the page scrolls.** As the curtain lifts, "Scroll down"
 *      writes itself in script on the right-hand side of the frame, level with
 *      the copy on the left, with a doodled arrow beneath it. It holds for a
 *      moment and lifts away — or goes at once if the visitor scrolls first —
 *      and it never comes back. A visitor only needs telling once.
 *
 *   2. **Point at the way in.** If a visitor sits on a beat without scrolling
 *      or clicking, the hint flag goes up (lib/hintStore) and that beat's
 *      button gets a doodled arrow and a handwritten "Click to learn more"
 *      (drawn in StoryOverlay), so it is obvious the button opens a page.
 *
 * Pointer movement does not count as "doing something": someone reading moves
 * the mouse. Scrolling, touching, clicking and keys do. The flag drops the
 * instant any of those happen and the clock starts again on the next beat.
 */

/** How long a visitor can sit still on a beat before the arrows appear. */
const IDLE_MS = 3200
/** How long the opening "Scroll down" stays once it has finished writing. */
const INTRO_MS = 4200

export function HomeGuide() {
  const { activeCard } = useScrollSnapshot()
  const entered = useEntered()
  const [intro, setIntro] = useState<'waiting' | 'showing' | 'done'>('waiting')
  const timer = useRef<number | undefined>(undefined)
  const firstBeat = useRef(activeCard)

  // The opening line: shown once, the moment the scene is visible.
  useEffect(() => {
    if (!entered || intro !== 'waiting') return
    // A visitor returning to a scene they had already scrolled down does not
    // need telling.
    if (activeCard !== 0) {
      setIntro('done')
      return
    }
    setIntro('showing')
  }, [entered, intro, activeCard])

  useEffect(() => {
    if (intro !== 'showing') return
    const hide = () => setIntro('done')
    const t = window.setTimeout(hide, INTRO_MS)
    const events = ['wheel', 'touchmove', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, hide, { passive: true }))
    return () => {
      window.clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, hide))
    }
  }, [intro])

  // Leaving the first beat by any route also retires it.
  useEffect(() => {
    if (activeCard !== firstBeat.current) setIntro((s) => (s === 'showing' ? 'done' : s))
  }, [activeCard])

  // The idle arrows on the beat buttons. Held until the opening line has
  // gone, so the visitor is never asked to look at two things at once.
  useEffect(() => {
    if (!entered || intro === 'showing') return

    const arm = () => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setHintsVisible(true), IDLE_MS)
    }
    const activity = () => {
      setHintsVisible(false)
      arm()
    }

    arm()
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, activity, { passive: true }))
    return () => {
      window.clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, activity))
      setHintsVisible(false)
    }
    // Re-armed per beat, so each beat gets its own full wait.
  }, [entered, activeCard, intro])

  return (
    <div className="overlay-layer pointer-events-none fixed inset-0" style={{ zIndex: 'var(--z-chrome)' }}>
      <AnimatePresence>
        {intro === 'showing' ? (
          <motion.div
            key="scroll-down"
            className="scroll-doodle"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.5 } }}
            exit={{ opacity: 0, y: -14, filter: 'blur(6px)', transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
          >
            <span className="scroll-doodle__text">Scroll down</span>
            {/* A loose, hand-drawn line falling to an arrowhead. */}
            <svg className="scroll-doodle__arrow" viewBox="0 0 40 70" fill="none">
              <path
                className="doodle-line"
                pathLength={1}
                d="M22 4c-8 10 8 16 0 26-6 8-6 18-2 30"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                className="doodle-head"
                pathLength={1}
                d="M20 60l-8-9M20 60l7-10"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
