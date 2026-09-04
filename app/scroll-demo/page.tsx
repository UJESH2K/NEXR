import type { Metadata } from 'next'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'
import { CARDS } from '@/lib/cards'

export const metadata: Metadata = {
  title: 'Scroll Expansion Demo | NEXR',
  description: 'An immersive NEXR card expansion experience.',
}

const card = CARDS[0]

export default function ScrollDemoPage() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc={card.image}
      bgImageSrc={card.image}
      title={card.title}
      date={card.eyebrow}
      scrollToExpand="Scroll to enter"
      textBlend
    >
      <div className="border-t border-bone/15 pt-8">
        <p className="eyebrow">{card.eyebrow}</p>
        <h2 className="mt-5 font-display text-4xl text-bone md:text-6xl">
          {card.title}
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand/75">
          {card.blurb}
        </p>
      </div>
    </ScrollExpandMedia>
  )
}
