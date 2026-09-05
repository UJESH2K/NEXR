'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Section } from '@/lib/sections'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The column on the far side of the character.
 *
 * The scene deliberately keeps one half of the frame empty so the figure has
 * air on at least one side. That worked while every beat was a headline and a
 * paragraph — but two beats carry more than that: the credibility beat has three
 * statements, and the closing beat has a quote and a call to action. Stacked
 * under the body copy they turned the text column into a wall while the other
 * half of the screen sat unused.
 *
 * So the extras move across. The copy column keeps the argument, this column
 * takes the artefacts, and the figure stands between them — which is the
 * composition the empty side was being held open for in the first place.
 *
 * Held to large screens on purpose: below 1024px `.story-col` collapses to a
 * single block along the bottom of the frame, and two of those would land on
 * top of each other. Beat renders the same content inline there instead, so
 * nothing is lost on a phone.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/** How far the card leans, in degrees, at the very corner of its own box. */
const TILT = 9

function TiltCard({
  children,
  accent,
  delay = 0,
  from,
  className = '',
}: {
  children: React.ReactNode
  accent: string
  delay?: number
  /** Entrance direction in px, so cards arrive from the frame edge they live on. */
  from: number
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)

  // Raw pointer position inside the card, -0.5..0.5 on each axis.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  // Sprung, so the card settles rather than tracking the mouse exactly. A card
  // that follows a pointer one-to-one reads as a texture being dragged; one
  // that lags slightly reads as a physical object with weight.
  const sx = useSpring(px, { stiffness: 150, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 150, damping: 18, mass: 0.6 })

  const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT, TILT])
  const rotateX = useTransform(sy, [-0.5, 0.5], [TILT, -TILT])

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = box.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
    // The sheen is plain CSS custom properties rather than more motion values:
    // it is a gradient position, so there is nothing for a spring to improve.
    node.style.setProperty('--gx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    node.style.setProperty('--gy', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  const onLeave = () => {
    px.set(0)
    py.set(0)
    resetCursor()
  }

  return (
    <motion.div
      ref={box}
      initial={{ opacity: 0, x: from, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      onPointerMove={onMove}
      onPointerEnter={() => setCursor({ active: true })}
      onPointerLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        // The accent is per beat, so the hover glow belongs in an inline
        // variable rather than in a class the stylesheet would have to fork.
        ['--tilt-accent' as string]: accent,
      }}
      // pointer-events has to be turned back on: the overlay plane above the
      // canvas is transparent to clicks by default, and only links and buttons
      // opt back in through globals.css.
      className={`beat-card pointer-events-auto ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function BeatAside({
  section,
  side,
}: {
  section: Section
  /** Which edge of the frame this column hugs — always opposite the copy. */
  side: 'left' | 'right'
}) {
  const from = side === 'right' ? 40 : -40

  if (section.tiles) {
    return (
      <div
        className="story-col story-col--mid absolute hidden lg:block"
        style={{ [side]: 'clamp(20px, 3vw, 72px)' }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
          className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-bone/35"
        >
          What it is built on
        </motion.p>

        <div className="space-y-3">
          {section.tiles.map((tile, i) => (
            <TiltCard
              key={tile}
              accent={section.accent}
              from={from}
              delay={0.3 + i * 0.12}
              className="beat-card--tile"
            >
              <span
                className="beat-card__index numeral"
                style={{ ['--numeral-accent' as string]: section.accent }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[13px] leading-[1.55] text-bone/85">
                {tile}
              </p>
              <span
                className="beat-card__rule"
                style={{ backgroundColor: section.accent }}
              />
            </TiltCard>
          ))}
        </div>
      </div>
    )
  }

  if (section.quote) {
    return (
      <div
        className="story-col story-col--mid absolute hidden lg:block"
        style={{ [side]: 'clamp(20px, 3vw, 72px)' }}
      >
        <TiltCard
          accent={section.accent}
          from={from}
          delay={0.3}
          className="beat-card--action"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-bone/40">
            Book a demo
          </p>

          <p className="mt-5 font-display text-[17px] italic leading-[1.55] text-bone/85">
            &lsquo;{section.quote}&rsquo;
          </p>

          <p className="mt-5 text-[12.5px] leading-[1.7] text-bone/55">
            Forty minutes, your context, no deck. We walk through MeloWorld and
            VR Wellness as your people would meet them.
          </p>

          <Link
            href="/contact"
            onMouseEnter={() => setCursor({ active: true })}
            onMouseLeave={resetCursor}
            className="btn-primary group mt-7 w-full justify-center"
          >
            Book a demo
            <ArrowUpRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>

          <Link
            href="/explore"
            onMouseEnter={() => setCursor({ active: true })}
            onMouseLeave={resetCursor}
            className="mt-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/40 transition-colors hover:text-ember"
          >
            Or explore all six rooms
          </Link>

          <span
            className="beat-card__rule"
            style={{ backgroundColor: section.accent }}
          />
        </TiltCard>
      </div>
    )
  }

  return null
}
