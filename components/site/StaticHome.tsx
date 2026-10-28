'use client'

import Link from 'next/link'
import { SECTIONS } from '@/lib/sections'

/**
 * The non-3D home page: served when the visitor has asked for reduced motion or
 * the browser can't give us a WebGL context.
 *
 * It is rendered straight from `SECTIONS`, the same array the scene reads, so
 * the two versions of the page cannot say different things. The copy used to be
 * written out here by hand and had drifted several beats behind the scene by
 * the time anyone noticed, which is the whole argument for driving it from the
 * data: only the delivery differs, which is the difference between a fallback
 * and a downgrade.
 *
 * Like the scene, it opens on beat 01 — there is no separate title frame.
 *
 * Panel artwork is intentionally not loaded here; the beat's own sky gradient
 * stands in, so a missing image can't produce a column of broken pictures.
 */
export function StaticHome() {
  return (
    <div className="safe-bottom pointer-events-auto min-h-svh bg-void px-5 pb-20 pt-28 sm:px-6 md:px-10 md:pb-24 md:pt-32">
      {SECTIONS.map((section, i) => {
        const Heading = i === 0 ? 'h1' : 'h2'

        return (
          <section
            key={section.id}
            className={
              i === 0
                ? 'mx-auto max-w-5xl'
                : 'mx-auto mt-24 max-w-5xl border-t border-white/10 pt-14'
            }
          >
            <p className="eyebrow">
              {section.word}
            </p>

            {section.kicker ? (
              <p className="mt-5 text-xl leading-relaxed text-sand/70">
                {section.kicker}
              </p>
            ) : null}

            <Heading
              className={`display mt-3 text-balance text-bone ${
                i === 0
                  ? 'text-[clamp(2.2rem,6vw,4.25rem)]'
                  : 'text-[clamp(1.8rem,4.6vw,3.2rem)]'
              }`}
            >
              {section.headline}
            </Heading>

            <p className="mt-7 max-w-2xl leading-relaxed text-sand/70">
              {section.body}
            </p>

            {/* The three audiences, on the beat that carries them. Plain
                cards rather than the scene's hover rows: there is no pointer
                choreography to preserve here, only the three doors. */}
            {section.tiles ? (
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {section.tiles.map((tile) => (
                  <li key={tile.title}>
                    <Link
                      href={tile.href}
                      className="group block h-full rounded-lg border border-bone/12 p-6 transition-colors hover:border-ember/60"
                      style={{
                        backgroundImage: `linear-gradient(150deg, ${section.sky[1]}, ${section.sky[0]})`,
                      }}
                    >
                      <h3 className="font-display text-2xl text-bone">
                        {tile.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-sand/75">
                        {tile.body}
                      </p>
                      <span className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors group-hover:text-ember">
                        Explore &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* The closing beat's call to action is the page's primary one, so
                it gets the filled button; the rest are quiet text links, the
                same hierarchy the scene uses. */}
            <Link
              href={section.cta.route}
              className={
                i === SECTIONS.length - 1
                  ? 'btn mt-9'
                  : 'mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-ember'
              }
            >
              {section.cta.label}
              {i === SECTIONS.length - 1 ? null : <> &rarr;</>}
            </Link>
          </section>
        )
      })}
    </div>
  )
}
