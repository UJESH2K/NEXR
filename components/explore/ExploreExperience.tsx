'use client'

import Link from 'next/link'
import { requestReturn } from '@/lib/returnStore'
import { ConnectConstellation } from './ConnectConstellation'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { ExploreTopic } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { ImageSlot } from './ImageSlot'

gsap.registerPlugin(ScrollTrigger)

/**
 * A room off the home experience.
 *
 * The scene sells a beat in one paragraph; this is where the argument behind it
 * gets room. The design brief it answers is "worth exploring on its own", which
 * here means three things:
 *
 *   - The page keeps the beat's identity. Index, word and accent colour all come
 *     from the same record the 3D scene reads, so the room is recognisably the
 *     one the visitor clicked rather than a generic article template.
 *   - Nothing arrives all at once. Every block is revealed on its own trigger,
 *     the hero art moves against the scroll, and the chapter rail tracks where
 *     the reader is, so a long page still feels like moving through something.
 *   - It never dead-ends. Every exit is a real route: deeper reading, the next
 *     room, the demo, or back to the scene.
 *
 * All motion is skipped under prefers-reduced-motion, which leaves a page that
 * is simply already in its final state.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

export function ExploreExperience({
  topic,
  next,
  prev,
}: {
  topic: ExploreTopic
  next: { slug: string; word: string; index: string }
  prev: { slug: string; word: string; index: string }
}) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const [activeChapter, setActiveChapter] = useState(topic.chapters[0]?.id)

  useGSAP(
    () => {
      const page = root.current
      if (!page) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Below 1024px, skip the reveal-on-scroll timeline entirely rather than
      // trust it to fire correctly. It depends on ScrollTrigger's 'top 82%'
      // boundary staying accurate relative to the page's own layout, and on a
      // phone that layout keeps moving under it: the address bar collapsing
      // mid-scroll resizes the viewport, and images/webfonts finishing late
      // shift where every block actually sits. Either one can leave the
      // trigger's start point stale by the time a reader scrolls past it, and
      // a `play none none none` timeline that never enters stays at its
      // `.from()` state forever — the block is there, just invisible, which
      // reads as the room being broken rather than merely unanimated. Desktop
      // keeps the reveal; a phone gets the same fully-visible content the
      // reduced-motion path already gives everyone else.
      const skipReveal = window.matchMedia('(max-width: 1023px)').matches

      const triggers: ScrollTrigger[] = []

      /*
       * One ScrollTrigger drives both the reading progress and the chapter
       * rail.
       *
       * The rail used to own a trigger per chapter, and that is what threw
       * "Cannot read properties of undefined (reading 'end')" on the way into a
       * room. Creating a ScrollTrigger makes ScrollTrigger walk its global list
       * of existing triggers and force-refresh any that are not initialised
       * yet; if that list changes length while the walk is in progress — a
       * trigger killing itself, a refresh cascading into another create — the
       * next index it reads is undefined. Six creates in a loop, each one
       * walking a list the previous ones just extended, is the shape of code
       * that hits it.
       *
       * The rail does not need triggers of its own. It needs to know which
       * chapter owns the middle of the screen, which is a comparison against
       * numbers we already have. So the offsets are measured once per refresh
       * and compared on update: no extra triggers, no list to corrupt, and one
       * subscriber to the scroll instead of seven.
       */
      let bounds: { id: string; top: number }[] = []
      let shown = topic.chapters[0]?.id

      const measure = () => {
        const top = window.scrollY
        bounds = topic.chapters
          .map((chapter) => {
            const node = page.querySelector<HTMLElement>(`#${chapter.id}`)
            if (!node) return null
            return { id: chapter.id, top: node.getBoundingClientRect().top + top }
          })
          .filter((entry): entry is { id: string; top: number } => entry !== null)
      }

      triggers.push(
        ScrollTrigger.create({
          trigger: page,
          start: 'top top',
          end: 'bottom bottom',
          // Measured here rather than on every update: reading a rect per
          // frame would force layout on a page that is also running parallax.
          onRefresh: measure,
          onUpdate: (self) => {
            if (progress.current) {
              progress.current.style.transform = `scaleX(${self.progress})`
            }

            // The chapter that has crossed the reading line most recently.
            const line = window.scrollY + window.innerHeight * 0.45
            let active = bounds[0]?.id
            for (const entry of bounds) {
              if (entry.top <= line) active = entry.id
            }

            // React only hears about it when the answer actually changes,
            // which is a handful of renders across the whole page.
            if (active && active !== shown) {
              shown = active
              setActiveChapter(active)
            }
          },
        }),
      )

      // Hero art drifts up against the scroll, and the oversized index number
      // drifts down, so the two separate as the reader leaves the hero.
      const art = page.querySelector<HTMLElement>('[data-explore-art]')
      if (art) {
        gsap.to(art.querySelector('img') ?? art, {
          yPercent: -14,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: art,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        })
      }

      gsap.to('[data-explore-ghost]', {
        yPercent: 26,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-explore-hero]',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Blocks reveal once, on their own trigger — desktop only, see above.
      if (skipReveal) return () => triggers.forEach((trigger) => trigger.kill())

      gsap.utils.toArray<HTMLElement>('[data-explore-block]').forEach((block) => {
        const items = block.querySelectorAll<HTMLElement>('[data-explore-item]')

        const tl = gsap.timeline({
          // play-once through toggleActions rather than `once: true`.
          //
          // `once` makes a ScrollTrigger kill itself the moment it is past its
          // end — including from inside the refresh that another trigger's
          // creation runs. That splices the global trigger array while
          // ScrollTrigger is iterating it, and the next index it reads is
          // undefined: "Cannot read properties of undefined (reading 'end')".
          // Any block already scrolled past on load hits it, which is why it
          // fired on every room. toggleActions plays the reveal exactly once
          // and leaves the trigger alive, so the array never moves underneath
          // the loop.
          scrollTrigger: {
            trigger: block,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        })

        tl.from(block.querySelectorAll('[data-explore-lead]'), {
          y: 40,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.95,
          ease: 'power3.out',
          stagger: 0.12,
        })

        if (items.length) {
          tl.from(
            items,
            {
              y: 46,
              opacity: 0,
              scale: 0.97,
              duration: 0.8,
              ease: 'power2.out',
              stagger: 0.1,
            },
            '-=0.55',
          )
        }
      })

      return () => triggers.forEach((trigger) => trigger.kill())
    },
    { scope: root, dependencies: [topic.slug] },
  )

  return (
    <div ref={root} className="pointer-events-auto relative bg-void">
      {/* Reading progress, sitting just under the fixed header. */}
      <div className="pointer-events-none fixed inset-x-0 top-[4.6rem] z-[31] h-px bg-white/10">
        <div
          ref={progress}
          className="h-full origin-left scale-x-0"
          style={{ backgroundColor: topic.accent }}
        />
      </div>

      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <header
        data-explore-hero
        className="room-section relative overflow-hidden pb-[var(--room-rhythm)] pt-28 md:pt-40"
      >
        {/* Two washes in the beat's own accent. This is what keeps six rooms
            built from one template from looking like one room six times. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(70% 55% at 18% 0%, ${topic.accent}1f, transparent 70%), radial-gradient(60% 50% at 90% 18%, ${topic.tint[0]}55, transparent 72%)`,
          }}
        />

        <span
          data-explore-ghost
          aria-hidden="true"
          // top-24/md:top-32 rather than the negative offset this had: the
          // number is absolutely positioned, so it ignores the header's own
          // pt-28/md:pt-40 padding and was sitting right at the box's literal
          // top edge — which is also where the fixed site header covers it and
          // where this box's own `overflow-hidden` clips it, so the glyph read
          // as sliced in half. Starting inside the padded area clears both.
          className="pointer-events-none absolute top-24 right-4 select-none font-display leading-none text-bone/[0.04] md:top-32 md:right-12"
          // Held well below the old 26vw. A watermark should be felt at the
          // edge of vision, not read — at 26vw this was 500px of type on a
          // desktop and became the loudest thing on the page.
          style={{ fontSize: 'clamp(5rem, 13vw, 11rem)' }}
        >
          {topic.index}
        </span>

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Carries the same return intent as the pinned control, so the two
                ways back cannot disagree about where "back" is. */}
            <Link
              href="/"
              onClick={requestReturn}
              {...hoverable}
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
            >
              <ArrowLeft
                size={12}
                className="transition-transform group-hover:-translate-x-1"
              />
              The experience
            </Link>
            <span className="h-px w-8 bg-bone/20" />
            <p
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70"
              style={{ ['--numeral-accent' as string]: topic.accent }}
            >
              <span className="numeral">{topic.index}</span>
              <span className="text-bone/25">/</span>
              {topic.word}
            </p>
          </motion.div>

          {/*
            Text on one side, the room's own image on the other — a portrait
            card with a floating badge rather than the wide banner this used
            to run full-bleed underneath the title. The reference brief asked
            for this exact shape (an agency "about" hero); the badge and the
            card both carry the room's own accent instead of the reference's
            colours, so six rooms still read as one site.
          */}
          <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div>
              {topic.mark ? (
                <motion.img
                  src={topic.mark}
                  alt=""
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                  className="mb-7 h-12 w-auto"
                />
              ) : null}

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                className="eyebrow"
              >
                {topic.eyebrow}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 42, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                className="mt-6 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.06] text-bone"
              >
                {topic.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.32 }}
                className="mt-6 max-w-md text-[15px] leading-[1.85] text-sand/75"
              >
                {topic.lede}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
                className="mt-8 flex flex-wrap items-center gap-5"
              >
                <Link href={topic.cta.href} {...hoverable} className="btn-primary group">
                  {topic.cta.label}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <a
                  href={`#${topic.chapters[0]?.id ?? 'chapters'}`}
                  {...hoverable}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-bone"
                >
                  {topic.readMoreLabel ?? 'Start reading'} &darr;
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
              className="relative"
            >
              <div
                data-explore-art
                className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 sm:mx-auto lg:mx-0 lg:max-w-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${topic.tint[0]}, ${topic.tint[1]})`,
                }}
              >
                <img
                  src={topic.hero}
                  alt=""
                  className="h-full w-full object-cover opacity-70 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
                <p className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.26em] text-bone/60 md:bottom-8 md:left-8">
                  NEXR / {topic.word}
                </p>
              </div>

              {/* The floating badge. Every reference of this layout has one —
                  a small circle overlapping the card's corner, usually holding
                  an arrow or an icon. Ours holds the room's own number, which
                  is content rather than decoration: it is the same number the
                  breadcrumb above and the chapter numerals below both use. */}
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -left-6 flex h-20 w-20 items-center justify-center rounded-full border-[6px] shadow-xl"
                style={{ borderColor: '#0d0906', backgroundColor: topic.accent }}
              >
                <span className="numeral text-[1.1rem] text-ink" style={{ ['--numeral-accent' as string]: '#0d0906' }}>
                  {topic.index}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/*
        ── in this room ──────────────────────────────────────────────────

        A horizontal strip rather than the sticky sidebar this used to be.
        220px of fixed rail plus a max-w-2xl text column left roughly a third
        of every wide screen permanently empty — visible in a screenshot of
        this exact room, "Belief", where the paragraph sat in a narrow band
        with the whole right half of the frame unused. Chapters below now use
        that width themselves; this strip only has to name the stops.

        Guarded on chapter count: a couple of rooms carry no chapters yet — see
        the comment on the "clinical" and "contact" entries in lib/explore.ts —
        and a nav strip labelled "In this room" pointing at nothing reads as
        broken rather than simply short.
      */}
      {topic.chapters.length > 0 ? (
      <nav
        aria-label="In this room"
        className="room-section room-section--tight mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-3 px-5 sm:px-6 md:px-10"
      >
        <p className="mr-3 font-mono text-[9px] uppercase tracking-[0.28em] text-bone/30">
          In this room
        </p>
        {topic.chapters.map((chapter, i) => {
          const active = chapter.id === activeChapter
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              {...hoverable}
              className="group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-500"
              style={{
                borderColor: active ? topic.accent : 'rgba(244,243,236,0.14)',
                color: active ? 'var(--color-bone)' : 'rgba(244,243,236,0.5)',
                backgroundColor: active ? `${topic.accent}14` : 'transparent',
              }}
            >
              <span
                className="numeral text-[0.85em]"
                style={{ ['--numeral-accent' as string]: topic.accent }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="transition-colors duration-500 group-hover:text-bone">
                {chapter.navLabel ?? chapter.heading}
              </span>
            </a>
          )
        })}
      </nav>
      ) : null}

      {/* ── chapters ─────────────────────────────────────────────────────── */}
      <div className="room-section mx-auto max-w-6xl px-5 pb-20 sm:px-6 md:px-10 md:pb-24">
        <div className="min-w-0">
          {topic.chapters.map((chapter, i) => {
            // One gallery frame per chapter, reused rather than duplicated —
            // this used to be the whole `gallery` array shown a second time,
            // on its own further down the page as "Inside {word}". Placing it
            // beside the paragraph it illustrates uses the width the text was
            // leaving empty, and it keeps every room at the same three or four
            // images instead of showing each one twice.
            const image = topic.gallery[i]
            const imageOnLeft = i % 2 === 1

            return (
              <section
                key={chapter.id}
                id={chapter.id}
                data-explore-block
                className="room-chapter"
              >
                <div
                  className={`grid gap-8 lg:items-center lg:gap-14 ${
                    image ? 'lg:grid-cols-[1fr_23rem]' : ''
                  }`}
                >
                  <div className={image && imageOnLeft ? 'lg:order-2' : undefined}>
                    {/* Kicker and heading on the left, the chapter's own
                        number pinned to the right of the same row — the
                        count a reader tracks lives at the edge they read
                        toward, not buried inline before the words it counts. */}
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        {chapter.kicker ? (
                          <p
                            data-explore-lead
                            className="text-[14px] leading-[1.6] text-bone/55"
                          >
                            {chapter.kicker}
                          </p>
                        ) : null}
                        <h2
                          data-explore-lead
                          className="mt-2 font-display text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.12] text-bone"
                        >
                          {chapter.heading}
                        </h2>
                      </div>
                      <span
                        data-explore-lead
                        className="numeral numeral--lg shrink-0 text-[clamp(1.5rem,3vw,2.4rem)] leading-none opacity-70"
                        style={{ ['--numeral-accent' as string]: topic.accent }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="mt-6 max-w-[62ch] space-y-5">
                      {chapter.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 24)}
                          data-explore-lead
                          className="text-[15px] leading-[1.85] text-sand/70"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {image ? (
                    <div className={imageOnLeft ? 'lg:order-1' : undefined}>
                      <ImageSlot
                        item={image}
                        tint={topic.tint}
                        accent={topic.accent}
                        className="explore-frame--tilt"
                      />
                    </div>
                  ) : null}
                </div>
              </section>
            )
          })}
          {/* ── stats ───────────────────────────────────────────────────── */}
          {topic.stats ? (
            <section
              data-explore-block
              className="room-chapter"
            >
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {topic.stats.map((stat) => (
                  <div key={stat.label} data-explore-item>
                    <p
                      className="numeral numeral--lg text-[clamp(2rem,4vw,3.2rem)] leading-none"
                      style={{ ['--numeral-accent' as string]: topic.accent }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.18em] text-bone/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* ── highlights ──────────────────────────────────────────────── */}
          {topic.highlights ? (
            <section
              data-explore-block
              className="room-chapter"
            >
              <h2
                data-explore-lead
                className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] text-bone"
              >
                {topic.highlights.heading}
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {topic.highlights.items.map((item, i) => (
                  <li
                    key={item.title}
                    data-explore-item
                    className="glow-hover group rounded-2xl border border-white/10 bg-ink/50 p-6 transition-colors duration-500 hover:border-white/25"
                  >
                    {/* A small circular badge rather than the plain rule this
                        used to open with — the reference brief's own pillar
                        cards ("VISION", "MISSION") each carry one, and it is
                        what keeps a grid of cards from reading as a bare list. */}
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-110"
                      style={{
                        borderColor: `${topic.accent}4d`,
                        backgroundColor: `${topic.accent}14`,
                        color: topic.accent,
                      }}
                    >
                      <span className="numeral text-[0.8rem]" style={{ ['--numeral-accent' as string]: topic.accent }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <h3 className="mt-5 font-display text-xl leading-snug text-bone">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.75] text-sand/65">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {/* ── quote ────────────────────────────────────────────────────────── */}
      {topic.quote ? (
        <section
          data-explore-block
          className="room-section room-band relative overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(50% 70% at 50% 50%, ${topic.accent}14, transparent 72%)`,
            }}
          />
          <blockquote
            data-explore-lead
            className="mx-auto max-w-3xl text-center font-display text-[clamp(1.5rem,3.2vw,2.6rem)] italic leading-[1.35] text-bone/90"
          >
            &lsquo;{topic.quote}&rsquo;
          </blockquote>
        </section>
      ) : null}

      {/* ── deeper reading ───────────────────────────────────────────────── */}
      <section
        data-explore-block
        className="room-section"
      >
        <h2
          data-explore-lead
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/35"
        >
          Go deeper
        </h2>
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {topic.deeper.map((link) => (
            <li key={link.href} data-explore-item>
              <Link
                href={link.href}
                {...hoverable}
                className="group flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] text-bone transition-colors group-hover:text-ember">
                  {link.label}
                </span>
                <span className="flex items-center gap-4 text-sm text-sand/55">
                  {link.note}
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-bone/40 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ember"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── call to action ───────────────────────────────────────────────── */}
      <section
        data-explore-block
        className="room-section"
      >
        <div
          data-explore-item
          className="relative overflow-hidden rounded-3xl border border-white/12 px-6 py-12 text-center sm:px-8 md:px-16 md:py-14"
          style={{
            backgroundImage: `linear-gradient(150deg, ${topic.tint[0]}, ${topic.tint[1]})`,
          }}
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: `${topic.accent}22` }}
          />
          <h2 className="relative font-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-tight text-bone">
            The next way into wellbeing starts here.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand/70">
            {topic.cta.note}
          </p>
          {/* CLOSING CTA — common for all sub pages. */}
          <p className="relative mt-6 font-display text-base italic text-bone/60">
            Better wellbeing starts when the way in feels right.
          </p>
          <Link
            href={topic.cta.href}
            {...hoverable}
            className="btn-primary group relative mt-9"
          >
            {topic.cta.label}
            <ArrowUpRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ── where to carry on ────────────────────────────────────────────── */}
      {/* Only on the closing room. It is the one place where "follow us" is an
          answer to the question the reader actually has; on the other five it
          would be an interruption between the argument and its call to action. */}
      {topic.slug === 'contact' ? (
        <section data-explore-block className="room-section">
          <ConnectConstellation accent={topic.accent} />
        </section>
      ) : null}

      {/* ── the rest of the tour ─────────────────────────────────────────── */}
      <footer className="room-section room-section--end safe-bottom">
        <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
          <Link
            href={`/explore/${prev.slug}`}
            {...hoverable}
            className="group rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/35">
              &larr; Previous room
            </p>
            <p className="mt-3 flex items-center gap-2 font-display text-2xl text-bone transition-colors group-hover:text-ember">
              <span className="numeral numeral--lg text-[0.8em]">{prev.index}</span>
              {prev.word}
            </p>
          </Link>
          <Link
            href={`/explore/${next.slug}`}
            {...hoverable}
            className="group rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25 sm:text-right"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/35">
              Next room &rarr;
            </p>
            <p className="mt-3 flex items-center gap-2 font-display text-2xl text-bone transition-colors group-hover:text-ember sm:justify-end">
              <span className="numeral numeral--lg text-[0.8em]">{next.index}</span>
              {next.word}
            </p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/explore"
            {...hoverable}
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
          >
            All six rooms
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          {/* Third and last way back, and like the other two it carries the
              return intent — so whichever one a reader finds, they land on the
              beat they came from rather than at the top of the scene. */}
          <Link
            href="/"
            onClick={requestReturn}
            {...hoverable}
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
          >
            <ArrowLeft
              size={12}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to the experience
          </Link>
        </div>
      </footer>
    </div>
  )
}
