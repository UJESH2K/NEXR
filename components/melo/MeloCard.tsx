'use client'

import { forwardRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export const EASE = [0.16, 1, 0.3, 1] as const

export const faceSrc = (pose: number) => `/brand/melo/face-${pose}.webp`

/**
 * The speech card Melo talks through — shared by her messages and the tour so
 * the two can never drift apart visually.
 *
 * Melo herself appears once, in the avatar circle under this card; her pose
 * there changes with what she is saying. The tail on the card's lower-right
 * edge points down at that circle, so the words read as hers. Callers turn it
 * off when the card is not sitting directly above her.
 */
export const MeloCard = forwardRef<
  HTMLDivElement,
  {
    label?: string
    meta?: string
    onClose?: () => void
    closeLabel?: string
    tail?: boolean
    children: ReactNode
    role?: 'dialog' | 'status'
  }
>(function MeloCard({ label, meta, onClose, closeLabel = 'Close', tail = true, children, role = 'status' }, ref) {
  return (
    <div ref={ref} className="relative w-[min(22rem,calc(100vw-2rem))]">
      {tail ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-[6px] right-[22px] z-0 h-3 w-3 rotate-45 border-b border-r border-white/12 bg-[#16100b] md:right-[26px]"
        />
      ) : null}

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
