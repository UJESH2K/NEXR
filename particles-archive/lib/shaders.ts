/**
 * GLSL for the particle character: two compute passes and one draw pass.
 *
 * The simulation stores each particle's **offset from its rest position**, not
 * its absolute position. Three things fall out of that choice, and all three
 * matter:
 *
 *   1. Reconstruction is exact. Idle means offset == 0, so the character
 *      reforms to the sampled surface bit-for-bit rather than to within some
 *      accumulated error.
 *   2. It survives half-float render targets, which is the only format some
 *      mobile GPUs will give us. Offsets live near zero, where half floats have
 *      their precision; absolute positions do not.
 *   3. The spring is a plain `-offset * k`, with no need to read the rest
 *      position back to compute it.
 *
 * Both compute shaders run under GPUComputationRenderer, which declares
 * `resolution` plus a sampler for each dependency (textureOffset,
 * textureVelocity) on our behalf.
 */

/** Cheap, stable per-particle vector from its seed. Shared by the velocity pass
 *  (impulse jitter) and the draw pass (the idle wander), so it lives on its own
 *  rather than inside the noise block. */
const HASH = /* glsl */ `
vec3 hash3(float seed) {
  return fract(sin(vec3(seed * 127.1, seed * 311.7, seed * 74.7)) * 43758.5453);
}
`

/**
 * 3D simplex noise (Ashima / Stefan Gustavson, via the webgl-noise project).
 * Three evaluations at offset domains give us a vector field — not strictly
 * divergence-free like a true curl, but three noise fetches per particle
 * instead of eighteen, and the difference is invisible at this scale.
 */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 noiseField(vec3 p) {
  return vec3(
    snoise(p),
    snoise(p + vec3(31.416, 17.727, 5.203)),
    snoise(p + vec3(-9.137, 23.318, 41.271))
  );
}
`

export const VELOCITY_SHADER = /* glsl */ `
uniform sampler2D tRest;
uniform sampler2D tNormal;
uniform float uDt;
uniform float uTime;
uniform vec3 uPointer;
uniform vec3 uPointerDir;
uniform float uPointerActive;
uniform float uRadius;
uniform float uStrength;
uniform float uEnergy;
uniform float uBurst;
uniform float uTurbulence;
uniform float uTurbulenceScale;
uniform float uStiffness;
uniform float uDamping;
uniform float uScatter;

