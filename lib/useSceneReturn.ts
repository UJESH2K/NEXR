'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import {
  clearReturn,
  readRememberedTopic,
  requestReturn,
  returnVersion,
  subscribeReturn,
} from './returnStore'
import { resetCursor } from './cursorStore'

/**
 * The logic behind the site's two ways home, shared by every place they
 * appear — the pinned corner control and the top bar both call this rather
 * than each keeping its own copy of what "back" and "home" mean.
 *
 * Two distinct destinations, not one button with two states:
 *
 *   - **Back** returns to the exact beat the visitor left the scene from.
 *   - **Home** starts over at the held opening frame, and deliberately clears
 *     the remembered beat — someone who chose to start over should not then be
 *     offered a way back to what they just walked away from.
 */
export function useSceneReturn() {
  const router = useRouter()

  // -1 on the server, where sessionStorage does not exist; the client value
  // takes over after hydration and again every time the beat is re-recorded.
  const version = useSyncExternalStore(subscribeReturn, returnVersion, () => -1)
  const topic = useMemo(() => {
    if (version < 0) return null
    const remembered = readRememberedTopic()
    return remembered ? { index: remembered.index, word: remembered.section.word } : null
  }, [version])

  const goBack = () => {
    requestReturn()
    resetCursor()
    router.push('/')
  }

  const goHome = () => {
    clearReturn()
    resetCursor()
    router.push('/')
  }

  return { topic, goBack, goHome }
}
