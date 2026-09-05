import type { Metadata } from 'next'
import { ExploreIndex } from '@/components/explore/ExploreIndex'

export const metadata: Metadata = {
  title: 'Explore — NEXR',
  description:
    'Six rooms off the NEXR experience: the wellbeing gap, our belief, MeloWorld, VR Wellness, the clinical grounding, and starting a conversation.',
}

export default function ExplorePage() {
  return <ExploreIndex />
}
