import type { Metadata, Viewport } from 'next'
import { DM_Mono, Manrope, Playfair_Display } from 'next/font/google'
import { CanvasHost } from '@/components/r3f/CanvasHost'
import { CursorFollower } from '@/components/ui/cursor-follower'
import { Header } from '@/components/site/Header'
import { SkipLink } from '@/components/site/SkipLink'
import { SiteGuide } from '@/components/site/SiteGuide'
import { ScrollProvider } from '@/lib/ScrollProvider'
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NEXR — Help shouldn’t cost you your privacy',
  description:
    'NEXR helps organisations remove the invisible barriers that stop employees from seeking support, through a connected workplace wellbeing ecosystem built around privacy, accessibility and immersive care.',
}

// themeColor lives here rather than in metadata — Next moved it in v14.
export const viewport: Viewport = {
  themeColor: '#12180f',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmMono.variable} ${playfair.variable}`}
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{history.scrollRestoration='manual'}catch(e){}window.scrollTo(0,0)",
          }}
        />
        <SkipLink />
        <CursorFollower />
        <ScrollProvider>
          <CanvasHost />
          <Header />
          <SiteGuide />
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
        </ScrollProvider>
      </body>
    </html>
  )
}
