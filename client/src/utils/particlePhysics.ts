import { smoothNoise3D } from './noise'

// ─── Physics Constants ──────────────────────────────────
export const BALL_COUNT = 400
export const MIN_RADIUS = 0.05
export const MAX_RADIUS = 0.3

// Autonomous Motion
export const AUTO_STRENGTH = 2.0
export const AUTO_CHANGE_INTERVAL = 3.0

// Flow field
export const CURL_STRENGTH = 1.5
export const CURL_SCALE = 0.15

// Attractor influence
export const ATTRACTOR_INFLUENCE = 4.0
export const TANGENT_FLOW = 8.0
export const RADIAL_PULL = 1.5

// Lifecycle
export const LIFESPAN_MIN = 8.0
export const LIFESPAN_MAX = 20.0
export const BIRTH_DURATION = 0.3
export const DEATH_DURATION = 0.2

// Boundary
export const BOUND_RADIUS = 7.0
export const BOUND_SPRING = 12.0

// Physics
export const DAMPING = 0.995
export const MOUSE_FORCE = 15.0
export const MOUSE_RADIUS = 3.0

// ─── Types ────────────────────────────────────────────────
export interface Ball {
  radius: number
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  birthTime: number
  lifespan: number
  _scale: number
  _opacity: number
  _targetX: number; _targetY: number; _targetZ: number
  _nextTargetTime: number
}

export interface Attractor {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
}

export interface MouseState {
  x: number; y: number; z: number
  inScene: boolean
}

// ─── Radius Generation ────────────────────────────────────
export function generateRadius(): number {
  return MIN_RADIUS + Math.pow(Math.random(), 3.0) * (MAX_RADIUS - MIN_RADIUS)
}

// ─── Mouse State ──────────────────────────────────────────
export const mouseState: MouseState = { x: 0, y: 0, z: 0, inScene: false }

// ─── Autonomous Target Generation ─────────────────────────
function updateAutonomousTarget(ball: Ball, elapsed: number): void {
  if (!ball._nextTargetTime || elapsed >= ball._nextTargetTime) {
    const angle = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.random() * BOUND_RADIUS * 0.6

    ball._targetX = r * Math.sin(phi) * Math.cos(angle)
    ball._targetY = r * Math.sin(phi) * Math.sin(angle)
    ball._targetZ = r * Math.cos(phi) * 0.5
    ball._nextTargetTime = elapsed + AUTO_CHANGE_INTERVAL * (0.5 + Math.random())
  }
}

// ─── Curl Noise (divergence-free flow field) ──────────────
function curlNoise(x: number, y: number, z: number, t: number): { x: number; y: number; z: number } {
  const s = CURL_SCALE
  const e = 0.15

  const F0 = (px: number, py: number, pz: number) => smoothNoise3D(px * s + t, py * s, pz * s)
  const F1 = (px: number, py: number, pz: number) => smoothNoise3D(px * s, py * s + t * 0.7, pz * s + 100)
  const F2 = (px: number, py: number, pz: number) => smoothNoise3D(px * s + 200, py * s, pz * s + t * 1.3)

  const cx = (F2(x, y + e, z) - F2(x, y - e, z) - F1(x, y, z + e) + F1(x, y, z - e)) / (2 * e)
  const cy = (F0(x, y, z + e) - F0(x, y, z - e) - F2(x + e, y, z) + F2(x - e, y, z)) / (2 * e)
  const cz = (F1(x + e, y, z) - F1(x - e, y, z) - F0(x, y + e, z) + F0(x, y - e, z)) / (2 * e)

  return { x: cx, y: cy, z: cz }
}

// ─── Attractor System ─────────────────────────────────────
let _prevAttractors: Attractor[] | null = null

export function updateAttractors(elapsed: number): Attractor[] {
  const attractors: Attractor[] = []

  const t0 = elapsed * 1.2
  attractors.push({
    x: Math.sin(t0) * 4.0,
    y: Math.sin(t0 * 1.5) * 2.5,
    z: Math.cos(t0 * 0.8) * 1.5,
    vx: 0, vy: 0, vz: 0,
  })

  const t1 = elapsed * 0.9
  attractors.push({
    x: Math.cos(t1) * 4.5 + Math.sin(t1 * 0.4) * 1.0,
    y: Math.sin(t1) * 3.0 + Math.cos(t1 * 0.6) * 0.8,
    z: Math.sin(t1 * 1.2) * 1.8,
    vx: 0, vy: 0, vz: 0,
  })

  if (_prevAttractors) {
    for (let i = 0; i < attractors.length; i++) {
      attractors[i].vx = attractors[i].x - _prevAttractors[i].x
      attractors[i].vy = attractors[i].y - _prevAttractors[i].y
      attractors[i].vz = attractors[i].z - _prevAttractors[i].z
    }
  }

  _prevAttractors = attractors
  return attractors
}

