'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SECTION_COUNT } from '@/lib/sections'
import { scrollCommands } from '@/lib/scrollStore'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { useEntered } from '@/lib/useEntered'
import { setHintsVisible, useHintsVisible } from '@/lib/hintStore'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The home scene's way-finding.
 *
 * Two jobs, one clock:
 *
 *   1. **Say that the page scrolls.** The moment the curtain lifts, a cue at
 *      the foot of the frame says "Scroll to explore", with a mouse whose wheel
 *      rolls (or, on a touch screen, chevrons that climb). It stays until the
 *      visitor scrolls once. After that, a smaller nudge comes back on any
 *      later beat where they stop moving.
 *
 *   2. **Point at the way in.** If a visitor sits on a beat without scrolling
 *      or clicking, the hint flag goes up (lib/hintStore) and each beat's
 *      button gets a doodled arrow and a handwritten "Click to learn more"
 *      (drawn in StoryOverlay), so it is obvious the button opens a page.
 *
 * Pointer movement does not count as "doing something": someone reading moves
 * the mouse. Scrolling, touching, clicking and keys do. The flag drops the
 * instant any of those happen and the clock starts again on the next beat.
 */

/** How long a visitor can sit still on a beat before the arrows appear. */
const IDLE_MS = 3200

export function HomeGuide() {
  const { activeCard } = useScrollSnapshot()
  const entered = useEntered()
  const hints = useHintsVisible()
  const [hasScrolled, setHasScrolled] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const firstBeat = useRef(activeCard)

  // Any real scroll away from the first beat retires the big cue for good.
  useEffect(() => {
    if (activeCard !== firstBeat.current) setHasScrolled(true)
  }, [activeCard])

  useEffect(() => {
    if (!entered) return

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
  }, [entered, activeCard])

  const last = activeCard >= SECTION_COUNT - 1
  const mode: 'hero' | 'nudge' | null = !entered
    ? null
    : activeCard === 0 && !hasScrolled
      ? 'hero'
      : hints && !last
        ? 'nudge'
        : null

  const next = () => scrollCommands.goToSection(Math.min(activeCard + 1, SECTION_COUNT - 1))

  return (
    <div className="overlay-layer pointer-events-none fixed inset-0" style={{ zIndex: 'var(--z-chrome)' }}>
      <AnimatePresence>
        {mode === 'hero' ? (
          <motion.button
            key="hero"
            type="button"
            onClick={next}
            onMouseEnter={() => setCursor({ active: true })}
            onMouseLeave={resetCursor}
            aria-label="Scroll to explore"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.3 } }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="scroll-cue scroll-cue--hero pointer-events-auto"
          >
            <span className="scroll-cue__ring" aria-hidden="true" />
            {/* A mouse with a rolling wheel where there is a mouse… */}
            <span className="scroll-cue__mouse" aria-hidden="true">
              <span className="scroll-cue__wheel" />
            </span>
            {/* …climbing chevrons where there is a thumb. */}
            <span className="scroll-cue__swipe" aria-hidden="true">
              <ChevronUp size={18} strokeWidth={2.2} />
              <ChevronUp size={18} strokeWidth={2.2} />
            </span>
            <span className="scroll-cue__label">
              <span className="scroll-cue__desk">Scroll to explore</span>
              <span className="scroll-cue__touch">Swipe up to explore</span>
            </span>
            <span className="scroll-cue__chevrons" aria-hidden="true">
              <ChevronDown size={16} strokeWidth={2} />
              <ChevronDown size={16} strokeWidth={2} />
            </span>
          </motion.button>
        ) : null}

        {mode === 'nudge' ? (
          <motion.button
            key="nudge"
            type="button"
            onClick={next}
            onMouseEnter={() => setCursor({ active: true })}
            onMouseLeave={resetCursor}
            aria-label="Scroll to the next part"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="scroll-cue scroll-cue--nudge pointer-events-auto"
          >
            <span className="scroll-cue__label">
              <span className="scroll-cue__desk">Keep scrolling</span>
              <span className="scroll-cue__touch">Swipe up</span>
            </span>
            <span className="scroll-cue__chevrons" aria-hidden="true">
              <ChevronDown size={15} strokeWidth={2} />
              <ChevronDown size={15} strokeWidth={2} />
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
