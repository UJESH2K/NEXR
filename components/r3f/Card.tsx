'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  MathUtils,
  Vector3,
  type Group,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type PerspectiveCamera,
} from 'three'
import type { NexrCard } from '@/lib/cards'
import {
  cardLocalT,
  easeInOutCubic,
  lerp,
  scroll,
  scrollCommands,
  smoothstep,
} from '@/lib/scrollStore'
import { useCardTexture } from '@/lib/useCardTexture'
import { LOOK_Y } from './CameraRig'

const CARD_W = 2.0
const CARD_H = 2.5
/** Deliberately tiny — enough to catch a highlight on the edge and read as a
 *  solid object, not enough to look like a slab. */
const CARD_D = 0.05
const FACE_INSET = 0.06

// ── Dwell profile ───────────────────────────────────────────────────────────
// The window is split into arrive / hold / leave. The hold is the majority of it
// on purpose: a card that only passes through its closest point is impossible to
// catch, because the moment it is readable is a single instant. Here it arrives,
// then genuinely stops — same depth, same lateral offset, square-on to the
// camera — for just over half its window, and only then leaves.
const HOLD_IN = 0.26
const HOLD_OUT = 0.78

/** Where the card sits while it holds, in camera-relative terms: metres along
 *  the view axis, and metres to one side of it. */
const HOLD_DEPTH = 6.0
const HOLD_LATERAL = 2.25
const HOLD_HEIGHT = 0.12
/** A breath of forward drift across the hold, so "stopped" does not become
 *  "frozen". Small enough that it never reads as travel. */
const HOLD_DRIFT = 0.14

/** Cards arrive from beyond the character and leave past the viewer, which is
 *  what gives the pass its depth. */
const ENTRY_DEPTH = 9.6
const ENTRY_HEIGHT = 0.85
const EXIT_DEPTH = 4.2
const EXIT_HEIGHT = -0.55

/** Yaw applied on entry/exit so the edge is visible; eases to square-on at the
 *  hold, where the artwork needs to be readable. Decelerating this to zero as
 *  the card settles is a large part of what makes it read as *arriving*. */
const EDGE_YAW = 0.28

const LOCK_DISTANCE = HOLD_DEPTH
/** Slight overscan so no background slivers show at the frame edges. */
const OVERSCAN = 1.02

// Scratch vectors, reused every frame to avoid per-frame allocation.
const lookTarget = new Vector3()
const viewDir = new Vector3()
const lockPoint = new Vector3()
const camForward = new Vector3()
const camRight = new Vector3()

