'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { damp, scroll } from './scrollStore'

/**
 * One global pointer source, smoothed once.
 *
 * The camera, the sky sphere, the panel field and the cursor all lean on the
 * pointer. Smoothing per-consumer would give each of them its own easing and a
 * slightly different lag, which reads as the scene coming apart under fast
 * mouse movement. So the raw position is captured here, smoothed on the same
 * gsap ticker that drives Lenis, and published on the store for everyone.
 *
 * `pointerEnergy` is a 0..1 measure of how fast the mouse is moving that decays
 * to zero when it rests — it drives the "alive" reactions (glow, grain, panel
 * shimmer) so a still cursor leaves a calm frame.
 */
export function usePointer(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      scroll.rawPointerX = (event.clientX / window.innerWidth) * 2 - 1
      scroll.rawPointerY = (event.clientY / window.innerHeight) * 2 - 1
    }

    // Leaving the window must recentre, or the scene stays permanently leaned
    // toward wherever the cursor exited.
    const onLeave = () => {
      scroll.rawPointerX = 0
      scroll.rawPointerY = 0
    }

    let lastX = 0
    let lastY = 0
    let last = performance.now()

    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      scroll.pointerX = damp(scroll.pointerX, scroll.rawPointerX, 5, dt)
      scroll.pointerY = damp(scroll.pointerY, scroll.rawPointerY, 5, dt)

      const speed =
        Math.hypot(scroll.pointerX - lastX, scroll.pointerY - lastY) / (dt || 1)
      lastX = scroll.pointerX
      lastY = scroll.pointerY

      // Rise fast, fall slow: energy should spike the instant the mouse moves
      // and linger just long enough to be felt.
      const target = Math.min(speed * 0.6, 1)
      scroll.pointerEnergy = damp(
        scroll.pointerEnergy,
        target,
        target > scroll.pointerEnergy ? 12 : 2.2,
        dt,
      )
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      gsap.ticker.remove(tick)
    }
  }, [enabled])
}
