/**
 * The GPU side of the particle simulation.
 *
 * Two ping-ponged render targets hold per-particle offset and velocity, so the
 * whole simulation — 120k springs, impulses and noise lookups — runs in two
 * fragment passes with no per-particle work on the main thread at all. The draw
 * pass then reads the offset target in its vertex shader.
 *
 * Rest positions, normals and seeds are uploaded once as static data textures.
 * They never change between resamples, so they cost nothing per frame.
 */
import {
  DataTexture,
  FloatType,
  HalfFloatType,
  NearestFilter,
  RGBAFormat,
  Texture,
  Vector3,
  type WebGLRenderer,
} from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import type { SampledSurface } from './sampleSurface'
import { OFFSET_SHADER, VELOCITY_SHADER } from './shaders'

export type SimulationInput = {
  /** Contact point in the character's local space. */
  pointer: Vector3
  /** Unit pointer travel direction, same space. */
  pointerDir: Vector3
  /** Damped 0..1 hover. */
  pointerActive: number
  /** Damped 0..1 pointer speed. */
  energy: number
  /** Decaying 0..1 arrival kick. Independent of `energy` on purpose — see the
   *  arrival-burst note in VELOCITY_SHADER. */
  burst: number
  radius: number
  strength: number
  turbulence: number
  turbulenceScale: number
  stiffness: number
  damping: number
  scatter: number
}

export type Simulation = {
  /** Square edge of the simulation textures. */
  size: number
  /** Particles actually drawn — may be fewer than size², see `simUv`. */
  count: number
  /** Which texel each particle reads, as a vertex attribute. */
  simUv: Float32Array
  /** Advance the simulation by `dt` seconds and return the offset texture. */
  compute(dt: number, input: SimulationInput): Texture
  /** Latest offset texture, for the frame the draw pass is about to render. */
  offsetTexture(): Texture
  /** Latest velocity texture — .xyz is world units per second, .w is the seed.
   *  The draw pass reads it to colour particles by how fast they are moving.
   *  Ping-ponging means the target swaps on every compute(), so this has to be
   *  re-read each frame rather than bound once. */
  velocityTexture(): Texture
  /** Put every particle back on its rest position, at rest. */
  reset(): void
  dispose(): void
}

/** Longest step the integrator is allowed to take. A tab returning from the
 *  background hands us a multi-second delta, and a spring integrated over that
 *  in one step explodes. */
const MAX_STEP = 1 / 30

function dataTexture(size: number, fill: (i: number, out: Float32Array) => void) {
  const data = new Float32Array(size * size * 4)
  const element = new Float32Array(4)
  for (let i = 0; i < size * size; i++) {
    element[0] = element[1] = element[2] = element[3] = 0
    fill(i, element)
    data.set(element, i * 4)
  }
  const texture = new DataTexture(data, size, size, RGBAFormat, FloatType)
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter
  texture.needsUpdate = true
  return texture
}

/**
 * Build the simulation for a sampled cloud, or return null if this device
 * cannot render to a float target at all — the caller falls back to drawing the
 * source mesh, which is a worse experience but a working one.
 */
