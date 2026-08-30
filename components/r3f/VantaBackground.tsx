'use client'

import { useEffect, useRef, useState } from 'react'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true) }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    let cancelled = false

    const init = async () => {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js')
      const vantaSrc = (await import('vanta/src/vanta.trunk.js')).default
      if (cancelled || !containerRef.current) return

      effectRef.current = vantaSrc({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xe00c4f,
        backgroundColor: 0x000000,
        spacing: 0.0,
        chaos: 1.0,
      })
    }

    init()

    return () => {
      cancelled = true
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [ready])

  if (!ready) return <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#000000' }} />

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
