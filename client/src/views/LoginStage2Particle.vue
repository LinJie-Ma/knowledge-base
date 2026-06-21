<!-- ===== particle (物理粒子) · InstancedMesh Spheres ===== -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useMnemonicAuth } from '../composables/useMnemonicAuth'
import {
  BALL_COUNT,
  generateRadius,
  updatePhysics,
  updateAttractors,
  mouseState,
} from '../utils/particlePhysics'
import type { Ball } from '../utils/particlePhysics'

const { auth, handleUnlock } = useMnemonicAuth()

// ---- mnemonic form state ----
const WORD_COUNT = 5
const words = ref<string[]>(Array(WORD_COUNT).fill(''))
const submitting = ref(false)
const activeIdx = ref(0)

async function onSubmit() {
  const phrase = words.value.map(w => w.trim()).join(' ')
  if (words.value.every(w => !w.trim())) return
  submitting.value = true
  try { await handleUnlock(phrase) } catch { /* store handles error */ }
  finally { submitting.value = false }
}

function onWordInput(idx: number, e: Event) {
  const t = e.target as HTMLInputElement
  if (t.value.includes(' ')) {
    t.value = t.value.replace(/\s/g, '')
    words.value[idx] = t.value
    if (idx < WORD_COUNT - 1) {
      activeIdx.value = idx + 1
      nextTick(() => document.getElementById(`cli-word-${idx + 1}`)?.focus())
    }
  } else {
    words.value[idx] = t.value
  }
}

function onWordKeydown(idx: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !words.value[idx] && idx > 0) {
    activeIdx.value = idx - 1
    nextTick(() => document.getElementById(`cli-word-${idx - 1}`)?.focus())
  }
  if (e.key === 'Enter' && !submitting.value) onSubmit()
}

// ---- Three.js physics-driven particles ----
const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let whiteMesh: THREE.InstancedMesh | null = null
let grayMesh: THREE.InstancedMesh | null = null
let whiteDummy: THREE.Object3D | null = null
let grayDummy: THREE.Object3D | null = null
let whiteMat: THREE.MeshStandardMaterial | null = null
let grayMat: THREE.MeshStandardMaterial | null = null
let envTexture: THREE.Texture | null = null
let attractorMeshes: THREE.Mesh[] = []
let balls: Ball[] = []
let whiteBalls: number[] = []
let grayBalls: number[] = []
let rafId = 0

// Store event handler refs for cleanup
let _onMouseMove: ((e: MouseEvent) => void) | null = null
let _onMouseLeave: (() => void) | null = null
let _onResize: (() => void) | null = null