${HASH}
${NOISE}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 restSeed = texture2D(tRest, uv);
  vec3 rest = restSeed.xyz;
  float seed = restSeed.w;
  vec3 surfaceNormal = texture2D(tNormal, uv).xyz;

  vec3 offset = texture2D(textureOffset, uv).xyz;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;
  vec3 position = rest + offset;

  // ── localised impulse ─────────────────────────────────────────────────────
  // Measured from the rest position, not the current one: a particle already in
  // flight must not be re-kicked just because the cloud drifted over the
  // pointer, or the region would smear outwards as the effect runs.
  float region = 1.0 - smoothstep(uRadius * 0.35, uRadius, distance(rest, uPointer));
  float influence = region * uPointerActive;

  vec3 random = hash3(seed);

  // Away from the contact point, leaned towards the surface normal so particles
  // lift off the body rather than sliding across it, plus the pointer's own
  // travel direction so a fast swipe throws them downrange.
  vec3 away = normalize(position - uPointer + surfaceNormal * 1e-3 + vec3(1e-5));
  vec3 direction = normalize(
    mix(away, surfaceNormal, 0.45)
    + uPointerDir * (0.3 + 0.9 * uEnergy)
    + (random - 0.5) * 0.85
  );

  // Pointer speed dominates the impulse: a motionless pointer resting on the
  // character barely lifts the surface, while a fast sweep tears it open. That
  // asymmetry is what makes stopping read as the effect subsiding rather than
  // as it holding a pose.
  float kick = uStrength * (0.45 + 1.1 * seed) * (0.12 + 1.88 * uEnergy);
  vec3 acceleration = direction * kick * influence;

  // ── arrival burst ─────────────────────────────────────────────────────────
  // A one-shot kick on the frame the pointer lands, decayed by the caller rather
  // than held. Two things make it read differently from the impulse above.
  //
  // It ignores uEnergy, so it fires for a pointer that simply comes to rest on
  // the surface. Combined with the decay, arriving breaks the character open and
  // the spring reforms it while the cursor still sits there — no gesture needed.
  //
  // And it has its own, much wider falloff. The ongoing impulse is a dimple under
  // the cursor; arriving should read as the whole body scattering. The leash
  // further down still bounds it, so the silhouette cannot bleed.
  float burstRegion = 1.0 - smoothstep(0.0, uRadius * 2.6, distance(rest, uPointer));
  acceleration += direction
    * uStrength
    * uBurst
    * (0.7 + 0.9 * seed)
    * burstRegion
    * uPointerActive;

  // ── turbulence ────────────────────────────────────────────────────────────
  // Scaled by how far the particle already is from rest, so the field only
  // stirs the cloud that has actually broken away. Particles still on the
  // surface stay put, which is what keeps the idle character crisp.
  //
  // The square is load-bearing. Scaled linearly, turbulence and the spring are
  // both proportional to the offset, so their ratio decides the outcome for
  // every particle at once: a little too much turbulence and the disturbed
  // region never settles, it just hums at a fixed radius forever. Squared, the
  // spring always wins the last stretch, so the return converges on exactly
  // zero while the far-flung particles still get the full stir.
  float excite = clamp(length(offset) / max(uScatter, 1e-4), 0.0, 1.0);
  vec3 turbulence = noiseField(
    position * uTurbulenceScale
    + vec3(0.0, uTime * 0.22, uTime * 0.13)
    + seed * 6.283
  );
  acceleration += turbulence * uTurbulence * (excite * excite * 1.6 + influence * 0.6);

  // ── spring home ───────────────────────────────────────────────────────────
  // Per-particle stiffness spread staggers the reform. A single stiffness makes
  // the whole region snap back on the same frame, which reads as mechanical.
  acceleration -= offset * uStiffness * (0.7 + 0.6 * seed);

  // Leash. Without it a run of turbulence in one direction can walk a particle
  // away indefinitely, and the silhouette slowly bleeds.
  float maxOffset = uScatter * (0.45 + 1.1 * seed);
  float over = length(offset) - maxOffset;
  if (over > 0.0) acceleration -= normalize(offset) * over * 22.0;

  velocity += acceleration * uDt;
  // exp() rather than a per-frame multiply: damping then means the same thing
  // at 30fps and at 144fps.
  velocity *= exp(-uDamping * (0.85 + 0.3 * seed) * uDt);

  gl_FragColor = vec4(velocity, seed);
}
`

export const OFFSET_SHADER = /* glsl */ `
uniform float uDt;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec3 offset = texture2D(textureOffset, uv).xyz;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;

  offset += velocity * uDt;

  // Snap the last sliver of the return to exactly zero. This is what makes the
  // promise of perfect reconstruction literal rather than approximate: idle
  // particles sit on the sampled surface, not a hair off it.
  // 2 mm on a 3.6-unit character: below a pixel at any camera distance the rig
  // uses, so the snap is invisible, and it saves waiting out the long tail of
  // an exponential decay.
  if (dot(offset, offset) < 4e-6 && dot(velocity, velocity) < 4e-4) {
    offset = vec3(0.0);
  }

  gl_FragColor = vec4(offset, 1.0);
}
`

/**
 * Draw pass. Lighting is evaluated per vertex, not per fragment: a particle
 * covers a handful of pixels, so there is nothing to gain from shading it more
 * finely, and at 120k points the saving is the difference between comfortable
 * and not.
 *
 * The light rig here mirrors Lighting.tsx. Points cannot participate in three's
 * light system, so the two have to be kept in step by hand — change one, change
 * the other.
 *
 * Three independent signals drive the colour, and keeping them separate is the
 * point:
 *
 *   excite — how far a particle is from home. Slow, positional, tints the cloud
 *            towards uGlowColor so the displaced region reads as a distinct mass.
 *   rush   — how fast it is travelling right now. Instantaneous.
 *   inner  — how close it is to the contact point, measured from its rest
 *            position. Positional but pointer-driven, and unrelated to whether
 *            the particle has actually moved.
 *
 * A particle hanging at the edge of its leash is excited but not rushing; one
 * whipping back through its rest position is rushing but not excited. Colouring
 * on both is what makes the motion itself legible rather than just the shape.
 *
 * rush and inner fold into a single `heat` that runs the blue→white end of the
 * ramp, so a disturbance has a cool volume and a hot core. inner is what lights
 * the character from *within*: see the note at its declaration.
 *
 * This pass also owns the idle crawl, which is not part of the simulation at all.
 * See the note in main().
 */
export const RENDER_VERTEX = /* glsl */ `
attribute vec2 aSimUv;
attribute vec3 aRest;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aProps;
attribute float aSeed;

