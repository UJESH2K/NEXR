import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'VR Wellness — NEXR',
  description:
    'Guided, clinically supervised immersive experiences that help people work through challenges and build resilience at their own pace.',
}

const SAFEGUARDS = [
  {
    title: 'Assessment and consent first',
    body: 'No immersive session begins without a prior assessment and the person’s informed consent.',
  },
  {
    title: 'Monitored throughout',
    body: 'A trained mental-health professional guides every session and watches how the person is responding.',
  },
  {
    title: 'Stopped or adapted',
    body: 'If an experience is unsuitable it is changed or ended. The goal is safe, paced progress — never forcing an experience.',
  },
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

      <Beat heading="How sessions are kept safe">
        <Tiles items={SAFEGUARDS} />
        <p className="pt-2">
          The clinical basis behind all of this is set out in the{' '}
          <Link href="/trust" className="text-lime underline decoration-lime/40 underline-offset-4">
            Trust Centre
          </Link>
          .
        </p>
      </Beat>
    </PageShell>
  )
}
