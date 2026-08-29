import type { Metadata } from 'next'
import { Beat, PageShell } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Contact — NEXR',
  description:
    'Book a demo, talk to the team, or enquire about partnerships. Healthier organisations begin with people who feel safe enough to seek support.',
}

// TODO: replace with the real inbox before launch — this is a placeholder, not a
// confirmed address. Deliberately kept in one place so it's a one-line change.
const CONTACT_EMAIL = 'hello@nexr.com'

const ROUTES = [
  {
    title: 'Book a demo',
    body: 'See MeloWorld and VR Wellness end to end, and how the employee journey works in practice.',
    subject: 'Demo request',
  },
  {
    title: 'Talk to the team',
    body: 'Questions about privacy, clinical protocols or how this fits alongside an existing EAP.',
    subject: 'Question for the NEXR team',
  },
  {
    title: 'Partnerships',
    body: 'Clinical partners, educational institutions and organisations providing headsets for guided sessions.',
    subject: 'Partnership enquiry',
  },
]

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="06 / Contact"
      title="Healthier organisations begin with people who feel safe enough to seek support."
      lede="Let’s start the conversation."
    >
      <Beat heading="How can we help?">
        <ul className="grid gap-4 sm:grid-cols-3">
          {ROUTES.map((route) => (
            <li
              key={route.title}
              className="rounded-lg border border-bone/12 bg-ink/60 p-6"
            >
              <h3 className="font-display text-xl text-bone">{route.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sand/70">
                {route.body}
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(route.subject)}`}
                className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-lime"
              >
                Email us &rarr;
              </a>
            </li>
          ))}
        </ul>
      </Beat>

      <Beat heading="Direct">
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-lime underline decoration-lime/40 underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm text-sand/60">
          Sold to organisations — companies, educational institutions, HR and
          People &amp; Culture teams, founders, deans and student heads. Used by
          the people inside them.
        </p>
      </Beat>
    </PageShell>
  )
}
