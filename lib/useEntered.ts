'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { scroll } from './scrollStore'

/**
 * True once the load curtain has lifted.
 *
 * The hero copy stages in over about a second and a half. Without this it runs
 * that entrance behind an opaque curtain and the visitor arrives to a finished
 * frame with nothing left to watch — the most expensive animation on the page,
 * spent on no one.
 *
 * The flag is written on the plain scroll store by the curtain, so it is read
 * off the shared ticker rather than through React. It only ever goes false to
 * true, so the poll unsubscribes itself the moment it flips.
 */
export function useEntered(): boolean {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (scroll.entered) {
      setEntered(true)
      return
    }

    const tick = () => {
      if (!scroll.entered) return
      setEntered(true)
      gsap.ticker.remove(tick)
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return entered
}
