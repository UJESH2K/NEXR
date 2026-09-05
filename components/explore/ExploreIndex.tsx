'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { EXPLORE_TOPICS } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The index of the six rooms.
 *
 * Built as a hover list rather than a card grid on purpose: six rooms is few
 * enough that a list can give each one a full line, and the preview panel means
 * the artwork is shown at a usable size instead of six thumbnails competing.
 * The panel follows the hovered row, so moving down the list feels like turning
 * pages.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

export function ExploreIndex() {
  const [hovered, setHovered] = useState(0)
  const preview = EXPLORE_TOPICS[hovered]

  return (
    <div className="pointer-events-auto min-h-svh bg-void px-6 pb-24 pt-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          {...hoverable}
          className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          The experience
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 32, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-8 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.05] text-bone"
        >
          Six ways in. One way forward.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="mt-6 max-w-xl text-[15px] leading-[1.85] text-sand/70"
        >
          Every beat of the experience opens into a room of its own. Read them in
          order, or start wherever the question you arrived with lives.
        </motion.p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <ul className="border-t border-white/10">
            {EXPLORE_TOPICS.map((topic, i) => (
              <motion.li
                key={topic.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
                className="border-b border-white/10"
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
              >
                <Link
                  href={`/explore/${topic.slug}`}
                  {...hoverable}
                  className="group flex items-center gap-6 py-7"
                >
                  {/* The accent only lights up on the hovered row, so the
                      column reads as a list with a cursor rather than as six
                      numbers all asking for attention. */}
                  <span
                    className="numeral numeral--lg text-[13px] transition-opacity duration-500"
                    style={{
                      ['--numeral-accent' as string]:
                        hovered === i ? topic.accent : 'rgba(244,243,236,0.45)',
                      opacity: hovered === i ? 1 : 0.75,
                    }}
                  >
                    {topic.index}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[clamp(1.5rem,3.2vw,2.4rem)] leading-tight text-bone transition-transform duration-500 group-hover:translate-x-2">
                      {topic.word}
                    </span>
                    <span className="mt-1 block max-w-xl text-sm leading-relaxed text-sand/55">
                      {topic.eyebrow}
                    </span>
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-bone/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ember"
                  />
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* The preview. Keyed on the slug so each change re-runs the fade,
              which is what makes the list feel like it is driving something. */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <motion.div
                key={preview.slug}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10"
                style={{
                  backgroundImage: `linear-gradient(150deg, ${preview.tint[0]}, ${preview.tint[1]})`,
                }}
              >
                <img
                  src={preview.hero}
                  alt=""
                  className="h-full w-full object-cover opacity-70 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
                <div className="absolute inset-x-6 bottom-6">
                  <p
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-bone/70"
                    style={{ ['--numeral-accent' as string]: preview.accent }}
                  >
                    <span className="numeral">{preview.index}</span>
                    <span className="text-bone/25">/</span>
                    {preview.word}
                  </p>
                  <p className="mt-3 font-display text-xl leading-snug text-bone">
                    {preview.title}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-6 border-t border-white/10 pt-10">
          <Link href="/contact" {...hoverable} className="btn-primary group">
            Book a demo
            <ArrowUpRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <p className="text-sm text-sand/55">
            Healthier organisations begin with people who feel safe enough to
            seek support.
          </p>
        </div>
      </div>
    </div>
  )
}
