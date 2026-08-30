/**
 * Turns a loaded glTF character into the point cloud the simulation animates.
 *
 * Sampling is area-weighted across every triangle of every mesh in the model, so
 * density follows surface area rather than vertex density — a coarsely modelled
 * torso gets as many particles per cm² as a dense face, which is what stops the
 * silhouette thinning out wherever the modeller happened not to subdivide.
 *
 * Each sample also carries the appearance of the surface it came from: albedo
 * (base colour factor × base colour texture × vertex colour), roughness and
 * metalness. That is what keeps the character looking like the character rather
 * than like a coloured cloud — the render shader shades points with the values
 * the materials actually specify instead of inventing a look.
 *
 * Runs once per resample, off the render loop.
 */
import {
  Box3,
  BufferAttribute,
  Color,
  InterleavedBufferAttribute,
  Matrix3,
  Matrix4,
  Mesh,
  Object3D,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
} from 'three'

export type SampledSurface = {
  count: number
  /** Rest position, xyz per particle, in the model's local space. */
  rest: Float32Array
  /** Surface normal at the rest position, xyz per particle. */
  normal: Float32Array
  /** Linear-space albedo, rgb per particle. */
  color: Float32Array
  /** roughness, metalness, size multiplier — one vec3 per particle. */
  props: Float32Array
  /** Stable 0..1 per-particle random, reused by every shader that needs one. */
  seed: Float32Array
  bounds: Box3
  /** Total surface area sampled, in square world units. Useful for tuning. */
  area: number
}

/** Deterministic PRNG. A fixed seed means resampling at the same count produces
 *  the same cloud, so nudging a slider does not reshuffle the whole character. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type DecodedTexture = {
  data: Uint8ClampedArray
  width: number
  height: number
  flipY: boolean
  repeat: Vector2
  offset: Vector2
}

type MaterialLook = {
  albedo: Color
  roughness: number
  metalness: number
  opacity: number
  map: DecodedTexture | null
}

/** Largest edge we read a texture back at. Particle albedo needs no more than
 *  this, and getImageData on a 4K texture is slow enough to be felt. */
const MAX_TEXTURE_READBACK = 512

const textureCache = new WeakMap<Texture, DecodedTexture | null>()

/**
 * Read a texture's pixels into a plain array so samples can look up albedo on
 * the CPU. Returns null for anything not yet decoded or not readable (a
 * cross-origin image taints the canvas); callers fall back to the colour factor.
 */
