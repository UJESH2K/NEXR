'use client'

/**
 * A hand-drawn arrow that sketches itself in.
 *
 * Both paths are stroked with a dash the length of the path itself, so
 * animating the offset traces the line as if by hand rather than fading a
 * finished shape in. The head is held back until the line is nearly complete,
 * which is what makes the two shapes read as one gesture instead of two
 * elements arriving together.
 *
 * The curves are drawn loose and slightly lopsided on purpose. A geometrically
 * perfect arc reads as a diagram; the point of this is that it looks like
 * someone leaned over and pointed.
 */

export type DoodleDirection = 'left-down' | 'up-right' | 'down-right' | 'into-left'

/** Line and arrowhead per direction, all in a 132 × 74 box. */
const PATHS: Record<DoodleDirection, { line: string; head: string }> = {
  // Starts top-right, sweeps down and to the left. Used beside Explore.
  'left-down': {
    line: 'M126 8c-13 27-37 45-70 47',
    head: 'M56 55l15-7M56 55l13 9',
  },
  // Starts bottom-left, rises to the right. Used under the header's call to
  // action, pointing up at it.
  'up-right': {
    line: 'M6 66c15-26 38-44 70-47',
    head: 'M76 19l-15 5M76 19l-11 10',
  },
  // Starts on the right a little above the tip, loops once, and lands
  // pointing left at the very left edge of the box — so the box can sit flush against the right side of
  // a button and the tip touches it. Used beside each beat's call to action.
  'into-left': {
    line: 'M122 22c-5 10-17 13-24 8-6-5 0-13 7-9 8 5 2 20-14 26-22 8-50 9-82 7',
    head: 'M9 54l13-8M9 54l13 8',
  },
  // Starts top-left, falls to the right. Used above the social links.
  'down-right': {
    line: 'M6 8c15 26 38 44 70 47',
    head: 'M76 55l-15-4M76 55l-10-11',
  },
}

export function DoodleArrow({
  direction,
  className = '',
  width = 118,
}: {
  direction: DoodleDirection
  className?: string
  width?: number
}) {
  const path = PATHS[direction]

  return (
    <svg
      viewBox="0 0 132 74"
      width={width}
      height={(width * 74) / 132}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={path.line}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="doodle-line"
      />
      <path
        d={path.head}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="doodle-head"
      />
    </svg>
  )
}
