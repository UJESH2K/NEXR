'use client'

import Link from 'next/link'
import { useState } from 'react'

import { SECTIONS, type Section } from '@/lib/sections'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { BeatAside } from './BeatAside'
import { AudienceDoodle, audienceFromHref } from '@/components/ui/AudienceDoodle'

/**
 * The words: the per-beat copy.
 *
 * **There is no opening title frame.** The page used to hold on a hero — the
 * figure, the room and one line — with scrolling locked until Explore was
 * pressed. The script now opens on beat 01 itself, so the hold, its button and
 * the handover that moved beat 01's copy out of the wordmark's way are all
 * gone: the first beat is simply the first thing on the page.
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

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
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

export function StoryOverlay() {
  const { activeCard } = useScrollSnapshot()

  return (
    <div
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      {/* One scrim for every beat, not one inside each. Beats swap by fading
          out and back in, and a scrim that went with them blinked off and on
          at every change — on a phone, a dark band flickering mid-scroll.
          Phone layout only; it is not drawn at desktop widths. */}
      <div className="story-scrim" data-visible="true" aria-hidden="true" />
      {/* Exactly one beat is visible, and which one is a discrete value that
          changes once per gesture. Beat 01 is visible from the top of the
          page, because the top of the page is now beat 01. */}
      {SECTIONS.map((section, index) => (
        <Beat
          key={section.id}
          section={section}
          index={index}
          visible={index === activeCard}
        />
      ))}
    </div>
  )
}
