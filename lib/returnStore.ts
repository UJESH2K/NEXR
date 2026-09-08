'use client'

import { SECTIONS, SECTION_COUNT } from './sections'

/**
 * Remembers which beat of the scene a visitor left from, so they can be put
 * back exactly there.
 *
 * The problem this solves: the home page is one long scroll through six beats,
 * and every beat ends in a link out to its own room. Coming back landed you on
 * the opening frame with scrolling locked again — so returning to the beat you
 * were reading meant pressing Explore and scrolling through everything in front
 * of it a second time. That is a fine experience for someone exploring on
 * purpose and a terrible one for someone who just wants to go back.
 *
 * Two separate pieces of state, and the split is the important part:
 *
 *   - `remembered` is written automatically whenever the scene is left. It is a
 *     record, not an instruction.
 *   - `intent` is set only by an explicit "back to the scene" control. Without
 *     it, arriving at the home route gives the normal opening frame.
 *
 * Keeping them apart is what stops the site hijacking every route home. The
 * logo, a bookmark and a fresh tab all deserve the opening shot; only the back
 * control asks to skip it.
 *
 * sessionStorage rather than localStorage: this is where you were *this visit*.
 * Coming back tomorrow should start at the beginning.
 */

const SECTION_KEY = 'nexr:last-section'
const INTENT_KEY = 'nexr:return-intent'

/** sessionStorage throws in some privacy modes; never let that break a click. */
function safeGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    /* no memory available; the site simply behaves as it did before. */
  }
}

function safeRemove(key: string) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    /* as above. */
  }
}

/** Record the beat that was on screen. Called when the scene is navigated away from. */
export function rememberSection(index: number) {
  if (!Number.isFinite(index)) return
  const clamped = Math.min(Math.max(Math.round(index), 0), SECTION_COUNT - 1)
  safeSet(SECTION_KEY, String(clamped))
}

/** The remembered beat, or null if there is nothing sensible stored. */
export function readRememberedSection(): number | null {
  const raw = safeGet(SECTION_KEY)
  if (raw === null) return null
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value < 0 || value >= SECTION_COUNT) return null
  return value
}

/** The remembered beat's data, for labelling the back control. */
export function readRememberedTopic() {
  const index = readRememberedSection()
  return index === null ? null : { index, section: SECTIONS[index] }
}

/**
 * Ask the home route to skip its opening frame and land on the remembered beat.
 * Consumed exactly once, by ScrollProvider, on arrival.
 */
export function requestReturn() {
  safeSet(INTENT_KEY, '1')
}

/** Read and clear the intent in one go, so it can never fire twice. */
export function consumeReturnIntent(): number | null {
  if (safeGet(INTENT_KEY) !== '1') return null
  safeRemove(INTENT_KEY)
  return readRememberedSection()
}

export function clearReturn() {
  safeRemove(INTENT_KEY)
  safeRemove(SECTION_KEY)
}
