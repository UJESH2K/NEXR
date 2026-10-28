import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

/**
 * Open to crawlers, with two exceptions.
 *
 * /scroll-demo is a development page and /api is not content, so neither
 * belongs in an index. Everything else is a page a visitor is meant to find.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
