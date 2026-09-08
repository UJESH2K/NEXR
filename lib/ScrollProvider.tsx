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
import { consumeReturnIntent, rememberSection } from './returnStore'
import {
  SECTION_REST_POINT,
  clamp01,
  resetScrollState,
  scroll,
  scrollCommands,
  syncSnapshot,
} from './scrollStore'
import { SECTION_COUNT } from './sections'
import { usePointer } from './usePointer'
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
  /** Scroll to a beat's dwell. Used by the HUD rail. */
  goToSection: (index: number) => void
  /** Unlock scrolling and move to the first beat. Bound to Explore. */
  start: () => void
}

const ScrollContext = createContext<ScrollApi>({
  lenis: null,
  armCard: () => {},
  disarm: () => {},
  goToSection: () => {},
  start: () => {},
})

export const useScrollApi = () => useContext(ScrollContext)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const reduced = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const navigatedRef = useRef(false)
  // scroll.started lives on the mutable store, which React cannot observe. This
  // counter is bumped alongside it purely so the lock effect below re-runs and
  // detaches its key handler once the page is unlocked.
  const [startedTick, setStartedTick] = useState(0)

  // One global pointer source for the camera, sky, panels and cursor. Mounted
  // here because this provider already wraps everything that reads it, and
  // because the smoothing has to share the gsap ticker that drives Lenis.
  usePointer(!reduced)

  // ── Lenis, driven by the GSAP ticker ─────────────────────────────────────
  // One clock for both libraries. Running Lenis on its own requestAnimationFrame
  // alongside GSAP's ticker lets them tick in either order, which shows up as
  // a one-frame jitter in scrubbed animations.
  useEffect(() => {
    if (reduced) return

    const instance = new Lenis({
      // Heavier than the Lenis default on purpose: this page is one long
      // camera move, and a light lerp makes the scene feel twitchy under a
      // trackpad. 0.075 is the point where a flick still arrives quickly but
      // the sky and the pose changes read as continuous.
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      autoRaf: false,
    })
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

  /**
   * Record which beat was on screen whenever the scene is left.
   *
   * Written on the way *out* rather than at the click, so it does not matter
   * which link was used — a beat's own call to action, the header, a panel, or
   * the keyboard all leave the same trail. `pathname` is already the new route
   * by the time this runs, hence the ref holding the previous one.
   */
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (previousPath.current === '/' && pathname !== '/') {
      rememberSection(scroll.activeCardIndex)
    }
    previousPath.current = pathname
  }, [pathname])

  // ── Route changes ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname === '/') {
      disarm()
      resetScrollState()

      // Only an explicit back-to-the-scene control sets this, and reading it
      // clears it. Every other way home — the logo, a bookmark, a fresh tab —
      // gets the opening frame, which is the whole reason the intent is stored
      // separately from the remembered beat.
      const returnTo = consumeReturnIntent()

      if (returnTo === null) {
        setStartedTick((n) => n + 1)
        lenis?.scrollTo(0, { immediate: true })
        ScrollTrigger.refresh()
        return
      }

      // Coming back to a beat: the opening frame has already been seen, so skip
      // the hold and put them where they were.
      scroll.started = true
      syncSnapshot()
      setStartedTick((n) => n + 1)
      lenis?.start()

      // Two frames of grace before measuring. On a client-side navigation the
      // home track has only just mounted, and ScrollTrigger cannot size a
      // spacer the browser has not laid out yet — refreshing too early leaves
      // the trigger measuring a zero-height document and the jump lands at 0.
      let raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          const span = document.documentElement.scrollHeight - window.innerHeight
          if (span <= 0) return
          // Straight to the beat's rest point rather than an animated scroll:
          // easing through five beats they did not ask to see again is exactly
          // the trip this feature exists to save them.
          lenis?.scrollTo(((returnTo + SECTION_REST_POINT) / SECTION_COUNT) * span, {
            immediate: true,
            force: true,
          })
        })
      })

      return () => cancelAnimationFrame(raf)
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

  /**
   * Jump to a beat's dwell.
   *
   * The target is 55% into the section rather than its start: that is past the
   * pose change and inside the hold, so the landing is a settled frame with the
   * copy already in place instead of the middle of a transition.
   */
  const goToSection = useCallback(
    (index: number) => {
      const span =
        document.documentElement.scrollHeight - window.innerHeight
      if (span <= 0) return
      const target = ((index + 0.55) / SECTION_COUNT) * span
      lenis?.scrollTo(target, { duration: 1.6 })
    },
    [lenis],
  )

  const start = useCallback(() => {
    if (scroll.started) return
    scroll.started = true
    syncSnapshot()
    setStartedTick((n) => n + 1)
    lenis?.start()
    // A beat's pause before moving, so the unlock is felt as a release rather
    // than as the button yanking the page.
    window.setTimeout(() => goToSection(0), 120)
  }, [lenis, goToSection])

  /**
   * Hold the page still until Explore is pressed.
   *
   * Lenis.stop() swallows wheel and touch, but not the keyboard, the scrollbar
   * or a programmatic jump — and a browser restoring scroll position on reload
   * would drop the visitor into the middle of a beat they never chose. So the
   * keys are blocked here too, and the position is pinned to the top.
   */
  useEffect(() => {
    if (reduced || !lenis) return
    if (scroll.started || pathname !== '/') return

    lenis.stop()
    lenis.scrollTo(0, { immediate: true, force: true })

    /**
     * Hold position every frame, not just once.
     *
     * The inline script in the root layout turns off the browser's own scroll
     * restoration, which is the real fix. This is the backstop for everything
     * that runs after it: an extension, a focus jump into an offscreen element,
     * a bfcache restore, or simply a browser that restored before the script
     * parsed. One comparison per frame, and it stops the moment Explore is
     * pressed, so it costs nothing for the rest of the visit.
     */
    const pin = () => {
      if (scroll.started) return
      if (window.scrollY !== 0) lenis.scrollTo(0, { immediate: true, force: true })
    }

    gsap.ticker.add(pin)

    const KEYS = new Set([
      ' ',
      'PageDown',
      'PageUp',
      'ArrowDown',
      'ArrowUp',
      'Home',
      'End',
    ])

    const onKey = (event: KeyboardEvent) => {
      if (scroll.started) return
      // Never swallow keys aimed at a control — Explore itself is a button, and
      // Space is how a keyboard user presses it.
      const target = event.target as HTMLElement | null
      if (target?.closest('button, a, input, textarea, select')) return
      if (KEYS.has(event.key)) event.preventDefault()
    }

    window.addEventListener('keydown', onKey, { passive: false })
    return () => {
      gsap.ticker.remove(pin)
      window.removeEventListener('keydown', onKey)
    }
  }, [reduced, lenis, pathname, startedTick])

  const api = useMemo<ScrollApi>(
    () => ({ lenis, armCard, disarm, goToSection, start }),
    [lenis, armCard, disarm, goToSection, start],
  )

  // Publish the commands to the store so meshes inside the canvas, which render
  // through a separate reconciler, can call them without React context.
  useEffect(() => {
    scrollCommands.armCard = armCard
    scrollCommands.disarm = disarm
    scrollCommands.goToSection = goToSection
    scrollCommands.start = start
    return () => {
      scrollCommands.armCard = () => {}
      scrollCommands.disarm = () => {}
      scrollCommands.goToSection = () => {}
      scrollCommands.start = () => {}
    }
  }, [armCard, disarm, goToSection, start])

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}
