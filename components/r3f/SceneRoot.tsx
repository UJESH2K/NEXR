'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { AmbientAudio } from './AmbientAudio'
import { CameraRig } from './CameraRig'
import { CharacterModel } from './CharacterModel'
import { Lighting } from './Lighting'

const IDLE_AFTER_LEAVE = 900

export default function SceneRoot() {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  const [rendering, setRendering] = useState(true)

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
        camera={{ position: [0, 2, 80], fov: 43, near: 0.1, far: 500 }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
      >
        <Lighting />
        <CameraRig reduced={reduced} />
        <CharacterModel reduced={reduced} />
        <AmbientAudio reduced={reduced} />

        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </div>
  )
}
