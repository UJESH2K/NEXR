import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, EyeOff, LineChart, MessageCircleHeart, ShieldCheck, Sparkles, UserRound } from 'lucide-react'

import { pageMeta } from '@/lib/seo'
import { TRUST } from '@/lib/content/trust'
import { PageShell, SectionHeading } from '@/components/site/PageShell'
import { SafeguardList } from '@/components/site/PageBlocks'

export const metadata: Metadata = pageMeta({
  title: 'Built on Trust',
  description: TRUST.lede,
  path: '/trust',
  image: '/models/imgs/clinicallygrounded.png',
})

const PILLAR_ICONS = [EyeOff, Sparkles, ShieldCheck]
const SAFEGUARD_ICONS = {
  identity: <UserRound size={17} strokeWidth={1.6} />,
  'your-terms': <MessageCircleHeart size={17} strokeWidth={1.6} />,
  insight: <LineChart size={17} strokeWidth={1.6} />,
} as const

/** Copy: lib/content/trust.ts (doc tab "Trust"). */
export default function TrustPage() {
  return (
    <PageShell
      eyebrow={TRUST.eyebrow}
      beatId="trust"
      image="/models/imgs/art/clinical.webp"
      title={TRUST.title}
      lede={TRUST.lede}
      actions={
        <Link href={TRUST.cta.href} className="btn-ghost group">
          {TRUST.cta.label}
          <ArrowUpRight size={14} className="rotate-90 transition-transform group-hover:translate-y-0.5" />
        </Link>
      }
    >
      <section data-route-beat>
        <ul className="grid gap-4 sm:grid-cols-3">
          {TRUST.pillars.map((label, i) => {
            const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length]
            return (
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
            )
          })}
        </ul>
      </section>

      <section id="standards" data-route-beat className="scroll-mt-32 pt-20 md:pt-28">
        <SectionHeading>{TRUST.safeguards.heading}</SectionHeading>
        <div className="mt-10">
          <SafeguardList
            items={TRUST.safeguards.items.map((item) => ({
              ...item,
              icon: SAFEGUARD_ICONS[item.id as keyof typeof SAFEGUARD_ICONS],
            }))}
          />
        </div>
      </section>
    </PageShell>
  )
}
