// Three.js mansion renderer: 3x3 rooms, passageways, characters,
// pixel-art noir pipeline (low-res render target upscaled nearest-neighbor),
// rain, lightning, dust motes, lamplight.
import * as THREE from 'three'
import type { RoomId } from './types'
import { ROOMS, ROOM_HALF, ROOM_STEP, PASS_HALF, roomCenter } from './data'
import { atlasFrame, CHARACTER_ATLAS, NPC_ATLAS_V3 } from './characterAtlas'
import { getWallTexture, disposeWallTextures } from './wallSprites'
import { createStormWindow, updateStormWindows, type ExteriorWall, type StormWindowHandles } from './stormWindows'
import { createCellarSconces, type CellarSconces } from './cellarSconces'
import { disposeHallwayTextures, getHallwayTexture, hallwayConnectionBetween, HALLWAY_CONNECTIONS, type HallwayVariant } from './hallwaySprites'
import { createHallwayWalls, type HallwayWalls, type HallwayWallStyle } from './hallwayWalls'

interface Actor {
  group: THREE.Group
  body: THREE.Mesh
  head: THREE.Mesh
  label: HTMLDivElement
  walking: boolean
  dead: boolean
  bob: number
  leftArm: THREE.Group
  rightArm: THREE.Group
  leftLeg: THREE.Group
  rightLeg: THREE.Group
  prop: THREE.Group
  idleKind: string
  facingY: number
  targetFacingY: number
  outline: THREE.Group
  outlined: boolean
  spriteRoot: THREE.Group | null
  spriteMaterial: THREE.MeshBasicMaterial | null
  spriteFlip: number
  spriteScale: number
  spriteAtlas: boolean
  spriteKind: 'detective' | 'npc' | null
  spriteRows: number
  spriteFrame: number
  defaultForward: boolean
  action: 'investigate' | null
  actionStartedAt: number
  actionUntil: number
}

interface CeilingInsect {
  mesh: THREE.Mesh
  center: THREE.Vector3
  phase: number
  radius: number
  speed: number
  vertical: number
  flutter: number
  kind: 'fly' | 'moth'
}

