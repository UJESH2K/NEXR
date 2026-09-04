'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type DirectionalLight, type SpotLight } from 'three'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { clamp01, damp, scroll } from '@/lib/scrollStore'

/**
 * Lighting for a coloured 360 room.
 *
 * There is no environment map — a drei <Environment> preset would pull an HDR
 * from a CDN at runtime, which this page cannot afford on top of the model. So
 * the room's own colour has to be faked by hand, and the two rim lights are
 * what do it: they carry the beat's accent, cross-fade with it, and are the
 * only thing separating a pale figure from a pale sky.
 *
 * The key light drifts with the pointer. It is a small movement, but it is the
 * one that makes the figure feel lit by the room rather than by the renderer.
 */

const _a = new Color()
const _b = new Color()

export function Lighting({ reduced = false }: { reduced?: boolean }) {
  const key = useRef<DirectionalLight>(null)
  const warmRim = useRef<DirectionalLight>(null)
  const coolRim = useRef<DirectionalLight>(null)
  const pool = useRef<SpotLight>(null)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)

    const f = scroll.sectionFloat
    const i = Math.min(Math.floor(f), SECTION_COUNT - 1)
    const j = Math.min(i + 1, SECTION_COUNT - 1)
    const t = clamp01(f - i)

    _a.set(SECTIONS[i].accent)
    _b.set(SECTIONS[j].accent)
    _a.lerp(_b, t)

    if (warmRim.current) warmRim.current.color.lerp(_a, 1 - Math.exp(-4 * dt))
    if (pool.current) pool.current.color.lerp(_a, 1 - Math.exp(-4 * dt))

    if (key.current && !reduced) {
      key.current.position.x = damp(key.current.position.x, 4 + scroll.pointerX * 5, 3, dt)
      key.current.position.y = damp(key.current.position.y, 6 - scroll.pointerY * 3, 3, dt)
    }

    if (coolRim.current) {
      // The cool rim swells slightly with pointer energy, so quick movement
      // catches an edge on the figure.
      coolRim.current.intensity = damp(
        coolRim.current.intensity,
        0.75 + scroll.pointerEnergy * 0.5,
        4,
        dt,
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.55} color="#cddcc4" />
      <hemisphereLight args={['#c9dbb4', '#1a1f18', 0.7]} />

      {/* Key — front-high, camera-left, and the one thing the pointer moves. */}
      <directionalLight ref={key} position={[4, 6, 6]} intensity={1.5} color="#fff6e8" />

      {/* Accent rim from behind. Carries the beat's colour. */}
      <directionalLight ref={warmRim} position={[-5, 3, -6]} intensity={1.25} color="#d8f35d" />

      {/* Cool counter-rim on the opposite side for separation on the turn. */}
      <directionalLight ref={coolRim} position={[6, 1.5, -5]} intensity={0.75} color="#9fc4d4" />

      {/* Pool from above and behind: this is what puts a halo on the shoulders. */}
      <spotLight
        ref={pool}
        position={[-8, 22, -14]}
        angle={0.7}
        penumbra={0.9}
        // Spot and point lights are physically based: intensity is candela and
        // illuminance falls off with the square of distance. This one sits
        // about 30 units from the figure, so 900 lands near 1.0 there. Reading
        // these as though they were the old 0–2 multipliers is why they look
        // switched off.
        intensity={900}
        distance={110}
        color="#d8f35d"
      />

      {/* Soft underlight so the legs do not fall to black against the rock. */}
      <pointLight position={[0, -8, 12]} intensity={260} distance={70} color="#3d5145" />
    </>
  )
}
