import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Glasses, ShieldCheck, UserRound } from 'lucide-react'

import { pageMeta } from '@/lib/seo'
import { PageShell, SectionHeading } from '@/components/site/PageShell'
import { Contrast, FeatureLink, PillarTabs } from '@/components/site/PageBlocks'

export const metadata: Metadata = pageMeta({
  title: 'Our Approach',
  description:
    'Not everyone finds support in the same way. We combine immersive VR experiences, anonymity, and expert guidance to give people more choice in how they engage with wellbeing.',
  path: '/approach',
  image: '/models/imgs/OurApproach.png',
})

/**
 * Our Approach. Every line is from the content document: the Our Approach
 * block of the Animation page tab, with the three things it names drawn out
 * using the document's own words for each of them.
 */
export default function ApproachPage() {
  return (
    <PageShell
      eyebrow="Our Approach"
      beatId="approach"
      image="/models/imgs/art/approach.webp"
      kicker="Wellbeing doesn’t need another rulebook."
      title="Different people. Different needs. A more human approach."
      lede="Not everyone finds support in the same way. We combine immersive VR experiences, anonymity, and expert guidance to give people more choice in how they engage with wellbeing."
      actions={
        <Link href="#how" className="btn-ghost group">
          Discover Our Approach
          <ArrowUpRight size={14} className="rotate-90 transition-transform group-hover:translate-y-0.5" />
        </Link>
      }
    >
      <section data-route-beat>
        <Contrast
          less="Less pressure to take a prescribed path."
          more="More freedom to find what feels right for them."
        />
      </section>

      <section id="how" data-route-beat className="scroll-mt-32 pt-20 md:pt-28">
        <SectionHeading className="max-w-[22ch]">
          Immersive VR experiences, anonymity, and expert guidance
        </SectionHeading>
        <div className="mt-10">
          <PillarTabs
            tabs={[
              {
                id: 'vr',
                label: 'Immersive VR experiences',
                icon: <Glasses size={19} strokeWidth={1.6} />,
                body: 'Explore immersive VR experiences designed to help you practice relaxation, build confidence, and develop emotional resilience in a guided virtual environment.',
                image: '/models/imgs/art/vr-left.webp',
                link: { label: 'VR Wellness', href: '/explore/vr-wellness' },
              },
              {
                id: 'anonymity',
                label: 'Anonymity',
                icon: <UserRound size={19} strokeWidth={1.6} />,
                body: 'MeloWorld lets people enter through an avatar, without a photograph or public-facing profile. This creates space to explore what’s on their mind without the added pressure of being recognized or having to explain themselves to others.',
                image: '/models/imgs/art/meloworld-left.webp',
                link: { label: 'MeloWorld', href: '/explore/meloworld' },
              },
              {
                id: 'guidance',
                label: 'Expert guidance',
                icon: <ShieldCheck size={19} strokeWidth={1.6} />,
                body: 'Share what’s on your mind in an immersive VR environment, speak with professionals through virtual characters, and get guidance anonymously, without the pressure of revealing your identity or fear of being judged.',
                image: '/models/imgs/art/clinical.webp',
                link: { label: 'Our Standards', href: '/trust' },
              },
            ]}
          />
        </div>
      </section>

      <section data-route-beat className="pt-20 md:pt-28">
        <FeatureLink
          title="Wellbeing Should Meet You Where You Are"
          body="We all experience life differently. So why should the way we approach well-being be any different? We believe everyone deserves a way to begin that feels comfortable, personal, and right for them."
          image="/models/imgs/art/approach.webp"
          href="/explore/belief"
          label="Our Belief"
        />
      </section>
    </PageShell>
  )
}
