'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ArrowDown, ArrowUp, Compass } from 'lucide-react'

const GUIDE: Record<string, { label: string; message: string; step: string }> = {
  '/approach': {
    label: 'The way in',
    message: 'Start here: understand why people hesitate before support can help.',
    step: '01 / 05',
  },
  '/platform/meloworld': {
    label: 'Private first step',
    message: 'This is the quiet entry point: anonymous, familiar, and built for trust.',
    step: '02 / 05',
  },
  '/platform/vr-wellness': {
    label: 'Guided immersion',
    message: 'Explore how immersive work can make difficult progress feel possible.',
    step: '03 / 05',
  },
  '/trust': {
    label: 'Earned confidence',
    message: 'Here is the clinical and privacy basis behind the experience.',
    step: '04 / 05',
  },
  '/contact': {
    label: 'Take the next step',
    message: 'You have seen the system. Now let’s shape the right way in for your people.',
    step: '05 / 05',
  },
}

export function GuideNavigator() {
  const pathname = usePathname()
  const guide = GUIDE[pathname] ?? {
    label: 'Find your way in',
    message: 'Scroll through the experience. I will keep the important bits in view.',
    step: 'NEXR / 01',
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="pointer-events-auto fixed bottom-5 right-5 z-[35] w-[min(22rem,calc(100vw-2.5rem))] md:bottom-8 md:right-8"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#090b09]/85 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-ember/10 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember/50 text-ember">
            <Compass size={16} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">{guide.step}</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone/35">Navigator</span>
            </div>
            <h2 className="mt-2 font-display text-xl text-bone">{guide.label}</h2>
            <p className="mt-1 text-sm leading-relaxed text-sand/70">{guide.message}</p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-bone/35">Keep moving</span>
          <span className="flex items-center gap-1 text-ember/80" aria-hidden="true">
            <ArrowUp size={12} />
            <ArrowDown size={12} />
          </span>
        </div>
      </div>
    </motion.aside>
  )
}
