'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS } from '@/lib/sections'
import { scroll } from '@/lib/scrollStore'
import { useScrollApi } from '@/lib/ScrollProvider'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { Portal } from '@/components/site/Portal'

/**
 * The full-frame read for a beat, opened by clicking its hero panel in 3D.
 *
 * The open flag lives on the mutable scroll store because it is set from inside
 * the R3F canvas, which is a separate reconciler. Polling it on the gsap ticker
 * is a deliberate trade: one integer comparison per frame in exchange for the
 * canvas never needing a React path back into the DOM tree.
 */

const EASE = [0.16, 1, 0.3, 1] as const

export function PanelDetail() {
  const [index, setIndex] = useState<number | null>(null)
  const { lenis } = useScrollApi()

  useEffect(() => {
    const tick = () => {
      setIndex((current) =>
        current === scroll.expandedCard ? current : scroll.expandedCard,
      )
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const close = useCallback(() => {
    scroll.expandedCard = null
    setIndex(null)
    resetCursor()
  }, [])

  // Scrolling the page behind an open sheet would move the scene it came from.
  useEffect(() => {
    if (index === null) {
      lenis?.start()
      return
    }
    lenis?.stop()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, lenis, close])

  const section = index === null ? null : SECTIONS[index]

  return (
    // Portalled to <body>: the sheet has to cover the fixed header, and inside
    // <main> the page's stacking context would keep it underneath. See Portal.
    <Portal>
      <AnimatePresence>
        {section ? (
        <motion.div
          key={section.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="pointer-events-auto fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-sheet)' }}
          role="dialog"
          aria-modal="true"
          aria-label={section.word}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute inset-0 cursor-none bg-black/55 backdrop-blur-[6px]"
            onMouseEnter={() => setCursor({ label: 'close', active: true })}
            onMouseLeave={resetCursor}
          />

          <motion.article
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            className="relative grid w-[min(1040px,92vw)] overflow-hidden rounded-3xl border border-white/12 bg-[#0c110c]/92 shadow-2xl shadow-black/60 md:grid-cols-[1.05fr_1fr]"
          >
            <div className="relative aspect-[16/9] md:aspect-auto">
              <img
                src={section.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${section.sky[1]}cc, transparent 55%)`,
                }}
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="flex items-center gap-3">
                {section.mark ? (
                  <img src={section.mark} alt="" className="h-7 w-auto" />
                ) : null}
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: section.accent }}
                >
                  {section.index} &nbsp;/&nbsp; {section.word}
                </p>
              </div>

              <h2 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.14] text-bone">
                {section.headline}
              </h2>

              <p className="mt-5 text-[14px] leading-[1.85] text-bone/70">
                {section.body}
              </p>

              <div className="mt-10 flex items-center gap-7">
                <Link
                  href={section.cta.route}
                  onClick={close}
                  onMouseEnter={() => setCursor({ active: true })}
                  onMouseLeave={resetCursor}
                  className="btn-primary group"
                >
                  {section.cta.label}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={close}
                  onMouseEnter={() => setCursor({ active: true })}
                  onMouseLeave={resetCursor}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-bone"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  )
}
