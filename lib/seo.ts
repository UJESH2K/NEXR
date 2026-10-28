/**
 * One source for everything search engines and link previews read.
 *
 * Every route defines its own title, description and canonical URL, and they
 * are built here rather than typed out ten times: a page that forgets its
 * canonical is a page that competes with itself in search results, and a
 * description copied by hand drifts from the approved copy it came from.
 *
 * **Descriptions are never written for SEO.** Each one is the page's own
 * approved line, trimmed to length if it has to be. Nothing on this site says
 * anything to a crawler that it does not say to a reader.
 */

export const SITE_NAME = 'NEXR'

/**
 * The public origin, used for canonicals, Open Graph URLs and the sitemap.
 *
 * Set `NEXT_PUBLIC_SITE_URL` in the deployment environment to the real domain.
 * The fallback matches the address the site already publishes
 * (`lib/contact.ts`) so nothing is invented here, but it is a fallback: until
 * the variable is set, canonicals point at that origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nexr.com'
).replace(/\/+$/, '')

/** Google truncates around 160 characters; a longer line is cut mid-word. */
export function clamp(text: string, max = 158) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const stop = cut.lastIndexOf(' ')
  return `${cut.slice(0, stop > 80 ? stop : max).trimEnd()}…`
}

export function canonical(path: string) {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

/**
 * Title, description, canonical and the social cards for one route.
 *
 * `title` is the bare page name: the layout's template adds the site name, so
 * passing "MeloWorld" renders "MeloWorld — NEXR" and the Open Graph card gets
 * the same string rather than a second, differently worded one.
 */
export function pageMeta({
  title,
  description,
  path,
  image = '/models/imgs/gap.png',
}: {
  title: string
  description: string
  path: string
  image?: string
}) {
  const url = canonical(path)
  const text = clamp(description)

  return {
    title,
    description: text,
    alternates: { canonical: url },
    openGraph: {
      type: 'website' as const,
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description: text,
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} — ${SITE_NAME}`,
      description: text,
      images: [image],
    },
  }
}