uniform sampler2D tOffset;
uniform sampler2D tVelocity;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScatter;
uniform float uGlow;
uniform float uGlowSaturation;
uniform vec3 uGlowColor;
uniform float uAlbedo;
uniform vec3 uSpeedColor;
uniform float uSpeedTint;
uniform float uSpeedReference;
uniform float uTime;
uniform float uIdleMotion;
uniform float uIdleSpeed;
uniform vec3 uPointer;
uniform float uPointerActive;
uniform float uInnerGlow;
uniform float uInnerGlowRadius;

varying vec3 vLit;
varying vec3 vGlow;
varying float vExcite;
varying float vHeat;
varying float vFade;

/** Distance at which uSize is taken to be a size in pixels. */
const float REFERENCE_DISTANCE = 8.0;

const vec3 AMBIENT = vec3(0.35);
const vec3 KEY_DIRECTION = vec3(4.0, 6.0, 6.0);
const vec3 KEY_COLOR = vec3(1.0, 0.965, 0.91) * 1.6;
const vec3 WARM_RIM_DIRECTION = vec3(-5.0, 3.0, -6.0);
const vec3 WARM_RIM_COLOR = vec3(0.847, 0.953, 0.365) * 1.1;
const vec3 COOL_RIM_DIRECTION = vec3(6.0, 1.5, -5.0);
const vec3 COOL_RIM_COLOR = vec3(0.498, 0.690, 0.784) * 0.8;
const vec3 UNDER_DIRECTION = vec3(0.0, -2.5, 2.0);
const vec3 UNDER_COLOR = vec3(0.239, 0.318, 0.271) * 0.4;

${HASH}

/**
 * Endless per-particle wander, in [-1, 1] on each axis.
 *
 * Two sines per axis at an irrational frequency ratio, so the path is
 * quasi-periodic and never visibly loops back on itself. Frequency and phase
 * both come from the particle's own seed, and that is the whole design: a
 * spatially coherent noise field would move neighbours together and read as a
 * surface breathing, whereas independent wander reads as an ants' nest — every
 * particle busy, the mass going nowhere.
 */
vec3 wander(float seed, float t) {
  vec3 phase = hash3(seed) * 6.2831853;
  vec3 rate = 0.55 + hash3(seed + 7.77) * 1.1;
  vec3 a = sin(t * rate + phase);
  vec3 b = sin(t * rate * 1.6180339 + phase.yzx * 1.7);
  return (a + b * 0.6) / 1.6;
}

vec3 shade(vec3 albedo, vec3 normal, vec3 view, vec3 lightDirection, vec3 lightColor, float shininess, float specular) {
  vec3 l = normalize(lightDirection);
  float diffuse = max(dot(normal, l), 0.0);
  // Half-Lambert on the fill terms only would flatten the key, so wrap is kept
  // small and uniform: enough that the unlit side is not pure black.
  diffuse = diffuse * 0.85 + 0.15 * max(dot(normal, l) * 0.5 + 0.5, 0.0);
  vec3 halfway = normalize(l + view);
  float spec = pow(max(dot(normal, halfway), 0.0), shininess) * specular;
  return lightColor * (albedo * diffuse + spec);
}

