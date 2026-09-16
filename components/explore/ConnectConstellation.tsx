'use client'

import { useState } from 'react'
import { SOCIAL_LINKS } from '@/components/ui/SocialIcons'
import { SocialParticles } from '@/components/ui/SocialParticles'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The closing block of the Let's Talk room: pick a place to carry on.
 *
 * The particle field is a 2D canvas, deliberately, and it is worth saying why
 * given there is a GPU particle system sitting in `particles-archive/`. That
 * one samples points off a 3D mesh surface and simulates them in shaders — it
 * exists to dissolve the character, and it is 2,500 lines and a WebGL context.
 * Pointing it at four small icons would be several megabytes and a second
 * renderer to produce an effect a canvas does in eighty lines. The site is
 * already heavy; this is the version that does not make it heavier.
 *
 * Each tile lights its own field on hover, so the embers gather around whatever
 * the pointer is near rather than the whole block reacting at once.
 */
export function ConnectConstellation({ accent }: { accent: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="w-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Connect with us
      </p>

      <h2 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.12] text-bone">
        Carry on wherever you already are.
      </h2>

      <p className="mt-4 max-w-xl text-[14px] leading-[1.8] text-bone/60">
        The work is easier to follow than to summarise. We post what we are
        building, what the research says, and what we get wrong.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              onMouseEnter={() => {
                setHovered(id)
                setCursor({ active: true })
              }}
              onMouseLeave={() => {
                setHovered(null)
                resetCursor()
              }}
              className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-ink/50 p-5 transition-colors duration-500 hover:border-white/25"
            >
              {/* Only the hovered tile runs a field. Four canvases all
                  animating at once is four requestAnimationFrame loops for an
                  effect only one of them is showing. */}
              {hovered === id ? <SocialParticles accent={accent} /> : null}

              <span
                className="relative text-bone/50 transition-colors duration-500 group-hover:text-bone"
                style={hovered === id ? { color: accent } : undefined}
              >
                <Icon size={22} />
              </span>

              <span className="relative flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70">
                  {label}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] text-bone/30 transition-all duration-500 group-hover:translate-x-1 group-hover:text-bone/70"
                >
                  &rarr;
                </span>
              </span>

              <span
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ backgroundColor: accent }}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
