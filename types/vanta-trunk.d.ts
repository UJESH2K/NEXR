declare module 'vanta/src/vanta.trunk.js' {
  const TRUNK: (options: {
    el: HTMLElement
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    minHeight?: number
    minWidth?: number
    scale?: number
    scaleMobile?: number
    color?: number
    backgroundColor?: number
    spacing?: number
    chaos?: number
  }) => { destroy: () => void }

  export default TRUNK
}
