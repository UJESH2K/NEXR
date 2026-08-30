'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_CONFIG,
  applyQuality,
  particleConfig,
  resetConfig,
  setConfig,
  type ParticleConfig,
  type QualityTier,
} from '@/lib/particles/config'
import { interaction } from '@/lib/particles/interaction'

/**
 * Tuning surface for the particle character.
 *
 * Hidden by default; toggled with the backtick key, or opened directly with
 * ?particles=1. Its state is remembered, so a tuning session survives the
 * reloads that tuning inevitably involves.
 *
 * Deliberately hand-rolled rather than pulling in a GUI library: it is one file,
 * it matches the site's type, and it keeps a dev-only dependency out of the
 * production bundle.
 */

const STORAGE_KEY = 'nexr:particles:panel'

/** Structural changes rebuild the whole cloud, so they are debounced — dragging
 *  the count slider must not resample on every pixel. */
const STRUCTURAL_DEBOUNCE = 300

type NumericKey = {
  [K in keyof ParticleConfig]: ParticleConfig[K] extends number ? K : never
}[keyof ParticleConfig]

type SliderSpec = {
  key: NumericKey
  label: string
  min: number
  max: number
  step: number
  /** Rebuilding the cloud is expensive; these get debounced. */
  structural?: boolean
  hint?: string
}

