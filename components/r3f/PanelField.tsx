'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  Euler,
  MathUtils,
  Quaternion,
  Vector3,
  type Group,
  type MeshBasicMaterial,
  type PerspectiveCamera,
} from 'three'
import { SECTIONS, SECTION_COUNT, ALL_PANEL_IMAGES } from '@/lib/sections'
import { damp, scroll, smoothstep } from '@/lib/scrollStore'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { useCardTexture } from '@/lib/useCardTexture'

/**
 * The panels orbiting the character.
 *
 * Every panel lives on a ring around the figure and is positioned in polar
 * coordinates — an azimuth, a height and a radius — recomputed each frame. That
 * is what makes them orbit: the azimuth advances with time and with scroll, so
 * the whole field wheels around the character rather than sitting in fixed
 * spots waiting to be swapped out.
 *
 * Two rules keep the orbit from becoming noise:
 *
 *   - Each beat has exactly one hero panel, and it does not drift. It swings
 *     around the ring into an authored position, holds there for the whole
 *     beat, and swings out. Its side alternates, and the copy overlay takes the
 *     opposite side, so the frame is always character-in-the-middle with one
 *     card and one column of text flanking it.
 *   - Three satellites per beat, and only three. They orbit freely and sit far
 *     enough back that fog reduces them to texture. The earlier version drew
 *     six per beat across a two-beat overlap, which put roughly twenty panels
 *     on screen at once and read as clutter rather than depth.
 */

type Slot = {
  /** Resting angle on the ring, radians. 0 is straight in front of the camera. */
  az: number
  y: number
  radius: number
  /** Panel width in world units; height follows the artwork aspect. */
  width: number
  /** Tilt and roll applied after the panel is turned to face outward. */
  tilt: number
  roll: number
  /** Phase offset so no two panels drift in sync. */
  phase: number
}

/**
 * Which side of frame the hero card rests on, and how it is framed there.
 *
 * The card is *not* placed on the ring at rest. It is anchored in camera space,
 * because the one thing that must never happen is the card crossing the figure,
 * and a fixed world position cannot promise that: the frustum's width in world
 * units changes with the window's aspect ratio, so a card that clears the
 * character on a 16:9 desktop reaches straight across it on a square window.
 *
 * So the resting position and the card's width are both solved each frame from
 * the live camera, in units of half the frame width. The figure's own half
 * width in those units is `CHAR_HALF_H / aspect` — see globals.css for where
 * that constant comes from — and the card simply starts beyond it.
 */

/**
 * The figure's half width as a fraction of half the frame *height*.
 *
 * 10.2 world units wide over 80 · tan(21.5°) = 31.5 gives 0.324 at the camera's
 * rest distance — but CameraRig dollies in to 73 during each dwell, where the
 * same figure measures 0.355. The larger of the two is the one that has to be
 * cleared, so this is set for the closest the camera ever gets.
 */
const CHAR_HALF_H = 0.36
/** Gap between the figure's edge and the card's, in half-frame widths. */
const CLEARANCE = 0.1
/** The most of the half frame the card is allowed to take. */
const MAX_SPAN = 0.62
/** How far in front of the camera the card sits. */
const HERO_DEPTH = 46
/** Height of the card's centre, in half-frame heights. */
const HERO_Y = 0.1
/** Card geometry is authored at this width and scaled to the solved size. */
const HERO_BASE_WIDTH = 30
/** Angle the card turns toward the character, so it addresses the figure. */
const HERO_YAW = 0.17

/** Where the card sits on the ring while it is swinging in and out. */
const HERO_RING_AZ = 0.42
const HERO_RING_RADIUS = 50
const HERO_RING_Y = 5

const HERO: Omit<Slot, 'az'> = {
  y: HERO_RING_Y,
  radius: HERO_RING_RADIUS,
  width: HERO_BASE_WIDTH,
  tilt: 0.03,
  roll: -0.02,
  phase: 0,
}

/**
 * How far around the ring a hero travels on its way in and out. A little over a
 * quarter turn: enough to read as an orbit, short enough that it is arriving
 * rather than flying past.
 */
const HERO_SWING = 1.05

/**
 * Three satellites, deliberately at three different depths and three different
 * heights. They are free to orbit behind the character — the figure is opaque
 * and writes depth, so anything passing behind it is simply hidden — and the
 * radii are large enough that the arc which would carry them *in front* of the
 * figure is already far outside the frame.
 */
const SATELLITES: Slot[] = [
  { az: 1.15, y: 17, radius: 118, width: 32, tilt: -0.12, roll: 0.05, phase: 1.1 },
  { az: -1.55, y: -5, radius: 150, width: 26, tilt: 0.14, roll: -0.06, phase: 2.7 },
  { az: 2.6, y: 13, radius: 190, width: 44, tilt: -0.16, roll: 0.08, phase: 4.4 },
]