function initParticles() {
  const canvas = canvasRef.value!
  const frustumSize = 18
  const aspect = canvas.clientWidth / canvas.clientHeight

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x060608)

  // Camera — Orthographic
  camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1, 100
  )
  camera.position.set(0, 0, 18)
  camera.lookAt(0, 0, 0)

  // RoomEnvironment
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const environment = new RoomEnvironment()
  envTexture = pmremGenerator.fromScene(environment).texture
  environment.dispose()
  pmremGenerator.dispose()

  // Lights
  scene.add(new THREE.AmbientLight(0x8899cc, 1.0))
  const topLight = new THREE.DirectionalLight(0xffffff, 5.0)
  topLight.position.set(0, 14, 0)
  scene.add(topLight)
  const frontLight = new THREE.DirectionalLight(0x99bbff, 2.0)
  frontLight.position.set(0, 0, 14)
  scene.add(frontLight)

  // Ball physics data
  function makeBall(radius: number) {
    const spreadR = 3.0 + Math.random() * 2.5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.pow(Math.random(), 0.5) * spreadR
    balls.push({
      radius,
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi) * 0.4,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 0.8,
      birthTime: Math.random() * 20,
      lifespan: 8 + Math.random() * 12,
      _scale: 1.0,
      _opacity: 1.0,
      _targetX: (Math.random() - 0.5) * 4.0,
      _targetY: (Math.random() - 0.5) * 4.0,
      _targetZ: (Math.random() - 0.5) * 2.0,
      _nextTargetTime: Math.random() * 3.0,
    })
  }

  for (let i = 0; i < BALL_COUNT; i++) {
    makeBall(generateRadius())
  }

  // Split white/gray
  const WHITE_THRESHOLD = 0.18
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].radius > WHITE_THRESHOLD) {
      whiteBalls.push(i)
    } else {
      grayBalls.push(i)
    }
  }

  // White InstancedMesh
  const whiteGeo = new THREE.SphereGeometry(1, 20, 20)
  whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.0,
    envMap: envTexture,
    envMapIntensity: 1.2,
    emissive: 0x222222,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  whiteMesh = new THREE.InstancedMesh(whiteGeo, whiteMat, whiteBalls.length)
  whiteDummy = new THREE.Object3D()
  scene.add(whiteMesh)

  // Gray InstancedMesh
  const grayGeo = new THREE.SphereGeometry(1, 12, 12)
  grayMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.15,
    metalness: 0.0,
    envMap: envTexture,
    envMapIntensity: 0.6,
    emissive: 0x060606,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  grayMesh = new THREE.InstancedMesh(grayGeo, grayMat, grayBalls.length)
  grayDummy = new THREE.Object3D()
  scene.add(grayMesh)

  // Attractor debug dots
  attractorMeshes = []
  for (let i = 0; i < 2; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({
        color: [0xff4444, 0x44ff88][i],
        transparent: true,
        opacity: 0.3,
      })
    )
    scene.add(dot)
    attractorMeshes.push(dot)
  }

  // Mouse
  _onMouseMove = (e: MouseEvent) => {
    mouseState.inScene = true
    const a = window.innerWidth / window.innerHeight
    mouseState.x = ((e.clientX / window.innerWidth) * 2 - 1) * frustumSize * a / 2
    mouseState.y = (-(e.clientY / window.innerHeight) * 2 + 1) * frustumSize / 2
  }
  _onMouseLeave = () => { mouseState.inScene = false }
  window.addEventListener('mousemove', _onMouseMove)
  window.addEventListener('mouseleave', _onMouseLeave)

  // Resize
  _onResize = () => {
    const c = canvasRef.value
    if (!c || !renderer || !camera) return
    renderer.setSize(c.clientWidth, c.clientHeight, false)
    const a = c.clientWidth / c.clientHeight
    camera.left = frustumSize * a / -2
    camera.right = frustumSize * a / 2
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', _onResize)

  // Animate loop
  const clock = new THREE.Clock()
  function animate() {
    rafId = requestAnimationFrame(animate)
    const dt = Math.min(clock.getDelta(), 0.033)
    const elapsed = clock.elapsedTime

    const attractors = updateAttractors(elapsed)
    for (let i = 0; i < 2; i++) {
      attractorMeshes[i].position.set(attractors[i].x, attractors[i].y, attractors[i].z)
    }

    updatePhysics(balls, dt, elapsed, attractors)

    // Sync white balls
    for (let i = 0; i < whiteBalls.length; i++) {
      const idx = whiteBalls[i]
      const b = balls[idx]
      whiteDummy!.position.set(b.x, b.y, b.z)
      whiteDummy!.scale.setScalar(Math.max(b.radius * b._scale, 0.005))
      whiteDummy!.updateMatrix()
      whiteMesh!.setMatrixAt(i, whiteDummy!.matrix)
    }
    whiteMesh!.instanceMatrix.needsUpdate = true

    // Sync gray balls
    for (let i = 0; i < grayBalls.length; i++) {
      const idx = grayBalls[i]
      const b = balls[idx]
      grayDummy!.position.set(b.x, b.y, b.z)
      grayDummy!.scale.setScalar(Math.max(b.radius * b._scale, 0.005))
      grayDummy!.updateMatrix()
      grayMesh!.setMatrixAt(i, grayDummy!.matrix)
    }
    grayMesh!.instanceMatrix.needsUpdate = true

    renderer!.render(scene!, camera!)
  }
  animate()
}

function cleanup() {
  cancelAnimationFrame(rafId)
  if (_onResize) window.removeEventListener('resize', _onResize)
  if (_onMouseMove) window.removeEventListener('mousemove', _onMouseMove)
  if (_onMouseLeave) window.removeEventListener('mouseleave', _onMouseLeave)

  whiteMesh?.geometry.dispose()
  whiteMat?.dispose()
  grayMesh?.geometry.dispose()
  grayMat?.dispose()
  attractorMeshes.forEach(m => {
    m.geometry.dispose()
    ;(m.material as THREE.Material).dispose()
  })
  envTexture?.dispose()
  renderer?.dispose()
}

onMounted(() => nextTick(initParticles))
onUnmounted(cleanup)
</script>

