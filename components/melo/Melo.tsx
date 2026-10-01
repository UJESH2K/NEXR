'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Compass, Home } from 'lucide-react'
import { useScrollApi } from '@/lib/ScrollProvider'
import { useSceneReturn } from '@/lib/useSceneReturn'
import { openContactModal, useContactModalOpen } from '@/lib/contactModalStore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { melo, memory, useMelo, type MeloAction, type MeloBubble, type MeloPose } from '@/lib/melo/store'
import {
  CLOSING,
  AUDIENCES,
  AUDIENCE_LABEL,
  arrivalBubble,
  audiencesBubble,
  endBubble,
  idleBubble,
  quoteBubble,
  routeContext,
  WELCOME_STEP,
} from '@/lib/melo/script'
import { EASE, MeloCard, faceSrc } from './MeloCard'
import { MeloTour } from './MeloTour'

/**
 * Melo, on every page that is not the scene.
 *
 * The scene is where visitors meet her; everywhere else she is the guide. She
 * says hello when a page opens, offers a tour the first time, speaks up when a
 * visitor goes quiet, and has something to say about what is on screen when
 * they reach a natural pause — a room's quote, its end, the last page.
 *
 * Restraint is built in, because a mascot that interrupts reading is worse
 * than none: one message at a time, at most three unprompted ones per page,
 * a cool-down between them, never while the tour or the contact form is open,
 * and nothing while the tab is in the background. Scrolling on dismisses a
 * passing remark — the visitor has answered it by carrying on.
 *
 * Her images are static renders of the scene's own model in its six poses
 * (public/brand/melo/, rendered with the same material repair CharacterModel
 * applies — without it the hair draws over her face).
 */

// v2: the tour now starts by itself. Anyone who dismissed the old optional
// offer gets the new tour once rather than never seeing it.
const TOUR_KEY = 'nexr:melo-tour-v2'
const IDLE_MS = 15000
const COOLDOWN_MS = 18000
const MAX_UNPROMPTED = 3

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: resetCursor,
}

function preload(pose: MeloPose) {
  const img = new Image()
  img.src = faceSrc(pose)
}

