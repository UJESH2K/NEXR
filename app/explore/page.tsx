import type { Metadata } from 'next'

import { pageMeta } from '@/lib/seo'
import { ExploreIndex } from '@/components/explore/ExploreIndex'

export const metadata: Metadata = pageMeta({
  title: 'Explore',
  description:
    'Explore five rooms, each designed around a different way to engage with wellbeing. Start with what matters to you, and discover an approach that feels right.',
  path: '/explore',
  image: '/models/imgs/gap.png',
})

export default function ExplorePage() {
  return <ExploreIndex />
}