function decodeTexture(texture: Texture | null): DecodedTexture | null {
  if (!texture) return null
  if (textureCache.has(texture)) return textureCache.get(texture) ?? null

  const source = texture.image as { width?: number; height?: number } | undefined
  const width = Number(source?.width ?? 0)
  const height = Number(source?.height ?? 0)

  if (!source || !width || !height) {
    textureCache.set(texture, null)
    return null
  }

  const scale = Math.min(1, MAX_TEXTURE_READBACK / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  try {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('no 2d context')
    ctx.drawImage(source as CanvasImageSource, 0, 0, w, h)
    const decoded: DecodedTexture = {
      data: ctx.getImageData(0, 0, w, h).data,
      width: w,
      height: h,
      flipY: texture.flipY,
      repeat: texture.repeat.clone(),
      offset: texture.offset.clone(),
    }
    textureCache.set(texture, decoded)
    return decoded
  } catch {
    // Tainted or undecodable — the base colour factor alone is a fine fallback.
    textureCache.set(texture, null)
    return null
  }
}

const scratchColor = new Color()

function sampleTexture(tex: DecodedTexture, u: number, v: number, out: Color) {
  const su = u * tex.repeat.x + tex.offset.x
  const sv = v * tex.repeat.y + tex.offset.y
  // Wrap rather than clamp: tiled UVs are common, and clamping smears the edge
  // pixel across whole regions of the body.
  const wu = su - Math.floor(su)
  const wv = sv - Math.floor(sv)
  const x = Math.min(tex.width - 1, (wu * tex.width) | 0)
  const flipped = tex.flipY ? 1 - wv : wv
  const y = Math.min(tex.height - 1, (flipped * tex.height) | 0)
  const i = (y * tex.width + x) * 4
  // Base colour textures are sRGB-encoded; the shader works in linear.
  out.setRGB(tex.data[i] / 255, tex.data[i + 1] / 255, tex.data[i + 2] / 255, SRGBColorSpace)
}

type StandardishMaterial = {
  color?: Color
  map?: Texture | null
  roughness?: number
  metalness?: number
  opacity?: number
  transparent?: boolean
  emissive?: Color
  emissiveIntensity?: number
}

function readMaterial(raw: unknown): MaterialLook {
  const m = (raw ?? {}) as StandardishMaterial
  const albedo = new Color(1, 1, 1)
  if (m.color) albedo.copy(m.color)
  // Points have no emissive channel of their own, so fold a little of it into
  // the albedo — otherwise self-lit surfaces read as unlit.
  if (m.emissive) {
    const gain = Math.min(2, m.emissiveIntensity ?? 1)
    albedo.setRGB(
      albedo.r + m.emissive.r * gain,
      albedo.g + m.emissive.g * gain,
      albedo.b + m.emissive.b * gain,
    )
  }

  return {
    albedo,
    roughness: m.roughness ?? 0.6,
    metalness: m.metalness ?? 0,
    opacity: m.transparent ? (m.opacity ?? 1) : 1,
    map: decodeTexture(m.map ?? null),
  }
}

type Attribute = BufferAttribute | InterleavedBufferAttribute

type SourceMesh = {
  position: Attribute
  normal: Attribute | null
  uv: Attribute | null
  vertexColor: Attribute | null
  index: ArrayLike<number> | null
  /** Model-local transform for positions, plus its normal matrix. */
  matrix: Matrix4
  normalMatrix: Matrix3
  look: MaterialLook
}

type Triangle = {
  a: number
  b: number
  c: number
  /** Cumulative area up to and including this triangle. */
  cumulative: number
  source: SourceMesh
}

const pa = new Vector3()
const pb = new Vector3()
const pc = new Vector3()
const na = new Vector3()
const nb = new Vector3()
const nc = new Vector3()
const edge1 = new Vector3()
const edge2 = new Vector3()
const cross = new Vector3()
const uvA = new Vector2()
const uvB = new Vector2()
const uvC = new Vector2()

const vertex = (attr: Attribute, i: number, out: Vector3) =>
  out.set(attr.getX(i), attr.getY(i), attr.getZ(i))

/**
 * Flatten the model into one triangle list with a cumulative area table.
 *
 * One flat list across all meshes, rather than sampling each mesh in turn, is
 * what makes the distribution correct when meshes differ wildly in size: a 2 cm²
 * eyelash mesh must not receive the same share of particles as the torso.
 */
function collectTriangles(root: Object3D): { triangles: Triangle[]; area: number } {
  root.updateWorldMatrix(true, true)
  const rootInverse = new Matrix4().copy(root.matrixWorld).invert()

  const triangles: Triangle[] = []
  let area = 0

  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    // A mesh hidden in the source file was hidden on purpose.
    if (child.visible === false) return

    const geometry = mesh.geometry
    const position = geometry.getAttribute('position') as Attribute | undefined
    if (!position) return

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const groups = geometry.groups.length
      ? geometry.groups
      : [{ start: 0, count: Infinity, materialIndex: 0 }]

    const index = geometry.getIndex()
    const shared = {
      position,
      normal: (geometry.getAttribute('normal') as Attribute | undefined) ?? null,
      uv: (geometry.getAttribute('uv') as Attribute | undefined) ?? null,
      vertexColor: (geometry.getAttribute('color') as Attribute | undefined) ?? null,
      index: index ? (index.array as ArrayLike<number>) : null,
      matrix: new Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld),
      normalMatrix: new Matrix3(),
    }
    shared.normalMatrix.getNormalMatrix(shared.matrix)

    // One SourceMesh per group, so a triangle resolves its material by lookup
    // rather than by branching per sample.
    const perGroup: SourceMesh[] = groups.map((group) => ({
      ...shared,
      look: readMaterial(materials[group.materialIndex ?? 0] ?? materials[0]),
    }))

    const triangleCount = shared.index ? shared.index.length / 3 : position.count / 3

    for (let t = 0; t < triangleCount; t++) {
      const i = t * 3
      const a = shared.index ? shared.index[i] : i
      const b = shared.index ? shared.index[i + 1] : i + 1
      const c = shared.index ? shared.index[i + 2] : i + 2

      vertex(position, a, pa).applyMatrix4(shared.matrix)
      vertex(position, b, pb).applyMatrix4(shared.matrix)
      vertex(position, c, pc).applyMatrix4(shared.matrix)

      const triangleArea =
        cross.crossVectors(edge1.subVectors(pb, pa), edge2.subVectors(pc, pa)).length() * 0.5
      if (!(triangleArea > 0)) continue

      // Groups are ordered and non-overlapping, so a scan of a handful of
      // entries beats building a per-triangle map.
      let g = 0
      for (let k = 0; k < groups.length; k++) {
        const group = groups[k]
        if (i >= group.start && i < group.start + group.count) {
          g = k
          break
        }
      }

      // Fully transparent surfaces — eye occlusion planes, hair cards set to
      // zero opacity — would otherwise scatter particles into empty space.
      if (perGroup[g].look.opacity < 0.05) continue

      area += triangleArea
      triangles.push({ a, b, c, cumulative: area, source: perGroup[g] })
    }
  })

  return { triangles, area }
}

