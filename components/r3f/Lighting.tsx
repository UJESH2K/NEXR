'use client'

/**
 * Lighting for a pure black void. Without an environment map the silhouette is
 * everything, so the two rim lights matter more than the key: they're what stop
 * the character dissolving into the background.
 *
 * All lights are explicit rather than a drei <Environment> preset — those fetch
 * an HDR from a CDN at runtime, which we avoid.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />

      {/* Key — front-high, slightly camera-left. */}
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#fff6e8" />

      {/* Warm rim from behind to lift the edges off the black. */}
      <directionalLight position={[-5, 3, -6]} intensity={1.1} color="#d8f35d" />

      {/* Cool counter-rim on the opposite side for separation on the turn. */}
      <directionalLight position={[6, 1.5, -5]} intensity={0.8} color="#7fb0c8" />

      {/* Soft underlight so the lower body doesn't fall to pure black. */}
      <pointLight position={[0, -2.5, 2]} intensity={0.4} color="#3d5145" />
    </>
  )
}
