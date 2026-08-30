'use client'

import { useRef, useState, useEffect } from 'react'
import Matter from 'matter-js'
import './FallingText.css'

/**
 * A paragraph where certain "falling" words break free on page load and drop
 * under Matter.js gravity. The rest of the paragraph stays exactly where it is.
 *
 * The paragraph reads naturally — the falling words start in their correct
 * positions, then drift downward with physics, leaving gaps in the text.
 */

const PARAGRAPH = `In today's workplaces, anxiety and burnout have become silent companions for too many. Depression doesn't announce itself — it lingers in the shadows of stigma and isolation. People carry exhaustion and overwhelm quietly, trapped by shame and fear of judgement. Loneliness festers behind professional facades while self-doubt erodes confidence. The silence around mental health only deepens the despair, leaving employees suffering in withdrawal when what they need is a safe path to reach out.`

/** Words that will break free and fall (matched case-insensitively). */
const FALLING_WORDS = new Set([
  'anxiety', 'burnout', 'depression', 'stigma', 'isolation',
  'exhaustion', 'overwhelm', 'shame', 'fear', 'loneliness',
  'self-doubt', 'despair', 'silence', 'suffering', 'withdrawal',
])

type FallingTextProps = {
  className?: string
  fadeProgress?: number
}

export function FallingText({ className = '', fadeProgress = 0 }: FallingTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // ── Build paragraph with highlighted spans ────────────────────────────
  useEffect(() => {
    if (!textRef.current) return

    const html = PARAGRAPH.split(/(\s+)/).map((token) => {
      const clean = token.replace(/[^a-zA-Z-]/g, '').toLowerCase()
      if (FALLING_WORDS.has(clean)) {
        return `<span class="ft-falling" data-word="${token}">${token}</span>`
      }
      return token
    }).join('')
    textRef.current.innerHTML = html

    // Small delay so the DOM settles before we measure positions
    requestAnimationFrame(() => setMounted(true))
  }, [])

  // ── Matter.js: take the highlighted words and make them physics bodies ─
  useEffect(() => {
    if (!mounted || !wrapperRef.current || !textRef.current || !canvasRef.current) return

    const { Engine, Render, World, Bodies, Runner, Body } = Matter
    const container = wrapperRef.current
    const containerRect = container.getBoundingClientRect()
    const width = containerRect.width
    const height = containerRect.height
    if (width <= 0 || height <= 0) return

    const engine = Engine.create()
    engine.world.gravity.y = 0.6

    const render = Render.create({
      element: canvasRef.current,
      engine,
      options: { width, height, background: 'transparent', wireframes: false },
    })

    // Invisible walls
    const wOpts = { isStatic: true, render: { fillStyle: 'transparent' } }
    World.add(engine.world, [
      Bodies.rectangle(width / 2, height + 30, width * 2, 60, wOpts),
      Bodies.rectangle(-30, height / 2, 60, height * 2, wOpts),
      Bodies.rectangle(width + 30, height / 2, 60, height * 2, wOpts),
    ])

    // Measure each falling word and create a physics body at its position
    const spans = textRef.current.querySelectorAll<HTMLElement>('.ft-falling')
    const bodies: { elem: HTMLElement; body: Matter.Body; origX: number; origY: number }[] = []

    spans.forEach((span) => {
      const spanRect = span.getBoundingClientRect()
      const x = spanRect.left - containerRect.left + spanRect.width / 2
      const y = spanRect.top - containerRect.top + spanRect.height / 2

      const body = Bodies.rectangle(x, y, spanRect.width + 4, spanRect.height + 2, {
        render: { fillStyle: 'transparent' },
        restitution: 0.5,
        frictionAir: 0.02,
        friction: 0.1,
      })

      // Slight random initial velocity for organic feel
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 1.5 + 0.5,
      })
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03)

      // Make the original span invisible
      span.style.visibility = 'hidden'

      bodies.push({ elem: span, body, origX: x, origY: y })
    })

    World.add(engine.world, bodies.map((b) => b.body))

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    let raf: number
    const loop = () => {
      bodies.forEach(({ body, elem }) => {
        const { x, y } = body.position
        // Position the word element at the physics body
        elem.style.position = 'absolute'
        elem.style.left = `${x}px`
        elem.style.top = `${y}px`
        elem.style.visibility = 'visible'
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
        elem.style.pointerEvents = 'none'
      })
      Engine.update(engine)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      Render.stop(render)
      Runner.stop(runner)
      if (render.canvas && canvasRef.current) {
        canvasRef.current.removeChild(render.canvas)
      }
      World.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [mounted])

  return (
    <div
      ref={wrapperRef}
      className={`falling-text-container ${className}`}
      style={{
        position: 'fixed',
        right: '3vw',
        top: '15vh',
        width: '38vw',
        maxWidth: '420px',
        height: '70vh',
        opacity: fadeProgress >= 1 ? 0 : 1 - fadeProgress,
        transition: 'opacity 0.4s ease-out',
        pointerEvents: 'none',
        zIndex: 'var(--z-overlay)',
      }}
      aria-hidden="true"
    >
      {/* The paragraph — falling words are absolutely repositioned on top */}
      <div
        ref={textRef}
        className="ft-paragraph"
        style={{
          fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)',
          lineHeight: 1.85,
          color: 'var(--color-sand)',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.01em',
          textAlign: 'left',
        }}
      />
      <div ref={canvasRef} className="falling-text-canvas" />
    </div>
  )
}
