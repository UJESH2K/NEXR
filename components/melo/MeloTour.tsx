'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useScrollApi } from '@/lib/ScrollProvider'
import type { TourStep } from '@/lib/melo/script'
import { EASE, MeloCard } from './MeloCard'

/**
 * The guided tour: one spotlight, one card, Melo explaining.
 *
 * Performance is the whole design here, because a tour that stutters teaches
 * people the site is broken. So:
 *
 *   - The spotlight is a single fixed element whose giant box-shadow is the
 *     dimmed page. No SVG mask, no canvas, nothing re-rasterised per step.
 *   - It follows its target from one requestAnimationFrame loop that writes
 *     style directly. React renders once per step, never per frame.
 *   - Page scrolling is paused for the duration, so the target cannot be
 *     scrolled out from under the light; scrolling to each step goes through
 *     Lenis so it shares the same clock as the rest of the site.
 *
 * Steps whose target is not on screen at this width (Back/Home live in the top
 * bar only from tablet up, the menu button only below desktop) are dropped
 * before the tour starts rather than skipped mid-way, so the counter is honest.
 */

const PAD = 10
const HEADER = 84

function visible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (!el.getClientRects().length) return false
  const style = window.getComputedStyle(el)
  return style.visibility !== 'hidden' && style.display !== 'none'
}

function isFixed(el: HTMLElement) {
  let node: HTMLElement | null = el
  while (node && node !== document.body) {
    if (window.getComputedStyle(node).position === 'fixed') return true
    node = node.parentElement
  }
  return false
}

