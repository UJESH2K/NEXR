import type { Metadata } from 'next'
import { Beat, PageShell, ImagePlaceholder } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Contact — NEXR',
  description:
    'Book a demo, talk to the team, or enquire about partnerships. Healthier organisations begin with people who feel safe enough to seek support.',
}

const CONTACT_EMAIL = 'hello@nexr.com'

const ROUTES = [
  {
    title: 'Book a demo',
    body: 'See MeloWorld and VR Wellness end to end, and how the employee journey works in practice.',
    subject: 'Demo request',
    icon: '🎯',
    tint: ['#52665a', '#101815'] as [string, string],
  },
  {
    title: 'Talk to the team',
    body: 'Questions about privacy, clinical protocols or how this fits alongside an existing EAP.',
    subject: 'Question for the NEXR team',
    icon: '💬',
    tint: ['#4a4270', '#0e0c17'] as [string, string],
  },
  {
    title: 'Partnerships',
    body: 'Clinical partners, educational institutions and organisations providing headsets for guided sessions.',
    subject: 'Partnership enquiry',
    icon: '🤝',
    tint: ['#6b7a2e', '#12150a'] as [string, string],
  },
]

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="06 / Contact"
      title="Healthier organisations begin with people who feel safe enough to seek support."
      lede="Let's start the conversation."
    >
      <Beat heading="How can we help?">
        <ul className="grid gap-4 sm:grid-cols-3">
          {ROUTES.map((route) => (
            <li
              key={route.title}
              data-beat-item
              className="group relative overflow-hidden rounded-lg border border-bone/12 bg-ink/60 p-6 transition-all duration-500 hover:border-lime/30 hover:bg-ink/80 hover:shadow-lg hover:shadow-lime/5"
            >
              {/* Gradient background on hover */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${route.tint[0]}33, ${route.tint[1]}33)`,
                }}
              />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime/10 text-xl">
                  {route.icon}
                </div>
                <h3 className="font-display text-xl text-bone transition-colors group-hover:text-lime">{route.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-sand/70">
                  {route.body}
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(route.subject)}`}
                  className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-bone/60 transition-colors hover:text-lime"
                >
                  Email us &rarr;
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Beat>

      <div className="grid gap-6 lg:grid-cols-3">
        <ImagePlaceholder label="Book a demo" tint={['#52665a', '#101815']} aspect="4/3" />
        <ImagePlaceholder label="Talk to us" tint={['#4a4270', '#0e0c17']} aspect="4/3" />
        <ImagePlaceholder label="Partner with us" tint={['#6b7a2e', '#12150a']} aspect="4/3" />
      </div>

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

      <div className="mt-10">
        <ImagePlaceholder label="NEXR headquarters" tint={['#2a2f26', '#0b0d0a']} aspect="21/9" />
      </div>
    </PageShell>
  )
}
