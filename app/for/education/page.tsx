import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Educational Institutes — NEXR',
  description:
    'Give students safe, engaging ways to understand their wellbeing, build emotional skills and access support when they need it.',
}

/**
 * WHERE NEXR FITS / EDUCATIONAL INSTITUTES.
 *
 * The script renames this audience again, from "Schools & Colleges" to
 * "Educational Institutes" — reflected here in the title and metadata. The
 * route stays at /for/education so nothing that already links here breaks;
 * only the visible name changes.
 *
 * As with the Workplaces and Healthcare pages, the brief marks this page's own
 * content "Sub pages - pending". The invented tiles and paragraphs an earlier
 * pass filled in have been removed; this carries only the given line.
 */
export default function ForEducationPage() {
  return (
    <PageShell
      eyebrow="Where NEXR Fits"
      beatId="vr-wellness"
      align="center"
      title="Educational Institutes"
      lede="Give students safe, engaging ways to understand their wellbeing, build emotional skills and access support when they need it."
    >
      <div className="flex justify-center">
        <Link href="/contact" className="btn-primary group">
          Book a Demo
        </Link>
      </div>
    </PageShell>
  )
}
