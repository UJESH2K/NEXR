'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type TypingAnimationProps = {
  text: string
  className?: string
  duration?: number
  delay?: number
  /** Show a blinking cursor after the text. */
  cursor?: boolean
}

/**
 * Types out `text` character by character, then holds.
 * Used as a drop-in for magicui's TypingAnimation but without the dependency.
 */
export function TypingAnimation({
  text,
  className,
  duration = 0.04,
  delay = 0,
  cursor = true,
}: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) {
      setDone(true)
      return
    }

    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, duration * 1000)

    return () => clearTimeout(timeout)
  }, [started, displayed, text, duration])

  return (
    <span className={cn('inline', className)}>
      {displayed}
      {cursor && !done && (
        <span className="ml-0.5 inline-block animate-pulse text-lime">|</span>
      )}
    </span>
  )
}
