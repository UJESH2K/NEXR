/**
 * The scene's sky, carried indoors.
 *
 * Every sub page used to open on flat black, so stepping out of the warm,
 * lit room on the home page felt like changing site. This puts the same sky
 * behind the top of each page — the beat's own two sky colours, the ghost
 * NEXR wordmark the figure stands in front of, and the scene's grain — and
 * lets it settle into the page's warm black as you read down.
 *
 * Static by design: one gradient, one line of type and a tiled noise image.
 * Nothing here animates, so it costs one paint and nothing per frame.
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
      <p
        data-explore-ghost
        className="room-ghost absolute inset-x-0 select-none text-center font-display font-semibold leading-none"
      >
        NEXR
      </p>
      <div className="room-grain absolute inset-0" />
    </div>
  )
}
