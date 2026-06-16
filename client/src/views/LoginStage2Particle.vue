<!-- ===== particle (科幻粒子) · InstancedMesh Spheres ===== -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useMnemonicAuth } from '../composables/useMnemonicAuth'

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

// ---- Three.js InstancedMesh particles ----
const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let instancedMesh: THREE.InstancedMesh | null = null
let material: THREE.ShaderMaterial | null = null
let rafId = 0

/** 3D 高斯分布：密度在原点最高，向外指数衰减 */
function gaussian3D(maxRadius: number): [number, number, number] {
  // 球面均匀随机方向
  const u = 2 * Math.random() - 1
  const theta = Math.acos(u)
  const phi = Math.random() * Math.PI * 2
  // 半径：pow 使粒子集中在中心
  const r = Math.pow(Math.random(), 2.5) * maxRadius
  return [
    Math.sin(theta) * Math.cos(phi) * r,
    Math.sin(theta) * Math.sin(phi) * r,
    Math.cos(theta) * r,
  ]
}

function initParticles() {
  const canvas = canvasRef.value; if (!canvas) return
  const N = 8000 // InstancedMesh 性能优于 Points，8000 球体可流畅运行

  // ---- 场景 & 相机 & 渲染器 ----
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.set(0, 0.2, 8)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  renderer.setClearColor(0x050505, 1)

  // ---- OrbitControls：拖拽旋转 + 缩放 + 自动旋转 ----
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true; controls.dampingFactor = 0.08
  controls.autoRotate = true; controls.autoRotateSpeed = 0.3
  controls.minDistance = 3; controls.maxDistance = 18
  controls.target.set(0, 0, 0)
  controls.update()

  // ---- 球体几何体：低面数保持球形轮廓 ----
  const sphereRadius = 0.09
  const geo = new THREE.SphereGeometry(sphereRadius, 10, 8)

  // ---- 自定义 ShaderMaterial：柔和辉光 + 3D 球体着色 ----
  const vs = [
    'varying vec3 vNormal;',
    'varying vec3 vViewPos;',
    'varying float vScale;',
    'uniform float uTime;',
    'void main() {',
    '  vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);',
    '  vViewPos = mvPos.xyz;',
    '  mat3 normMat = mat3(transpose(inverse(modelViewMatrix * instanceMatrix)));',
    '  vNormal = normalize(normMat * normal);',
    // 从 instanceMatrix 提取缩放
    '  vScale = length(instanceMatrix[0].xyz);',
    '  gl_Position = projectionMatrix * mvPos;',
    '}',
  ].join('\n')

  const fs = [
    'precision highp float;',
    'varying vec3 vNormal;',
    'varying vec3 vViewPos;',
    'varying float vScale;',
    'uniform float uTime;',
    'void main() {',
    // 球体法线着色：朝向相机的面更亮
    '  vec3 viewDir = normalize(-vViewPos);',
    '  float NdotV = abs(dot(vNormal, viewDir));',
    // 菲涅尔：边缘微亮，模拟逆光散射
    '  float fresnel = pow(1.0 - NdotV, 2.5);',
    // 基础漫反射：法线朝前 = 亮面
    '  float diffuse = NdotV * 0.55 + 0.45;',
    // 大粒子更亮
    '  float sizeBoost = 0.7 + 0.3 * vScale;',
    // 综合亮度
    '  float lum = (diffuse + fresnel * 0.25) * sizeBoost;',
    // 暖白颜色
    '  vec3 col = vec3(0.98, 0.97, 0.94) * lum;',
    // 中心不透明 → 边缘微透，产生柔和融入感
    '  float alpha = NdotV * 0.7 + 0.3 + fresnel * 0.15;',
    '  alpha = clamp(alpha * sizeBoost, 0.4, 1.0);',
    '  gl_FragColor = vec4(col, alpha);',
    '}',
  ].join('\n')

  material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  })

  // ---- InstancedMesh ----
  instancedMesh = new THREE.InstancedMesh(geo, material, N)
  instancedMesh.castShadow = false
  instancedMesh.receiveShadow = false

  const dummy = new THREE.Object3D()
  const quat = new THREE.Quaternion()
  const color = new THREE.Color()

  for (let i = 0; i < N; i++) {
    const [x, y, z] = gaussian3D(4.5)
    dummy.position.set(x, y, z)
    // 随机大小：0.5 ~ 2.5 倍球体半径
    const s = 0.5 + Math.random() * 2.0
    dummy.scale.setScalar(s)
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
    // 大粒子更暖白，小粒子偏灰
    const brightness = 0.55 + s * 0.18
    color.setRGB(brightness, brightness * 0.98, brightness * 0.94)
    instancedMesh.setColorAt(i, color)
  }
  instancedMesh.instanceMatrix.needsUpdate = true
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true

  scene.add(instancedMesh)

  // ---- 环境光源感：背景微弱的点光源群（额外氛围） ----
  const bgGeo = new THREE.SphereGeometry(0.04, 6, 4)
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x333322, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
  const bgMesh = new THREE.InstancedMesh(bgGeo, bgMat, 2000)
  for (let i = 0; i < 2000; i++) {
    const [x, y, z] = gaussian3D(6.0)
    dummy.position.set(x, y, z)
    dummy.scale.setScalar(0.5 + Math.random() * 0.8)
    dummy.updateMatrix()
    bgMesh.setMatrixAt(i, dummy.matrix)
  }
  bgMesh.instanceMatrix.needsUpdate = true
  scene.add(bgMesh)

  // ---- 动画循环 ----
  function animate() {
    rafId = requestAnimationFrame(animate)
    controls?.update()
    if (material) material.uniforms.uTime.value = performance.now() * 0.001
    renderer!.render(scene!, camera!)
  }
  animate()

  window.addEventListener('resize', onResize)
}

function onResize() {
  const c = canvasRef.value; if (!c || !renderer || !camera) return
  renderer.setSize(c.clientWidth, c.clientHeight, false)
  camera.aspect = c.clientWidth / c.clientHeight
  camera.updateProjectionMatrix()
}

function cleanup() {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  controls?.dispose()
  instancedMesh?.geometry.dispose()
  material?.dispose()
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
        <span class="t-prompt">></span>
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
        <span class="t-prompt">></span>
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
