'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scroll, scrollCommands } from '@/lib/scrollStore'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The instrument panel around the frame: wordmark, progress rail, the big word
 * pinned to the bottom, and the sound toggle.
 *
 * Everything continuous in here — the rail fill, the tick highlights — is
 * written straight to the DOM from the gsap ticker rather than through React
 * state. That is deliberate: this component sits over a canvas already running
 * a frame loop, and re-rendering an overlay tree sixty times a second is the
 * fastest way to make a smooth scene feel cheap. React is only told when the
 * active section actually changes.
 */

const SOCIALS = [
  { label: 'LI', href: 'https://www.linkedin.com', title: 'LinkedIn' },
  { label: 'IG', href: 'https://www.instagram.com', title: 'Instagram' },
  { label: 'YT', href: 'https://www.youtube.com', title: 'YouTube' },
]

export function SceneHud({
  audioOn,
  onToggleAudio,
}: {
  audioOn: boolean
  onToggleAudio: () => void
}) {
  const { activeCard, past } = useScrollSnapshot()
  const fill = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const readout = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let shownPercent = -1

    const tick = () => {
      const p = scroll.homeProgress

      if (fill.current) fill.current.style.transform = `scaleX(${p})`
      if (bar.current) bar.current.style.transform = `scaleY(${p})`

      // The readout only touches the DOM when the rounded value changes, which
      // is a handful of writes per scroll rather than one per frame.
      const percent = Math.round(p * 100)
      if (readout.current && percent !== shownPercent) {
        shownPercent = percent
        readout.current.textContent = String(percent).padStart(3, '0')
      }
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
      {/* ── progress rail, top centre ────────────────────────────────────── */}
      <div className="absolute left-1/2 top-6 hidden -translate-x-1/2 items-center gap-4 md:flex">
        <span className="font-mono text-[10px] tracking-[0.28em] text-bone/50">01</span>

        <div className="relative h-px w-[min(34vw,340px)] bg-bone/20">
          <span
            ref={fill}
            className="absolute inset-y-0 left-0 w-full origin-left bg-bone"
          />

          {/* One tick per beat, doubling as a jump target. */}
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollCommands.goToSection(i)}
              {...hoverable}
              aria-label={`Go to ${s.word}`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-3"
              style={{ left: `${((i + 0.5) / SECTION_COUNT) * 100}%` }}
            >
              <span
                className={`block h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                  i === activeCard
                    ? 'scale-125 bg-lime'
                    : 'bg-bone/35 group-hover:bg-bone/80'
                }`}
              />
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] tracking-[0.28em] text-bone/50">
          {String(SECTION_COUNT).padStart(2, '0')}
        </span>
      </div>

      {/* ── the big word, bottom centre ──────────────────────────────────── */}
      {/* Held back until the visitor scrolls: on the hero the frame already has
          a headline, and two display-size words would fight. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
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
            <span className="font-mono text-[10px] tracking-[0.34em] text-bone/55">
              {section.index}
            </span>
            {/* Deliberately smaller than the reference's: the figure's feet
                reach about 86% of the frame height, and at 11vw this word's
                cap height climbed into the rock and then into the shoes. */}
            <span
              className="font-display leading-[0.8] text-bone/90"
              style={{ fontSize: 'clamp(2rem, 7vw, 6.5rem)' }}
            >
              {section.word}
            </span>
          </motion.div>
          ) : null}
        </AnimatePresence>
        {/* The word sits low so it reads as part of the frame, not a caption. */}
        <div className="h-[clamp(1.2rem,4vh,3rem)]" />
      </div>

      {/* ── sound toggle, bottom left ────────────────────────────────────── */}
      <button
        type="button"
        onClick={onToggleAudio}
        {...hoverable}
        aria-pressed={audioOn}
        aria-label={audioOn ? 'Mute ambience' : 'Play ambience'}
        className="group absolute bottom-7 left-6 flex items-center gap-3 md:left-10"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-bone/30 transition-colors group-hover:border-lime">
          {/* Three bars that animate only while sound is on. */}
          <span className="flex items-end gap-[3px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-[2px] bg-lime transition-all duration-300 ${
                  audioOn ? 'sound-bar' : 'h-[3px] opacity-50'
                }`}
                style={audioOn ? { animationDelay: `${i * 0.18}s` } : undefined}
              />
            ))}
          </span>
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-bone/45 transition-colors group-hover:text-bone">
          {audioOn ? 'Sound on' : 'Sound off'}
        </span>
      </button>

      {/* ── vertical progress + socials, bottom right ─────────────────────── */}
      <div className="absolute bottom-7 right-6 flex flex-col items-end gap-5 md:right-10">
        <div className="relative h-16 w-px bg-bone/20">
          <span
            ref={bar}
            className="absolute inset-x-0 top-0 h-full origin-top bg-lime"
          />
        </div>

        <div className="flex items-center gap-5">
          <span
            ref={readout}
            className="font-mono text-[9px] tabular-nums tracking-[0.2em] text-bone/35"
          >
            000
          </span>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              title={s.title}
              {...hoverable}
              className="font-mono text-[10px] tracking-[0.22em] text-bone/45 transition-colors hover:text-lime"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
