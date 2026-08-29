'use client'

import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Group, Vector3 } from 'three'
import { MODEL_URL } from '@/lib/cards'
import { CharacterParticles } from './CharacterParticles'

/** Height the model is normalised to, in world units. Every camera distance in
 *  CameraRig is expressed against this, so the source file's own scale is
 *  irrelevant.
 *
 *  This is the lever for "how close does the character read", and it is a better
 *  one than the camera radii: growing the model scales its apparent size by the
 *  same factor at *every* point on the scroll track, and leaves the camera path
 *  and the card choreography — which are tuned against each other — untouched.
 *  Pulling the camera in instead would put the orbit radius inside the distance
 *  the cards need to hold at, and the card layout collapses.
 *
 *  1.5× the original 2.4. At the orbit pose (radius 7.5, fov 40) the character
 *  now fills ~66% of the frame height rather than ~44%.
 *
 *  Note for anyone retuning this: the world-unit particle defaults in
 *  lib/particles/config.ts (interactionRadius, scatterRadius,
 *  displacementStrength, turbulence, turbulenceScale, particleSize) are all
 *  expressed in the same units and were scaled with it. */
const TARGET_HEIGHT = 3.6

function Character({ reduced }: { reduced: boolean }) {
  // useDraco=false: nothing in the build step emits Draco, and leaving it on
  // makes drei fetch a decoder from Google's CDN at runtime.
  // useMeshopt=true: harmless when the file is uncompressed, and drei bundles
  // that decoder locally rather than fetching it.
  const { scene } = useGLTF(MODEL_URL, false, true)

  const normalised = useMemo(() => {
    const model = scene.clone(true)

    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const centre = box.getCenter(new Vector3())
    const scale = TARGET_HEIGHT / (size.y || 1)

    // Both the scale and the recentring go on the *inner* model rather than on
    // the wrapper, which leaves the wrapper's own space in final world units.
    // The particle sampler samples in wrapper space, so this is what puts rest
    // positions, pointer hits and the scatter radius all in the same units —
    // otherwise every distance in the config would silently mean something
    // different for every model.
    model.scale.multiplyScalar(scale)
    model.position.copy(centre).multiplyScalar(-scale)

    const wrapper = new Group()
    wrapper.add(model)
    return wrapper
  }, [scene])

  return <CharacterParticles source={normalised} reduced={reduced} />
}

/** Stand-in so the scene is workable before a valid model is in place. */
function Placeholder() {
  const spin = useRef<Group>(null)

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.25
  })

  return (
    <group ref={spin}>
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color="#d8f35d" wireframe opacity={0.5} transparent />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#25342a" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }

/**
 * useGLTF throws on load failure, and a missing or unconvertible model must not
 * take the whole page down — the rest of the experience still works without it.
 */
class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn(
      `[NEXR] Could not load ${MODEL_URL} — showing placeholder. ` +
        'Run `npm run model:prepare` to generate it.',
      error,
    )
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function CharacterModel({ reduced = false }: { reduced?: boolean }) {
  return (
    <ModelBoundary fallback={<Placeholder />}>
      <Suspense fallback={<Placeholder />}>
        <Character reduced={reduced} />
      </Suspense>
    </ModelBoundary>
  )
}

useGLTF.preload(MODEL_URL)
