'use client'

import Link from 'next/link'

import { motion } from 'framer-motion'
import { SECTIONS, type Section } from '@/lib/sections'
import { scrollCommands } from '@/lib/scrollStore'
import { useEntered } from '@/lib/useEntered'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ExploreButton } from '@/components/ui/ExploreButton'
import { BeatAside } from './BeatAside'

/**
 * The words: the opening title treatment, and the per-beat copy.
 *
 * **Each beat appears as one block, in one motion.** The copy is driven by
 * document scroll with a snap, exactly as the rest of the scene is — this file
 * only decides how a beat looks once it has arrived. It fades up as a whole
 * column (see `.beat-layer` in globals.css) rather than animating its parts on
 * separate delays, and the swap between two beats is sequential rather than a
 * crossfade: the outgoing block clears before the incoming one starts, so two
 * paragraphs of different lengths never interleave in the same place.
 *
 * **Every beat is mounted at once**, with visibility rather than mounting doing
 * the work. That keeps the hidden blocks out of the tab order and the
 * accessibility tree, and it means no layout or font work happens at the moment
 * of a swap.
 *
 * **The copy column is pinned left at every beat.** It used to alternate sides.
 * The figure gestures to her left at every pose, so on the beats where the text
 * sat on the right she was pointing away from the thing she was introducing.
 * Alternation is a nice idea that this particular character cannot support.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

/** Shared entrance for the hero, staggered by the caller through `delay`. */
const rise = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0 },
}

function Hero({ visible }: { visible: boolean }) {
  // The entrance is staged off the load curtain rather than off mount: it runs
  // for about a second and a half, and mount happens while the curtain is still
  // opaque. It lives on the inner elements because the layer owns opacity.
  const entered = useEntered()
  const show = entered && visible ? 'shown' : 'hidden'

  return (
    <div className="beat-layer" data-visible={visible ? 'true' : 'false'}>
      {/* Under 1024px the copy sits beneath the figure rather than beside it,
          so it needs a ground to read against. Desktop hides this. */}
      <div className="story-scrim" aria-hidden="true" />

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
        <h1 className="font-display text-[clamp(2rem,8vw,3.6rem)] leading-[1.05] text-bone">
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

        {/* The script's second line. On a wide frame it lives in the right-hand
            column; there is no right-hand column on a phone, so it follows the
            title instead rather than being dropped. */}
        <motion.p
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1, ease: EASE, delay: 0.85 }}
          className="mt-4 text-[13.5px] leading-[1.7] text-bone/70 lg:hidden"
        >
          A better way to support people at work.{' '}
          <span className="font-display italic text-ember-soft">
            With private and immersive care.
          </span>
        </motion.p>

        <motion.div
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1, ease: EASE, delay: 0.95 }}
          className="mt-7 lg:mt-9"
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
          A better way to support people at work.
        </motion.p>

        <motion.p
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1.1, ease: EASE, delay: 0.92 }}
          className="mt-3 font-display text-[19px] italic leading-[1.6] text-ember/90"
        >
          With private and immersive care.
        </motion.p>

        <motion.span
          initial="hidden"
          animate={show}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
          className="mt-7 block h-px w-16 origin-left bg-bone/25"
        />
      </div>
    </div>
  )
}

function Beat({ section, visible }: { section: Section; visible: boolean }) {
  return (
    <div className="beat-layer" data-visible={visible ? 'true' : 'false'}>
      <div className="story-scrim" aria-hidden="true" />

      {/*
        Always the left. The figure gestures to her left at every pose, so this
        is the side she is presenting toward — see the note at the top of the
        file. BeatAside takes the right whenever a beat has extras for it.
      */}
      <div
        className="story-col story-col--mid absolute"
        style={{ left: 'clamp(20px, 3vw, 72px)' }}
      >
        <div className="flex items-center gap-3">
          {section.mark ? (
            <img src={section.mark} alt="" className="h-6 w-auto" />
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
          <p className="mt-4 text-[clamp(0.9rem,3.6vw,1.15rem)] leading-[1.45] text-bone/60 lg:mt-5">
            {section.kicker}
          </p>
        ) : null}

        <h2 className="mt-2 font-display text-[clamp(1.65rem,6.4vw,3rem)] font-semibold leading-[1.08] text-bone">
          {section.headline}
        </h2>

        <p className="mt-4 text-[13px] leading-[1.7] text-bone/70 sm:text-[13.5px] sm:leading-[1.8] lg:mt-5">
          {section.body}
        </p>

        {/* Assertions, not destinations — one quiet row rather than three more
            cards competing with the ones across the frame. */}
        {section.proof ? (
          <ul className="mt-5 space-y-1.5">
            {section.proof.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-[12px] leading-[1.5] text-bone/55"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.5em] block h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: section.accent }}
                />
                {line}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Below 1024px the aside column cannot exist — see BeatAside — so the
            same content is rendered inline here instead. The two are mutually
            exclusive at every width, never both. */}
        {section.tiles ? (
          <ul className="mt-4 space-y-1.5 lg:hidden">
            {section.tiles.map((tile) => (
              <li key={tile.title}>
                <Link
                  href={tile.href}
                  {...hoverable}
                  className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-bone/12 bg-bone/[0.04] px-3.5 py-2.5 backdrop-blur-sm"
                >
                  <span>
                    <span className="block font-display text-[14px] leading-[1.3] text-bone">
                      {tile.title}
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.45] text-bone/65">
                      {tile.body}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-[13px] text-bone/30"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {section.quote ? (
          <p className="mt-6 border-l border-ember/40 pl-4 font-display text-[15px] italic leading-[1.6] text-bone/70 lg:hidden">
            &lsquo;{section.quote}&rsquo;
          </p>
        ) : null}

        <Link
          href={section.cta.route}
          {...hoverable}
          className="group pointer-events-auto mt-6 inline-flex min-h-11 items-center gap-4 lg:mt-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/80 transition-colors group-hover:text-ember">
            {section.cta.label}
          </span>
          <span className="block h-px w-12 origin-left bg-bone/35 transition-all duration-500 group-hover:w-20 group-hover:bg-ember" />
        </Link>
      </div>

      {/* The far side of the figure, so she stands between the two columns. */}
      <BeatAside section={section} side="right" />
    </div>
  )
}

export function StoryOverlay() {
  const { activeCard, started } = useScrollSnapshot()

  return (
    <div
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      {/* The opening frame holds until Explore is pressed; from then on exactly
          one beat is visible, and which one is a discrete value that changes
          once per gesture. */}
      <Hero visible={!started} />
      {SECTIONS.map((section, index) => (
        <Beat
          key={section.id}
          section={section}
          visible={started && index === activeCard}
        />
      ))}
    </div>
  )
}
