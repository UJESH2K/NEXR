import type { Metadata } from 'next'

import { pageMeta } from '@/lib/seo'
import { ExploreIndex } from '@/components/explore/ExploreIndex'
import { EXPLORE_INTRO } from '@/lib/explore'

export const metadata: Metadata = pageMeta({
  title: 'Explore',
  description: EXPLORE_INTRO.body,
  path: '/explore',
  image: '/models/imgs/gap.png',
})

export default function ExplorePage() {
  return <ExploreIndex />
}