<template>
  <div class="cli-page">
    <canvas ref="canvasRef" class="cli-canvas"></canvas>

    <!-- CRT 扫描线 -->
    <div class="crt-scanlines"></div>
    <div class="crt-vignette"></div>

    <!-- 终端界面 -->
    <div class="terminal">
      <div class="t-line t-top">
        <span class="t-dim">root@neural-net:~$ </span>
        <span class="t-cmd">./auth_stage2 --verify-identity</span>
      </div>
      <div class="t-line t-dim">[INFO] Secure channel established · stage 2 required</div>
      <div class="t-line t-dim">──────────────────────────────────────</div>

      <div class="t-line t-label">$ Enter 5-word for identity verification:</div>
      <div class="t-line t-word-row">
        <span class="t-prompt">&gt;</span>
        <template v-for="(_, i) in WORD_COUNT" :key="i">
          <span class="t-tag">WORD_{{ i + 1 }}</span>
          <input
            :id="`cli-word-${i}`"
            v-model="words[i]"
            type="text"
            autocomplete="off"
            spellcheck="false"
            class="t-input"
            :class="{ active: activeIdx === i }"
            @input="onWordInput(i, $event)"
            @keydown="onWordKeydown(i, $event)"
            @focus="activeIdx = i"
          />
        </template>
      </div>

      <div v-if="auth.error" class="t-line t-err">[ERR]  {{ auth.error }}</div>

      <div class="t-line t-action" @click="!submitting && onSubmit()">
        <span class="t-prompt">&gt;</span>
        <span v-if="submitting" class="t-cmd t-blink">EXECUTING_AUTH<span class="t-cursor">_</span></span>
        <span v-else class="t-cmd">EXECUTE_AUTH<span class="t-cursor">_</span></span>
        <span class="t-hint ml-2">[ENTER]</span>
      </div>

      <div class="t-line t-bottom">
        <span>[</span><span class="t-dim">ENCRYPTED</span><span>]</span>
        <span>[</span><span class="t-dim">SYS_OK</span><span>]</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cli-page {
  width: 100vw; height: 100vh; height: 100dvh;
  position: relative; overflow: hidden;
  background: #050505;
  font-family: 'Courier New', 'Noto Sans SC', monospace;
}
.cli-canvas { position: fixed; inset: 0; width: 100%; height: 100%; display: block; z-index: 0; }

.crt-scanlines {
  position: fixed; inset: 0; z-index: 3;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
  pointer-events: none;
}
.crt-vignette {
  position: fixed; inset: 0; z-index: 4;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%);
  pointer-events: none;
}

.terminal {
  position: relative; z-index: 5;
  margin-left: clamp(2rem, 8vw, 6rem);
  margin-top: clamp(4vh, 10vh, 12vh);
  max-width: min(90vw, 760px);
  display: flex; flex-direction: column;
  gap: clamp(4px, 0.8vh, 8px);
}

.t-line {
  color: #ff3b3b;
  font-size: clamp(0.7rem, 1.05vw, 0.9rem);
  line-height: 1.7; letter-spacing: 0.04em;
  text-shadow: 0 0 4px rgba(255,59,59,0.3);
}
.t-dim { color: rgba(255,59,59,0.35); }
.t-prompt { color: #ff3b3b; margin-right: 0.3rem; }
.t-cmd { color: #ff3b3b; }
.t-tag { color: rgba(255,59,59,0.5); font-size: 0.75em; white-space: nowrap; }
.t-err { color: #ff6666; text-shadow: 0 0 6px rgba(255,100,100,0.4); }
.t-hint { color: rgba(255,59,59,0.2); font-size: 0.85em; }
.t-label { color: rgba(255,59,59,0.55); }
.t-action { cursor: pointer; user-select: none; }
.t-action:hover .t-cmd { color: #ff6666; text-shadow: 0 0 10px rgba(255,59,59,0.6); }
.t-bottom {
  margin-top: clamp(4px, 1vh, 12px);
  font-size: clamp(0.6rem, 0.85vw, 0.75rem);
  color: rgba(255,59,59,0.3); letter-spacing: 0.06em;
}

.t-word-row {
  display: flex; align-items: center;
  gap: clamp(3px, 0.6vw, 8px);
  flex-wrap: nowrap;
}
.t-input {
  width: clamp(56px, 7vw, 90px);
  padding: clamp(3px, 0.5vh, 6px) clamp(4px, 0.5vw, 8px);
  background: rgba(255,59,59,0.03);
  border: none;
  border-bottom: 1px dashed rgba(255,59,59,0.3);
  color: #ff3b3b;
  font-family: 'Courier New', monospace;
  font-size: clamp(0.75rem, 1.1vw, 0.95rem);
  text-align: center; outline: none;
  caret-color: #ff3b3b;
  transition: border-color 0.2s, background 0.2s;
}
.t-input:focus, .t-input.active {
  border-bottom-color: #ff3b3b;
  border-bottom-style: solid;
  background: rgba(255,59,59,0.06);
  box-shadow: 0 1px 8px rgba(255,59,59,0.1);
}

.t-cursor { animation: cursor-blink 1s step-end infinite; color: #ff3b3b; }
.t-blink { animation: text-flicker 3s infinite; }

@keyframes cursor-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes text-flicker { 0%,100% { opacity: 1; } 92% { opacity: 0.9; } 94% { opacity: 1; } 96% { opacity: 0.85; } 98% { opacity: 1; } }
.ml-2 { margin-left: 0.5rem; }
</style>
