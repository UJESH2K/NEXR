'use client'

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  Object3D,
  Points,
  Quaternion,
  Raycaster,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
} from 'three'
import { getConfigVersion, particleConfig, subscribeConfig } from '@/lib/particles/config'
import { interaction } from '@/lib/particles/interaction'
import { sampleSurface } from '@/lib/particles/sampleSurface'
import { createSimulation, type Simulation } from '@/lib/particles/simulation'
import { RENDER_FRAGMENT, RENDER_VERTEX } from '@/lib/particles/shaders'
import { scroll } from '@/lib/scrollStore'

const TAU = Math.PI * 2

/** Pointer speed, in screen widths per second, that counts as full energy at
 *  sensitivity 1. Roughly a brisk flick across a laptop trackpad. */
const FULL_SPEED = 2.4

/** Damping rates. Interaction rises quickly and falls slowly on purpose: the
 *  effect should feel eager to respond and reluctant to let go. */
const ENERGY_RISE = 11
const ENERGY_FALL = 3.2
const HOVER_RISE = 13
const HOVER_FALL = 4.5
const TILT_SMOOTHING = 6
const SPIN_SMOOTHING = 4

/** How fast the arrival kick fades, per second. At 2.6 there is ~7% of it left
 *  after one second, which is long enough for the scatter to read and short
 *  enough that the spring has visibly reclaimed the cloud while the cursor is
 *  still sitting on it. */
const BURST_DECAY = 2.6

/** Vertical pointer motion counts for less than horizontal — the gesture this
 *  effect is designed around is a fast left-right sweep. */
const VERTICAL_WEIGHT = 0.35

type PointerState = {
  /** Normalised device coordinates, -1..1. */
  ndc: Vector2
  /** Previous NDC, for the velocity estimate. */
  previous: Vector2
  /** Screen widths per second, weighted. */
  speed: number
  /** Screen-space travel direction this frame. */
  delta: Vector2
  inside: boolean
  /** Set by a listener, consumed by the next frame's raycast. */
  moved: boolean
}

/** Reused across frames so the render loop allocates nothing. */
const scratch = {
  hit: new Vector3(),
  local: new Vector3(),
  normal: new Vector3(),
  drag: new Vector3(),
  right: new Vector3(),
  up: new Vector3(),
  forward: new Vector3(),
  quaternion: new Quaternion(),
  glow: new Color(),
  speed: new Color(),
}

