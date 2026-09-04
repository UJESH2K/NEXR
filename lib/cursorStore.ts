'use client'

import { useSyncExternalStore } from 'react'

/**
 * What the custom cursor should currently look like.
 *
 * Objects inside the R3F canvas cannot set `:hover` styles on a DOM cursor, and
 * routing that through React context would mean a context provider straddling
 * the reconciler boundary. A three-line external store is the cheaper answer,
 * and it lets DOM elements and 3D meshes drive the same cursor identically.
 */
export type CursorState = {
  /** Text drawn inside the ring, e.g. "view". Null means the plain dot. */
  label: string | null
  /** Grow the ring without labelling it — used for links and buttons. */
  active: boolean
}

let state: CursorState = { label: null, active: false }
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export function setCursor(next: Partial<CursorState>) {
  const merged = { ...state, ...next }
  if (merged.label === state.label && merged.active === state.active) return
  state = merged
  emit()
}

export const resetCursor = () => setCursor({ label: null, active: false })

const getSnapshot = () => state

/**
 * The server snapshot must be one cached object, not a fresh one per call.
 *
 * useSyncExternalStore compares snapshots by identity to decide whether to
 * re-render. Building the object inside the getter returns a new reference
 * every time, so React sees a change on every render, renders again, and warns
 * that it is heading for an infinite loop. There is no cursor before hydration
 * anyway, so a single frozen constant is the whole answer.
 */
const SERVER_STATE: CursorState = { label: null, active: false }
const getServerSnapshot = (): CursorState => SERVER_STATE

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCursorState(): CursorState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
