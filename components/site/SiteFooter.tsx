'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'

import { CONTACT_EMAIL } from '@/lib/contact'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { FooterSignature } from './RoomSky'

/**
 * The end of every interior page.
 *
 * The site had no footer at all, which left three jobs unanswered: a reader at
 * the bottom of a page had no map of what else exists, a crawler had no set of
 * internal links pointing at the pages that matter, and anyone who could not
 * work the scene's own navigation had no plain list of routes anywhere. One
 * footer answers all three, so it carries real links rather than decoration.
 *
 * **Every label here is a route name.** Nothing in this footer is marketing
 * copy, because none was written for it: the columns name pages that exist, and
 * the only sentence is the legal line.
 *
 * **Not on the home route.** `/` is a full-bleed 3D room with its own scroll
 * driver and its own ending; a footer under it would either be unreachable or
 * cut the scene in half. Every other route scrolls normally and ends here.
 */

const EXPLORE = [
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
  { label: 'Educational Institutes', href: '/explore/vr-wellness#education' },
  { label: 'Healthcare', href: '/explore/vr-wellness#healthcare' },
]

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

function Column({
  heading,
  links,
}: {
  heading: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h2 className="font-mono text-[9px] uppercase tracking-[0.28em] text-bone/35">
        {heading}
      </h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              {...hoverable}
              className="text-[13.5px] leading-[1.5] text-sand/65 transition-colors hover:text-ember"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <footer
      // pointer-events: the layout's <main> is transparent to clicks so the 3D
      // scene underneath it stays usable on the home route, and anything that
      // wants a cursor has to opt back in.
      // `overflow-hidden` is what cuts the wordmark: it runs off the bottom of
      // this element, which is the bottom of the document. The extra bottom
      // padding is the room that cut needs — without it the legal line sits on
      // top of the glyphs instead of above them.
      className="safe-bottom pointer-events-auto relative overflow-hidden border-t border-white/10 bg-void/80 px-5 pb-16 pt-16 backdrop-blur-sm sm:px-6 md:px-10 md:pb-20 md:pt-20"
      style={{ zIndex: 'var(--z-page)' }}
    >
      <FooterSignature />

      {/* Above the watermark. A negative z-index would put it behind the
          footer's own background instead, where nothing would show. */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link
              href="/"
              {...hoverable}
              aria-label="NEXR home"
              className="group inline-flex items-center gap-3"
            >
              <Image
                src="/brand/meloworld-mark.webp"
                alt=""
                width={192}
                height={139}
                className="h-9 w-auto transition-opacity duration-300 group-hover:opacity-80"
              />
              <span className="font-display text-lg uppercase leading-none tracking-[0.32em] text-bone">
                Nexr
              </span>
            </Link>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              {...hoverable}
              className="mt-7 block text-[13.5px] text-sand/65 transition-colors hover:text-ember"
            >
              {CONTACT_EMAIL}
            </a>

            <Link href="/contact" {...hoverable} className="btn-primary group mt-8">
              Book A Demo
              <ArrowUpRight
                size={13}
                className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <nav
            aria-label="Footer"
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Column heading="Rooms" links={EXPLORE} />
            <Column heading="NEXR" links={COMPANY} />
            <Column heading="Who it’s for" links={AUDIENCES} />
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/35">
            &copy; {new Date().getFullYear()} NEXR. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
