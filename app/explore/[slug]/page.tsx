import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExploreExperience } from '@/components/explore/ExploreExperience'
import {
  EXPLORE_TOPICS,
  getExploreTopic,
  getNextTopic,
  getPrevTopic,
} from '@/lib/explore'

/**
 * One route per beat of the home experience.
 *
 * Static at build time — there are six of them and the content is in the repo,
 * so there is nothing to render on demand.
 */
export function generateStaticParams() {
  return EXPLORE_TOPICS.map((topic) => ({ slug: topic.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = getExploreTopic(slug)
  if (!topic) return { title: 'Explore — NEXR' }

  return {
    title: `${topic.word} — NEXR`,
    description: topic.lede,
  }
}

export default async function ExploreTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = getExploreTopic(slug)
  if (!topic) notFound()

  const next = getNextTopic(slug)
  const prev = getPrevTopic(slug)

  return (
    <ExploreExperience
      topic={topic}
      next={{ slug: next.slug, word: next.word, index: next.index }}
      prev={{ slug: prev.slug, word: prev.word, index: prev.index }}
    />
  )
}