// ─── Physics Update ───────────────────────────────────────
export function updatePhysics(balls: Ball[], dt: number, elapsed: number, attractors: Attractor[]): void {
  dt = Math.min(dt, 0.033)

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]

    // Lifecycle
    const life = (elapsed - b.birthTime) / b.lifespan
    if (life >= 1.0) {
      // Death → respawn
      const spreadR = BOUND_RADIUS * 0.3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * spreadR
      b.x = r * Math.sin(phi) * Math.cos(theta)
      b.y = r * Math.sin(phi) * Math.sin(theta)
      b.z = r * Math.cos(phi) * 0.5

      b.vx = (Math.random() - 0.5) * 2.0
      b.vy = (Math.random() - 0.5) * 2.0
      b.vz = (Math.random() - 0.5) * 1.0

      b.birthTime = elapsed
      b.lifespan = LIFESPAN_MIN + Math.random() * (LIFESPAN_MAX - LIFESPAN_MIN)
      b._scale = 0.01
      b._opacity = 0.0

      b._targetX = (Math.random() - 0.5) * BOUND_RADIUS * 0.5
      b._targetY = (Math.random() - 0.5) * BOUND_RADIUS * 0.5
      b._targetZ = (Math.random() - 0.5) * BOUND_RADIUS * 0.3
      b._nextTargetTime = elapsed + AUTO_CHANGE_INTERVAL * (0.5 + Math.random())
      continue
    }

    // Birth/death animation
    let s = 1.0, op = 1.0
    if (life < BIRTH_DURATION) {
      const t = life / BIRTH_DURATION
      s = t * (2 - t)
      op = t * t
    } else if (life > 1.0 - DEATH_DURATION) {
      const t = (life - (1.0 - DEATH_DURATION)) / DEATH_DURATION
      s = 1.0 - t * t
      op = 1.0 - t * t
    }
    b._scale = Math.max(s, 0.01)
    b._opacity = Math.max(op, 0.01)

    // 1. Autonomous Motion
    updateAutonomousTarget(b, elapsed)

    const ax = b._targetX - b.x
    const ay = b._targetY - b.y
    const az = b._targetZ - b.z
    const adist = Math.sqrt(ax * ax + ay * ay + az * az)

    if (adist > 0.1) {
      b.vx += (ax / adist) * AUTO_STRENGTH * dt
      b.vy += (ay / adist) * AUTO_STRENGTH * dt
      b.vz += (az / adist) * AUTO_STRENGTH * dt
    }

    // 2. Curl Noise
    const curl = curlNoise(b.x, b.y, b.z, elapsed)
    b.vx += curl.x * CURL_STRENGTH * dt
    b.vy += curl.y * CURL_STRENGTH * dt
    b.vz += curl.z * CURL_STRENGTH * dt

    // 3. Attractor influence
    for (let j = 0; j < attractors.length; j++) {
      const a = attractors[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dz = a.z - b.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < ATTRACTOR_INFLUENCE) {
        const w = (1.0 - dist / ATTRACTOR_INFLUENCE)
        const w2 = w * w

        if (dist > 0.01) {
          const avLen = Math.sqrt(a.vx * a.vx + a.vy * a.vy + a.vz * a.vz)
          if (avLen > 0.001) {
            const atx = a.vx / avLen
            const aty = a.vy / avLen
            const atz = a.vz / avLen
            b.vx += atx * TANGENT_FLOW * w2 * dt
            b.vy += aty * TANGENT_FLOW * w2 * dt
            b.vz += atz * TANGENT_FLOW * w2 * dt
          }

          b.vx += (dx / dist) * RADIAL_PULL * w2 * dt
          b.vy += (dy / dist) * RADIAL_PULL * w2 * dt
          b.vz += (dz / dist) * RADIAL_PULL * w2 * dt
        }
      }
    }

    // 4. Soft spherical boundary
    const distFromCenter = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z)
    if (distFromCenter > BOUND_RADIUS) {
      const overshoot = distFromCenter - BOUND_RADIUS
      const invD = 1.0 / distFromCenter
      b.vx -= b.x * invD * overshoot * BOUND_SPRING * dt
      b.vy -= b.y * invD * overshoot * BOUND_SPRING * dt
      b.vz -= b.z * invD * overshoot * BOUND_SPRING * dt
    }

    // 5. Mouse push
    if (mouseState.inScene) {
      const dx = b.x - mouseState.x
      const dy = b.y - mouseState.y
      const dz = b.z - mouseState.z
      const md = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (md < MOUSE_RADIUS && md > 0.01) {
        const f = MOUSE_FORCE * (1.0 - md / MOUSE_RADIUS)
        b.vx += (dx / md) * f * dt
        b.vy += (dy / md) * f * dt
        b.vz += (dz / md) * f * dt
      }
    }

    // 6. Damping
    b.vx *= DAMPING
    b.vy *= DAMPING
    b.vz *= DAMPING

    // 7. Integrate
    b.x += b.vx * dt
    b.y += b.vy * dt
    b.z += b.vz * dt
  }

  // Ball-ball soft collision
  const COLLIDE_DIST = 0.3
  const COLLIDE_DIST_SQ = COLLIDE_DIST * COLLIDE_DIST
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i]
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const distSq = dx * dx + dy * dy + dz * dz
      if (distSq < COLLIDE_DIST_SQ && distSq > 0.0001) {
        const dist = Math.sqrt(distSq)
        const nx = dx / dist
        const ny = dy / dist
        const nz = dz / dist
        const push = (COLLIDE_DIST - dist) * 0.5
        a.x -= nx * push
        a.y -= ny * push
        a.z -= nz * push
        b.x += nx * push
        b.y += ny * push
        b.z += nz * push
      }
    }
  }
}
