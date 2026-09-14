'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { SECTIONS, SECTION_COUNT, type Section } from '@/lib/sections'
import {
  SECTION_REST_POINT,
  clamp,
  scroll,
  scrollCommands,
  smoothstep,
} from '@/lib/scrollStore'
import { useEntered } from '@/lib/useEntered'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ExploreButton } from '@/components/ui/ExploreButton'
import { BeatAside } from './BeatAside'

/**
 * The words: the opening title treatment, and the per-beat copy.
 *
 * Two things about how this is built are worth stating, because both replaced
 * an approach that seemed reasonable and was not.
 *
 * **Every beat is mounted at once, and driven by scroll position.** The copy
 * used to be a single block swapped by an AnimatePresence keyed on the active
 * section index — so the text waited for the character to finish arriving, then
 * played its own entrance. Two animations in sequence where the visitor is
 * performing one gesture. Now each beat reads `scroll.sectionFloat` on the same
 * ticker the scene runs on and writes its own opacity, offset and blur.
 *
 * **The beats form a conveyor, and they never share the frame.** The first
 * version of this crossfaded them: one faded out while the next faded in, over
 * ranges that overlapped almost entirely. Both blocks sat at half opacity in
 * the same place, two headlines of different lengths interleaving line by line,
 * and it was unreadable. Crossfading works for images and fails for type.
 *
 * So the windows are now strictly sequential, with a deliberate empty stretch
 * between them — see WINDOWS below. A block enters from above, travels down
 * through its resting position and leaves below the frame; the next one enters
 * from above in turn. One direction, one block at a time, moving the way the
 * page is moving.
 *
 * Six small DOM trees is the price. It is a cheap price: nothing re-renders,
 * the ticker writes three style properties per beat per frame, and beats that
 * are not on screen are `visibility: hidden`, which also keeps their links out
 * of the tab order and the accessibility tree.
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

/**
 * The conveyor's timing, in units of `scroll.sectionFloat`.
 *
 * A beat rests at `index + SECTION_REST_POINT` (0.32), which is where the
 * scroll snaps, so the copy has to be settled by then and held for a while
 * after. Measured from a beat's own index:
 *
 *   0.32          it rests here, fully present, travel zero
 *   0.50 → 0.72   it travels down and fades out
 *   0.72 → 0.88   nothing on screen — the gap that makes it legible
 *   0.88 → 1.10   the next beat descends into place
 *   1.10 → 1.32   settled, and the cycle repeats
 *
 * The empty stretch is the point. Without it two blocks are readable only as
 * one illegible block, and 0.16 of a section is roughly a third of a screen of
 * scrolling — long enough to register as a breath rather than as a stall.
 */
const OUT_START = 0.5
const OUT_END = 0.72
const IN_START = -0.12
const IN_END = 0.1

/** How far a block travels across its whole life, in px. */
const TRAVEL = 72
/** Scroll distance over which that travel is spent. */
const TRAVEL_SPAN = 0.5
/** Blur applied at the extremes of the travel, in px. */
const MAX_BLUR = 7

/**
 * Drive a layer's opacity and offset from scroll position.
 *
 * `fadeIn` and `fadeOut` give the ranges of `scroll.sectionFloat` over which
 * the layer arrives and leaves; between them it is fully present. It waits
 * *above* its resting position before its turn and sits *below* afterwards, so
 * it only ever moves downward — the direction the page is moving.
 *
 * `fadeOut` may be null, for the closing beat, which has nothing to hand over
 * to and so simply stays.
 *
 * Written straight to the node rather than through state. This runs every
 * frame on a page that is already rendering a 3D scene; a re-render here would
 * be the most expensive thing on screen.
 */
