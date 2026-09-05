'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { setHintsVisible, useHintsVisible } from '@/lib/hintStore'
import { DoodleArrow } from './DoodleArrow'

/**
 * The control that starts the experience.
 *
 * It is an ordinary button. An earlier version was a morphing blob, which drew
 * the eye but read as a decoration borrowed from another site — the rest of this
 * page is straight rules and mono labels, and a wobbling organic shape had
 * nothing to do with any of it. Attention is better bought by pointing at a
 * recognisable control than by making the control unrecognisable.
 *
 * The pointing is not this component's clock. IdleHints owns the timer for all
 * three annotations on the frame; this one only subscribes, so the arrow beside
 * Explore arrives in the same breath as the two in the corners rather than on a
 * schedule of its own.
 */

/** How far away the cursor starts pulling the button, in px. */
const MAGNET_RANGE = 130
/** The furthest it will travel from its resting spot, in px. */
const MAGNET_STRENGTH = 12

export function ExploreButton({
  label = 'Explore',
  onPress,
}: {
  label?: string
  onPress: () => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  const hinting = useHintsVisible()

  useEffect(() => {
    const node = button.current
    if (!node) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Eased by CSS rather than a frame loop: the pull is a small, slow movement,
    // so a transition is smoother and cheaper than another ticker subscriber on
    // a page already running one.
    const onMove = (event: PointerEvent) => {
      const box = node.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      const distance = Math.hypot(dx, dy)

      if (distance > MAGNET_RANGE) {
        node.style.transform = 'translate3d(0, 0, 0)'
        return
      }

      // Falls off with distance, so the pull fades at the edge of range rather
      // than snapping off.
      const scale = ((1 - distance / MAGNET_RANGE) * MAGNET_STRENGTH) / (distance || 1)
      node.style.transform = `translate3d(${dx * scale}px, ${dy * scale}px, 0)`
    }

    const onLeave = () => {
      node.style.transform = 'translate3d(0, 0, 0)'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="relative inline-flex">
      <button
        ref={button}
        type="button"
        onClick={() => {
          setHintsVisible(false)
          onPress()
        }}
        onMouseEnter={() => setCursor({ active: true })}
        onMouseLeave={resetCursor}
        className="btn-primary explore-button group"
      >
        {/* A slow sheen across the button while the hints are up. The button's
            own overflow clips it, so it reads as light crossing the surface
            rather than as a loose ring. */}
        {hinting ? <span className="explore-sheen" aria-hidden="true" /> : null}

        <span className="relative">{label}</span>
        <span
          aria-hidden="true"
          className="relative transition-transform duration-500 group-hover:translate-x-1"
        >
          &rarr;
        </span>
      </button>

      <AnimatePresence>
        {hinting ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="hint-float pointer-events-none absolute left-full ml-3 hidden items-center gap-2 sm:flex"
            // Positioned with a margin rather than a translate utility: the
            // float animation owns `transform`, and a Tailwind translate would
            // either be overridden by it or fight it depending on which property
            // the utility compiles to. A margin cannot collide.
            style={{ top: '50%', marginTop: -37 }}
            aria-hidden="true"
          >
            <DoodleArrow direction="left-down" width={112} className="doodle text-ember-soft/90" />
            <span className="hint-label mb-8">Start here</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
