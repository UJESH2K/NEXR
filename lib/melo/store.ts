'use client'

import { useSyncExternalStore } from 'react'

/**
 * Melo's state, as a tiny external store.
 *
 * The widget lives in the root layout, but the things that should make her
 * speak live inside pages — the room knows which chapter is being read, the
 * footer knows when the end is reached. A store lets any of them post a message
 * without a provider wrapping the tree, the same pattern contactModalStore uses.
 */

export type MeloPose = 1 | 2 | 3 | 4 | 5 | 6

export type MeloAction =
  | { label: string; kind: 'href'; href: string }
  | { label: string; kind: 'scroll'; target: string }
  | { label: string; kind: 'tour' }
  | { label: string; kind: 'contact' }
  | { label: string; kind: 'dismiss' }

export type MeloBubble = {
  /** Stable per message, so the same nudge is never posted twice per page. */
  id: string
  kind: 'intro' | 'arrival' | 'nudge' | 'menu'
  pose: MeloPose
  label?: string
  text: string
  actions?: MeloAction[]
  /** ms before it closes itself; omitted means it stays until dismissed. */
  ttl?: number
  /** A passing remark: smaller figure, and it clears the moment the visitor scrolls. */
  compact?: boolean
}

export type MeloContext = {
  /** The chapter currently crossing the reading line, if the page has any. */
  chapterId: string | null
}

type State = {
  bubble: MeloBubble | null
  touring: boolean
  /** The expression for the current tour step, shown in her avatar. */
  tourPose: MeloPose | null
  context: MeloContext
}

let state: State = { bubble: null, touring: false, tourPose: null, context: { chapterId: null } }
const listeners = new Set<() => void>()
const shown = new Set<string>()

function emit(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export const melo = {
  /** Posts a message unless it was already shown on this page, or a tour is on. */
  say(bubble: MeloBubble, { force = false } = {}) {
    if (state.touring) return false
    if (!force && shown.has(bubble.id)) return false
    shown.add(bubble.id)
    emit({ bubble })
    return true
  },
  close() {
    if (state.bubble) emit({ bubble: null })
  },
  startTour() {
    emit({ bubble: null, touring: true })
  },
  endTour() {
    emit({ touring: false, tourPose: null })
  },
  setTourPose(pose: MeloPose) {
    if (state.tourPose !== pose) emit({ tourPose: pose })
  },
  setChapter(chapterId: string | null) {
    if (state.context.chapterId === chapterId) return
    emit({ context: { ...state.context, chapterId } })
  },
  /** A new page is a new conversation: what was said on the last one is forgotten. */
  resetPage() {
    shown.clear()
    emit({ bubble: null, touring: false, tourPose: null, context: { chapterId: null } })
  },
  get: () => state,
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const serverState: State = { bubble: null, touring: false, tourPose: null, context: { chapterId: null } }

export function useMelo(): State {
  return useSyncExternalStore(subscribe, () => state, () => serverState)
}

/** localStorage, guarded — private modes throw, and Melo must never break a page. */
export const memory = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* nothing to remember with; she simply asks again next time. */
    }
  },
  sessionGet(key: string) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  sessionSet(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* as above. */
    }
  },
}
