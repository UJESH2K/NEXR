'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Home, X } from 'lucide-react'
import { getExploreTopic, getNextTopic } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { useSceneReturn } from '@/lib/useSceneReturn'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Melo, as the guide for every page that is not the scene.
 *
 * This used to be three separate things: RoomNav (a Back/Home pill, bottom
 * left), GuideNavigator (a per-page orientation card, bottom right, on the
 * product pages only) and a MeloWorld-only version of this same idea. Three
 * pieces of chrome doing overlapping jobs in two different corners. Melo is
 * all three folded into one — a single widget, bottom right, on every route
 * except the scene itself, where she would be a stranger giving directions to
 * someone who has not met her yet.
 *
 * She holds one pose. Nothing here loops or idles on its own; the only motion
 * is a reaction to the pointer, because a figure that fidgets unprompted reads
 * as decoration and one that only moves when you touch it reads as present.
 *
 * The portrait at `/public/brand/melo-face.webp` is a real render of the site's
 * own character model (`public/models/final-character.glb`), not a photo or a
 * drawn placeholder — a headless Chromium page loaded the GLB with three.js,
 * framed a camera on her face and shoulders, and the frame was cropped and
 * exported from there. If it ever needs a different pose, angle or crop: put a
 * camera in front of the model at roughly (x:0, y:0.26, z:0.22) looking at
 * (0, 0.24, 0) with a ~30° vertical FOV, render square, then trim the empty
 * band above the hair before exporting.
 *
 * The fallback here still matters even though a real image exists now: `img`
 * elements fail for ordinary reasons — a bad deploy, a renamed file — and
 * falling back to the drawn mark rather than a broken-image icon is what the
 * `missing` state below is for. It follows the same hand-off pattern as the
 * explore rooms' artwork: point at the real file, and only fall back when it
 * genuinely is not there.
 */

const FACE_SRC = '/brand/melo-face.webp'

type Guide = { label: string; message: string; step: string }

/** Fixed copy for the routes that are not an explore room, where the
 *  content is not data-driven enough to build the message from. */
const GUIDE: Record<string, Guide> = {
  '/approach': {
    label: 'Our Approach',
    message: 'Start here: why awareness alone never closed the gap, and the belief NEXR is built on instead.',
    step: '01 / 08',
  },
  '/platform/meloworld': {
    label: 'MeloWorld',
    message: 'This is my home — a private, anonymous first step, taken as an avatar rather than yourself.',
    step: '02 / 08',
  },
  '/platform/vr-wellness': {
    label: 'VR Wellness',
    message: 'Guided, clinically supervised experiences for when someone is ready to go a little further.',
    step: '03 / 08',
  },
  '/trust': {
    label: 'Trust Centre',
    message: 'The clinical basis, the privacy model, and exactly what an employer can and cannot see.',
    step: '04 / 08',
  },
  '/for/workplaces': {
    label: 'For Workplaces',
    message: 'What changes for an organisation once the first step is actually taken, not just offered.',
    step: '05 / 08',
  },
  '/for/education': {
    label: 'For Education',
    message: 'How this fits a campus rather than a clinic — private, on the device a student already has.',
    step: '06 / 08',
  },
  '/for/healthcare': {
    label: 'For Healthcare',
    message: 'Built around clinical judgement, never instead of it. Assessment and consent come first.',
    step: '07 / 08',
  },
  '/contact': {
    label: "Let's talk",
    message: 'Tell us about your organisation and we will shape the right way in for your people.',
    step: '08 / 08',
  },
  '/explore': {
    label: 'The six rooms',
    message: 'Every beat of the scene, told at length. Pick whichever one you want to read first.',
    step: 'Explore',
  },
}

const FALLBACK_GUIDE: Guide = {
  label: 'Find your way in',
  message: "I'm Melo — I keep track of the site so you don't have to. Ask me for the next part whenever you're ready.",
  step: 'NEXR',
}

