'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DoodleArrow } from '@/components/ui/DoodleArrow'
import { setHintsVisible, useHintsVisible } from '@/lib/hintStore'
import { useEntered } from '@/lib/useEntered'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'

/**
 * The annotations that appear if the opening frame is left untouched.
 *
 * The opening is a held shot with scrolling locked, which is exactly the state
 * in which a visitor can sit looking at a nice picture without realising there
 * is anything to do. After five quiet seconds the page points at its own
 * controls: Explore on the left, the call to action top right, the social links
 * bottom right.
 *
 * Two decisions worth stating, because both are easy to get backwards:
 *
 *   - Moving the mouse does *not* dismiss them. Dismissing on pointermove feels
 *     rigorous but means the hints vanish the instant someone looks toward the
 *     thing they are pointing at, so they are never actually read. Only a click
 *     clears them.
 *   - A failed scroll summons them early instead of clearing them. Scrolling is
 *     locked here, so a wheel event is someone discovering the page will not
 *     move, which is the strongest signal there is that they need pointing at
 *     the way in.
 *   - They are staggered, not simultaneous. Three arrows arriving together
 *     reads as an error state. Arriving one after another reads as someone
 *     talking you through the frame.
 */

/** Quiet time before the page starts pointing at things. */
const IDLE_DELAY = 5000

const EASE = [0.16, 1, 0.3, 1] as const

export function IdleHints() {
  const { started } = useScrollSnapshot()
  const entered = useEntered()
  const visible = useHintsVisible()

  // The clock starts when the curtain lifts, not when this mounts — otherwise
  // most of the five seconds is spent behind an opaque overlay.
  useEffect(() => {
    if (!entered || started) {
      setHintsVisible(false)
      return
    }

    const timer = window.setTimeout(() => setHintsVisible(true), IDLE_DELAY)

    /**
     * A failed scroll brings the hints forward rather than dismissing them.
     *
     * This was the wrong way round at first: wheel was treated as an act of
     * intent and cleared the annotations. But on this frame scrolling is locked,
     * so someone spinning the wheel is someone who has just found that the page
     * will not move — the single clearest signal that they need to be shown the
     * way in. Sending the arrows away at that exact moment punishes the person
     * who most needs them.
     */
    const summon = () => {
      window.clearTimeout(timer)
      setHintsVisible(true)
    }

    // A click means they have engaged with something of their own accord, so
    // the page stops pointing.
    const dismiss = () => {
      window.clearTimeout(timer)
      setHintsVisible(false)
    }

    // Deliberately not pointermove. See the note above the component.
    window.addEventListener('wheel', summon, { passive: true })
    window.addEventListener('touchmove', summon, { passive: true })
    window.addEventListener('click', dismiss)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('wheel', summon)
      window.removeEventListener('touchmove', summon)
      window.removeEventListener('click', dismiss)
    }
  }, [entered, started])

  return (
    <div
      className="pointer-events-none fixed inset-0 hidden lg:block"
      style={{ zIndex: 'var(--z-chrome)' }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {visible ? (
          <>
            {/* ── the header's call to action, top right ─────────────────── */}
            <motion.div
              key="hint-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
              className="absolute right-[clamp(20px,3vw,72px)] top-[5.5rem]"
            >
              {/* The drift lives on an inner element, not on the motion.div.
                  Framer writes the entrance to `transform` inline, and an inline
                  transform beats a CSS animation — so sharing one node would
                  silently cancel the float. */}
              <div className="hint-float flex items-center gap-2">
                <span className="hint-label mt-6">Talk to us</span>
                <DoodleArrow
                  direction="up-right"
                  width={104}
                  className="doodle text-lime/80"
                />
              </div>
            </motion.div>

            {/* ── the social links, bottom right ─────────────────────────── */}
            <motion.div
              key="hint-social"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
              className="absolute bottom-[5.5rem] right-[clamp(20px,3vw,72px)]"
            >
              <div className="hint-float flex items-center gap-2">
                <span className="hint-label mb-6">Connect with us</span>
                <DoodleArrow
                  direction="down-right"
                  width={104}
                  className="doodle text-lime/80"
                />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
