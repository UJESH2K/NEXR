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
}

const ScrollContext = createContext<ScrollApi>({
  lenis: null,
  armCard: () => {},
  disarm: () => {},
  goToSection: () => {},
})

export const useScrollApi = () => useContext(ScrollContext)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const reduced = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const navigatedRef = useRef(false)

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
  const tappedAt = useRef(0)
  useEffect(() => {
    if (previousPath.current === '/' && pathname !== '/' && Date.now() - tappedAt.current > 3000) {
      rememberSection(scroll.activeCardIndex)
    }
    previousPath.current = pathname
  }, [pathname])

  /*
   * Record the beat at the tap, too, and prefer it.
   *
   * By the time the route has changed, the navigation's own scroll to the top
   * of the new page can already have reached the home tracker and dragged the
   * active beat backwards — on phones it reliably did, so "Back to" returned
   * people one beat early. The beat on screen when they tapped is the one they
   * were reading. Scroll-driven exits (a card expanding into its route) have
   * no tap, and still fall back to the effect above.
   */
  useEffect(() => {
    if (pathname !== '/') return
    const onTap = () => {
      rememberSection(scroll.activeCardIndex)
      tappedAt.current = Date.now()
    }
    document.addEventListener('click', onTap, true)
    return () => document.removeEventListener('click', onTap, true)
  }, [pathname])

  // ── Route changes ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname === '/') {
      disarm()
      resetScrollState()

      // Only an explicit back-to-the-scene control sets this, and reading it
      // clears it. Every other way home — the logo, a bookmark, a fresh tab —
      // starts the story at beat 01, which is the whole reason the intent is
      // stored separately from the remembered beat.
      const returnTo = consumeReturnIntent()

      if (returnTo === null) {
        lenis?.scrollTo(0, { immediate: true })
        ScrollTrigger.refresh()
        return
      }

      lenis?.start()

      // Measure only once the home track is really there. Arriving from a
      // room, the room is still mounted while it fades out, so for the first
      // half second the document is the room's height, not the scene's — a
      // jump computed then lands a beat or two early. So: wait for the track,
      // then for the height to hold still for a few frames, then jump.
      let raf = 0
      let last = -1
      let still = 0
      let frames = 0
      // The copy stays hidden until the jump lands, so the room dissolves
      // straight into the beat they left instead of flashing beat 01 first.
      const root = document.documentElement
      root.dataset.returning = ''
      const reveal = () => {
        delete root.dataset.returning
      }
      const settle = () => {
        frames += 1
        const track = document.getElementById('home-track')
        const height = document.documentElement.scrollHeight
        if (track && height === last) still += 1
        else {
          still = 0
          last = height
        }
        if (still < 3 && frames < 240) {
          raf = requestAnimationFrame(settle)
          return
        }
        ScrollTrigger.refresh()
        const span = document.documentElement.scrollHeight - window.innerHeight
        if (span <= 0) {
          reveal()
          return
        }
        // Straight to the beat's rest point rather than an animated scroll:
        // easing through five beats they did not ask to see again is exactly
        // the trip this feature exists to save them.
        lenis?.scrollTo(((returnTo + SECTION_REST_POINT) / SECTION_COUNT) * span, {
          immediate: true,
          force: true,
        })
        raf = requestAnimationFrame(reveal)
      }
      raf = requestAnimationFrame(settle)

      return () => {
        cancelAnimationFrame(raf)
        reveal()
      }
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

  const api = useMemo<ScrollApi>(
    () => ({ lenis, armCard, disarm, goToSection }),
    [lenis, armCard, disarm, goToSection],
  )

  // Publish the commands to the store so meshes inside the canvas, which render
  // through a separate reconciler, can call them without React context.
  useEffect(() => {
    scrollCommands.armCard = armCard
    scrollCommands.disarm = disarm
    scrollCommands.goToSection = goToSection
    return () => {
      scrollCommands.armCard = () => {}
      scrollCommands.disarm = () => {}
      scrollCommands.goToSection = () => {}
    }
  }, [armCard, disarm, goToSection])

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}