const PIXEL_SCALE = 0.58 // render-target resolution fraction
const WALL_H = 1.85
const WALL_T = 0.35
// A lower, more forward isometric view keeps the full-body portrait sprites
// readable instead of visually foreshortening them against the floor.
const CAMERA_HEIGHT = 11.7
const CAMERA_Z_OFFSET = 10.4
const ACTOR_LABEL_HEIGHT = 2.32
const ROOM_EDGE_FOCUS_START = 0.52
const ROOM_EDGE_FOCUS_END = 1.1
const ROOM_EDGE_PLAYER_WEIGHT = 0.72
const PASSAGE_FOCUS_HALF = PASS_HALF - 0.15
const CONVERSATION_FOCUS_X_OFFSET = -0.75

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export class MansionScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private rt: THREE.WebGLRenderTarget
  private quadScene = new THREE.Scene()
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private container: HTMLElement
  private labelLayer: HTMLDivElement
  private actors = new Map<string, Actor>()
  private camTarget = new THREE.Vector3(0, 0, 0)
  private camLook = new THREE.Vector3(0, 0, 0)
  private camPos = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_Z_OFFSET)
  private ambient: THREE.AmbientLight
  private moon: THREE.DirectionalLight
  private edgeMat = new THREE.LineBasicMaterial({ color: 0x08070a, transparent: true, opacity: 0.42 })
  private roomLights = new Map<RoomId, THREE.PointLight[]>()
  private stormWindows: StormWindowHandles[] = []
  private cellarSconces: CellarSconces | null = null
  private hallwayWalls: HallwayWalls[] = []
  private ceilingInsects: CeilingInsect[] = []
  private materialCache = new Map<string, THREE.MeshStandardMaterial>()
  private floorTextureCache = new Map<string, THREE.Texture>()
  private rain!: THREE.Points
  private rainVel: Float32Array = new Float32Array(0)
  private dust!: THREE.Points
  private dustBase: Float32Array = new Float32Array(0)
  private lightningT = 0
  private nextLightning = 5
  private flash = 0
  onThunder: (intensity: number) => void = () => {}
  private time = 0

  constructor(container: HTMLElement) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(1)
    // Compress bright practical-light gradients before the low-resolution pixel
    // pass. Without tone mapping, the steep point-light falloff quantizes into
    // visible concentric bands across darker room floors.
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.inset = '0'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    container.appendChild(this.renderer.domElement)

    this.labelLayer = document.createElement('div')
    this.labelLayer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;'
    container.appendChild(this.labelLayer)

    this.camera = new THREE.PerspectiveCamera(47, 1, 0.1, 200)
    this.scene.fog = new THREE.FogExp2(0x07070c, 0.009)
    this.scene.background = new THREE.Color(0x07070c)

    this.ambient = new THREE.AmbientLight(0x474553, 1.08)
    this.scene.add(this.ambient)
    this.moon = new THREE.DirectionalLight(0x9aabd2, 0.33)
    this.moon.position.set(-20, 30, -10)
    this.scene.add(this.moon)

    this.buildMansion()
    this.buildRain()
    this.buildDust()

    // pixel pipeline
    this.rt = new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
    })
    const quadMat = new THREE.MeshBasicMaterial({ map: this.rt.texture })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat)
    this.quadScene.add(quad)

    this.resize()
    window.addEventListener('resize', this.resize)
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
    this.renderer.dispose()
    this.rt.dispose()
    this.edgeMat.dispose()
    disposeWallTextures()
    disposeHallwayTextures()
    for (const hallway of this.hallwayWalls) hallway.dispose()
    this.container.removeChild(this.renderer.domElement)
    this.container.removeChild(this.labelLayer)
  }

  private resize = () => {
    const w = Math.max(2, this.container.clientWidth)
    const h = Math.max(2, this.container.clientHeight)
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.rt.setSize(Math.max(2, Math.floor(w * PIXEL_SCALE)), Math.max(2, Math.floor(h * PIXEL_SCALE)))
  }

  // ------------------------------------------------------------ mansion build

  private mat(color: number, rough = 0.9): THREE.MeshStandardMaterial {
    const key = `${color}:${rough}`
    let material = this.materialCache.get(key)
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.08 })
      this.materialCache.set(key, material)
    }
    return material
  }

  private floorMat(roomId: RoomId, fallbackColor: number): THREE.MeshBasicMaterial {
    let texture = this.floorTextureCache.get(roomId)
    if (!texture) {
      texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/floors/${roomId}.png`)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.NearestFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy())
      this.floorTextureCache.set(roomId, texture)
    }
    return new THREE.MeshBasicMaterial({ map: texture, color: fallbackColor, toneMapped: false })
  }

  private addBoxEdges(mesh: THREE.Mesh) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), this.edgeMat)
    mesh.add(edges)
  }

  private buildMansion() {
    // ground plane
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), this.mat(0x0a0a10, 1))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.32
    this.scene.add(ground)

    for (const r of ROOMS) {
      const g = new THREE.Group()
      const c = roomCenter(r.id)
      g.position.set(c.x, 0, c.z)

      // floor + trim
      const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF * 2, 0.3, ROOM_HALF * 2), this.mat(r.floor))
      floor.position.y = -0.15
      this.addBoxEdges(floor)
      g.add(floor)
      // Keep floor color stable under the low-resolution render target. Lit
      // floor gradients quantize into concentric rings; room geometry above the
      // floor remains dynamically lit.
      const floorSurface = new THREE.Mesh(new THREE.PlaneGeometry(9.82, 9.82), this.floorMat(r.id, 0xffffff))
      floorSurface.rotation.x = -Math.PI / 2
      floorSurface.position.y = 0.008
      g.add(floorSurface)
      const trim = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF * 2 + 0.3, 0.1, ROOM_HALF * 2 + 0.3), this.mat(r.accent, 0.6))
      trim.position.y = -0.26
      this.addBoxEdges(trim)
      g.add(trim)

      // walls with door gaps
      this.buildWalls(g, r.id, r.col, r.row)
      this.buildStormWindows(g, r.col, r.row)

      this.buildRoomLighting(g, r.id, r.lightColor, r.lightIntensity)

      if (r.id === 'cellar') {
        this.cellarSconces = createCellarSconces()
        g.add(this.cellarSconces.group)
      }

      this.scene.add(g)
    }

    // passages
    for (const r of ROOMS) {
      const c = roomCenter(r.id)
      if (r.col < 2) {
        const neighbor = ROOMS.find(room => room.col === r.col + 1 && room.row === r.row)!
        this.buildHallway(r.id, neighbor.id, c.x + ROOM_STEP / 2, c.z, 'horizontal')
        for (const s of [-1, 1]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, WALL_H, 6), this.mat(0x3a3228))
          col.position.set(c.x + ROOM_STEP / 2, WALL_H / 2, c.z + s * PASS_HALF)
          this.scene.add(col)
        }
      }
      if (r.row < 2) {
        const neighbor = ROOMS.find(room => room.col === r.col && room.row === r.row + 1)!
        this.buildHallway(r.id, neighbor.id, c.x, c.z + ROOM_STEP / 2, 'vertical')
        for (const s of [-1, 1]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, WALL_H, 6), this.mat(0x3a3228))
          col.position.set(c.x + s * PASS_HALF, WALL_H / 2, c.z + ROOM_STEP / 2)
          this.scene.add(col)
        }
      }
    }
  }

  private buildHallway(from: RoomId, to: RoomId, x: number, z: number, orientation: 'horizontal' | 'vertical') {
    const id = hallwayConnectionBetween(from, to)
    if (!id) return
    const definition = HALLWAY_CONNECTIONS[id]
    const length = ROOM_STEP - ROOM_HALF * 2 + 0.6
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    if (orientation === 'vertical') group.rotation.y = -Math.PI / 2

    const base = new THREE.Mesh(new THREE.BoxGeometry(length, 0.25, PASS_HALF * 2), this.mat(0x2b2620))
    base.position.y = -0.12
    this.addBoxEdges(base)
    group.add(base)
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(length, PASS_HALF * 2),
      new THREE.MeshBasicMaterial({ map: getHallwayTexture(id), toneMapped: false }),
    )
    surface.rotation.x = -Math.PI / 2
    surface.position.y = 0.012
    group.add(surface)
    this.scene.add(group)

    const wallStyles: Record<HallwayVariant, HallwayWallStyle> = {
      'walnut-runner': 'formal-walnut',
      'service-tile': 'service-tile',
      'formal-stone': 'public-stone',
      'damp-flagstone': 'damp-flagstone',
    }
    const wallRoot = new THREE.Group()
    this.scene.add(wallRoot)
    this.hallwayWalls.push(createHallwayWalls(wallRoot, {
      orientation,
      style: wallStyles[definition.variant],
      x,
      z,
      wallHeight: WALL_H,
      mirrored: definition.mirrored,
    }))
  }

  private buildStormWindows(g: THREE.Group, col: number, row: number) {
    const sides: ExteriorWall[] = []
    if (row === 0) sides.push('north')
    if (row === 2) sides.push('south')
    if (col === 0) sides.push('west')
    if (col === 2) sides.push('east')
    for (const [index, side] of sides.entries()) {
      this.stormWindows.push(createStormWindow(g, { side, wallHeight: WALL_H, wallThickness: WALL_T, seed: col * 101 + row * 17 + index * 7919 }))
    }
  }

  /** Authored practicals keep each room's pools of light tied to its purpose. */
  private buildRoomLighting(g: THREE.Group, room: RoomId, color: number, intensity: number) {
    const layouts: Record<RoomId, Array<[number, number, number]>> = {
      study: [[0, -0.85, 1.2]],
      gallery: [[0, -0.7, 1.15]],
      conservatory: [[-2.1, 1.4, 0.72], [2.15, -1.45, 0.68]],
      kitchen: [[-2.2, -1.8, 0.72], [2.25, 2.0, 0.66]],
      dining: [[0, 0.55, 1.35]],
      ballroom: [[0, 0, 1.55]],
      cellar: [[-2.65, 2.1, 0.48], [2.7, -2.35, 0.43]],
      library: [[0, 0.15, 1.35]],
      suite: [[0.35, 0.2, 1.3]],
    }
    const fixtureAssets: Record<RoomId, [string, number]> = {
      study: ['study-ceiling-pendant', 1.55],
      gallery: ['gallery-ceiling-pendant', 1.7],
      conservatory: ['conservatory-ceiling-pendant', 1.5],
      kitchen: ['kitchen-ceiling-bulb', 1.35],
      dining: ['dining-ceiling-chandelier', 1.9],
      ballroom: ['ballroom-ceiling-chandelier', 2.15],
      cellar: ['cellar-ceiling-bulb', 1.38],
      library: ['library-ceiling-pendant', 1.82],
      suite: ['suite-ceiling-pendant', 1.82],
    }
    const lights: THREE.PointLight[] = []
    for (const [x, z, share] of layouts[room]) {
      const fixtureY = room === 'ballroom' || room === 'dining' ? 2.58 : 2.48
      const [asset, spriteHeight] = fixtureAssets[room]
      this.buildLightingSprite(g, asset, x, fixtureY - 0.25, z, spriteHeight)
      if (room === 'cellar') this.buildCeilingInsects(g, 'fly', x, fixtureY - 0.04, z, 7)
      if (room === 'conservatory') this.buildCeilingInsects(g, 'moth', x, fixtureY - 0.02, z, 5)
      const light = new THREE.PointLight(color, intensity * 21 * share, room === 'ballroom' ? 14 : 11.5, 1.4)
      light.position.set(x, fixtureY + 0.08, z)
      light.userData.baseIntensity = light.intensity
      g.add(light)
      lights.push(light)
    }
    this.roomLights.set(room, lights)
  }

  private buildLightingSprite(g: THREE.Group, asset: string, x: number, y: number, z: number, height: number) {
    const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/lighting/${asset}.png`, loaded => {
      const image = loaded.image as { width?: number; height?: number } | undefined
      if (image?.width && image.height) sprite.scale.x = height * image.width / image.height
    })
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.NearestFilter
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.04, toneMapped: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(height, height, 1)
    sprite.position.set(x, y, z)
    sprite.center.set(0.5, 0.08)
    sprite.renderOrder = 3
    g.add(sprite)
  }

  private buildCeilingInsects(g: THREE.Group, kind: 'fly' | 'moth', x: number, y: number, z: number, count: number) {
    const geometry = kind === 'moth'
      ? new THREE.CircleGeometry(0.055, 3)
      : new THREE.SphereGeometry(0.022, 5, 4)
    const material = new THREE.MeshBasicMaterial({
      color: kind === 'moth' ? 0xead9a6 : 0x15100c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: kind === 'moth' ? 0.88 : 0.95,
      toneMapped: false,
    })
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      const phase = i * 2.399 + (kind === 'moth' ? 0.7 : 0.2)
      const radius = (kind === 'moth' ? 0.3 : 0.2) + (i % 3) * (kind === 'moth' ? 0.13 : 0.1)
      mesh.position.set(x + Math.cos(phase) * radius, y, z + Math.sin(phase) * radius)
      mesh.renderOrder = 4
      g.add(mesh)
      this.ceilingInsects.push({
        mesh,
        center: new THREE.Vector3(x, y, z),
        phase,
        radius,
        speed: (kind === 'moth' ? 1.25 : 3.4) + (i % 4) * (kind === 'moth' ? 0.18 : 0.45),
        vertical: 0.1 + (i % 3) * 0.045,
        flutter: 8.5 + i * 0.7,
        kind,
      })
    }
  }

  private buildWalls(g: THREE.Group, room: RoomId, col: number, row: number) {
    const m = new THREE.MeshStandardMaterial({
      map: getWallTexture(room),
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.04,
    })
    const gap = PASS_HALF + 0.6 // door half-width
    const mk = (w: number, d: number, x: number, z: number) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), m)
      wall.position.set(x, WALL_H / 2, z)
      this.addBoxEdges(wall)
      g.add(wall)
    }
    const L = ROOM_HALF
    // sides: 0=north(-z) 1=south(+z) 2=west(-x) 3=east(+x)
    const sides = [
      { has: row > 0, len: L * 2, horiz: true, sign: -1 },   // north
      { has: row < 2, len: L * 2, horiz: true, sign: 1 },    // south
      { has: col > 0, len: L * 2, horiz: false, sign: -1 },  // west
      { has: col < 2, len: L * 2, horiz: false, sign: 1 },   // east
    ]
    for (const s of sides) {
      if (s.horiz) {
        const z = s.sign * L
        if (s.has) {
          const seg = L - gap
          mk(seg, WALL_T, -(gap + seg / 2), z)
          mk(seg, WALL_T, gap + seg / 2, z)
        } else {
          mk(L * 2, WALL_T, 0, z)
        }
      } else {
        const x = s.sign * L
        if (s.has) {
          const seg = L - gap
          mk(WALL_T, seg, x, -(gap + seg / 2))
          mk(WALL_T, seg, x, gap + seg / 2)
        } else {
          mk(WALL_T, L * 2, x, 0)
        }
      }
    }
  }

  // ------------------------------------------------------------ weather

  private buildRain() {
    const N = 240
    const pos = new Float32Array(N * 3)
    this.rainVel = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const p = this.randomOutdoorRainPoint()
      pos[i * 3] = p.x
      pos[i * 3 + 1] = 4 + Math.random() * 22
      pos[i * 3 + 2] = p.z
      this.rainVel[i] = 11 + Math.random() * 8
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0x7a8ab0, size: 0.08, transparent: true, opacity: 0.24 })
    this.rain = new THREE.Points(geo, mat)
    this.scene.add(this.rain)
  }

  private randomOutdoorRainPoint(): { x: number; z: number } {
    for (let tries = 0; tries < 40; tries++) {
      const x = (Math.random() - 0.5) * 92
      const z = (Math.random() - 0.5) * 92
      if (!this.isCoveredInterior(x, z)) return { x, z }
    }
    return {
      x: (Math.random() < 0.5 ? -1 : 1) * (24 + Math.random() * 22),
      z: (Math.random() - 0.5) * 92,
    }
  }

  private isCoveredInterior(x: number, z: number): boolean {
    for (const r of ROOMS) {
      const c = roomCenter(r.id)
      if (Math.abs(x - c.x) <= ROOM_HALF + 1.2 && Math.abs(z - c.z) <= ROOM_HALF + 1.2) return true
      if (r.col < 2) {
        const mid = c.x + ROOM_STEP / 2
        if (Math.abs(x - mid) <= ROOM_STEP / 2 - ROOM_HALF + 1.6 && Math.abs(z - c.z) <= PASS_HALF + 1.1) return true
      }
      if (r.row < 2) {
        const mid = c.z + ROOM_STEP / 2
        if (Math.abs(z - mid) <= ROOM_STEP / 2 - ROOM_HALF + 1.6 && Math.abs(x - c.x) <= PASS_HALF + 1.1) return true
      }
    }
    return false
  }

  private buildDust() {
    const N = 22
    this.dustBase = new Float32Array(N * 3)
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      this.dustBase[i * 3] = (Math.random() - 0.5) * 8
      this.dustBase[i * 3 + 1] = 0.4 + Math.random() * 2.8
      this.dustBase[i * 3 + 2] = (Math.random() - 0.5) * 8
      pos[i * 3] = this.dustBase[i * 3]
      pos[i * 3 + 1] = this.dustBase[i * 3 + 1]
      pos[i * 3 + 2] = this.dustBase[i * 3 + 2]
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xffe0a0, size: 0.035, transparent: true, opacity: 0.18 })
    this.dust = new THREE.Points(geo, mat)
    this.scene.add(this.dust)
  }

  // ------------------------------------------------------------ actors

  addActor(id: string, colorNum: number, name: string, isDetective: boolean, archetypeId?: string) {
    const group = new THREE.Group()
    const modelRoot = new THREE.Group()
    group.add(modelRoot)
    const outline = new THREE.Group()
    const chalkPoints = [
      [-0.2, -0.9], [-0.36, -0.58], [-0.7, -0.32], [-0.82, -0.08], [-0.69, 0.01],
      [-0.43, -0.2], [-0.34, 0.28], [-0.42, 0.72], [-0.25, 0.82], [-0.13, 0.38],
      [-0.12, 0.96], [-0.31, 1.17], [-0.27, 1.43], [-0.12, 1.62], [0.12, 1.62],
      [0.27, 1.43], [0.31, 1.17], [0.12, 0.96], [0.13, 0.38], [0.25, 0.82],
      [0.42, 0.72], [0.34, 0.28], [0.43, -0.2], [0.69, 0.01], [0.82, -0.08],
      [0.7, -0.32], [0.36, -0.58], [0.2, -0.9], [0, -0.6],
    ].map(([x, z]) => new THREE.Vector3(x, 0.045, z))
    const chalkCurve = new THREE.CatmullRomCurve3(chalkPoints, true, 'centripetal')
    const chalk = new THREE.Mesh(
      new THREE.TubeGeometry(chalkCurve, 72, 0.028, 4, true),
      new THREE.MeshBasicMaterial({ color: 0xeee9d8 }),
    )
    outline.add(chalk)
    outline.visible = false
    this.scene.add(outline)
    const box = (parent: THREE.Object3D, color: number, w: number, h: number, d: number, x: number, y: number, z = 0, rough = 0.82) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mat(color, rough))
      mesh.position.set(x, y, z); parent.add(mesh)
      return mesh
    }
    const cyl = (parent: THREE.Object3D, color: number, top: number, bottom: number, h: number, x: number, y: number, z = 0, segments = 8, rough = 0.82) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, h, segments), this.mat(color, rough))
      mesh.position.set(x, y, z); parent.add(mesh)
      return mesh
    }
    const panel = (color: number, top: number, bottom: number, h: number, y: number, z = 0) => cyl(modelRoot, color, top, bottom, h, 0, y, z, 4)
    const leftLeg = new THREE.Group(), rightLeg = new THREE.Group(), leftArm = new THREE.Group(), rightArm = new THREE.Group(), prop = new THREE.Group()
    leftLeg.position.set(-0.15, 0.48, 0); rightLeg.position.set(0.15, 0.48, 0)
    leftArm.position.set(-0.34, 0.98, 0); rightArm.position.set(0.34, 0.98, 0)
    modelRoot.add(leftLeg, rightLeg, leftArm, rightArm, prop)
    box(leftLeg, 0x252326, 0.2, 0.72, 0.25, 0, -0.36); box(rightLeg, 0x252326, 0.2, 0.72, 0.25, 0, -0.36)
    box(leftLeg, 0x171719, 0.24, 0.12, 0.34, 0, -0.73, -0.04); box(rightLeg, 0x171719, 0.24, 0.12, 0.34, 0, -0.73, -0.04)
    box(leftArm, colorNum, 0.18, 0.62, 0.22, 0, -0.27); box(rightArm, colorNum, 0.18, 0.62, 0.22, 0, -0.27)
    box(leftArm, 0xcba685, 0.2, 0.15, 0.22, 0, -0.62); box(rightArm, 0xcba685, 0.2, 0.15, 0.22, 0, -0.62)
    const body = box(modelRoot, colorNum, 0.6, 0.78, 0.4, 0, 0.78)
    const head = box(modelRoot, 0xcba685, 0.38, 0.37, 0.34, 0, 1.36, -0.01, 0.74)
    let idleKind = archetypeId || 'detective'
    if (isDetective) {
      idleKind = 'detective'; body.material = this.mat(0x2b2d2c, 0.86)
      ;[leftArm, rightArm].forEach(a => (a.children[0] as THREE.Mesh).material = this.mat(0x2b2d2c, 0.86))
      panel(0x2b2d2c, 0.27, 0.38, 0.7, 0.48, 0.03) // split trench skirts
      box(group, 0x373a31, 0.7, 0.14, 0.44, 0, 1.08); box(group, 0xb8a98c, 0.22, 0.25, 0.03, 0, 1.06, -0.22)
      box(group, 0x6b2527, 0.07, 0.3, 0.04, 0, 1.0, -0.245); box(group, 0xa78643, 0.11, 0.12, 0.04, 0.2, 0.92, -0.23)
      cyl(group, 0x332923, 0.36, 0.36, 0.055, 0, 1.56, 0, 8)
      const crown = box(group, 0x332923, 0.42, 0.23, 0.32, 0, 1.68); crown.rotation.z = -0.05
      box(group, 0x171819, 0.44, 0.055, 0.34, 0, 1.62)
      box(prop, 0x332923, 0.22, 0.3, 0.08, -0.42, 0.66, -0.18) // notebook
      const torch = cyl(prop, 0x252626, 0.08, 0.08, 0.27, 0.43, 0.62, -0.18, 8, 0.55); torch.rotation.z = Math.PI / 2
      cyl(prop, 0xd8cfaa, 0.09, 0.09, 0.04, 0.57, 0.62, -0.18, 8, 0.5).rotation.z = Math.PI / 2
    } else {
      switch (archetypeId) {
        case 'columnist': {
          body.material = this.mat(0x70405d); panel(0x533047, .25, .39, .64, .39)
          box(group, 0xe4d6b7, .42, .13, .05, 0, 1.04, -.23); box(group, 0x34202d, .42, .27, .35, 0, 1.49)
          cyl(group, 0x533047, .39, .39, .055, 0, 1.59); cyl(group, 0x533047, .23, .28, .17, -.05, 1.68)
          const feather = box(group, 0xe4d6b7, .1, .42, .06, .25, 1.84); feather.rotation.z = -.35
          box(prop, 0xc4a15b, .055, .58, .055, .47, .92, -.24).rotation.z = -.55; box(prop, 0x5a3b26, .22, .29, .08, -.39, .68, -.17)
          break
        }
        case 'surgeon':
          body.material = this.mat(0x273129); panel(0xddd9ca, .31, .36, .96, .58, .03)
          box(group, 0x252a29, .28, .65, .05, 0, .79, -.25); box(group, 0xeee9db, .19, .32, .04, 0, 1.08, -.27)
          box(group, 0xe6e1d5, .42, .15, .35, 0, 1.51); box(group, 0xe6e1d5, .43, .08, .1, 0, 1.25, -.2)
          box(prop, 0x777b77, .055, .28, .055, .43, 1.03, -.2).rotation.z = .15
          break
        case 'curator':
          body.material = this.mat(0xe5dcc1); panel(0x3f612d, .29, .57, .72, .39); box(group, 0x668447, .42, .56, .05, 0, .58, -.27)
          cyl(group, 0xb79a55, .43, .43, .055, 0, 1.57); cyl(group, 0xb79a55, .24, .29, .14, 0, 1.65)
          for (const [x,c] of [[-.24,0xc77a39],[.18,0xb96b72],[.3,0x587d37]] as const) cyl(group,c,.06,.07,.07,x,1.65,-.08,6)
          cyl(prop, 0x9a5332, .17, .12, .25, 0, .83, -.33); box(prop, 0x587d37, .06, .42, .06, 0, 1.12, -.33)
          for (const x of [-.12,.12]) { const leaf=box(prop,0x587d37,.22,.1,.06,x,1.23,-.33); leaf.rotation.z=x*2 }
          break
        case 'magician':
          body.material=this.mat(0x171a1e); panel(0xa42629,.28,.5,1.05,.57,.17); box(group,0x24272b,.91,.94,.07,0,.62,.24)
          box(group,0xa8a6a0,.25,.5,.04,0,.88,-.24); cyl(group,0x171a1e,.32,.32,.055,0,1.56); cyl(group,0x171a1e,.24,.27,.39,0,1.75)
          box(group,0x781b22,.52,.07,.29,0,1.61); box(prop,0xe9e5d7,.27,.38,.055,-.46,1.18,-.2); box(prop,0x171a1e,.08,.08,.02,-.46,1.18,-.24)
          box(prop,0x171a1e,.06,1.1,.06,.48,.55,-.12); cyl(prop,0xbd8f35,.1,.1,.1,.48,1.12,-.12,8,.52)
          break
        case 'correspondent': {
          body.material=this.mat(0x8b663d); box(group,0x8b2527,.6,.17,.42,0,1.09); box(group,0x523923,.44,.18,.34,.05,1.52)
          box(prop,0x232527,.39,.3,.22,0,.91,-.31); const lens=cyl(prop,0x777b77,.11,.13,.13,0,.91,-.46,8,.55); lens.rotation.x=Math.PI/2
          box(prop,0x523923,.24,.52,.38,.45,.63,0); box(group,0x523923,.07,1.05,.05,.12,.82,-.23).rotation.z=-.48
          break
        }
        case 'accountant':
          body.material=this.mat(0x314b2d); box(group,0x272b28,.3,.58,.04,0,.79,-.23); box(group,0xe2d9c4,.2,.3,.03,0,1.08,-.25)
          box(group,0x171719,.19,.075,.04,-.11,1.37,-.2); box(group,0x171719,.19,.075,.04,.11,1.37,-.2); box(group,0x171719,.06,.03,.04,0,1.37,-.2); box(group,0x20201c,.41,.12,.34,0,1.52)
          box(prop,0x5a3b26,.32,.52,.11,.41,.72,-.16); box(prop,0xd4c39d,.26,.45,.025,.415,.72,-.225)
          break
        case 'antiquarian': {
          body.material=this.mat(0x76502f); panel(0x694629,.3,.43,.62,.4); box(group,0xa9a396,.41,.14,.34,0,1.51); box(group,0xa9a396,.33,.25,.2,0,1.21,-.13)
          box(group,0x6e2b24,.2,.1,.06,0,1.09,-.24); box(prop,0x493321,.54,.32,.055,-.08,.72,-.3); box(prop,0xc6ad72,.46,.26,.02,-.08,.73,-.335)
          const watch=cyl(prop,0xae8c47,.13,.13,.05,.42,.91,-.2,10,.52); watch.rotation.x=Math.PI/2
          break
        }
        case 'chauffeur':
          body.material=this.mat(0x152839); box(group,0x22394b,.7,.19,.42,0,1.05)
          cyl(group,0x101c28,.29,.29,.06,0,1.55); cyl(group,0x152839,.24,.28,.14,0,1.64); box(group,0x101c28,.42,.055,.18,0,1.56,-.18); box(group,0xc4942f,.08,.1,.04,0,1.65,-.23)
          for(const x of [-.14,.14]) for(const y of [.63,.82,1.01]) box(group,0xc4942f,.055,.055,.035,x,y,-.22)
          ;[leftArm,rightArm].forEach(a=>(a.children[1] as THREE.Mesh).material=this.mat(0xe7e3d6))
          break
        case 'debutante': {
          body.material=this.mat(0x8eadb9); panel(0xb8cdd2,.25,.61,.78,.38); box(group,0xe7e3d8,.09,.7,.035,-.08,.38,-.31)
          cyl(group,0xc89b43,.2,.25,.25,0,1.58); cyl(group,0xc89b43,.15,.18,.2,0,1.78); box(group,0xd9d4c3,.3,.06,.05,0,1.31,-.2)
          ;[leftArm,rightArm].forEach(a=>(a.children[0] as THREE.Mesh).material=this.mat(0xe7e3d8))
          for(const x of [-.1,0,.1]) { const spike=box(group,0xd9d4c3,.04,.19,.04,x,1.91); spike.rotation.z=x*2 }
          const clutch=cyl(prop,0xb88d39,.19,.19,.06,.4,.69,-.22,8,.52); clutch.rotation.x=Math.PI/2
          break
        }
        case 'vocalist':
          body.material=this.mat(0x7d1c22); panel(0x7d1c22,.24,.57,.78,.38); box(group,0x54171d,.35,.08,.65,.18,.23,.18).rotation.y=.25
          box(group,0x171519,.49,.28,.36,0,1.5); cyl(group,0xa53335,.1,.1,.09,.25,1.59,-.08,7); box(group,0xded6c1,.28,.06,.04,0,1.28,-.22)
          box(prop,0x171519,.075,.82,.075,-.48,.43,-.18); box(prop,0x8e918d,.2,.25,.15,-.48,.91,-.18)
          break
        default:
          cyl(group,colorNum,.34,.34,.05,0,1.56); cyl(group,colorNum,.2,.22,.22,0,1.68)
      }
    }
    let spriteRoot: THREE.Group | null = null
    let spriteMaterial: THREE.MeshBasicMaterial | null = null
    if (isDetective || archetypeId) {
      // The portrait cutouts are the actual full-body character art used by the
      // journal. Keep the old geometry assembled (the animation API still
      // addresses its pivots) but replace its visible result with the art.
      for (const child of group.children) child.visible = false
      spriteRoot = new THREE.Group()
      const isAtlas = true
      const spriteRows = isDetective ? CHARACTER_ATLAS.detectiveRows : NPC_ATLAS_V3.rowsPerAtlas
      const atlasName = isDetective ? 'detective-atlas-v2' : `${archetypeId}-atlas-v3`
      const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/characters/${atlasName}.png`)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.NearestFilter
      if (isAtlas) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1 / CHARACTER_ATLAS.columnsPerRow, 1 / spriteRows)
        texture.offset.set(0, 1 - 1 / spriteRows)
      }
      spriteMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      const sprite = new THREE.Mesh(new THREE.PlaneGeometry(isAtlas ? 2.45 : 1.18, isAtlas ? 2.45 : 2.25), spriteMaterial)
      // NPC art is registered to a 294 px foot baseline inside each 320 px
      // cell. Compensate for the transparent pixels below that baseline so
      // the visible feet, rather than the texture cell, sit on the floor.
      const npcBaselineOffset = isDetective
        ? 0
        : 2.45 * (NPC_ATLAS_V3.cellSize - NPC_ATLAS_V3.footBaseline) / NPC_ATLAS_V3.cellSize
      sprite.position.y = 2.45 / 2 + 0.01 - npcBaselineOffset
      sprite.renderOrder = 4
      spriteRoot.add(sprite)
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.43, 16),
        new THREE.MeshBasicMaterial({ color: 0x050407, transparent: true, opacity: 0.42, depthWrite: false }),
      )
      shadow.scale.y = 0.42
      shadow.rotation.x = -Math.PI / 2
      shadow.position.y = 0.018
      spriteRoot.add(shadow)
      group.add(spriteRoot)
    }
    this.scene.add(group)

    const label = document.createElement('div')
    label.textContent = name
    label.style.cssText = `position:absolute;transform:translate(-50%,-100%);font:600 11px Georgia,serif;color:${isDetective ? '#e8d8a0' : '#d8d0c0'};text-shadow:0 1px 3px #000,0 0 6px #000;white-space:nowrap;letter-spacing:0.04em;`
    this.labelLayer.appendChild(label)

    const spriteScale = isDetective ? 1 : (NPC_ATLAS_V3.scaleByArchetype[archetypeId ?? ''] ?? 1)
    if (spriteRoot) spriteRoot.scale.set(spriteScale, spriteScale, 1)
    this.actors.set(id, { group, body, head, label, walking: false, dead: false, bob: Math.random() * Math.PI * 2, leftArm, rightArm, leftLeg, rightLeg, prop, idleKind, facingY: 0, targetFacingY: 0, outline, outlined: false, spriteRoot, spriteMaterial, spriteFlip: 1, spriteScale, spriteAtlas: true, spriteKind: isDetective ? 'detective' : 'npc', spriteRows: isDetective ? CHARACTER_ATLAS.detectiveRows : NPC_ATLAS_V3.rowsPerAtlas, spriteFrame: 0, defaultForward: !isDetective, action: null, actionStartedAt: 0, actionUntil: 0 })
  }

  removeAllActors() {
    for (const a of this.actors.values()) {
      this.scene.remove(a.group)
      this.scene.remove(a.outline)
      this.labelLayer.removeChild(a.label)
    }
    this.actors.clear()
  }

  setActor(id: string, x: number, z: number, walking: boolean, visible: boolean, opacity = 1) {
    const a = this.actors.get(id)
    if (!a) return
    if (!a.dead) {
      const dx = x - a.group.position.x
      const dz = z - a.group.position.z
      // A guest can retain the simulation's walk state while their movement is
      // temporarily locked (for example, during a detective interview) or
      // while blocked on a route. Only animate walking when they actually
      // travelled since the previous world sync.
      const isTravelling = walking && dx * dx + dz * dz > 0.000001
      if (isTravelling) {
        a.targetFacingY = Math.atan2(-dx, -dz)
      }
      a.group.position.set(x, 0, z)
      a.walking = isTravelling
      a.defaultForward = a.spriteKind === 'npc' && !isTravelling
    }
    a.group.visible = visible && (!a.outlined || a.spriteKind === 'npc')
    a.outline.visible = visible && a.outlined && a.spriteKind !== 'npc'
    a.label.style.display = visible && !a.outlined ? 'block' : 'none'
    if (a.spriteKind === 'npc' && a.spriteMaterial) {
      const reveal = Math.max(0, Math.min(1, opacity))
      a.spriteMaterial.opacity = reveal
      const shadow = a.spriteRoot?.children[1] as THREE.Mesh | undefined
      if (shadow?.material instanceof THREE.MeshBasicMaterial) shadow.material.opacity = 0.42 * reveal
      a.label.style.opacity = String(reveal)
    }
  }

  faceActorAt(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a || a.dead) return
    const dx = x - a.group.position.x
    const dz = z - a.group.position.z
    if (dx * dx + dz * dz > 0.000001) {
      a.targetFacingY = Math.atan2(-dx, -dz)
      a.defaultForward = false
    }
  }

  playActorAction(id: string, action: 'investigate', duration = 1.15) {
    const a = this.actors.get(id)
    if (!a || a.dead) return
    a.action = action
    a.actionStartedAt = this.time
    a.actionUntil = this.time + duration
  }

  private setSpriteFrame(a: Actor, frame: number) {
    if (!a.spriteAtlas || !a.spriteMaterial?.map || a.spriteFrame === frame) return
    a.spriteFrame = frame
    const col = frame % CHARACTER_ATLAS.columnsPerRow
    const row = Math.floor(frame / CHARACTER_ATLAS.columnsPerRow)
    const cellH = 1 / a.spriteRows
    a.spriteMaterial.map.offset.set(col / CHARACTER_ATLAS.columnsPerRow, 1 - cellH - row * cellH)
  }

  setActorDead(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a) return
    a.dead = true
    a.walking = false
    a.group.position.set(x, 0, z)
    ;(a.body.material as THREE.MeshStandardMaterial).color.multiplyScalar(0.45)
    ;(a.head.material as THREE.MeshStandardMaterial).color.multiplyScalar(0.6)
    if (a.spriteKind === 'npc' && a.spriteRoot) {
      this.setSpriteFrame(a, atlasFrame(NPC_ATLAS_V3.rows.actions, CHARACTER_ATLAS.columns.front))
      a.group.rotation.set(0, 0, 0)
      a.spriteRoot.rotation.set(-Math.PI / 2, 0, 0)
      a.spriteRoot.position.y = 0.04
      a.spriteRoot.scale.set(1.15 * a.spriteScale, 1.15 * a.spriteScale, 1)
      const art = a.spriteRoot.children[0]
      art.position.set(0, 0, 0)
      if (a.spriteRoot.children[1]) a.spriteRoot.children[1].visible = false
    } else if (a.spriteMaterial) {
      a.spriteMaterial.color.setHex(0x787878)
      a.spriteMaterial.opacity = 0.72
    }
  }

  replaceBodyWithOutline(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a || !a.dead) return
    a.outlined = true
    if (a.spriteKind === 'npc') {
      this.setSpriteFrame(a, atlasFrame(NPC_ATLAS_V3.rows.actions, CHARACTER_ATLAS.columns.right))
      a.group.position.set(x, 0, z)
      a.group.visible = true
      a.outline.visible = false
    } else {
      a.group.visible = false
      a.outline.position.set(x, 0, z)
      a.outline.rotation.y = a.facingY
      a.outline.visible = true
    }
    a.label.style.display = 'none'
  }

  /** Dim the lamp in rooms with an undiscovered/found body slightly red. */
  markBodyRoom(room: RoomId) {
    const lights = this.roomLights.get(room)
    if (lights) {
      for (const l of lights) {
        l.color.setHex(0xff5a3a)
        l.intensity = 7
      }
    }
  }

  resetRoomLights() {
    for (const r of ROOMS) {
      const lights = this.roomLights.get(r.id) ?? []
      for (const l of lights) {
        l.color.setHex(r.lightColor)
        l.intensity = Number(l.userData.baseIntensity ?? r.lightIntensity * 7)
      }
    }
  }

  focusRoom(room: RoomId) {
    const c = roomCenter(room)
    this.camTarget.set(c.x, 0, c.z)
    // keep dust in the focused room
    const pos = this.dust.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      this.dustBase[i * 3] = c.x + (Math.random() - 0.5) * 8
      this.dustBase[i * 3 + 2] = c.z + (Math.random() - 0.5) * 8
    }
  }

  trackPlayer(x: number, z: number, room: RoomId) {
    const c = roomCenter(room)
    const dx = x - c.x
    const dz = z - c.z
    const horizontalPassage = Math.abs(dz) <= PASSAGE_FOCUS_HALF
      ? smoothstep(ROOM_EDGE_FOCUS_START, ROOM_EDGE_FOCUS_END, Math.abs(dx) / ROOM_HALF)
      : 0
    const verticalPassage = Math.abs(dx) <= PASSAGE_FOCUS_HALF
      ? smoothstep(ROOM_EDGE_FOCUS_START, ROOM_EDGE_FOCUS_END, Math.abs(dz) / ROOM_HALF)
      : 0
    const playerWeight = Math.max(horizontalPassage, verticalPassage) * ROOM_EDGE_PLAYER_WEIGHT
    this.camTarget.set(
      THREE.MathUtils.lerp(c.x, x, playerWeight),
      0,
      THREE.MathUtils.lerp(c.z, z, playerWeight),
    )
  }

  focusConversation(playerX: number, playerZ: number, guestX: number, guestZ: number) {
    this.camTarget.set(
      (playerX + guestX) * 0.5 + CONVERSATION_FOCUS_X_OFFSET,
      0,
      (playerZ + guestZ) * 0.5,
    )
  }

  cameraDebug() {
    return {
      desiredFocus: { x: this.camTarget.x, z: this.camTarget.z },
      lookAt: { x: this.camLook.x, z: this.camLook.z },
      position: { x: this.camPos.x, y: this.camPos.y, z: this.camPos.z },
    }
  }

  // ------------------------------------------------------------ frame

  update(dt: number) {
    this.time += dt
    // The camera follows the player near doorways, then settles on the room.
    const desired = new THREE.Vector3(this.camTarget.x, CAMERA_HEIGHT, this.camTarget.z + CAMERA_Z_OFFSET)
    this.camPos.lerp(desired, 1 - Math.exp(-dt * 2.15))
    this.camLook.lerp(this.camTarget, 1 - Math.exp(-dt * 3.4))
    this.camera.position.copy(this.camPos)
    this.camera.lookAt(this.camLook.x, 0.6, this.camLook.z)

    // rain fall
    const rp = this.rain.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < rp.count; i++) {
      let y = rp.getY(i) - this.rainVel[i] * dt
      if (y < 0) y = 20 + Math.random() * 4
      rp.setY(i, y)
    }
    rp.needsUpdate = true

    // dust drift
    const dp = this.dust.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < dp.count; i++) {
      const bx = this.dustBase[i * 3]
      const bz = this.dustBase[i * 3 + 2]
      dp.setX(i, bx + Math.sin(this.time * 0.4 + i) * 0.35)
      dp.setZ(i, bz + Math.cos(this.time * 0.3 + i * 1.7) * 0.35)
      dp.setY(i, this.dustBase[i * 3 + 1] + Math.sin(this.time * 0.5 + i * 2.3) * 0.2)
    }
    dp.needsUpdate = true

    // lightning
    this.lightningT += dt
    if (this.lightningT > this.nextLightning) {
      this.lightningT = 0
      this.nextLightning = 6 + Math.random() * 11
      this.flash = 1
      this.onThunder(0.4 + Math.random() * 0.6)
    }
    let lightningLevel = 0
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 2.4)
      lightningLevel = this.flash * (0.68 + Math.random() * 0.32)
    }
    this.moon.intensity = 0.33 + lightningLevel * 1.25
    this.ambient.intensity = 1.08 + lightningLevel * 0.28
    updateStormWindows(this.stormWindows, this.time, lightningLevel)
    this.cellarSconces?.update(this.time)

    for (const insect of this.ceilingInsects) {
      const t = this.time * insect.speed + insect.phase
      const jitter = insect.kind === 'fly' ? Math.sin(this.time * insect.flutter + insect.phase * 3) * 0.08 : 0
      const radius = insect.radius + jitter
      insect.mesh.position.set(
        insect.center.x + Math.cos(t) * radius,
        insect.center.y + Math.sin(t * 1.7 + insect.phase) * insect.vertical,
        insect.center.z + Math.sin(t) * radius * 0.72,
      )
      insect.mesh.rotation.z = Math.sin(this.time * insect.flutter + insect.phase) * (insect.kind === 'moth' ? 0.85 : 0.3)
      if (insect.kind === 'moth') {
        insect.mesh.scale.x = 0.38 + Math.abs(Math.sin(this.time * insect.flutter + insect.phase)) * 0.92
      }
    }

    // actor bob
    for (const a of this.actors.values()) {
      if (!a.dead) {
        let turn = Math.atan2(Math.sin(a.targetFacingY - a.facingY), Math.cos(a.targetFacingY - a.facingY))
        if (a.spriteKind === 'detective') {
          // Directional atlas frames already communicate the turn. Snapping
          // the hidden heading avoids a slow visual drift while moving sideways.
          a.facingY = a.targetFacingY
          turn = 0
        } else {
          a.facingY += turn * Math.min(1, dt * 12)
        }
        a.group.rotation.y = a.facingY
        if (a.spriteRoot) {
          // Billboard the portrait toward the isometric camera while retaining
          // the simulation heading as a left/right silhouette flip.
          const cameraYaw = Math.atan2(
            this.camera.position.x - a.group.position.x,
            this.camera.position.z - a.group.position.z,
          )
          a.spriteRoot.rotation.y = cameraYaw - a.facingY
          const lateralHeading = -Math.sin(a.facingY)
          if (!a.spriteAtlas && Math.abs(lateralHeading) > 0.22) a.spriteFlip = lateralHeading < 0 ? -1 : 1
        }
        if (a.spriteAtlas) {
          if (a.spriteKind === 'detective' && a.action && this.time < a.actionUntil) {
            // The rebuilt atlas registers the kneeling pose at a deliberately
            // shorter physical height, so the full investigate sequence no
            // longer produces the old oversized crouch/pop.
            const progress = (this.time - a.actionStartedAt) / (a.actionUntil - a.actionStartedAt)
            this.setSpriteFrame(a, progress < 0.68 ? 14 : 15)
          } else {
            if (a.action) a.action = null
            const cameraYaw = Math.atan2(
              this.camera.position.x - a.group.position.x,
              this.camera.position.z - a.group.position.z,
            )
            const relative = Math.atan2(Math.sin(a.facingY - cameraYaw), Math.cos(a.facingY - cameraYaw))
            // Atlas order is front, right-profile, back, left-profile. The
            // camera looks from +Z, opposite the model's zero-angle heading,
            // so shift the world quarter-turn by 180 degrees.
            const direction = ((Math.round(relative / (Math.PI / 2)) + 2) % 4 + 4) % 4
            const turning = a.spriteKind === 'detective' && Math.abs(turn) > 0.28
            // The detective atlas's idle row stores its two profile poses in
            // the opposite columns from its walking rows. Swap only those
            // stopped side views so releasing left/right preserves facing.
            const idleDirection = a.spriteKind === 'detective' && (direction === 1 || direction === 3)
              ? 4 - direction
              : direction
            let frame: number
            if (a.spriteKind === 'npc' && a.defaultForward) {
              a.spriteFlip = 1
              frame = 0
            } else if (a.spriteKind === 'npc') {
              a.spriteFlip = 1
              if (a.walking) {
                const wrapped = ((a.bob % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
                const beat = Math.floor(wrapped / (Math.PI / 2))
                const row = beat === 0
                  ? NPC_ATLAS_V3.rows.walkA
                  : beat === 2
                    ? NPC_ATLAS_V3.rows.walkB
                    : NPC_ATLAS_V3.rows.passing
                frame = atlasFrame(row, direction)
              } else {
                frame = atlasFrame(NPC_ATLAS_V3.rows.idle, direction)
              }
            } else {
              a.spriteFlip = 1
              frame = turning
                ? 12 + (turn < 0 ? 0 : 1)
                : a.walking
                  ? a.spriteKind === 'detective' && (direction === 1 || direction === 3)
                    // A → feet-together → B → feet-together makes it clear
                    // which leg leads without snapping directly between the
                    // two widest silhouettes.
                    ? (() => {
                        a.spriteFlip = 1
                        const wrapped = ((a.bob % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
                        const beat = Math.floor(wrapped / (Math.PI / 2))
                        if (beat === 0) return atlasFrame(CHARACTER_ATLAS.rows.walkA, direction)
                        if (beat === 2) return atlasFrame(CHARACTER_ATLAS.rows.walkB, direction)
                        return direction === CHARACTER_ATLAS.columns.right
                          ? CHARACTER_ATLAS.detectiveFrames.passingRight
                          : CHARACTER_ATLAS.detectiveFrames.passingLeft
                      })()
                    : atlasFrame(Math.sin(a.bob) >= 0 ? CHARACTER_ATLAS.rows.walkA : CHARACTER_ATLAS.rows.walkB, direction)
                  : idleDirection
            }
            this.setSpriteFrame(a, frame)
          }
        }
      }
      if (a.walking && !a.dead) {
        a.bob += dt * 9
        a.group.position.y = a.spriteRoot ? 0 : Math.abs(Math.sin(a.bob)) * 0.09
        a.body.rotation.y = Math.sin(a.bob * 0.5) * 0.04
        const stride = Math.sin(a.bob) * (a.idleKind === 'curator' || a.idleKind === 'vocalist' ? 0.18 : 0.3)
        a.leftLeg.rotation.x = stride; a.rightLeg.rotation.x = -stride
        const armStride = a.idleKind === 'correspondent' ? 0.04 : stride * 0.55
        a.leftArm.rotation.x = -armStride; a.rightArm.rotation.x = armStride
        a.prop.rotation.y = 0; a.prop.rotation.z = 0
        if (a.spriteRoot) {
          a.spriteRoot.scale.set(a.spriteFlip * a.spriteScale, a.spriteScale, 1)
          a.spriteRoot.rotation.z = 0
        }
      } else if (!a.dead) {
        a.group.position.y = 0
        a.body.rotation.y = 0
        a.leftLeg.rotation.x = 0; a.rightLeg.rotation.x = 0
        a.leftArm.rotation.x = 0; a.rightArm.rotation.x = 0
        const phase = this.time * (a.idleKind === 'chauffeur' ? 1.6 : 1.15)
        const gesture = Math.sin(phase) * 0.06
        a.prop.rotation.z = gesture * (a.idleKind === 'columnist' || a.idleKind === 'debutante' ? 1.4 : 0.55)
        a.prop.rotation.y = gesture * (a.idleKind === 'magician' || a.idleKind === 'correspondent' || a.idleKind === 'detective' ? 1.8 : 0.6)
        a.head.rotation.z = Math.sin(phase * 0.62) * (a.idleKind === 'surgeon' || a.idleKind === 'antiquarian' ? 0.035 : 0.015)
        if (a.spriteRoot) {
          a.spriteRoot.scale.set(a.spriteFlip * a.spriteScale, a.spriteScale, 1)
          a.spriteRoot.rotation.z = 0
        }
      }
    }

    this.updateLabels()

    // pixel pipeline render
    this.renderer.setRenderTarget(this.rt)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.quadScene, this.quadCam)
  }

  private updateLabels() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    const v = new THREE.Vector3()
    for (const a of this.actors.values()) {
      if (!a.group.visible) continue
      v.copy(a.group.position)
      v.y += a.dead ? 0.7 : ACTOR_LABEL_HEIGHT
      v.project(this.camera)
      if (v.z > 1) {
        a.label.style.display = 'none'
        continue
      }
      const x = (v.x * 0.5 + 0.5) * w
      const y = (-v.y * 0.5 + 0.5) * h
      a.label.style.left = `${x}px`
      a.label.style.top = `${y}px`
    }
  }
}
