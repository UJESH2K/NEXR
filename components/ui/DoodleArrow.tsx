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

export type DoodleDirection = 'left-down' | 'up-right' | 'down-right'

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
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="doodle-line"
      />
      <path
        d={path.head}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="doodle-head"
      />
    </svg>
  )
}
