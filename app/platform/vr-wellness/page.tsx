import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'VR Wellness — NEXR',
  description:
    'Guided virtual experiences designed around specific wellbeing, learning and therapeutic needs, from relaxation and emotional regulation to confidence-building and gradual exposure.',
}

/**
 * S6 — PRODUCTS / VR WELLNESS.
 *
 * Same trim as the MeloWorld page and for the same reason: the stats,
 * step cards and safeguard tiles that used to sit here were never in the
 * brief. What the brief actually gives this page is one short block, and the
 * explore room already carries the long form.
 */
export default function VrWellnessPage() {
  return (
    <PageShell
      eyebrow="VR Wellness"
      beatId="vr-wellness"
      align="center"
      title="Experience it before you face it."
      lede="Guided virtual experiences designed around specific wellbeing, learning and therapeutic needs, from relaxation and emotional regulation to confidence-building and gradual exposure."
    >
      <div className="flex justify-center">
        <Link href="/explore/vr-wellness" className="btn-primary group">
          Explore VR Wellness
        </Link>
      </div>
    </PageShell>
  )
}
