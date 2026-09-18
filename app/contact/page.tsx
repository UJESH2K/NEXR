import type { Metadata } from 'next'
import { PageShell } from '@/components/site/PageShell'
import { CONTACT_EMAIL } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Contact — NEXR',
  description:
    'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
}

/**
 * CLOSING CTA — common for all sub pages.
 *
 * This page used to carry three invented "how can we help" routes with their
 * own fabricated descriptions, plus a paragraph about who NEXR is sold to that
 * was never in the brief. Trimmed to the one block the brief actually gives a
 * contact page: the closing headline, its note, and the italic line under it.
 * The direct email address is a functional necessity a text brief cannot
 * supply on its own, so it stays — everything sitting around it does not.
 */
export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Let's Talk"
      beatId="contact"
      align="center"
      title="The next way into wellbeing starts here."
      lede="Discover how NEXR can bring a new approach to your organisation, institution or practice."
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="btn-primary group"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="font-display text-lg italic text-bone/60">
          Better wellbeing starts when the way in feels right.
        </p>
      </div>
    </PageShell>
  )
}
