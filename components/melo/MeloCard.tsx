'use client'

import { forwardRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { MeloPose } from '@/lib/melo/store'

export const EASE = [0.16, 1, 0.3, 1] as const

export const poseSrc = (pose: MeloPose) => `/brand/melo/pose-${pose}.webp`
export const faceSrc = (pose: MeloPose) => `/brand/melo/face-${pose}.webp`

/**
 * The speech card Melo talks through — shared by her messages and the tour so
 * the two can never drift apart visually.
 *
 * She stands behind the card's top-right corner, cut at the waist by its edge,
 * so it reads as her holding it up rather than as a notification with a
 * picture on it. Her pose changes with what she is saying; the swap is a short
 * cross-fade on a pre-loaded image, which costs nothing.
 */
export const MeloCard = forwardRef<
  HTMLDivElement,
  {
    pose: MeloPose
    label?: string
    meta?: string
    onClose?: () => void
    closeLabel?: string
    compactFigure?: boolean
    children: ReactNode
    role?: 'dialog' | 'status'
  }
>(function MeloCard({ pose, label, meta, onClose, closeLabel = 'Close', compactFigure, children, role = 'status' }, ref) {
  return (
    <div
      ref={ref}
      className={`relative w-[min(22rem,calc(100vw-2rem))] ${compactFigure ? 'pt-[64px]' : 'pt-[96px] md:pt-[118px]'}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-1 top-0 z-0 ${
          compactFigure ? 'h-[84px] w-[84px]' : 'h-[124px] w-[124px] md:h-[148px] md:w-[148px]'
        }`}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={pose}
            src={poseSrc(pose)}
            alt=""
            draggable={false}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="absolute inset-0 h-full w-full select-none object-contain object-bottom drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
          />
        </AnimatePresence>
      </div>

      <div
        role={role}
        aria-live={role === 'status' ? 'polite' : undefined}
        className="melo-card relative z-10 overflow-hidden rounded-2xl border border-white/12 bg-[#16100b]/95 shadow-2xl shadow-black/50 backdrop-blur-md"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/70 to-transparent" />
        <div className="p-4 pb-3.5 md:p-5 md:pb-4">
          {label || meta || onClose ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {label ? (
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    <span className="truncate">{label}</span>
                  </p>
                ) : null}
                {meta ? (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/35">{meta}</p>
                ) : null}
              </div>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeLabel}
                  className="-mr-1.5 -mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bone/40 transition-colors hover:bg-white/5 hover:text-ember"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
})
