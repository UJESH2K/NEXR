'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { useSceneReturn } from '@/lib/useSceneReturn'

/**
 * Wayfinding for every page that is not the scene, pinned to the corner.
 *
 * Two controls, because there are genuinely two different things a lost
 * visitor wants and one button cannot be both — see useSceneReturn for what
 * each one does and why they are kept apart.
 *
 * Back names its destination — "Back to MeloWorld", never just "Back" —
 * because a label that names where it goes needs no memory of where you have
 * been. It disappears entirely when there is nothing remembered: someone who
 * arrived from a search result was never in the scene, and offering to return
 * them somewhere they have not been is worse than offering nothing.
 *
 * Pinned to the bottom-left rather than only living in the header. The header
 * scrolls away on a long room, and wayfinding that is only reachable by
 * scrolling back up is wayfinding for people who are not lost. HeaderNav puts
 * the same two controls up top as well, for exactly that scrolled-away case.
 */
export function RoomNav() {
  const { topic, goBack, goHome } = useSceneReturn()

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: resetCursor,
  }

  return (
    <motion.nav
      aria-label="Site navigation"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="fixed bottom-5 left-5 flex items-center gap-2 md:bottom-8 md:left-8"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      {topic ? (
        <button
          type="button"
          onClick={goBack}
          {...hoverable}
          className="btn-primary group"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-500 group-hover:-translate-x-1"
          />
          <span className="hidden sm:inline">Back to</span>
          <span className="numeral text-[0.95em]">
            {String(topic.index + 1).padStart(2, '0')}
          </span>
          <span className="normal-case tracking-normal">{topic.word}</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={goHome}
        {...hoverable}
        // Icon-only once Back is present, so the pair reads as one control with
        // a primary and a secondary rather than two competing buttons.
        aria-label="Start from the beginning"
        title="Start from the beginning"
        className="btn-primary group !px-4"
      >
        <Home size={13} className="transition-transform duration-500 group-hover:-translate-y-0.5" />
        {topic ? null : <span>Start over</span>}
      </button>
    </motion.nav>
  )
}
