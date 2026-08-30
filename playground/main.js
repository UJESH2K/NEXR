import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// ── Scene setup ────────────────────────────────────────────────────────────
const viewport = document.getElementById('viewport')
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(viewport.clientWidth, viewport.clientHeight)
renderer.setClearColor(0x111111)
viewport.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, viewport.clientWidth / viewport.clientHeight, 0.1, 500)

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4))
const key = new THREE.DirectionalLight(0xfff6e8, 1.6); key.position.set(4, 6, 6); scene.add(key)
const rim1 = new THREE.DirectionalLight(0xd8f35d, 1.1); rim1.position.set(-5, 3, -6); scene.add(rim1)
const rim2 = new THREE.DirectionalLight(0x7fb0c8, 0.8); rim2.position.set(6, 1.5, -5); scene.add(rim2)
const under = new THREE.PointLight(0x3d5145, 0.4); under.position.set(0, -2.5, 2); scene.add(under)

// Grid helper for reference
const grid = new THREE.GridHelper(20, 20, 0x333333, 0x222222)
scene.add(grid)

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  scale: 100,
  posX: 0, posY: 0, posZ: 0,
  camRadius: 10, camHeight: 2, camFov: 40, camLookY: 3,
  animTime: 0,
  animPlaying: false,
}

const ANIM_DURATION = 0.25
let mixer = null
let modelRoot = null

// ── Load model ─────────────────────────────────────────────────────────────
const loader = new GLTFLoader()
loader.load(
  '/models/girl.glb',
  (gltf) => {
    modelRoot = new THREE.Group()
    modelRoot.add(gltf.scene)
    scene.add(modelRoot)

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(gltf.scene)
      const action = mixer.clipAction(gltf.animations[0])
      action.play()
      action.paused = true
    }

    // Update anim slider max to actual duration
    if (gltf.animations.length) {
      document.getElementById('animTime').max = gltf.animations[0].duration || ANIM_DURATION
    }

    console.log('Model loaded. Animations:', gltf.animations.length)
  },
  undefined,
  (err) => console.error('Failed to load model:', err),
)

// ── Controls wiring ────────────────────────────────────────────────────────
const ids = ['scale', 'posX', 'posY', 'posZ', 'camRadius', 'camHeight', 'camFov', 'camLookY', 'animTime']
const keys = ['scale', 'posX', 'posY', 'posZ', 'camRadius', 'camHeight', 'camFov', 'camLookY', 'animTime']

ids.forEach((id, i) => {
  const el = document.getElementById(id)
  el.addEventListener('input', () => {
    state[keys[i]] = Number(el.value)
    if (id === 'camFov') camera.fov = state.camFov; camera.updateProjectionMatrix()
  })
})

document.getElementById('btnPlay').addEventListener('click', () => {
  state.animPlaying = !state.animPlaying
  const btn = document.getElementById('btnPlay')
  btn.textContent = state.animPlaying ? 'Pause' : 'Play'
  btn.classList.toggle('active', state.animPlaying)
  if (mixer) {
    // Find the action and toggle paused
    mixer._actions.forEach(a => { a.paused = !state.animPlaying })
  }
})

document.getElementById('btnReset').addEventListener('click', () => {
  state.animTime = 0
  document.getElementById('animTime').value = 0
  if (mixer) mixer.setTime(0)
})

document.getElementById('btnExport').addEventListener('click', () => {
  const output = {
    character: {
      scale: state.scale,
      position: [state.posX, state.posY, state.posZ],
    },
    camera: {
      radius: state.camRadius,
      height: state.camHeight,
      fov: state.camFov,
      lookY: state.camLookY,
    },
    animation: {
      duration: ANIM_DURATION,
      playing: state.animPlaying,
      time: state.animTime,
    },
  }
  const json = JSON.stringify(output, null, 2)
  navigator.clipboard?.writeText(json).then(() => {
    document.getElementById('output').textContent = '✓ Copied!\n\n' + json
  }).catch(() => {
    document.getElementById('output').textContent = json
  })
})

// ── Resize ─────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = viewport.clientWidth, h = viewport.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
})

// ── Render loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  // Camera
  camera.position.set(0, state.camHeight, state.camRadius)
  camera.lookAt(0, state.camLookY, 0)
  camera.fov = state.camFov
  camera.updateProjectionMatrix()

  // Model
  if (modelRoot) {
    modelRoot.scale.setScalar(state.scale)
    modelRoot.position.set(state.posX, state.posY, state.posZ)
  }

  // Animation
  if (mixer && state.animPlaying) {
    mixer.update(delta)
    const action = mixer._actions[0]
    if (action) {
      state.animTime = action.time % (action.getClip().duration || ANIM_DURATION)
      document.getElementById('animTime').value = state.animTime
    }
  } else if (mixer && !state.animPlaying) {
    mixer.setTime(state.animTime)
  }

  renderer.render(scene, camera)
}

animate()
