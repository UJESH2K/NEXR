'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { scroll } from '@/lib/scrollStore'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'

const ACT_LABELS = ['I', 'II', 'III', 'IV'] as const

/**
 * Progress rail on the right edge.
 *
 * The continuous value is carried by a framer-motion MotionValue rather than
 * React state: motion values update outside the render cycle, so this ticks at
 * 60fps without re-rendering anything. It's fed from the same gsap.ticker that
 * drives Lenis, so the rail can never lag a frame behind the scene.
 */
export function ScrollHud() {
  const { act, mode } = useScrollSnapshot()

  const progress = useMotionValue(0)

  useEffect(() => {
    const tick = () => progress.set(scroll.homeProgress)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [progress])

  // useTransform outputs feed the style prop of motion.* elements directly.
  const scaleY = useTransform(progress, [0, 1], [0, 1])
  const glow = useTransform(progress, [0, 0.04, 0.96, 1], [0, 1, 1, 0.35])

  return (
    <div
      className="overlay-layer fixed top-1/2 right-5 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
      style={{
        zIndex: 'var(--z-chrome)',
        // Transform-only fade so the rail never affects layout.
        opacity: mode === 'transition' ? 0 : 1,
        transition: 'opacity 300ms ease',
      }}
      aria-hidden="true"
    >
      <div className="relative h-[36svh] w-px bg-bone/15">
        <motion.span
          className="absolute inset-x-0 top-0 h-full origin-top bg-lime"
          style={{ scaleY, opacity: glow }}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        {ACT_LABELS.map((label, index) => (
          <span
            key={label}
            className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
              index === act ? 'text-lime' : 'text-bone/25'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
