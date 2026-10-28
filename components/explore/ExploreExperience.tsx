'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lock,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import type { ExploreChapter, ExploreTopic } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { requestReturn } from '@/lib/returnStore'
import { RoomSky } from '@/components/site/RoomSky'
import { ClosingCta } from '@/components/site/ClosingCta'
import { melo } from '@/lib/melo/store'

gsap.registerPlugin(ScrollTrigger)

/**
 * A room off the home experience.
 *
 * The page is built from a small kit of distinct sections rather than one
 * repeated block, so a long read keeps changing shape: a statement split for
 * the opening chapter, a framed image beside the middle one, a lit panel for
 * the last, then the room's own card set (a bento grid, a path of steps, or
 * audience cards). Nothing is numbered — every block is named.
 *
 * All motion is skipped under prefers-reduced-motion.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

type Neighbour = { slug: string; word: string; face: string }

/* ── hero media ─────────────────────────────────────────────────────────── */

function HeroMedia({ topic }: { topic: ExploreTopic }) {
  if (topic.video?.youtubeId) {
    return (
      <figure
        data-explore-art
        className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50"
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${topic.video.youtubeId}?rel=0`}
          title={topic.video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="pointer-events-auto absolute inset-0 h-full w-full border-0"
        />
      </figure>
    )
  }

  return (
    <figure
      data-explore-art
      className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 sm:mx-auto lg:mx-0 lg:max-w-none"
      style={{ backgroundImage: `linear-gradient(135deg, ${topic.tint[0]}, ${topic.tint[1]})` }}
    >
      <img src={topic.hero} alt="" className="h-full w-full object-cover opacity-90 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
      <figcaption className="absolute inset-x-6 bottom-6 flex items-center gap-3 md:inset-x-8 md:bottom-8">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: topic.accent, boxShadow: `0 0 0 4px ${topic.accent}33` }}
        />
        <span className="font-display text-lg text-bone">{topic.word}</span>
      </figcaption>
    </figure>
  )
}

/* ── chapters: three different shapes ───────────────────────────────────── */

/** A paragraph short enough to be a closing line is set as one. */
const isCoda = (paragraph: string, i: number, all: string[]) =>
  all.length > 1 && i === all.length - 1 && paragraph.length < 130

function Paragraphs({ chapter, accent }: { chapter: ExploreChapter; accent: string }) {
  return (
    <div className="space-y-5">
      {chapter.paragraphs.map((paragraph, i, all) =>
        isCoda(paragraph, i, all) ? (
          <p
            key={paragraph.slice(0, 24)}
            data-explore-lead
            className="border-l-2 pl-5 font-display text-[clamp(1.15rem,1.8vw,1.4rem)] italic leading-[1.5] text-bone/90"
            style={{ borderColor: accent }}
          >
            {paragraph}
          </p>
        ) : (
          <p
            key={paragraph.slice(0, 24)}
            data-explore-lead
            className="max-w-[62ch] text-[15.5px] leading-[1.85] text-sand/75"
          >
            {paragraph}
          </p>
        ),
      )}
    </div>
  )
}

/** Heading held on the left while the argument runs on the right. */
function StatementChapter({ chapter, accent }: { chapter: ExploreChapter; accent: string }) {
  return (
    <section id={chapter.id} data-explore-block className="room-chapter">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span aria-hidden="true" className="block h-px w-14" style={{ backgroundColor: accent }} />
          <h2
            data-explore-lead
            className="mt-6 text-balance font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium leading-[1.1] text-bone"
          >
            {chapter.heading}
          </h2>
        </div>
        <Paragraphs chapter={chapter} accent={accent} />
      </div>
    </section>
  )
}

/** A framed picture beside the copy. */
function FramedChapter({
  chapter,
  accent,
  tint,
}: {
  chapter: ExploreChapter
  accent: string
  tint: [string, string]
}) {
  return (
    <section id={chapter.id} data-explore-block className="room-chapter">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <figure
          data-explore-item
          className="explore-frame--tilt relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl shadow-black/40"
          style={{ backgroundImage: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})` }}
        >
          {chapter.image ? (
            <img src={chapter.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 mix-blend-luminosity" />
          ) : null}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(200deg, transparent 40%, ${tint[1]}d9)` }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-1 w-1/3"
            style={{ backgroundColor: accent }}
          />
        </figure>
        <div>
          <h2
            data-explore-lead
            className="text-balance font-display text-[clamp(1.7rem,3vw,2.5rem)] font-medium leading-[1.12] text-bone"
          >
            {chapter.heading}
          </h2>
          <div className="mt-6">
            <Paragraphs chapter={chapter} accent={accent} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** A lit, centred panel — the room's conclusion. */
function SpotlightChapter({ chapter, accent }: { chapter: ExploreChapter; accent: string }) {
  return (
    <section id={chapter.id} data-explore-block className="room-chapter">
      <div
        data-explore-item
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-ink/60 px-6 py-12 sm:px-10 md:px-16 md:py-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: `radial-gradient(60% 80% at 50% 0%, ${accent}24, transparent 70%)` }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <h2
            data-explore-lead
            className="text-balance font-display text-[clamp(1.8rem,3.4vw,2.7rem)] font-medium leading-[1.1] text-bone"
          >
            {chapter.heading}
          </h2>
          <div className="mt-7 space-y-5 text-left sm:text-center">
            {chapter.paragraphs.map((paragraph, i, all) =>
              isCoda(paragraph, i, all) ? (
                <p
                  key={paragraph.slice(0, 24)}
                  data-explore-lead
                  className="font-display text-[clamp(1.15rem,1.8vw,1.45rem)] italic leading-[1.5]"
                  style={{ color: accent }}
                >
                  {paragraph}
                </p>
              ) : (
                <p
                  key={paragraph.slice(0, 24)}
                  data-explore-lead
                  className="mx-auto max-w-[64ch] text-[15.5px] leading-[1.85] text-sand/75"
                >
                  {paragraph}
                </p>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Chapter({ chapter, i, count, topic }: { chapter: ExploreChapter; i: number; count: number; topic: ExploreTopic }) {
  if (chapter.image) return <FramedChapter chapter={chapter} accent={topic.accent} tint={topic.tint} />
  if (i === count - 1 && count > 1) return <SpotlightChapter chapter={chapter} accent={topic.accent} />
  return <StatementChapter chapter={chapter} accent={topic.accent} />
}

/* ── highlights: one component per layout ───────────────────────────────── */

const BENTO_ICONS = [UserRound, Lock, Compass, Sparkles]

function Bento({ topic }: { topic: ExploreTopic }) {
  const h = topic.highlights!
  return (
    <section data-explore-block className="room-chapter">
      <h2 data-explore-lead className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-medium text-bone">
        {h.heading}
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {h.items.map((item, i) => {
          const Icon = BENTO_ICONS[i % BENTO_ICONS.length]
          return (
            <li
              key={item.title}
              data-explore-item
              className="bento-card group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink/55 p-7 md:p-8"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${topic.accent}1c`, color: topic.accent }}
              >
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <h3 className="mt-6 font-display text-[1.4rem] leading-snug text-bone">{item.title}</h3>
              <p className="mt-3 max-w-[40ch] text-[14.5px] leading-[1.75] text-sand/70">{item.body}</p>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                style={{ backgroundColor: `${topic.accent}2e` }}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** A path, not a list of numbers: the order is carried by the line itself. */