/** Which triangle owns cumulative-area value `x`? */
function pickTriangle(triangles: Triangle[], x: number): Triangle {
  let low = 0
  let high = triangles.length - 1
  while (low < high) {
    const mid = (low + high) >> 1
    if (triangles[mid].cumulative < x) low = mid + 1
    else high = mid
  }
  return triangles[low]
}

export function sampleSurface(
  root: Object3D,
  requestedCount: number,
  options: { sizeVariance?: number; seed?: number } = {},
): SampledSurface {
  const { triangles, area } = collectTriangles(root)
  const count = Math.max(1, Math.floor(requestedCount))

  const rest = new Float32Array(count * 3)
  const normal = new Float32Array(count * 3)
  const color = new Float32Array(count * 3)
  const props = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const bounds = new Box3()

  if (!triangles.length) {
    console.warn('[NEXR] Nothing sampleable in the character model.')
    return { count: 0, rest, normal, color, props, seed, bounds, area: 0 }
  }

  const random = mulberry32(options.seed ?? 0x5eed)
  const variance = options.sizeVariance ?? 0.45
  const albedo = new Color()
  const position = new Vector3()
  const surfaceNormal = new Vector3()

  for (let i = 0; i < count; i++) {
    const triangle = pickTriangle(triangles, random() * area)
    const { source, a, b, c } = triangle

    // The sqrt on the first coordinate is what makes the barycentric pick
    // uniform over the triangle instead of bunching against one corner.
    const su = Math.sqrt(random())
    const u = 1 - su
    const v = random() * su
    const w = 1 - u - v

    vertex(source.position, a, pa).applyMatrix4(source.matrix)
    vertex(source.position, b, pb).applyMatrix4(source.matrix)
    vertex(source.position, c, pc).applyMatrix4(source.matrix)

    position.set(0, 0, 0).addScaledVector(pa, u).addScaledVector(pb, v).addScaledVector(pc, w)

    if (source.normal) {
      vertex(source.normal, a, na)
      vertex(source.normal, b, nb)
      vertex(source.normal, c, nc)
      surfaceNormal
        .set(0, 0, 0)
        .addScaledVector(na, u)
        .addScaledVector(nb, v)
        .addScaledVector(nc, w)
        .applyMatrix3(source.normalMatrix)
        .normalize()
    } else {
      // Geometric normal, which is all a flat-shaded source can offer anyway.
      surfaceNormal.crossVectors(edge1.subVectors(pb, pa), edge2.subVectors(pc, pa)).normalize()
    }

    albedo.copy(source.look.albedo)

    if (source.look.map && source.uv) {
      const uv = source.uv
      uvA.set(uv.getX(a), uv.getY(a))
      uvB.set(uv.getX(b), uv.getY(b))
      uvC.set(uv.getX(c), uv.getY(c))
      sampleTexture(
        source.look.map,
        uvA.x * u + uvB.x * v + uvC.x * w,
        uvA.y * u + uvB.y * v + uvC.y * w,
        scratchColor,
      )
      albedo.multiply(scratchColor)
    }

    if (source.vertexColor) {
      const vc = source.vertexColor
      scratchColor.setRGB(
        vc.getX(a) * u + vc.getX(b) * v + vc.getX(c) * w,
        vc.getY(a) * u + vc.getY(b) * v + vc.getY(c) * w,
        vc.getZ(a) * u + vc.getZ(b) * v + vc.getZ(c) * w,
      )
      albedo.multiply(scratchColor)
    }

    const o = i * 3
    rest[o] = position.x
    rest[o + 1] = position.y
    rest[o + 2] = position.z
    normal[o] = surfaceNormal.x
    normal[o + 1] = surfaceNormal.y
    normal[o + 2] = surfaceNormal.z
    color[o] = albedo.r
    color[o + 1] = albedo.g
    color[o + 2] = albedo.b
    props[o] = source.look.roughness
    props[o + 1] = source.look.metalness
    // Squaring the random biases towards the small end, so the cloud reads as
    // fine dust with a few larger motes rather than uniformly mid-sized dots.
    props[o + 2] = 1 - variance + variance * 2 * random() ** 2

    seed[i] = random()
    bounds.expandByPoint(position)
  }

  return { count, rest, normal, color, props, seed, bounds, area }
}
