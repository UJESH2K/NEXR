'use client'

import { useState } from 'react'
import type { ExploreImage } from '@/lib/explore'

/**
 * A gallery card that works before its artwork exists.
 *
 * It always points at the real path. If the file is not there yet the load
 * fails and a designed placeholder takes over, printing the exact filename to
 * drop in — so adding artwork later is a copy into /public and nothing else. No
 * component, data file or build step has to change, which is the only way a
 * hand-off like this survives contact with a busy week.
 */
export function ImageSlot({
  item,
  tint,
  accent,
  className = '',
}: {
  item: ExploreImage
  tint: [string, string]
  accent: string
  className?: string
}) {
  const [missing, setMissing] = useState(false)
  const src = item.src ?? item.slot

  return (
    <figure
      data-explore-item
      className={`group relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      style={{
        aspectRatio: item.aspect,
        backgroundImage: `linear-gradient(140deg, ${tint[0]}, ${tint[1]})`,
      }}
    >
      {missing ? (
        <>
          {/* Faint grid, so an empty card still reads as a considered surface
              rather than as a broken one. */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg
              className="h-9 w-9 text-bone/15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">
              {item.label}
            </p>
            <p className="font-mono text-[10px] tracking-[0.08em] text-bone/25">
              drop file at public{item.slot}
            </p>
          </div>
        </>
      ) : (
        <img
          src={src}
          alt={item.label}
          loading="lazy"
          onError={() => setMissing(true)}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-80" />

      <figcaption className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center gap-2">
        <span
          className="h-px w-5 transition-all duration-500 group-hover:w-9"
          style={{ backgroundColor: accent }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
          {item.label}
        </span>
      </figcaption>
    </figure>
  )
}
