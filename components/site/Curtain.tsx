/**
 * The load curtain, as plain server-rendered HTML.
 *
 * It used to be a client component portalled into <body> after React mounted,
 * which meant the browser's first paint — header, logo, buttons — came before
 * it. That frame is the "glimpse" of the site before the loading screen. Being
 * in the server HTML puts the curtain in the very first paint, before any
 * script has run, on any connection speed.
 *
 * Everything that moves here is CSS (see `.curtain` in globals.css), so it is
 * already animating before JavaScript arrives. Preloader then takes it over:
 * it drives the ring from the real download progress and lifts the curtain
 * away when the scene is ready. On routes other than the home page, an inline
 * script in the layout marks the page before first paint and CSS keeps the
 * curtain hidden.
 *
 * No hooks, no state: it is static markup, and nothing about it changes until
 * Preloader touches it after hydration.
 */
export function Curtain() {
  return (
    <div id="nexr-curtain" className="curtain" role="status" aria-label="Loading NEXR">
      <div className="curtain__glow" aria-hidden="true" />
      <div className="curtain__grain" aria-hidden="true" />

      <div className="curtain__body">
        <div className="curtain__mark" aria-hidden="true">
          <svg className="curtain__orbit" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="68" pathLength={100} />
          </svg>
          <svg className="curtain__ring" viewBox="0 0 120 120">
            <circle className="curtain__track" cx="60" cy="60" r="56" pathLength={100} />
            <circle className="curtain__fill" cx="60" cy="60" r="56" pathLength={100} />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element -- must paint before any JS */}
          <img src="/brand/meloworld-mark.webp" alt="" width={192} height={139} fetchPriority="high" />
        </div>

        <p className="curtain__word" aria-hidden="true">
          <span>N</span>
          <span>E</span>
          <span>X</span>
          <span>R</span>
        </p>

        <p className="curtain__label">Loading the room</p>
      </div>
    </div>
  )
}
