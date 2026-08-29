/**
 * Single source of truth for scroll-driven state.
 *
 * Deliberately a plain mutable object rather than React state: the camera rig
 * and every orbiting card read this 60+ times a second inside useFrame. Routing
 * that through setState would re-render the tree on every scroll tick and tank
 * the frame rate. React only learns about *discrete* changes (which act we're
 * in, which card is active) via the subscribe/snapshot pair at the bottom.
 */

export type ScrollMode = 'home' | 'transition'

/** Act boundaries as fractions of the home scroll track. */
export const ACT = {
  distantEnd: 0.16,
  approachEnd: 0.34,
  orbitEnd: 0.86,
} as const

export const CARD_COUNT = 6

const ORBIT_START = ACT.approachEnd
const ORBIT_SPAN = ACT.orbitEnd - ACT.approachEnd
/** Nominal slice of the orbit each card owns, before overlap is applied. */
const CARD_SLICE = ORBIT_SPAN / CARD_COUNT
/** Windows are widened by this fraction so the next card is already
 *  materialising as the previous one recedes — no dead air between cards. */
const WINDOW_OVERLAP = 0.15

export const scroll = {
  /** 0..1 across the whole home track. */
  homeProgress: 0,
  /** 0..1 while a clicked card expands to fill the frame. */
  transitionProgress: 0,
  mode: 'home' as ScrollMode,
  /** Index of the card the user clicked, or null. */
  armedCard: null as number | null,
  /** Written by CameraRig each frame; read by the cards so their motion can be
   *  expressed relative to where the camera actually is. */
  camAzimuth: 0,
  camRadius: 26,
  camFov: 55,
}

// ── math helpers ────────────────────────────────────────────────────────────

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Inverse lerp, clamped: where does `v` sit between `a` and `b`? */
export const remap = (v: number, a: number, b: number) =>
  a === b ? 0 : clamp01((v - a) / (b - a))

export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = remap(v, edge0, edge1)
  return t * t * (3 - 2 * t)
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// ── card windows ────────────────────────────────────────────────────────────

export function cardWindow(index: number): [start: number, end: number] {
  const pad = (CARD_SLICE * WINDOW_OVERLAP) / 2
  const start = ORBIT_START + index * CARD_SLICE - pad
  return [start, start + CARD_SLICE + pad * 2]
}

/**
 * Local 0..1 progress of card `index`, or -1 when the card is outside its
 * window and should not be rendered at all.
 */
export function cardLocalT(index: number, progress: number): number {
  const [start, end] = cardWindow(index)
  if (progress < start || progress > end) return -1
  return remap(progress, start, end)
}

/** The card nearest the centre of its window right now, or -1. */
export function activeCardIndex(progress: number): number {
  let best = -1
  let bestScore = 0
  for (let i = 0; i < CARD_COUNT; i++) {
    const t = cardLocalT(i, progress)
    if (t < 0) continue
    // Peak influence at the middle of the window.
    const score = Math.sin(Math.PI * t)
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

export function actFromProgress(progress: number): 0 | 1 | 2 | 3 {
  if (progress < ACT.distantEnd) return 0
  if (progress < ACT.approachEnd) return 1
  if (progress < ACT.orbitEnd) return 2
  return 3
}

// ── discrete snapshot for React consumers ───────────────────────────────────

export type ScrollSnapshot = {
  act: 0 | 1 | 2 | 3
  activeCard: number
  mode: ScrollMode
  armedCard: number | null
}

const listeners = new Set<() => void>()

// useSyncExternalStore requires a referentially stable snapshot — it throws an
// infinite-loop warning if getSnapshot returns a fresh object each call. So we
// only rebuild this when a value actually changes.
let snapshot: ScrollSnapshot = {
  act: 0,
  activeCard: -1,
  mode: 'home',
  armedCard: null,
}

export const getSnapshot = () => snapshot

/** Server render has no scroll position; act 0 is the correct initial view. */
export const getServerSnapshot = (): ScrollSnapshot => ({
  act: 0,
  activeCard: -1,
  mode: 'home',
  armedCard: null,
})

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Recompute the discrete snapshot and notify React, but only if something
 * actually changed. Called from the scroll driver on every tick — the equality
 * check is what keeps that cheap.
 */
export function syncSnapshot() {
  const next: ScrollSnapshot = {
    act: actFromProgress(scroll.homeProgress),
    activeCard: activeCardIndex(scroll.homeProgress),
    mode: scroll.mode,
    armedCard: scroll.armedCard,
  }

  if (
    next.act === snapshot.act &&
    next.activeCard === snapshot.activeCard &&
    next.mode === snapshot.mode &&
    next.armedCard === snapshot.armedCard
  ) {
    return
  }

  snapshot = next
  listeners.forEach((l) => l())
}

export function resetScrollState() {
  scroll.homeProgress = 0
  scroll.transitionProgress = 0
  scroll.mode = 'home'
  scroll.armedCard = null
  syncSnapshot()
}

// ── commands ────────────────────────────────────────────────────────────────

/**
 * Imperative hooks the provider fills in, so objects inside the R3F canvas can
 * arm a transition without reaching for React context.
 *
 * The canvas renders through a separate reconciler; context does cross that
 * boundary in R3F v9, but a plain module reference has no such caveat and costs
 * nothing.
 */
export const scrollCommands = {
  armCard: (_index: number) => {},
  disarm: () => {},
}
