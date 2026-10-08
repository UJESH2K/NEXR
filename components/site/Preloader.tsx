'use client'

import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { scroll } from '@/lib/scrollStore'

/**
 * Drives the load curtain; does not draw it.
 *
 * The curtain itself is server-rendered markup (Curtain.tsx), so it is the
 * first thing the browser paints — this component used to render the curtain
 * itself, after React mounted, and the frame before that was a glimpse of the
 * bare site. Now it finds the curtain that is already on screen, fills its
 * ring from the real download progress, and lifts it away when the scene is
 * ready. Nothing re-renders per frame: progress goes straight to the DOM.
 *
 * It exists for two reasons, and the second is the less obvious one:
 *
 *   1. The character is a 4 MB draco GLB and the sky compiles a shader on the
 *      first frame. Without a curtain the visitor watches an empty room fill in.
 *   2. React has to mount, probe for WebGL and only then decide between the 3D
 *      scene and the DOM fallback, and for those frames whatever it renders is
 *      visible. The curtain covers that window.
 *
 * The ring is eased toward the real number rather than set to it. Loaders
 * report in jumps (0, 0, 0, 71, 100), and a ring that jumps looks broken even
 * when it is telling the truth.
 */

/** Long enough for the wordmark's entrance to finish before the lift. */
const MIN_VISIBLE = 2000
/** A return to the home page: assets are cached, the curtain is a beat. */
const MIN_VISIBLE_RETURN = 900
/** Give up waiting on the loader after this and reveal anyway. */
const MAX_VISIBLE = 14000
const LIFT_MS = 1000

/** Set once the first reveal has happened; later mounts are returns. */
let revealedOnce = false
/**
 * A hide scheduled by an unmount. Deferred by a tick so that React's
 * development double-mount (unmount, then mount again at once) can cancel it —
 * hiding and re-showing the curtain would restart its entrance animation.
 */
let pendingHide = 0

export function Preloader({ waitForAssets = true }: { waitForAssets?: boolean }) {
  const { progress, total } = useProgress()
  const live = useRef({ progress, total, waitForAssets })
  live.current = { progress, total, waitForAssets }

  // Runs once per visit to the home page. `waitForAssets` flips from false to
  // true a frame after mount (the WebGL probe), so it is read live from the
  // ref rather than restarting this — a restart would hide and re-show the
  // curtain mid-entrance.
  useEffect(() => {
    window.clearTimeout(pendingHide)
    const curtain = document.getElementById('nexr-curtain')
    if (!curtain) return
    const fill = curtain.querySelector<SVGCircleElement>('.curtain__fill')

    // First load on the home page: the curtain has been up since first paint,
    // so time is measured from navigation start. Any other arrival — back from
    // another route, or a visit that began on one — finds it hidden, so it
    // comes back complete and briefly.
    const returning = revealedOnce || document.documentElement.dataset.route !== 'home'
    const start = returning ? performance.now() : 0
    const minimum = returning ? MIN_VISIBLE_RETURN : MIN_VISIBLE

    // Carry on from wherever the CSS crawl had got to before this took over.
    let value = 0
    if (fill && !returning) {
      const offset = parseFloat(getComputedStyle(fill).strokeDashoffset)
      if (Number.isFinite(offset)) value = 100 - offset
    }

    curtain.classList.remove('is-gone', 'is-leaving')
    curtain.classList.toggle('is-replay', returning)
    curtain.classList.add('is-driven')
    if (fill) fill.style.strokeDashoffset = String(100 - value)

    let raf = 0
    let finished = false
    const timers: number[] = []

    const tick = () => {
      const elapsed = performance.now() - start
      const { progress: p, total: t, waitForAssets: waiting } = live.current
      // Before any asset has registered, total is 0 and progress is a
      // meaningless 100; fall back to a time-based crawl until then.
      const real = !waiting ? 100 : t > 0 ? p : Math.max(value, Math.min(elapsed / 40, 55))
      value += (real - value) * 0.08
      if (fill) fill.style.strokeDashoffset = String(100 - Math.min(value, 100))

      const settled = waiting ? t > 0 && p >= 100 : true
      if ((settled && elapsed >= minimum && value > 96) || elapsed > MAX_VISIBLE) {
        finished = true
        revealedOnce = true
        if (fill) fill.style.strokeDashoffset = '0'
        timers.push(
          window.setTimeout(() => curtain.classList.add('is-leaving'), 160),
          // Lets the hero copy wait for the curtain instead of animating in
          // underneath it.
          window.setTimeout(() => {
            scroll.entered = true
          }, 460),
          window.setTimeout(() => curtain.classList.add('is-gone'), 160 + LIFT_MS + 60),
        )
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach((id) => window.clearTimeout(id))
      // Leaving the home page with the curtain still up: take it down, or it
      // would sit over the next page.
      if (finished) {
        curtain.classList.remove('is-leaving')
        curtain.classList.add('is-gone')
        return
      }
      pendingHide = window.setTimeout(() => {
        curtain.classList.remove('is-leaving')
        curtain.classList.add('is-gone')
      }, 0)
    }
  }, [])

  return null
}