export function createSimulation(
  renderer: WebGLRenderer,
  sampled: SampledSurface,
): Simulation | null {
  const size = Math.ceil(Math.sqrt(sampled.count))

  const gl = renderer.getContext()
  const canRenderFloat = Boolean(
    gl.getExtension('EXT_color_buffer_float') || gl.getExtension('WEBGL_color_buffer_float'),
  )
  const canFilterHalfFloat = Boolean(gl.getExtension('EXT_color_buffer_half_float'))

  if (!canRenderFloat && !canFilterHalfFloat && !('drawBuffers' in gl)) return null

  const gpu = new GPUComputationRenderer(size, size, renderer)
  // Offsets sit near zero, which is exactly where half floats keep their
  // precision, so the fallback costs nothing visible.
  gpu.setDataType(canRenderFloat ? FloatType : HalfFloatType)

  // Rest position with the particle's seed tucked into .w — one fetch in the
  // velocity shader instead of two.
  const rest = dataTexture(size, (i, out) => {
    if (i >= sampled.count) return
    out[0] = sampled.rest[i * 3]
    out[1] = sampled.rest[i * 3 + 1]
    out[2] = sampled.rest[i * 3 + 2]
    out[3] = sampled.seed[i]
  })

  const normal = dataTexture(size, (i, out) => {
    if (i >= sampled.count) return
    out[0] = sampled.normal[i * 3]
    out[1] = sampled.normal[i * 3 + 1]
    out[2] = sampled.normal[i * 3 + 2]
  })

  const offsetSeed = gpu.createTexture()
  const velocitySeed = gpu.createTexture()
  // Both start at zero: the character opens fully formed and perfectly still.
  ;(offsetSeed.image.data as Float32Array).fill(0)
  ;(velocitySeed.image.data as Float32Array).fill(0)

  const offsetVariable = gpu.addVariable('textureOffset', OFFSET_SHADER, offsetSeed)
  const velocityVariable = gpu.addVariable('textureVelocity', VELOCITY_SHADER, velocitySeed)

  gpu.setVariableDependencies(offsetVariable, [offsetVariable, velocityVariable])
  gpu.setVariableDependencies(velocityVariable, [offsetVariable, velocityVariable])

  Object.assign(offsetVariable.material.uniforms, {
    uDt: { value: 0 },
  })

  Object.assign(velocityVariable.material.uniforms, {
    tRest: { value: rest },
    tNormal: { value: normal },
    uDt: { value: 0 },
    uTime: { value: 0 },
    uPointer: { value: new Vector3() },
    uPointerDir: { value: new Vector3() },
    uPointerActive: { value: 0 },
    uRadius: { value: 0.4 },
    uStrength: { value: 2 },
    uEnergy: { value: 0 },
    uBurst: { value: 0 },
    uTurbulence: { value: 0.5 },
    uTurbulenceScale: { value: 3 },
    uStiffness: { value: 5 },
    uDamping: { value: 2.5 },
    uScatter: { value: 0.3 },
  })

  const error = gpu.init()
  if (error) {
    console.warn('[NEXR] Particle simulation unavailable:', error)
    gpu.dispose()
    rest.dispose()
    normal.dispose()
    return null
  }

  // Texel centres. Off-centre sampling with NearestFilter lands on a neighbour
  // at some texture sizes, which shows up as a handful of particles inheriting
  // the wrong offset.
  const simUv = new Float32Array(sampled.count * 2)
  for (let i = 0; i < sampled.count; i++) {
    simUv[i * 2] = ((i % size) + 0.5) / size
    simUv[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size
  }

  const velocityUniforms = velocityVariable.material.uniforms
  const offsetUniforms = offsetVariable.material.uniforms
  let time = 0

  return {
    size,
    count: sampled.count,
    simUv,

    compute(dt, input) {
      const step = Math.min(Math.max(dt, 0), MAX_STEP)
      time += step

      velocityUniforms.uDt.value = step
      offsetUniforms.uDt.value = step
      velocityUniforms.uTime.value = time
      ;(velocityUniforms.uPointer.value as Vector3).copy(input.pointer)
      ;(velocityUniforms.uPointerDir.value as Vector3).copy(input.pointerDir)
      velocityUniforms.uPointerActive.value = input.pointerActive
      velocityUniforms.uEnergy.value = input.energy
      velocityUniforms.uBurst.value = input.burst
      velocityUniforms.uRadius.value = input.radius
      velocityUniforms.uStrength.value = input.strength
      velocityUniforms.uTurbulence.value = input.turbulence
      velocityUniforms.uTurbulenceScale.value = input.turbulenceScale
      velocityUniforms.uStiffness.value = input.stiffness
      velocityUniforms.uDamping.value = input.damping
      velocityUniforms.uScatter.value = input.scatter

      gpu.compute()
      return gpu.getCurrentRenderTarget(offsetVariable).texture
    },

    offsetTexture() {
      return gpu.getCurrentRenderTarget(offsetVariable).texture
    },

    velocityTexture() {
      return gpu.getCurrentRenderTarget(velocityVariable).texture
    },

    reset() {
      const zeroOffset = gpu.createTexture()
      const zeroVelocity = gpu.createTexture()
      ;(zeroOffset.image.data as Float32Array).fill(0)
      ;(zeroVelocity.image.data as Float32Array).fill(0)
      gpu.renderTexture(zeroOffset, gpu.getCurrentRenderTarget(offsetVariable))
      gpu.renderTexture(zeroVelocity, gpu.getCurrentRenderTarget(velocityVariable))
      zeroOffset.dispose()
      zeroVelocity.dispose()
    },

    dispose() {
      gpu.dispose()
      rest.dispose()
      normal.dispose()
      offsetSeed.dispose()
      velocitySeed.dispose()
    },
  }
}
