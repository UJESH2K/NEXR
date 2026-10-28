import type { Metadata } from 'next'
import { BriefcaseBusiness, GraduationCap, Stethoscope } from 'lucide-react'

import { pageMeta } from '@/lib/seo'
import { CLOSING } from '@/lib/explore'
import { PageShell, SectionHeading } from '@/components/site/PageShell'
import { DemoForm } from '@/components/site/PageBlocks'

export const metadata: Metadata = pageMeta({
  title: 'Book A Demo',
  description: CLOSING.body,
  path: '/contact',
  image: '/models/imgs/letsconnect.png',
})

const SETTINGS = [
  { label: 'Workplaces', icon: BriefcaseBusiness, href: '/explore/vr-wellness#workplaces' },
  { label: 'Educational Institutes', icon: GraduationCap, href: '/explore/vr-wellness#education' },
  { label: 'Healthcare', icon: Stethoscope, href: '/explore/vr-wellness#healthcare' },
]

/**
 * Let's Talk. The Let's Talk block of the Animation page tab, and a demo
 * request that composes an email (there is no form backend).
 */
export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Let’s Talk"
      beatId="contact"
      image="/models/imgs/art/approach.webp"
      title={CLOSING.heading}
      lede={CLOSING.body}
      closing={false}
    >
      <section data-route-beat className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <SectionHeading>Book A Demo</SectionHeading>
          <ul className="mt-8 space-y-3">
            {SETTINGS.map(({ label, icon: Icon, href }) => (
              <li key={label} data-beat-item>
                <a
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/40 p-4 transition-colors hover:border-white/25"
                >
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember/12 text-ember">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <span className="text-[15px] font-medium text-bone/85 transition-colors group-hover:text-ember">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <DemoForm />
      </section>
    </PageShell>
  )
}
