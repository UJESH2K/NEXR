'use client'

import { useSyncExternalStore } from 'react'

/**
 * Whether the idle annotations are showing.
 *
 * They are drawn by two different parts of the tree — one is anchored to the
 * Explore button itself, the others live in the corners of the frame — but they
 * have to appear and disappear together, or the page looks like it is nagging
 * from three directions on three different clocks. One flag, one timer, set by
 * IdleHints and read by everyone.
 */

let visible = false
const listeners = new Set<() => void>()

export function setHintsVisible(next: boolean) {
  if (next === visible) return
  visible = next
  listeners.forEach((l) => l())
}

const getSnapshot = () => visible

// Cached, not rebuilt per call: useSyncExternalStore compares snapshots by
// identity, and a getter that returns something new each time sends React into
// a render loop. A primitive is already stable, so this is only a guard against
// someone widening the store to an object later.
const getServerSnapshot = () => false

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useHintsVisible(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
