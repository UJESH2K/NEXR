'use client'

import Link from 'next/link'
import { CARDS } from '@/lib/cards'
import { SECTIONS } from '@/lib/sections'

/**
 * The non-3D home page: served when the visitor has asked for reduced motion or
 * the browser can't give us a WebGL context.
 *
 * It carries the same script as the scene, in the same order — hero, problem,
 * belief, ecosystem, products, audience, credibility, call to action — so the
 * two versions of the page say the same thing. Only the delivery differs, which
 * is the difference between a fallback and a downgrade.
 *
 * Card artwork is intentionally not loaded here; the tint gradient stands in, so
 * a missing image can't produce a grid of broken pictures.
 */

const CREDIBILITY = [
  'Developed with mental health professionals.',
  'Tested in clinical practice.',
  'Designed for the realities of modern workplaces.',
]

export function StaticHome() {
  return (
    <div className="safe-bottom pointer-events-auto min-h-svh bg-void px-5 pb-20 pt-28 sm:px-6 md:px-10 md:pb-24 md:pt-32">
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <h1 className="display text-balance text-[clamp(2.4rem,6vw,4.75rem)] text-bone">
          Workplace wellbeing, reimagined.
        </h1>
        <div>
          <p className="text-lg leading-relaxed text-sand/75">
            The future of workplace wellbeing isn&rsquo;t one-size-fits-all.
          </p>
          <p className="serif-accent mt-2 text-2xl text-ember/90">
            It&rsquo;s private. Immersive. Personal.
          </p>
          <Link href="/contact" className="btn mt-8">
            Book a Demo
          </Link>
        </div>
      </section>

      {/* ── the problem ──────────────────────────────────────────────────── */}
      <section className="mx-auto mt-28 max-w-5xl border-t border-white/10 pt-14">
        <p className="text-xl text-sand/70">
          The barrier isn&rsquo;t always the support.
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,5vw,3.6rem)] text-bone">
          It&rsquo;s the way in.
        </h2>
        <p className="mt-8 max-w-2xl leading-relaxed text-sand/70">
          Organisations today invest more in employee wellbeing than ever before.
          Yet burnout continues to rise, wellbeing programmes remain underused,
          and many employees hesitate to seek support because of stigma, fear of
          judgement or concerns around privacy.
        </p>
        <Link
          href="/explore/gap"
          className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-ember"
        >
          Explore the gap &rarr;
        </Link>
      </section>

      {/* ── the belief ───────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl border-t border-white/10 pt-14">
        <h2 className="display text-[clamp(1.8rem,4vw,3rem)] text-bone">
          Stop making people fit wellbeing.
          <br />
          Make wellbeing fit people.
        </h2>
        <p className="mt-8 max-w-2xl leading-relaxed text-sand/70">
          At NEXR, we believe workplace wellbeing should feel natural, private
          and engaging. When support is designed around people instead of
          processes, organisations create healthier cultures and employees are
          more likely to begin their wellbeing journey.
        </p>
        <Link
          href="/explore/belief"
          className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-ember"
        >
          Explore our belief &rarr;
        </Link>
      </section>

      {/* ── the ecosystem, and the six rooms ─────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl border-t border-white/10 pt-14">
        <h2 className="display text-[clamp(1.6rem,3vw,2.5rem)] text-bone">
          Different ways in. One way forward.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-sand/70">
          MeloWorld creates a private, anonymous space where employees can take
          their first step towards support comfortably. VR Wellness offers
          immersive, guided experiences that help people work through challenges
          and build resilience at their own pace. Together, they offer one
          connected wellbeing ecosystem designed for modern workplaces.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <li key={card.id}>
              <Link
                href={card.route}
                className="group block h-full rounded-lg border border-bone/12 p-6 transition-colors hover:border-ember/60"
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
                <span className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors group-hover:text-ember">
                  Explore &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── audience ─────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl border-t border-white/10 pt-14">
        <h2 className="display text-[clamp(1.6rem,3vw,2.5rem)] text-bone">
          Creating psychologically safer workplaces.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-sand/70">
          Whether you&rsquo;re supporting employees across an enterprise or
          students within an educational institution, NEXR helps create
          psychologically safer environments where wellbeing becomes
          approachable, engaging and accessible.
        </p>
      </section>

      {/* ── credibility ──────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl border-t border-white/10 pt-14">
        <h2 className="display text-[clamp(1.6rem,3vw,2.5rem)] text-bone">
          Where clinical expertise meets immersive technology.
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {CREDIBILITY.map((line) => (
            <li
              key={line}
              className="rounded-xl border border-bone/12 bg-ink/50 p-6 text-sm leading-relaxed text-sand/75"
            >
              {line}
            </li>
          ))}
        </ul>
        <Link
          href="/explore/clinical"
          className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-ember"
        >
          Explore the evidence &rarr;
        </Link>
      </section>

      {/* ── call to action ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 grid max-w-5xl gap-8 border-t border-white/10 pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <h2 className="display text-[clamp(1.9rem,4.4vw,3.2rem)] text-bone">
            The next way into wellbeing starts here.
          </h2>
          <Link href="/contact" className="btn mt-9">
            Book a Demo
          </Link>
        </div>
        <p className="serif-accent text-lg leading-relaxed text-sand/70">
          &lsquo;Healthier organisations begin with people who feel safe enough
          to seek support.&rsquo;
        </p>
      </section>

      <p className="mx-auto mt-16 max-w-5xl">
        <Link
          href="/explore"
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45 transition-colors hover:text-ember"
        >
          Explore all six rooms &rarr;
        </Link>
      </p>

      {/* Kept so the section copy and the fallback never drift apart: if a beat
          is renamed in lib/sections.ts, this list changes with it. */}
      <p className="sr-only">
        {SECTIONS.map((section) => section.word).join(', ')}
      </p>
    </div>
  )
}
