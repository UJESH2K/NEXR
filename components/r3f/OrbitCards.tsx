'use client'

import { CARDS } from '@/lib/cards'
import { Card } from './Card'

/**
 * Each card owns its own useFrame and derives its scroll window from its index,
 * so there is no per-frame coordination to do here — the sequencing falls out
 * of cardWindow() in the scroll store.
 */
export function OrbitCards() {
  return (
    <>
      {CARDS.map((card, index) => (
        <Card key={card.id} card={card} index={index} />
      ))}
    </>
  )
}
