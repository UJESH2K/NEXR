'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ACT } from '@/lib/scrollStore'

/**
 * Act I's scattered typographic fragments — the barriers named in
 * NEXR_STRATEGY.md §2.
 *
 * The layout is dictated, not decorative. Three other things share the screen
 * during act I and every number below is chosen to miss them:
 *
 *   Header      — fixed, top, roughly 74px tall. Nothing above y≈12.
 *   Act 0 copy  — ActOverlays' headline block, bottom-left, x 1.7–39% and
 *                 reaching up to about y 34 at 1440×900. Nothing below y≈30.
 *   Act 1 copy  — centred, appears at progress 0.16. The fragments converge into
 *                 that exact space, so they are fully faded before it exists.
 *
 * The band is therefore four rows between y 13 and y 29.5. Verified pairwise
 * non-overlapping at 1440, 1024 and 768 wide; the rows carry `data-row` so
 * globals.css can thin the band out on short viewports, where the headline block
 * grows upward into it.
 */
type Shard = {
  text: string
  /** Anchor point in viewport percentages, from md upwards. */
  x: number
  y: number
  /** Which row this belongs to, for the short-viewport rules in globals.css. */
  row: 1 | 2 | 3 | 4
  /** Anchor below md. Omitted means the shard is hidden on small screens — ten
   *  of these do not fit a phone at a legible size, six do. */
  mx?: number
  my?: number
  size: string
}

const SHARDS: Shard[] = [
  // Row 1
  { text: 'Anxiety', row: 1, x: 9, y: 13, mx: 82, my: 13, size: 'text-[11px] md:text-sm' },
  { text: 'Fear of judgement', row: 1, x: 40, y: 13, mx: 34, my: 13, size: 'text-[11px] md:text-sm' },
  { text: 'Stigma', row: 1, x: 78, y: 13, mx: 78, my: 31, size: 'text-xs md:text-base' },
  // Row 2
  { text: 'Work pressure', row: 2, x: 24, y: 18.5, size: 'text-[11px] md:text-xs' },
  { text: 'Nobody noticed', row: 2, x: 66, y: 18.5, mx: 62, my: 22, size: 'text-[11px] md:text-sm' },
  { text: 'Adjustment', row: 2, x: 89, y: 18.5, size: 'text-[11px] md:text-xs' },
  // Row 3
  { text: 'Low utilisation', row: 3, x: 14, y: 24, size: 'text-[11px] md:text-xs' },
  { text: 'Staying quiet', row: 3, x: 52, y: 24, mx: 30, my: 31, size: 'text-[11px] md:text-sm' },
  { text: 'Burnout', row: 3, x: 84, y: 24, mx: 18, my: 22, size: 'text-xs md:text-base' },
  // Row 4
  { text: 'A need to talk', row: 4, x: 70, y: 29.5, size: 'text-[11px] md:text-xs' },
]

/** How far toward centre the fragments travel, as a fraction of the viewport. */
const CONVERGE = 0.55

export function ScatterText() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = root.current
      if (!element) return

      const shards = gsap.utils.toArray<HTMLElement>('[data-shard]', element)

      // Centre each fragment on its anchor rather than hanging it off the left
      // edge. Two things depend on this: a long label near x=89 stays on screen,
      // and offsetLeft/offsetTop below then *are* the visual centre, which is
      // what makes the convergence targets exact.
      gsap.set(shards, { xPercent: -50, yPercent: -50 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#home-track',
          start: 'top top',
          // Resolved inside act I, not at the end of the approach. The centred
          // act 1 headline occupies the space these words converge into, so they
          // have to be gone before it arrives rather than crossfading with it.
          end: () => {
            const track = document.getElementById('home-track')
            const scrollable = (track?.clientHeight ?? 0) - window.innerHeight
            return `+=${Math.max(1, scrollable * ACT.distantEnd)}`
          },
          scrub: true,
          // Function-based values above must be recomputed on resize — which is
          // also when the breakpoints below swap each shard's anchor.
          invalidateOnRefresh: true,
        },
      })

      shards.forEach((shard, index) => {
        // Slight stagger so they don't collapse as one rigid block.
        const at = index * 0.02

        timeline.to(
          shard,
          {
            // Read from layout, not from the data above: the anchor differs
            // between breakpoints, and offsetLeft/offsetTop are unaffected by the
            // transform GSAP is writing, so they stay correct on every refresh.
            x: () => (window.innerWidth * 0.5 - shard.offsetLeft) * CONVERGE,
            y: () => (window.innerHeight * 0.5 - shard.offsetTop) * CONVERGE,
            scale: 0.72,
            // Required for scrubbed animations: any ease would desynchronise the
            // frame from the scrollbar position.
            ease: 'none',
            duration: 1,
          },
          at,
        )

        // Opacity runs on its own shorter tween, finishing well before the
        // position does. Fading out early is what keeps the pile-up at the centre
        // from ever being visible.
        timeline.to(shard, { opacity: 0, ease: 'none', duration: 0.5 }, at + 0.28)
      })

      return () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
      }
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className="overlay-layer fixed inset-0"
      style={{ zIndex: 'var(--z-overlay)' }}
      aria-hidden="true"
    >
      {SHARDS.map((shard) => (
        <span
          key={shard.text}
          data-shard
          data-row={shard.row}
          className={`scatter-shard font-mono uppercase tracking-[0.18em] text-bone/45 ${shard.size} ${
            shard.mx === undefined ? 'hidden md:block' : ''
          }`}
          // Positions go through custom properties because they are per-shard
          // data and responsive, and Tailwind cannot generate utilities from
          // runtime values. globals.css picks the small pair below md and the
          // wide pair above.
          style={
            {
              '--shard-x': `${shard.x}%`,
              '--shard-y': `${shard.y}%`,
              '--shard-mx': `${shard.mx ?? shard.x}%`,
              '--shard-my': `${shard.my ?? shard.y}%`,
              willChange: 'transform, opacity',
            } as React.CSSProperties
          }
        >
          {shard.text}
        </span>
      ))}
    </div>
  )
}
