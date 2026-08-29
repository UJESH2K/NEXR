'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { applyQuality, detectQuality } from '@/lib/particles/config'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { AmbientAudio } from './AmbientAudio'
import { CameraRig } from './CameraRig'
import { CharacterModel } from './CharacterModel'
import { Lighting } from './Lighting'
import { OrbitCards } from './OrbitCards'

/** How long the scene keeps rendering after leaving home. Must outlast both
 *  PageFade and the disarm delay in ScrollProvider, so the card is still being
 *  drawn while it is handed over to the destination page. */
const IDLE_AFTER_LEAVE = 900

/** Pick the particle preset once per page load, before the character mounts and
 *  samples itself. Module scope rather than an effect: sampling happens as soon
 *  as the model resolves, and an effect would land after it. */
let qualityChosen = false
function chooseQualityOnce() {
  if (qualityChosen) return
  qualityChosen = true
  applyQuality(detectQuality())
}

/**
 * The persistent canvas. Mounted once in the root layout and never unmounted on
 * navigation — remounting would drop the WebGL context, flash white, and force
 * the model to re-upload to the GPU.
 *
 * aria-hidden because none of this is reachable or meaningful to assistive tech;
 * CardHotspots provides the real, focusable links.
 */
export default function SceneRoot() {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  chooseQualityOnce()
  const [rendering, setRendering] = useState(true)

  // Destination pages are opaque and cover the canvas completely, so once the
  // handover is done there is nothing to draw. Parking the render loop rather
  // than unmounting keeps the GL context and the uploaded model alive.
  useEffect(() => {
    if (pathname === '/') {
      setRendering(true)
      return
    }
    const idle = setTimeout(() => setRendering(false), IDLE_AFTER_LEAVE)
    return () => clearTimeout(idle)
  }, [pathname])

  return (
    <div className="fixed inset-0 z-0 bg-void" aria-hidden="true">
      <Canvas
        frameloop={rendering ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 3, 26], fov: 55, near: 0.1, far: 200 }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
      >
        <Lighting />
        <CameraRig reduced={reduced} />
        <CharacterModel reduced={reduced} />
        <AmbientAudio reduced={reduced} />

        {/* Under reduced motion the cards are rendered as a plain DOM grid
            instead, so keep them out of the scene entirely. */}
        {!reduced && <OrbitCards />}

        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </div>
  )
}