export function MeloTour({
  steps,
  onFinish,
}: {
  steps: TourStep[]
  onFinish: (completed: boolean) => void
}) {
  const { lenis } = useScrollApi()
  const [list] = useState(() => steps.filter((s) => visible(document.querySelector(s.target))))
  const [index, setIndex] = useState(0)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const indexRef = useRef(0)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const startY = useRef(typeof window === 'undefined' ? 0 : window.scrollY)
  const finished = useRef(false)

  const step = list[index]
  const last = index === list.length - 1
  const [short] = useState(() => typeof window !== 'undefined' && window.innerHeight < 760)

  const finish = useCallback(
    (completed: boolean) => {
      if (finished.current) return
      finished.current = true
      onFinish(completed)
    },
    [onFinish],
  )

  // Nothing to show at this width: end immediately rather than flash an empty light.
  useEffect(() => {
    if (!list.length) finish(false)
  }, [list.length, finish])

  // Pause the page; hand it back exactly where it was found.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    if (lenis) lenis.stop()
    else root.style.overflow = 'hidden'
    const from = startY.current
    return () => {
      if (lenis) {
        lenis.start()
        lenis.scrollTo(from, { duration: 0.9 })
      } else {
        root.style.overflow = previous
        window.scrollTo({ top: from, behavior: 'smooth' })
      }
    }
  }, [lenis])

  // Bring each step's target into the part of the screen the card leaves free.
  useLayoutEffect(() => {
    indexRef.current = index
    if (!step) return
    const el = document.querySelector<HTMLElement>(step.target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mobile = vw < 768
    const cardH = cardRef.current?.offsetHeight ?? 260
    const cardW = cardRef.current?.offsetWidth ?? 352
    const dockBottom = mobile ? 84 : 108
    let shift = 0
    if (!isFixed(el)) {
      const reserve = mobile ? cardH + dockBottom : 0
      const room = vh - HEADER - reserve
      const top = HEADER + Math.max(12, (room - rect.height) / 2)
      const max = document.documentElement.scrollHeight - vh
      const y = Math.min(Math.max(window.scrollY + rect.top - top, 0), Math.max(max, 0))
      shift = y - window.scrollY
      if (Math.abs(shift) > 2) {
        if (lenis) lenis.scrollTo(y, { duration: 0.85, force: true })
        else window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
    // Where the target will be once the scroll lands, and how much of it each
    // card position would cover. The end of a page cannot scroll any higher,
    // and on a short phone a tall target and the card cannot both fit — so
    // the card goes wherever it hides the least. Melo herself is the
    // exception: the card always sits above her.
    const top = rect.top - shift
    const bottom = rect.bottom - shift
    const overlaps = rect.right > vw - cardW - 40 && rect.left < vw - 16
    const cover = (a: number, b: number) => (overlaps ? Math.max(0, Math.min(bottom, b) - Math.max(top, a)) : 0)
    const belowCover = cover(vh - dockBottom - cardH, vh - dockBottom)
    const aboveCover = cover(84, 84 + cardH)
    setPlacement(!step.target.includes('"melo"') && aboveCover < belowCover ? 'top' : 'bottom')
    nextRef.current?.focus({ preventScroll: true })
  }, [index, step, lenis])

  // The light: damped toward the target's current rect every frame.
  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return
    const cur = { x: 0, y: 0, w: 0, h: 0, ready: false }
    let raf = 0
    const loop = () => {
      const s = list[indexRef.current]
      const el = s ? document.querySelector<HTMLElement>(s.target) : null
      if (el) {
        const r = el.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        const x = Math.max(r.left - PAD, 6)
        const y = Math.max(r.top - PAD, 6)
        const w = Math.min(r.right + PAD, vw - 6) - x
        const h = Math.min(r.bottom + PAD, vh - 6) - y
        if (!cur.ready) {
          Object.assign(cur, { x, y, w, h, ready: true })
        } else {
          cur.x += (x - cur.x) * 0.24
          cur.y += (y - cur.y) * 0.24
          cur.w += (w - cur.w) * 0.24
          cur.h += (h - cur.h) * 0.24
        }
        ring.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
        ring.style.width = `${Math.max(cur.w, 24)}px`
        ring.style.height = `${Math.max(cur.h, 24)}px`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [list])

  const go = useCallback(
    (to: number) => {
      if (to < 0) return
      if (to >= list.length) {
        finish(true)
        return
      }
      setIndex(to)
    },
    [list.length, finish],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(false)
      else if (e.key === 'ArrowRight') go(indexRef.current + 1)
      else if (e.key === 'ArrowLeft') go(indexRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, finish])

  if (!step) return null

  return (
    <>
      {/* Swallows clicks on the dimmed page: during the tour, the card is the only control. */}
      <motion.div
        className="fixed inset-0"
        style={{ zIndex: 'var(--z-tour)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      >
        <div ref={ringRef} className="melo-spotlight" />
      </motion.div>

      <motion.div
        layout
        className={`fixed ${placement === 'top' ? 'melo-dock melo-dock--top' : 'melo-dock melo-dock--above'}`}
        style={{ zIndex: 'var(--z-tour-card)' }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <MeloCard
          ref={cardRef}
          pose={step.pose}
          compactFigure={short}
          role="dialog"
          label={step.title}
          meta={`Tour · ${index + 1} of ${list.length}`}
          onClose={() => finish(false)}
          closeLabel="Skip the tour"
        >
          <p key={index} className="melo-text mt-3 text-[14px] leading-[1.6] text-bone/85">
            {step.text}
          </p>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {list.map((s, i) => (
              <span
                key={s.target + i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 18 : 6,
                  backgroundColor: i <= index ? '#ff7901' : 'rgba(244,243,236,0.18)',
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => finish(false)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45 transition-colors hover:text-bone"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous step"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-bone/70 transition-colors hover:border-ember/60 hover:text-ember"
                >
                  <ArrowLeft size={14} />
                </button>
              ) : null}
              <button
                ref={nextRef}
                type="button"
                onClick={() => go(index + 1)}
                className="btn-primary btn-primary--compact group"
              >
                {last ? 'Got it' : 'Next'}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </MeloCard>
      </motion.div>
    </>
  )
}
