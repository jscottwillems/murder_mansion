import * as THREE from 'three'

import { ROOM_HALF } from './data'

export type ExteriorWall = 'north' | 'south' | 'east' | 'west'
export type StormWindowState = 'dark-rain' | 'preflash' | 'flash' | 'afterglow'

export interface StormWindowOptions {
  side: ExteriorWall
  /** Position along the wall, measured from the room centre. */
  offset?: number
  width?: number
  height?: number
  sillHeight?: number
  wallHeight?: number
  wallThickness?: number
  rainStreaks?: number
  seed?: number
}

export interface StormWindowMaterials {
  sky: THREE.MeshBasicMaterial
  rain: THREE.LineBasicMaterial
  frame: THREE.MeshStandardMaterial
  lightning: THREE.LineBasicMaterial
}

export interface StormWindowHandles {
  group: THREE.Group
  sky: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  lightningVein: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>
  rain: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>
  flashLight: THREE.PointLight
  materials: StormWindowMaterials
  state: StormWindowState
  /** Stable phase offset used to keep multiple windows from moving in lockstep. */
  phase: number
  update: (time: number, lightningLevel: number) => StormWindowState
}

const DEFAULT_WALL_HEIGHT = 1.85
const DEFAULT_WALL_THICKNESS = 0.35
const DEFAULT_WINDOW_HEIGHT = 1.12
const STATE_COLORS: Record<StormWindowState, number> = {
  'dark-rain': 0x101a2c,
  preflash: 0x263a5a,
  flash: 0xb9d9ff,
  afterglow: 0x536f99,
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function wallTransform(group: THREE.Group, side: ExteriorWall, offset: number, wallThickness: number): void {
  const face = ROOM_HALF - wallThickness / 2 - 0.014
  if (side === 'north') group.position.set(offset, 0, -face)
  if (side === 'south') {
    group.position.set(-offset, 0, face)
    group.rotation.y = Math.PI
  }
  if (side === 'west') {
    group.position.set(-face, 0, -offset)
    group.rotation.y = Math.PI / 2
  }
  if (side === 'east') {
    group.position.set(face, 0, offset)
    group.rotation.y = -Math.PI / 2
  }
}

function addFrameBar(
  group: THREE.Group,
  material: THREE.MeshStandardMaterial,
  width: number,
  height: number,
  x: number,
  y: number,
): void {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.09), material)
  bar.position.set(x, y, 0.035)
  group.add(bar)
}

function stateFor(level: number, time: number, phase: number): StormWindowState {
  if (level >= 0.62) return 'flash'
  if (level >= 0.13) return 'afterglow'
  // A cold, brief gathering glow gives a readable preflash even when the
  // world's lightning controller jumps directly from zero to full intensity.
  if (level > 0 || Math.sin(time * 0.83 + phase) > 0.965) return 'preflash'
  return 'dark-rain'
}

/**
 * Adds an animated storm window to a room-local group. Room groups are assumed
 * to be centred on a 10x10 room; the returned assembly sits on the interior
 * face of the requested exterior wall.
 */