function useScrollPresence(
  ref: React.RefObject<HTMLDivElement | null>,
  fadeIn: [number, number],
  fadeOut: [number, number] | null,
  restAt: number,
) {
  useEffect(() => {
    let lastVisible: boolean | null = null
    let lastBlur = -1

    const tick = () => {
      const node = ref.current
      if (!node) return

      const f = scroll.sectionFloat
      const presence =
        smoothstep(fadeIn[0], fadeIn[1], f) *
        (fadeOut ? 1 - smoothstep(fadeOut[0], fadeOut[1], f) : 1)

      // Measured from the beat's resting point, so a settled beat sits at
      // exactly zero rather than part-way through its own movement.
      //
      // The sign is deliberate and was inverted at first: positive travel is
      // downward, and a beat is *above* its rest before its turn and *below*
      // after. Blocks therefore always move down the frame, which is the
      // direction the page itself is moving. Getting this backwards made the
      // copy climb against the scroll, which reads as the page fighting you.
      const travel = clamp((f - restAt) / TRAVEL_SPAN, -1, 1) * TRAVEL

      node.style.opacity = String(presence)
      node.style.setProperty('--beat-travel', `${travel}px`)

      // A touch of blur at the extremes. It sells the movement as speed rather
      // than as a slide, and it softens the two frames where an outgoing and an
      // incoming block can still be faintly co-present.
      const blur = (1 - presence) * MAX_BLUR
      if (Math.abs(blur - lastBlur) > 0.15) {
        lastBlur = blur
        // Cleared rather than set to zero: a filter of any value creates a
        // containing block and its own compositing layer, and six of those
        // sitting permanently over a WebGL canvas is not free.
        node.style.filter = blur < 0.2 ? '' : `blur(${blur.toFixed(2)}px)`
      }

      // Below this a layer is a ghost: invisible, but still hit-testable and
      // still in the tab order. visibility removes it from both.
      const visible = presence > 0.01
      if (visible !== lastVisible) {
        lastVisible = visible
        node.style.visibility = visible ? 'visible' : 'hidden'
      }
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // Depended on by value, not by array identity: the callers build these
    // inline, so a fresh literal every render would tear down and re-add the
    // ticker callback on every render if the arrays themselves were the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, fadeIn[0], fadeIn[1], fadeOut?.[0], fadeOut?.[1], restAt])
}

function Hero() {
  const layer = useRef<HTMLDivElement>(null)

  // Gone well before the first beat descends. The gap between this exit and
  // that arrival is the same breath that separates every later pair.
  useScrollPresence(layer, [-1, -0.9], [0.02, 0.16], 0)

  // The entrance is staged off the load curtain rather than off mount: it runs
  // for about a second and a half, and mount happens while the curtain is still
  // opaque. It lives on an inner element because the layer above owns opacity.
  const entered = useEntered()
  const show = entered ? 'shown' : 'hidden'

  return (
    <div ref={layer} className="absolute inset-0">
      {/* Under 1024px the copy sits beneath the figure rather than beside it,
          so it needs a ground to read against. Desktop hides this. */}
      <div className="story-scrim" aria-hidden="true" />

      {/* The figure owns the middle of the frame. `--char-half` is the widest a
          flanking column can be without reaching it — see globals.css. */}
      <div className="story-col beat-shift absolute bottom-[14vh] left-[clamp(20px,3vw,72px)] lg:bottom-[18vh]">
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
      <div className="story-col beat-shift absolute right-[clamp(20px,3vw,72px)] top-1/2 hidden -translate-y-1/2 lg:block">
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

function Beat({ section, index }: { section: Section; index: number }) {
  const layer = useRef<HTMLDivElement>(null)

  const restAt = index + SECTION_REST_POINT

  // The first beat follows the hero out rather than a previous beat, and the
  // hero's own exit finishes before this begins — same gap, same reasoning.
  const fadeIn: [number, number] =
    index === 0 ? [0.18, 0.3] : [index + IN_START, index + IN_END]

  // The last beat holds to the end of the track rather than leaving the closing
  // frame with nothing in it.
  const fadeOut: [number, number] | null =
    index === SECTION_COUNT - 1
      ? null
      : [index + OUT_START, index + OUT_END]

  useScrollPresence(layer, fadeIn, fadeOut, restAt)

  return (
    <div ref={layer} className="absolute inset-0" style={{ opacity: 0, visibility: 'hidden' }}>
      <div className="story-scrim" aria-hidden="true" />

      {/*
        Always the left. The figure gestures to her left at every pose, so this
        is the side she is presenting toward — see the note at the top of the
        file. BeatAside takes the right whenever a beat has extras for it.
      */}
      <div
        className="story-col story-col--mid beat-shift absolute"
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
          <p className="beat-shift--near mt-4 text-[clamp(0.9rem,3.6vw,1.15rem)] leading-[1.45] text-bone/60 lg:mt-5">
            {section.kicker}
          </p>
        ) : null}

        <h2 className="beat-shift--far mt-2 font-display text-[clamp(1.65rem,6.4vw,3rem)] font-semibold leading-[1.08] text-bone">
          {section.headline}
        </h2>

        <p className="beat-shift--near mt-4 text-[13px] leading-[1.7] text-bone/70 sm:text-[13.5px] sm:leading-[1.8] lg:mt-5">
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
              <li
                key={tile.title}
                className="rounded-xl border border-bone/12 bg-bone/[0.04] px-3.5 py-2.5 backdrop-blur-sm"
              >
                <p className="font-display text-[14px] leading-[1.3] text-bone">
                  {tile.title}
                </p>
                <p className="mt-1 text-[12px] leading-[1.45] text-bone/65">
                  {tile.body}
                </p>
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
  return (
    <div
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <Hero />
      {SECTIONS.map((section, index) => (
        <Beat key={section.id} section={section} index={index} />
      ))}
    </div>
  )
}
