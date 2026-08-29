'use client'

import Link from 'next/link'
import { CARDS } from '@/lib/cards'

/**
 * The non-3D home page: served when the visitor has asked for reduced motion or
 * the browser can't give us a WebGL context. Same copy, same six destinations,
 * no orbit — a real page rather than a degraded one.
 *
 * Card artwork is intentionally not loaded here; the tint gradient stands in, so
 * a missing /cards/*.jpg can't produce a grid of broken images.
 */
export function StaticHome() {
  return (
    <div className="pointer-events-auto min-h-svh bg-void px-6 pt-32 pb-24 md:px-10">
      <section className="mx-auto max-w-5xl">
        <p className="eyebrow mb-6">Workplace wellbeing, reimagined</p>
        <h1 className="display text-balance text-[clamp(2.4rem,6vw,4.75rem)] text-bone">
          Help shouldn&rsquo;t cost you your privacy.
        </h1>
        <p className="serif-accent mt-5 text-2xl text-sand/80">
          It&rsquo;s helping people feel safe enough to use it.
        </p>
        <p className="mt-8 max-w-2xl leading-relaxed text-sand/70">
          NEXR helps organisations remove the invisible barriers that stop
          employees from seeking support &mdash; through a connected workplace
          wellbeing ecosystem built around privacy, accessibility and immersive
          care.
        </p>
        <Link href="/contact" className="btn mt-10">
          Book a Demo
        </Link>
      </section>

      <section className="mx-auto mt-24 max-w-5xl">
        <h2 className="display text-[clamp(1.6rem,3vw,2.5rem)] text-bone">
          Different ways in. One way forward.
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <li key={card.id}>
              <Link
                href={card.route}
                className="group block h-full rounded-lg border border-bone/12 p-6 transition-colors hover:border-lime/60"
                style={{
                  backgroundImage: `linear-gradient(150deg, ${card.tint[0]}, ${card.tint[1]})`,
                }}
              >
                <p className="eyebrow">{card.eyebrow}</p>
                <h3 className="mt-4 font-display text-2xl text-bone">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand/70">
                  {card.blurb}
                </p>
                <span className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors group-hover:text-lime">
                  Open &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
