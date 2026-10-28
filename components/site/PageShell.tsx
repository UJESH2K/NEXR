import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { sectionById } from '@/lib/sections'
import { requestReturn } from '@/lib/returnStore'
import { PageFade } from './PageFade'
import { GsapRouteMotion } from './GsapRouteMotion'
import { RoomSky } from './RoomSky'
import { ClosingCta } from './ClosingCta'

/**
 * The frame for the interior pages (Approach, Trust, Let's Talk).
 *
 * A held title over a wide, cinematic image band, then the page's own
 * sections, then the shared closing block and the way back. The colours and
 * the band image come from the page's beat on the home scene, so a page reads
 * as the inside of the beat that linked to it.
 */
export function PageShell({
  eyebrow,
  kicker,
  title,
  lede,
  beatId,
  image,
  actions,
  closing = true,
  children,
}: {
  eyebrow: string
  /** A quieter line that sets up the title, where the document writes one. */
  kicker?: string
  title: string
  lede?: string
  beatId: string
  /** Overrides the beat's own image for the band. */
  image?: string
  actions?: ReactNode
  /** The shared closing block. Off on the contact page, which is that block. */
  closing?: boolean
  children: ReactNode
}) {
  const section = sectionById(beatId)
  const hero = image ?? section.images[0]

  return (
    <PageFade>
      <GsapRouteMotion>
        <article className="safe-bottom pointer-events-auto relative isolate min-h-svh overflow-hidden bg-abyss px-5 pb-20 pt-28 sm:px-6 md:px-10 md:pb-28 md:pt-36">
          <RoomSky sky={section.sky} accent={section.accent} />

          <header data-tour="page-intro" className="mx-auto max-w-6xl">
            <p data-route-eyebrow className="flex items-center gap-2.5 text-[15px] font-medium text-ember-soft">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ember shadow-[0_0_0_4px_rgb(255_121_1/0.2)]" />
              {eyebrow}
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
              <div>
                {kicker ? (
                  <p data-route-lede className="mb-4 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5] text-bone/60">
                    {kicker}
                  </p>
                ) : null}
                <h1
                  data-route-title
                  className="text-balance font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-semibold leading-[1.04] text-bone"
                >
                  {title}
                </h1>
              </div>
              {lede || actions ? (
                <div className="lg:pb-2">
                  {lede ? (
                    <p data-route-lede className="max-w-[52ch] text-[15.5px] leading-[1.85] text-sand/75">
                      {lede}
                    </p>
                  ) : null}
                  {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
                </div>
              ) : null}
            </div>
          </header>

          <div
            data-route-media
            className="relative mx-auto mt-12 aspect-[16/10] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40 md:mt-16 md:aspect-[2.4/1]"
            style={{ backgroundImage: `linear-gradient(135deg, ${section.sky[0]}, ${section.sky[1]})` }}
          >
            {hero ? (
              <Image
                src={hero}
                alt=""
                fill
                priority
                className="object-cover opacity-90 mix-blend-luminosity"
                sizes="(min-width: 1024px) 1200px, 100vw"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-void/60 via-transparent to-void/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-1/4 bg-ember" />
          </div>

          <div className="mx-auto mt-16 max-w-6xl md:mt-24">{children}</div>

          {closing ? <ClosingCta accent={section.accent} tint={section.sky} className="mx-auto mt-20 max-w-6xl md:mt-28" /> : null}

          <footer className="page-end mx-auto mt-10 max-w-6xl">
            <Link href="/" onClick={requestReturn} className="end-btn group">
              <ArrowLeft size={15} className="shrink-0 transition-transform group-hover:-translate-x-1" />
              Back to the experience
            </Link>
            <Link href="/explore" className="end-btn group">
              Explore every room
              <ArrowUpRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </footer>
        </article>
      </GsapRouteMotion>
    </PageFade>
  )
}

/** A section heading used inside the pages, so every page sets them alike. */
export function SectionHeading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2
      data-beat-heading
      className={`text-balance font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium leading-[1.1] text-bone ${className}`}
    >
      {children}
    </h2>
  )
}