export function createStormWindow(roomGroup: THREE.Group, options: StormWindowOptions): StormWindowHandles {
  const width = options.width ?? 2.2
  const wallHeight = options.wallHeight ?? DEFAULT_WALL_HEIGHT
  // Grow the default glass with the architecture. Explicitly authored window
  // heights remain exact overrides, while the sill keeps its established line.
  const height = options.height ?? DEFAULT_WINDOW_HEIGHT * (wallHeight / DEFAULT_WALL_HEIGHT)
  const sillHeight = options.sillHeight ?? 0.59
  const wallThickness = options.wallThickness ?? DEFAULT_WALL_THICKNESS
  const count = Math.max(6, Math.floor(options.rainStreaks ?? 22))
  const seed = options.seed ?? options.side.charCodeAt(0) * 7919
  const random = mulberry32(seed)
  const phase = random() * Math.PI * 2

  const group = new THREE.Group()
  group.name = `storm-window-${options.side}`
  wallTransform(group, options.side, options.offset ?? 0, wallThickness)
  roomGroup.add(group)

  const skyMaterial = new THREE.MeshBasicMaterial({
    color: STATE_COLORS['dark-rain'],
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(width, height), skyMaterial)
  sky.position.set(0, sillHeight + height / 2, 0)
  group.add(sky)

  const rainPositions = new Float32Array(count * 6)
  for (let index = 0; index < count; index++) {
    const cursor = index * 6
    const x = (random() - 0.5) * width * 0.92
    const y = random() * height
    const length = 0.1 + random() * 0.2
    rainPositions.set([x, y, 0.012, x - 0.035, y - length, 0.012], cursor)
  }
  const rainGeometry = new THREE.BufferGeometry()
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
  const rainMaterial = new THREE.LineBasicMaterial({ color: 0x8aa8c4, transparent: true, opacity: 0.5, toneMapped: false })
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial)
  rain.position.y = sillHeight
  group.add(rain)

  const lightningGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.18, height * 0.48, 0.018), new THREE.Vector3(0.03, height * 0.14, 0.018),
    new THREE.Vector3(0.03, height * 0.14, 0.018), new THREE.Vector3(-0.07, -height * 0.08, 0.018),
    new THREE.Vector3(-0.07, -height * 0.08, 0.018), new THREE.Vector3(0.19, -height * 0.43, 0.018),
    new THREE.Vector3(0.03, height * 0.14, 0.018), new THREE.Vector3(0.26, height * 0.01, 0.018),
  ])
  const lightningMaterial = new THREE.LineBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0, toneMapped: false })
  const lightningVein = new THREE.LineSegments(lightningGeometry, lightningMaterial)
  lightningVein.position.set(width * 0.18, sillHeight + height / 2, 0)
  group.add(lightningVein)

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x171a20, roughness: 0.84, metalness: 0.12 })
  const centreY = sillHeight + height / 2
  addFrameBar(group, frameMaterial, width + 0.28, 0.1, 0, sillHeight - 0.02)
  addFrameBar(group, frameMaterial, width + 0.28, 0.1, 0, sillHeight + height + 0.02)
  addFrameBar(group, frameMaterial, 0.1, height + 0.2, -width / 2 - 0.04, centreY)
  addFrameBar(group, frameMaterial, 0.1, height + 0.2, width / 2 + 0.04, centreY)
  addFrameBar(group, frameMaterial, 0.065, height, 0, centreY)
  addFrameBar(group, frameMaterial, width, 0.065, 0, centreY)

  const flashLight = new THREE.PointLight(0xb8d8ff, 0, 8, 1.35)
  flashLight.position.set(0, Math.min(wallHeight - 0.15, centreY + 0.25), 2.55)
  group.add(flashLight)

  const handles: StormWindowHandles = {
    group,
    sky,
    lightningVein,
    rain,
    flashLight,
    materials: { sky: skyMaterial, rain: rainMaterial, frame: frameMaterial, lightning: lightningMaterial },
    state: 'dark-rain',
    phase,
    update: (time, lightningLevel) => updateStormWindow(handles, time, lightningLevel),
  }
  return handles
}

export function updateStormWindow(window: StormWindowHandles, time: number, lightningLevel: number): StormWindowState {
  const level = THREE.MathUtils.clamp(lightningLevel, 0, 1)
  const state = stateFor(level, time, window.phase)
  window.state = state
  window.materials.sky.color.setHex(STATE_COLORS[state])
  // The room wall is continuous behind this inset plane. Keep the sky backing
  // opaque so the masonry/wallpaper cannot ghost through the dark glass.
  window.materials.sky.opacity = 1
  window.materials.sky.transparent = false
  window.materials.lightning.opacity = state === 'flash' ? 0.78 + level * 0.22 : 0
  window.materials.rain.opacity = state === 'flash' ? 0.82 : state === 'preflash' ? 0.63 : 0.5
  window.flashLight.intensity = state === 'preflash' ? 0.7 : level * 13

  const positions = window.rain.geometry.getAttribute('position') as THREE.BufferAttribute
  const height = (window.sky.geometry.parameters.height as number)
  const halfWidth = (window.sky.geometry.parameters.width as number) / 2
  for (let index = 0; index < positions.count; index += 2) {
    const streak = index / 2
    const length = positions.getY(index) - positions.getY(index + 1)
    const speed = 0.38 + (streak % 7) * 0.055
    const rawY = height - ((time * speed + window.phase + streak * 0.173) % (height + 0.3))
    // Line geometry has no CSS-style overflow clipping. Clamp both endpoints
    // to the glass rectangle so wrapped streaks never draw over the wall.
    const y = THREE.MathUtils.clamp(rawY, 0, height)
    const tailY = THREE.MathUtils.clamp(rawY - length, 0, height)
    positions.setY(index, y)
    positions.setY(index + 1, tailY)
    const sway = Math.sin(time * 1.8 + streak * 2.1 + window.phase) * 0.018
    const headX = THREE.MathUtils.clamp(positions.getX(index), -halfWidth, halfWidth)
    positions.setX(index, headX)
    positions.setX(index + 1, THREE.MathUtils.clamp(headX - 0.035 + sway, -halfWidth, halfWidth))
  }
  positions.needsUpdate = true
  return state
}

export function updateStormWindows(windows: readonly StormWindowHandles[], time: number, lightningLevel: number): void {
  for (const window of windows) updateStormWindow(window, time, lightningLevel)
}
