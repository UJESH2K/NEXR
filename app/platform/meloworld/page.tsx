import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles, Stats, ImagePlaceholder, StepCard } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'MeloWorld — NEXR',
  description:
    'A private, avatar-led space where employees can take a first step toward support without being recognised.',
}

const PRIVACY = [
  {
    title: 'A unique ID, not your name',
    body: 'Every employee receives an ID instead of using their real identity. That ID is what the platform knows them by.',
    icon: '🪪',
  },
  {
    title: 'HR cannot see who uses it',
    body: 'The employer provides access, not visibility. Usage is not reportable back to People teams or managers.',
    icon: '🛡️',
  },
  {
    title: 'Conversations stay closed',
    body: 'What happens between a person and their psychologist stays between them, exactly as in a normal therapy session.',
    icon: '🤐',
  },
]

const STATS = [
  { value: '85%', label: 'Feel safer anonymous' },
  { value: '0', label: 'Personal data shared' },
  { value: '24/7', label: 'Available always' },
  { value: '10min', label: 'Average first session' },
]

export default function MeloWorldPage() {
  return (
    <PageShell
      eyebrow="03 / The Platform"
      title="MeloWorld"
      mark="/brand/meloworld-mark.webp"
      lede="A virtual mental-health space where a person can interact with therapists and mental-health professionals through an avatar rather than their real identity."
    >
      <Beat heading="A first step that costs nothing to take">
        <p>
          The platform provides a private, anonymous first step toward support.
          Anonymity lowers the emotional barrier: people can open up without
          fear of being recognised or judged, which is the single largest reason
          existing workplace wellbeing programmes go unused.
        </p>
        <p>
          It runs on the phones and laptops people already have. There is
          nothing to buy, no headset required, and no visible queue to join.
        </p>
      </Beat>

      <Stats items={STATS} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImagePlaceholder label="MeloWorld avatar interface" tint={['#52665a', '#101815']} aspect="16/10" />
        <ImagePlaceholder label="Anonymous therapy session" tint={['#4a5e52', '#0e1412']} aspect="16/10" />
      </div>

      <Beat heading="How it works">
        <div className="space-y-8">
          <StepCard number={1} title="Receive your anonymous ID">
            <p>On signup, the system generates a unique identifier. No names, no email addresses, no traceable credentials.</p>
          </StepCard>
          <StepCard number={2} title="Enter MeloWorld">
            <p>Open the platform on any phone or laptop. The avatar-based interface removes the clinical coldness of traditional therapy apps.</p>
          </StepCard>
          <StepCard number={3} title="Connect with a professional">
            <p>A trained psychologist guides the session through the avatar. The conversation is real, the support is clinical, the identity is protected.</p>
          </StepCard>
          <StepCard number={4} title="Continue on your terms">
            <p>Return for check-ins, coping exercises, or deeper work — all匿名, all at your pace.</p>
          </StepCard>
        </div>
      </Beat>

      <Beat heading="What employers can and cannot see">
        <Tiles items={PRIVACY} />
      </Beat>

      <div className="mt-10">
        <ImagePlaceholder label="Privacy architecture diagram" tint={['#52665a', '#101815']} aspect="21/9" />
      </div>

      <Beat heading="Where it leads">
        <p>
          MeloWorld is the entry point to one connected ecosystem. For people who
          want to go further, guided immersive work is available through{' '}
          <Link href="/platform/vr-wellness" className="text-lime underline decoration-lime/40 underline-offset-4">
            VR Wellness
          </Link>
          , introduced later in the journey rather than as the headline.
        </p>
        <p>
          Mental wellness is not one event. Pressure and life changes continue,
          so NEXR is built to be ongoing support for check-ins, coping skills and
          growth — not only a crisis intervention.
        </p>
      </Beat>
    </PageShell>
  )
}
