import type { Metadata } from 'next'
import Link from 'next/link'
import { Beat, PageShell, Tiles } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'For Healthcare — NEXR',
  description:
    'Immersive tools designed to complement the work of mental health professionals, not replace their judgement.',
}

const WHAT_IT_CHANGES = [
  {
    title: 'A guided tool, never a diagnosis',
    body: 'VR Wellness runs under the guidance of a trained professional at every step, adjusted or stopped whenever they decide an experience is unsuitable.',
    icon: '⚕️',
  },
  {
    title: 'An earlier first contact',
    body: 'MeloWorld gives someone a private, anonymous way to reach a professional before their situation becomes a crisis referral.',
    icon: '🤝',
  },
  {
    title: 'Evidence stays central',
    body: 'Every experience is developed with mental health professionals and tested in clinical practice — technology is the how, never the headline.',
    icon: '🔬',
  },
]

export default function ForHealthcarePage() {
  return (
    <PageShell
      eyebrow="For Healthcare"
      beatId="clinical"
      align="center"
      title="Immersive tools built around clinical judgement, not instead of it."
      lede="VR Wellness and MeloWorld exist to extend what a mental health professional can do — assessment, consent and supervision sit in front of every session, and the clinician's judgement always overrides the technology."
    >
      <Beat heading="What changes">
        <Tiles items={WHAT_IT_CHANGES} />
      </Beat>

      <Beat heading="Where it fits into a care pathway">
        <p>
          Guided exposure work for phobias, public speaking, flying and social
          anxiety runs through established behavioural and cognitive
          technique, delivered through VR rather than replacing the
          professional delivering it. Sessions are preceded by assessment and
          informed consent, monitored throughout, and stopped or adapted the
          moment that is the right call.
        </p>
        <p>
          The approaches used have been tested in hospital contexts. A
          conversation with the team covers the clinical basis in full, and
          what integrating it into an existing pathway would look like.
        </p>
      </Beat>

      <div className="flex flex-wrap items-center gap-6">
        <Link href="/contact" className="btn-primary group">
          Book a demo
        </Link>
        <Link
          href="/trust"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45 transition-colors hover:text-ember"
        >
          Read the clinical basis &rarr;
        </Link>
      </div>
    </PageShell>
  )
}
