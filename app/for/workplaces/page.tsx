import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'For Workplaces — NEXR',
  description:
    'Private, engaging ways for employees to access and explore wellbeing, built for organisations rather than bolted onto them.',
}

const WHAT_IT_CHANGES = [
  {
    title: 'From unused to opened',
    body: 'Anonymity removes the reason people never install the app you already pay for. That first step is the one that was missing.',
    icon: '🔓',
  },
  {
    title: 'From a benefit to a habit',
    body: 'MeloWorld and VR Wellness are engaging enough to return to, not just at a crisis — check-ins and coping skills built into a normal week.',
    icon: '🔁',
  },
  {
    title: 'Population-level, not person-level',
    body: 'You see engagement and outcomes across the organisation. You never see who is using it, which is exactly what makes people willing to.',
    icon: '📊',
  },
]

export default function ForWorkplacesPage() {
  return (
    <PageShell
      eyebrow="For Workplaces"
      beatId="clinical"
      align="center"
      title="Wellbeing your people actually use."
      lede="Most organisations already have an EAP. The problem was never the budget line — it was that almost nobody opened it. NEXR is designed to close that gap, not add another line item next to it."
    >
      <Beat heading="What changes">
        <Tiles items={WHAT_IT_CHANGES} />
      </Beat>

      <Beat heading="How it fits what you already run">
        <p>
          NEXR sits alongside an existing EAP or wellbeing programme rather
          than replacing it — a private, anonymous first step through
          MeloWorld, with guided VR Wellness available for people ready to go
          further. Deployment respects what an organisation can actually do:
          existing devices, existing policies, existing duty of care.
        </p>
        <p>
          A forty-minute demo covers what deployment looks like, what you
          would be able to measure, and how it reads against the utilisation
          you are seeing today.
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