export function Melo() {
  const pathname = usePathname()
  const router = useRouter()
  const { lenis } = useScrollApi()
  const { bubble, touring, tourPose } = useMelo()
  const contactOpen = useContactModalOpen()
  const { topic: returnTopic, goBack, goHome } = useSceneReturn()
  const ctx = useMemo(() => routeContext(pathname), [pathname])

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(false)
  menuRef.current = menuOpen
  const [seen, setSeen] = useState(true)
  const lastActive = useRef(0)
  const lastClosed = useRef(0)
  const unprompted = useRef(0)
  const idleCount = useRef(0)
  const shownAtY = useRef(0)
  const autoTour = useRef(false)

  // She appears once, in the circle; what she is saying sets her expression there.
  const pose: MeloPose = (touring ? tourPose : bubble?.pose) ?? ctx.pose

  const scrollTo = useCallback(
    (target: string | number) => {
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null
      if (typeof target === 'string' && !el) return
      if (lenis) lenis.scrollTo(el ?? (target as number), { offset: -96, duration: 1.1 })
      else if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [lenis],
  )

  const close = useCallback(() => {
    const current = melo.get().bubble
    lastClosed.current = Date.now()
    melo.close()
  }, [])

  /** Unprompted messages pass through here, so the limits live in one place. */
  const speak = useCallback((next: MeloBubble | null) => {
    if (!next) return false
    const s = melo.get()
    if (s.touring || s.bubble || menuRef.current || document.hidden) return false
    if (unprompted.current >= MAX_UNPROMPTED) return false
    if (Date.now() - lastClosed.current < COOLDOWN_MS) return false
    if (!melo.say(next)) return false
    unprompted.current += 1
    shownAtY.current = window.scrollY
    return true
  }, [])

  // ── a new page: forget the last one, say hello ────────────────────────────
  useEffect(() => {
    melo.resetPage()
    setMenuOpen(false)
    unprompted.current = 0
    idleCount.current = 0
    lastClosed.current = 0
    lastActive.current = Date.now()

    // Until a visitor has either finished the tour or skipped it, every sub
    // page they open starts it. Skipping is final; so is finishing.
    const firstVisit = !memory.get(TOUR_KEY)
    setSeen(!!memory.sessionGet('nexr:melo-seen'))

    const hello = window.setTimeout(() => {
      if (firstVisit) {
        autoTour.current = true
        setMenuOpen(false)
        melo.startTour()
      } else {
        melo.say(arrivalBubble(ctx))
      }
      shownAtY.current = window.scrollY
    }, firstVisit ? 1300 : 900)

    // Every pose, once the page is settled, so later swaps never wait on a fetch.
    const warm = window.setTimeout(() => ([1, 2, 3, 4, 5, 6] as MeloPose[]).forEach(preload), 2500)

    return () => {
      window.clearTimeout(hello)
      window.clearTimeout(warm)
    }
    // ctx is derived from pathname
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ── messages that close themselves ────────────────────────────────────────
  useEffect(() => {
    if (!bubble?.ttl) return
    const t = window.setTimeout(close, bubble.ttl)
    return () => window.clearTimeout(t)
  }, [bubble, close])

  // The contact form and the tour both outrank anything Melo has to say.
  useEffect(() => {
    if (contactOpen) {
      melo.close()
      setMenuOpen(false)
    }
  }, [contactOpen])

  // ── going quiet ───────────────────────────────────────────────────────────
  useEffect(() => {
    const active = () => {
      lastActive.current = Date.now()
    }
    const onScroll = () => {
      lastActive.current = Date.now()
      const b = melo.get().bubble
      if (!b || b.kind === 'menu') return
      if (Math.abs(window.scrollY - shownAtY.current) > (b.compact ? 140 : 520)) close()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointerdown', active, { passive: true })
    window.addEventListener('keydown', active)
    window.addEventListener('touchstart', active, { passive: true })
    window.addEventListener('wheel', active, { passive: true })

    const tick = window.setInterval(() => {
      if (Date.now() - lastActive.current < IDLE_MS) return
      lastActive.current = Date.now()
      if (speak(idleBubble(ctx, melo.get().context.chapterId, idleCount.current))) {
        idleCount.current += 1
      }
    }, 1000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', active)
      window.removeEventListener('keydown', active)
      window.removeEventListener('touchstart', active)
      window.removeEventListener('wheel', active)
      window.clearInterval(tick)
    }
  }, [ctx, speak, close])

  // ── natural pauses in a room: its quote, its end ──────────────────────────
  useEffect(() => {
    if (!ctx.room) return
    const timers = new Map<Element, number>()
    let io: IntersectionObserver | null = null

    // Wait for the room to mount; the page fades in after the route changes.
    const start = window.setTimeout(() => {
      const cues = document.querySelectorAll<HTMLElement>('[data-melo-cue]')
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement
            if (entry.isIntersecting) {
              if (timers.has(el)) continue
              // Only if they actually stop on it — racing past is not a pause.
              // If she is mid-cooldown, try again while they are still here
              // rather than letting the moment pass silently.
              const attempt = (tries: number) => {
                timers.set(
                  el,
                  window.setTimeout(() => {
                    const cue = el.dataset.meloCue
                    const said = speak(cue === 'quote' ? quoteBubble(ctx) : cue === 'end' ? endBubble(ctx) : null)
                    if (!said && tries < 5 && timers.has(el)) attempt(tries + 1)
                  }, tries === 0 ? 1400 : 4000),
                )
              }
              attempt(0)
            } else {
              const t = timers.get(el)
              if (t) window.clearTimeout(t)
              timers.delete(el)
            }
          }
        },
        { threshold: 0.45 },
      )
      cues.forEach((c) => io?.observe(c))
    }, 800)

    return () => {
      window.clearTimeout(start)
      timers.forEach((t) => window.clearTimeout(t))
      io?.disconnect()
    }
  }, [ctx, speak])

  // Escape closes whatever she is saying.
  useEffect(() => {
    if (!bubble && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || melo.get().touring) return
      setMenuOpen(false)
      close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bubble, menuOpen, close])

  // ── actions ───────────────────────────────────────────────────────────────
  const startTour = useCallback(() => {
    autoTour.current = false
    setMenuOpen(false)
    melo.startTour()
  }, [])

  const endTour = useCallback((completed: boolean) => {
    memory.set(TOUR_KEY, completed ? 'done' : 'skipped')
    lastClosed.current = Date.now()
    lastActive.current = Date.now()
    melo.endTour()
  }, [])

  const run = useCallback(
    (action: MeloAction) => {
      switch (action.kind) {
        case 'tour':
          melo.close()
          startTour()
          return
        case 'contact':
          close()
          setMenuOpen(false)
          openContactModal()
          return
        case 'href':
          close()
          setMenuOpen(false)
          router.push(action.href)
          return
        case 'scroll':
          close()
          scrollTo(action.target)
          return
        case 'dismiss':
          close()
          return
        case 'audiences':
          melo.close()
          melo.say(audiencesBubble(), { force: true })
          shownAtY.current = window.scrollY
          return
      }
    },
    [close, router, scrollTo, startTour],
  )

  const goNext = () => {
    setMenuOpen(false)
    // The last page has no next part: its way onward is the conversation.
    if (ctx.isLast) {
      openContactModal()
      return
    }
    if (ctx.next) {
      router.push(ctx.next.href)
      return
    }
    const line = window.scrollY + 140
    const beat = Array.from(document.querySelectorAll<HTMLElement>('[data-route-beat]')).find(
      (b) => b.getBoundingClientRect().top + window.scrollY > line,
    )
    if (beat) scrollTo(`#${beat.id}`)
    else if (lenis) lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleMenu = () => {
    if (!seen) {
      memory.sessionSet('nexr:melo-seen', '1')
      setSeen(true)
    }
    if (bubble) close()
    setMenuOpen((v) => !v)
  }

  const showMenu = menuOpen && !bubble && !touring
  const showBubble = !!bubble && !touring

  return (
    <>
      {/* Above the tour's dimming while it runs, so she stays beside her card. */}
      <div
        className="melo-dock fixed flex flex-col items-end gap-3"
        style={{ zIndex: touring ? 'var(--z-tour-card)' : 'var(--z-chrome)' }}
      >
        {/* Keyed by page: what she said on the last page must not linger on
            this one while it fades out, so a new page drops it instantly. */}
        <AnimatePresence key={pathname} mode="popLayout">
          {showBubble && bubble ? (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.38, ease: EASE }}
              style={{ transformOrigin: 'bottom right' }}
            >
              <MeloCard label={bubble.label} onClose={close}>
                <p className="melo-text mt-3 text-[14px] leading-[1.6] text-bone/85">{bubble.text}</p>
                {bubble.links?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bubble.links.map((link) => (
                      <button
                        key={link.href}
                        type="button"
                        onClick={() => run({ label: link.label, kind: 'href', href: link.href })}
                        {...hoverable}
                        className="melo-chip"
                      >
                        {link.label}
                        <span aria-hidden="true">&rarr;</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {bubble.actions?.length ? (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {bubble.actions.map((action, i) =>
                      i === 0 ? (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => run(action)}
                          {...hoverable}
                          className="btn-primary btn-primary--compact group"
                        >
                          {action.label}
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ) : (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => run(action)}
                          {...hoverable}
                          className="py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50 transition-colors hover:text-bone"
                        >
                          {action.label}
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </MeloCard>
            </motion.div>
          ) : null}

          {showMenu ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ transformOrigin: 'bottom right' }}
            >
              <MeloCard label={ctx.label} onClose={() => setMenuOpen(false)} role="dialog">
                <p className="melo-text mt-3 text-[14px] leading-[1.6] text-bone/85">{ctx.message}</p>
                <div className="-mx-2 mt-4 space-y-1 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={goNext}
                    {...hoverable}
                    className="btn-primary btn-primary--compact group mx-2 mb-2 w-[calc(100%-1rem)] justify-center !tracking-[0.14em]"
                  >
                    {ctx.isLast ? CLOSING.action : (ctx.next?.label ?? 'Take me to the next part')}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                  {/* The three audiences, one tap away from anywhere. */}
                  <div className="mx-2 mb-1.5 border-b border-white/10 pb-3">
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/40">
                      {AUDIENCE_LABEL}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AUDIENCES.map((link) => (
                        <button
                          key={link.href}
                          type="button"
                          onClick={() => {
                            setMenuOpen(false)
                            router.push(link.href)
                          }}
                          {...hoverable}
                          className={`melo-chip ${pathname === link.href ? 'melo-chip--on' : ''}`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {returnTopic ? (
                    <MenuRow
                      icon={<ArrowLeft size={14} />}
                      onClick={() => {
                        setMenuOpen(false)
                        goBack()
                      }}
                    >
                      Back to{' '}
                      <span className="numeral text-[0.95em]">{String(returnTopic.index + 1).padStart(2, '0')}</span>{' '}
                      {returnTopic.word}
                    </MenuRow>
                  ) : null}
                  <MenuRow
                    icon={<Home size={14} />}
                    onClick={() => {
                      setMenuOpen(false)
                      goHome()
                    }}
                  >
                    Start over from the beginning
                  </MenuRow>
                  <MenuRow icon={<Compass size={14} />} onClick={startTour}>
                    Show me around this page
                  </MenuRow>
                  {ctx.isLast ? null : (
                    <MenuRow
                      icon={<span className="text-[13px] leading-none">&rarr;</span>}
                      accent
                      onClick={() => {
                        setMenuOpen(false)
                        openContactModal()
                      }}
                    >
                      {CLOSING.action}
                    </MenuRow>
                  )}
                </div>
              </MeloCard>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          data-tour="melo"
          onClick={toggleMenu}
          {...hoverable}
          aria-expanded={showMenu}
          aria-label={showMenu ? 'Close Melo' : "Talk to Melo, NEXR's guide"}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.45, ease: EASE }}
          className={`melo-avatar relative h-14 w-14 rounded-full md:h-16 md:w-16 ${
            showBubble || showMenu ? '' : 'melo-avatar--idle'
          }`}
        >
          <span className="absolute inset-0 overflow-hidden rounded-full border-2 border-ember/60 bg-[#1f140c] shadow-xl shadow-black/40">
            <AnimatePresence initial={false}>
              <motion.img
                key={pose}
                src={faceSrc(pose)}
                alt=""
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 h-full w-full select-none object-cover"
              />
            </AnimatePresence>
          </span>
          {!seen && !showMenu ? (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#16100b] bg-ember"
            />
          ) : null}
        </motion.button>
      </div>

      <AnimatePresence>
        {touring ? (
          <MeloTour
            key={pathname}
            steps={autoTour.current ? [WELCOME_STEP, ...ctx.tour] : ctx.tour}
            onFinish={endTour}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

function MenuRow({
  icon,
  onClick,
  accent,
  children,
}: {
  icon: React.ReactNode
  onClick: () => void
  accent?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...hoverable}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
    >
      <span className={`flex w-4 shrink-0 justify-center ${accent ? 'text-ember' : 'text-bone/40'}`}>{icon}</span>
      <span className={`min-w-0 text-[13px] leading-tight ${accent ? 'text-ember/90' : 'text-bone/75'}`}>
        {children}
      </span>
    </button>
  )
}
