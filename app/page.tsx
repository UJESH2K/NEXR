'use client'

import { ActOverlays } from '@/components/overlay/ActOverlays'
import { CardHotspots } from '@/components/overlay/CardHotspots'
import { HomeScrollDriver } from '@/components/overlay/HomeScrollDriver'
import { ParticleDebugPanel } from '@/components/overlay/ParticleDebugPanel'
import { ScatterText } from '@/components/overlay/ScatterText'
import { ScrollHud } from '@/components/overlay/ScrollHud'
import { StaticHome } from '@/components/site/StaticHome'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useWebGLSupport } from '@/lib/useWebGLSupport'

/**
 * Home is the 3D scene. This component contributes only the scroll track and
 * the DOM layers that sit over the canvas — the canvas itself lives in the root
 * layout so it survives navigation.
 */
export default function HomePage() {
  const reduced = useReducedMotion()
  const webgl = useWebGLSupport()

  // webgl === null means the probe hasn't run yet (first client paint). Holding
  // the static version until then avoids mounting the scroll track and then
  // immediately tearing it down.
  if (reduced || webgl !== true) return <StaticHome />

  return (
    <>
      <HomeScrollDriver />
      <ScatterText />
      <ActOverlays />
      <CardHotspots />
      <ScrollHud />
      <ParticleDebugPanel />
    </>
  )
}
