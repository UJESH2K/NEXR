'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { motion } from 'framer-motion'
import { SECTIONS, type Section } from '@/lib/sections'
import { scroll, scrollCommands, smoothstep } from '@/lib/scrollStore'
import { useEntered } from '@/lib/useEntered'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ExploreButton } from '@/components/ui/ExploreButton'
import { BeatAside } from './BeatAside'
import { AudienceDoodle, audienceFromHref } from '@/components/ui/AudienceDoodle'

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
          {['Wellbeing,', 'reimagined.'].map((word, i) => (
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
          A new way to experience, access and practise wellbeing.{' '}
          <span className="font-display italic text-ember-soft">
            Private spaces, immersive experiences and professional support,
            brought together in one ecosystem.
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
          A new way to experience, access and practise wellbeing.
        </motion.p>

        <motion.p
          initial="hidden"
          animate={show}
          variants={rise}
          transition={{ duration: 1.1, ease: EASE, delay: 0.92 }}
          className="mt-3 font-display text-[19px] italic leading-[1.6] text-ember/90"
        >
          Private spaces, immersive experiences and professional support,
          brought together in one ecosystem.
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

function Beat({ section, visible, index }: { section: Section; visible: boolean; index: number }) {
  return (
    <div className="beat-layer" data-visible={visible ? 'true' : 'false'} data-beat-index={index}>

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

        {/* Below 1024px the aside column cannot exist — see BeatAside — so the
            same content is rendered inline here instead. The two are mutually
            exclusive at every width, never both. */}
        {section.tiles ? <AudienceTabs tiles={section.tiles} /> : null}

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

/**
 * The three audiences, on a phone.
 *
 * Stacked as full cards they were taller than everything else in the beat put
 * together — on a 390px screen they ran up over the figure and the headline
 * landed on her face. Tabs hold the same three titles and the same three lines,
 * one line at a time, in about a sixth of the height. Desktop never sees this:
 * BeatAside shows the cards there, beside the figure, where they fit.
 */
function AudienceTabs({ tiles }: { tiles: NonNullable<Section['tiles']> }) {
  const [active, setActive] = useState(0)
  const tile = tiles[active]

  return (
    <div className="mt-4 lg:hidden">
      <div
        role="tablist"
        aria-label="Who it is for"
        className="grid grid-cols-3 gap-1 rounded-xl border border-bone/15 bg-[#140c07]/45 p-1"
      >
        {tiles.map((t, i) => (
          <button
            key={t.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`min-h-11 rounded-lg px-1.5 py-1.5 text-center font-display text-[12.5px] leading-[1.2] transition-colors duration-300 ${
              i === active ? 'bg-ember/90 text-ink' : 'text-bone/65'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>
      {/* The open tab is a card of its own, with the same sketch as on
          desktop and a plain "Explore" — so it reads as a door, not a caption. */}
      <Link
        href={tile.href}
        role="tabpanel"
        {...hoverable}
        className="relative mt-2 block overflow-hidden rounded-xl border border-bone/15 bg-[#140c07]/45 px-3.5 py-3"
      >
        <AudienceDoodle
          key={`d-${tile.title}`}
          kind={audienceFromHref(tile.href)}
          className="melo-text pointer-events-none absolute -bottom-3 -right-3 w-[44%] text-ember-soft/15"
        />
        <span key={tile.title} className="melo-text relative block max-w-[86%] text-[12.5px] leading-[1.5] text-bone/80">
          {tile.body}
        </span>
        <span className="relative mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
          Explore {tile.title} <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
    </div>
  )
}

/**
 * Above the first beat, the wordmark has the frame to itself.
 *
 * Scrolling back up past beat 01 is a move toward the title, so the title
 * should take over: as the NEXR wordmark rises in the scene (GhostWordmark),
 * the first beat's copy blurs, fades and sinks out of its way, and the two
 * never share the frame. Both read the same curve off `sectionFloat`, so they
 * stay in step at any scroll speed.
 *
 * Written to the DOM from the gsap ticker, like the HUD: this runs every
 * frame while scrolling, and a React render per frame would be the expensive
 * way to move three CSS properties.
 */
function useTitleHandover(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = root.current
    if (!host) return
    const copy = host.querySelector<HTMLElement>('[data-beat-index="0"] .story-col')
    const scrim = host.querySelector<HTMLElement>('.story-scrim')
    let last = -1

    const tick = () => {
      const k = scroll.started ? 1 - smoothstep(0.04, 0.3, scroll.sectionFloat) : 0
      if (Math.abs(k - last) < 0.002) return
      last = k
      if (!copy) return
      if (k < 0.002) {
        copy.style.removeProperty('opacity')
        copy.style.removeProperty('transform')
        copy.style.removeProperty('filter')
        copy.style.removeProperty('pointer-events')
        scrim?.style.removeProperty('opacity')
        return
      }
      copy.style.opacity = String(1 - k)
      copy.style.transform = `translate3d(0, ${(k * 56).toFixed(1)}px, 0)`
      copy.style.filter = `blur(${(k * 9).toFixed(2)}px)`
      // Invisible links must not stay clickable.
      copy.style.pointerEvents = k > 0.5 ? 'none' : ''
      if (scrim) scrim.style.opacity = String(1 - k)
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
    }
  }, [root])
}

export function StoryOverlay() {
  const { activeCard, started } = useScrollSnapshot()
  const root = useRef<HTMLDivElement>(null)
  useTitleHandover(root)

  return (
    <div
      ref={root}
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      {/* One scrim for every beat, not one inside each. Beats swap by fading
          out and back in, and a scrim that went with them blinked off and on
          at every change — on a phone, a dark band flickering mid-scroll.
          Phone layout only; it is not drawn at desktop widths. */}
      <div className="story-scrim" data-visible={started ? 'true' : 'false'} aria-hidden="true" />
      {/* The opening frame holds until Explore is pressed; from then on exactly
          one beat is visible, and which one is a discrete value that changes
          once per gesture. */}
      <Hero visible={!started} />
      {SECTIONS.map((section, index) => (
        <Beat
          key={section.id}
          section={section}
          index={index}
          visible={started && index === activeCard}
        />
      ))}
    </div>
  )
}
