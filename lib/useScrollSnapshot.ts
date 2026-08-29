'use client'

import { useSyncExternalStore } from 'react'
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type ScrollSnapshot,
} from './scrollStore'

/**
 * React's window onto the scroll store. Only ever fires when a *discrete* value
 * changes (act, active card, mode) — never on the continuous progress value, so
 * overlay components re-render a handful of times across the whole page rather
 * than sixty times a second.
 */
export function useScrollSnapshot(): ScrollSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
