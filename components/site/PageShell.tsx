import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { PageFade } from './PageFade'
import { GsapRouteMotion } from './GsapRouteMotion'

const ROUTE_ART: Record<string, string> = {
  'Our Approach': '/models/imgs/OurApproach.webp',
  MeloWorld: '/models/imgs/meloworld.webp',
  'VR Wellness': '/models/imgs/vrworld.webp',
  'Trust Centre': '/models/imgs/clinicallygrounded.webp',
  Contact: '/models/imgs/letsconnect.webp',
}

const ROUTE_TINTS: Record<string, [string, string]> = {
  'Our Approach': ['#3b4426', '#0d0f0a'],
  MeloWorld: ['#52665a', '#101815'],
  'VR Wellness': ['#4a4270', '#0e0c17'],
  'Trust Centre': ['#1f3a3a', '#080e0e'],
  Contact: ['#6b7a2e', '#12150a'],
}

export function PageShell({
  eyebrow,
  title,
  lede,
  /** Optional product mark drawn above the title, e.g. MeloWorld's. */
  mark,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string
  mark?: string
  children: ReactNode
}) {
  const tints = ROUTE_TINTS[title] ?? ['#2a2f26', '#0b0d0a']

  return (
    <PageFade>
      <GsapRouteMotion>
      <article className="pointer-events-auto min-h-svh overflow-hidden bg-void px-6 pb-28 pt-32 md:px-10">
        <header className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-16 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p data-route-eyebrow className="eyebrow">{eyebrow}</p>
          <div>
            {mark ? (
              <Image
                data-route-mark
                src={mark}
                alt=""
                width={96}
                height={70}
                className="mb-6 h-14 w-auto"
              />
            ) : null}
            <h1 data-route-title className="display text-balance text-[clamp(2.7rem,7vw,6.8rem)] text-bone">{title}</h1>
            {lede ? <p data-route-lede className="mt-8 max-w-2xl text-lg leading-relaxed text-sand/75 md:text-xl">{lede}</p> : null}
          </div>
        </header>

        {/* Hero media card with gradient fallback when no image */}
        <div
          data-route-media
          className="relative mx-auto mt-10 aspect-[2.2/1] max-w-6xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
          style={{
            backgroundImage: `linear-gradient(135deg, ${tints[0]}, ${tints[1]})`,
          }}
        >
          {ROUTE_ART[title] ? (
            <Image
              src={ROUTE_ART[title]}
              alt=""
              fill
              priority
              className="object-cover opacity-60 mix-blend-luminosity"
              sizes="(min-width: 1024px) 1200px, 100vw"
            />
          ) : null}
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/20 to-void/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Corner accent line */}
          <div className="absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-ember/50 to-transparent" />
          <div className="absolute bottom-0 left-0 h-1/3 w-px bg-gradient-to-t from-ember/50 to-transparent" />
          <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.25em] text-ember/80 md:bottom-8 md:left-8">
            NEXR / {title}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">{children}</div>

        <footer className="mx-auto mt-24 flex max-w-4xl items-center justify-between border-t border-bone/12 pt-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/55 transition-colors hover:text-ember"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
            Back to the experience
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/55 transition-colors hover:text-ember"
          >
            Book a Demo
            <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </footer>
      </article>
      </GsapRouteMotion>
    </PageFade>
  )
}

/** Anchored section used for the in-page targets the cards deep-link to. */
export function Beat({
  id,
  heading,
  accent,
  children,
}: {
  id?: string
  heading: string
  accent?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-route-beat
      className="scroll-mt-32 border-t border-bone/12 py-14 first:border-0 first:pt-0"
    >
      <h2 data-beat-heading className="display text-[clamp(1.7rem,3.4vw,2.75rem)] text-bone">
        {heading}
      </h2>
      {accent ? (
        <p data-beat-accent className="mt-4 font-display text-xl italic text-ember/90">
          {accent}
        </p>
      ) : null}
      <div data-beat-body className="mt-6 space-y-5 leading-relaxed text-sand/75">
        {children}
      </div>
    </section>
  )
}

/** Three-up tile row, used for pillars and credibility statements. */
export function Tiles({ items }: { items: { title: string; body: string; icon?: string }[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.title}
          data-beat-item
          className="group rounded-lg border border-bone/12 bg-ink/60 p-6 transition-all duration-500 hover:border-ember/30 hover:bg-ink/80 hover:shadow-lg hover:shadow-ember/5"
        >
          {item.icon ? (
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember">
              <span className="text-lg">{item.icon}</span>
            </div>
          ) : null}
          <h3 className="font-display text-xl text-bone transition-colors group-hover:text-ember">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand/70">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** Stats row with animated numbers */
export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          data-beat-item
          className="text-center"
        >
          <p className="numeral numeral--lg text-4xl md:text-5xl">{item.value}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sand/60">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

/** Image placeholder card — renders a styled gradient card where an image would go */
export function ImagePlaceholder({
  label,
  tint = ['#2a2f26', '#0b0d0a'],
  aspect = '16/9',
  className = '',
}: {
  label?: string
  tint?: [string, string]
  aspect?: string
  className?: string
}) {
  return (
    <div
      data-beat-item
      className={`relative overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{
        aspectRatio: aspect,
        backgroundImage: `linear-gradient(135deg, ${tint[0]}, ${tint[1]})`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-void/50 to-transparent" />
      {label ? (
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember/60">{label}</p>
        </div>
      ) : null}
      {/* Image icon placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="h-12 w-12 text-bone/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  )
}

/** Process/step card with number */
export function StepCard({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <div data-beat-item className="relative flex gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ember/30">
        <span className="numeral text-lg">{number}</span>
      </div>
      <div>
        <h3 className="font-display text-xl text-bone">{title}</h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-sand/70">
          {children}
        </div>
      </div>
    </div>
  )
}
