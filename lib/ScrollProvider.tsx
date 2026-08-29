'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CARDS } from './cards'
import { clamp01, resetScrollState, scroll, scrollCommands, syncSnapshot } from './scrollStore'
import { useReducedMotion } from './useReducedMotion'

// Registered at module scope so it is guaranteed to have run before any tween
// or ScrollTrigger is defined anywhere in the app.
gsap.registerPlugin(ScrollTrigger)

/** Wheel/touch travel (px) required to expand an armed card to full frame. */
const TRANSITION_DISTANCE = 1100
/** Fill fraction at which we hand over to the real route. */
const NAVIGATE_AT = 0.92
/** Grace period after landing before the armed card returns to its orbit.
 *  Must outlast PageFade's 450ms fade so the swap happens out of sight. */
const DISARM_DELAY = 560

type ScrollApi = {
  lenis: Lenis | null
  armCard: (index: number) => void
  disarm: () => void
}

const ScrollContext = createContext<ScrollApi>({
  lenis: null,
  armCard: () => {},
  disarm: () => {},
})

export const useScrollApi = () => useContext(ScrollContext)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const reduced = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const navigatedRef = useRef(false)

  // ── Lenis, driven by the GSAP ticker ─────────────────────────────────────
  // One clock for both libraries. Running Lenis on its own requestAnimationFrame
  // alongside GSAP's ticker lets them tick in either order, which shows up as
  // a one-frame jitter in scrubbed animations.
  useEffect(() => {
    if (reduced) return

    const instance = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false })
    instance.on('scroll', ScrollTrigger.update)

    // gsap.ticker reports seconds; Lenis.raf expects milliseconds.
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    setLenis(instance)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  const disarm = useCallback(() => {
    scroll.mode = 'home'
    scroll.armedCard = null
    scroll.transitionProgress = 0
    navigatedRef.current = false
    syncSnapshot()
    lenis?.start()
  }, [lenis])

  const armCard = useCallback(
    (index: number) => {
      if (scroll.mode === 'transition') return
      scroll.mode = 'transition'
      scroll.armedCard = index
      scroll.transitionProgress = 0
      navigatedRef.current = false
      syncSnapshot()
      // Hand scroll input to the transition controller below. Expanding the
      // card by growing the document instead would reflow the page mid-gesture.
      lenis?.stop()
    },
    [lenis],
  )

  // ── Transition controller ────────────────────────────────────────────────
  // While a card is armed we read raw wheel/touch deltas rather than document
  // scroll. This keeps the fill fully reversible (scroll back up and the card
  // returns to its orbit) and avoids mutating page height mid-gesture.
  useEffect(() => {
    if (reduced) return

    const advance = (delta: number) => {
      if (scroll.mode !== 'transition') return
      scroll.transitionProgress = clamp01(
        scroll.transitionProgress + delta / TRANSITION_DISTANCE,
      )
      syncSnapshot()

      if (scroll.transitionProgress <= 0) {
        disarm()
        return
      }

      if (scroll.transitionProgress >= NAVIGATE_AT && !navigatedRef.current) {
        navigatedRef.current = true
        const card = scroll.armedCard === null ? null : CARDS[scroll.armedCard]
        if (card) router.push(card.route)
      }
    }

    const onWheel = (event: WheelEvent) => {
      if (scroll.mode !== 'transition') return
      event.preventDefault()
      advance(event.deltaY)
    }

    let touchY = 0
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (event: TouchEvent) => {
      if (scroll.mode !== 'transition') return
      event.preventDefault()
      const y = event.touches[0]?.clientY ?? 0
      advance(touchY - y)
      touchY = y
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [reduced, disarm, router])

  // ── Route changes ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname === '/') {
      // Returning home (including via the back button) resumes the orbit.
      disarm()
      resetScrollState()
      lenis?.scrollTo(0, { immediate: true })
      ScrollTrigger.refresh()
      return
    }

    lenis?.start()
    // Cards 01 and 02 both land on /approach, distinguished only by hash, so
    // honour it. usePathname() strips the hash, hence reading location here.
    const hash = window.location.hash
    const target = hash.length > 1 ? document.querySelector(hash) : null
    if (target instanceof HTMLElement) {
      lenis?.scrollTo(target, { immediate: true, offset: -96 })
    } else {
      lenis?.scrollTo(0, { immediate: true })
    }
    // New page, new element heights.
    ScrollTrigger.refresh()

    // Disarming is deferred, not immediate, and both halves of that matter:
    //   - it must happen, or the wheel handler above keeps calling
    //     preventDefault() and the destination page cannot be scrolled at all;
    //   - it must wait for PageFade to finish covering the canvas, or the card
    //     visibly snaps back to its orbit through the still-transparent page.
    const release = setTimeout(disarm, DISARM_DELAY)
    return () => clearTimeout(release)
    // `disarm` intentionally omitted: including it would re-run this on every
    // lenis identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, lenis])

  const api = useMemo<ScrollApi>(
    () => ({ lenis, armCard, disarm }),
    [lenis, armCard, disarm],
  )

  // Publish the same two commands to the store so meshes inside the canvas can
  // call them directly.
  useEffect(() => {
    scrollCommands.armCard = armCard
    scrollCommands.disarm = disarm
    return () => {
      scrollCommands.armCard = () => {}
      scrollCommands.disarm = () => {}
    }
  }, [armCard, disarm])

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}
