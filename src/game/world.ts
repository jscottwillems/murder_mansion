// Three.js mansion renderer: 3x3 rooms, passageways, furniture, characters,
// pixel-art noir pipeline (low-res render target upscaled nearest-neighbor),
// rain, lightning, dust motes, lamplight.
import * as THREE from 'three'
import type { RoomId } from './types'
import { ROOMS, ROOM_HALF, ROOM_STEP, PASS_HALF, roomCenter } from './data'

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
  spriteAtlas: boolean
  spriteFrame: number
  action: 'investigate' | null
  actionUntil: number
}

const PIXEL_SCALE = 0.58 // render-target resolution fraction
const WALL_H = 1.85
const WALL_T = 0.35
// A lower, more forward isometric view keeps the full-body portrait sprites
// readable instead of visually foreshortening them against the floor.
const CAMERA_HEIGHT = 11.7
const CAMERA_Z_OFFSET = 10.4
const ROOM_EDGE_FOCUS_START = 0.52
const ROOM_EDGE_FOCUS_END = 1.1
const ROOM_EDGE_PLAYER_WEIGHT = 0.72
const PASSAGE_FOCUS_HALF = PASS_HALF - 0.15

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
  private roomLights = new Map<RoomId, THREE.PointLight>()
  private materialCache = new Map<string, THREE.MeshStandardMaterial>()
  private flatMaterialCache = new Map<number, THREE.MeshBasicMaterial>()
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
    this.scene.fog = new THREE.FogExp2(0x07070c, 0.012)
    this.scene.background = new THREE.Color(0x07070c)

    this.ambient = new THREE.AmbientLight(0x343444, 0.95)
    this.scene.add(this.ambient)
    this.moon = new THREE.DirectionalLight(0x8a9ac8, 0.25)
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

  private flatMat(color: number): THREE.MeshBasicMaterial {
    let material = this.flatMaterialCache.get(color)
    if (!material) {
      material = new THREE.MeshBasicMaterial({ color })
      this.flatMaterialCache.set(color, material)
    }
    return material
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
      const floorSurface = new THREE.Mesh(new THREE.PlaneGeometry(9.82, 9.82), this.flatMat(r.floor))
      floorSurface.rotation.x = -Math.PI / 2
      floorSurface.position.y = 0.004
      g.add(floorSurface)
      const trim = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF * 2 + 0.3, 0.1, ROOM_HALF * 2 + 0.3), this.mat(r.accent, 0.6))
      trim.position.y = -0.26
      this.addBoxEdges(trim)
      g.add(trim)

      // walls with door gaps
      this.buildWalls(g, r.col, r.row, r.wall)

      // furniture
      this.buildFloorLanguage(g, r.furniture)
      this.buildFurniture(g, r.furniture, r.accent)

      // lamp: visible bulb + point light
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshBasicMaterial({ color: r.lightColor }),
      )
      const lightBias: Record<string, [number, number]> = {
        study: [0, -1], gallery: [0, -1], conservatory: [1, -1], kitchen: [-1, 1], dining: [0, 0.5],
        ballroom: [0, 0], cellar: [1.5, 2], library: [0, 2], suite: [2, 1.5],
      }
      const [lx, lz] = lightBias[r.furniture]
      bulb.position.set(lx, 3.1, lz)
      g.add(bulb)
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4), this.mat(0x111111))
      cord.position.set(0, 3.8, 0)
      g.add(cord)
      const light = new THREE.PointLight(r.lightColor, r.lightIntensity * 13, 18, 1.35)
      light.position.set(lx, 3.0, lz)
      g.add(light)
      this.roomLights.set(r.id, light)

      this.scene.add(g)
    }

    // passages
    for (const r of ROOMS) {
      const c = roomCenter(r.id)
      if (r.col < 2) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(ROOM_STEP - ROOM_HALF * 2 + 0.6, 0.25, PASS_HALF * 2), this.mat(0x2b2620))
        p.position.set(c.x + ROOM_STEP / 2, -0.12, c.z)
        this.addBoxEdges(p)
        this.scene.add(p)
        for (const s of [-1, 1]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, WALL_H, 6), this.mat(0x3a3228))
          col.position.set(c.x + ROOM_STEP / 2, WALL_H / 2, c.z + s * PASS_HALF)
          this.scene.add(col)
        }
      }
      if (r.row < 2) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(PASS_HALF * 2, 0.25, ROOM_STEP - ROOM_HALF * 2 + 0.6), this.mat(0x2b2620))
        p.position.set(c.x, -0.12, c.z + ROOM_STEP / 2)
        this.addBoxEdges(p)
        this.scene.add(p)
        for (const s of [-1, 1]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, WALL_H, 6), this.mat(0x3a3228))
          col.position.set(c.x + s * PASS_HALF, WALL_H / 2, c.z + ROOM_STEP / 2)
          this.scene.add(col)
        }
      }
    }
  }

  private buildWalls(g: THREE.Group, col: number, row: number, color: number) {
    const m = this.mat(color)
    const gap = PASS_HALF + 0.6 // door half-width
    const mk = (w: number, d: number, x: number, z: number) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), m)
      wall.position.set(x, WALL_H / 2, z)
      this.addBoxEdges(wall)
      g.add(wall)
    }
    const threshold = (w: number, d: number, x: number, z: number) => {
      const sill = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), this.mat(0x8a6a3a, 0.7))
      sill.position.set(x, 0.02, z)
      this.addBoxEdges(sill)
      g.add(sill)
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
          threshold(gap * 2, WALL_T * 1.5, 0, z)
        } else {
          mk(L * 2, WALL_T, 0, z)
        }
      } else {
        const x = s.sign * L
        if (s.has) {
          const seg = L - gap
          mk(WALL_T, seg, x, -(gap + seg / 2))
          mk(WALL_T, seg, x, gap + seg / 2)
          threshold(WALL_T * 1.5, gap * 2, x, 0)
        } else {
          mk(WALL_T, L * 2, x, 0)
        }
      }
    }
  }

  private box(g: THREE.Group, color: number, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mat(color))
    mesh.position.set(x, y, z)
    mesh.rotation.y = ry
    this.addBoxEdges(mesh)
    g.add(mesh)
    return mesh
  }

  private cylinder(g: THREE.Group, color: number, rt: number, rb: number, h: number, x: number, y: number, z: number, segments = 8, rz = 0) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segments), this.mat(color))
    mesh.position.set(x, y, z); mesh.rotation.z = rz; this.addBoxEdges(mesh); g.add(mesh); return mesh
  }

  private inlay(g: THREE.Group, color: number, w: number, d: number, x: number, z: number, ry = 0, h = 0.025) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.flatMat(color))
    m.position.set(x, h / 2 + 0.005, z); m.rotation.y = ry; g.add(m); return m
  }

  private rug(g: THREE.Group, w: number, d: number, color: number, border: number, x: number, z: number, ry = 0) {
    this.inlay(g, border, w, d, x, z, ry, 0.035); this.inlay(g, color, w - 0.22, d - 0.22, x, z, ry, 0.045)
  }

  private table(g: THREE.Group, w: number, d: number, topY: number, color: number, x: number, z: number, ry = 0) {
    this.box(g, color, w, 0.16, d, x, topY, z, ry)
    for (const sx of [-0.32, 0.32]) this.box(g, 0x2b1d15, 0.18, topY - 0.08, d * 0.72, x + Math.cos(ry) * w * sx, (topY - 0.08) / 2, z - Math.sin(ry) * w * sx, ry)
  }

  private chair(g: THREE.Group, color: number, x: number, z: number, ry = 0, tall = false) {
    this.box(g, color, 0.48, 0.16, 0.48, x, 0.48, z, ry)
    this.box(g, color, 0.48, tall ? 0.78 : 0.55, 0.14, x - Math.sin(ry) * 0.22, tall ? 0.78 : 0.67, z - Math.cos(ry) * 0.22, ry)
    this.box(g, 0x241914, 0.34, 0.38, 0.34, x, 0.22, z, ry)
  }

  private shelf(g: THREE.Group, w: number, h: number, x: number, z: number, ry = 0, missing = false) {
    this.box(g, 0x302018, w, h, 0.42, x, h / 2, z, ry)
    for (let row = 0; row < 3; row++) {
      this.box(g, 0x765137, w - 0.12, 0.09, 0.46, x, 0.42 + row * 0.67, z, ry)
      for (let i = -2; i <= 2; i++) {
        if (missing && row === 1 && i === -1) continue
        const colors = [0x7f342c, 0x355848, 0x47517b, 0x9a7434]
        const along = i * (w - 0.3) / 5
        this.box(g, colors[(i + row + 6) % colors.length], (w - 0.35) / 6, 0.38, 0.12,
          x + Math.cos(ry) * along, 0.68 + row * 0.67, z - Math.sin(ry) * along, ry)
      }
    }
    this.box(g, 0x8a613b, w + 0.12, 0.12, 0.5, x, h + 0.04, z, ry)
  }

  private frame(g: THREE.Group, w: number, h: number, x: number, y: number, z: number, side: 'n' | 'e', image = 0x273044) {
    const ry = side === 'e' ? Math.PI / 2 : 0
    this.box(g, 0xb08a38, w, h, 0.14, x, y, z, ry); this.box(g, image, w - 0.24, h - 0.24, 0.17, x, y, z + (side === 'n' ? 0.02 : 0), ry)
  }

  private candles(g: THREE.Group, x: number, y: number, z: number, count = 3) {
    for (let i = 0; i < count; i++) {
      const ox = (i - (count - 1) / 2) * 0.22
      this.cylinder(g, 0xe6d7ae, 0.045, 0.055, 0.38 - Math.abs(ox) * 0.2, x + ox, y, z, 6)
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffc76a }))
      flame.position.set(x + ox, y + 0.25, z); g.add(flame)
    }
  }

  private plant(g: THREE.Group, x: number, z: number, scale = 1, lean = 0) {
    this.cylinder(g, 0x9a6040, 0.28 * scale, 0.35 * scale, 0.42 * scale, x, 0.21 * scale, z, 8)
    for (const [ox, oz, s] of [[-0.18, 0, 0.8], [0.12, -0.1, 1], [0.22, 0.16, 0.7]] as const) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.28 * scale * s, 0.85 * scale * s, 6), this.mat(0x3f754f))
      leaf.position.set(x + ox * scale + lean, 0.72 * scale * s, z + oz * scale); leaf.rotation.z = lean * 0.35; g.add(leaf)
    }
  }

  private barrel(g: THREE.Group, x: number, y: number, z: number, horizontal = false) {
    const b = this.cylinder(g, 0x634329, 0.48, 0.54, 1.0, x, y, z, 10, horizontal ? Math.PI / 2 : 0)
    if (horizontal) b.rotation.z = Math.PI / 2
    for (const dy of [-0.32, 0.32]) this.cylinder(g, 0x2a2927, 0.55, 0.55, 0.08, x + (horizontal ? dy : 0), y + (horizontal ? 0 : dy), z, 10, horizontal ? Math.PI / 2 : 0)
  }

  private buildFloorLanguage(g: THREE.Group, kind: string) {
    if (kind === 'study') {
      for (let x = -4.5; x <= 4.5; x += 0.65) this.inlay(g, x % 1.3 ? 0x39271d : 0x533725, 0.52, 9.6, x, 0)
      this.rug(g, 3.8, 2.1, 0x681f26, 0x9c7540, 0, -2.35, -0.16); this.inlay(g, 0xb08b45, 0.12, 2.2, 0, 3.8)
    } else if (kind === 'gallery') {
      for (const x of [-2.5, 0, 2.5]) for (const z of [-2.5, 0, 2.5]) this.inlay(g, (x + z) % 5 ? 0x303847 : 0x465064, 2.35, 2.35, x, z)
      this.rug(g, 1.55, 8.4, 0x364b68, 0x79849a, 0, 0)
    } else if (kind === 'conservatory') {
      for (let x = -4; x <= 4; x += 2) for (let z = -4; z <= 4; z += 2) this.inlay(g, (x + z) % 4 ? 0x34433e : 0x43534b, 1.82, 1.82, x, z)
      for (let i = 0; i < 5; i++) this.inlay(g, 0x718e72, 0.25, 1.25, -3 + i * 0.7, 3 - i * 0.65, -0.65)
    } else if (kind === 'kitchen') {
      // Broad, low-contrast quarry tiles survive the pixel pass without turning
      // into moire bands. Route strips sit clearly above the tiles; the east/west
      // strip is split around the north/south strip so no coplanar faces overlap.
      for (let ix = 0; ix < 8; ix++) for (let iz = 0; iz < 8; iz++) {
        const x = -4.2 + ix * 1.2
        const z = -4.2 + iz * 1.2
        this.inlay(g, ((ix + iz) & 1) ? 0x3d4040 : 0x817d70, 1.12, 1.12, x, z)
      }
      this.inlay(g, 0x34373a, 3, 9.7, 0, 0, 0, 0.045)
      this.inlay(g, 0x34373a, 3.35, 3, -3.175, 0, 0, 0.045)
      this.inlay(g, 0x34373a, 3.35, 3, 3.175, 0, 0, 0.045)
    } else if (kind === 'dining') {
      for (let x = -4.3; x <= 4.3; x += 0.8) for (const z of [-3.7, -2.3, 2.3, 3.7]) this.inlay(g, 0x593927, 1.25, 0.28, x, z, (Math.round(x) & 1 ? 1 : -1) * 0.65)
      this.rug(g, 6.2, 2.5, 0x681f29, 0xb08b48, 0, 0.65)
    } else if (kind === 'ballroom') {
      this.inlay(g, 0xd0c3df, 5.5, 5.5, 0, 0, Math.PI / 4)
      this.inlay(g, 0x302c3b, 4.25, 4.25, 0, 0, Math.PI / 4, 0.035); this.inlay(g, 0xa99bbb, 2.9, 2.9, 0, 0, Math.PI / 4, 0.045)
    } else if (kind === 'cellar') {
      for (const [x,z,w,d] of [[-2.7,-2.6,3.5,3.2],[1.5,-2.8,4.4,2.8],[-2.2,1.4,4.4,4],[2.6,2,3.2,3.6]] as const) this.inlay(g, (x < 0 ? 0x44423d : 0x35383a), w, d, x, z, 0.06)
      this.inlay(g, 0x355164, 0.55, 9.6, -4.35, 0)
    } else if (kind === 'library') {
      for (let x=-4.5;x<=4.5;x+=0.72) this.inlay(g, 0x513425, 0.55, 9.6, x, 0, (Math.round(x*2)&1)*0.16)
      this.rug(g, 8.8, 1.5, 0x294c37, 0x8b733e, 0, 0); this.rug(g, 1.5, 4.5, 0x294c37, 0x8b733e, 0, -2.25)
    } else {
      for (let x=-4.5;x<=4.5;x+=0.75) this.inlay(g, 0x633d40, 0.6, 9.6, x, 0)
      this.rug(g, 3.7, 4.1, 0x8b5360, 0xc09872, -2.6, -2.2)
    }
  }

  private buildFurniture(g: THREE.Group, kind: string, accent: number) {
    void accent
    const wood = 0x4a3423
    const dark = 0x241b14
    switch (kind) {
      case 'study': {
        this.table(g, 3.2, 1.25, 0.86, wood, 0, -2.65, -0.16)
        this.box(g, 0x38472c, 0.65, 0.12, 0.42, 0.45, 1.02, -2.72, -0.16); this.cylinder(g, 0xb88a43, .07, .09, .55, .45, .75, -2.72, 7)
        this.chair(g, 0x55382d, .9, -1.35, 2.95); this.shelf(g, 2.4, 2.25, -3.45, -4.55); this.shelf(g, 2.4, 2.25, 3.45, -4.55)
        this.chair(g, 0x512923, -3.5, 2.75, .5); this.cylinder(g, wood, .35, .35, .42, -2.4, .21, 3.15, 8)
        this.box(g, 0xe5d7b7, .72, .025, .38, .7, .06, -1.72, -.35); this.cylinder(g, 0x7d1820, .1, .1, .035, 1.03, .07, -1.55, 7)
        break
      }
      case 'gallery': {
        this.frame(g, 2.1, 2.35, 0, 1.65, -4.72, 'n', 0x4b5263); this.frame(g, 1.15, 1.45, -3.25, 1.55, -4.72, 'n'); this.frame(g, 1.15, 1.45, 3.25, 1.55, -4.72, 'n')
        this.box(g, 0xe1d7c7, .55, .8, .18, 0, 1.7, -4.56); this.box(g, 0x76202a, .16, .16, .12, .2, 1.68, -4.42)
        for (const x of [-2.8,2.8]) this.box(g, 0x918b80, .68, 1.05, .68, x, .53, -1.85)
        this.box(g, 0xbac0c8, .65, .55, .5, -2.8, 1.34, -1.85, .5); this.cylinder(g, 0xc8bda9, .18, .28, .72, 2.8, 1.42, -1.85, 8)
        this.box(g, 0x4b3b50, 2.25, .42, .75, 0, .22, 2.75); this.box(g, 0x9b1f2c, .2, .025, .18, .2, .05, -3.6)
        break
      }
      case 'conservatory': {
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x9ac8d8, transparent: true, opacity: 0.16, roughness: 0.2 })
        for (const x of [-3.5,-1.15,1.15,3.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.7, .05), glassMat); p.position.set(x,1.25,-4.62); g.add(p); this.box(g,0x243638,.1,2,.1,x-1,1.1,-4.6) }
        for (const z of [-3.5,-1.15,1.15,3.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.7, 2.05), glassMat); p.position.set(4.62,1.25,z); g.add(p) }
        this.cylinder(g, 0xa8b8aa, 1.05, 1.15, .32, 1.9, .16, -1.9, 12); this.cylinder(g, 0x4d3930, .16, .24, 1.35, 1.9, .85, -1.9, 7, -.22)
        this.plant(g, 1.45, -1.75, 1.05, -.15); this.plant(g, 2.35, -2.1, .8, .15); this.plant(g, 3.55, 2.9, .8); this.plant(g, -3.7, -2.7, .65)
        this.table(g, 2.2, .7, .75, 0x72533a, -3.35, 3.2); this.box(g,0xe2d7b5,.42,.05,.14,-2.8,.08,2.65,.5); this.box(g,0x7b4e94,.25,.12,.25,-2.35,.08,2.4)
        break
      }
      case 'kitchen': {
        this.table(g, 2.3, 1.25, .88, 0xb89062, -2.15, 2.25); this.box(g,0xe4d8bc,.55,.5,.06,-1.9,.55,2.9)
        this.box(g,0x343438,2.35,1,.8,-2.8,.5,-4.15); this.box(g,0x1e2023,2,1.2,.9,-2.8,1.45,-4.25); this.box(g,0xe57a2b,1.4,.12,.12,-2.8,.5,-3.7)
        this.box(g,0x777b78,.75,.9,3.6,-4.15,.45,2.4); this.box(g,0x667078,.7,.18,1.2,-3.75,1,2.4); this.box(g,0x6d7476,1.15,2,.85,3.8,1,-3.65)
        for (let i=0;i<4;i++) { this.cylinder(g,0xb66d37,.2,.2,.06,-3.6+i*.62,1.7,-4.45,8,Math.PI/2); this.box(g,0x9a552d,.1,.45,.1,-3.6+i*.62,1.45,-4.42) }
        for(let i=0;i<5;i++) if(i!==2) this.box(g,0xd5d3c5,.12,.55,.06,2.5+i*.3,1.65,-4.42); this.box(g,0x741c1e,.7,.08,.05,3.1,1.25,-4.4)
        break
      }
      case 'dining': {
        this.table(g,5.2,1.35,.84,wood,0,.72); for(const x of [-2,-1,0,1,2]) { this.chair(g,dark,x,1.72,0); if(x!==0)this.chair(g,dark,x,-.28,Math.PI) }
        this.chair(g,0x4b241e,-3.05,.72,-Math.PI/2,true); this.candles(g,-1.35,1.15,.72); this.candles(g,1.35,1.15,.72)
        for(let i=0;i<10;i++) this.cylinder(g,0xe3dac5,.15,.15,.025,-2.2+(i%5)*1.1,.95,.35+(i>4?.72:0),10)
        this.cylinder(g,0xe3dac5,.16,.16,.025,-2.55,.95,.72,10,Math.PI/2); this.box(g,0x92232d,.38,.025,.22,-2.25,.97,.72,.2)
        this.box(g,0x533626,2.4,.82,.55,-2.9,.41,-4.25); this.box(g,0x533626,2.4,.82,.55,2.9,.41,-4.25)
        break
      }
      case 'ballroom': {
        this.cylinder(g,0x7d6848,.12,.12,1.2,0,2.65,0,8); const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.09,6,16),this.mat(0xb59454)); ring.rotation.x=Math.PI/2; ring.position.y=2.4; g.add(ring); for(let i=0;i<6;i++){const a=i*Math.PI/3;const f=new THREE.Mesh(new THREE.SphereGeometry(.1,6,4),new THREE.MeshBasicMaterial({color:0xffebae}));f.position.set(Math.cos(a),2.4,Math.sin(a));g.add(f)}
        this.box(g,0x18171d,2.2,.72,1.55,-3.25,.62,-3.1,.52); this.box(g,0xe5dfcb,1.55,.09,.4,-2.8,.92,-2.35,.52); this.box(g,0x27232f,2,.1,1.4,-3.4,1.05,-3.2,.52)
        this.box(g,0x593650,.65,2.35,.45,4.35,1.18,-3.25); this.box(g,0x593650,.65,2.35,.45,4.35,1.18,3.25); this.box(g,0x44364c,2.3,.28,1.15,3.35,.14,3.75)
        this.inlay(g,0xe3ddd0,.25,.55,-.55,.08,.35); this.inlay(g,0xe3ddd0,.25,.55,.05,.6,-.5)
        break
      }
      case 'cellar': {
        this.shelf(g,2.7,1.9,-3.2,-4.48); this.shelf(g,2.7,1.9,3.2,-4.48)
        for(const [x,y] of [[2.4,.35],[3,.35],[3.6,.35],[2.7,.95],[3.3,.95]] as const)this.box(g,0xb9aa90,.55,.45,.3,x,y,-4.18)
        this.box(g,0x151417,.7,.8,.1,3.2,.8,-4.01); this.box(g,0xc5b69d,.58,.38,.32,3.2,.2,-3.65)
        this.barrel(g,-3.55,.55,2.9,true); this.barrel(g,-2.45,.55,2.9,true); this.barrel(g,-3,.98,2.9,true)
        this.box(g,0x72543a,1.05,1.05,1.05,3.6,.53,3.4); this.box(g,0x72543a,.8,.8,.8,2.65,.4,3.7); this.table(g,1.5,.7,.7,wood,4.05,2)
        break
      }
      case 'library': {
        this.shelf(g,2.35,2.35,-3.45,-4.5,0,true); this.shelf(g,2.35,2.35,3.45,-4.5)
        for(const z of [-3.4,3.4]) { this.shelf(g,2.1,2.35,-4.5,z,Math.PI/2); this.shelf(g,2.1,2.35,4.5,z,Math.PI/2) }
        this.cylinder(g,wood,.72,.72,.72,0,.36,2.75,8); this.box(g,0x315b3b,.55,.12,.4,.15,.86,2.72); this.cylinder(g,0xb38b49,.06,.08,.5,.15,.65,2.72,7)
        this.box(g,0x9a7442,.18,2.25,.16,3.85,1.13,2.65,.55); for(let i=0;i<5;i++)this.box(g,0x9a7442,.65,.08,.12,3.85,0.35+i*.4,2.65,.55)
        this.box(g,0x315b3b,.62,.12,.42,.2,.08,3.35,.2); this.box(g,0xe0d5b9,.35,.025,.28,.62,.07,3.5,-.2)
        break
      }
      case 'suite': {
        this.box(g,0x6d3948,2.5,.48,3,-2.7,.3,-2.65); this.box(g,0xe8dad2,2.25,.18,.72,-2.7,.64,-3.55)
        for(const x of [-3.85,-1.55])for(const z of [-3.95,-1.35])this.box(g,dark,.12,2.35,.12,x,1.18,z)
        this.box(g,0x8b5260,.18,1.75,2.65,-3.75,1.3,-2.65); this.box(g,0x8b5260,.18,1.75,2.65,-1.65,1.3,-2.65)
        this.box(g,dark,1.25,2.25,.72,-3.9,1.13,3.35); this.table(g,1.65,.62,.78,0x936c5b,4.05,2.45,Math.PI/2); this.chair(g,0x74424d,3.35,2.45,Math.PI/2)
        const mirror=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.08,12),new THREE.MeshStandardMaterial({color:0x9fb4c2,roughness:.12,metalness:.75})); mirror.rotation.z=Math.PI/2; mirror.position.set(4.48,1.65,2.45); g.add(mirror)
        this.box(g,0x513126,.55,.22,.38,3.85,1,2.45); this.box(g,0xd7c7ad,.55,.08,.38,3.85,1.14,2.45); for(let i=0;i<3;i++)this.cylinder(g,0xf1e1c2,.1,.1,.12,3.1-i*.45,.08,1.35-i*.3,8)
        break
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
      const isAtlas = isDetective
      const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/characters/${isAtlas ? 'detective-atlas' : archetypeId}.png`)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.NearestFilter
      if (isAtlas) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(0.25, 0.25)
        texture.offset.set(0, 0.75)
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
      sprite.position.y = 1.08
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

    this.actors.set(id, { group, body, head, label, walking: false, dead: false, bob: Math.random() * Math.PI * 2, leftArm, rightArm, leftLeg, rightLeg, prop, idleKind, facingY: 0, targetFacingY: 0, outline, outlined: false, spriteRoot, spriteMaterial, spriteFlip: 1, spriteAtlas: isDetective, spriteFrame: 0, action: null, actionUntil: 0 })
  }

  removeAllActors() {
    for (const a of this.actors.values()) {
      this.scene.remove(a.group)
      this.scene.remove(a.outline)
      this.labelLayer.removeChild(a.label)
    }
    this.actors.clear()
  }

  setActor(id: string, x: number, z: number, walking: boolean, visible: boolean) {
    const a = this.actors.get(id)
    if (!a) return
    if (!a.dead) {
      const dx = x - a.group.position.x
      const dz = z - a.group.position.z
      if (walking && dx * dx + dz * dz > 0.000001) {
        a.targetFacingY = Math.atan2(-dx, -dz)
      }
      a.group.position.set(x, 0, z)
      a.walking = walking
    }
    a.group.visible = visible && !a.outlined
    a.outline.visible = visible && a.outlined
    a.label.style.display = visible && !a.outlined ? 'block' : 'none'
  }

  faceActorAt(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a || a.dead) return
    const dx = x - a.group.position.x
    const dz = z - a.group.position.z
    if (dx * dx + dz * dz > 0.000001) a.targetFacingY = Math.atan2(-dx, -dz)
  }

  playActorAction(id: string, action: 'investigate', duration = 1.15) {
    const a = this.actors.get(id)
    if (!a || a.dead) return
    a.action = action
    a.actionUntil = this.time + duration
  }

  private setSpriteFrame(a: Actor, frame: number) {
    if (!a.spriteAtlas || !a.spriteMaterial?.map || a.spriteFrame === frame) return
    a.spriteFrame = frame
    const col = frame % 4
    const row = Math.floor(frame / 4)
    a.spriteMaterial.map.offset.set(col * 0.25, 0.75 - row * 0.25)
  }

  setActorDead(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a) return
    a.dead = true
    a.walking = false
    a.group.position.set(x, 0.22, z)
    a.group.rotation.z = Math.PI / 2
    ;(a.body.material as THREE.MeshStandardMaterial).color.multiplyScalar(0.45)
    ;(a.head.material as THREE.MeshStandardMaterial).color.multiplyScalar(0.6)
    if (a.spriteMaterial) {
      a.spriteMaterial.color.setHex(0x787878)
      a.spriteMaterial.opacity = 0.72
    }
  }

  replaceBodyWithOutline(id: string, x: number, z: number) {
    const a = this.actors.get(id)
    if (!a || !a.dead) return
    a.outlined = true
    a.group.visible = false
    a.outline.position.set(x, 0, z)
    a.outline.rotation.y = a.facingY
    a.outline.visible = true
    a.label.style.display = 'none'
  }

  /** Dim the lamp in rooms with an undiscovered/found body slightly red. */
  markBodyRoom(room: RoomId) {
    const l = this.roomLights.get(room)
    if (l) {
      l.color.setHex(0xff5a3a)
      l.intensity = 14
    }
  }

  resetRoomLights() {
    for (const r of ROOMS) {
      const l = this.roomLights.get(r.id)!
      l.color.setHex(r.lightColor)
      l.intensity = r.lightIntensity * 22
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
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 2.4)
      const f = this.flash * (0.6 + Math.random() * 0.4)
      this.moon.intensity = 0.25 + f * 3.2
      this.ambient.intensity = 0.85 + f * 0.8
    }

    // actor bob
    for (const a of this.actors.values()) {
      if (!a.dead) {
        const turn = Math.atan2(Math.sin(a.targetFacingY - a.facingY), Math.cos(a.targetFacingY - a.facingY))
        a.facingY += turn * Math.min(1, dt * 12)
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
          if (a.action && this.time < a.actionUntil) {
            this.setSpriteFrame(a, 14 + (Math.floor(this.time * 4) % 2))
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
            const turning = Math.abs(turn) > 0.28
            const frame = turning
              ? 12 + (turn < 0 ? 0 : 1)
              : a.walking ? (Math.sin(a.bob) >= 0 ? 4 : 8) + direction : direction
            this.setSpriteFrame(a, frame)
          }
        }
      }
      if (a.walking && !a.dead) {
        a.bob += dt * 9
        a.group.position.y = Math.abs(Math.sin(a.bob)) * 0.09
        a.body.rotation.y = Math.sin(a.bob * 0.5) * 0.04
        const stride = Math.sin(a.bob) * (a.idleKind === 'curator' || a.idleKind === 'vocalist' ? 0.18 : 0.3)
        a.leftLeg.rotation.x = stride; a.rightLeg.rotation.x = -stride
        const armStride = a.idleKind === 'correspondent' ? 0.04 : stride * 0.55
        a.leftArm.rotation.x = -armStride; a.rightArm.rotation.x = armStride
        a.prop.rotation.y = 0; a.prop.rotation.z = 0
        if (a.spriteRoot) {
          const step = Math.sin(a.bob)
          a.spriteRoot.scale.set(a.spriteFlip * (1 + Math.abs(step) * 0.025), 1 - Math.abs(step) * 0.025, 1)
          a.spriteRoot.rotation.z = step * 0.025
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
          const breath = Math.sin(phase * 0.72 + a.bob) * 0.008
          a.spriteRoot.scale.set(a.spriteFlip * (1 - breath * 0.35), 1 + breath, 1)
          a.spriteRoot.rotation.z = Math.sin(phase * 0.43 + a.bob) * 0.008
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
      v.y += a.dead ? 0.7 : 1.95
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
