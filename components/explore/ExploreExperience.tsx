'use client'

import Link from 'next/link'
import { requestReturn } from '@/lib/returnStore'
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

      // Blocks reveal once, on their own trigger.
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
        className="relative overflow-hidden px-5 pb-14 pt-28 sm:px-6 md:px-10 md:pb-20 md:pt-40"
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
          className="pointer-events-none absolute -top-6 right-4 select-none font-display leading-none text-bone/[0.04] md:right-12"
          style={{ fontSize: 'clamp(9rem, 26vw, 24rem)' }}
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

          <div className="mt-8 grid gap-8 md:mt-12 md:gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
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
                className="mt-6 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.03] text-bone"
              >
                {topic.title}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
              className="lg:pb-3"
            >
              <p className="max-w-md text-[15px] leading-[1.85] text-sand/75">
                {topic.lede}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
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
                  Start reading &darr;
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            data-explore-art
            initial={{ opacity: 0, y: 50, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
            className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50 md:mt-16 md:aspect-[2.3/1]"
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
            <div
              className="absolute bottom-0 left-0 h-px w-1/3"
              style={{
                background: `linear-gradient(90deg, ${topic.accent}88, transparent)`,
              }}
            />
            <p className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.26em] text-bone/60 md:bottom-8 md:left-8">
              NEXR / {topic.word}
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── chapters, with the tracking rail ─────────────────────────────── */}
      <div className="mx-auto grid max-w-6xl gap-16 px-5 pb-20 sm:px-6 md:px-10 md:pb-24 lg:grid-cols-[220px_1fr] lg:gap-20">
        <nav className="hidden lg:block">
          <div className="sticky top-32">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-bone/30">
              In this room
            </p>
            <ul className="mt-5 space-y-3">
              {topic.chapters.map((chapter, i) => {
                const active = chapter.id === activeChapter
                return (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      {...hoverable}
                      className="group flex items-start gap-3"
                    >
                      <span
                        className="mt-[9px] block h-px transition-all duration-500"
                        style={{
                          width: active ? 26 : 12,
                          backgroundColor: active
                            ? topic.accent
                            : 'rgba(244,243,236,0.25)',
                        }}
                      />
                      <span
                        className={`text-[13px] leading-[1.5] transition-colors duration-500 ${
                          active ? 'text-bone' : 'text-bone/40 group-hover:text-bone/70'
                        }`}
                      >
                        <span className="numeral mr-1 text-[0.85em]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {chapter.heading}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>

            <Link
              href={topic.cta.href}
              {...hoverable}
              className="mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
            >
              Book a demo
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </nav>

        <div className="min-w-0">
          {topic.chapters.map((chapter, i) => (
            <section
              key={chapter.id}
              id={chapter.id}
              data-explore-block
              className="scroll-mt-28 border-t border-white/10 py-10 first:border-0 first:pt-0 md:scroll-mt-32 md:py-14"
            >
              <div className="flex items-baseline gap-5">
                <span
                  data-explore-lead
                  className="numeral numeral--lg text-[15px]"
                  style={{ ['--numeral-accent' as string]: topic.accent }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  {chapter.kicker ? (
                    <p
                      data-explore-lead
                      className="text-[15px] leading-[1.6] text-bone/55"
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
              </div>

              <div className="mt-6 space-y-5 lg:pl-[3.1rem]">
                {chapter.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    data-explore-lead
                    className="max-w-2xl text-[15px] leading-[1.85] text-sand/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          {/* ── stats ───────────────────────────────────────────────────── */}
          {topic.stats ? (
            <section
              data-explore-block
              className="border-t border-white/10 py-14"
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
              className="border-t border-white/10 py-14"
            >
              <h2
                data-explore-lead
                className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] text-bone"
              >
                {topic.highlights.heading}
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {topic.highlights.items.map((item) => (
                  <li
                    key={item.title}
                    data-explore-item
                    className="glow-hover group rounded-2xl border border-white/10 bg-ink/50 p-6 transition-colors duration-500 hover:border-white/25"
                  >
                    <span
                      className="block h-px w-6 transition-all duration-500 group-hover:w-12"
                      style={{ backgroundColor: topic.accent }}
                    />
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

      {/* ── gallery ──────────────────────────────────────────────────────── */}
      <section
        data-explore-block
        className="mx-auto max-w-6xl px-5 pb-20 sm:px-6 md:px-10 md:pb-24"
      >
        <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-10 md:pt-12">
          <h2
            data-explore-lead
            className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] text-bone"
          >
            Inside {topic.word}
          </h2>
          <p
            data-explore-lead
            className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-bone/35 sm:block"
          >
            {topic.gallery.length} frames
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {topic.gallery.map((item, i) => (
            <ImageSlot
              key={item.slot}
              item={item}
              tint={topic.tint}
              accent={topic.accent}
              // The last card runs full width when the count is odd, so the
              // grid closes on a line rather than on a hole.
              className={
                i === topic.gallery.length - 1 && topic.gallery.length % 2 === 1
                  ? 'md:col-span-2'
                  : ''
              }
            />
          ))}
        </div>
      </section>

      {/* ── quote ────────────────────────────────────────────────────────── */}
      {topic.quote ? (
        <section
          data-explore-block
          className="relative overflow-hidden px-5 py-16 sm:px-6 md:px-10 md:py-24"
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
        className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 md:px-10 md:pb-20"
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
        className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 md:px-10 md:pb-20"
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

      {/* ── the rest of the tour ─────────────────────────────────────────── */}
      <footer className="safe-bottom mx-auto max-w-6xl px-5 pb-20 sm:px-6 md:px-10 md:pb-24">
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
