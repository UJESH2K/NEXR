'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowUp, ArrowUpRight, Mail } from 'lucide-react'

import { CONTACT_EMAIL } from '@/lib/contact'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer'

/**
 * The end of every interior page.
 *
 * Two parts, stacked, never overlapping:
 *
 *   1. **The map.** Brand, contact and the demo button on the left; three
 *      columns of real routes on the right; then a hairline with the legal
 *      line and a way back to the top. Every label is a route name — nothing
 *      here is marketing copy except the home page's own headline under the
 *      mark.
 *
 *   2. **The signature.** NEXR set enormous and printed as halftone dots,
 *      cropped by the bottom edge of the page (components/ui/
 *      halftone-wordmark-footer). The dots part around the pointer and warm to
 *      ember as they are pushed; a click sends a ring through the word. It has
 *      its own band, so the word can be big without ever sitting under a link.
 *
 * **Not on the home route.** `/` is a full-bleed 3D room with its own scroll
 * driver and its own ending; a footer under it would either be unreachable or
 * cut the scene in half. Every other route scrolls normally and ends here.
 */

const ROOMS = [
  { label: 'The Gap', href: '/explore/gap' },
  { label: 'Belief', href: '/explore/belief' },
  { label: 'MeloWorld', href: '/explore/meloworld' },
  { label: 'VR Wellness', href: '/explore/vr-wellness' },
]

const COMPANY = [
  { label: 'Explore', href: '/explore' },
  { label: 'Our Approach', href: '/approach' },
  { label: 'Trust', href: '/trust' },
  { label: 'Let’s Talk', href: '/contact' },
]

const AUDIENCES = [
  { label: 'Workplaces', href: '/explore/vr-wellness#workplaces' },
  { label: 'Educational Institutions', href: '/explore/vr-wellness#education' },
  { label: 'Healthcare Providers', href: '/explore/vr-wellness#healthcare' },
]

/** The footer's own ground — the halftone band is painted to match it. */
const FOOTER_BG = '#0d0806'

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

function Column({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-ember-soft/80">
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ember" />
        {heading}
      </h2>
      <ul className="mt-6 space-y-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              {...hoverable}
              className="footer-link group inline-flex items-center gap-1.5 text-[14.5px] leading-[1.45] text-sand/70 transition-colors duration-300 hover:text-bone"
            >
              <span>{link.label}</span>
              <ArrowUpRight
                aria-hidden="true"
                size={13}
                className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-ember group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The canvas sets the word in whatever face it is handed by name, and the
 * site's display face (Playfair, via next/font) has a generated family name.
 * Read it off the custom property once the page is up.
 */
function useDisplayFamily() {
  const [family, setFamily] = useState('Georgia, "Times New Roman", serif')
  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--font-playfair').trim()
    if (value) setFamily(`${value}, Georgia, serif`)
  }, [])
  return family
}

/** Smaller dots on a phone, so the word keeps enough rows to read. */
function useDotGap() {
  const [gap, setGap] = useState(6)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const apply = () => setGap(query.matches ? 4 : 6)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])
  return gap
}

export function SiteFooter() {
  const pathname = usePathname()
  const family = useDisplayFamily()
  const dotGap = useDotGap()
  if (pathname === '/') return null

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer
      // pointer-events: the layout's <main> is transparent to clicks so the 3D
      // scene underneath it stays usable on the home route, and anything that
      // wants a cursor has to opt back in.
      className="pointer-events-auto relative isolate overflow-hidden border-t border-white/10"
      style={{ zIndex: 'var(--z-page)', backgroundColor: FOOTER_BG }}
    >
      {/* A warm glow rising from the word, so the top half is not flat black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{ background: 'radial-gradient(60% 70% at 50% 100%, rgb(255 121 1 / 0.10), transparent 70%)' }}
      />

      {/* ── the map ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-20 sm:px-6 md:px-10 md:pb-14 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_2fr] lg:gap-20">
          <div>
            <Link href="/" {...hoverable} aria-label="NEXR home" className="group inline-flex items-center gap-4">
              <Image
                src="/brand/meloworld-mark.webp"
                alt=""
                width={192}
                height={139}
                className="h-10 w-auto transition-transform duration-500 group-hover:-rotate-6"
              />
              <span className="font-display text-xl uppercase leading-none tracking-[0.34em] text-bone">Nexr</span>
            </Link>

            <p className="mt-7 max-w-[24ch] font-display text-[clamp(1.35rem,2.2vw,1.7rem)] leading-[1.25] text-bone/85">
              Step into wellbeing. On your terms.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4">
              <Link href="/contact" {...hoverable} className="btn-primary group">
                Book A Demo
                <ArrowUpRight
                  size={13}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                {...hoverable}
                className="group inline-flex items-center gap-2.5 text-[14px] text-sand/65 transition-colors hover:text-ember"
              >
                <Mail size={15} strokeWidth={1.7} className="text-ember/80" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            <Column heading="Rooms" links={ROOMS} />
            <Column heading="NEXR" links={COMPANY} />
            <div className="col-span-2 sm:col-span-1">
              <Column heading="Who it’s for" links={AUDIENCES} />
            </div>
          </nav>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">
            &copy; {new Date().getFullYear()} NEXR. All rights reserved.
          </p>
          <button
            type="button"
            onClick={toTop}
            {...hoverable}
            className="group inline-flex items-center gap-2.5 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:text-ember sm:self-auto"
          >
            Back to top
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-ember/70">
              <ArrowUp size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>

      {/* ── the signature ───────────────────────────────────────────── */}
      <HalftoneWordmarkFooter
        chrome={false}
        wordmark="NEXR"
        fontFamily={family}
        fontWeight={900}
        dotGap={dotGap}
        radius={90}
        crop={0.16}
        grain={0.4}
        height="clamp(104px, 21vw, 420px)"
        palette={{ background: FOOTER_BG, ink: '#6b4126', warm: '#ff7901' }}
        className="footer-halftone"
      />
    </footer>
  )
}
