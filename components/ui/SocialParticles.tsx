'use client'

import { useEffect, useRef } from 'react'

/**
 * A small drifting particle field behind the social links.
 *
 * Deliberately local rather than a second full-screen effect. The frame already
 * has a WebGL scene in it; another one competing for the same pixels would cost
 * real frames and add nothing, so this is a 2D canvas the size of the corner
 * block it sits behind — a few dozen embers rising and fading, the way sparks
 * come off something warm.
 *
 * It reacts to the pointer rather than ignoring it: particles near the cursor
 * are pushed gently aside and brighten, so passing over the icons disturbs the
 * field. That is the whole reason it is here rather than being a looping GIF.
 *
 * Sized from its own bounding box, observed rather than measured once, because
 * the corner it lives in moves with the viewport.
 */

/** Particles. Low by design — this is a garnish beside four small links. */
const COUNT = 34

/** How close the pointer has to be to disturb one, in px. */
const REACH = 90

type Particle = {
  x: number
  y: number
  /** Rise speed, px per second. */
  vy: number
  drift: number
  size: number
  seed: number
  /** 0..1, how far through its life it is. */
  life: number
  span: number
}

export function SocialParticles({ accent = '#ff7901' }: { accent?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const node = canvas.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = node.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()

    const pointer = { x: -9999, y: -9999 }
    const particles: Particle[] = []

    const spawn = (p: Particle, initial = false) => {
      p.x = Math.random() * width
      // New particles start at the bottom; the first frame's worth are spread
      // through the box so the field does not begin as a single rising line.
      p.y = initial ? Math.random() * height : height + 6
      p.vy = 6 + Math.random() * 13
      p.drift = (Math.random() - 0.5) * 7
      p.size = 0.7 + Math.random() * 1.5
      p.seed = Math.random() * Math.PI * 2
      p.span = 3 + Math.random() * 4
      p.life = initial ? Math.random() : 0
    }

    for (let i = 0; i < COUNT; i++) {
      const p: Particle = {
        x: 0, y: 0, vy: 0, drift: 0, size: 1, seed: 0, life: 0, span: 4,
      }
      spawn(p, true)
      particles.push(p)
    }

    const resize = () => {
      const box = node.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = box.width
      height = box.height
      node.width = Math.round(width * dpr)
      node.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(node)
    resize()

    const onMove = (event: PointerEvent) => {
      const box = node.getBoundingClientRect()
      pointer.x = event.clientX - box.left
      pointer.y = event.clientY - box.top
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (width === 0 || height === 0) return
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.life += dt / p.span
        if (p.life >= 1 || p.y < -8) {
          spawn(p)
          continue
        }

        p.y -= p.vy * dt
        // A slow sine on the horizontal, so they wander rather than rising in
        // straight lines.
        p.x += (p.drift + Math.sin(now / 900 + p.seed) * 5) * dt

        let boost = 0
        const dx = p.x - pointer.x
        const dy = p.y - pointer.y
        const distance = Math.hypot(dx, dy)

        if (distance < REACH) {
          // Falls off with distance, so the disturbance has a soft edge rather
          // than a visible radius.
          const push = (1 - distance / REACH) ** 2
          p.x += (dx / (distance || 1)) * push * 34 * dt
          p.y += (dy / (distance || 1)) * push * 34 * dt
          boost = push
        }

        // Fade in over the first fifth of life and out over the last third, so
        // nothing ever pops into or out of existence.
        const fade =
          Math.min(p.life / 0.2, 1) * (1 - Math.max(0, (p.life - 0.66) / 0.34))
        const alpha = fade * (0.28 + boost * 0.6)
        if (alpha <= 0.004) continue

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + boost * 0.8), 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.globalAlpha = alpha
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [accent])

  return (
    <canvas
      ref={canvas}
      // Sits behind the links and takes no clicks. The negative inset gives the
      // embers room to drift past the text rather than being clipped at it.
      className="pointer-events-none absolute -inset-x-6 -bottom-6 -top-16"
      aria-hidden="true"
    />
  )
}
