import type { MetadataRoute } from 'next'

import { EXPLORE_TOPICS } from '@/lib/explore'
import { SITE_URL } from '@/lib/seo'

/**
 * Every page worth indexing, built from the data rather than listed by hand.
 *
 * The rooms come from EXPLORE_TOPICS, so adding or removing one — which the
 * script has already done once — updates the sitemap with it instead of
 * leaving a URL here pointing at a route that no longer exists.
 *
 * /scroll-demo is deliberately absent: it is a development page, and it says
 * so in its own robots directive.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/explore', priority: 0.9 },
    ...EXPLORE_TOPICS.map((topic) => ({
      path: `/explore/${topic.slug}`,
      priority: 0.8,
    })),
    { path: '/approach', priority: 0.8 },
    { path: '/trust', priority: 0.8 },
    { path: '/contact', priority: 0.6 },
  ]

  return routes.map(({ path, priority }) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority,
  }))
}
