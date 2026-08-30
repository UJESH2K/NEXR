'use client'

import { useEffect, useRef } from 'react'

/**
 * Vanta.js TRUNK background. Loads p5 + TRUNK dynamically on mount
 * (both are browser-only). Cleans up on unmount.
 */
export function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (!containerRef.current) return

      // Dynamic imports — p5 and vanta are browser-only.
      const [{ default: p5 }, trunkModule] = await Promise.all([
        import('p5'),
        import('vanta/src/vanta.trunk.js'),
      ])

      const TRUNK = trunkModule.default || trunkModule

      if (cancelled || !containerRef.current) return

      // TRUNK expects `window.p5` to exist.
      ;(window as any).p5 = p5

      effectRef.current = TRUNK({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xe00c4f,
        backgroundColor: 0x312e31,
        spacing: 10.0,
        chaos: 0.5,
      })
    }

    init()

    return () => {
      cancelled = true
      if (effectRef.current) {
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
