'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CARDS } from '@/lib/cards'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { TextGenerateEffect } from './TextGenerateEffect'

/**
 * Scroll-driven card overlay during act 2.
 *
 * Cards alternate sides — but both panels always sit at the far edges of the
 * screen, away from the centred character:
 *   - Even (0, 2, 4): text FAR LEFT, video FAR RIGHT
 *   - Odd  (1, 3, 5): text FAR RIGHT, video FAR LEFT
 */
export function CardOverlays() {
  const { activeCard, mode } = useScrollSnapshot()

  const cardIndex = activeCard
  const card = cardIndex >= 0 ? CARDS[cardIndex] : null
  const visible = card !== null && mode === 'home'

  const textOnLeft = cardIndex % 2 === 0

  return (
    <div
      className="overlay-layer fixed inset-0 pointer-events-none"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <AnimatePresence mode="wait">
        {visible && card ? (
          <motion.div
            key={card.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 pointer-events-auto"
          >
            {/* ── Text panel: always at the far edge ───────────── */}
            <motion.div
              initial={{ opacity: 0, x: textOnLeft ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: textOnLeft ? -30 : 30 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                [textOnLeft ? 'left' : 'right']: 'clamp(24px, 5vw, 80px)',
                maxWidth: '340px',
                width: '32vw',
              }}
            >
              <p className="eyebrow text-lime">{card.eyebrow}</p>

              <TextGenerateEffect
                words={card.title}
                as="h3"
                className="mt-3 font-display text-3xl font-semibold leading-tight text-bone md:text-4xl"
                duration={0.6}
                staggerDelay={0.12}
              />

              <p className="mt-4 text-sm leading-relaxed text-sand/70 md:text-base">
                {card.blurb}
              </p>

              <Link
                href={card.route}
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-lime"
              >
                Explore
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </motion.div>

            {/* ── Video panel: always at the far edge ──────────── */}
            <motion.div
              initial={{ opacity: 0, x: textOnLeft ? 60 : -60, rotateY: textOnLeft ? -10 : 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: textOnLeft ? 40 : -40, rotateY: textOnLeft ? 6 : -6 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                [textOnLeft ? 'right' : 'left']: 'clamp(24px, 5vw, 80px)',
                maxWidth: '480px',
                width: '40vw',
                perspective: '1200px',
              }}
            >
              <VideoThumbnail card={card} mirror={!textOnLeft} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// ── Video thumbnail sub-component ─────────────────────────────────────────

function VideoThumbnail({
  card,
  mirror = false,
}: {
  card: (typeof CARDS)[number]
  mirror?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const href = card.videoUrl || card.route

  return (
    <a
      href={href}
      target={card.videoUrl ? '_blank' : undefined}
      rel={card.videoUrl ? 'noopener noreferrer' : undefined}
      className="group relative block w-full outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Play ${card.title} video`}
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
    >
      {/* 3D frame */}
      <div
        className="relative overflow-hidden rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: hovered
            ? 'perspective(1200px) rotateY(-4deg) rotateX(2deg) scale(1.03)'
            : 'perspective(1200px) rotateY(-2deg) rotateX(1deg) scale(1)',
          boxShadow: hovered
            ? `0 0 50px ${card.tint[0]}40, 0 35px 90px rgba(0,0,0,0.7)`
            : `0 0 25px ${card.tint[0]}20, 0 20px 60px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Glow border */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-500"
          style={{
            border: `1px solid ${card.tint[0]}55`,
            opacity: hovered ? 1 : 0.4,
          }}
        />

        {/* Thumbnail — 16:9 */}
        <div
          className="relative w-full overflow-hidden rounded-xl bg-void/50"
          style={{ aspectRatio: '16 / 9' }}
        >
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient scrim */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Play button */}
          <div
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300"
            style={{
              background: hovered ? `${card.tint[0]}dd` : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
              boxShadow: hovered
                ? `0 0 40px ${card.tint[0]}55, 0 8px 32px rgba(0,0,0,0.3)`
                : '0 4px 24px rgba(0,0,0,0.35)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Corner accent */}
          <div
            className="absolute left-3 top-3 h-2 w-2 rounded-full transition-opacity duration-500"
            style={{ background: card.tint[0], opacity: hovered ? 0.8 : 0.3 }}
          />
        </div>
      </div>

      {/* Caption below — unmirror the text */}
      <p
        className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-bone/35"
        style={mirror ? { transform: 'scaleX(-1)' } : undefined}
      >
        {card.title}
      </p>
    </a>
  )
}
