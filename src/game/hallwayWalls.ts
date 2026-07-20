import * as THREE from 'three'

import { PASS_HALF, ROOM_HALF, ROOM_STEP } from './data'

export type HallwayOrientation = 'horizontal' | 'vertical'
export type HallwayWallStyle = 'formal-walnut' | 'service-tile' | 'public-stone' | 'damp-flagstone'

export interface HallwayWallsOptions {
  orientation: HallwayOrientation
  style: HallwayWallStyle
  /** World-space centre of the passage. */
  x: number
  z: number
  wallHeight?: number
  wallThickness?: number
  /** Mirrors the authored marks while preserving neutral lighting. */
  mirrored?: boolean
}

export interface HallwayWalls {
  group: THREE.Group
  walls: readonly THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  trims: readonly THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  materials: readonly THREE.MeshStandardMaterial[]
  textures: readonly THREE.DataTexture[]
  dispose: () => void
}

const TEXTURE_WIDTH = 160
const TEXTURE_HEIGHT = 80
const DEFAULT_WALL_HEIGHT = 1.85
const PASSAGE_LENGTH = ROOM_STEP - ROOM_HALF * 2 + 0.6

type Rgb = readonly [number, number, number]

interface PixelSurface {
  data: Uint8Array
  fill: (color: Rgb) => void
  rect: (x: number, y: number, width: number, height: number, color: Rgb) => void
  line: (x0: number, y0: number, x1: number, y1: number, color: Rgb, thickness?: number) => void
}

function surface(): PixelSurface {
  const data = new Uint8Array(TEXTURE_WIDTH * TEXTURE_HEIGHT * 4)
  const set = (x: number, y: number, color: Rgb): void => {
    if (x < 0 || x >= TEXTURE_WIDTH || y < 0 || y >= TEXTURE_HEIGHT) return
    const offset = (Math.floor(y) * TEXTURE_WIDTH + Math.floor(x)) * 4
    data[offset] = color[0]
    data[offset + 1] = color[1]
    data[offset + 2] = color[2]
    data[offset + 3] = 255
  }
  const rect = (x: number, y: number, width: number, height: number, color: Rgb): void => {
    for (let py = Math.floor(y); py < y + height; py++) {
      for (let px = Math.floor(x); px < x + width; px++) set(px, py, color)
    }
  }
  const fill = (color: Rgb): void => rect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT, color)
  const line = (x0: number, y0: number, x1: number, y1: number, color: Rgb, thickness = 1): void => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
    for (let step = 0; step <= steps; step++) {
      const t = step / steps
      const x = Math.round(x0 + (x1 - x0) * t)
      const y = Math.round(y0 + (y1 - y0) * t)
      rect(x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, color)
    }
  }
  return { data, fill, rect, line }
}

function formalWalnut(s: PixelSurface): void {
  s.fill([47, 34, 28])
  s.rect(0, 0, 160, 10, [25, 18, 16])
  s.rect(0, 10, 160, 25, [34, 24, 21])
  for (let x = 8; x < 160; x += 16) s.rect(x, 11, 2, 23, [67, 44, 34])
  s.rect(0, 34, 160, 3, [120, 83, 46])
  s.rect(0, 37, 160, 2, [24, 17, 16])
  for (let x = 14; x < 152; x += 32) s.rect(x, 52, 17, 2, [76, 50, 38])
  s.rect(48, 61, 40, 5, [54, 35, 29])
}

function serviceTile(s: PixelSurface): void {
  s.fill([91, 85, 76])
  s.rect(0, 0, 160, 10, [39, 38, 37])
  s.rect(0, 10, 160, 23, [50, 49, 47])
  s.rect(0, 32, 160, 3, [31, 31, 31])
  for (let x = 0; x < 160; x += 40) s.rect(x, 33, 2, 47, [61, 58, 54])
  s.rect(0, 56, 160, 2, [70, 66, 61])
  s.rect(28, 57, 24, 14, [66, 61, 56])
  s.rect(108, 39, 34, 17, [78, 71, 64])
  s.rect(17, 74, 48, 3, [76, 49, 32])
}

