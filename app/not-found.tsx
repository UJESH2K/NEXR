import { PageShell } from '@/components/site/PageShell'

/**
 * Next's built-in 404 renders on white, which is jarring inside a black site.
 * Routing it through PageShell keeps the page dark and gives visitors a way
 * back into the experience.
 */
export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title="This page doesn’t exist."
      lede="The link may be out of date. Everything NEXR does is one scroll away from the home experience."
    >
      <p className="leading-relaxed text-sand/75">
        Try the orbit on the{' '}
        <a
          href="/"
          className="text-lime underline decoration-lime/40 underline-offset-4"
        >
          home page
        </a>
        , or head straight to the{' '}
        <a
          href="/trust"
          className="text-lime underline decoration-lime/40 underline-offset-4"
        >
          Trust Centre
        </a>
        .
      </p>
    </PageShell>
  )
}
