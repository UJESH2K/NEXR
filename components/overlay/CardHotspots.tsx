'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import { CARDS } from '@/lib/cards'
import { useScrollApi } from '@/lib/ScrollProvider'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'

/**
 * The accessible half of the orbiting cards.
 *
 * The canvas is aria-hidden and unreachable by keyboard, so every destination
 * needs a real <a href> in the DOM. Two paths exist:
 *
 *  - A permanent nav holding all six links. Visually hidden, but each link
 *    reveals itself on focus, so tabbing through the page surfaces a legible
 *    pill rather than moving focus to something invisible.
 *  - A caption for whichever card is currently sweeping past. Clicking it arms
 *    the cinematic fill (same as clicking the 3D card); activating it by
 *    keyboard navigates straight through, because a scroll-driven transition is
 *    not something a keyboard user can drive.
 */
export function CardHotspots() {
  const { activeCard, mode } = useScrollSnapshot()
  const { armCard } = useScrollApi()

  const card = activeCard >= 0 ? CARDS[activeCard] : null
  const visible = card !== null && mode === 'home'

  // Cards alternate which side of the frame they hold on — see `side` in
  // Card.tsx, which uses this same index parity. The caption goes to the other
  // side, or it lands on top of the artwork it is describing. If that rule
  // changes there, it has to change here.
  const cardOnRight = activeCard % 2 === 0
  const captionSide = cardOnRight ? 'left-6 md:left-16' : 'right-6 md:right-16'

  const handleClick = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    // detail === 0 means the click came from Enter/Space, not a pointer.
    if (event.detail === 0) return
    event.preventDefault()
    armCard(index)
  }

  return (
    <>
      <nav
        aria-label="Explore NEXR"
        className="fixed top-0 left-0"
        style={{ zIndex: 'var(--z-chrome)' }}
      >
        <ul>
          {CARDS.map((entry) => (
            <li key={entry.id}>
              <Link
                href={entry.route}
                className="sr-only pointer-events-auto focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-bone focus-visible:px-5 focus-visible:py-2 focus-visible:font-mono focus-visible:text-xs focus-visible:uppercase focus-visible:tracking-[0.2em] focus-visible:text-void"
              >
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="overlay-layer fixed inset-0"
        style={{ zIndex: 'var(--z-overlay)' }}
      >
        <AnimatePresence mode="wait">
          {visible && card ? (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute bottom-[10svh] max-w-[24rem] ${captionSide}`}
            >
              <p className="eyebrow text-lime">{card.eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-bone md:text-4xl">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-sand/70">
                {card.blurb}
              </p>
              <Link
                href={card.route}
                onClick={handleClick(activeCard)}
                className="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-bone/70 transition-colors hover:text-lime"
              >
                Open
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}
