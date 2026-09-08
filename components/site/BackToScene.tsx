'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { readRememberedTopic, requestReturn } from '@/lib/returnStore'

/**
 * The way back to the exact beat you left from.
 *
 * Every room already has a "the experience" link in its header, but that link
 * goes to the top of the home route — which re-locks the scene, so getting back
 * to the beat you were reading meant pressing Explore and scrolling through
 * everything ahead of it again. Anyone who arrived by clicking one beat's link
 * had no way back to that beat at all.
 *
 * So this is deliberately not a subtle piece of chrome. It names the beat it
 * returns to, it is pinned to the corner of the viewport for the whole page
 * rather than living in a header you have to scroll up to find, and it says
 * "Back to The Gap" rather than "Home", because the second one asks the reader
 * to remember what home was.
 *
 * It renders nothing when there is no remembered beat — someone who opened a
 * room from a search result or a shared link was never in the scene, and
 * offering to take them "back" somewhere they have not been is worse than
 * offering nothing.
 */
export function BackToScene() {
  const router = useRouter()
  const [topic, setTopic] = useState<{ index: number; word: string } | null>(null)

  // sessionStorage is not available during the server render, so the control can
  // only decide whether it applies once mounted. That also means it fades in
  // rather than appearing in the first paint, which suits it.
  useEffect(() => {
    const remembered = readRememberedTopic()
    if (remembered) {
      setTopic({ index: remembered.index, word: remembered.section.word })
    }
  }, [])

  if (!topic) return null

  const go = () => {
    // The intent is what tells the home route to skip its opening frame. Set it
    // immediately before navigating so nothing can consume it in between.
    requestReturn()
    resetCursor()
    router.push('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed bottom-6 left-6 md:bottom-8 md:left-8"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <button
        type="button"
        onClick={go}
        onMouseEnter={() => setCursor({ active: true })}
        onMouseLeave={resetCursor}
        className="btn-primary group"
      >
        <ArrowLeft
          size={13}
          className="transition-transform duration-500 group-hover:-translate-x-1"
        />
        Back to
        <span className="numeral text-[0.95em]">
          {String(topic.index + 1).padStart(2, '0')}
        </span>
        <span className="normal-case tracking-normal">{topic.word}</span>
      </button>
    </motion.div>
  )
}
