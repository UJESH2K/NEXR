'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { SHOW_GHOST_WORDMARK, SHOW_PANELS, SHOW_PLINTH } from '@/lib/sceneConfig'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { CameraRig } from './CameraRig'
import { CharacterModel } from './CharacterModel'
import { Environment360 } from './Environment360'
import { GhostWordmark } from './GhostWordmark'
import { Lighting } from './Lighting'
import { PanelField } from './PanelField'
import { Plinth } from './Plinth'

/**
 * How long the canvas keeps *rendering* after the visitor leaves the home page.
 *
 * This is a frame-loop delay, not a visibility one — the scene is hidden the
 * instant the route changes (see below). The grace period exists only so a
 * quick out-and-back does not stop and restart the loop needlessly.
 */
const IDLE_AFTER_LEAVE = 900

export default function SceneRoot() {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  const [rendering, setRendering] = useState(true)

  const onHome = pathname === '/'

  useEffect(() => {
    if (onHome) {
      setRendering(true)
      return
    }
    const idle = setTimeout(() => setRendering(false), IDLE_AFTER_LEAVE)
    return () => clearTimeout(idle)
  }, [onHome])

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 'var(--z-canvas)',
        /*
         * Hidden the moment the route is not home, with no transition.
         *
         * The scene used to stay on screen for the full IDLE_AFTER_LEAVE while
         * the destination page faded up over it, so every move into or between
         * the explore rooms showed a flash of the character behind the new
         * page. Deriving this straight from `pathname` means it flips in the
         * same commit as the route itself, and a hard cut rather than a fade is
         * the point: any duration here is a duration the scene is visible.
         *
         * Visibility rather than unmounting. Tearing the canvas down would drop
         * the WebGL context and force the 4 MB model to be parsed and uploaded
         * again on the way back, which trades a flash for a stall.
         */
        opacity: onHome ? 1 : 0,
        visibility: onHome ? 'visible' : 'hidden',
      }}
      aria-hidden="true"
    >
      <Canvas
        frameloop={rendering ? 'always' : 'never'}
        // Full retina. The scene is fill-bound on the sky shader, so this is
        // the single most expensive setting here — it is set high deliberately,
        // because the brief is fidelity first. AdaptiveDpr below still drops it
        // while the camera is moving and restores it when the frame settles.
        dpr={[1, 2]}
        gl={{
          antialias: true,
          // The sky sphere covers every pixel, so there is nothing to blend
          // against and an opaque buffer is the cheaper one.
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{ position: [0, 2, 80], fov: 43, near: 0.1, far: 600 }}
      >
        {/* Declared here rather than assigned inside a frame loop: three bakes
            a FOG define into each material the first time it compiles, so fog
            that appears later is silently ignored by everything already drawn.
            Environment360 only mutates this object's colour.

            Near is past the character (which sits ~80 units from the camera) so
            the figure itself stays crisp, and far is set to swallow the outer
            ring of panels, which is what gives the room its depth. */}
        <fog attach="fog" args={['#4a5843', 110, 330]} />

        <Environment360 reduced={reduced} />
        <Lighting reduced={reduced} />
        <CameraRig reduced={reduced} />
        {/* Behind the character on purpose: the depth buffer is what makes the
            figure cut through the word, which a DOM heading over the canvas can
            never do however faint it is. */}
        {SHOW_GHOST_WORDMARK ? <GhostWordmark word="NEXR" /> : null}

        {SHOW_PLINTH ? <Plinth /> : null}
        <CharacterModel reduced={reduced} />

        {/* Off while the card sizing is sorted out — see lib/sceneConfig.ts. */}
        {SHOW_PANELS ? <PanelField reduced={reduced} /> : null}

        {/* Drops resolution while the camera is moving and restores it when it
            settles. Deliberately not `pixelated`: nearest-neighbour upscaling
            is visible as blocking on a soft gradient sky, which costs more than
            the frames it buys. */}
        <AdaptiveDpr />
        <AdaptiveEvents />
        <Preload all />
      </Canvas>
    </div>
  )
}
