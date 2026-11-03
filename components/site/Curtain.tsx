/**
 * The load curtain, as plain server-rendered HTML.
 *
 * A doorway in a dark room that fills with warm light from the floor up as the
 * scene downloads — the site's whole idea ("it's a way in") before a word of
 * it is read. When the scene is ready the door opens toward the visitor: the
 * light floods the frame and dissolves into the room behind it.
 *
 * Being in the server HTML puts it in the very first paint, before any script
 * has run. Everything that moves is CSS (`.curtain` in globals.css); until
 * Preloader takes over, the light creeps up on its own so a slow connection
 * never sees a dead screen. Preloader then drives `--p` (0 to 1) from the real
 * download progress and adds the classes that open the door.
 *
 * The line under the door is the home page's own opening headline.
 */
const LINE = ['Step', 'into', 'wellbeing.', 'On', 'your', 'terms.']

export function Curtain() {
  return (
    <div id="nexr-curtain" className="curtain" role="status" aria-label="Loading NEXR">
      <div className="curtain__grain" aria-hidden="true" />

      <div className="curtain__stage" aria-hidden="true">
        <div className="curtain__halo" />
        <div className="curtain__door">
          <div className="curtain__light" />
          <div className="curtain__frame" />
        </div>
        <div className="curtain__floor" />
        <div className="curtain__horizon" />
      </div>

      <div className="curtain__copy" aria-hidden="true">
        <p className="curtain__word">
          <span>N</span>
          <span>E</span>
          <span>X</span>
          <span>R</span>
        </p>
        <p className="curtain__line">
          {LINE.map((word, i) => (
            <span key={word} style={{ animationDelay: `${0.75 + i * 0.09}s` }}>
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
