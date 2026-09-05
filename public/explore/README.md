# Explore artwork

Each room in `/explore/<slug>` renders its gallery from `lib/explore.ts`. A card
points at a file in this folder and falls back to a designed placeholder while
that file is missing, so artwork can be added here with no code change.

Drop files at exactly these paths:

    public/explore/gap/01.webp          The gap, visualised          4:3
    public/explore/gap/02.webp          Utilisation versus spend     4:3
    public/explore/gap/03.webp          Where people stop            16:9

    public/explore/belief/01.webp       Designed around people       3:4
    public/explore/belief/02.webp       Principles in practice       4:3
    public/explore/belief/03.webp       Reactive to proactive        16:9

    public/explore/meloworld/01.webp    MeloWorld environment        16:9
    public/explore/meloworld/02.webp    Avatar and identity          3:4
    public/explore/meloworld/03.webp    A session in the space       4:3

    public/explore/vr-wellness/01.webp  Immersive environment        16:9
    public/explore/vr-wellness/02.webp  Guided session               4:3
    public/explore/vr-wellness/03.webp  Resilience library           3:4

    public/explore/clinical/01.webp     Clinical team at work        4:3
    public/explore/clinical/02.webp     Enterprise deployment        4:3
    public/explore/clinical/03.webp     Education settings           16:9

    public/explore/contact/01.webp      The team                     4:3
    public/explore/contact/02.webp      A walkthrough session        16:9

The ratio is what the card is drawn at; anything else is cropped to fill. To use
a different filename or add a fourth frame, edit the `gallery` array for that
topic in `lib/explore.ts`.