function useGuide(pathname: string): { guide: Guide; nextHref: string | null; nextLabel: string } {
  return useMemo(() => {
    if (pathname.startsWith('/explore/')) {
      const slug = pathname.split('/')[2]
      const topic = getExploreTopic(slug)
      if (topic) {
        const next = getNextTopic(slug)
        return {
          guide: {
            label: topic.word,
            message: topic.lede,
            step: `${topic.index} / 06`,
          },
          nextHref: `/explore/${next.slug}`,
          nextLabel: `Continue to ${next.word}`,
        }
      }
    }

    const guide = GUIDE[pathname] ?? FALLBACK_GUIDE
    return { guide, nextHref: null, nextLabel: 'Take me to the next part' }
  }, [pathname])
}

/** Scrolls to the next `data-route-beat` section — every PageShell page has
 *  these, so this works generically rather than per page. */
function scrollToNextBeat() {
  const beats = Array.from(
    document.querySelectorAll<HTMLElement>('[data-route-beat]'),
  )
  const line = window.scrollY + 140
  const next = beats.find((beat) => beat.getBoundingClientRect().top + window.scrollY > line)

  if (next) {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function MeloNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [missing, setMissing] = useState(false)
  const { topic, goBack, goHome } = useSceneReturn()
  const { guide, nextHref, nextLabel } = useGuide(pathname)

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: resetCursor,
  }

  const goNext = () => {
    setOpen(false)
    if (nextHref) router.push(nextHref)
    else scrollToNextBeat()
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
            className="absolute bottom-full right-0 mb-4 w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/12 bg-[#16100b]/97 shadow-2xl shadow-black/50"
          >
            <div className="relative p-5 pb-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                {...hoverable}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-bone/40 transition-colors hover:text-ember"
              >
                <X size={13} />
              </button>

              <div className="flex items-center gap-2 pr-6">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember/80">
                  Melo &middot; {guide.label}
                </p>
              </div>

              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/30">
                {guide.step}
              </p>

              <p className="mt-3 text-[13.5px] leading-[1.6] text-bone/85">
                {guide.message}
              </p>
            </div>

            {/* Quick actions, in order of how often each one gets used —
                onward first, then the two ways back, then the demo. */}
            <div className="space-y-1.5 border-t border-white/10 p-3">
              <button
                type="button"
                onClick={goNext}
                {...hoverable}
                className="btn-primary group w-full justify-center !py-2.5 text-[10px]"
              >
                {nextLabel}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              {topic ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    goBack()
                  }}
                  {...hoverable}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <ArrowLeft size={14} className="shrink-0 text-bone/40" />
                  <span className="min-w-0 text-[12px] leading-tight text-bone/70">
                    Back to{' '}
                    <span className="numeral text-[0.95em]">
                      {String(topic.index + 1).padStart(2, '0')}
                    </span>{' '}
                    {topic.word}
                  </span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  goHome()
                }}
                {...hoverable}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <Home size={14} className="shrink-0 text-bone/40" />
                <span className="text-[12px] text-bone/70">Start over from the beginning</span>
              </button>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                {...hoverable}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-ember"
                >
                  &rarr;
                </span>
                <span className="text-[12px] text-ember/90">Book a demo</span>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        {...hoverable}
        aria-expanded={open}
        aria-label={open ? 'Close Melo' : "Talk to Melo, NEXR's guide"}
        whileHover={{ scale: 1.06, rotate: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 shadow-xl shadow-black/40"
        style={{ borderColor: open ? '#ff7901' : 'rgba(255,121,1,0.4)' }}
      >
        {missing ? (
          <span className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(255,168,99,0.35),rgba(22,16,11,0.95))]">
            <img src="/brand/meloworld-mark.webp" alt="" className="h-8 w-8 opacity-90" />
          </span>
        ) : (
          <img
            src={FACE_SRC}
            alt="Melo"
            onError={() => setMissing(true)}
            className="h-full w-full object-cover"
          />
        )}

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
