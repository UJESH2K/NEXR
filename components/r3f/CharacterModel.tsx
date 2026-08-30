'use client'

import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { AnimationMixer, Group, MathUtils } from 'three'
import { MODEL_URL } from '@/lib/cards'
import { ACT, activeCardIndex, scroll } from '@/lib/scrollStore'

const POSE_TIMES = [0.0417, 0.0833, 0.125, 0.1667, 0.2083, 0.25]
const SCALE = 100

function Character({ reduced }: { reduced: boolean }) {
  const { scene, animations } = useGLTF(MODEL_URL, true, true)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    if (animations.length) {
      const mixer = new AnimationMixer(scene)
      mixer.clipAction(animations[0]).play()
      mixerRef.current = mixer
      return () => { mixerRef.current = null }
    }
  }, [scene, animations])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const progress = scroll.homeProgress
    const g = groupRef.current
    if (!g) return

    g.scale.setScalar(SCALE)
    g.position.set(0, -14, 0)

    const mixer = mixerRef.current
    if (!mixer) return

    let animTime: number

    if (progress < ACT.approachEnd) {
      animTime = POSE_TIMES[0]
    } else if (progress < ACT.orbitEnd) {
      const card = activeCardIndex(progress)
      animTime = card >= 0 ? POSE_TIMES[card] : POSE_TIMES[0]
    } else {
      animTime = POSE_TIMES[POSE_TIMES.length - 1]
    }

    mixer.setTime(animTime)
  })

  return (
    <group ref={groupRef} scale={SCALE} position={[0, -14, 0]}>
      <primitive object={scene} />
    </group>
  )
}

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
    </group>
  )
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }

class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) {
    console.warn(`[NEXR] Could not load ${MODEL_URL}`, error)
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
