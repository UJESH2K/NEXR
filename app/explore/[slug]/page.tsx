import { existsSync } from 'node:fs'
import { join } from 'node:path'
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

  // Artwork is dropped into /public by path; only point at the files that are
  // actually there, so a missing one never costs a failed request.
  const gallery = topic.gallery.map((item) =>
    item.src || existsSync(join(process.cwd(), 'public', item.slot)) ? { ...item, src: item.src ?? item.slot } : item,
  )

  return (
    <ExploreExperience
      topic={{ ...topic, gallery }}
      next={{ slug: next.slug, word: next.word, index: next.index }}
      prev={{ slug: prev.slug, word: prev.word, index: prev.index }}
    />
  )
}
