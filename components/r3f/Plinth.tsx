'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  IcosahedronGeometry,
  MeshStandardMaterial,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scroll } from '@/lib/scrollStore'

/**
 * The dark mass the character stands on, plus the pool of shade under it.
 *
 * Without something beneath the feet the figure reads as pasted onto the sky —
 * there is nothing in a 360 gradient to say where the ground is. A rough dark
 * form solves that and costs one geometry: an icosahedron displaced once at
 * build time, kept low and wide so it stays a base rather than a landscape.
 *
 * It never rotates. The camera arc already moves the silhouette; spinning the
 * ground as well would make the character look like it was standing on a
 * turntable.
 */

const _fog = new Color()

/** Deterministic hash so the rock is identical on every load and on the server. */
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

function displaced() {
  const geometry = new IcosahedronGeometry(1, 5)
  const pos = geometry.attributes.position
  const v = { x: 0, y: 0, z: 0 }

  for (let i = 0; i < pos.count; i++) {
    v.x = pos.getX(i)
    v.y = pos.getY(i)
    v.z = pos.getZ(i)

    // Two frequencies: the low one gives the boulder its overall lumps, the
    // high one gives it a broken surface that catches the rim lights.
    const low = hash(Math.round(v.x * 2.2), Math.round(v.y * 2.2), Math.round(v.z * 2.2))
    const high = hash(Math.round(v.x * 9), Math.round(v.y * 9), Math.round(v.z * 9))
    const d = 1 + (low - 0.5) * 0.42 + (high - 0.5) * 0.1

    pos.setXYZ(i, v.x * d, v.y * d, v.z * d)
  }

  geometry.computeVertexNormals()
  return geometry
}

export function Plinth() {
  const rock = useRef<Mesh>(null)
  const shade = useRef<MeshBasicMaterial>(null)

  const geometry = useMemo(displaced, [])

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#2e1b12',
        roughness: 0.95,
        metalness: 0.05,
        flatShading: false,
        fog: true,
      }),
    [],
  )

  useFrame(() => {
    // The rock takes the beat's fog tint so it never sits at a colour the room
    // has left behind. Emissive rather than colour so it stays a dark mass.
    const f = scroll.sectionFloat
    const i = Math.min(Math.floor(f), SECTION_COUNT - 1)
    _fog.set(SECTIONS[i].fog)
    material.emissive.lerp(_fog, 0.02)
    material.emissiveIntensity = 0.14

    if (shade.current) shade.current.opacity = 0.5
  })

  // The GLB measures 0.316 units tall with its origin on the soles, and the
  // character group scales it by 100 and drops it to y = -14. So the feet are
  // at exactly -14, and the rock's crown has to land just under that: high
  // enough to be stood on, low enough that the shoes are not swallowed.
  return (
    <group position={[0, -20, 0]}>
      {/* Wider than the figure (20.4 units across) and flattened, so it reads
          as an outcrop rather than a boulder balanced on a point. */}
      <mesh ref={rock} geometry={geometry} material={material} scale={[15, 6.4, 15]} />

      {/* A soft dark disc that grounds the silhouette from every camera angle. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.6, 0]}>
        <circleGeometry args={[26, 48]} />
        <meshBasicMaterial
          ref={shade}
          color="#160b06"
          transparent
          opacity={0.5}
          depthWrite={false}
          side={DoubleSide}
          fog
        />
      </mesh>
    </group>
  )
}
