/**
 * Keyboard escape hatch past the fixed chrome. Hidden until focused, at which
 * point it has to be visible above every overlay — hence the chrome z-index.
 */
export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  )
}
