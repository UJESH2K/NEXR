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
 * The NEXR wordmark, signing off the document.
 *
 * The scene opens on this word; every interior page closes on it. It lives in
 * the site footer and runs off the bottom edge of the page, so what shows is
 * the top of the letters fading out — a watermark under the legal line rather
 * than a heading, and never behind copy it would compete with.
 *
 * It used to end the article instead, which worked only while the article was
 * the end of the page. Once the footer existed, the cut it relied on stopped
 * being the page edge and became a hard line across the middle of the screen.
 */
export function FooterSignature() {
  return (
    <div aria-hidden="true" className="footer-signature">
      <span>NEXR</span>
    </div>
  )
}
