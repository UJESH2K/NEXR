'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { createAmbientAudio } from '@/lib/particles/ambientAudio'
import { particleConfig } from '@/lib/particles/config'
import { interaction } from '@/lib/particles/interaction'

/**
 * Drives the ambient layer from the interaction state. Lives inside the canvas
 * only to borrow its render loop — it draws nothing.
 */
export function AmbientAudio({ reduced = false }: { reduced?: boolean }) {
  const audio = useMemo(() => createAmbientAudio(() => particleConfig.audioIntensity), [])
  const enabled = useRef(true)

  useEffect(() => () => audio.dispose(), [audio])

  useFrame((_, delta) => {
    const on = particleConfig.audioEnabled && !reduced
    if (on !== enabled.current) {
      enabled.current = on
      audio.setEnabled(on)
    }
    if (!on) return

    audio.update(
      {
        level: interaction.distortion,
        energy: interaction.energy,
        // Pan follows where on the body the contact is, which is subtle but is
        // what stops the layer sounding pasted on top of the visuals.
        pan: interaction.point.x * 1.2,
      },
      Math.min(delta, 0.1),
    )
  })

  return null
}
