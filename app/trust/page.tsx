import type { Metadata } from 'next'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Trust Centre — NEXR',
  description:
    'Where clinical expertise meets immersive technology: the professionals, the evidence base, and exactly what employers can and cannot see.',
}

const CREDIBILITY = [
  {
    title: 'Developed with mental health professionals',
    body: 'The team includes experienced psychologists and mental-health professionals, with workplace insight from HR leadership.',
  },
  {
    title: 'Tested in clinical practice',
    body: 'The approaches use established psychological practices and have been used in hospital contexts, including Spandan Hospital.',
  },
  {
    title: 'Designed for modern workplaces',
    body: 'Built for engagement, burnout, retention and psychological safety — not as another generic EAP or meditation product.',
  },
]

export default function TrustPage() {
  return (
    <PageShell
      eyebrow="05 / Trust Centre"
      title="Where clinical expertise meets immersive technology."
      lede="Technology supports credibility; it does not replace it. Every session is handled by trained professionals working to real clinical protocols."
    >
      <Beat heading="Credibility">
        <Tiles items={CREDIBILITY} />
      </Beat>

      <Beat heading="Clinical and safety basis">
        <p>
          Sessions are handled by trained psychologists and mental-health
          professionals able to identify and respond to serious situations
          through appropriate clinical protocols. The psychologist responds as
          they would in a physical clinic — while the person’s identity remains
          protected from their employer.
        </p>
        <p>
          Immersive work is preceded by assessment and consent, guided by a
          professional throughout, and stopped or adapted if it proves
          unsuitable.
        </p>
      </Beat>

      <Beat heading="What employers see">
        <p>
          The employer provides access, not visibility. Employees are identified
          to the platform by a unique ID rather than their name; HR and employers
          cannot see who uses it, and conversations remain confidential between
          the individual and their psychologist.
        </p>
      </Beat>

      <Beat heading="Why not an existing therapy app">
        <p>
          Most platforms focus on providing therapy. NEXR focuses on removing the
          barriers that stop people seeking help in the first place — through
          anonymity, immersive experiences and workplace-focused design.
        </p>
        <p className="serif-accent text-xl text-bone">
          An immersive workplace wellbeing ecosystem, not a crisis line.
        </p>
      </Beat>
    </PageShell>
  )
}
