'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CLOSING } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The block every sub page closes on.
 *
 * One component so the call to action reads the same everywhere: the Let's
 * Talk heading and body from the content document, and one button. The glow
 * takes the page's own accent, so it still belongs to the room it sits in.
 */
export function ClosingCta({
  accent = '#ff7901',
  tint = ['#9f6021', '#311c08'],
  className = '',
}: {
  accent?: string
  tint?: [string, string]
  className?: string
}) {
  return (
    <section data-explore-block className={className}>
      <div
        data-explore-item
        className="closing-cta relative isolate overflow-hidden rounded-[2rem] border border-white/12 px-6 py-14 sm:px-10 md:px-16 md:py-20"
        style={{ backgroundImage: `linear-gradient(150deg, ${tint[0]}, ${tint[1]})` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}33` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="grid gap-10 md:grid-cols-[1.2fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[18ch] text-balance font-display text-[clamp(1.9rem,4vw,3.2rem)] font-semibold leading-[1.08] text-bone">
              {CLOSING.heading}
            </h2>
            <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.8] text-sand/75">
              {CLOSING.body}
            </p>
          </div>
          <Link
            href="/contact"
            onMouseEnter={() => setCursor({ active: true })}
            onMouseLeave={resetCursor}
            className="btn-primary group justify-center self-start md:self-end"
          >
            {CLOSING.action}
            <ArrowUpRight
              size={14}
              className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
