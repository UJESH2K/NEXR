'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useCursorState } from '@/lib/cursorStore'

/**
 * The custom cursor: a dot that tracks tightly and a ring that trails.
 *
 * Position is written straight to `style.transform` from the gsap ticker. The
 * previous version called setState on every animation frame, which pushed a
 * React render through the whole tree sixty times a second on a page that is
 * already running a WebGL loop — the cursor was measurably the most expensive
 * thing on screen. Nothing here re-renders except when the ring's *label*
 * changes, which happens a few times a page.
 *
 * Two rings are drawn: one a plain outline, one filled in the accent colour and
 * scaled to zero until something asks for a label. Cross-fading between them is
 * what makes hovering a 3D panel feel like the cursor snapped to it.
 */

const DOT_LAG = 0.35
const RING_LAG = 0.16

export function CursorFollower() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const { label, active } = useCursorState()

  useEffect(() => {
    // Touch and pen have their own affordances; a trailing ring on a phone is
    // just a stuck artefact. Bail before adding any listeners.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const dotPos = { ...target }
    const ringPos = { ...target }
    let visible = false

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (!visible) {
        visible = true
        // Snap on the first move so the cursor does not fly in from centre.
        dotPos.x = ringPos.x = target.x
        dotPos.y = ringPos.y = target.y
        if (dot.current) dot.current.style.opacity = '1'
        if (ring.current) ring.current.style.opacity = '1'
      }
    }

    const onLeave = () => {
      visible = false
      if (dot.current) dot.current.style.opacity = '0'
      if (ring.current) ring.current.style.opacity = '0'
    }

    const tick = () => {
      dotPos.x += (target.x - dotPos.x) * DOT_LAG
      dotPos.y += (target.y - dotPos.y) * DOT_LAG
      ringPos.x += (target.x - ringPos.x) * RING_LAG
      ringPos.y += (target.y - ringPos.y) * RING_LAG

      if (dot.current) {
        dot.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      gsap.ticker.remove(tick)
    }
  }, [])

  const grown = active || label !== null

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--z-cursor)' }} aria-hidden="true">
      <div
        ref={dot}
        className="absolute left-0 top-0 rounded-full bg-lime opacity-0 transition-[width,height,opacity] duration-300"
        style={{
          width: grown ? '0px' : '6px',
          height: grown ? '0px' : '6px',
        }}
      />

      <div
        ref={ring}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border opacity-0 transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: label ? '86px' : grown ? '52px' : '30px',
          height: label ? '86px' : grown ? '52px' : '30px',
          borderColor: label ? 'transparent' : 'rgba(232, 229, 218, 0.45)',
          backgroundColor: label ? 'rgba(216, 243, 93, 0.92)' : 'transparent',
        }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink transition-opacity duration-200"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
