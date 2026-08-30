'use client'

import { useEffect, useState } from 'react'
import { ActOverlays } from '@/components/overlay/ActOverlays'
import { CardOverlays } from '@/components/overlay/CardOverlays'
import { FallingText } from '@/components/overlay/FallingText'
import { HomeScrollDriver } from '@/components/overlay/HomeScrollDriver'
import { ScrollHud } from '@/components/overlay/ScrollHud'
import { StaticHome } from '@/components/site/StaticHome'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useWebGLSupport } from '@/lib/useWebGLSupport'

/**
 * Home is the 3D scene. FallingText replaces ScatterText — physics-driven
 * words on the right that vanish as the user scrolls into act 1.
 */
export default function HomePage() {
  const reduced = useReducedMotion()
  const webgl = useWebGLSupport()

  // Fade progress for FallingText: 0 = fully visible, 1 = gone
  const [fade, setFade] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight
      const scrollY = window.scrollY
      // Start fading after 20% of viewport scroll, fully gone at 60%
      const progress = Math.min(Math.max((scrollY - vh * 0.2) / (vh * 0.4), 0), 1)
      setFade(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (reduced || webgl !== true) return <StaticHome />

  return (
    <>
      <HomeScrollDriver />
      <FallingText fadeProgress={fade} />
      <ActOverlays />
      <CardOverlays />
      <ScrollHud />
    </>
  )
}
