'use client'

import { ArrowLeft, Home } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { useSceneReturn } from '@/lib/useSceneReturn'

/**
 * The same Back / Home pair Melo carries, in the top bar, beside the logo.
 *
 * Melo's widget is pinned to the corner for the whole page, but a long room
 * is exactly where "I don't know where I am" shows up, and the top-left is
 * where people look for a way back. So the two controls sit there as one
 * capsule — one shape, one height, one border — rather than two loose circles
 * floating between the logo and the routes.
 *
 * Labelled on wide screens, icon-only below that so the centred route list
 * keeps its room. The tooltips and accessible names always carry the full
 * wording, and Melo's panel still says "Back to 03 MeloWorld" in full.
 */
export function HeaderNav() {
  const { topic, goBack, goHome } = useSceneReturn()

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: resetCursor,
  }

  return (
    <div
      data-tour="header-return"
      className="hidden h-11 items-center rounded-full border border-white/12 bg-white/[0.03] p-1 md:flex"
    >
      {topic ? (
        <>
          <button
            type="button"
            data-tour="header-back"
            onClick={goBack}
            {...hoverable}
            aria-label={`Back to ${topic.word}`}
            title={`Back to ${topic.word}`}
            className="header-return-btn"
          >
            <ArrowLeft size={14} className="shrink-0" />
            <span className="header-return-label">Back</span>
          </button>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-white/12" />
        </>
      ) : null}
      <button
        type="button"
        data-tour="header-home"
        onClick={goHome}
        {...hoverable}
        aria-label="Start from the beginning"
        title="Start from the beginning"
        className="header-return-btn"
      >
        <Home size={14} className="shrink-0" />
        <span className="header-return-label">Home</span>
      </button>
    </div>
  )
}
