'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BackSide,
  Color,
  Fog,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  type Mesh,
} from 'three'
import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { clamp01, damp, scroll } from '@/lib/scrollStore'

/**
 * The 360° room the whole experience sits inside.
 *
 * It is a single inverted sphere rather than a cube map: a gradient this soft
 * would band across cube seams, and a procedural sky costs nothing to download,
 * which matters on a page already carrying a 4 MB character.
 *
 * Three things make it read as a *place* instead of a backdrop:
 *   - it rotates with scroll, so travelling down the page is travelling around
 *     the room rather than watching slides swap;
 *   - its palette cross-fades between consecutive beats, so the room changes
 *     colour continuously and never cuts;
 *   - a soft light pool behind the character drifts with the pointer, which is
 *     what makes the space feel lit rather than painted.
 *
 * Scene fog is driven from the same colour, so panels at distance dissolve into
 * the sky exactly where the sphere's own horizon sits.
 */

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  varying vec3 vDir;

  uniform vec3  uHorizon;
  uniform vec3  uZenith;
  uniform vec3  uAccent;
  uniform float uTime;
  uniform float uEnergy;
  uniform vec2  uPointer;
  uniform float uGrain;
  uniform vec3  uHighlight;

  // Value noise. Cheap, and at this scale the lattice never shows.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir);

    // Vertical gradient, biased so the horizon band sits a little below the
    // character's eyeline rather than at dead centre.
    float h = clamp(dir.y * 0.5 + 0.46, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(h, 1.35));

    // Ground half falls off darker so the figure has something to stand in.
    col = mix(col, uZenith * 0.55, smoothstep(0.0, -0.55, dir.y));

    // Slow drifting atmosphere. Two octave sets moving at different speeds is
    // what stops the clouds looking like one texture being scrolled.
    float clouds = fbm(dir * 2.1 + vec3(uTime * 0.012, uTime * 0.006, 0.0));
    clouds = mix(clouds, fbm(dir * 4.7 - vec3(0.0, uTime * 0.02, uTime * 0.01)), 0.45);
    col += (clouds - 0.5) * 0.105;

    // Lit cloud tops.
    //
    // The shading above only darkens and lightens the sky's own hue, which on a
    // warm palette gives muddy brown shadows and no highlight at all. Mixing the
    // denser part of the same noise toward white instead reads as sunlight
    // catching the top of a cloud, and it is the one thing that keeps an orange
    // sky from looking like a flat orange wall.
    //
    // The exponent is what makes it a highlight rather than a haze: raising the
    // noise to a high power keeps all but the densest few percent at zero, so
    // the white lands in a handful of places instead of washing the whole dome.
    float lit = pow(smoothstep(0.36, 0.86, clouds), 2.1);
    // Strongest just above the horizon and gone overhead, the way a low sun lights
    // cloud from beneath. The band is wide because on a dark ground this mix is
    // not a tint on an already-bright sky — it *is* the cloud, and a narrow band
    // leaves the upper dome flat.
    lit *= smoothstep(-0.45, 0.12, dir.y) * (1.0 - smoothstep(0.55, 1.0, dir.y));
    col = mix(col, uHighlight, lit * 0.4);

    // Light pool behind the subject, nudged by the pointer.
    vec3 sun = normalize(vec3(uPointer.x * 0.5, 0.18 - uPointer.y * 0.28, -1.0));
    float d = max(dot(dir, sun), 0.0);
    col += uAccent * pow(d, 5.0) * (0.10 + uEnergy * 0.10);
    col += uAccent * pow(d, 48.0) * 0.16;

    // Vignette toward the poles keeps the eye on the horizon band.
    col *= 1.0 - 0.28 * pow(abs(dir.y), 2.2);

    // Film grain, tied to pointer energy so a resting frame is genuinely still.
    float g = hash(vec3(gl_FragCoord.xy, floor(uTime * 24.0)));
    col += (g - 0.5) * uGrain * (0.6 + uEnergy * 0.8);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const _horizonA = new Color()
const _horizonB = new Color()
const _zenithA = new Color()
const _zenithB = new Color()
const _accentA = new Color()
const _accentB = new Color()
const _fogA = new Color()
const _fogB = new Color()