function publicStone(s: PixelSurface): void {
  s.fill([50, 53, 64])
  s.rect(0, 0, 160, 10, [28, 29, 36])
  s.rect(0, 10, 160, 25, [38, 40, 49])
  s.rect(0, 34, 160, 3, [91, 90, 108])
  for (let x = 7; x < 160; x += 32) {
    s.rect(x, 42, 25, 25, [43, 45, 56])
    s.rect(x + 2, 44, 21, 2, [75, 76, 91])
  }
  s.rect(0, 68, 160, 3, [35, 36, 45])
  s.rect(0, 72, 160, 8, [27, 28, 35])
}

function dampFlagstone(s: PixelSurface): void {
  s.fill([69, 67, 61])
  s.rect(0, 0, 160, 11, [28, 28, 27])
  s.rect(0, 11, 160, 8, [38, 47, 53])
  const mortar: Rgb = [72, 79, 84]
  s.line(0, 35, 160, 31, mortar, 2)
  s.line(0, 58, 160, 63, mortar, 2)
  s.line(31, 18, 27, 58, mortar, 2)
  s.line(79, 34, 84, 80, mortar, 2)
  s.line(126, 17, 119, 62, mortar, 2)
  s.line(101, 61, 110, 80, mortar, 2)
  s.rect(0, 12, 48, 7, [34, 49, 58])
  s.rect(93, 18, 67, 5, [43, 53, 57])
  s.line(52, 39, 61, 48, [26, 27, 27])
  s.line(61, 48, 57, 55, [26, 27, 27])
}

