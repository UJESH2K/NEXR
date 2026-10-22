'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scroll } from '@/lib/scrollStore'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { SOCIAL_LINKS } from '@/components/ui/SocialIcons'
import { BeatPill } from './BeatPill'

/**
 * The instrument panel around the frame: the beat navigator at the top, the big
 * word pinned to the bottom, and the socials in the corner. The navigator is
 * the only counter — a percentage readout and a second beat number used to sit
 * here too, and three sets of figures on one frame read as a dashboard, not a
 * story.
 *
 * The navigator is its own component (BeatPill) because it is the one piece of
 * this that is interactive and stateful; everything else here is a readout.
 *
 * There is no sound control here any more, because there is no sound. A
 * synthesised bed was tried twice — a filtered drone, then a reverberant pad
 * with struck notes — and both read as machine noise over a scene this quiet.
 * Silence is the better default, and a control for something that does not
 * exist is worse than no control.
 *
 * Everything continuous in here — the progress bar's fill, and the navigator's
 * hairline — is written straight to the DOM from the gsap ticker rather than
 * through React state. That is deliberate: this component sits over a canvas already running
 * a frame loop, and re-rendering an overlay tree sixty times a second is the
 * fastest way to make a smooth scene feel cheap. React is only told when the
 * active section actually changes.
 */

export function SceneHud() {
  const { activeCard, past } = useScrollSnapshot()
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tick = () => {
      // Whole-page progress. The navigator's own hairline is per beat, so the
      // two answer different questions rather than repeating one.
      if (bar.current) bar.current.style.transform = `scaleY(${scroll.homeProgress})`
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const section = SECTIONS[Math.min(activeCard, SECTION_COUNT - 1)] ?? SECTIONS[0]

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: () => resetCursor(),
  }

  return (
    <div
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      {/* ── the beat navigator, top centre ─────────────────────── */}
      <BeatPill />

      {/* ── the big word, bottom centre ──────────────────────────────────── */}
      {/* Held back until the visitor scrolls. The NEXR wordmark stands in the
          scene at the top of the page and fades as the first beat settles, and
          this rising as that goes is the handover between them; both arriving
          at once would be two display-size words fighting. */}
      {/* Hidden below lg: on a phone the copy block occupies the bottom of the
          frame, the word landed on top of it, and the beat's own label already
          says which section this is. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col items-center lg:flex">
        <AnimatePresence mode="wait">
          {past ? (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* No number above the word: the navigator at the top already
                says which beat this is, and two counters is one too many. */}
            {/* Deliberately smaller than the reference's: the figure's feet
                reach about 86% of the frame height, and at 11vw this word's
                cap height climbed into the rock and then into the shoes.

                Sized against height as well as width, because the collision is
                a vertical one: on a short laptop window — 1920x935 with browser
                chrome, say — 7vw is 134px of cap height rising into a rock that
                has not moved down with it. Taking the smaller of the two keeps
                the word clear on a short window without shrinking it on a tall
                one. */}
            <span
              className="font-display leading-[0.8] text-bone/90"
              style={{ fontSize: 'clamp(2rem, min(7vw, 11vh), 6.5rem)' }}
            >
              {section.word}
            </span>
          </motion.div>
          ) : null}
        </AnimatePresence>
        {/* The word sits low so it reads as part of the frame, not a caption. */}
        <div className="h-[clamp(1.2rem,4vh,3rem)]" />
      </div>

      {/* ── vertical progress + socials, bottom right ─────────────────────── */}
      {/* Also desktop-only. These sat in the same corner as the copy block on a
          phone; the mobile menu carries the same links. */}
      <div
        className="absolute right-6 hidden flex-col items-end gap-5 md:right-10 lg:flex"
        style={{ bottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="relative h-16 w-px bg-bone/20">
          <span
            ref={bar}
            className="absolute inset-x-0 top-0 h-full origin-top bg-ember"
          />
        </div>

        <div className="flex items-center gap-5">
          {/* Real brand marks rather than two-letter abbreviations. "LI / IG /
              YT" reads as a legend to be decoded; a logo is recognised without
              being read, which is the entire job of a corner link. */}
          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                  {...hoverable}
                  className="block text-bone/45 transition-colors duration-300 hover:text-ember"
                >
                  <Icon size={15} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
