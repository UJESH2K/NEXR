import type { Metadata } from 'next'
import { Beat, PageShell, Tiles, Stats, ImagePlaceholder } from '@/components/site/PageShell'

export const metadata: Metadata = {
  title: 'Our Approach — NEXR',
  description:
    'Why awareness alone has not increased use of workplace wellbeing support, and the people-adaptive philosophy behind NEXR.',
}

const PRINCIPLES = [
  {
    title: 'Private by design',
    body: 'Anonymity is how psychological safety gets created. Nobody should have to choose between getting help and protecting their privacy.',
    icon: '🔒',
  },
  {
    title: 'Accessible first',
    body: 'The wider platform runs on the phones and laptops people already own. No headset purchase, no queue, no waiting room.',
    icon: '📱',
  },
  {
    title: 'Immersive engagement',
    body: 'Interactive, guided and safe experiences — not metaverse hype. Engaging enough to become part of everyday life.',
    icon: '🌀',
  },
  {
    title: 'Clinically grounded',
    body: 'Established psychological practice, delivered by trained professionals and tested in clinical contexts.',
    icon: '⚕️',
  },
]

const STATS = [
  { value: '76%', label: 'Employees hide struggles' },
  { value: '40%', label: 'EAP utilisation rate' },
  { value: '3×', label: 'ROI on wellbeing spend' },
  { value: '100%', label: 'Anonymous by default' },
]

export default function ApproachPage() {
  return (
    <PageShell
      eyebrow="Our Approach"
      title="The barrier isn't always the support. It's the way in."
      lede="For decades, wellbeing has been designed around systems, appointments and treatments. We believe it should be designed around people."
    >
      <Beat id="gap" heading="The workplace wellbeing gap">
        <p>
          Organisations today invest more in employee wellbeing than ever
          before. Yet burnout continues to rise, wellbeing programmes remain
          underused, and many employees hesitate to seek support because of
          stigma, fear of judgement or concerns around privacy.
        </p>
        <p>
          The issue is not a lack of therapists, apps or awareness. Work is
          faster, pressure is higher and burnout is normalised — everyone talks
          about mental health, but few ask for help. People hesitate because of
          judgement, visibility and stigma. Confidentiality concerns are what
          drive low utilisation of the support companies have already paid for.
        </p>
      </Beat>

      <Stats items={STATS} />

      <Beat id="belief" heading="Stop making people fit wellbeing. Make wellbeing fit people." accent="Support should adapt to people, not the other way around.">
        <p>
          Traditional wellbeing asks people to adapt to support.{' '}
          <span className="serif-accent text-bone">
            Support should adapt to people.
          </span>
        </p>
        <p>
          At NEXR, we believe workplace wellbeing should feel natural, private
          and engaging. When support is designed around people instead of
          processes, organisations create healthier cultures and employees are
          more likely to begin their wellbeing journey.
        </p>
        <p>
          The answer is a psychologically safe environment: anonymous,
          immersive, clinically guided and evidence-backed. Employees feel safer,
          companies build healthier cultures, and wellbeing becomes proactive
          rather than reactive — daily, intentional resilience-building before a
          crisis arrives.
        </p>
      </Beat>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImagePlaceholder label="Workplace wellbeing gap — visual" tint={['#2a2f26', '#0b0d0a']} aspect="4/3" />
        <ImagePlaceholder label="People-first design philosophy" tint={['#3b4426', '#0d0f0a']} aspect="4/3" />
      </div>

      <Beat heading="Design principles">
        <Tiles items={PRINCIPLES} />
      </Beat>

      <Beat heading="Our north star">
        <p className="serif-accent text-2xl text-bone">
          NEXR isn't reinventing mental wellness. It's reinventing how people
          access it.
        </p>
        <p>
          We don't just make wellbeing accessible. We make it engaging enough to
          become part of everyday life.
        </p>
      </Beat>

      <div className="mt-10">
        <ImagePlaceholder label="NEXR north star vision" tint={['#25342a', '#0b0d0a']} aspect="21/9" />
      </div>
    </PageShell>
  )
}
