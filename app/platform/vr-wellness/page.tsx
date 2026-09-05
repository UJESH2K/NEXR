import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles, Stats, ImagePlaceholder, StepCard } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'VR Wellness — NEXR',
  description:
    'Guided, clinically supervised immersive experiences that help people work through challenges and build resilience at their own pace.',
}

const SAFEGUARDS = [
  {
    title: 'Assessment and consent first',
    body: 'No immersive session begins without a prior assessment and the person\'s informed consent.',
    icon: '✅',
  },
  {
    title: 'Monitored throughout',
    body: 'A trained mental-health professional guides every session and watches how the person is responding.',
    icon: '👁️',
  },
  {
    title: 'Stopped or adapted',
    body: 'If an experience is unsuitable it is changed or ended. The goal is safe, paced progress — never forcing an experience.',
    icon: '⏸️',
  },
]

const STATS = [
  { value: '92%', label: 'Report reduced anxiety' },
  { value: '6+', label: 'Phobias treatable' },
  { value: '100%', label: 'Clinically supervised' },
  { value: '0', label: 'Headsets needed to start' },
]

export default function VrWellnessPage() {
  return (
    <PageShell
      eyebrow="04 / The Platform"
      title="VR Wellness"
      lede="An additional wellness tool, introduced later in the journey rather than as the core product — immersive, guided, and always clinically supervised."
    >
      <Beat heading="No headset needed to begin">
        <p>
          The wider virtual platform works on regular phones and laptops; users
          do not need to buy a headset. Where guided VR sessions are appropriate,
          partner organisations provide the hardware.
        </p>
      </Beat>

      <Stats items={STATS} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImagePlaceholder label="VR exposure therapy session" tint={['#4a4270', '#0e0c17']} aspect="16/10" />
        <ImagePlaceholder label="Guided immersive environment" tint={['#3d3660', '#0c0a14']} aspect="16/10" />
      </div>

      <Beat heading="What immersive work can support">
        <p>
          VR can support guided exposure-based work for challenges such as fear
          of heights, public speaking, flying, insects, social anxiety and driving
          anxiety.
        </p>
        <p>
          Exposure therapy is an established behavioural and cognitive technique
          in which people systematically face avoided thoughts, objects or
          situations in safety, helping to break the long-term cycle of anxiety.
        </p>
      </Beat>

      <Beat heading="How it works">
        <div className="space-y-8">
          <StepCard number={1} title="Clinical assessment">
            <p>A trained professional evaluates readiness and determines whether immersive exposure is appropriate for the individual's situation.</p>
          </StepCard>
          <StepCard number={2} title="Guided session setup">
            <p>The environment is configured to match the specific challenge — heights, public speaking, flying — with adjustable intensity levels.</p>
          </StepCard>
          <StepCard number={3} title="Supervised immersion">
            <p>Every session is guided in real-time by a psychologist who monitors responses and adapts the experience as needed.</p>
          </StepCard>
          <StepCard number={4} title="Progress and follow-up">
            <p>Results are tracked over time, with sessions paced to build confidence gradually. No experience is forced — safety comes first.</p>
          </StepCard>
        </div>
      </Beat>

      <Beat heading="How sessions are kept safe">
        <Tiles items={SAFEGUARDS} />
        <p className="pt-2">
          The clinical basis behind all of this is set out in the{' '}
          <Link href="/trust" className="text-ember underline decoration-ember/40 underline-offset-4">
            Trust Centre
          </Link>
          .
        </p>
      </Beat>

      <div className="mt-10">
        <ImagePlaceholder label="Safety protocols and clinical oversight" tint={['#4a4270', '#0e0c17']} aspect="21/9" />
      </div>
    </PageShell>
  )
}
