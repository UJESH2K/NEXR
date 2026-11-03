/** Doc tab: "Our approach page". */
export const APPROACH = {
  eyebrow: 'Our Approach',
  kicker: 'Wellbeing Designed Around People.',
  title: 'What if wellbeing worked differently?',
  lede: 'People experience wellbeing differently. That’s why NEXR brings together immersive VR experiences, private virtual spaces, and access to expert guidance to create more approachable ways to explore wellbeing, build skills, and find support.',

  // Kept from the previous page, with "them" replaced by "you" as the tab asks.
  contrast: {
    less: 'Less pressure to take a prescribed path.',
    more: 'More freedom to find what feels right for you.',
  },

  ways: {
    heading: 'Ways to make wellbeing more approachable',
    items: [
      {
        id: 'vr',
        label: 'Immersive VR experiences',
        body: 'Explore guided VR experiences designed to help people practice relaxation, build confidence, and develop emotional resilience. Through simulated environments, they can practice responding to everyday challenges in a guided and engaging way.',
        image: '/models/imgs/art/vr-left.webp',
        cta: { label: 'Explore VR Wellness', href: '/explore/vr-wellness' },
      },
      {
        id: 'meloworld',
        label: 'MeloWorld',
        body: 'MeloWorld brings wellbeing into a private, avatar-led virtual world where people can explore different experiences, reflect on everyday challenges, and connect with qualified professionals. It offers a more approachable way to begin, without the pressure of being seen or judged.',
        image: '/models/imgs/art/meloworld-left.webp',
        cta: { label: 'Explore MeloWorld', href: '/explore/meloworld' },
      },
      {
        id: 'guidance',
        label: 'Expert guidance',
        body: 'Access to qualified professionals brings a human element to the wellbeing experience. People can connect with trained experts, explore their concerns, and receive guidance in a supportive and confidential setting.',
        image: '/models/imgs/art/clinical.webp',
        cta: { label: 'See Our Standards', href: '/trust' },
      },
    ],
  },

  // Kept as it is: the Belief card closing the page.
  belief: {
    title: 'Wellbeing Should Meet You Where You Are',
    body: 'We all experience life differently. So why should the way we approach well-being be any different? We believe everyone deserves a way to begin that feels comfortable, personal, and right for them.',
    image: '/models/imgs/art/gap-left.webp',
    cta: { label: 'Our Belief', href: '/explore/belief' },
  },
}
