'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function GsapRouteMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const page = root.current
      if (!page) return

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      const trackProgress = () =>
        ScrollTrigger.create({
          trigger: page,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            if (progress.current) {
              progress.current.style.transform = `scaleX(${self.progress})`
            }
          },
        })

      /*
       * Phones and tablets get the page as it is, with no reveal-on-scroll.
       * Two reasons, both seen on real devices. The blur these reveals start
       * from is the most expensive thing on the page to animate, and mid-scroll
       * it reads as a dark smudge travelling down the screen rather than as
       * text arriving. And a 'top 80%' trigger measured before the address bar
       * collapses can end up never firing, which leaves a block at opacity 0
       * for good — the same failure ExploreExperience guards against.
       */
      if (window.matchMedia('(max-width: 1023px)').matches) {
        const t = trackProgress()
        return () => t.kill()
      }

      /* ── Intro timeline ──────────────────────────────────────── */
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('[data-route-eyebrow]', {
          y: 30, opacity: 0, duration: 0.8,
          filter: 'blur(8px)',
        })
        .from('[data-route-title]', {
          y: 80, opacity: 0, duration: 1.1, skewY: 3,
          filter: 'blur(12px)',
        }, '-=0.5')
        .from('[data-route-lede]', {
          y: 30, opacity: 0, duration: 0.85,
          filter: 'blur(6px)',
        }, '-=0.6')
        .from('[data-route-media]', {
          y: 50, opacity: 0, scale: 0.95, duration: 1.1,
          filter: 'blur(10px)',
          ease: 'power2.out',
        }, '-=0.5')

      /* ── Hero parallax ───────────────────────────────────────── */
      const media = page.querySelector<HTMLElement>('[data-route-media]')
      if (media) {
        const img = media.querySelector('img')
        gsap.to(img ?? media, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: media,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        })

        gsap.to(media, {
          scale: 0.97,
          borderRadius: '16px',
          scrollTrigger: {
            trigger: media,
            start: 'top 80px',
            end: '+=400',
            scrub: 1,
          },
        })
      }

      /* ── Beat sections (scroll-revealed blocks) ──────────────── */
      gsap.utils.toArray<HTMLElement>('[data-route-beat]').forEach((beat, i) => {
        const heading = beat.querySelector<HTMLElement>('[data-beat-heading]')
        const body = beat.querySelector<HTMLElement>('[data-beat-body]')
        const items = beat.querySelectorAll<HTMLElement>('[data-beat-item]')
        const accent = beat.querySelector<HTMLElement>('[data-beat-accent]')

        // toggleActions, never `once` — see the note in ExploreExperience:
        // a trigger that kills itself during another trigger's refresh
        // corrupts the array ScrollTrigger is walking.
        const beatTl = gsap.timeline({
          scrollTrigger: {
            trigger: beat,
            start: 'top 80%',
            end: 'top 30%',
            scrub: false,
            toggleActions: 'play none none none',
          },
        })

        beatTl
          .from(beat, {
            opacity: 0, y: 80, duration: 1, ease: 'power3.out',
          })
          .from(heading, {
            x: -50, opacity: 0, duration: 0.9, ease: 'power3.out',
          }, '-=0.7')
          .from(body, {
            y: 25, opacity: 0, duration: 0.75, ease: 'power2.out',
          }, '-=0.5')

        if (accent) {
          beatTl.from(accent, {
            scale: 0.92, opacity: 0, duration: 0.8,
            ease: 'back.out(1.7)',
          }, '-=0.4')
        }

        if (items.length) {
          beatTl.from(items, {
            y: 40, opacity: 0, scale: 0.96,
            stagger: 0.12, duration: 0.7, ease: 'power2.out',
          }, '-=0.5')
        }

        /* Scroll-linked parallax on each beat heading */
        if (heading) {
          gsap.to(heading, {
            x: 12,
            scrollTrigger: {
              trigger: beat,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          })
        }
      })

      /* ── Paragraph line-by-line reveal ────────────────────────── */
      gsap.utils.toArray<HTMLElement>('[data-beat-body] > p').forEach((p) => {
        gsap.from(p, {
          y: 18, opacity: 0, duration: 0.65, ease: 'power2.out',
          scrollTrigger: {
            trigger: p,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        })
      })

      /* ── Scroll progress rail ─────────────────────────────────── */
      const progressTrigger = trackProgress()

      /* ── Footer reveal ───────────────────────────────────────── */
      const footer = page.querySelector<HTMLElement>('footer')
      if (footer) {
        gsap.from(footer, {
          y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        })
      }

      return () => progressTrigger.kill()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative">
      <div className="pointer-events-none fixed inset-x-0 top-[4.6rem] z-[31] h-px bg-white/10">
        <div ref={progress} className="h-full origin-left scale-x-0 bg-ember" />
      </div>
      {children}
    </div>
  )
}
