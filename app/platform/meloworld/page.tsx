import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'MeloWorld — NEXR',
  description:
    'A private, avatar-led space where employees can take a first step toward support without being recognised.',
}

const PRIVACY = [
  {
    title: 'A unique ID, not your name',
    body: 'Every employee receives an ID instead of using their real identity. That ID is what the platform knows them by.',
  },
  {
    title: 'HR cannot see who uses it',
    body: 'The employer provides access, not visibility. Usage is not reportable back to People teams or managers.',
  },
  {
    title: 'Conversations stay closed',
    body: 'What happens between a person and their psychologist stays between them, exactly as in a normal therapy session.',
  },
]

export default function MeloWorldPage() {
  return (
    <PageShell
      eyebrow="03 / The Platform"
      title="MeloWorld"
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

      <Beat heading="What employers can and cannot see">
        <Tiles items={PRIVACY} />
      </Beat>

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
