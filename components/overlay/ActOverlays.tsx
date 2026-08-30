'use client'

import { AnimatePresence, motion, type Transition } from 'framer-motion'
import Link from 'next/link'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'

const TRANSITION: Transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] }

const ENTER = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
}

export function ActOverlays() {
  const { act, mode } = useScrollSnapshot()

  const hidden = mode === 'transition'

  return (
    <div
      className="overlay-layer fixed inset-0 flex"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <AnimatePresence mode="wait">
        {hidden ? null : act === 0 ? (
          <motion.div
            key="act-0"
            {...ENTER}
            transition={TRANSITION}
            className="absolute bottom-[10svh] left-6 max-w-[34rem] md:left-16"
          >
            <p className="eyebrow mb-5 text-lime">Workplace wellbeing, reimagined</p>
            <h1 className="display text-balance text-[clamp(2.6rem,6.5vw,5.25rem)] text-bone">
              The hardest part isn&rsquo;t offering support.
            </h1>
            <p className="serif-accent mt-4 text-2xl text-sand/80 md:text-3xl">
              It&rsquo;s helping people feel safe enough to use it.
            </p>
            <p className="mt-10 font-mono text-xs uppercase tracking-[0.28em] text-bone/40">
              Scroll
            </p>
          </motion.div>
        ) : act === 1 ? (
          <motion.div
            key="act-1"
            {...ENTER}
            transition={TRANSITION}
            className="absolute bottom-[12svh] left-1/2 w-[min(46rem,88vw)] -translate-x-1/2 text-center"
          >
            <h2 className="display text-balance text-[clamp(2.4rem,5.5vw,4.5rem)] text-bone">
              Help shouldn&rsquo;t cost you your privacy.
            </h2>
            <p className="mx-auto mt-6 max-w-[38rem] text-base leading-relaxed text-sand/75 md:text-lg">
              NEXR helps organisations remove the invisible barriers that stop
              employees from seeking support &mdash; through a connected
              workplace wellbeing ecosystem built around privacy, accessibility
              and immersive care.
            </p>
          </motion.div>
        ) : act === 2 ? (
          <motion.div
            key="act-2"
            {...ENTER}
            transition={TRANSITION}
            className="absolute top-[8svh] left-1/2 -translate-x-1/2 text-center"
          >
            
          </motion.div>
        ) : (
          <motion.div
            key="act-3"
            {...ENTER}
            transition={TRANSITION}
            className="absolute bottom-[14svh] left-1/2 w-[min(48rem,88vw)] -translate-x-1/2 text-center"
          >
            <h2 className="display text-balance text-[clamp(1.9rem,4vw,3.4rem)] text-bone">
              Healthier organisations begin with people who feel safe enough to
              seek support.
            </h2>
            <p className="serif-accent mt-5 text-2xl text-sand/80">
              Let&rsquo;s start the conversation.
            </p>
            <Link href="/contact" className="btn mt-9 inline-flex">
              Book a Demo
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
