import type { Metadata } from 'next'
import { Glasses, ShieldCheck, Sparkles } from 'lucide-react'

import { pageMeta } from '@/lib/seo'
import { APPROACH } from '@/lib/content/approach'
import { PageShell, SectionHeading } from '@/components/site/PageShell'
import { Contrast, FeatureLink, PillarTabs } from '@/components/site/PageBlocks'

export const metadata: Metadata = pageMeta({
  title: 'Our Approach',
  description: APPROACH.lede,
  path: '/approach',
  image: '/models/imgs/OurApproach.png',
})

const ICONS = {
  vr: <Glasses size={19} strokeWidth={1.6} />,
  meloworld: <Sparkles size={19} strokeWidth={1.6} />,
  guidance: <ShieldCheck size={19} strokeWidth={1.6} />,
} as const

/** Copy: lib/content/approach.ts (doc tab "Our approach page"). */
export default function ApproachPage() {
  return (
    <PageShell
      eyebrow={APPROACH.eyebrow}
      beatId="approach"
      image="/models/imgs/art/approach.webp"
      kicker={APPROACH.kicker}
      title={APPROACH.title}
      lede={APPROACH.lede}
    >
      <section data-route-beat>
        <Contrast less={APPROACH.contrast.less} more={APPROACH.contrast.more} />
      </section>

      <section id="ways" data-route-beat className="scroll-mt-32 pt-20 md:pt-28">
        <SectionHeading className="max-w-[20ch]">{APPROACH.ways.heading}</SectionHeading>
        <div className="mt-10">
          <PillarTabs
            label={APPROACH.ways.heading}
            tabs={APPROACH.ways.items.map((item) => ({
              id: item.id,
              label: item.label,
              icon: ICONS[item.id as keyof typeof ICONS],
              body: item.body,
              image: item.image,
              link: item.cta,
            }))}
          />
        </div>
      </section>

      <section data-route-beat className="pt-20 md:pt-28">
        <FeatureLink
          title={APPROACH.belief.title}
          body={APPROACH.belief.body}
          image={APPROACH.belief.image}
          href={APPROACH.belief.cta.href}
          label={APPROACH.belief.cta.label}
        />
      </section>
    </PageShell>
  )
}
