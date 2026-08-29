import Link from 'next/link'
import type { ReactNode } from 'react'
import { PageFade } from './PageFade'

/**
 * Shell for every non-home route.
 *
 * The background must be opaque: the persistent canvas is still mounted behind
 * these pages (deliberately — it survives navigation so the card transition can
 * animate across it), and a transparent page would let the 3D scene show
 * through the copy.
 */
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string
  children: ReactNode
}) {
  return (
    <PageFade>
      <article className="pointer-events-auto min-h-svh bg-void px-6 pt-32 pb-28 md:px-10">
        <header className="mx-auto max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-6 text-balance text-[clamp(2.2rem,5.5vw,4.25rem)] text-bone">
            {title}
          </h1>
          {lede ? (
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-sand/75">
              {lede}
            </p>
          ) : null}
        </header>

        <div className="mx-auto mt-20 max-w-4xl">{children}</div>

        <footer className="mx-auto mt-24 flex max-w-4xl items-center justify-between border-t border-bone/12 pt-8">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/55 transition-colors hover:text-lime"
          >
            &larr; Back to the experience
          </Link>
          <Link
            href="/contact"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/55 transition-colors hover:text-lime"
          >
            Book a Demo &rarr;
          </Link>
        </footer>
      </article>
    </PageFade>
  )
}

/** Anchored section used for the in-page targets the cards deep-link to. */
export function Beat({
  id,
  heading,
  children,
}: {
  id?: string
  heading: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 border-t border-bone/12 py-14 first:border-0 first:pt-0"
    >
      <h2 className="display text-[clamp(1.7rem,3.4vw,2.75rem)] text-bone">
        {heading}
      </h2>
      <div className="mt-6 space-y-5 leading-relaxed text-sand/75">
        {children}
      </div>
    </section>
  )
}

/** Three-up tile row, used for pillars and credibility statements. */
export function Tiles({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-lg border border-bone/12 bg-ink/60 p-6"
        >
          <h3 className="font-display text-xl text-bone">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand/70">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  )
}
