/**
 * Single mutable source of truth for everything the frame loop reads.
 *
 * Two rules keep this cheap:
 *   1. Continuous values (scroll position, pointer, per-section progress) live
 *      on the plain `scroll` object and are read directly inside useFrame. They
 *      never touch React state, so a 120Hz scroll causes zero re-renders.
 *   2. Discrete values (which section is active, which mode we are in) are
 *      mirrored into an immutable snapshot that React subscribes to through
 *      useSyncExternalStore, and only republished when one actually changes.
 */

import { SECTION_COUNT } from './sections'

export type ScrollMode = 'home' | 'transition'

/** Kept as an alias so older imports keep resolving. */
export const CARD_COUNT = SECTION_COUNT

/**
 * Where inside a beat the scroll comes to rest.
 *
 * It has to sit inside the hold and before the pose change begins at 0.5 (see
 * CharacterModel) or letting go of the wheel would strand the figure between
 * two poses. Both the snap in HomeScrollDriver and the jump-to-beat in
 * ScrollProvider aim at it, which is why it lives here rather than in either.
 */
export const SECTION_REST_POINT = 0.32

export const scroll = {
  /** 0..1 across the whole home track. */
  homeProgress: 0,
  /** 0..1 within the active section's slice of the track. */
  segmentProgress: 0,
  /**
   * Fractional section position, i.e. homeProgress * SECTION_COUNT clamped to
   * the last section's right edge. Consumers that need to blend between two
   * beats (sky colour, character pose, fog) read this and nothing else.
   */
  sectionFloat: 0,
  /** 0..1 while a clicked panel expands to fill the frame. */
  transitionProgress: 0,
  mode: 'home' as ScrollMode,
  armedCard: null as number | null,
  expandedCard: null as number | null,
  activeCardIndex: 0,
  currentSegment: 0,

  /**
   * Pointer in normalised device coordinates (-1..1), already smoothed. The
   * camera, sky and panels all lean on this, so smoothing once here is what
   * stops three independent easings from drifting apart.
   */
  pointerX: 0,
  pointerY: 0,
  /** Raw, unsmoothed pointer — written by the listener, read by the smoother. */
  rawPointerX: 0,
  rawPointerY: 0,
  /** Pointer speed 0..1, decays to zero when the mouse rests. */
  pointerEnergy: 0,

  /** 0..1 asset load progress, and whether the load curtain has lifted. */
  loadProgress: 0,
  entered: false,
  /**
   * Whether the visitor has pressed Explore.
   *
   * The page is deliberately unscrollable until they do. The opening frame is a
   * held shot — the figure, the room and one line of copy — and letting a stray
   * wheel event slide it away before anyone has read it wastes the only moment
   * the composition gets on its own.
   */
  started: false,

  /** Written by CameraRig each frame so overlays can match the projection. */
  camAzimuth: 0,
  camRadius: 80,
  camFov: 43,
}

/**
 * Map raw document progress onto the section grid.
 *
 * The right edge of each interval belongs to that section rather than the next
 * one, so a scroll snap landing exactly on a boundary leaves the section it
 * just finished fully settled instead of flickering to the following beat.
 */
export function setHomeProgress(progress: number) {
  const value = clamp01(progress)
  scroll.homeProgress = value
  scroll.sectionFloat = Math.min(value * SECTION_COUNT, SECTION_COUNT - 1e-6)

  if (value <= 0) {
    scroll.currentSegment = 0
    scroll.activeCardIndex = 0
    scroll.segmentProgress = 0
    return
  }

  const scaled = value * SECTION_COUNT
  const active = Math.min(Math.ceil(scaled) - 1, SECTION_COUNT - 1)
  scroll.currentSegment = active
  scroll.activeCardIndex = active
  scroll.segmentProgress = scaled - active
}

// ── math helpers ────────────────────────────────────────────────────────────

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const remap = (v: number, a: number, b: number) =>
  a === b ? 0 : clamp01((v - a) / (b - a))

export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = remap(v, edge0, edge1)
  return t * t * (3 - 2 * t)
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)

export const easeOutExpo = (t: number) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)

/** Framerate-independent exponential approach, matching MathUtils.damp. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

// ── discrete snapshot for React consumers ───────────────────────────────────

export type ScrollSnapshot = {
  activeCard: number
  mode: ScrollMode
  armedCard: number | null
  /** True once the visitor has scrolled off the hero. */
  past: boolean
  /** True once Explore has been pressed and scrolling is unlocked. */
  started: boolean
}

const listeners = new Set<() => void>()

let snapshot: ScrollSnapshot = {
  activeCard: 0,
  mode: 'home',
  armedCard: null,
  past: false,
  started: false,
}

export const getSnapshot = () => snapshot

/**
 * One cached object, for the same reason as in cursorStore: useSyncExternalStore
 * compares snapshots by identity, so a getter that builds a fresh object each
 * call reports a change on every render and React warns about an infinite loop.
 * The server has no scroll position, so the opening beat is always correct here.
 */
const SERVER_SNAPSHOT: ScrollSnapshot = {
  activeCard: 0,
  mode: 'home',
  armedCard: null,
  past: false,
  started: false,
}

export const getServerSnapshot = (): ScrollSnapshot => SERVER_SNAPSHOT

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Recompute the discrete snapshot and notify React, but only when something
 * changed. This runs on every scroll tick, so the equality check is what keeps
 * a 60Hz scroll from re-rendering the overlay tree 60 times a second.
 */
export function syncSnapshot() {
  const past = scroll.homeProgress > 0.012

  if (
    snapshot.activeCard === scroll.activeCardIndex &&
    snapshot.mode === scroll.mode &&
    snapshot.armedCard === scroll.armedCard &&
    snapshot.past === past &&
    snapshot.started === scroll.started
  ) {
    return
  }

  snapshot = {
    activeCard: scroll.activeCardIndex,
    mode: scroll.mode,
    armedCard: scroll.armedCard,
    past,
    started: scroll.started,
  }
  listeners.forEach((l) => l())
}

export function resetScrollState() {
  scroll.segmentProgress = 0
  scroll.homeProgress = 0
  scroll.sectionFloat = 0
  scroll.transitionProgress = 0
  scroll.mode = 'home'
  scroll.armedCard = null
  scroll.expandedCard = null
  scroll.activeCardIndex = 0
  scroll.currentSegment = 0
  // Coming back to the home route re-arms the held opening shot, so the visitor
  // lands on the composition rather than mid-beat.
  scroll.started = false
  syncSnapshot()
}

// ── commands ────────────────────────────────────────────────────────────────

/**
 * Imperative hooks the provider fills in so objects inside the R3F canvas can
 * drive navigation without reaching across the reconciler boundary.
 */
export const scrollCommands = {
  armCard: (_index: number) => {},
  disarm: () => {},
  /** Scroll the document to a given section index, used by the HUD rail. */
  goToSection: (_index: number) => {},
  /** Unlock scrolling and move to the first beat. Bound to Explore. */
  start: () => {},
}
