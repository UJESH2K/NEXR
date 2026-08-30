'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ACT } from '@/lib/scrollStore'

/**
 * Vertical word carousel on the RIGHT side of the screen.
 *
 * Before the user scrolls: words auto-rotate in an infinite loop, each word
 * blurring into the next (like a slot machine / marquee).
 *
 * Once scrolling begins: the loop pauses, the current word fades out, and
 * the whole component disappears before act 1 arrives.
 */

const WORDS = [
  'Anxiety',
  'Fear of judgement',
  'Stigma',
  'Work pressure',
  'Nobody noticed',
  'Adjustment',
  'Low utilisation',
  'Staying quiet',
  'Burnout',
  'A need to talk',
]

const ITEM_HEIGHT = 56
/** Speed of the auto-rotation (pixels per frame at 60fps). */
const AUTO_SPEED = 0.8

export function ScatterText() {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<(HTMLDivElement | null)[]>([])
  const [hasScrolled, setHasScrolled] = useState(false)

  // ── Auto-rotation loop ───────────────────────────────────────────────
  useEffect(() => {
    let y = 0
    let raf: number
    const totalH = WORDS.length * ITEM_HEIGHT

    const tick = () => {
      if (hasScrolled) return // stop once the user scrolls

      y += AUTO_SPEED
      if (y >= totalH) y -= totalH

      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${-y}px)`
      }

      // Per-word blur based on distance from viewport centre
      const vh = window.innerHeight
      const centre = vh * 0.5
      wordsRef.current.forEach((el) => {
        if (!el) return
        const label = el.querySelector('[data-wl]') as HTMLElement
        const arrow = el.querySelector('[data-wa]') as HTMLElement
        if (!label) return

        const rect = el.getBoundingClientRect()
        // Account for the track offset
        const wordCentre = rect.top + rect.height / 2
        const dist = Math.abs(wordCentre - centre)
        const maxDist = vh * 0.3
        const t = Math.min(dist / maxDist, 1)

        label.style.filter = `blur(${t * 6}px)`
        label.style.opacity = String(1 - t * 0.85)

        if (arrow) {
          const active = t < 0.12
          arrow.style.opacity = active ? '1' : '0'
          arrow.style.color = active ? 'var(--color-lime, #d8f35d)' : 'transparent'
        }
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hasScrolled])

  // ── Detect first scroll → freeze and fade out ────────────────────────
  useGSAP(() => {
    const onScroll = () => {
      if (window.scrollY > 40 && !hasScrolled) {
        setHasScrolled(true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })

  // ── Fade-out animation when hasScrolled becomes true ─────────────────
  useGSAP(
    () => {
      if (hasScrolled && rootRef.current) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (rootRef.current) rootRef.current.style.display = 'none'
          },
        })
      }
    },
    { dependencies: [hasScrolled] },
  )

  return (
    <div
      ref={rootRef}
      className="overlay-layer fixed right-[4vw] top-0 z-[var(--z-overlay)] h-screen w-[40vw] max-w-[380px] select-none md:right-[5vw]"
      aria-hidden="true"
      style={{ overflow: 'hidden' }}
    >
      {/* Fade mask — sharp at centre, transparent at top/bottom */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        }}
      />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex flex-col items-start pt-[42vh]"
      >
        {WORDS.map((word, i) => (
          <div
            key={word}
            ref={(el) => { wordsRef.current[i] = el }}
            className="flex w-full items-center gap-4"
            style={{ height: ITEM_HEIGHT }}
          >
            <span
              data-wa
              className="text-2xl font-light"
              style={{ color: 'transparent', opacity: 0 }}
            >
              &rarr;
            </span>
            <span
              data-wl
              className="font-display text-[clamp(1.6rem,3.5vw,2.6rem)] font-semibold tracking-tight text-bone"
              style={{ filter: 'blur(6px)', opacity: 0.15 }}
            >
              {word}
            </span>
          </div>
        ))}
      </div>

      {/* Centre highlight line */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-20"
        style={{
          top: '48%',
          height: '2px',
          background:
            'linear-gradient(to right, transparent, rgba(216,243,93,0.2), transparent)',
        }}
      />
    </div>
  )
}
