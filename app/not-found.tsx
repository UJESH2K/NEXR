import Link from 'next/link'
import { PageShell } from '@/components/site/PageShell'

/**
 * Next's built-in 404 renders on white, which is jarring inside a dark site.
 * Routing it through PageShell keeps the page dark and gives a way back.
 */
export default function NotFound() {
  return (
    <PageShell
      eyebrow="Page not found"
      beatId="nexr"
      image="/models/imgs/art/approach.webp"
      title="This page doesn’t exist."
      lede="The link may be out of date. Head back to the experience, or pick a room to explore."
      closing={false}
      actions={
        <Link href="/explore" className="btn-primary">
          Explore
        </Link>
      }
    >
      <span />
    </PageShell>
  )
}