function Steps({ topic }: { topic: ExploreTopic }) {
  const h = topic.highlights!
  return (
    <section data-explore-block className="room-chapter">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 data-explore-lead className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-medium leading-[1.1] text-bone">
            {h.heading}
          </h2>
        </div>
        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[11px] top-3 w-px"
            style={{ background: `linear-gradient(${topic.accent}, ${topic.accent}10)` }}
          />
          {h.items.map((item, i) => (
            <li key={item.title} data-explore-item className="relative pb-10 pl-12 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-abyss"
                style={{ borderColor: topic.accent }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: i === h.items.length - 1 ? topic.accent : `${topic.accent}80` }}
                />
              </span>
              <div className="rounded-[1.25rem] border border-white/10 bg-ink/50 p-6 md:p-7">
                <h3 className="font-display text-[1.35rem] leading-snug text-bone">{item.title}</h3>
                <p className="mt-3 text-[14.5px] leading-[1.75] text-sand/70">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const AUDIENCE_ICONS = [BriefcaseBusiness, GraduationCap, Stethoscope]

function Audiences({ topic }: { topic: ExploreTopic }) {
  const h = topic.highlights!
  return (
    <section data-explore-block className="room-chapter">
      <h2 data-explore-lead className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-medium text-bone">
        {h.heading}
      </h2>
      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        {h.items.map((item, i) => {
          const Icon = AUDIENCE_ICONS[i % AUDIENCE_ICONS.length]
          return (
            <li
              key={item.title}
              id={item.id}
              data-explore-item
              className="audience-card group relative flex scroll-mt-32 flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink/55 p-7 md:p-8"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full border"
                style={{ borderColor: `${topic.accent}55`, color: topic.accent }}
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <h3 className="mt-7 font-display text-[1.5rem] leading-snug text-bone">{item.title}</h3>
              <p className="mt-3 flex-1 text-[14.5px] leading-[1.75] text-sand/70">{item.body}</p>
              <Link
                href="/contact"
                {...hoverable}
                className="mt-8 inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2.5 text-[13px] font-medium text-bone/85 transition-colors hover:border-ember hover:text-ember"
              >
                Book a demo
                <ArrowUpRight size={14} />
              </Link>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ backgroundColor: topic.accent }}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ── the page ───────────────────────────────────────────────────────────── */

export function ExploreExperience({
  topic,
  next,
  prev,
}: {
  topic: ExploreTopic
  next: Neighbour
  prev: Neighbour
}) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const [activeChapter, setActiveChapter] = useState(topic.chapters[0]?.id)

  useGSAP(
    () => {
      const page = root.current
      if (!page) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Phones skip the reveal: a viewport that resizes under the reader
      // (collapsing address bar, late fonts) can leave a trigger stale and a
      // block stuck invisible.
      const skipReveal = window.matchMedia('(max-width: 1023px)').matches
      const triggers: ScrollTrigger[] = []

      // One trigger drives both the progress bar and the chapter strip.
      let bounds: { id: string; top: number }[] = []
      let shown = topic.chapters[0]?.id

      const measure = () => {
        const top = window.scrollY
        bounds = topic.chapters
          .map((chapter) => {
            const node = page.querySelector<HTMLElement>(`#${chapter.id}`)
            return node ? { id: chapter.id, top: node.getBoundingClientRect().top + top } : null
          })
          .filter((entry): entry is { id: string; top: number } => entry !== null)
      }

      triggers.push(
        ScrollTrigger.create({
          trigger: page,
          start: 'top top',
          end: 'bottom bottom',
          onRefresh: measure,
          onUpdate: (self) => {
            if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`
            const line = window.scrollY + window.innerHeight * 0.45
            let reading: string | null = null
            for (const entry of bounds) if (entry.top <= line) reading = entry.id
            const active = reading ?? bounds[0]?.id
            if (active && active !== shown) {
              shown = active
              setActiveChapter(active)
            }
            melo.setChapter(reading)
          },
        }),
      )

      const art = page.querySelector<HTMLElement>('[data-explore-art] img')
      if (art) {
        gsap.to(art, {
          yPercent: -10,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
        })
      }

      const cleanup = () => {
        triggers.forEach((trigger) => trigger.kill())
        melo.setChapter(null)
      }
      if (skipReveal) return cleanup

      gsap.utils.toArray<HTMLElement>('[data-explore-block]').forEach((block) => {
        const items = block.querySelectorAll<HTMLElement>('[data-explore-item]')
        // toggleActions rather than `once`: a trigger that kills itself during
        // another's refresh splices ScrollTrigger's list mid-iteration.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: block, start: 'top 82%', toggleActions: 'play none none none' },
        })
        const leads = block.querySelectorAll('[data-explore-lead]')
        if (leads.length) {
          tl.from(leads, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 })
        }
        if (items.length) {
          tl.from(
            items,
            { y: 40, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 },
            leads.length ? '-=0.55' : 0,
          )
        }
      })

      return cleanup
    },
    { scope: root, dependencies: [topic.slug] },
  )

  const highlights = topic.highlights
  const lede = Array.isArray(topic.lede) ? topic.lede : [topic.lede]
  const firstAnchor = topic.chapters[0]?.id ?? (highlights ? 'room-highlights' : undefined)

  return (
    <div ref={root} className="pointer-events-auto relative isolate bg-abyss">
      {/* Reading progress, just under the fixed header. */}
      <div className="pointer-events-none fixed inset-x-0 top-[4.6rem] z-[31] h-px bg-white/10">
        <div ref={progress} className="h-full origin-left scale-x-0" style={{ backgroundColor: topic.accent }} />
      </div>

      <RoomSky sky={topic.tint} accent={topic.accent} />

      {/* ── hero ─────────────────────────────────────────────────────── */}
      <header data-explore-hero className="room-section room-hero relative pb-[var(--room-rhythm)]">
        <div className="mx-auto max-w-6xl">
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-wrap items-center gap-2 text-[13px] text-bone/55"
          >
            <Link href="/explore" {...hoverable} className="transition-colors hover:text-ember">
              Explore
            </Link>
            <span aria-hidden="true" className="text-bone/25">/</span>
            <span className="text-bone/85">{topic.word}</span>
          </motion.nav>

          <div className={`mt-8 grid gap-10 md:mt-12 lg:items-center lg:gap-16 ${topic.video?.youtubeId ? 'lg:grid-cols-[1fr_1.1fr]' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}>
            <div data-tour="room-intro">
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

              {topic.eyebrow !== topic.word ? (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                  className="text-[15px] font-medium text-ember-soft"
                >
                  {topic.eyebrow}
                </motion.p>
              ) : null}

              <motion.h1
                initial={{ opacity: 0, y: 36, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                className="mt-4 text-balance font-display text-[clamp(2.2rem,4.8vw,3.8rem)] font-semibold leading-[1.05] text-bone"
              >
                {topic.title}
              </motion.h1>

              <div className="mt-7 max-w-[54ch] space-y-4">
                {lede.map((paragraph, i) => (
                  <motion.p
                    key={paragraph.slice(0, 24)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.32 + i * 0.08 }}
                    className="text-[15.5px] leading-[1.85] text-sand/75"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link href="/contact" {...hoverable} className="btn-primary group">
                  Book a demo
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                {firstAnchor ? (
                  <a href={`#${firstAnchor}`} {...hoverable} className="btn-ghost group">
                    {topic.readMoreLabel ?? 'Keep Reading'}
                    <ArrowRight size={14} className="rotate-90 transition-transform group-hover:translate-y-0.5" />
                  </a>
                ) : null}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 36, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
            >
              <HeroMedia topic={topic} />
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── in this room ─────────────────────────────────────────────── */}
      {topic.chapters.length > 0 ? (
        <nav
          aria-label="In this room"
          data-tour="room-chapters"
          className="room-strip-wrap sticky top-[5.4rem] z-[25] mx-auto"
        >
          <div className="room-strip flex items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-abyss/80 p-1.5 backdrop-blur-md">
            {topic.chapters.map((chapter) => {
              const active = chapter.id === activeChapter
              return (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  {...hoverable}
                  aria-current={active ? 'true' : undefined}
                  className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-500"
                  style={{
                    color: active ? 'var(--color-ink)' : 'rgba(244,243,236,0.62)',
                    backgroundColor: active ? topic.accent : 'transparent',
                  }}
                >
                  {chapter.navLabel ?? chapter.heading}
                </a>
              )
            })}
          </div>
        </nav>
      ) : null}

      {/* ── chapters and cards ───────────────────────────────────────── */}
      <div className="room-section mx-auto max-w-6xl">
        {topic.chapters.map((chapter, i) => (
          <Chapter key={chapter.id} chapter={chapter} i={i} count={topic.chapters.length} topic={topic} />
        ))}

        {highlights ? (
          <div id="room-highlights" className="scroll-mt-32">
            {highlights.layout === 'bento' ? <Bento topic={topic} /> : null}
            {highlights.layout === 'steps' ? <Steps topic={topic} /> : null}
            {highlights.layout === 'audiences' ? <Audiences topic={topic} /> : null}
          </div>
        ) : null}
      </div>

      {/* ── quote ────────────────────────────────────────────────────── */}
      {topic.quote ? (
        <section data-explore-block data-melo-cue="quote" className="room-section room-band relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: `radial-gradient(50% 70% at 50% 50%, ${topic.accent}18, transparent 72%)` }}
          />
          <figure className="mx-auto max-w-3xl text-center">
            <HeartHandshake aria-hidden="true" size={26} strokeWidth={1.4} className="mx-auto" style={{ color: topic.accent }} />
            <blockquote
              data-explore-lead
              className="mt-6 text-balance font-display text-[clamp(1.6rem,3.4vw,2.7rem)] italic leading-[1.3] text-bone/90"
            >
              {topic.quote}
            </blockquote>
          </figure>
        </section>
      ) : null}

      {/* ── keep exploring ───────────────────────────────────────────── */}
      <section data-explore-block className="room-section">
        <div className="flex flex-col gap-5 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <h2 data-explore-lead className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] text-bone">
            Keep exploring
          </h2>
          <ul className="flex flex-wrap gap-3">
            {topic.deeper.map((link) => (
              <li key={link.href} data-explore-item>
                <Link
                  href={link.href}
                  {...hoverable}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-[14px] font-medium text-bone/85 transition-colors hover:border-ember hover:text-ember"
                >
                  {link.label}
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── closing ──────────────────────────────────────────────────── */}
      <div className="room-section">
        <ClosingCta accent={topic.accent} tint={topic.tint} />
      </div>

      {/* ── the rest of the tour ─────────────────────────────────────── */}
      <footer className="room-section room-section--end safe-bottom">
        <div data-tour="room-next" data-melo-cue="end" className="grid gap-4 sm:grid-cols-2">
          {[
            { n: prev, label: 'Previous room', dir: 'prev' as const },
            { n: next, label: 'Next room', dir: 'next' as const },
          ].map(({ n, label, dir }) => (
            <Link
              key={dir}
              href={`/explore/${n.slug}`}
              {...hoverable}
              className={`group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/40 p-5 transition-colors hover:border-white/25 md:p-6 ${
                dir === 'next' ? 'sm:flex-row-reverse sm:text-right' : ''
              }`}
            >
              <img
                src={n.face}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-full border border-white/15 object-cover transition-transform group-hover:scale-105 md:h-14 md:w-14"
              />
              <span className="min-w-0">
                <span className="block text-[13px] text-bone/45">{label}</span>
                <span className="mt-1 block font-display text-xl text-bone transition-colors group-hover:text-ember md:text-2xl">
                  {n.word}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="page-end mt-6">
          <Link href="/" onClick={requestReturn} {...hoverable} className="end-btn group">
            <ArrowLeft size={15} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            Back to the experience
          </Link>
          <Link href="/explore" {...hoverable} className="end-btn group">
            All rooms
            <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
