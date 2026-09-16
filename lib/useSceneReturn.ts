'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearReturn, readRememberedTopic, requestReturn } from './returnStore'
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
  const [topic, setTopic] = useState<{ index: number; word: string } | null>(null)

  // sessionStorage does not exist during the server render, so this can only
  // decide whether Back applies once mounted.
  useEffect(() => {
    const remembered = readRememberedTopic()
    if (remembered) {
      setTopic({ index: remembered.index, word: remembered.section.word })
    }
  }, [])

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
