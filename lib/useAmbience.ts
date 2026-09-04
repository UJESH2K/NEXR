'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scroll } from './scrollStore'
import { SECTIONS, SECTION_COUNT } from './sections'

/**
 * Ambient sound, synthesised rather than streamed.
 *
 * No audio file ships with this. A drone is three detuned oscillators through a
 * filter, and generating it costs nothing to download on a page already paying
 * for a 4 MB character — which matters more than it sounds, because an ambient
 * bed only works if it starts the instant the visitor asks for it.
 *
 * The bed is tied to scroll in two ways: the filter opens as the page
 * progresses, and the chord transposes at each beat. That is the difference
 * between sound that is playing and sound that is responding.
 *
 * Autoplay policy means none of this can start without a gesture, so the toggle
 * is a real control rather than a mute button on something already running.
 */

/** Root note per beat. A slow rise, resolving down at the close. */
const ROOTS = [55, 61.74, 65.41, 58.27, 73.42, 55]

type Nodes = {
  ctx: AudioContext
  master: GainNode
  filter: BiquadFilterNode
  voices: OscillatorNode[]
  gains: GainNode[]
}

export function useAmbience() {
  const [on, setOn] = useState(false)
  const nodes = useRef<Nodes | null>(null)

  const build = useCallback((): Nodes | null => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null

    const ctx = new Ctor()

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // A gentle lowpass is what turns three sawtooth-ish voices into a pad
    // instead of a buzz. Its cutoff is the main thing scroll moves.
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 320
    filter.Q.value = 0.6
    filter.connect(master)

    // Root, fifth, octave. The tiny detune on each is what stops the stack
    // sounding like a single synthetic tone.
    const ratios = [1, 1.5, 2, 3.01]
    const levels = [0.5, 0.26, 0.15, 0.05]
    const voices: OscillatorNode[] = []
    const gains: GainNode[] = []

    ratios.forEach((ratio, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 3 ? 'sine' : 'triangle'
      osc.frequency.value = ROOTS[0] * ratio
      osc.detune.value = (i - 1.5) * 6

      const gain = ctx.createGain()
      gain.gain.value = levels[i]

      osc.connect(gain).connect(filter)
      osc.start()

      voices.push(osc)
      gains.push(gain)
    })

    return { ctx, master, filter, voices, gains }
  }, [])

  const toggle = useCallback(() => {
    if (!nodes.current) {
      const built = build()
      if (!built) return
      nodes.current = built
    }

    const n = nodes.current
    const next = !on

    // AudioContexts start suspended until a gesture resumes them, and this
    // handler *is* the gesture.
    if (n.ctx.state === 'suspended') void n.ctx.resume()

    const now = n.ctx.currentTime
    n.master.gain.cancelScheduledValues(now)
    n.master.gain.setValueAtTime(n.master.gain.value, now)
    // Long ramps in both directions: an ambient bed that snaps on is startling.
    n.master.gain.linearRampToValueAtTime(next ? 0.09 : 0, now + (next ? 2.2 : 0.9))

    scroll.audioOn = next
    setOn(next)
  }, [build, on])

  // Follow the scroll, but only while audible — no reason to schedule
  // parameter changes on a silent graph.
  useEffect(() => {
    if (!on) return

    const tick = () => {
      const n = nodes.current
      if (!n) return

      const f = scroll.sectionFloat
      const i = Math.min(Math.floor(f), SECTION_COUNT - 1)
      const j = Math.min(i + 1, SECTION_COUNT - 1)
      const t = f - i

      const root = ROOTS[i] + (ROOTS[j] - ROOTS[i]) * t
      const ratios = [1, 1.5, 2, 3.01]

      n.voices.forEach((osc, k) => {
        // setTargetAtTime glides rather than steps, so a fast scroll bends the
        // chord instead of clicking through it.
        osc.frequency.setTargetAtTime(root * ratios[k], n.ctx.currentTime, 0.35)
      })

      // The pad opens up as the page progresses and brightens with pointer
      // movement, which is the same energy signal the visuals use.
      const cutoff = 280 + scroll.homeProgress * 900 + scroll.pointerEnergy * 420
      n.filter.frequency.setTargetAtTime(cutoff, n.ctx.currentTime, 0.4)
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [on])

  // Release the hardware when the page goes away.
  useEffect(
    () => () => {
      const n = nodes.current
      if (!n) return
      n.voices.forEach((osc) => osc.stop())
      void n.ctx.close()
      nodes.current = null
    },
    [],
  )

  // Browsers suspend contexts on a hidden tab; some do not resume cleanly, and
  // a pad that comes back a semitone out is worse than one that stays quiet.
  useEffect(() => {
    const onVisibility = () => {
      const n = nodes.current
      if (!n || !on) return
      if (document.hidden) void n.ctx.suspend()
      else void n.ctx.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [on])

  return { on, toggle, label: SECTIONS[0].word }
}
