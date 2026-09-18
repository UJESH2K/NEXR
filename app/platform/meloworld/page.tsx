import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell, Beat } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'MeloWorld — NEXR',
  description:
    'An anonymous virtual environment where people can explore their wellbeing, move at their own pace and connect with qualified mental health professionals when they’re ready.',
}

/**
 * S5 — PRODUCTS / MELOWORLD, preceded by the S4 — ECOSYSTEM block, matching
 * the brief's own document order (Ecosystem sits directly before MeloWorld).
 *
 * The Ecosystem block here carries only the two lines given verbatim in the
 * brief — the headline and its intro sentence, plus the closing line. The
 * brief also has a middle sentence describing MeloWorld and VR Wellness
 * together that is not confirmed word-for-word; it is left out rather than
 * paraphrased, pending the exact wording.
 *
 * This page used to carry a set of stats, step cards and privacy tiles —
 * none of it sourced from the brief, all of it invented in an earlier pass.
 * The brief gives MeloWorld exactly one short block at this level; the long
 * form is the explore room this page already points to. So the fabricated
 * material is gone rather than left in place, and what remains is only what
 * was actually written: the headline, the body and the link onward.
 */
export default function MeloWorldPage() {
  return (
    <PageShell
      eyebrow="MeloWorld"
      beatId="meloworld"
      align="center"
      title="A private space to begin."
      lede="An anonymous virtual environment where people can explore their wellbeing, move at their own pace and connect with qualified mental health professionals when they're ready."
    >
      <Beat heading="Wellbeing, brought together.">
        <p>
          NEXR brings together technology, immersive experiences and professional support to
          create more ways for people to engage with wellbeing.
        </p>
        <p>
          Together, they create an ecosystem that can adapt across workplaces, educational
          institutions and healthcare settings.
        </p>
      </Beat>

      <div className="mt-14 flex justify-center">
        <Link href="/explore/meloworld" className="btn-primary group">
          Explore MeloWorld
        </Link>
      </div>
    </PageShell>
  )
}
