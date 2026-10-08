/**
 * The scene's sky, carried indoors.
 *
 * Every sub page used to open on flat black, so stepping out of the warm,
 * lit room on the home page felt like changing site. This puts the same sky
 * behind the top of each page — the beat's own two sky colours and the scene's
 * grain — and lets it settle into the page's warm black as you read down.
 *
 * No wordmark up here. It used to sit behind the headline and muddied it; the
 * page signs off with it at the foot instead (RoomSignature), where there is
 * no text for it to compete with.
 *
 * Static by design: one gradient and a tiled noise image. Nothing here
 * animates, so it costs one paint and nothing per frame.
 */
export function RoomSky({
  sky,
  accent,
  className = '',
}: {
  sky: [string, string]
  accent: string
  className?: string
}) {
  return (
    <div aria-hidden="true" className={`room-sky pointer-events-none absolute inset-x-0 top-0 -z-10 ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 60% at 72% 8%, ${accent}38, transparent 70%), linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 52%, var(--color-abyss) 100%)`,
        }}
      />
      <div className="room-grain absolute inset-0" />
    </div>
  )
}

/**
 * The NEXR wordmark, at the foot of a sub page.
 *
 * The scene opens on this word; the sub pages close on it. It sits below the
 * last line of content, fades out toward the bottom edge and is cut by it, so
 * it reads as a signature rather than as a heading — and it never sits behind
 * text it would compete with.
 */
export function RoomSignature({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`room-signature ${className}`}>
      <span>NEXR</span>
    </div>
  )
}
