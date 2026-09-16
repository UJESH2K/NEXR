'use client'

import { useSyncExternalStore } from 'react'

/**
 * Whether the quick-contact popup is open.
 *
 * A tiny external store rather than component state because the trigger
 * (Header, fixed at the top of every non-scene route) and the modal itself
 * (portalled to `<body>`, a sibling of Header rather than a descendant — see
 * Portal.tsx) are not in a parent/child relationship. Context would work too,
 * but for one boolean flipped from one place, a store is less machinery.
 */

let open = false
const listeners = new Set<() => void>()

export function openContactModal() {
  if (open) return
  open = true
  listeners.forEach((l) => l())
}

export function closeContactModal() {
  if (!open) return
  open = false
  listeners.forEach((l) => l())
}

const getSnapshot = () => open
const getServerSnapshot = () => false

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useContactModalOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
