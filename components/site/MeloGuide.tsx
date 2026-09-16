'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Melo, as a page guide — bottom-right, MeloWorld's own page only.
 *
 * Everywhere else on the site the wayfinding is anonymous (GuideNavigator's
 * compass, RoomNav's plain arrow). Here it is the character MeloWorld is
 * named after, doing the same job in her own voice — which only makes sense
 * on the one page that is actually about her.
 *
 * She holds one pose. Nothing on this bubble loops or idles; the only motion
 * is a reaction to the pointer, on hover and on click, because a figure that
 * fidgets on its own reads as decoration and one that only moves when you
 * touch it reads as present.
 *
 * The portrait itself is a placeholder until a real one exists, following the
 * same hand-off pattern as the explore rooms' artwork: it always points at the
 * real file, and only falls back to a drawn mark if that file is not there —
 * see the `missing` state below. Drop a face crop at
 * `/public/brand/melo-face.webp` and this switches over with no code change.
 */

const FACE_SRC = '/brand/melo-face.webp'

function scrollToNextBeat() {
  const beats = Array.from(
    document.querySelectorAll<HTMLElement>('[data-route-beat]'),
  )
  // A little past the header, so a beat whose top has only just cleared it
  // does not count as "next" — the reader is still on it.
  const line = window.scrollY + 140

  const next = beats.find((beat) => {
    const top = beat.getBoundingClientRect().top + window.scrollY
    return top > line
  })

  if (next) {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    // Already on the last one: loop back rather than doing nothing, which is
    // what "asking if you want to keep going" implies once the answer runs out.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function MeloGuide() {
  const [open, setOpen] = useState(false)
  const [missing, setMissing] = useState(false)

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: resetCursor,
  }

  return (
    <div
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute bottom-full right-0 mb-4 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-white/12 bg-[#16100b]/97 p-5 shadow-2xl shadow-black/50"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              {...hoverable}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-bone/40 transition-colors hover:text-ember"
            >
              <X size={13} />
            </button>

            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember/80">
              Melo
            </p>
            <p className="mt-2 pr-4 text-[13.5px] leading-[1.6] text-bone/85">
              Hey, I&rsquo;m Melo — this is the space I live in. Want me to
              walk you to the next part, or would you rather explore on your
              own for now?
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  scrollToNextBeat()
                  setOpen(false)
                }}
                {...hoverable}
                className="btn-primary group w-full justify-center !py-2.5 text-[10px]"
              >
                Take me to the next part
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  {...hoverable}
                  className="flex-1 rounded-full border border-white/12 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-bone/50 transition-colors hover:text-bone"
                >
                  Not yet
                </button>
                <Link
                  href="/contact"
                  {...hoverable}
                  className="flex-1 rounded-full border border-ember/40 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ember transition-colors hover:bg-ember hover:text-ink"
                >
                  Book a demo
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        {...hoverable}
        aria-expanded={open}
        aria-label={open ? 'Close Melo' : "Talk to Melo, MeloWorld's guide"}
        whileHover={{ scale: 1.06, rotate: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 shadow-xl shadow-black/40"
        style={{ borderColor: open ? '#ff7901' : 'rgba(255,121,1,0.4)' }}
      >
        {missing ? (
          <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(255,168,99,0.35),rgba(22,16,11,0.95))]">
            <img
              src="/brand/meloworld-mark.webp"
              alt=""
              className="h-8 w-8 opacity-90"
            />
          </span>
        ) : (
          <img
            src={FACE_SRC}
            alt="Melo"
            onError={() => setMissing(true)}
            className="h-full w-full object-cover"
          />
        )}

        {/* A small "here" ping the first time — reads as a greeting, not a
            notification badge you have to dismiss. */}
        {!open ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#16100b] bg-ember"
          />
        ) : null}
      </motion.button>
    </div>
  )
}
