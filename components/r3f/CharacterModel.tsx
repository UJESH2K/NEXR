'use client'

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { usePathname } from 'next/navigation'
import {
  AnimationMixer,
  Group,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three'
import { DRACO_PATH, MODEL_URL } from '@/lib/cards'
import { SECTION_COUNT } from '@/lib/sections'
import { clamp, clamp01, damp, scroll, smoothstep } from '@/lib/scrollStore'

/**
 * The character, posed by scroll.
 *
 * The GLB carries one 4-second clip that walks through six authored poses. It
 * is never *played* — the mixer's time is written directly from scroll, so the
 * clip behaves as a lookup table of poses rather than an animation. Scrubbing
 * it this way is what lets the figure land cleanly on a pose and hold there
 * while the visitor reads, then move only when they scroll on.
 *
 * The figure deliberately does not turn on its own axis. Everything that makes
 * it feel alive comes from elsewhere: the camera arcs around it, the room turns
 * behind it, and it breathes. A yaw here would fight all three.
 */

const SCALE = 100
const BASE_Y = -14
const CENTER = new Vector3(0, BASE_Y, 0)
const OFF_HOME = new Vector3(21, BASE_Y, 0)

/**
 * Where in each section the pose change happens.
 *
 * Everything before START is dwell: the figure holds the pose it arrived in
 * while the panels and copy for that beat are on screen. The change then runs
 * in the tail of the section so it completes exactly as the next beat's copy
 * arrives.
 */
const CHANGE_START = 0.42
const CHANGE_END = 0.95

/**
 * The pose range inside the clip, in frames.
 *
 * The GLB holds 96 samples at 24fps, keyed from frame 1 to frame 96. The six
 * authored poses occupy the first 91 of those, so the scrub stops there: the
 * tail is the animation returning toward its start, and running into it would
 * show the opening pose again on the closing beat.
 *
 * If a pose ever looks clipped or the last beat lands early, this pair is the
 * only thing to move — everything else derives from it.
 */
const FPS = 24
const FIRST_POSE_FRAME = 1
const LAST_POSE_FRAME = 91

function Character({ reduced }: { reduced: boolean }) {
  // The decoder is served from /public rather than drei's default gstatic CDN:
  // a third-party fetch on the critical path is one more thing that can be slow
  // or blocked, and without it the model silently falls back to the wireframe.
  const { scene, animations } = useGLTF(MODEL_URL, DRACO_PATH, true)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const groupRef = useRef<Group>(null)
  const durationRef = useRef(LAST_POSE_FRAME / FPS)
  const poseRef = useRef(0)
  const pathname = usePathname()

  // The clip must not be shared between mounts — cloning keeps the scene graph
  // owned by this instance so a route change cannot leave a half-scrubbed pose
  // behind on the cached GLTF.
  const graph = useMemo(() => scene, [scene])

  useEffect(() => {
    if (!animations.length) return

    const mixer = new AnimationMixer(graph)
    const action = mixer.clipAction(animations[0])
    action.setLoop(LoopRepeat, Infinity)
    action.play()
    // Deliberately NOT paused. `mixer.setTime(t)` zeroes every action's clock
    // and then advances it by t — and a paused action refuses to advance, so
    // pausing it pins the character at frame 0 for the whole page. The clip is
    // scrubbed, not played, but the action still has to be live for scrubbing
    // to reach it.
    mixerRef.current = mixer
    // Never scrub past the authored range, even if a re-export is longer.
    durationRef.current = Math.min(
      animations[0].duration || LAST_POSE_FRAME / FPS,
      LAST_POSE_FRAME / FPS,
    )

    return () => {
      mixer.stopAllAction()
      mixerRef.current = null
    }
  }, [graph, animations])

  /**
   * Repair the export's transparency, which is why the face was see-through.
   *
   * The body material (`aiStandardSurface1`) ships with glTF `alphaMode:
   * "BLEND"`, almost certainly a leftover from the Arnold shader it was
   * converted from — the base colour texture has no alpha worth blending. For a
   * BLEND material GLTFLoader sets `transparent = true` and, critically,
   * `depthWrite = false`. With no depth being written and the mesh marked
   * double-sided, the head's far surfaces draw over its near ones depending on
   * nothing more than triangle order, and the face disappears into the inside
   * of the skull.
   *
   * Forcing the material opaque restores depth writing and the face resolves.
   * Side is left as the export set it: the garments are open surfaces in
   * places, and flipping to FrontSide would punch holes in them.
   *
   * Nothing else about the materials is touched. An earlier version also
   * rewrote roughness and metalness here, which fought the metallic-roughness
   * texture the body actually ships with.
   */
  useEffect(() => {
    graph.traverse((child) => {
      if (!(child instanceof Mesh)) return
      child.castShadow = false
      child.receiveShadow = false
      child.frustumCulled = false

      const list = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of list) {
        if (!(m instanceof MeshStandardMaterial)) continue
        if (m.transparent || m.depthWrite === false) {
          m.transparent = false
          m.depthWrite = true
          m.alphaTest = 0
          m.opacity = 1
          m.needsUpdate = true
        }
        m.fog = true
      }
    })
  }, [graph])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.1)

    g.scale.setScalar(SCALE)

    // ── placement ──────────────────────────────────────────────────────────
    const target = pathname !== '/' ? OFF_HOME : CENTER

    // Breathing: a slow vertical drift with a second, slower beat on top so the
    // period never becomes obvious. Skipped entirely under reduced motion.
    const t = state.clock.elapsedTime
    const breath = reduced
      ? 0
      : Math.sin(t * 0.55) * 0.28 + Math.sin(t * 0.23) * 0.16

    g.position.x = damp(g.position.x, target.x, 5, dt)
    g.position.y = damp(g.position.y, target.y + breath, 5, dt)
    g.position.z = damp(g.position.z, target.z, 5, dt)

    // No yaw, by design. What the pointer gets instead is a barely-there lean —
    // enough that the figure feels attentive, far short of a turn.
    g.rotation.z = damp(g.rotation.z, reduced ? 0 : -scroll.pointerX * 0.014, 3, dt)

    // ── pose ───────────────────────────────────────────────────────────────
    const mixer = mixerRef.current
    if (!mixer) return

    const f = scroll.sectionFloat
    const section = Math.floor(f)
    const within = f - section

    // Hold, then change. Clamped to the last pose so the final section keeps
    // its pose through its dwell instead of wrapping to the first.
    const posed = section + smoothstep(CHANGE_START, CHANGE_END, within)
    const targetPose = clamp(posed, 0, SECTION_COUNT - 1)

    // Damped rather than assigned: a flick of the wheel would otherwise jump
    // the skeleton several poses in one frame, which reads as a glitch.
    poseRef.current = damp(poseRef.current, targetPose, 7, dt)

    // Poses are evenly spaced across the authored range, so beat i sits at
    // i/(n-1) of the way through it. Offset by the first frame because the clip
    // is keyed from frame 1, not frame 0 — starting at 0 would sample before
    // the first keyframe and hold a pose the animator never made.
    const normalised = clamp01(poseRef.current / (SECTION_COUNT - 1))
    const first = FIRST_POSE_FRAME / FPS
    mixer.setTime(first + normalised * (durationRef.current - first))
  })

  return (
    <group ref={groupRef} scale={SCALE} position={[CENTER.x, CENTER.y, CENTER.z]}>
      <primitive object={graph} />
    </group>
  )
}

/** Shown while the GLB streams in, and if it fails outright. */
function Placeholder() {
  const spin = useRef<Group>(null)
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.25
  })
  return (
    <group ref={spin} position={[0, 2, 0]}>
      <mesh>
        <icosahedronGeometry args={[3.2, 1]} />
        <meshBasicMaterial color="#d8f35d" wireframe opacity={0.22} transparent />
      </mesh>
    </group>
  )
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }

class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
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

useGLTF.preload(MODEL_URL, DRACO_PATH, true)
