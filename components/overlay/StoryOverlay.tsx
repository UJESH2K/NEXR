'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scrollCommands } from '@/lib/scrollStore'
import { useEntered } from '@/lib/useEntered'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ExploreButton } from '@/components/ui/ExploreButton'
import { BeatAside } from './BeatAside'

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

/** Shared entrance: fade up, staggered by the caller through `delay`. */
const rise = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0 },
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
      {/* The figure owns the middle of the frame. `--char-half` is the widest a
          flanking column can be without reaching it — see globals.css. */}
      <div className="story-col absolute bottom-[14vh] left-[clamp(20px,3vw,72px)] lg:bottom-[18vh]">
        <motion.span
          initial="hidden"
          animate={show}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          className="mb-7 block h-px w-10 origin-left bg-bone/60"
        />

        {/* Set word by word so the line assembles rather than appearing. Each
            word carries its own blur, which makes the movement read as focus
            pulling in rather than as a slide. */}
        <h1 className="font-display text-[clamp(2.1rem,3.6vw,3.6rem)] leading-[1.05] text-bone">
          {['Workplace', 'wellbeing,', 'reimagined.'].map((word, i) => (
            <motion.span
              key={word}
              initial="hidden"
              animate={show}
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(12px)' },
                shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
              }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.4 + i * 0.13 }}
              className="mr-[0.28em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1, ease: EASE, delay: 0.95 }}
          className="mt-9"
        >
          <ExploreButton onPress={() => scrollCommands.start()} />
        </motion.div>
      </div>

      {/* The script's right-hand line. Held to large screens: below that the
          layout drops both columns into the same block along the bottom, and
          two of them would land on top of each other. */}
      <div className="story-col absolute right-[clamp(20px,3vw,72px)] top-1/2 hidden -translate-y-1/2 lg:block">
        <motion.p
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1.1, ease: EASE, delay: 0.75 }}
          className="text-[15px] leading-[1.85] text-bone/75"
        >
          The future of workplace wellbeing isn&rsquo;t one-size-fits-all.
        </motion.p>

        <motion.p
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1.1, ease: EASE, delay: 0.92 }}
          className="mt-3 font-display text-[19px] italic leading-[1.6] text-ember/90"
        >
          It&rsquo;s private. Immersive. Personal.
        </motion.p>

        <motion.span
          initial="hidden"
          animate={show}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
          className="mt-7 block h-px w-16 origin-left bg-bone/25"
        />
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
    // The whole beat fades as one on the way out. Each column animates itself
    // on the way in, which is what lets them arrive from opposite edges.
    <motion.div
      key={section.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="absolute inset-0"
    >
    <motion.div
      initial={{ opacity: 0, x: from, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
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
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
          <span className="numeral">{section.index}</span>
          <span className="text-bone/25">/</span>
          {section.word}
        </p>
      </div>

      {/* The script sets most beats as a quiet line and then a loud one. The
          quiet line stays near body size on purpose — it is a run-up, and
          matching the headline's weight would make it a competing title. */}
      {section.kicker ? (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          className="mt-5 text-[clamp(0.95rem,1.15vw,1.15rem)] leading-[1.5] text-bone/60"
        >
          {section.kicker}
        </motion.p>
      ) : null}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="mt-2 font-display text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-[1.08] text-bone"
      >
        {section.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="mt-5 text-[13.5px] leading-[1.8] text-bone/65"
      >
        {section.body}
      </motion.p>

      {/* Below 1024px the aside column cannot exist — see BeatAside — so the
          same content is rendered inline here instead. The two are mutually
          exclusive at every width, never both. */}
      {section.tiles ? (
        <ul className="mt-6 space-y-2 lg:hidden">
          {section.tiles.map((tile, i) => (
            <motion.li
              key={tile}
              initial={{ opacity: 0, x: onRight ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.4 + i * 0.1 }}
              className="rounded-xl border border-bone/12 bg-bone/[0.04] px-4 py-3 text-[12.5px] leading-[1.5] text-bone/75 backdrop-blur-sm"
            >
              {tile}
            </motion.li>
          ))}
        </ul>
      ) : null}

      {section.quote ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.45 }}
          className="mt-6 border-l border-ember/40 pl-4 font-display text-[15px] italic leading-[1.6] text-bone/70 lg:hidden"
        >
          &lsquo;{section.quote}&rsquo;
        </motion.p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
      >
        <Link
          href={section.cta.route}
          {...hoverable}
          className="group pointer-events-auto mt-8 inline-flex items-center gap-4"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/80 transition-colors group-hover:text-ember">
            {section.cta.label}
          </span>
          <span className="block h-px w-12 origin-left bg-bone/35 transition-all duration-500 group-hover:w-20 group-hover:bg-ember" />
        </Link>
      </motion.div>
    </motion.div>

    {/* Always the opposite edge from the copy, so the figure stands between
        the two columns rather than beside a stack. */}
    <BeatAside section={section} side={onRight ? 'left' : 'right'} />
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
