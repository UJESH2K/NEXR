/**
 * Turns a raw Blender/Maya character export into the lean, static GLB the
 * particle system samples: public/models/nexr-character.glb.
 *
 * Rig exports carry far more than the character. The file this was written
 * against held 119 meshes, of which 2 were the body and 117 were AdvancedSkeleton
 * control curves (IK handles, locators, poly control shapes), the whole thing
 * duplicated three times — 6391 nodes and 8.6 MB for 27k useful vertices.
 *
 * So the rule here is: keep meshes big enough to be actual character geometry,
 * drop one of each duplicate, drop the skeleton, drop the rig animation, and
 * strip attributes the particle sampler will never read. Skinned meshes are
 * baked at bind pose — for a skinned primitive the node transform is ignored by
 * spec, so the mesh's own vertex space *is* its bind-pose world space.
 *
 *   node scripts/prepare-model.mjs [input.glb] [--min-verts 5000] [--keep <name>]
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, weld } from '@gltf-transform/functions'

const OUT = 'public/models/nexr-character.glb'
/** Attributes the particle sampler and the lit fallback material actually use. */
const KEEP_ATTRIBUTES = new Set(['POSITION', 'NORMAL', 'TEXCOORD_0', 'COLOR_0'])

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}
const minVerts = Number(flag('min-verts', 5000))
const forcedKeep = argv.reduce((acc, a, i) => (a === '--keep' ? [...acc, argv[i + 1]] : acc), [])

/** Default to the staged source, else the largest .glb/.gltf lying around. */
function findInput() {
  const explicit = argv.find((a) => /\.(glb|gltf)$/i.test(a))
  if (explicit) return explicit
  if (existsSync('art/character-source.glb')) return 'art/character-source.glb'
  const candidates = ['art', '.']
    .filter(existsSync)
    .flatMap((dir) => readdirSync(dir).filter((f) => /\.(glb|gltf)$/i.test(f)).map((f) => join(dir, f)))
    .map((p) => ({ p, size: statSync(p).size }))
    .sort((a, b) => b.size - a.size)
  if (!candidates.length) throw new Error('No .glb/.gltf found. Pass one: node scripts/prepare-model.mjs my-character.glb')
  return candidates[0].p
}

const input = findInput()
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const doc = await io.read(input)
const root = doc.getRoot()

const vertsOf = (mesh) =>
  mesh.listPrimitives().reduce((n, p) => n + (p.getAttribute('POSITION')?.getCount() ?? 0), 0)

console.log(`\n[prepare-model] ${input}`)
console.log(
  `  in: ${root.listMeshes().length} meshes · ${root.listNodes().length} nodes · ` +
    `${root.listMaterials().length} materials · ${root.listTextures().length} textures · ` +
    `${root.listSkins().length} skins · ${root.listAnimations().length} animations`,
)

// ── choose the character geometry ────────────────────────────────────────────
// Suffix-stripped names collide across duplicated rig copies; first one wins.
const seen = new Set()
const kept = []
const dropped = []

for (const mesh of root.listMeshes().slice().sort((a, b) => vertsOf(b) - vertsOf(a))) {
  const name = mesh.getName() || 'mesh'
  const canonical = name.replace(/\.\d{3}$/, '')
  const verts = vertsOf(mesh)
  const wanted = forcedKeep.length ? forcedKeep.some((k) => name.includes(k)) : verts >= minVerts

  if (wanted && !seen.has(canonical)) {
    seen.add(canonical)
    kept.push({ mesh, name, verts })
  } else {
    dropped.push({ name, verts })
  }
}

if (!kept.length) {
  const biggest = root.listMeshes().map((m) => `${m.getName()} (${vertsOf(m)}v)`).sort().slice(0, 10)
  throw new Error(
    `Nothing cleared --min-verts ${minVerts}. Largest meshes:\n  ${biggest.join('\n  ')}\n` +
      'Lower --min-verts, or name the mesh explicitly with --keep <substring>.',
  )
}

console.log(`  keeping ${kept.length}: ${kept.map((k) => `${k.name} (${k.verts}v)`).join(', ')}`)
console.log(`  dropping ${dropped.length} rig/duplicate meshes (${dropped.reduce((n, d) => n + d.verts, 0)}v)`)

// ── rebuild a flat, static scene ─────────────────────────────────────────────
// A fresh scene of identity-transformed nodes is easier to reason about than
// surgically unpicking 6000 rig nodes, and prune() reclaims everything orphaned.
// prune() only reclaims orphans inside a scene graph, so the rig's 6000 nodes
// and the meshes we rejected have to be disposed by hand first.
const keptMeshes = new Set(kept.map((k) => k.mesh))
for (const mesh of root.listMeshes()) if (!keptMeshes.has(mesh)) mesh.dispose()
for (const anim of root.listAnimations()) anim.dispose()
for (const skin of root.listSkins()) skin.dispose()
for (const node of root.listNodes()) node.dispose()
for (const old of root.listScenes()) old.dispose()

/** A vertex-colour set that is uniformly white carries no information — Maya and
 *  Blender both emit these by default — and costs 4 bytes a vertex to keep. */
function isConstantWhite(accessor) {
  const el = [0, 0, 0, 0]
  for (let i = 0; i < accessor.getCount(); i++) {
    // getElement() denormalises, so unsigned-byte sets read back as 0..1 too.
    accessor.getElement(i, el)
    if (el[0] < 1 || el[1] < 1 || el[2] < 1) return false
  }
  return true
}

const scene = doc.createScene('character')
for (const { mesh, name } of kept) {
  for (const prim of mesh.listPrimitives()) {
    for (const semantic of prim.listSemantics()) {
      if (!KEEP_ATTRIBUTES.has(semantic)) prim.setAttribute(semantic, null)
    }
    const colour = prim.getAttribute('COLOR_0')
    if (colour && isConstantWhite(colour)) prim.setAttribute('COLOR_0', null)
  }
  scene.addChild(doc.createNode(name).setMesh(mesh))
}

root.setDefaultScene(scene)

await doc.transform(weld(), dedup(), prune({ keepAttributes: false, keepLeaves: false }))

// Two-sided geometry doubles the fragment cost of the fallback mesh for nothing
// once we are drawing points, but keep it where the source asked for it.
mkdirSync('public/models', { recursive: true })
await io.write(OUT, doc)

const after = statSync(OUT).size
console.log(
  `  out: ${root.listMeshes().length} meshes · ${root.listNodes().length} nodes · ` +
    `${root.listMaterials().length} materials · ${root.listTextures().length} textures`,
)
console.log(`  ${basename(input)} ${(statSync(input).size / 1e6).toFixed(1)} MB → ${OUT} ${(after / 1e6).toFixed(2)} MB\n`)

if (!root.listTextures().length) {
  console.warn(
    '[prepare-model] No textures in this export — every particle will take its\n' +
      '  colour from the material base-colour factor alone. If the character is\n' +
      '  textured in Blender, re-export with Materials: Export and image textures\n' +
      '  packed (see README-MODEL.md).\n',
  )
}
