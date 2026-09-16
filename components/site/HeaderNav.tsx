'use client'

import { ArrowLeft, Home } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { useSceneReturn } from '@/lib/useSceneReturn'

/**
 * The same Back / Home pair as RoomNav, in the top bar.
 *
 * RoomNav is pinned to the corner for the whole page, but the header scrolls
 * out of view on anything longer than one screen — and a long room is exactly
 * where "I don't know where I am" shows up. This puts the identical two
 * controls where the logo already lives, so they are visible the instant a
 * visitor looks up rather than only at the bottom of wherever they happen to
 * be scrolled to.
 *
 * Icon-only. The header is already carrying the logo, the route list, the
 * call to action and the menu button; a third labelled pill here is the one
 * that would not fit. RoomNav's pill still carries the full "Back to 03
 * MeloWorld" label — this is the fast, glanceable version of the same thing.
 */
export function HeaderNav() {
  const { topic, goBack, goHome } = useSceneReturn()

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: resetCursor,
  }

  return (
    <div className="hidden items-center gap-1.5 border-r border-white/10 pr-3 md:flex md:mr-1">
      {topic ? (
        <button
          type="button"
          onClick={goBack}
          {...hoverable}
          aria-label={`Back to ${topic.word}`}
          title={`Back to ${topic.word}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-bone/60 transition-colors duration-300 hover:border-ember/50 hover:text-ember"
        >
          <ArrowLeft size={14} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={goHome}
        {...hoverable}
        aria-label="Start from the beginning"
        title="Start from the beginning"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-bone/60 transition-colors duration-300 hover:border-ember/50 hover:text-ember"
      >
        <Home size={14} />
      </button>
    </div>
  )
}
