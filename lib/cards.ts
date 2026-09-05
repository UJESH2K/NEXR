/**
 * The six destinations, used by the DOM pages and the route transition.
 *
 * Each card opens the matching explore room rather than a product page: the
 * room is the designed read for that beat and links on to the product page from
 * there, so there is one route into a subject rather than two.
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
      'Organisations invest more in wellbeing than ever. Yet burnout rises, programmes go unused and people hesitate.',
    image: '/models/imgs/gap.webp',
    route: '/explore/gap',
    tint: ['#2a2f26', '#0b0d0a'],
  },
  {
    id: 'belief',
    eyebrow: '02 / Our belief',
    title: 'Our Belief',
    blurb: 'Stop making people fit wellbeing. Make wellbeing fit people.',
    image: '/models/imgs/OurApproach.webp',
    route: '/explore/belief',
    tint: ['#3b4426', '#0d0f0a'],
  },
  {
    id: 'meloworld',
    eyebrow: '03 / MeloWorld',
    title: 'MeloWorld',
    blurb:
      'A private, anonymous space where employees can take their first step towards support comfortably.',
    image: '/models/imgs/meloworld.webp',
    route: '/explore/meloworld',
    tint: ['#52665a', '#101815'],
  },
  {
    id: 'vr-wellness',
    eyebrow: '04 / VR Wellness',
    title: 'VR Wellness',
    blurb:
      'Immersive, guided experiences that help people work through challenges and build resilience at their own pace.',
    image: '/models/imgs/vrworld.webp',
    route: '/explore/vr-wellness',
    tint: ['#4a4270', '#0e0c17'],
  },
  {
    id: 'clinical',
    eyebrow: '05 / Psychologically safer workplaces',
    title: 'Clinically Grounded',
    blurb:
      'Developed with mental health professionals, tested in clinical practice, designed for modern workplaces.',
    image: '/models/imgs/clinicallygrounded.webp',
    route: '/explore/clinical',
    tint: ['#1f3a3a', '#080e0e'],
  },
  {
    id: 'contact',
    eyebrow: '06 / Start the conversation',
    title: "Let's Talk",
    blurb:
      'The next way into wellbeing starts here. We will shape the right entry point for your people.',
    image: '/models/imgs/letsconnect.webp',
    route: '/explore/contact',
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