/** How far the room turns across the full page, in radians. */
const TOTAL_SPIN = Math.PI * 1.15

export function Environment360({ reduced = false }: { reduced?: boolean }) {
  const mesh = useRef<Mesh>(null)
  const spin = useRef(0)
  const scene = useThree((s) => s.scene)

  // 32 segments is plenty: the shader is smooth and the sphere is never seen
  // edge-on, so extra geometry buys nothing but vertex cost.
  const geometry = useMemo(() => new SphereGeometry(400, 48, 32), [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        side: BackSide,
        depthWrite: false,
        // Fog would tint the sky toward itself and flatten the gradient.
        fog: false,
        uniforms: {
          uHorizon: { value: new Color(SECTIONS[0].sky[0]) },
          uZenith: { value: new Color(SECTIONS[0].sky[1]) },
          uAccent: { value: new Color(SECTIONS[0].accent) },
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uPointer: { value: new Vector2() },
          uGrain: { value: 0.035 },
          // Near-white, warmed very slightly so the lit edges belong to the same
          // light as the sky rather than looking like paper laid over it.
          uHighlight: { value: new Color('#fff6ec') },
        },
      }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const u = material.uniforms

    // ── palette cross-fade between the two beats we sit between ────────────
    const f = scroll.sectionFloat
    const i = Math.min(Math.floor(f), SECTION_COUNT - 1)
    const j = Math.min(i + 1, SECTION_COUNT - 1)
    // Ease the blend so each beat holds its colour through its dwell and
    // changes during the travel, matching how the panels move.
    const raw = clamp01(f - i)
    const t = raw * raw * (3 - 2 * raw)

    _horizonA.set(SECTIONS[i].sky[0])
    _horizonB.set(SECTIONS[j].sky[0])
    _zenithA.set(SECTIONS[i].sky[1])
    _zenithB.set(SECTIONS[j].sky[1])
    _accentA.set(SECTIONS[i].accent)
    _accentB.set(SECTIONS[j].accent)
    _fogA.set(SECTIONS[i].fog)
    _fogB.set(SECTIONS[j].fog)

    ;(u.uHorizon.value as Color).copy(_horizonA).lerp(_horizonB, t)
    ;(u.uZenith.value as Color).copy(_zenithA).lerp(_zenithB, t)
    /*
     * The sun pool takes a washed accent rather than the raw one.
     *
     * The shader adds the accent back at pow(d, 5), which is a wide lobe
     * filling most of the frame behind the figure. A saturated brand orange
     * there stopped being a glow and became the colour of the room: the green
     * sky, the rock and the figure's white suit all came back brown. Pulling it
     * halfway to the horizon keeps the warmth in the right place and lets the
     * sky colour survive.
     */
    ;(u.uAccent.value as Color)
      .copy(_accentA)
      .lerp(_accentB, t)
      .lerp(u.uHorizon.value as Color, 0.55)

    u.uTime.value = reduced ? 0 : state.clock.elapsedTime
    u.uEnergy.value = reduced ? 0 : scroll.pointerEnergy
    ;(u.uPointer.value as Vector2).set(scroll.pointerX, scroll.pointerY)

    // ── the room turns as you travel ───────────────────────────────────────
    const node = mesh.current
    if (node) {
      const target =
        scroll.homeProgress * TOTAL_SPIN + scroll.pointerX * 0.045
      spin.current = damp(spin.current, target, 3.2, dt)
      node.rotation.y = spin.current
      // A touch of roll on the pointer's vertical axis. Small on purpose: any
      // more and the horizon visibly tips, which breaks the sense of standing.
      node.rotation.x = damp(node.rotation.x, scroll.pointerY * 0.02, 3, dt)
    }

    // ── keep scene fog on the same colour as the horizon ───────────────────
    // The Fog object is created declaratively in SceneRoot; only its colour is
    // animated here, so panels always dissolve into the sky at exactly the
    // shade the sphere is painting behind them.
    const fog = scene.fog
    if (fog instanceof Fog) fog.color.copy(_fogA).lerp(_fogB, t)
  })

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-1}
    />
  )
}
