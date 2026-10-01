/**
 * Hand-drawn line doodles for the three audiences, drawn behind their cards.
 *
 * One stroke weight, round caps and slightly uneven curves, so they read as
 * sketched in the margin rather than as icons. They inherit `currentColor`, so
 * the card decides how loud they are. Static SVG: no filters, nothing animated
 * here, nothing for a phone to recompute while scrolling.
 */

export type Audience = 'workplaces' | 'education' | 'healthcare'

export function audienceFromHref(href: string): Audience {
  if (href.includes('education')) return 'education'
  if (href.includes('healthcare')) return 'healthcare'
  return 'workplaces'
}

const PATHS: Record<Audience, string[]> = {
  // a laptop with a rising chart, a mug of coffee, a spark of an idea
  workplaces: [
    'M40 52 Q40 46 46 46 L122 45 Q128 45 128 51 L129 98 Q129 103 123 103 L46 103 Q41 103 41 98 Z',
    'M26 108 L144 107 Q148 107 146 111 L141 118 Q139 121 135 121 L35 121 Q31 121 29 118 L24 111 Q23 108 26 108 Z',
    'M74 114 L96 114',
    'M53 90 L68 77 L81 85 L98 67 L114 59',
    'M105 57 L114 58 L112 67',
    'M164 84 L192 84 L190 118 Q190 123 185 123 L171 123 Q166 123 166 118 Z',
    'M192 92 Q204 92 203 102 Q202 112 190 111',
    'M172 74 Q166 67 172 60 Q178 53 172 46',
    'M184 74 Q178 67 184 60 Q190 53 184 46',
    'M152 22 L152 36 M145 29 L159 29',
    'M210 30 L210 38 M206 34 L214 34',
  ],
  // a graduation cap, an open book, a pencil
  education: [
    'M28 52 L80 31 L132 52 L80 73 Z',
    'M51 62 L51 82 Q80 97 109 82 L109 62',
    'M132 52 Q133 66 131 80',
    'M127 80 L131 93 L135 80 Z',
    'M138 112 Q160 101 182 110 L182 141 Q160 132 138 142 Z',
    'M182 110 Q204 101 226 112 L226 142 Q204 132 182 141',
    'M146 119 Q160 114 174 118 M146 127 Q160 122 174 126',
    'M190 118 Q204 114 218 119 M190 126 Q204 122 218 127',
    'M171 79 L165 95 L181 89 L219 51 L209 41 Z',
    'M209 41 L214 36 Q218 33 222 37 L224 39 Q227 43 224 46 L219 51',
    'M171 79 L177 85',
    'M40 110 L40 124 M33 117 L47 117',
    'M110 118 L110 126 M106 122 L114 122',
  ],
  // a heart with a pulse through it, a medical cross, a stethoscope
  healthcare: [
    'M78 128 Q30 98 34 66 Q38 42 60 44 Q73 45 78 60 Q83 45 96 44 Q118 42 122 66 Q126 98 78 128 Z',
    'M18 89 L50 88 L58 72 L68 108 L78 63 L88 99 L95 88 L138 89',
    'M168 22 Q168 20 170 20 L180 20 Q182 20 182 22 L182 36 L196 36 Q198 36 198 38 L198 48 Q198 50 196 50 L182 50 L182 64 Q182 66 180 66 L170 66 Q168 66 168 64 L168 50 L154 50 Q152 50 152 48 L152 38 Q152 36 154 36 L168 36 Z',
    'M160 82 C160 104 171 111 174 118',
    'M188 82 C188 104 177 111 174 118',
    'M174 118 C174 141 206 145 211 124',
    'M158 82 L162 82 M186 82 L190 82',
  ],
}

const CIRCLES: Record<Audience, [number, number, number][]> = {
  workplaces: [],
  education: [],
  healthcare: [[211, 116, 8]],
}

/**
 * The single-object version for small sizes: just the laptop, the cap, the
 * heart — cropped from the same drawings so the two never look like different
 * hands drew them.
 */
const ICON: Record<Audience, { box: string; paths: number[] }> = {
  workplaces: { box: '18 38 136 90', paths: [0, 1, 2, 3, 4] },
  education: { box: '22 24 118 76', paths: [0, 1, 2, 3] },
  healthcare: { box: '12 36 132 98', paths: [0, 1] },
}

export function AudienceIcon({ kind, className = '' }: { kind: Audience; className?: string }) {
  const icon = ICON[kind]
  return (
    <svg
      viewBox={icon.box}
      fill="none"
      stroke="currentColor"
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {icon.paths.map((i) => (
        <path key={i} d={PATHS[kind][i]} />
      ))}
    </svg>
  )
}

export function AudienceDoodle({ kind, className = '' }: { kind: Audience; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
      {CIRCLES[kind].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  )
}
