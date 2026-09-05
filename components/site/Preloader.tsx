'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { scroll } from '@/lib/scrollStore'
import { Portal } from './Portal'

/**
 * The load curtain.
 *
 * It exists for two reasons, and the second is the less obvious one:
 *
 *   1. The character is a 4 MB draco GLB and the sky compiles a shader on the
 *      first frame. Without a curtain the visitor watches an empty room fill in.
 *   2. It hides first paint. React has to mount, probe for WebGL and only then
 *      decide between the 3D scene and the DOM fallback — and for those few
 *      frames whatever it renders is visible. Covering that window is what
 *      removes the flash of the fallback page on every refresh.
 *
 * The displayed number is eased toward the real one rather than assigned. Asset
 * loaders report in jumps (0, 0, 0, 71, 100) and a counter that jumps looks
 * broken even when it is telling the truth.
 */

/** Never flash: below this the curtain reads as a glitch rather than a load. */
const MIN_VISIBLE = 1100
/** Give up waiting on the loader after this and reveal anyway. */
const MAX_VISIBLE = 14000

export function Preloader({ waitForAssets = true }: { waitForAssets?: boolean }) {
  const { progress, total } = useProgress()
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)
  const mounted = useRef(Date.now())

  // Eased counter, plus a floor that creeps up on its own so the number is
  // never frozen at zero while the very first request is still in flight.
  useEffect(() => {
    let raf = 0
    let value = 0

    const tick = () => {
      const elapsed = Date.now() - mounted.current
      // Before any asset has registered, total is 0 and progress is a
      // meaningless 100. Fall back to a time-based crawl until then.
      const real = !waitForAssets
        ? 100
        : total > 0
          ? progress
          : Math.min(elapsed / 40, 55)
      value += (real - value) * 0.08
      setDisplay(value)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, total, waitForAssets])

  useEffect(() => {
    // With no canvas there is nothing to wait for, so the curtain only has to
    // outlast its own entrance rather than a download.
    const settled = waitForAssets ? total > 0 && progress >= 100 : true
    const elapsed = Date.now() - mounted.current

    if (settled) {
      const wait = Math.max(MIN_VISIBLE - elapsed, 260)
      const timer = setTimeout(() => setDone(true), wait)
      return () => clearTimeout(timer)
    }

    const bail = setTimeout(() => setDone(true), Math.max(MAX_VISIBLE - elapsed, 0))
    return () => clearTimeout(bail)
  }, [progress, total, waitForAssets])

  useEffect(() => {
    if (!done) return
    // Publishing this is what lets the hero copy wait for the curtain instead
    // of animating in underneath it.
    const timer = setTimeout(() => {
      scroll.entered = true
    }, 300)
    return () => clearTimeout(timer)
  }, [done])

  const shown = Math.min(Math.round(display), 100)

  return (
    // Portalled to <body>: inside <main> this would be trapped in the page's
    // stacking context and drawn underneath the header. See Portal.
    <Portal>
      <AnimatePresence>
        {!done ? (
        <motion.div
          key="preloader"
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 'var(--z-curtain)', background: '#12180f' }}
          initial={{ opacity: 1 }}
          exit={{
            // Lift rather than fade: the scene is already rendering behind this,
            // so wiping upward hands the frame over instead of dissolving into
            // a half-transparent double image.
            y: '-100%',
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* A slow breathing wash so the curtain is never a dead flat colour. */}
          <div className="preloader-wash" aria-hidden="true" />

          <motion.div
            className="relative flex flex-col items-center gap-8"
            exit={{ opacity: 0, y: -24, transition: { duration: 0.45 } }}
          >
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-display text-[clamp(2.6rem,7vw,5rem)] leading-none tracking-[0.16em] text-bone"
              >
                NEXR
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-[22rem] text-center font-mono text-[10px] uppercase leading-[1.9] tracking-[0.28em] text-bone/45"
            >
              Help shouldn&rsquo;t cost you your privacy
            </motion.p>

            <div className="mt-2 flex w-[min(46vw,320px)] flex-col gap-3">
              <div className="h-px w-full overflow-hidden bg-bone/15">
                <div
                  className="h-full origin-left bg-ember"
                  style={{
                    transform: `scaleX(${shown / 100})`,
                    transition: 'transform 120ms linear',
                  }}
                />
              </div>
              <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.24em] text-bone/45">
                <span>LOADING THE ROOM</span>
                <span className="tabular-nums text-ember">
                  {String(shown).padStart(3, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  )
}