void main() {
  vec3 offset = texture2D(tOffset, aSimUv).xyz;

  // ── the crawl ─────────────────────────────────────────────────────────────
  // Nothing in the cloud is ever quite still, and yet the character is always
  // exactly itself. Both halves of that are deliberate.
  //
  // It lives in the draw pass rather than the simulation for three reasons: the
  // sim goes on converging to exactly zero, so reconstruction stays literal and
  // the snap in OFFSET_SHADER still fires; the crawl cannot be caught by the
  // turbulence term and amplified into instability; and it never feeds excite or
  // rush, so a resting character produces no spurious glow.
  //
  // Projecting the wander onto the tangent plane is what keeps the promise.
  // Moving *along* the surface leaves the silhouette exactly where it was — the
  // outline is never distorted, only endlessly reshuffled. A quarter of the
  // normal component survives so the surface shimmers in depth rather than
  // reading as a decal sliding about.
  vec3 restNormal = normalize(aNormal);
  vec3 crawl = wander(aSeed, uTime * uIdleSpeed);
  crawl -= restNormal * dot(crawl, restNormal) * 0.75;

  vec3 position = aRest + offset + crawl * uIdleMotion;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;

  float excite = clamp(length(offset) / max(uScatter, 1e-4), 0.0, 1.0);
  vExcite = excite;

  float rush = clamp(
    length(texture2D(tVelocity, aSimUv).xyz) / max(uSpeedReference, 1e-3),
    0.0,
    1.0
  );

  // ── the light from inside ─────────────────────────────────────────────────
  // Measured from the *rest* position, so the lit region stays where the pointer
  // is instead of being carried away by the particles it happens to be lighting.
  //
  // Its radius is deliberately wider than the interaction radius, and that is the
  // whole trick: the glow bleeds through particles that have not moved at all, so
  // it reads as light living inside the volume and travelling with the cursor
  // rather than as a marker painted on the damage. The particles between the
  // contact point and the silhouette are the brightest, which is what puts the
  // apparent source beneath the surface instead of on it.
  float inner = (1.0 - smoothstep(0.0, uInnerGlowRadius, distance(aRest, uPointer)))
    * uPointerActive;

  // One ramp, two colours: blue for the body of a disturbance, white for its
  // core. Squaring inner keeps the falloff tight so the core stays a core.
  float heat = clamp(rush + inner * inner * uInnerGlow, 0.0, 1.0);
  vHeat = heat;

  // Sub-pixel points shimmer as they cross pixel boundaries. Clamp the size at
  // one pixel and carry the shortfall into alpha instead, which keeps the cloud
  // the same overall brightness while the camera is still far away.
  //
  // rush and excite here, deliberately not heat: inner glow must not swell
  // particles that have not moved, or the silhouette would quietly fatten under
  // the cursor. The glow is allowed to travel through the body; size is not.
  float sizePixels = uSize
    * aProps.z
    * uPixelRatio
    * (1.0 + excite * 0.45 + rush * 0.25)
    * (REFERENCE_DISTANCE / max(-viewPosition.z, 0.001));
  vFade = clamp(sizePixels, 0.0, 1.0);
  gl_PointSize = max(sizePixels, 1.0);

  vec3 normal = normalize(mat3(modelMatrix) * aNormal);
  vec3 view = normalize(cameraPosition - worldPosition.xyz);

  float roughness = clamp(aProps.x, 0.04, 1.0);
  float metalness = clamp(aProps.y, 0.0, 1.0);
  float shininess = mix(96.0, 6.0, roughness);
  // Dielectrics get a small white highlight; metals tint theirs by albedo,
  // which is the one bit of metalness that actually reads at this size.
  float specular = mix(0.12, 0.9, metalness) * (1.0 - roughness * 0.75);

  // As a particle strays it drifts towards the glow colour, so the displaced
  // cloud separates from the body without abandoning the character's palette.
  vec3 albedo = mix(aColor * uAlbedo, uGlowColor, excite * uGlowSaturation);
  // Heat on top of that, and applied after: a particle being thrown reads as
  // charged the instant it starts moving, before it has gone anywhere — and a
  // particle merely near the cursor reads as lit from within without moving at
  // all.
  albedo = mix(albedo, uSpeedColor, heat * uSpeedTint * 0.85);
  vec3 specularTint = mix(vec3(1.0), albedo, metalness);

  vec3 lit = AMBIENT * albedo;
  lit += shade(albedo, normal, view, KEY_DIRECTION, KEY_COLOR * specularTint, shininess, specular);
  lit += shade(albedo, normal, view, WARM_RIM_DIRECTION, WARM_RIM_COLOR * specularTint, shininess, specular);
  lit += shade(albedo, normal, view, COOL_RIM_DIRECTION, COOL_RIM_COLOR * specularTint, shininess, specular);
  lit += shade(albedo, normal, view, UNDER_DIRECTION, UNDER_COLOR, shininess, specular * 0.4);

  vLit = lit;
  // Squared so the glow builds late and sharply — a linear ramp makes every
  // barely-disturbed particle glow faintly, which fogs the whole character.
  vGlow = uGlowColor * uGlow * excite * excite;
  // Same reasoning for heat, and it is the flare that sells both the reassembly
  // and the interior light: the fastest particles are the ones converging on the
  // surface, so the character brightens as it snaps back together and then
  // settles dark. The mix is the two-colour ramp — blue through the volume of the
  // disturbance, white at its core.
  vGlow += mix(uGlowColor, uSpeedColor, heat) * uSpeedTint * heat * heat * 1.3;
}
`

export const RENDER_FRAGMENT = /* glsl */ `
varying vec3 vLit;
varying vec3 vGlow;
varying float vExcite;
varying float vHeat;
varying float vFade;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;

  // An opaque core keeps the idle character reading as a solid surface; the
  // halo only appears on particles that have broken away.
  float core = 1.0 - smoothstep(0.45, 1.0, d);
  float halo = exp(-d * d * 1.8) * 0.55;

  // max, not sum: a particle that is both far out and moving fast should not get
  // twice the halo, or the disturbed region blows out to white.
  float alpha = clamp(core + halo * max(vExcite, vHeat), 0.0, 1.0) * vFade;
  if (alpha < 0.004) discard;

  vec3 color = vLit + vGlow * (core * 0.6 + halo);

  gl_FragColor = vec4(color, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`
