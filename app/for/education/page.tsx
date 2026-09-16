import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'For Education — NEXR',
  description:
    'Helping students make mental wellbeing a more natural part of everyday life, with the same privacy and duty of care an institution needs.',
}

const WHAT_IT_CHANGES = [
  {
    title: 'A first step with no name attached',
    body: 'Students choose an avatar, not their student ID. The barrier that keeps someone from ever walking into a counselling office does not apply here.',
    icon: '🎓',
  },
  {
    title: 'Fits around a term, not a waiting list',
    body: 'MeloWorld and VR Wellness are available on the devices students already carry, whenever they need them — not by appointment.',
    icon: '📱',
  },
  {
    title: 'Duty of care, kept intact',
    body: 'Institutions retain the population-level view they need for safeguarding, without visibility into any individual student’s use.',
    icon: '🛡️',
  },
]

export default function ForEducationPage() {
  return (
    <PageShell
      eyebrow="For Education"
      beatId="clinical"
      align="center"
      title="Help students take the first step on their own terms."
      lede="Students are more likely to look something up privately at 11pm than to book an appointment during office hours. NEXR is built for that moment — private, anonymous and already on the device in their hand."
    >
      <Beat heading="What changes">
        <Tiles items={WHAT_IT_CHANGES} />
      </Beat>

      <Beat heading="Built for a campus, not a clinic">
        <p>
          MeloWorld gives students a private space to explore what they are
          feeling before they ever have to say it to another person. VR
          Wellness offers guided, clinically supervised experiences for the
          specific things that come up around exam pressure, social anxiety
          and adjustment — at a pace a trained professional sets, never
          forced.
        </p>
        <p>
          A short conversation covers how deployment works across a student
          body, what safeguarding teams can see, and how it complements the
          counselling service you already run rather than competing with it.
        </p>
      </Beat>

      <div className="flex flex-wrap items-center gap-6">
        <Link href="/contact" className="btn-primary group">
          Book a demo
        </Link>
        <Link
          href="/explore/gap"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
        >
          See the underlying problem &rarr;
        </Link>
      </div>
    </PageShell>
  )
}
