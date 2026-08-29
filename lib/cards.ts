/**
 * The six cards that orbit the character. Count, copy, destinations and
 * fallback tints all live here — the choreography in OrbitCards derives every
 * scroll window from CARD_COUNT, so adding a seventh card means adding one
 * entry and nothing else.
 *
 * Card artwork is treated as decorative: the label text is drawn in the DOM
 * overlay rather than baked into the image, which keeps typography crisp at
 * every camera distance and keeps the copy readable to crawlers.
 */

export type NexrCard = {
  id: string
  eyebrow: string
  title: string
  blurb: string
  /** Served from public/. Falls back to a generated gradient if absent. */
  image: string
  route: string
  /** Two-stop gradient used for the fallback texture and the card's edge glow. */
  tint: [string, string]
}

export const CARDS: NexrCard[] = [
  {
    id: 'gap',
    eyebrow: '01 / The workplace wellbeing gap',
    title: 'The Gap',
    blurb:
      'Organisations invest more in wellbeing than ever. Yet burnout rises and programmes go unused.',
    image: '/cards/01.jpg',
    route: '/approach#gap',
    tint: ['#2a2f26', '#0b0d0a'],
  },
  {
    id: 'belief',
    eyebrow: '02 / Our belief',
    title: 'Our Belief',
    blurb: 'Stop making people fit wellbeing. Make wellbeing fit people.',
    image: '/cards/02.jpg',
    route: '/approach#belief',
    tint: ['#3b4426', '#0d0f0a'],
  },
  {
    id: 'meloworld',
    eyebrow: '03 / MeloWorld',
    title: 'MeloWorld',
    blurb:
      'A private, avatar-led space where employees can take a first step without being recognised.',
    image: '/cards/03.jpg',
    route: '/platform/meloworld',
    tint: ['#52665a', '#101815'],
  },
  {
    id: 'vr-wellness',
    eyebrow: '04 / VR Wellness',
    title: 'VR Wellness',
    blurb:
      'Guided immersive experiences that help people work through challenges at their own pace.',
    image: '/cards/04.jpg',
    route: '/platform/vr-wellness',
    tint: ['#4a4270', '#0e0c17'],
  },
  {
    id: 'clinical',
    eyebrow: '05 / Clinically grounded',
    title: 'Clinically Grounded',
    blurb:
      'Built with psychologists, tested in clinical practice, used in hospital contexts.',
    image: '/cards/05.jpg',
    route: '/trust',
    tint: ['#1f3a3a', '#080e0e'],
  },
  {
    id: 'contact',
    eyebrow: '06 / Start the conversation',
    title: "Let's Talk",
    blurb:
      'Healthier organisations begin with people who feel safe enough to seek support.',
    image: '/cards/06.jpg',
    route: '/contact',
    tint: ['#6b7a2e', '#12150a'],
  },
]

// Bump this whenever the prepared GLB is replaced. GLTFLoader caches by URL,
// and a stable public-file URL can otherwise leave an already-open site showing
// the previous character.
export const MODEL_URL = '/models/nexr-character.glb?v=20260827-untitled2'
