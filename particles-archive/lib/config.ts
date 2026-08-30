/**
 * Every tunable of the particle character, in one mutable object.
 *
 * Same reasoning as scrollStore: the simulation reads these values inside
 * useFrame, so they cannot live in React state without re-rendering the tree
 * sixty times a second. React only hears about the two kinds of change that
 * matter to it — a structural change that forces a resample, and the panel's
 * own open/closed state — through the subscribe/version pair at the bottom.
 */

export type QualityTier = 'low' | 'medium' | 'high'

export type ParticleConfig = {
  /** Preset the count and sim resolution came from. */
  quality: QualityTier
  /** Requested particle count. The simulation rounds up to a square texture. */
  particleCount: number

  // ── appearance ───────────────────────────────────────────────────────────
  /** Point size in px at one world unit, before the per-particle jitter. */
  particleSize: number
  /** Per-particle size jitter, as a fraction either side of particleSize. */
  sizeVariance: number
  /** Multiplier on the albedo sampled from the character's own materials. */
  albedoStrength: number
  /** Blue-white emissive added in proportion to how far a particle has strayed. */
  glowIntensity: number
  glowColor: string
  /** How much a displaced particle desaturates towards the glow colour. */
  glowSaturation: number
  /** The hot end of the two-colour ramp. glowColor is the cool end: blue is the
   *  volume of a disturbance, this is its core. Reached by speed and by
   *  proximity to the contact point. */
  speedColor: string
  /** How strongly heat pushes colour and glow. 0 disables the effect. */
  speedTint: number
  /** Particle speed, in world units per second, that counts as full rush. */
  speedReference: number
  /** Weight of contact-point proximity in the heat signal. This is the term that
   *  lights the character from *inside*: the falloff sphere is centred where the
   *  pointer entered the surface, so the particles between it and the silhouette
   *  are the brightest and the light reads as coming from within the volume. */
  innerGlow: number
  /** World-unit radius of that sphere. Deliberately wider than
   *  interactionRadius, so the glow bleeds through particles that have not moved
   *  at all and travels with the cursor rather than only marking the damage. */
  innerGlowRadius: number

  // ── idle life ────────────────────────────────────────────────────────────
  /** Amplitude of the endless per-particle wander, in world units. Small by
   *  definition: nothing in the cloud is ever still, and yet the silhouette must
   *  never visibly change. */
  idleMotion: number
  /** How fast that wander cycles, roughly in Hz. */
  idleSpeed: number

  // ── interaction ──────────────────────────────────────────────────────────
  /** World-space radius of the region the pointer disturbs. */
  interactionRadius: number
  /** Impulse applied to particles inside that radius. */
  displacementStrength: number
  /** Ceiling on how far a particle may drift from rest, in world units. */
  scatterRadius: number
  /** Angular frequency of the spring pulling particles home, in rad/s. The
   *  simulation squares it to get the stiffness, so the settled offset under a
   *  steady push is displacementStrength / returnSpeed². */
  returnSpeed: number
  /** Velocity damping. Higher = less floaty, settles sooner. */
  damping: number
  /** Curl-noise amplitude. Only acts on particles already off their rest. */
  turbulence: number
  /** Spatial frequency of that noise. Higher = finer, busier motion. */
  turbulenceScale: number
  /** Pointer speed (screens/second) that counts as full intensity. */
  mouseSensitivity: number
  /** Impulse delivered the instant the pointer lands, independent of how fast it
   *  is moving. Decayed by the caller, so simply arriving breaks the character
   *  open and it reforms on its own with the cursor still resting on it. */
  arrivalBurst: number

  // ── motion ───────────────────────────────────────────────────────────────
  /** Peak tilt of the character while the pointer is on it, in radians. */
  tiltStrength: number
  /** Camera roll added at full interaction energy, in radians. */
  rollStrength: number
  /** Revolutions the character turns across the whole scroll track. */
  scrollTurns: number
  /** Idle drift when nothing else is driving rotation, rad/s. */
  idleSpin: number

  // ── audio ────────────────────────────────────────────────────────────────
  audioEnabled: boolean
  /** Master ceiling for the ambient layer. Deliberately quiet by default. */
  audioIntensity: number

  // ── debug ────────────────────────────────────────────────────────────────
  /** Draw the source mesh alongside the points, to check registration. */
  showSourceMesh: boolean
  /** Freeze the simulation without freezing the render loop. */
  freeze: boolean
  /** Visualise the interaction sphere. */
  showPointer: boolean
}

/** Count and noise detail per tier; everything else is shared.
 *
 *  particleSize is in pixels at REFERENCE_DISTANCE, so it does not follow the
 *  model's scale automatically. It was scaled with TARGET_HEIGHT all the same:
 *  the same particle count spread over a 1.5× larger silhouette covers 2.25× the
 *  screen area, and at the old sizes the cloud read as sparse rather than solid. */