export function Card({ card, index }: { card: NexrCard; index: number }) {
  const group = useRef<Group>(null)
  const faceMaterial = useRef<MeshBasicMaterial>(null)
  const edgeMaterial = useRef<MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const texture = useCardTexture(card.image, card.tint, card.title)

  /** Alternate sides down the sequence, so consecutive cards do not hold in the
   *  same place and the character is never hidden behind the same edge twice. */
  const side = index % 2 === 0 ? 1 : -1

  const setOpacity = (value: number) => {
    if (faceMaterial.current) faceMaterial.current.opacity = value
    if (edgeMaterial.current) edgeMaterial.current.opacity = value
  }

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return

    const armed = scroll.armedCard === index
    const t = cardLocalT(index, scroll.homeProgress)

    // Outside its window and not armed: hide it. Three skips raycasting against
    // invisible objects, so this also removes it from hit testing.
    if (!armed && t < 0) {
      node.visible = false
      return
    }
    node.visible = true

    if (armed) {
      const progress = scroll.transitionProgress

      // Park the card exactly in front of the camera, along the view direction.
      lookTarget.set(0, LOOK_Y, 0)
      viewDir.copy(lookTarget).sub(camera.position).normalize()
      lockPoint.copy(camera.position).addScaledVector(viewDir, LOCK_DISTANCE)

      // Exponential damping: frame-rate independent, and it gives the card a
      // natural glide out of the orbit into the lock without a separate tween.
      // LOCK_DISTANCE equals HOLD_DEPTH, so an armed card only has to slide
      // sideways into centre — it never lurches toward or away from the camera.
      node.position.lerp(lockPoint, 1 - Math.exp(-8 * delta))
      node.lookAt(camera.position)

      // Exact size needed to cover the frustum at LOCK_DISTANCE.
      const halfFov = (camera.fov * MathUtils.DEG2RAD) / 2
      const fullHeight = 2 * LOCK_DISTANCE * Math.tan(halfFov)
      const fullWidth = fullHeight * camera.aspect

      // Uniform scale using the larger ratio: guarantees coverage while
      // preserving the artwork's aspect ratio. Scaling the axes independently
      // would stretch the image as it grows.
      const cover = Math.max(fullWidth / CARD_W, fullHeight / CARD_H) * OVERSCAN
      node.scale.setScalar(lerp(1, cover, easeInOutCubic(progress)))
      setOpacity(1)
      return
    }

    // ── Orbit ──────────────────────────────────────────────────────────────
    // The pose is expressed relative to the camera, not in world coordinates.
    // That is the whole trick: the camera keeps orbiting underneath, so a card
    // holding a fixed camera-relative pose is still revolving around the
    // character in world space — it just looks perfectly still on screen, which
    // is the thing that was missing.
    const halfFov = (camera.fov * MathUtils.DEG2RAD) / 2
    const tanHalfFov = Math.tan(halfFov)
    /** Half the visible width at a given distance in front of the camera. */
    const halfWidthAt = (depth: number) => depth * tanHalfFov * camera.aspect

    // Derived from the live frustum rather than hardcoded: a lateral offset that
    // is safely off-frame at 16:9 is still on-screen at 21:9, and the card would
    // visibly pop into existence instead of emerging from the dark.
    const entryLateral = halfWidthAt(ENTRY_DEPTH) + CARD_W
    const exitLateral = halfWidthAt(EXIT_DEPTH) + CARD_W

    // The hold offset is clamped to what the viewport can actually show. On a
    // narrow window the unclamped 2.25 would hang the outer edge off-frame, so
    // the card slides inward instead — and on anything wider than about 4:3 the
    // clamp is inactive and the tuned value stands.
    const holdLateral = Math.min(
      HOLD_LATERAL,
      Math.max(0, halfWidthAt(HOLD_DEPTH) * 0.96 - CARD_W / 2),
    )

    let depth: number
    let lateral: number
    let height: number
    let yaw: number

    if (t < HOLD_IN) {
      // Arrive. Easing *out* of the motion into the hold, with the yaw
      // straightening as it goes, is what makes the stop read as a stop rather
      // than as a pause between two passes.
      const p = easeInOutCubic(t / HOLD_IN)
      depth = lerp(ENTRY_DEPTH, HOLD_DEPTH, p)
      lateral = lerp(entryLateral, holdLateral, p) * side
      height = lerp(ENTRY_HEIGHT, HOLD_HEIGHT, p)
      yaw = EDGE_YAW * side * (1 - p)
    } else if (t <= HOLD_OUT) {
      // Hold. Fixed lateral, fixed height, square-on to the camera. The only
      // movement is a slow forward breath and back again.
      const h = (t - HOLD_IN) / (HOLD_OUT - HOLD_IN)
      depth = HOLD_DEPTH - HOLD_DRIFT * Math.sin(Math.PI * h)
      lateral = holdLateral * side
      height = HOLD_HEIGHT
      yaw = 0
    } else {
      // Leave, forward and outward — the card sweeps past the viewer rather than
      // retreating the way it came, and stays on its own side so it never
      // crosses in front of the character.
      const p = easeInOutCubic((t - HOLD_OUT) / (1 - HOLD_OUT))
      depth = lerp(HOLD_DEPTH, EXIT_DEPTH, p)
      lateral = lerp(holdLateral, exitLateral, p) * side
      height = lerp(HOLD_HEIGHT, EXIT_HEIGHT, p)
      yaw = -EDGE_YAW * side * p
    }

    // Horizontal camera basis. Flattening forward keeps the card's own vertical
    // placement independent of how far the camera is tilted down.
    camForward.set(0, LOOK_Y, 0).sub(camera.position)
    camForward.y = 0
    camForward.normalize()
    camRight.set(-camForward.z, 0, camForward.x)

    node.position
      .copy(camera.position)
      .addScaledVector(camForward, depth)
      .addScaledVector(camRight, lateral)
    // Absolute, not relative to the camera: the camera rises through act IV, and
    // a card pinned to its height would climb with it mid-hold.
    node.position.y = LOOK_Y + height

    node.lookAt(camera.position)
    node.rotateY(yaw)

    const targetScale = hovered ? 1.06 : 1
    node.scale.setScalar(
      MathUtils.damp(node.scale.x, targetScale, 8, delta),
    )

    // Both fades finish outside the hold, so the card is at full opacity for the
    // entire time it is stationary and clickable.
    setOpacity(smoothstep(0, 0.15, t) * (1 - smoothstep(0.82, 0.98, t)))

    if (edgeMaterial.current) {
      edgeMaterial.current.emissiveIntensity = MathUtils.damp(
        edgeMaterial.current.emissiveIntensity,
        hovered ? 0.9 : 0.15,
        8,
        delta,
      )
    }
  })

  const onOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (scroll.mode === 'transition') return
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const onOut = () => {
    setHovered(false)
    document.body.style.cursor = ''
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (scroll.mode === 'transition') return
    document.body.style.cursor = ''
    scrollCommands.armCard(index)
  }

  return (
    <group
      ref={group}
      visible={false}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.03} smoothness={3}>
        <meshStandardMaterial
          ref={edgeMaterial}
          color="#0a0c0a"
          emissive={card.tint[0]}
          emissiveIntensity={0.15}
          roughness={0.5}
          metalness={0.2}
          transparent
        />
      </RoundedBox>

      {/* The artwork sits just proud of the front face. meshBasicMaterial keeps
          it unlit — photographic content should not pick up scene lighting. */}
      <mesh position={[0, 0, CARD_D / 2 + 0.002]}>
        <planeGeometry args={[CARD_W - FACE_INSET, CARD_H - FACE_INSET]} />
        <meshBasicMaterial
          ref={faceMaterial}
          map={texture}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  )
}
