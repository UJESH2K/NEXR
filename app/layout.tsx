import type { Metadata, Viewport } from 'next'
import { Chakra_Petch, DM_Mono, Manrope, Playfair_Display } from 'next/font/google'
import { CanvasHost } from '@/components/r3f/CanvasHost'
import { ChromeScrim } from '@/components/site/ChromeScrim'
import { RouteBackdrop } from '@/components/site/RouteBackdrop'
import { CursorFollower } from '@/components/ui/cursor-follower'
import { ContactModal } from '@/components/site/ContactModal'
import { Curtain } from '@/components/site/Curtain'
import { Header } from '@/components/site/Header'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SkipLink } from '@/components/site/SkipLink'
import { SiteGuide } from '@/components/site/SiteGuide'
import { ScrollProvider } from '@/lib/ScrollProvider'
import { CONTACT_EMAIL } from '@/lib/contact'
import { SITE_NAME, SITE_URL, clamp } from '@/lib/seo'
import './globals.css'

// These CSS variables are what globals.css binds --font-sans/mono/display to.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

/**
 * The numerals.
 *
 * Every index on the site — the beat counters, the chapter numbers, the rail
 * ends — used to be set in the body mono at 10px, which is a thin, wide face.
 * At that weight the brand orange had nothing to sit on and the numbers read as
 * faint marks rather than as part of the design. Chakra Petch is squared,
 * technical and heavy at 700 while staying narrow, so the same slot holds a
 * number with enough mass for the colour and its highlight to register.
 */
const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-chakra',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

/**
 * The site-wide defaults. Every route then overrides title, description and
 * canonical for itself — see lib/seo.ts.
 *
 * `metadataBase` is what makes a relative canonical or Open Graph image
 * resolve to an absolute URL. Without it Next emits relative preview URLs,
 * which most social crawlers simply drop.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NEXR — Step into wellbeing. On your terms.',
    // Pages pass a bare name ("MeloWorld") and get the brand added here, so
    // the suffix is written once instead of on every route.
    template: `%s — ${SITE_NAME}`,
  },
  description: clamp(
    'Experience a more private way to prioritize your well-being through immersive VR experiences and anonymous access to expert support, all designed around you.',
  ),
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'NEXR — Step into wellbeing. On your terms.',
    description: clamp(
      'Experience a more private way to prioritize your well-being through immersive VR experiences and anonymous access to expert support, all designed around you.',
    ),
    url: SITE_URL,
    images: [{ url: '/models/imgs/gap.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXR — Step into wellbeing. On your terms.',
    description: clamp(
      'Experience a more private way to prioritize your well-being through immersive VR experiences and anonymous access to expert support, all designed around you.',
    ),
    images: ['/models/imgs/gap.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

/**
 * Who the site belongs to, in the one form search engines read directly.
 *
 * Only facts already published on the site go in here: the name, the home
 * page, the mark and the address from lib/contact.ts. No claims, counts or
 * ratings — structured data that says more than the page does is the kind
 * search engines penalise.
 */
const ORGANISATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/meloworld-mark.webp`,
  email: CONTACT_EMAIL,
}

// themeColor lives here rather than in metadata — Next moved it in v14.
export const viewport: Viewport = {
  themeColor: '#1b0f08',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // The scene is full-bleed, so the page has to reach under the notch and the
  // home indicator rather than being letterboxed between them. Everything that
  // must stay clear of those bars pads itself with env(safe-area-inset-*) —
  // see the safe-area rules in globals.css.
  viewportFit: 'cover',
  // Deliberately not capping maximumScale: pinch-zoom is the only way some
  // people can read a page, and taking it away to tidy up a layout is not a
  // trade worth making.
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmMono.variable} ${playfair.variable} ${chakra.variable}`}
      suppressHydrationWarning
    >
      {/* The background here matters: it is what fills the frame between the
          first byte and React mounting, and it matches the load curtain so that
          gap reads as part of the design rather than as a flash. */}
      <body>
        {/*
          Runs before anything else on the page, and it has to.

          Browsers restore the previous scroll offset on reload, and this page
          is eighteen viewports tall — so a refresh taken anywhere past the
          opening frame reopened the site midway through a beat, with the held
          intro and its Explore control already scrolled away. Lenis cannot
          prevent that: restoration happens around the load event, well after
          React has mounted, so anything done in an effect is racing it.

          Opting out has to be synchronous and early, which means an inline
          script rather than a component. The scrollTo covers the case where the
          browser had already moved before this line ran.
        */}
        {/* Also marks the route before first paint, so CSS can keep the load
            curtain on the home page only — see Curtain. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{history.scrollRestoration='manual'}catch(e){}window.scrollTo(0,0);document.documentElement.dataset.route=location.pathname==='/'?'home':'page'",
          }}
        />
        {/* The load curtain is server HTML, so it is in the very first paint —
            there is no frame of the site before it. Preloader drives it. */}
        <script
          type="application/ld+json"
          // The payload is a constant defined above, not anything a visitor
          // can influence, so there is nothing here to escape.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION_JSON_LD) }}
        />
        <Curtain />
        <SkipLink />
        <CursorFollower />
        <ScrollProvider>
          <CanvasHost />
          {/* Sibling of the canvas, not a child of <main>: main carries its own
              z-index and would trap this above the content it sits behind. */}
          <ChromeScrim />
          <RouteBackdrop />
          <Header />
          <SiteGuide />
          <ContactModal />
          {/* pointer-events-none is load-bearing: on the home route this element
              stretches over the whole canvas, and with default hit testing it
              would swallow every click aimed at a 3D panel. Content that wants
              clicks opts back in (PageShell, StaticHome, overlay links). */}
          <main
            id="main"
            className="relative pointer-events-none"
            style={{ zIndex: 'var(--z-page)' }}
          >
            {children}
          </main>
          {/* Outside <main>, so it is not part of the page's one landmark, and
              after it in flow so it lands under whatever the route rendered.
              It removes itself on the home route — see SiteFooter. */}
          <SiteFooter />
        </ScrollProvider>
      </body>
    </html>
  )
}