export const QUALITY_PRESETS: Record<QualityTier, Pick<ParticleConfig, 'particleCount' | 'particleSize'>> = {
  low: { particleCount: 26000, particleSize: 3.9 },
  medium: { particleCount: 60000, particleSize: 3.15 },
  high: { particleCount: 120000, particleSize: 2.55 },
}

export const DEFAULT_CONFIG: ParticleConfig = {
  quality: 'high',
  ...QUALITY_PRESETS.high,

  sizeVariance: 0.45,
  albedoStrength: 1.0,
  glowIntensity: 1.4,
  // The two colours of the whole effect. Cool blue for the body of a
  // disturbance, near-white for its core.
  glowColor: '#8fc9ff',
  glowSaturation: 0.65,
  speedColor: '#eaf6ff',
  speedTint: 0.7,
  speedReference: 3.0,
  innerGlow: 1.5,
  innerGlowRadius: 0.95,

  // A 3.6-unit character at the orbit pose is about 594px tall, so one world
  // unit is ~165px: this wander is ~2.3px of travel, roughly one particle width,
  // and the tangent projection trims it to ~1.6px in practice. Enough that every
  // particle is visibly crawling, far too little to move the outline. The render
  // pass also projects it onto the tangent plane, which is what makes that
  // guarantee hold rather than approximately hold.
  //
  // idleSpeed is the multiplier on the wander's angular frequency, and it is the
  // term that decides whether this reads as life or as a stall. wander()'s own
  // rate lands in 0.55–1.65 rad/s, so the visible frequency is
  // rate × idleSpeed / 2π: at 2.4 that is roughly 0.2–0.6 Hz, a 2–5 second cycle
  // per particle, with the 1.618× second harmonic adding faster detail on top.
  // Well under 1 and each particle takes ten seconds to go anywhere, which looks
  // frozen no matter how large the amplitude is.
  idleMotion: 0.014,
  idleSpeed: 2.4,

  // These four are a set. returnSpeed is the spring's angular frequency, so the
  // offset a constant push settles at is push / returnSpeed² — raise the return
  // without raising the push and the effect quietly stops being visible.
  //
  // Every length and every acceleration here is in world units, and the sampler
  // works in the same space the model is scaled into — so these track
  // TARGET_HEIGHT in CharacterModel.tsx. They were multiplied by 1.5 when it
  // went 2.4 → 3.6, which is what keeps the disturbance the same *fraction of
  // the body* rather than shrinking to a patch on a larger character.
  // turbulenceScale is the exception: it is a spatial frequency, so it divides.
  interactionRadius: 0.57,
  displacementStrength: 6.3,
  scatterRadius: 0.48,
  returnSpeed: 3.4,
  damping: 2.6,
  turbulence: 3.9,
  turbulenceScale: 2.25,
  mouseSensitivity: 1.0,
  arrivalBurst: 1.4,

  // Raised from 0.11 on request — 1.2× the previous lean.
  tiltStrength: 0.132,
  rollStrength: 0.035,
  scrollTurns: 1.0,
  // Zero on purpose: the body turns only when the page is scrolled. The cloud is
  // never still, but the character itself does not drift on its own axis.
  idleSpin: 0,

  audioEnabled: true,
  audioIntensity: 0.35,

  showSourceMesh: false,
  freeze: false,
  showPointer: false,
}

export const particleConfig: ParticleConfig = { ...DEFAULT_CONFIG }

/**
 * Pick a tier from what the device admits to. Deliberately conservative: a
 * wrong guess upward costs frames on the machines least able to spare them.
 */
export function detectQuality(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700

  if (coarse || small || cores <= 4 || memory <= 2) return 'low'
  if (cores <= 8 || memory <= 4) return 'medium'
  return 'high'
}

// ── change notification ─────────────────────────────────────────────────────

/** Keys whose change means the sampled point cloud has to be rebuilt. */
const STRUCTURAL: ReadonlyArray<keyof ParticleConfig> = ['particleCount', 'quality']

const listeners = new Set<() => void>()
let version = 0

export const getConfigVersion = () => version

export function subscribeConfig(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Write one or more values. Non-structural keys are picked up by the next frame
 * with no React involvement at all; structural keys bump the version, which is
 * what makes the component resample.
 */
export function setConfig(patch: Partial<ParticleConfig>) {
  let structural = false

  for (const key of Object.keys(patch) as Array<keyof ParticleConfig>) {
    const next = patch[key]
    if (next === undefined || particleConfig[key] === next) continue
    if (STRUCTURAL.includes(key)) structural = true
    // The cast is contained here: the loop is key-wise generic, and the patch
    // type has already guaranteed value/key agreement at the call site.
    ;(particleConfig as Record<string, unknown>)[key] = next
  }

  if (structural) version++
  if (patch.quality || structural) listeners.forEach((l) => l())
}

export function applyQuality(tier: QualityTier) {
  setConfig({ quality: tier, ...QUALITY_PRESETS[tier] })
}

export function resetConfig(tier: QualityTier = particleConfig.quality) {
  setConfig({ ...DEFAULT_CONFIG, quality: tier, ...QUALITY_PRESETS[tier] })
  version++
  listeners.forEach((l) => l())
}