/** How fast the satellite ring turns: idle drift, plus a push from scroll. */
const IDLE_ORBIT = 0.035
const SCROLL_ORBIT = 1.9

/** Artwork aspect: the deck is authored 16:9 (1672 x 941). */
const ASPECT = 9 / 16

const _target = new Vector3()
const _ring = new Vector3()
const _anchor = new Vector3()
const _tint = new Color()
const _white = new Color('#ffffff')
const _ringQuat = new Quaternion()
const _anchorQuat = new Quaternion()
const _yawQuat = new Quaternion()
const _tiltQuat = new Quaternion()
const _euler = new Euler()
const _up = new Vector3(0, 1, 0)

function Panel({
  slot,
  image,
  section,
  hero,
  reduced,
}: {
  slot: Slot
  image: string
  section: number
  hero: boolean
  reduced: boolean
}) {
  const group = useRef<Group>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const edge = useRef<MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)

  const config = SECTIONS[section]
  const texture = useCardTexture(image, config.sky, config.word)

  const height = slot.width * ASPECT

  useFrame((state, delta) => {
    const node = group.current
    if (!node) return
    const dt = Math.min(delta, 0.1)

    // Distance from this beat, measured in sections.
    const distance = scroll.sectionFloat - section
    const presence = hero
      ? smoothstep(-0.8, -0.15, distance) * (1 - smoothstep(0.7, 1.0, distance))
      : smoothstep(-1.1, -0.35, distance) * (1 - smoothstep(0.65, 1.3, distance))

    if (presence <= 0.001) {
      node.visible = false
      return
    }
    node.visible = true

    const t = reduced ? 0 : state.clock.elapsedTime
    const camera = state.camera as PerspectiveCamera

    // ── where it sits on the ring ──────────────────────────────────────────
    const ringAz = hero
      ? // Swings in from further around the ring on its own side, so it arcs
        // around the character rather than sliding in from offscreen.
        slot.az + Math.sign(slot.az) * HERO_SWING * (1 - presence)
      : slot.az + t * IDLE_ORBIT + scroll.homeProgress * SCROLL_ORBIT

    const bob = reduced ? 0 : Math.sin(t * 0.28 + slot.phase) * (hero ? 0.6 : 1.5)

    // Panels start further out and settle inward as their beat lands. Depth is
    // the cheapest way to sell an arrival: it reuses the fog already there.
    const ringRadius = slot.radius + (1 - presence) * (hero ? 22 : 40)

    // Near panels parallax more than far ones, which is what perspective does.
    const depth = 50 / slot.radius
    const par = reduced ? 0 : 1
    const pushX = scroll.pointerX * 4.5 * depth * par
    const pushY = -scroll.pointerY * 3 * depth * par

    _ring.set(
      Math.sin(ringAz) * ringRadius + pushX,
      slot.y + bob + pushY,
      Math.cos(ringAz) * ringRadius,
    )
    // On the ring a panel faces outward, toward the camera orbiting beyond it.
    // Facing inward instead shows the camera the back of the plane, and a
    // double-sided plane seen from behind draws its texture mirrored.
    _ringQuat.setFromAxisAngle(_up, ringAz)

    let scale = 1

    if (hero) {
      // ── solved rest position, in camera space ──────────────────────────
      const halfH = HERO_DEPTH * Math.tan(MathUtils.degToRad(camera.fov) / 2)
      const halfW = halfH * camera.aspect

      // The figure's half width in the same units. It is a constant fraction
      // of half the frame *height*, so dividing by the aspect converts it.
      const charEdge = CHAR_HALF_H / camera.aspect

      // Start beyond the figure, then take whatever is left up to the frame
      // edge. Solving the span this way is what guarantees the card can never
      // reach the character however the window is shaped — on a narrow window
      // the card gets smaller rather than creeping inward.
      const inner = charEdge + CLEARANCE
      const span = Math.min(MAX_SPAN, Math.max(0, 0.98 - inner))
      const side = Math.sign(slot.az)

      _anchor.set(
        side * (inner + span / 2) * halfW,
        HERO_Y * halfH + bob * 0.35 + pushY * 0.4,
        -HERO_DEPTH,
      )
      camera.localToWorld(_anchor)

      // Square on to the lens, then turned back toward the character so it
      // addresses the figure instead of the viewer.
      _yawQuat.setFromAxisAngle(_up, -side * HERO_YAW)
      _anchorQuat.copy(camera.quaternion).multiply(_yawQuat)

      // Blend ring → anchor as the beat arrives. At presence 1 the card is
      // fully solved and provably clear of the figure.
      const settle = presence * presence * (3 - 2 * presence)
      _target.copy(_ring).lerp(_anchor, settle)
      _ringQuat.slerp(_anchorQuat, settle)

      scale = MathUtils.lerp(1, (span * halfW) / HERO_BASE_WIDTH, settle)
    } else {
      _target.copy(_ring)
    }

    node.position.lerp(_target, 1 - Math.exp(-3.4 * dt))

    // Tilt and roll are folded into the target orientation *before* the slerp,
    // never applied afterwards. rotateX/rotateZ are relative — they compose
    // onto whatever the object already holds — and a partial slerp only pulls
    // a fraction of the way back each frame, so applying them after it let the
    // offset accumulate frame over frame until the panel sat at a large
    // permanent tilt that no constant in this file accounted for.
    _tiltQuat.setFromEuler(
      _euler.set(
        slot.tilt + (reduced ? 0 : Math.sin(t * 0.21 + slot.phase) * 0.01),
        0,
        slot.roll + (reduced ? 0 : Math.cos(t * 0.17 + slot.phase) * 0.008),
      ),
    )
    _ringQuat.multiply(_tiltQuat)
    node.quaternion.slerp(_ringQuat, 1 - Math.exp(-5 * dt))

    node.scale.setScalar(damp(node.scale.x, scale * (hovered ? 1.04 : 1), 8, dt))

    // ── material ───────────────────────────────────────────────────────────
    if (material.current) {
      material.current.opacity = presence * (hero ? 1 : 0.42)
      // Satellites are pulled toward the beat's fog colour so they sit in the
      // room's light rather than punching through it as full-colour photos.
      if (hero) {
        _tint.setScalar(hovered ? 1 : 0.95)
      } else {
        _tint.set(config.fog).lerp(_white, 0.4)
      }
      material.current.color.lerp(_tint, 1 - Math.exp(-6 * dt))
    }

    if (edge.current) {
      edge.current.opacity = damp(
        edge.current.opacity,
        hero ? presence * (hovered ? 0.85 : 0.2) : 0,
        8,
        dt,
      )
    }
  })

  const onOver = (event: ThreeEvent<PointerEvent>) => {
    if (!hero) return
    event.stopPropagation()
    setHovered(true)
    setCursor({ label: 'view', active: true })
  }

  const onOut = () => {
    if (!hero) return
    setHovered(false)
    resetCursor()
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (!hero) return
    event.stopPropagation()
    scroll.expandedCard = section
  }

  return (
    <group ref={group} visible={false}>
      {/* Accent frame, drawn just behind the artwork. */}
      <mesh position={[0, 0, -0.02]} scale={hero ? 1.012 : 1}>
        <planeGeometry args={[slot.width, height]} />
        <meshBasicMaterial
          ref={edge}
          color={config.accent}
          transparent
          opacity={0}
          depthWrite={false}
          side={DoubleSide}
          fog={false}
        />
      </mesh>

      <mesh onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <planeGeometry args={[slot.width, height]} />
        <meshBasicMaterial
          ref={material}
          map={texture}
          transparent
          toneMapped={false}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export function PanelField({ reduced = false }: { reduced?: boolean }) {
  const panels = useMemo(() => {
    const out: {
      key: string
      slot: Slot
      image: string
      section: number
      hero: boolean
    }[] = []

    for (let section = 0; section < SECTION_COUNT; section++) {
      const own = SECTIONS[section].images[0]
      // Alternate sides. StoryOverlay reads the same parity and puts its copy
      // on the opposite side, so card and text never share a half of the frame.
      const left = section % 2 === 0

      out.push({
        key: `hero-${section}`,
        section,
        hero: true,
        image: own,
        slot: { ...HERO, az: left ? -HERO_RING_AZ : HERO_RING_AZ },
      })

      SATELLITES.forEach((slot, i) => {
        out.push({
          key: `sat-${section}-${i}`,
          section,
          hero: false,
          // Walk the deck for variety, but keep one of the beat's own image so
          // the field still reads as being about that beat.
          image: i === 0 ? own : ALL_PANEL_IMAGES[(section + i) % ALL_PANEL_IMAGES.length],
          // Offset each beat's ring so consecutive beats never reuse a spot.
          slot: { ...slot, az: slot.az + section * 0.9 },
        })
      })
    }

    return out
  }, [])

  return (
    <>
      {panels.map((p) => (
        <Panel
          key={p.key}
          slot={p.slot}
          image={p.image}
          section={p.section}
          hero={p.hero}
          reduced={reduced}
        />
      ))}
    </>
  )
}
