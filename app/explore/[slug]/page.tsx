import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExploreExperience } from '@/components/explore/ExploreExperience'
import {
  EXPLORE_TOPICS,
  getExploreTopic,
  getNextTopic,
  getPrevTopic,
} from '@/lib/explore'
import { pageMeta } from '@/lib/seo'

/**
 * One route per beat of the home experience.
 *
 * Static at build time — there are only a few of them and the content is in the repo,
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
  if (!topic) return { title: 'Explore' }

  // The room's own first paragraph is its description. A lede written as
  // several paragraphs contributes its first one, which is the sentence the
  // page itself leads with.
  const lede = Array.isArray(topic.lede) ? topic.lede[0] : topic.lede

  return pageMeta({
    // The room's name alone. The layout's template adds the brand, and a
    // title carrying the full headline as well runs past the length a search
    // result shows and gets cut mid-sentence.
    title: topic.word,
    description: lede,
    path: `/explore/${topic.slug}`,
    image: topic.hero.replace(/\.webp$/, '.png'),
  })
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
      next={{ slug: next.slug, word: next.word, face: next.face }}
      prev={{ slug: prev.slug, word: prev.word, face: prev.face }}
    />
  )
}
