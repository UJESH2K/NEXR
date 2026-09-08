'use client'

import { usePathname } from 'next/navigation'

/**
 * A soft darkening at the top and bottom of the scene, under the chrome.
 *
 * The palette being dark is what fixed the immediate problem, but relying on
 * that is fragile: it makes every future colour decision also a legibility
 * decision, and the first time someone brightens a beat the mark, the rail and
 * the corner readouts disappear again. This layer removes the dependency. The
 * chrome sits on a guaranteed ground of its own, so the sky is free to be any
 * colour it likes.
 *
 * Only the two edges are covered, and only where controls actually live —
 * the header and rail along the top, the big word, readout and social links
 * along the bottom. The middle third, where the figure stands, is untouched;
 * dimming that would be paying for legibility with the whole image.
 *
 * It sits between the canvas and the overlay layer in the stacking order, which
 * is why it is a sibling of the canvas here rather than a child of `main` —
 * `main` carries its own z-index and would trap this above the very content it
 * is meant to sit behind.
 */
export function ChromeScrim() {
  const pathname = usePathname()

  // Interior routes paint their own opaque backgrounds; there is nothing to
  // separate the chrome from there.
  if (pathname !== '/') return null

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'var(--z-scrim)' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 h-[clamp(120px,18vh,220px)]"
        style={{
          background:
            'linear-gradient(to bottom, rgb(20 9 5 / 0.72), rgb(20 9 5 / 0.33) 45%, transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[clamp(150px,26vh,300px)]"
        style={{
          background:
            'linear-gradient(to top, rgb(20 9 5 / 0.76), rgb(20 9 5 / 0.35) 42%, transparent)',
        }}
      />
    </div>
  )
}
