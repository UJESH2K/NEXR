import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Healthcare — NEXR',
  description:
    'Extend the toolkit available to mental health professionals with immersive environments and digital experiences that can complement existing care.',
}

/**
 * S7 — WHERE NEXR FITS / HEALTHCARE.
 *
 * Same trim as the Workplaces and Schools & Colleges pages: the brief marks
 * this page's own content "Sub pages - pending", so the invented tiles and
 * paragraphs an earlier pass wrote in have been removed. This carries only
 * the one line the brief actually gives it.
 */
export default function ForHealthcarePage() {
  return (
    <PageShell
      eyebrow="Where NEXR Fits"
      beatId="clinical"
      align="center"
      title="Healthcare"
      lede="Extend the toolkit available to mental health professionals with immersive environments and digital experiences that can complement existing care."
    >
      <div className="flex justify-center">
        <Link href="/contact" className="btn-primary group">
          Book a Demo
        </Link>
      </div>
    </PageShell>
  )
}
