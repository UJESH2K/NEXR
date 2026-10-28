import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Compass, EyeOff, LineChart, ShieldCheck, Sparkles, UserRound } from 'lucide-react'

import { pageMeta } from '@/lib/seo'
import { PageShell, SectionHeading } from '@/components/site/PageShell'
import { Accordion, FeatureLink } from '@/components/site/PageBlocks'

export const metadata: Metadata = pageMeta({
  title: 'Built on Trust',
  description:
    'Your wellbeing journey should begin with comfort, not concern. NEXR brings together anonymous access, immersive virtual spaces, and expert guidance.',
  path: '/trust',
  image: '/models/imgs/clinicallygrounded.png',
})

/**
 * Built on Trust. The headline and body are the Built on Trust block of the
 * Animation page tab; the safeguards below it are the document's own words for
 * each of the three things that block names.
 */

const PILLARS = [
  { label: 'Anonymous access', icon: EyeOff },
  { label: 'Immersive virtual spaces', icon: Sparkles },
  { label: 'Expert guidance', icon: ShieldCheck },
]

export default function TrustPage() {
  return (
    <PageShell
      eyebrow="Built on Trust"
      beatId="trust"
      image="/models/imgs/art/clinical.webp"
      title="Feel safe enough to take the first step."
      lede="Your wellbeing journey should begin with comfort, not concern. NEXR brings together anonymous access, immersive virtual spaces, and expert guidance to help you explore what’s on your mind without the pressure of being judged or sharing more than you’re comfortable with."
      actions={
        <Link href="#standards" className="btn-ghost group">
          Our Standards
          <ArrowUpRight size={14} className="rotate-90 transition-transform group-hover:translate-y-0.5" />
        </Link>
      }
    >
      <section data-route-beat>
        <ul className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map(({ label, icon: Icon }) => (
            <li
              key={label}
              data-beat-item
              className="flex items-center gap-4 rounded-full border border-white/10 bg-ink/50 py-3 pl-3 pr-6"
            >
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember/12 text-ember">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="text-[15px] font-medium text-bone/85">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="standards" data-route-beat className="scroll-mt-32 pt-20 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading>Your wellbeing journey should begin with comfort, not concern.</SectionHeading>
          </div>
          <Accordion
            items={[
              {
                id: 'identity',
                title: 'Leave your identity at the door',
                icon: <UserRound size={17} strokeWidth={1.6} />,
                body: 'MeloWorld lets people enter through an avatar, without a photograph or public-facing profile. This creates space to explore what’s on their mind without the added pressure of being recognized or having to explain themselves to others.',
              },
              {
                id: 'your-way',
                title: 'Your journey. Your way in',
                icon: <Compass size={17} strokeWidth={1.6} />,
                body: 'MeloWorld lets people explore virtual spaces, move at their own pace, and engage with what feels relevant to them. Whether they need a moment to pause, want to work through everyday challenges, or are ready to connect with a professional, they can find their own starting point.',
              },
              {
                id: 'insight',
                title: 'Get insight without intrusion',
                icon: <LineChart size={17} strokeWidth={1.6} />,
                body: 'Organizations and institutions can understand overall platform engagement without accessing individual identities. Decision-makers gain a clearer picture of how their well-being ecosystem is being used, while the privacy of the people using it remains protected.',
              },
            ]}
          />
        </div>
      </section>

      <section data-route-beat className="pt-20 md:pt-28">
        <FeatureLink
          title="A space to open up without the pressure"
          body="Through avatar-led experiences and confidential access to expert support, they can take the first step at their own pace, without the fear of being seen or judged."
          image="/models/imgs/art/meloworld-left.webp"
          href="/explore/meloworld"
          label="Explore Meloworld"
        />
      </section>
    </PageShell>
  )
}
