/**
 * Switches for evaluating the scene one layer at a time.
 *
 * The 3D room is several systems drawn on top of each other — sky, ground,
 * figure, panels, type — and when the composition is wrong it is much faster to
 * turn a layer off than to reason about which one is at fault. These are plain
 * constants rather than runtime state so a disabled layer costs nothing: the
 * component is never mounted, so its textures are never fetched and its frame
 * loop never registered.
 */

/**
 * The orbiting artwork panels.
 *
 * Currently off. They were sitting across the character rather than beside her:
 * the hero card renders about twice the width the camera-space solver in
 * PanelField computes for it, which puts its inner edge past the centre line.
 * The cause is not yet identified, so the layer is parked rather than left in
 * the frame covering the subject.
 *
 * Turn back on once the sizing is understood.
 */
export const SHOW_PANELS = false

/** The dark outcrop the character stands on. */
export const SHOW_PLINTH = true

/** The oversized wordmark on a plane behind the figure. */
export const SHOW_GHOST_WORDMARK = true
