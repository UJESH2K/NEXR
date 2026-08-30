import type { Metadata, Viewport } from 'next'
import { DM_Mono, Manrope, Playfair_Display } from 'next/font/google'
import { CanvasHost } from '@/components/r3f/CanvasHost'
import { VantaBackground } from '@/components/r3f/VantaBackground'
import { Header } from '@/components/site/Header'
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
  themeColor: '#000000',
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
    >
      <body>
        <ScrollProvider>
          {/* Mounted once, above the routes, and never unmounted on navigation
              — a remount would drop the WebGL context and flash white. */}
          <VantaBackground />
          <CanvasHost />
          <Header />
          {/* pointer-events-none is load-bearing: on the home route this element
              stretches over the whole canvas, and with default hit testing it
              would swallow every click aimed at a 3D card. Content that wants
              clicks opts back in (PageShell, StaticHome, overlay links). */}
          <main
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
