/**
 * The explore rooms, assembled from lib/content.
 *
 * The words live in one file per Google Doc tab (see lib/content/README.md);
 * this file only puts the rooms in order and provides the lookups the routes
 * use. Edit copy in lib/content, not here.
 */

import { gap } from './content/rooms/gap'
import { belief } from './content/rooms/belief'
import { meloworld } from './content/rooms/meloworld'
import { vrWellness } from './content/rooms/vr-wellness'
import { EXPLORE_CONTACT } from './content/explore'
import type { ExploreTopic } from './content/types'

export type { ExploreChapter, ExploreHighlight, ExploreLink, ExploreTopic } from './content/types'
export { CLOSING } from './content/closing'
export { EXPLORE_INTRO } from './content/explore'

/** In the order the Explore page lists them. */
export const EXPLORE_TOPICS: ExploreTopic[] = [gap, belief, meloworld, vrWellness]

export type ExploreIndexItem = {
  key: string
  word: string
  note: string
  href: string
  image: string
}

/** The Explore page list: the four rooms, then Let's Talk. */
export const EXPLORE_INDEX: ExploreIndexItem[] = [
  ...EXPLORE_TOPICS.map((topic) => ({
    key: topic.slug,
    word: topic.word,
    note: topic.listNote,
    href: `/explore/${topic.slug}`,
    image: topic.hero,
  })),
  { key: 'contact', ...EXPLORE_CONTACT },
]

export const EXPLORE_SLUGS = EXPLORE_TOPICS.map((topic) => topic.slug)

export function getExploreTopic(slug: string) {
  return EXPLORE_TOPICS.find((topic) => topic.slug === slug)
}

/** The room after this one, wrapping at the end so the tour never dead-ends. */
export function getNextTopic(slug: string) {
  const i = EXPLORE_TOPICS.findIndex((topic) => topic.slug === slug)
  if (i === -1) return EXPLORE_TOPICS[0]
  return EXPLORE_TOPICS[(i + 1) % EXPLORE_TOPICS.length]
}

export function getPrevTopic(slug: string) {
  const i = EXPLORE_TOPICS.findIndex((topic) => topic.slug === slug)
  if (i === -1) return EXPLORE_TOPICS[EXPLORE_TOPICS.length - 1]
  return EXPLORE_TOPICS[(i - 1 + EXPLORE_TOPICS.length) % EXPLORE_TOPICS.length]
}
