import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Workplaces — NEXR',
  description:
    'Create more approachable ways for employees to explore wellbeing, build healthier habits and access professional support.',
}

/**
 * S7 — WHERE NEXR FITS / WORKPLACES.
 *
 * The brief marks this page's own content "Sub pages - pending" — it gives
 * the one-line description that appears on the WORKPLACES card and nothing
 * past that yet. An earlier pass filled the rest of this page in anyway;
 * that invented material has been removed rather than kept as a placeholder
 * that reads as finished copy. This page carries only the given line until
 * the real content arrives.
 */
export default function ForWorkplacesPage() {
  return (
    <PageShell
      eyebrow="Where NEXR Fits"
      beatId="clinical"
      align="center"
      title="Workplaces"
      lede="Create more approachable ways for employees to explore wellbeing, build healthier habits and access professional support."
    >
      <div className="flex justify-center">
        <Link href="/contact" className="btn-primary group">
          Book a Demo
        </Link>
      </div>
    </PageShell>
  )
}
