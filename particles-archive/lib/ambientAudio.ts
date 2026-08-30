/**
 * The ambient layer that the particle distortion plays.
 *
 * Entirely procedural — two detuned sine partials for the body, a saw for edge,
 * and filtered noise for the air. Nothing is fetched, so there is no asset to
 * wait for and nothing to go stale.
 *
 * Three constraints shaped this:
 *
 *   - It must not fight the browser's autoplay policy, so the graph is not
 *     built until the visitor has actually interacted with the character.
 *   - It must not interfere with any other audio on the page. Its own
 *     AudioContext, its own gain, nothing exclusive, no calls to any shared
 *     context.
 *   - It must cost nothing when nobody is touching anything, so the context is
 *     suspended once the level has been at zero for a moment and resumed on
 *     demand.
 */

/** Level below which the layer is considered silent and may be suspended. */
const SILENCE = 0.0008
/** How long it must stay silent before the context is suspended, in seconds. */
const SUSPEND_AFTER = 1.6

/** Time constants for setTargetAtTime. Rising fast and falling slow is what
 *  makes the layer feel like it is reacting rather than tracking. */
const ATTACK = 0.09
const RELEASE = 0.55

type Nodes = {
  context: AudioContext
  master: GainNode
  droneGain: GainNode
  droneFilter: BiquadFilterNode
  partials: OscillatorNode[]
  noiseGain: GainNode
  noiseFilter: BiquadFilterNode
  noise: AudioBufferSourceNode
  panner: StereoPannerNode
}

export type AmbientAudio = {
  /** Feed the current state of the effect. Safe to call every frame. */
  update(input: { level: number; energy: number; pan: number }, dt: number): void
  /** Reflects the config toggle; muting also releases the audio device. */
  setEnabled(enabled: boolean): void
  dispose(): void
}

function pinkishNoise(context: AudioContext) {
  const length = context.sampleRate * 2
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)

  // A one-pole lowpass over white noise. Not true pink, but it avoids the
  // fizzy top end of white noise, which is what makes cheap ambient layers
  // sound like tape hiss.
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  return buffer
}

function build(): Nodes | null {
  const Ctor: typeof AudioContext | undefined =
    typeof window === 'undefined'
      ? undefined
      : window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!Ctor) return null

  // 'interactive' is the default, but say so: this layer tracks a pointer, and
  // latency is the one thing that would give it away.
  const context = new Ctor({ latencyHint: 'interactive' })

  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  const droneFilter = context.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 320
  droneFilter.Q.value = 0.8

  const droneGain = context.createGain()
  droneGain.gain.value = 0.55
  droneFilter.connect(droneGain).connect(master)

  // A fifth and two octaves of the root: enough to read as a chord without
  // implying a key the rest of the site has not agreed to.
  const partials = [
    { type: 'sine' as OscillatorType, frequency: 55, gain: 1 },
    { type: 'sine' as OscillatorType, frequency: 82.5, gain: 0.55 },
    { type: 'sawtooth' as OscillatorType, frequency: 110, gain: 0.12 },
  ].map(({ type, frequency, gain }) => {
    const osc = context.createOscillator()
    osc.type = type
    osc.frequency.value = frequency
    const level = context.createGain()
    level.gain.value = gain
    osc.connect(level).connect(droneFilter)
    osc.start()
    return osc
  })

  const noiseFilter = context.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 480
  noiseFilter.Q.value = 1.1

  const panner = context.createStereoPanner()

  const noiseGain = context.createGain()
  noiseGain.gain.value = 0
  noiseFilter.connect(panner).connect(noiseGain).connect(master)

  const noise = context.createBufferSource()
  noise.buffer = pinkishNoise(context)
  noise.loop = true
  noise.connect(noiseFilter)
  noise.start()

  // Browsers only let a context start from a real user gesture, and a pointer
  // moving over the character is not one. So if we were built too early, wait
  // for the first click, key or tap and start then — which is also the first
  // moment the visitor could reasonably expect sound.
  if (context.state === 'suspended') {
    const unlock = () => {
      void context.resume()
      for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) {
        window.removeEventListener(type, unlock)
      }
    }
    for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) {
      window.addEventListener(type, unlock, { passive: true })
    }
  }

  return {
    context,
    master,
    droneGain,
    droneFilter,
    partials,
    noiseGain,
    noiseFilter,
    noise,
    panner,
  }
}

export function createAmbientAudio(getIntensity: () => number): AmbientAudio {
  let nodes: Nodes | null = null
  let enabled = true
  let failed = false
  let silentFor = 0
  let level = 0

  const ensure = () => {
    if (nodes || failed || !enabled) return nodes
    nodes = build()
    if (!nodes) failed = true
    return nodes
  }

  return {
    update({ level: target, energy, pan }, dt) {
      // Rise as soon as there is something to hear; the graph is only built at
      // that point, which is also the first moment the browser will allow it.
      if (!enabled) return
      if (target <= SILENCE && !nodes) return

      const graph = ensure()
      if (!graph) return

      const ceiling = Math.max(0, Math.min(1, getIntensity()))
      level = target * ceiling

      if (level > SILENCE) {
        silentFor = 0
        if (graph.context.state === 'suspended') void graph.context.resume()
      } else {
        silentFor += dt
        // Suspending is the difference between an idle tab costing nothing and
        // costing a permanent audio thread.
        if (silentFor > SUSPEND_AFTER && graph.context.state === 'running') {
          void graph.context.suspend()
          return
        }
      }

      const now = graph.context.currentTime
      const constant = level > graph.master.gain.value ? ATTACK : RELEASE

      graph.master.gain.setTargetAtTime(level * 0.5, now, constant)
      // Aggressive interaction opens the drone filter and pushes the noise band
      // upward, so intensity reads as brightness rather than just loudness.
      graph.droneFilter.frequency.setTargetAtTime(260 + energy * 1500, now, 0.18)
      graph.noiseGain.gain.setTargetAtTime(0.12 + energy * 0.5, now, ATTACK)
      graph.noiseFilter.frequency.setTargetAtTime(420 + energy * 2600, now, 0.14)
      graph.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.25)
      // A few cents of drift under load. Perfectly tuned partials sound
      // synthetic the moment they get loud.
      graph.partials[2].detune.setTargetAtTime(energy * 22, now, 0.3)
    },

    setEnabled(next) {
      enabled = next
      if (!next && nodes) {
        nodes.master.gain.value = 0
        void nodes.context.suspend()
      }
    },

    dispose() {
      if (!nodes) return
      const graph = nodes
      nodes = null
      try {
        graph.partials.forEach((osc) => osc.stop())
        graph.noise.stop()
        graph.master.disconnect()
      } catch {
        // Already torn down by a context close elsewhere; nothing to do.
      }
      void graph.context.close()
    },
  }
}