export function CharacterParticles({
  source,
  reduced = false,
}: {
  /** Normalised model root. Sampled in this object's local space, and mounted
   *  in the same transform chain, so hit points and rest positions agree. */
  source: Object3D
  reduced?: boolean
}) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  // Structural config changes (count, quality) have to reach React, because
  // they mean rebuilding the cloud. Everything else is read straight out of the
  // config object inside useFrame.
  const version = useSyncExternalStore(subscribeConfig, getConfigVersion, () => 0)

  const tilt = useRef<Group>(null)
  const spin = useRef<Group>(null)
  const points = useRef<Points>(null)

  const pointer = useRef<PointerState>({
    ndc: new Vector2(),
    previous: new Vector2(),
    delta: new Vector2(),
    speed: 0,
    inside: false,
    moved: false,
  })

  const raycaster = useMemo(() => new Raycaster(), [])
  const spinOffset = useRef(0)
  const spinCurrent = useRef(0)
  /** Drives the idle crawl. Its own accumulator rather than useFrame's clock, so
   *  freezing the simulation freezes the crawl with it. */
  const elapsed = useRef(0)
  /** Live value of the arrival kick, decayed here rather than in the shader. */
  const burst = useRef(0)
  /** Last frame's hover, for the rising edge that fires the kick. */
  const hoverWas = useRef(false)

  // ── the point cloud ────────────────────────────────────────────────────────
  const sampled = useMemo(
    () =>
      sampleSurface(source, particleConfig.particleCount, {
        sizeVariance: particleConfig.sizeVariance,
      }),
    // particleCount is read through the store, so the version bump is the
    // dependency that matters here.
    [source, version],
  )

  const simulation = useMemo<Simulation | null>(
    () => (sampled.count ? createSimulation(gl, sampled) : null),
    [gl, sampled],
  )

  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    if (!simulation) return g

    // position is required by three's draw path even though the vertex shader
    // ignores it; rest positions double as the value that keeps the bounding
    // sphere and depth sort honest.
    g.setAttribute('position', new BufferAttribute(sampled.rest, 3))
    g.setAttribute('aRest', new BufferAttribute(sampled.rest, 3))
    g.setAttribute('aNormal', new BufferAttribute(sampled.normal, 3))
    g.setAttribute('aColor', new BufferAttribute(sampled.color, 3))
    g.setAttribute('aProps', new BufferAttribute(sampled.props, 3))
    g.setAttribute('aSimUv', new BufferAttribute(simulation.simUv, 2))
    // The crawl's phase and frequency come from here. It has to be a real
    // attribute rather than the seed already in tVelocity.w: on a half-float
    // fallback that channel resolves to ~2k distinct values, and 120k particles
    // sharing 2k phases synchronise into a visible pulse.
    g.setAttribute('aSeed', new BufferAttribute(sampled.seed, 1))

    // Set by hand and inflated by the scatter radius: the real positions live in
    // a texture, so three cannot compute this itself, and a too-tight sphere
    // culls the cloud the moment it is disturbed near the frame edge.
    const centre = sampled.bounds.getCenter(new Vector3())
    const radius = sampled.bounds.getSize(new Vector3()).length() * 0.5
    g.boundingSphere = new Sphere(centre, radius + particleConfig.scatterRadius * 2)

    return g
  }, [sampled, simulation])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: RENDER_VERTEX,
        fragmentShader: RENDER_FRAGMENT,
        uniforms: {
          tOffset: { value: simulation?.offsetTexture() ?? null },
          tVelocity: { value: simulation?.velocityTexture() ?? null },
          uSize: { value: particleConfig.particleSize },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uScatter: { value: particleConfig.scatterRadius },
          uGlow: { value: particleConfig.glowIntensity },
          uGlowSaturation: { value: particleConfig.glowSaturation },
          uGlowColor: { value: new Color(particleConfig.glowColor) },
          uAlbedo: { value: particleConfig.albedoStrength },
          uSpeedColor: { value: new Color(particleConfig.speedColor) },
          uSpeedTint: { value: particleConfig.speedTint },
          uSpeedReference: { value: particleConfig.speedReference },
          uTime: { value: 0 },
          uIdleMotion: { value: particleConfig.idleMotion },
          uIdleSpeed: { value: particleConfig.idleSpeed },
          // The draw pass needs the contact point too, to light the body from
          // inside. Its own uniform rather than a read-back from the simulation:
          // the value is already on the CPU this frame.
          uPointer: { value: new Vector3() },
          uPointerActive: { value: 0 },
          uInnerGlow: { value: particleConfig.innerGlow },
          uInnerGlowRadius: { value: particleConfig.innerGlowRadius },
        },
        transparent: true,
        // Depth writing is what lets the idle character occlude itself and read
        // as a solid body rather than a translucent shell. Additive blending
        // would look brighter but would also make the body see-through, which
        // costs more than the glow gains.
        depthWrite: true,
        depthTest: true,
      }),
    [gl, simulation],
  )

  // No simulation means this device could not give us a float render target.
  // Showing the plain mesh is a far better outcome than an empty frame.
  useEffect(() => {
    if (simulation) return
    source.visible = true
    console.warn('[NEXR] Falling back to the solid character mesh — no GPU simulation available.')
  }, [simulation, source])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      simulation?.dispose()
    },
    [geometry, material, simulation],
  )

  // Keep point size honest across DPR changes (moving between monitors).
  useEffect(() => {
    material.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2)
  }, [gl, material, size])

  // ── pointer plumbing ───────────────────────────────────────────────────────
  // Listeners do nothing but record where the pointer is. All the work — the
  // raycast, the velocity estimate — happens once per frame, so a high-rate
  // mouse cannot force more raycasts than there are frames.
  useEffect(() => {
    if (reduced) return
    const element = gl.domElement
    const state = pointer.current

    const record = (event: PointerEvent | Touch, inside: boolean) => {
      const rect = element.getBoundingClientRect()
      state.ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      )
      state.inside = inside
      state.moved = true
    }

    const onPointerMove = (event: PointerEvent) => record(event, true)
    const onPointerLeave = () => {
      state.inside = false
      state.speed = 0
    }
    // Touch has no hover, so contact is the interaction. Not preventDefault:
    // the page still has to scroll.
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) record(touch, true)
    }
    const onTouchEnd = () => {
      state.inside = false
      state.speed = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [gl, reduced])

  /** Meshes to raycast against — the source geometry, hidden but hit-testable. */
  const colliders = useMemo(() => {
    const meshes: Mesh[] = []
    source.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) meshes.push(mesh)
    })
    return meshes
  }, [source])

  useFrame((_, rawDelta) => {
    const config = particleConfig
    const delta = Math.min(rawDelta, 0.1)
    const state = pointer.current
    const group = points.current

    if (!group || !simulation) return

    // ── where is the pointer, and how fast is it moving? ─────────────────────
    if (state.moved) {
      state.delta.subVectors(state.ndc, state.previous)
      state.previous.copy(state.ndc)
      state.moved = false
      const travel = Math.hypot(state.delta.x, state.delta.y * VERTICAL_WEIGHT)
      // NDC spans 2 units across the viewport, hence the halving: this is in
      // screen widths per second.
      state.speed = (travel * 0.5) / Math.max(delta, 1e-3)
    } else {
      // No movement event this frame means the pointer is stationary. Decaying
      // rather than zeroing keeps a pause between flicks from reading as a stop.
      state.speed *= 0.82
      state.delta.multiplyScalar(0.82)
    }

    // ── is it on the character? ─────────────────────────────────────────────
    let hovering = false
    if (state.inside && !reduced && !config.freeze) {
      raycaster.setFromCamera(state.ndc, camera)
      const hits = raycaster.intersectObjects(colliders, false)
      if (hits.length) {
        hovering = true
        interaction.touched = true
        scratch.hit.copy(hits[0].point)
        group.worldToLocal(scratch.local.copy(scratch.hit))
        interaction.point.copy(scratch.local)

        if (hits[0].normal) {
          interaction.normal.copy(hits[0].normal)
        }

        // Pointer travel expressed in the character's own space, so a swipe
        // throws particles the way the pointer went regardless of how far the
        // scroll has rotated the body.
        camera.matrixWorld.extractBasis(scratch.right, scratch.up, scratch.forward)
        scratch.drag
          .set(0, 0, 0)
          .addScaledVector(scratch.right, state.delta.x)
          .addScaledVector(scratch.up, state.delta.y)
        group.getWorldQuaternion(scratch.quaternion).invert()
        scratch.drag.applyQuaternion(scratch.quaternion)
        if (scratch.drag.lengthSq() > 1e-10) {
          interaction.drag.copy(scratch.drag).normalize()
        }
      }
    }

    interaction.hover = hovering

    // ── the arrival kick ────────────────────────────────────────────────────
    // Fired on the rising edge of hover and then left to decay, which is what
    // makes simply *arriving* enough: the cloud breaks open and the spring pulls
    // it back together without the pointer moving at all.
    //
    // The `active` guard is the important part. A raycast against a silhouette
    // edge can miss for a single frame, and without it every such flicker would
    // re-fire the kick and the character would never settle. `active` falls at
    // HOVER_FALL, so one dropped frame leaves it near 1 and only a genuine
    // departure gets it below the threshold.
    if (hovering && !hoverWas.current && interaction.active < 0.35 && !reduced) {
      burst.current = 1
    }
    hoverWas.current = hovering
    burst.current *= Math.exp(-BURST_DECAY * delta)
    if (burst.current < 1e-3) burst.current = 0
    interaction.burst = burst.current

    const energyTarget = Math.min(1, state.speed / (FULL_SPEED / Math.max(config.mouseSensitivity, 0.01)))
    interaction.energy = MathUtils.damp(
      interaction.energy,
      hovering ? energyTarget : 0,
      energyTarget > interaction.energy ? ENERGY_RISE : ENERGY_FALL,
      delta,
    )
    interaction.active = MathUtils.damp(
      interaction.active,
      hovering ? 1 : 0,
      hovering ? HOVER_RISE : HOVER_FALL,
      delta,
    )

    // Proxy for how disturbed the cloud is. Reading it back off the GPU would
    // cost a pipeline stall every frame for a number only the audio layer
    // consumes, and this tracks it closely enough to be indistinguishable.
    interaction.distortion = interaction.active * (0.32 + 0.68 * interaction.energy)

    interaction.roll = reduced
      ? 0
      : -state.ndc.x * config.rollStrength * interaction.active * (0.35 + 0.65 * interaction.energy)

    // ── advance the simulation ──────────────────────────────────────────────
    if (!config.freeze) {
      material.uniforms.tOffset.value = simulation.compute(delta, {
        pointer: interaction.point,
        pointerDir: interaction.drag,
        pointerActive: interaction.active,
        energy: interaction.energy,
        burst: interaction.burst * config.arrivalBurst,
        radius: config.interactionRadius,
        strength: config.displacementStrength,
        turbulence: config.turbulence,
        turbulenceScale: config.turbulenceScale,
        stiffness: config.returnSpeed * config.returnSpeed,
        damping: config.damping,
        scatter: config.scatterRadius,
      })
      // Both targets ping-pong, so the velocity binding has to be refreshed
      // alongside the offset one — bound once at construction it would go stale
      // on the very next frame and the speed tint would flicker at 30Hz.
      material.uniforms.tVelocity.value = simulation.velocityTexture()
    }

    // The source mesh is normally invisible and exists only to be raycast
    // against — three hit-tests invisible objects, which is what makes that
    // work. It becomes visible on request from the debug panel.
    source.visible = config.showSourceMesh

    // ── appearance ──────────────────────────────────────────────────────────
    material.uniforms.uSize.value = config.particleSize
    material.uniforms.uScatter.value = config.scatterRadius
    material.uniforms.uGlow.value = config.glowIntensity
    material.uniforms.uGlowSaturation.value = config.glowSaturation
    material.uniforms.uAlbedo.value = config.albedoStrength
    material.uniforms.uSpeedTint.value = config.speedTint
    material.uniforms.uSpeedReference.value = config.speedReference
    const glow = material.uniforms.uGlowColor.value as Color
    if (glow.getHexString() !== scratch.glow.set(config.glowColor).getHexString()) {
      glow.copy(scratch.glow)
    }
    const speed = material.uniforms.uSpeedColor.value as Color
    if (speed.getHexString() !== scratch.speed.set(config.speedColor).getHexString()) {
      speed.copy(scratch.speed)
    }

    // ── the crawl, and the light from inside ────────────────────────────────
    // elapsed is advanced here rather than read from useFrame's clock for two
    // reasons: freezing the simulation freezes the crawl with it, and a tab
    // returning from the background does not jump the phase by the whole paused
    // interval, which would show up as the whole cloud teleporting once.
    if (!config.freeze) elapsed.current += delta
    material.uniforms.uTime.value = elapsed.current
    // Reduced motion means exactly that. The silhouette is still built from the
    // same points; they simply stop crawling.
    material.uniforms.uIdleMotion.value = reduced ? 0 : config.idleMotion
    material.uniforms.uIdleSpeed.value = config.idleSpeed

    // The interior light tracks the contact point in the character's own space —
    // the space aRest lives in — so it stays registered with the body however far
    // the scroll has turned it. `active`, not `hover`, so the glow fades up and
    // down with the same easing as everything else the pointer drives.
    ;(material.uniforms.uPointer.value as Vector3).copy(interaction.point)
    material.uniforms.uPointerActive.value = reduced ? 0 : interaction.active
    material.uniforms.uInnerGlow.value = config.innerGlow
    material.uniforms.uInnerGlowRadius.value = config.innerGlowRadius

    // ── tilt, only while the character itself is being touched ──────────────
    if (tilt.current) {
      const reach = reduced ? 0 : config.tiltStrength * interaction.active
      const gain = 0.45 + 0.55 * interaction.energy
      tilt.current.rotation.x = MathUtils.damp(
        tilt.current.rotation.x,
        -state.ndc.y * reach * gain,
        TILT_SMOOTHING,
        delta,
      )
      tilt.current.rotation.z = MathUtils.damp(
        tilt.current.rotation.z,
        state.ndc.x * reach * gain,
        TILT_SMOOTHING,
        delta,
      )
    }

    // ── scroll-driven revolution ────────────────────────────────────────────
    if (spin.current) {
      if (!reduced) spinOffset.current += delta * config.idleSpin
      const target = scroll.homeProgress * TAU * config.scrollTurns + spinOffset.current
      // Damped rather than assigned: Lenis hands us a smooth progress value,
      // but a jump (route change, anchor link) would otherwise snap the body.
      spinCurrent.current = MathUtils.damp(spinCurrent.current, target, SPIN_SMOOTHING, delta)
      spin.current.rotation.y = spinCurrent.current
    }
  })

  return (
    <group ref={tilt}>
      <group ref={spin}>
        {/* The source mesh stays in the tree as the raycast target. It is only
            drawn when the debug panel asks for it, to check registration
            between the mesh and the cloud. */}
        <primitive object={source} />
        {simulation ? (
          <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
        ) : null}
      </group>
    </group>
  )
}