function createWallTexture(style: HallwayWallStyle, mirrored: boolean): THREE.DataTexture {
  const s = surface()
  if (style === 'formal-walnut') formalWalnut(s)
  if (style === 'service-tile') serviceTile(s)
  if (style === 'public-stone') publicStone(s)
  if (style === 'damp-flagstone') dampFlagstone(s)

  if (mirrored) {
    const row = new Uint8Array(TEXTURE_WIDTH * 4)
    for (let y = 0; y < TEXTURE_HEIGHT; y++) {
      for (let x = 0; x < TEXTURE_WIDTH; x++) {
        const source = (y * TEXTURE_WIDTH + x) * 4
        const target = (TEXTURE_WIDTH - 1 - x) * 4
        row.set(s.data.subarray(source, source + 4), target)
      }
      s.data.set(row, y * TEXTURE_WIDTH * 4)
    }
  }

  const texture = new THREE.DataTexture(s.data, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat)
  texture.name = `${style}-hallway-wall${mirrored ? '-mirrored' : ''}`
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function trimColor(style: HallwayWallStyle): number {
  if (style === 'formal-walnut') return 0x211815
  if (style === 'service-tile') return 0x292827
  if (style === 'public-stone') return 0x20222b
  return 0x1e1e1d
}

/** Build both architectural side walls while leaving the full 3-unit passage lane clear. */
export function createHallwayWalls(parent: THREE.Group, options: HallwayWallsOptions): HallwayWalls {
  const wallHeight = options.wallHeight ?? DEFAULT_WALL_HEIGHT
  const wallThickness = options.wallThickness ?? 0.18
  const textures = [
    createWallTexture(options.style, options.mirrored ?? false),
    createWallTexture(options.style, !(options.mirrored ?? false)),
  ]
  const materials = textures.map(map => new THREE.MeshStandardMaterial({
    map,
    color: 0xd8d1c8,
    roughness: options.style === 'formal-walnut' ? 0.76 : 0.94,
    metalness: 0,
  }))
  const baseMaterial = new THREE.MeshStandardMaterial({ color: trimColor(options.style), roughness: 0.86 })
  const group = new THREE.Group()
  group.name = `${options.style}-${options.orientation}-hallway-walls`
  group.position.set(options.x, 0, options.z)
  parent.add(group)

  const walls: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = []
  const trims: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = []
  const sideOffset = PASS_HALF + wallThickness / 2
  for (const side of [-1, 1] as const) {
    const geometry = options.orientation === 'horizontal'
      ? new THREE.BoxGeometry(PASSAGE_LENGTH, wallHeight, wallThickness)
      : new THREE.BoxGeometry(wallThickness, wallHeight, PASSAGE_LENGTH)
    const wall = new THREE.Mesh(geometry, materials[side < 0 ? 0 : 1])
    wall.position.set(
      options.orientation === 'vertical' ? side * sideOffset : 0,
      wallHeight / 2,
      options.orientation === 'horizontal' ? side * sideOffset : 0,
    )
    group.add(wall)
    walls.push(wall)

    // Room door openings are wider than the passage lane. Short perpendicular
    // returns at both ends close the visible half-unit notch and create a
    // deliberate funnel into the 3-unit hallway without narrowing its path.
    const doorwayHalf = PASS_HALF + 0.6
    const returnDepth = doorwayHalf - PASS_HALF
    for (const end of [-1, 1] as const) {
      const returnGeometry = options.orientation === 'horizontal'
        ? new THREE.BoxGeometry(wallThickness, wallHeight, returnDepth)
        : new THREE.BoxGeometry(returnDepth, wallHeight, wallThickness)
      const returnWall = new THREE.Mesh(returnGeometry, materials[side < 0 ? 0 : 1])
      returnWall.position.set(
        options.orientation === 'horizontal' ? end * PASSAGE_LENGTH / 2 : side * (PASS_HALF + returnDepth / 2),
        wallHeight / 2,
        options.orientation === 'horizontal' ? side * (PASS_HALF + returnDepth / 2) : end * PASSAGE_LENGTH / 2,
      )
      group.add(returnWall)
      walls.push(returnWall)
    }

    // Stop short of thresholds by roughly 8 authored pixels on each end.
    const trimLength = PASSAGE_LENGTH * (144 / TEXTURE_WIDTH)
    const trimGeometry = options.orientation === 'horizontal'
      ? new THREE.BoxGeometry(trimLength, 0.13, wallThickness + 0.035)
      : new THREE.BoxGeometry(wallThickness + 0.035, 0.13, trimLength)
    const trim = new THREE.Mesh(trimGeometry, baseMaterial)
    trim.position.set(wall.position.x, 0.16, wall.position.z)
    group.add(trim)
    trims.push(trim)
  }

  const doorwaySpan = (PASS_HALF + 0.6) * 2
  const addCrownPart = (
    end: -1 | 1,
    travelDepth: number,
    span: number,
    height: number,
    y: number,
    lateralOffset = 0,
    material = baseMaterial,
  ) => {
    const geometry = options.orientation === 'horizontal'
      ? new THREE.BoxGeometry(travelDepth, height, span)
      : new THREE.BoxGeometry(span, height, travelDepth)
    const piece = new THREE.Mesh(geometry, material)
    piece.position.set(
      options.orientation === 'horizontal' ? end * PASSAGE_LENGTH / 2 : lateralOffset,
      y,
      options.orientation === 'horizontal' ? lateralOffset : end * PASSAGE_LENGTH / 2,
    )
    group.add(piece)
    trims.push(piece)
  }

  // Themed crown moulding caps both entrances. All pieces sit at or above the
  // wall line, so the full doorway and navigation lane remain unobstructed.
  for (const end of [-1, 1] as const) {
    addCrownPart(end, 0.22, doorwaySpan + 0.16, 0.17, wallHeight - 0.17)
    addCrownPart(end, 0.28, doorwaySpan + 0.42, 0.09, wallHeight - 0.045)

    if (options.style === 'formal-walnut') {
      for (const offset of [-1.45, -0.72, 0, 0.72, 1.45]) {
        addCrownPart(end, 0.27, 0.18, 0.18, wallHeight - 0.32, offset)
      }
    } else if (options.style === 'service-tile') {
      for (const offset of [-1.25, 0, 1.25]) {
        addCrownPart(end, 0.25, 0.32, 0.13, wallHeight - 0.285, offset, materials[0])
      }
    } else if (options.style === 'public-stone') {
      addCrownPart(end, 0.32, 0.54, 0.27, wallHeight - 0.26, 0, materials[0])
      addCrownPart(end, 0.26, 0.28, 0.19, wallHeight - 0.28, -1.42)
      addCrownPart(end, 0.26, 0.28, 0.19, wallHeight - 0.28, 1.42)
    } else {
      for (const [offset, span, drop] of [[-1.48, 0.42, 0.03], [-0.5, 0.48, 0.08], [0.55, 0.38, 0], [1.5, 0.45, 0.06]] as const) {
        addCrownPart(end, 0.3, span, 0.2, wallHeight - 0.29 - drop, offset, materials[0])
      }
    }
  }

  let disposed = false
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    parent.remove(group)
    for (const wall of walls) wall.geometry.dispose()
    for (const trim of trims) trim.geometry.dispose()
    for (const material of materials) material.dispose()
    baseMaterial.dispose()
    for (const texture of textures) texture.dispose()
  }

  return { group, walls, trims, materials: [...materials, baseMaterial], textures, dispose }
}