const GROUPS: Array<{
  title: string
  sliders: SliderSpec[]
  /** Renders a colour picker under the group's sliders. */
  colorKey?: 'glowColor' | 'speedColor'
}> = [
  {
    title: 'Cloud',
    sliders: [
      { key: 'particleCount', label: 'count', min: 5000, max: 260000, step: 1000, structural: true },
      { key: 'particleSize', label: 'size', min: 0.4, max: 6, step: 0.1, hint: 'px at 8 units' },
      { key: 'sizeVariance', label: 'size spread', min: 0, max: 0.9, step: 0.01, structural: true },
      { key: 'albedoStrength', label: 'albedo', min: 0, max: 2, step: 0.05 },
    ],
  },
  {
    // The crawl. Amplitude is in world units and wants to stay tiny — the whole
    // point is that every particle is visibly busy while the silhouette never
    // moves, and past roughly 0.03 the outline starts to fuzz.
    title: 'Idle life',
    sliders: [
      { key: 'idleMotion', label: 'crawl', min: 0, max: 0.06, step: 0.001, hint: 'world units' },
      { key: 'idleSpeed', label: 'crawl rate', min: 0, max: 6, step: 0.05, hint: '×, ~0.25Hz at 2.4' },
    ],
  },
  {
    title: 'Interaction',
    sliders: [
      { key: 'interactionRadius', label: 'reach', min: 0.05, max: 1.4, step: 0.01 },
      { key: 'displacementStrength', label: 'push', min: 0, max: 30, step: 0.2 },
      { key: 'arrivalBurst', label: 'arrival kick', min: 0, max: 5, step: 0.1 },
      { key: 'scatterRadius', label: 'scatter', min: 0.02, max: 1.2, step: 0.01 },
      { key: 'returnSpeed', label: 'return', min: 1, max: 12, step: 0.1 },
      { key: 'damping', label: 'damping', min: 0.2, max: 8, step: 0.1 },
      { key: 'turbulence', label: 'turbulence', min: 0, max: 12, step: 0.1 },
      { key: 'turbulenceScale', label: 'noise scale', min: 0.4, max: 12, step: 0.1 },
      { key: 'mouseSensitivity', label: 'sensitivity', min: 0.2, max: 4, step: 0.05 },
    ],
  },
  {
    // The cool end of the ramp, reached by displacement: this is the blue body of
    // a disturbance. 'Core light' below is the white heart of the same effect.
    title: 'Glow',
    colorKey: 'glowColor',
    sliders: [
      { key: 'glowIntensity', label: 'intensity', min: 0, max: 4, step: 0.05 },
      { key: 'glowSaturation', label: 'colour shift', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    // The hot end of the two-colour ramp, and the two ways a particle reaches it.
    // 'full at' is the speed that saturates the tint, so lowering it makes even
    // the gentle reassembly flare and raising it reserves the colour for violent
    // swipes. 'inner' is the other route: proximity to the contact point, which
    // is what lights the body from within rather than colouring the damage.
    // Its radius wants to stay wider than Interaction's 'reach' — that gap is
    // what lets the glow bleed through particles that never moved.
    title: 'Core light',
    colorKey: 'speedColor',
    sliders: [
      { key: 'speedTint', label: 'tint', min: 0, max: 1.5, step: 0.01 },
      { key: 'speedReference', label: 'full at', min: 0.3, max: 12, step: 0.1, hint: 'units/sec' },
      { key: 'innerGlow', label: 'inner', min: 0, max: 4, step: 0.05 },
      { key: 'innerGlowRadius', label: 'inner reach', min: 0.1, max: 3, step: 0.05 },
    ],
  },
  {
    title: 'Motion',
    sliders: [
      { key: 'tiltStrength', label: 'tilt', min: 0, max: 0.5, step: 0.005 },
      { key: 'rollStrength', label: 'camera roll', min: 0, max: 0.2, step: 0.002 },
      { key: 'scrollTurns', label: 'scroll turns', min: 0, max: 4, step: 0.05 },
      { key: 'idleSpin', label: 'idle spin', min: 0, max: 0.6, step: 0.01 },
    ],
  },
  {
    title: 'Audio',
    sliders: [{ key: 'audioIntensity', label: 'level', min: 0, max: 1, step: 0.01 }],
  },
]

const TIERS: QualityTier[] = ['low', 'medium', 'high']

function Slider({
  spec,
  value,
  onChange,
}: {
  spec: SliderSpec
  value: number
  onChange: (value: number) => void
}) {
  const decimals = spec.step < 0.01 ? 3 : spec.step < 1 ? 2 : 0

  return (
    <label className="flex items-center gap-2 py-[2px]">
      <span className="w-[86px] shrink-0 opacity-70" title={spec.hint}>
        {spec.label}
      </span>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[#d8f35d]"
      />
      <span className="w-[54px] shrink-0 text-right tabular-nums">
        {spec.step >= 1000 ? `${Math.round(value / 1000)}k` : value.toFixed(decimals)}
      </span>
    </label>
  )
}

export function ParticleDebugPanel() {
  const [open, setOpen] = useState(false)
  // Mirror of the store. The store itself stays the source of truth for the
  // render loop; this exists only so the inputs have something to render.
  const [values, setValues] = useState<ParticleConfig>({ ...particleConfig })
  const [stats, setStats] = useState({ fps: 0, active: 0, energy: 0, distortion: 0 })
  const pending = useRef<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('particles') === '1' || window.localStorage.getItem(STORAGE_KEY) === 'open') {
      setOpen(true)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '`' && event.key !== '~') return
      const target = event.target as HTMLElement | null
      // Never steal the key from a field the visitor is typing in.
      if (target?.matches('input, textarea, [contenteditable]')) return
      setOpen((current) => {
        window.localStorage.setItem(STORAGE_KEY, current ? 'closed' : 'open')
        return !current
      })
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Sampled rather than subscribed: these change every frame, and re-rendering
  // the panel sixty times a second to watch a number is exactly the kind of
  // cost a debug tool should not add to the thing it is measuring.
  useEffect(() => {
    if (!open) return

    let frames = 0
    let last = performance.now()
    let raf = 0

    const count = () => {
      frames++
      raf = requestAnimationFrame(count)
    }
    raf = requestAnimationFrame(count)

    const tick = window.setInterval(() => {
      const now = performance.now()
      setStats({
        fps: Math.round((frames * 1000) / Math.max(now - last, 1)),
        active: interaction.active,
        energy: interaction.energy,
        distortion: interaction.distortion,
      })
      frames = 0
      last = now
    }, 500)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(tick)
    }
  }, [open])

  const write = useCallback((patch: Partial<ParticleConfig>, structural = false) => {
    setValues((current) => ({ ...current, ...patch }))

    if (!structural) {
      setConfig(patch)
      return
    }

    if (pending.current) window.clearTimeout(pending.current)
    pending.current = window.setTimeout(() => {
      setConfig(patch)
      pending.current = null
    }, STRUCTURAL_DEBOUNCE)
  }, [])

  useEffect(
    () => () => {
      if (pending.current) window.clearTimeout(pending.current)
    },
    [],
  )

  if (!open) return null

  return (
    <div
      className="pointer-events-auto fixed bottom-4 right-4 max-h-[86svh] w-[318px] overflow-y-auto rounded-lg border border-white/10 bg-black/80 p-3 font-mono text-[10px] leading-relaxed text-white/90 backdrop-blur-md"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] tracking-widest opacity-60">PARTICLES</span>
        <span className="tabular-nums opacity-50">
          {stats.fps} fps · {(values.particleCount / 1000).toFixed(0)}k
        </span>
      </div>

      <div className="mb-2 flex gap-1">
        {TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => {
              applyQuality(tier)
              setValues({ ...particleConfig })
            }}
            className={`flex-1 rounded border px-1 py-[3px] uppercase tracking-wider transition-colors ${
              values.quality === tier
                ? 'border-[#d8f35d]/60 bg-[#d8f35d]/15 text-[#d8f35d]'
                : 'border-white/15 hover:border-white/35'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="mb-2 border-t border-white/10 pt-2">
          <div className="mb-1 uppercase tracking-widest opacity-40">{group.title}</div>
          {group.sliders.map((spec) => (
            <Slider
              key={spec.key}
              spec={spec}
              value={values[spec.key]}
              onChange={(value) => write({ [spec.key]: value }, spec.structural)}
            />
          ))}

          {group.colorKey && (
            <label className="flex items-center gap-2 py-[2px]">
              <span className="w-[86px] shrink-0 opacity-70">colour</span>
              <input
                type="color"
                value={values[group.colorKey]}
                onChange={(event) => write({ [group.colorKey!]: event.target.value })}
                className="h-5 w-full cursor-pointer rounded border border-white/15 bg-transparent"
              />
            </label>
          )}
        </section>
      ))}

      <section className="mb-2 border-t border-white/10 pt-2">
        <div className="mb-1 uppercase tracking-widest opacity-40">Debug</div>
        {(
          [
            ['audioEnabled', 'audio'],
            ['showSourceMesh', 'show mesh'],
            ['freeze', 'freeze sim'],
          ] as Array<[keyof ParticleConfig, string]>
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 py-[2px]">
            <input
              type="checkbox"
              checked={Boolean(values[key])}
              onChange={(event) => write({ [key]: event.target.checked })}
              className="accent-[#d8f35d]"
            />
            <span className="opacity-70">{label}</span>
          </label>
        ))}
      </section>

      <div className="mb-2 grid grid-cols-3 gap-1 border-t border-white/10 pt-2 tabular-nums opacity-60">
        <span>hover {stats.active.toFixed(2)}</span>
        <span>vel {stats.energy.toFixed(2)}</span>
        <span>dist {stats.distortion.toFixed(2)}</span>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            resetConfig(particleConfig.quality)
            setValues({ ...particleConfig })
          }}
          className="flex-1 rounded border border-white/15 px-1 py-[3px] uppercase tracking-wider hover:border-white/35"
        >
          reset
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(
              // Only what differs from the defaults, which is what you would
              // actually paste back into config.ts.
              JSON.stringify(
                Object.fromEntries(
                  Object.entries(particleConfig).filter(
                    ([key, value]) => DEFAULT_CONFIG[key as keyof ParticleConfig] !== value,
                  ),
                ),
                null,
                2,
              ),
            )
          }}
          className="flex-1 rounded border border-white/15 px-1 py-[3px] uppercase tracking-wider hover:border-white/35"
        >
          copy diff
        </button>
      </div>

      <p className="mt-2 opacity-35">` toggles · ?particles=1</p>
    </div>
  )
}
