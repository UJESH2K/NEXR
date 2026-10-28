'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { EXPLORE_INDEX, EXPLORE_TOPICS } from '@/lib/explore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { requestReturn } from '@/lib/returnStore'
import { RoomSky } from '@/components/site/RoomSky'
import { ClosingCta } from '@/components/site/ClosingCta'
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  TextStaggerHover,
  useIsActiveSlide,
  useSlideTrigger,
} from '@/components/ui/animated-slideshow'

/**
 * The Explore page.
 *
 * A hover slider: the room names roll over letter by letter as the pointer
 * (or keyboard focus) reaches them, and the picture beside the list wipes to
 * that room. The words are the Explore tab of the content document.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

function Row({ index }: { index: number }) {
  const item = EXPLORE_INDEX[index]
  const active = useIsActiveSlide(index)
  const trigger = useSlideTrigger(index)

  return (
    <motion.li
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 + index * 0.06 }}
      className="border-b border-white/10"
    >
      <Link
        href={item.href}
        aria-label={`${item.word}. ${item.note}`}
        {...trigger}
        onMouseEnter={() => {
          trigger.onMouseEnter()
          setCursor({ active: true })
        }}
        onMouseLeave={resetCursor}
        className="group flex items-center gap-5 py-6 md:py-7"
      >
        <span className="min-w-0 flex-1">
          <TextStaggerHover
            index={index}
            text={item.word}
            className="font-display text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-bone"
          />
          <span
            aria-hidden="true"
            className={`mt-2 block text-[15px] leading-relaxed transition-colors duration-500 ${
              active ? 'text-sand/80' : 'text-sand/45'
            }`}
          >
            {item.note}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
            active
              ? 'border-ember bg-ember text-ink'
              : 'border-white/15 text-bone/40 group-hover:border-white/30'
          }`}
        >
          <ArrowUpRight size={18} className={`transition-transform duration-500 ${active ? 'rotate-0' : '-rotate-45'}`} />
        </span>
      </Link>
    </motion.li>
  )
}

/** The caption under the picture, following whichever room is lit. */
function Caption() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-void/90 via-void/40 to-transparent p-6 md:p-8">
      <AnimatePresence mode="wait">
        {EXPLORE_INDEX.map((item, i) => (
          <CaptionLine key={item.key} index={i} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function CaptionLine({ index }: { index: number }) {
  const active = useIsActiveSlide(index)
  const item = EXPLORE_INDEX[index]
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex items-center gap-3"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-ember shadow-[0_0_0_4px_rgb(255_121_1/0.2)]" />
      <span className="font-display text-xl text-bone">{item.word}</span>
    </motion.div>
  )
}

export function ExploreIndex() {
  return (
    <div className="safe-bottom pointer-events-auto relative isolate min-h-svh bg-abyss pb-20 pt-28 md:pb-24 md:pt-32">
      <RoomSky sky={EXPLORE_TOPICS[0].tint} accent={EXPLORE_TOPICS[0].accent} />

      <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-10">
        <Link
          href="/"
          onClick={requestReturn}
          {...hoverable}
          className="group inline-flex items-center gap-2 text-[13px] text-bone/60 transition-colors hover:text-ember"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to the experience
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: EASE }}
            className="text-balance font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.04] text-bone"
          >
            Find your way into wellbeing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="max-w-[46ch] text-[15.5px] leading-[1.85] text-sand/70 lg:pb-3"
          >
            Explore five rooms, each designed around a different way to engage with wellbeing.
            Start with what matters to you, and discover an approach that feels right.
          </motion.p>
        </div>

        <HoverSlider className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <ul data-tour="explore-list" className="order-2 border-t border-white/10 lg:order-1">
            {EXPLORE_INDEX.map((item, i) => (
              <Row key={item.key} index={i} />
            ))}
          </ul>

          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#a65f20] to-[#311c08] shadow-2xl shadow-black/50 lg:sticky lg:top-32"
            >
              <HoverSliderImageWrap className="aspect-[16/10] lg:aspect-[4/5]">
                {EXPLORE_INDEX.map((item, i) => (
                  <HoverSliderImage
                    key={item.key}
                    index={i}
                    imageUrl={item.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="size-full object-cover mix-blend-luminosity brightness-125"
                  />
                ))}
              </HoverSliderImageWrap>
              <Caption />
            </motion.div>
          </div>
        </HoverSlider>

        <ClosingCta className="mt-20 md:mt-28" />
      </div>
    </div>
  )
}
