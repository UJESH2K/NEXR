/**
 * The six destinations, used by the DOM pages and the route transition.
 *
 * The home experience does not read this — it reads lib/sections.ts, which
 * carries the same six beats plus the palette, pose and layout data the scene
 * needs. This file stays because the static fallback home and the interior
 * pages link from it, and because the two want different shapes: a link list
 * here, a scene score there.
 *
 * Artwork is treated as decorative: label text is drawn in the DOM rather than
 * baked into the image, which keeps typography crisp at every camera distance
 * and keeps the copy readable to crawlers.
 */

export type NexrCard = {
  id: string
  eyebrow: string
  title: string
  blurb: string
  /** Served from public/. Falls back to a generated gradient if absent. */
  image: string
  route: string
  /** Optional video URL — clicking the thumbnail opens this. */
  videoUrl?: string
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
    image: '/models/imgs/gap.webp',
    route: '/approach#gap',
    tint: ['#2a2f26', '#0b0d0a'],
  },
  {
    id: 'belief',
    eyebrow: '02 / Our belief',
    title: 'Our Belief',
    blurb: 'Stop making people fit wellbeing. Make wellbeing fit people.',
    image: '/models/imgs/OurApproach.webp',
    route: '/approach#belief',
    tint: ['#3b4426', '#0d0f0a'],
  },
  {
    id: 'meloworld',
    eyebrow: '03 / MeloWorld',
    title: 'MeloWorld',
    blurb:
      'A private, avatar-led space where employees can take a first step without being recognised.',
    image: '/models/imgs/meloworld.webp',
    route: '/platform/meloworld',
    tint: ['#52665a', '#101815'],
  },
  {
    id: 'vr-wellness',
    eyebrow: '04 / VR Wellness',
    title: 'VR Wellness',
    blurb:
      'Guided immersive experiences that help people work through challenges at their own pace.',
    image: '/models/imgs/vrworld.webp',
    route: '/platform/vr-wellness',
    tint: ['#4a4270', '#0e0c17'],
  },
  {
    id: 'clinical',
    eyebrow: '05 / Clinically grounded',
    title: 'Clinically Grounded',
    blurb:
      'Built with psychologists, tested in clinical practice, used in hospital contexts.',
    image: '/models/imgs/clinicallygrounded.webp',
    route: '/trust',
    tint: ['#1f3a3a', '#080e0e'],
  },
  {
    id: 'contact',
    eyebrow: '06 / Start the conversation',
    title: "Let's Talk",
    blurb:
      'Healthier organisations begin with people who feel safe enough to seek support.',
    image: '/models/imgs/letsconnect.webp',
    route: '/contact',
    tint: ['#6b7a2e', '#12150a'],
  },
]

/**
 * The character.
 *
 * Draco-compressed: the raw export is 23.6 MB, almost all of it vertex and
 * animation accessors for a 154k-vertex skinned mesh, and draco takes that to
 * 4.0 MB with no visible loss. Regenerate with:
 *
 *   npx gltf-transform draco public/models/final-character.glb  *     public/models/final-character-draco.glb
 *
 * The uncompressed original stays in the repo as the source of truth.
 */
export const MODEL_URL = '/models/final-character-draco.glb'

/** Self-hosted draco decoder, copied from three's examples into /public. */
export const DRACO_PATH = '/draco/'
