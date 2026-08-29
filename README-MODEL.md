# Character model pipeline

The scene draws the character as a cloud of GPU-simulated particles sampled off
its actual surface. Everything the particles look like — colour, roughness,
metalness, where the surface even is — is read out of the glTF at load time, so
the export is not a detail. It is the input.

```bash
npm run model:prepare                      # art/character-source.glb → public/models/nexr-character.glb
npm run model:prepare -- my-export.glb     # any other file
npm run model:prepare -- --min-verts 2000  # keep smaller meshes too
npm run model:prepare -- --keep body       # or name the meshes explicitly
```

The site loads `public/models/nexr-character.glb` and nothing else. `art/` holds
the raw export and is never served.

## What the prepare step does

A rig export contains far more than the character. The file this was built
against held **119 meshes, 6391 nodes, 118 skins and 8.6 MB** — of which two
meshes were the body and 117 were AdvancedSkeleton control geometry (IK handles,
locators, control curves in red/green/white/black), with the whole character
duplicated three times over.

So `scripts/prepare-model.mjs`:

- keeps meshes above `--min-verts` (default 5000) and drops one of each
  suffix-duplicated pair (`body` / `body.001`),
- drops the skeleton and the rig animation, baking the mesh at **bind pose** —
  for a skinned primitive the node transform is ignored by spec, so the mesh's
  own vertex space already *is* its bind-pose space,
- strips attributes the sampler never reads (extra UV sets, the eight Maya
  colour sets, joints and weights) and removes a `COLOR_0` set that is uniformly
  white,
- prunes and dedupes what is left.

Result on the current source: **1 mesh, 1 node, 2 materials, 0.96 MB**.

## What your current export is missing

The staged `art/character-source.glb` has **no textures at all** (`images: 0`).
Its two body materials are a flat 50% grey and a flat skin tone:

| material | base colour | roughness | metalness |
| --- | --- | --- | --- |
| `Default_Material.001` | 0.5, 0.5, 0.5 | 0.5 | 0 |
| `character_01:aiStandardSurface1.001` | 0.74, 0.55, 0.44 | 0.2 | 0 |

That is what the particles are currently sampling, and it is why the cloud reads
as a monochrome figure rather than a painted character. Nothing in the particle
system needs changing to fix it — re-export with textures and the colour comes
through on the next `npm run model:prepare`.

The cause is almost certainly the source materials: `aiStandardSurface` is an
Arnold shader and `openPBR_shader` is not a Blender/glTF material either.
Neither has a glTF representation, so the exporter falls back to a base colour
factor and discards the rest.

## Blender export requirements

**Format**: glTF Binary (`.glb`). Prefer it over FBX — FBX carries no PBR
material model, so roughness, metalness and transparency arrive as guesses.

**Materials** — the part that matters most here:

- Every material must be a **Principled BSDF**. Convert Arnold / OpenPBR /
  aiStandardSurface shaders over before exporting; anything else exports as a
  flat colour.
- Textures must be plugged into Base Color / Roughness / Metallic / Alpha
  through image texture nodes, not procedural nodes. Procedural textures are not
  exportable — bake them to images first (Blender's *Bake* panel).
- In the exporter: **Material → Export**, **Images → Automatic** (or JPEG for
  size). Textures end up embedded in the `.glb`.
- Base colour still multiplies its texture, so leave the colour swatch white
  unless you mean to tint.

**Geometry**:

- Apply modifiers, or tick **Apply Modifiers** on export.
- Y-up is the exporter default and is correct — leave it.
- 20k–120k triangles is plenty. The particle count is set independently, so a
  denser mesh buys nothing but download size.
- The character is auto-scaled to 2.4 world units tall and recentred at load, so
  its authored scale and origin do not matter.

**Rig and pose**:

- The bind pose is what gets baked. If the character should stand differently,
  **apply the pose as rest pose** in Blender before exporting.
- Export selected objects only, or hide the rig's control geometry — everything
  the prepare step throws away is bandwidth you paid for.
- Animations are dropped. The character's motion in the scene is scroll-driven
  rotation plus the particle simulation.

**Transparency**:

- Set Blend Mode to *Alpha Blend* / *Alpha Clip* on materials that need it.
  Surfaces with an opacity under 0.05 are skipped when sampling, so
  fully-transparent helper planes (eye occlusion, hair cards) will not scatter
  particles into empty space.

## Checking the result

Open the home page with `?particles=1`, or press the backtick key, for the
tuning panel: particle count and quality tier, the interaction and spring
constants, glow, tilt and scroll rotation, audio level, plus **show mesh** to
draw the source geometry alongside the cloud and confirm the two register.
`copy diff` puts the values that differ from the defaults on the clipboard,
ready to paste into `lib/particles/config.ts`.
