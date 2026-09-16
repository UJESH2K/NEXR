'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Mail, X } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/contact'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { closeContactModal, useContactModalOpen } from '@/lib/contactModalStore'
import { Portal } from './Portal'

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: resetCursor,
}

/**
 * The quick way to reach someone, without leaving the page.
 *
 * "Start a conversation" used to be a link to /contact, which is a full page
 * with a form-shaped set of routes and a hero. For someone who just wants to
 * ask a two-line question, sending them to a whole page they then have to
 * leave again is a needless trip. This is that same intent handled in place —
 * one email, sent directly from wherever they clicked.
 *
 * It does not replace /contact. The full page is still where "book a demo"
 * sends people — that is a real decision with a form on the other side of it,
 * and belongs on its own page — this is only for the quick version, and it
 * says so, with a link through to the full page for anyone who wants it.
 */
export function ContactModal() {
  const open = useContactModalOpen()

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeContactModal()
    }
    window.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto fixed inset-0 flex items-center justify-center p-5"
            style={{ zIndex: 'var(--z-sheet)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Start a conversation"
          >
            <button
              type="button"
              onClick={closeContactModal}
              aria-label="Close"
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/12 bg-[#16100b]/97 p-7 shadow-2xl shadow-black/60 md:p-9"
            >
              <div
                className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgb(255 121 1 / 0.16)' }}
              />

              <button
                type="button"
                onClick={closeContactModal}
                {...hoverable}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-bone/50 transition-colors hover:border-ember/50 hover:text-ember"
              >
                <X size={15} />
              </button>

              <p className="eyebrow relative">Start a conversation</p>

              <h2 className="relative mt-4 font-display text-[clamp(1.5rem,4vw,1.9rem)] leading-[1.2] text-bone">
                Tell us what you&rsquo;re trying to solve.
              </h2>

              <p className="relative mt-3 text-sm leading-relaxed text-sand/70">
                Send a note directly — no form, no waiting on a callback
                queue. A person reads every message that arrives here.
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Starting a conversation with NEXR')}`}
                {...hoverable}
                className="btn-primary group relative mt-7 w-full justify-center"
              >
                <Mail size={14} />
                {CONTACT_EMAIL}
              </a>

              <div className="relative mt-6 flex items-center gap-3 text-bone/25">
                <span className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                href="/contact"
                onClick={closeContactModal}
                {...hoverable}
                className="group relative mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/55 transition-colors hover:text-ember"
              >
                Book a full demo instead
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  )
}
