'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scrollCommands } from '@/lib/scrollStore'
import { useEntered } from '@/lib/useEntered'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ExploreButton } from '@/components/ui/ExploreButton'

/**
 * The words: the opening title treatment, and the per-beat copy that replaces
 * it once the visitor starts moving.
 *
 * The copy block alternates sides beat to beat, mirroring the hero panel in the
 * 3D field so the two never stack on the same half of the frame. Text enters
 * from the side it lives on and leaves the same way, which reads as the page
 * turning rather than a crossfade.
 *
 * Only one of these is mounted at a time and the switch is driven by a discrete
 * snapshot value, so the whole overlay re-renders about seven times across the
 * entire page.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

function Hero() {
  // Staged off the curtain rather than off mount: the entrance below runs for
  // about a second and a half, and mount happens while the curtain is still
  // opaque. Waiting means the visitor actually sees it.
  const entered = useEntered()
  const show = entered ? 'shown' : 'hidden'

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="absolute inset-0"
    >
      {/* The figure owns the middle of the frame. `--safe-col` is the widest a
          flanking column can be without reaching it — see globals.css. */}
      <div className="story-col absolute bottom-[14vh] left-[clamp(20px,3vw,72px)] lg:bottom-[18vh]">
        <motion.span
          initial="hidden"
          animate={show}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="mb-7 block h-px w-10 origin-left bg-bone/60"
        />

        <motion.p
          initial="hidden"
          animate={show}
          variants={{ hidden: { opacity: 0, y: 22 }, shown: { opacity: 1, y: 0 } }}
          transition={{ duration: 1, ease: EASE, delay: 0.45 }}
          className="text-[15px] leading-[1.75] text-bone/80"
        >
          An immersive walk through how NEXR removes the invisible barriers that
          stop people asking for support at work.
        </motion.p>

        <motion.div
          initial="hidden"
          animate={show}
          variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0 } }}
          transition={{ duration: 1, ease: EASE, delay: 0.6 }}
          className="mt-9"
        >
          <ExploreButton onPress={() => scrollCommands.start()} />
        </motion.div>
      </div>

    </motion.div>
  )
}

function Beat({ index }: { index: number }) {
  const section = SECTIONS[Math.min(index, SECTION_COUNT - 1)]
  // Mirrors PanelField exactly: even beats park their hero card on the left of
  // the character, so the copy takes the right, and odd beats swap. The parity
  // test has to stay identical in both files — if they disagree, the card and
  // the text end up stacked on the same half of the frame.
  const onRight = index % 2 === 0
  const from = onRight ? 48 : -48

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, x: from, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -from * 0.6, filter: 'blur(8px)' }}
      transition={{ duration: 0.75, ease: EASE }}
      className="story-col absolute top-1/2 -translate-y-1/2"
      style={{ [onRight ? 'right' : 'left']: 'clamp(20px, 3vw, 72px)' }}
    >
      <div className="flex items-center gap-3">
        {section.mark ? (
          <motion.img
            src={section.mark}
            alt=""
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="h-6 w-auto"
          />
        ) : null}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-lime/90">
          {section.index} &nbsp;/&nbsp; {section.word}
        </p>
      </div>

      <h2 className="mt-5 font-display text-[clamp(1.7rem,2.6vw,2.6rem)] leading-[1.12] text-bone">
        {section.headline}
      </h2>

      <p className="mt-5 text-[14px] leading-[1.8] text-bone/65">{section.body}</p>

      <Link
        href={section.cta.route}
        {...hoverable}
        className="group pointer-events-auto mt-8 inline-flex items-center gap-4"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/80 transition-colors group-hover:text-lime">
          {section.cta.label}
        </span>
        <span className="block h-px w-12 origin-left bg-bone/35 transition-all duration-500 group-hover:w-20 group-hover:bg-lime" />
      </Link>
    </motion.div>
  )
}

export function StoryOverlay() {
  const { activeCard, past } = useScrollSnapshot()

  return (
    <div
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <AnimatePresence mode="wait">
        {past ? <Beat key={`beat-${activeCard}`} index={activeCard} /> : <Hero />}
      </AnimatePresence>
    </div>
  )
}
