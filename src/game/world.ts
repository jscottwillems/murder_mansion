// Three.js mansion renderer: 3x3 rooms, passageways, characters,
// painterly noir pipeline with a capped native-resolution render target,
// rain, lightning, dust motes, lamplight.
import * as THREE from 'three'
import type { RoomId } from './types'
import { BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT, BALLROOM_PIANO_FOOTPRINT, DINING_BANQUET_FOOTPRINT, DINING_GRANDFATHER_CLOCK_FOOTPRINT, GALLERY_BUST_FOOTPRINTS, MASTER_SUITE_FURNITURE_FOOTPRINTS, ROOMS, ROOM_HALF, ROOM_STEP, PASS_HALF, adjacentRooms, roomCenter } from './data'
import { atlasFrame, CHARACTER_ATLAS, NPC_ATLAS_V3 } from './characterAtlas'
import { getExteriorWallTexture, getWallTexture, disposeWallTextures } from './wallSprites'
import { createStormWindow, type ExteriorWall, type StormWindowHandles } from './stormWindows'
import { createCellarSconces, type CellarSconces } from './cellarSconces'
import { createConservatoryFountain, type ConservatoryFountain } from './conservatoryFountain'
import { createStudyFireplace, type StudyFireplace } from './studyFireplace'
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
  shadow: THREE.Mesh | null
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
  room: RoomId
  mesh: THREE.Mesh
  center: THREE.Vector3
  phase: number
  radius: number
  speed: number
  vertical: number
  flutter: number
  kind: 'fly' | 'moth'
}

interface ChampagneBubble {
  mesh: THREE.Mesh
  centerY: number
  phase: number
  speed: number
}

interface OccludingWall {
  room: RoomId
  mesh: THREE.Mesh
  materials: THREE.Material[]
  edgeMaterial: THREE.LineBasicMaterial
  opacity: number
  occluded: boolean
}

interface OccludingFixture {
  room: RoomId
  sprite: THREE.Sprite
  material: THREE.SpriteMaterial
  opacity: number
  occluded: boolean
}

// Cap Retina rendering to keep the painterly scene within a steady GPU
// fill-rate budget while retaining authored sprite detail.
const MAX_RENDER_PIXEL_RATIO = 1.5
const INACTIVE_ROOM_LIGHT_LEVEL = 0.015
const INACTIVE_ROOM_VEIL_OPACITY = 0.88
const ROOM_LIGHT_FADE_SPEED = 1.65
// Most floor sources are material swatches, not room-wide compositions. Tiling
// them twice brings planks and masonry back to a believable scale beside the
// 2.45-unit actors. Preserve the Ballroom's authored central medallion.
const FLOOR_TEXTURE_REPEATS: Record<RoomId, number> = {
  study: 2,
  gallery: 2,
  conservatory: 2,
  kitchen: 2,
  dining: 2,
  ballroom: 1,
  cellar: 2,
  library: 2,
  suite: 2,
}
// Character cutouts are 2.45 units tall. Keep the shared room/hallway wall
// line above them so doorway crowns frame actors instead of crossing their heads.
const WALL_H = 2.8
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
const CONVERSATION_FOCUS_X_OFFSET = -3
const CONVERSATION_FOCUS_Z_OFFSET = 5.5
const OCCLUDED_WALL_OPACITY = 0.18
const WALL_FADE_SPEED = 8
const OCCLUDED_FIXTURE_OPACITY = 0.2
const FIXTURE_FADE_SPEED = 9
const ACTOR_HEAD_X_OFFSETS = [-0.22, 0.22] as const
const ACTOR_HEAD_Y_OFFSETS = [1.68, 2.35] as const
const FIXTURE_CORNERS = [0, 1] as const
const REQUIRED_ROOM_MASKS = new Map<RoomId, number>(
  ROOMS.map(room => {
    const required = new Set<RoomId>([room.id, ...adjacentRooms(room.id)])
    return [
      room.id,
      ROOMS.reduce((mask, candidate, index) =>
        required.has(candidate.id) ? mask | (1 << index) : mask, 0),
    ]
  }),
)

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export class MansionScene {
  onInvestigationWriting: (() => void) | null = null
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
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
  private roomLightLevels = new Map<RoomId, number>()
  private roomLightTargets = new Map<RoomId, number>()
  private roomDarknessVeils = new Map<RoomId, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>()
  private roomRoots = new Map<RoomId, THREE.Group>()
  private visibleRooms = new Set<RoomId>(ROOMS.map(room => room.id))
  private visibleRoomMask = (1 << ROOMS.length) - 1
  private focusedRoom: RoomId | null = null
  private roomBounds = new Map<RoomId, THREE.Box3>()
  private cullingFrustum = new THREE.Frustum()
  private cullingProjection = new THREE.Matrix4()
  private stormWindows: StormWindowHandles[] = []
  private stormWindowRooms = new Map<StormWindowHandles, RoomId>()
  private studyFireplace: StudyFireplace | null = null
  private cellarSconces: CellarSconces | null = null
  private conservatoryFountain: ConservatoryFountain | null = null
  private hallwayWalls: HallwayWalls[] = []
  private southernWalls: OccludingWall[] = []
  private visibleSouthernWallMeshes: THREE.Mesh[] = []
  private southernWallByMesh = new Map<THREE.Object3D, OccludingWall>()
  private hangingFixtures: OccludingFixture[] = []
  private wallRaycaster = new THREE.Raycaster()
  private wallOcclusionTarget = new THREE.Vector3()
  private wallOcclusionDirection = new THREE.Vector3()
  private fixtureCameraRight = new THREE.Vector3()
  private fixtureCameraUp = new THREE.Vector3()
  private fixtureWorld = new THREE.Vector3()
  private fixtureCorner = new THREE.Vector3()
  private fixtureProjected = new THREE.Vector3()
  private desiredCameraPosition = new THREE.Vector3()
  private labelPosition = new THREE.Vector3()
  private ceilingInsects: CeilingInsect[] = []
  private champagneBubbles: ChampagneBubble[] = []
  private materialCache = new Map<string, THREE.MeshStandardMaterial>()
  private floorTextureCache = new Map<string, THREE.Texture>()
  private inspectionMarker: THREE.Sprite
  private inspectionMarkerMaterial: THREE.SpriteMaterial
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
    // The native-resolution texture pass preserves authored sprite detail.
    // Hardware MSAA multiplied the full-scene fill cost (and caused the
    // observed frame-rate regression), so transparent art relies on its
    // filtered alpha edges instead.
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_RENDER_PIXEL_RATIO))
    // Compress bright practical-light gradients before the post-process pass.
    // Without tone mapping, the steep point-light falloff produces visible
    // concentric bands across darker room floors.
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

    const inspectionTexture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/ui/inspection-magnifier.png`,
    )
    inspectionTexture.colorSpace = THREE.SRGBColorSpace
    inspectionTexture.minFilter = THREE.LinearMipmapLinearFilter
    inspectionTexture.magFilter = THREE.NearestFilter
    inspectionTexture.generateMipmaps = true
    this.inspectionMarkerMaterial = new THREE.SpriteMaterial({
      map: inspectionTexture,
      transparent: true,
      alphaTest: 0.04,
      // This is an interaction indicator, not scene geometry. Keeping depth
      // testing enabled let chandeliers and the furnishing itself slice the
      // icon into misleading low/off-center fragments.
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
    this.inspectionMarker = new THREE.Sprite(this.inspectionMarkerMaterial)
    this.inspectionMarker.name = 'furnishing-inspection-marker'
    this.inspectionMarker.scale.setScalar(0.68)
    this.inspectionMarker.visible = false
    this.inspectionMarker.renderOrder = 8
    this.scene.add(this.inspectionMarker)

    this.buildMansion()
    this.visibleSouthernWallMeshes = this.southernWalls.map(wall => wall.mesh)
    this.southernWallByMesh = new Map(this.southernWalls.map(wall => [wall.mesh, wall]))
    this.buildRain()
    this.buildDust()

    this.resize()
    window.addEventListener('resize', this.resize)
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
    this.renderer.dispose()
    this.edgeMat.dispose()
    this.inspectionMarkerMaterial.map?.dispose()
    this.inspectionMarkerMaterial.dispose()
    for (const wall of this.southernWalls) {
      for (const material of wall.materials) material.dispose()
      wall.edgeMaterial.dispose()
    }
    for (const fixture of this.hangingFixtures) fixture.material.dispose()
    for (const veil of this.roomDarknessVeils.values()) {
      veil.geometry.dispose()
      veil.material.dispose()
    }
    disposeWallTextures()
    disposeHallwayTextures()
    this.studyFireplace?.dispose()
    this.conservatoryFountain?.dispose()
    for (const hallway of this.hallwayWalls) hallway.dispose()
    this.container.removeChild(this.renderer.domElement)
    this.container.removeChild(this.labelLayer)
  }

  setInspectionMarker(position: { x: number; y: number; z: number } | null) {
    this.inspectionMarker.visible = Boolean(position)
    if (position) this.inspectionMarker.position.set(position.x, position.y, position.z)
  }

  private resize = () => {
    const w = Math.max(2, this.container.clientWidth)
    const h = Math.max(2, this.container.clientHeight)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_RENDER_PIXEL_RATIO)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
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
      texture.magFilter = THREE.LinearFilter
      const repeat = FLOOR_TEXTURE_REPEATS[roomId]
      if (repeat > 1) {
        // Mirroring keeps opposite edges continuous even though the painterly
        // source swatches were not exported as seamless textures.
        texture.wrapS = THREE.MirroredRepeatWrapping
        texture.wrapT = THREE.MirroredRepeatWrapping
        texture.repeat.set(repeat, repeat)
      } else {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
      }
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
      this.buildStormWindows(g, r.id, r.col, r.row)

      this.buildRoomLighting(g, r.id, r.lightColor, r.lightIntensity)

      if (r.id === 'study') this.buildStudyDesk(g)

      if (r.id === 'dining') this.buildDiningFurniture(g)

      if (r.id === 'ballroom') {
        this.buildBallroomGrandPiano(g)
        this.buildBallroomCurtains(g)
        this.buildBallroomChampagneTower(g)
      }

      if (r.id === 'gallery') {
        this.buildGalleryBusts(g)
        this.buildGalleryWallArt(g)
      }

      if (r.id === 'conservatory') {
        this.conservatoryFountain = createConservatoryFountain()
        g.add(this.conservatoryFountain.group)
        this.buildConservatoryGardenShelves(g)
        this.buildConservatoryCornerPlant(g)
        this.buildConservatoryNortheastPalm(g)
      }

      if (r.id === 'suite') {
        this.buildMasterSuiteRug(g)
        this.buildMasterSuiteFurniture(g)
      }

      if (r.id === 'cellar') {
        this.cellarSconces = createCellarSconces()
        g.add(this.cellarSconces.group)
      }

      // One translucent plane suppresses global ambient/moonlight in inactive
      // rooms. This is much cheaper than keeping their practical lights in the
      // renderer just to achieve a dim background silhouette.
      const darknessMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      })
      const darknessVeil = new THREE.Mesh(new THREE.PlaneGeometry(10.15, 10.15), darknessMaterial)
      darknessVeil.rotation.x = -Math.PI / 2
      darknessVeil.position.y = WALL_H + 0.08
      darknessVeil.renderOrder = 20
      darknessVeil.visible = false
      g.add(darknessVeil)
      this.roomDarknessVeils.set(r.id, darknessVeil)

      this.roomRoots.set(r.id, g)
      // Floors, trim, walls, and authored decor stay within roughly 0.2 units
      // of the nominal 10x10 room footprint. A 0.55-unit safety margin retains
      // their complete silhouettes without making neighboring empty space count
      // as visible room geometry.
      this.roomBounds.set(r.id, new THREE.Box3(
        new THREE.Vector3(c.x - ROOM_HALF - 0.55, -1, c.z - ROOM_HALF - 0.55),
        new THREE.Vector3(c.x + ROOM_HALF + 0.55, 5, c.z + ROOM_HALF + 0.55),
      ))
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

  private buildStormWindows(g: THREE.Group, room: RoomId, col: number, row: number) {
    const sides: ExteriorWall[] = []
    if (row === 0) sides.push('north')
    if (row === 2) sides.push('south')
    if (col === 0) sides.push('west')
    if (col === 2) sides.push('east')
    for (const [index, side] of sides.entries()) {
      if (room === 'study' && side === 'north') {
        this.studyFireplace = createStudyFireplace(WALL_T)
        g.add(this.studyFireplace.group)
        continue
      }
      const window = createStormWindow(g, { side, wallHeight: WALL_H, wallThickness: WALL_T, seed: col * 101 + row * 17 + index * 7919 })
      this.stormWindows.push(window)
      this.stormWindowRooms.set(window, room)
    }
  }

  /** Authored practicals keep each room's pools of light tied to its purpose. */
  private buildRoomLighting(g: THREE.Group, room: RoomId, color: number, intensity: number) {
    const layouts: Record<RoomId, Array<[number, number, number]>> = {
      // Keep the pendant clear of the grand fireplace's silhouette from the
      // game's primary camera angle.
      study: [[-1.85, -0.6, 0.35], [1.85, -0.6, 0.35]],
      gallery: [[0, -0.7, 1.15]],
      conservatory: [[-2.1, 1.4, 0.72], [2.15, -1.45, 0.68]],
      kitchen: [[-2.2, -1.8, 0.72], [2.25, 2.0, 0.66]],
      dining: [[0, 0.55, 1.35]],
      ballroom: [[0, 0, 1.55]],
      cellar: [[-2.65, 2.1, 0.48], [2.7, -2.35, 0.43]],
      library: [[0, 0.15, 1.35]],
      suite: [[0, 0, 1.3]],
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
      this.buildLightingSprite(g, room, asset, x, fixtureY - 0.25, z, spriteHeight)
      if (room === 'cellar') this.buildCeilingInsects(g, room, 'fly', x, fixtureY - 0.04, z, 7)
      if (room === 'conservatory') this.buildCeilingInsects(g, room, 'moth', x, fixtureY - 0.02, z, 5)
      const light = new THREE.PointLight(color, intensity * 21 * share, room === 'ballroom' ? 14 : 11.5, 1.4)
      light.position.set(x, fixtureY + 0.08, z)
      light.userData.baseIntensity = light.intensity
      light.userData.lightShare = share
      g.add(light)
      lights.push(light)
    }
    this.roomLights.set(room, lights)
    this.roomLightLevels.set(room, 1)
    this.roomLightTargets.set(room, 1)
  }

  private buildLightingSprite(g: THREE.Group, room: RoomId, asset: string, x: number, y: number, z: number, height: number) {
    const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/lighting/${asset}.png`, loaded => {
      const image = loaded.image as { width?: number; height?: number } | undefined
      if (image?.width && image.height) sprite.scale.x = height * image.width / image.height
    })
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
    const overlaysDiningTable = asset === 'dining-ceiling-chandelier'
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.04,
      toneMapped: false,
      depthTest: !overlaysDiningTable,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(height, height, 1)
    sprite.position.set(x, y, z)
    sprite.center.set(0.5, 0.08)
    // Hanging fixtures need to composite in front of actor cutouts when their
    // camera-space silhouettes overlap. The occlusion pass below then fades
    // only the obstructing fixture so the character remains readable.
    sprite.renderOrder = 5
    g.add(sprite)
    this.hangingFixtures.push({ room, sprite, material, opacity: 1, occluded: false })
  }

  /** The Study's main work surface is a single authored cutout, grounded near
   * the north wall so its detailed desktop remains readable from the game camera. */
  private buildStudyDesk(g: THREE.Group) {
    const height = 1.9
    const width = height * (1620 / 971)
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/study/partners-desk.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.04,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
    plane.name = 'study-partners-desk'
    plane.position.y = height / 2
    plane.renderOrder = 2

    // Lock the art to the game's authored isometric viewing angle. Unlike a
    // THREE.Sprite, this plane does not swivel as the camera tracks the player.
    const fixedFurniture = new THREE.Group()
    fixedFurniture.position.set(-2.75, 0.025, -2.35)
    fixedFurniture.rotation.x = -Math.atan2(CAMERA_HEIGHT, CAMERA_Z_OFFSET)
    fixedFurniture.add(plane)
    g.add(fixedFurniture)

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 128
    shadowCanvas.height = 64
    const ctx = shadowCanvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(64, 32, 4, 64, 32, 61)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.94)')
    gradient.addColorStop(0.62, 'rgba(0, 0, 0, 0.58)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 64)
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.25, 1.45),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    shadow.name = 'study-partners-desk-shadow'
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(-2.75, 0.018, -2.72)
    shadow.renderOrder = 1
    g.add(shadow)
  }

  /** The dining room's two hero furnishings are authored as one-view cutouts.
   * Keeping them on fixed planes preserves the painted isometric perspective
   * while the camera follows the detective around the room. */
  private buildDiningFurniture(g: THREE.Group) {
    const addFixedCutout = (
      asset: string,
      name: string,
      width: number,
      height: number,
      x: number,
      z: number,
      renderOrder = 1,
      tiltToFloor = true,
    ) => {
      const texture = new THREE.TextureLoader().load(
        `${import.meta.env.BASE_URL}assets/decor/sprites/dining/${asset}.png`,
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
      })
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
      plane.name = name
      plane.position.y = height / 2
      plane.renderOrder = renderOrder

      const fixedFurniture = new THREE.Group()
      fixedFurniture.position.set(x, 0.025, z)
      if (tiltToFloor) fixedFurniture.rotation.x = -Math.atan2(CAMERA_HEIGHT, CAMERA_Z_OFFSET)
      fixedFurniture.add(plane)
      g.add(fixedFurniture)
    }

    // Keep the banquet's x center indexed to the chandelier while setting the
    // furniture slightly south so the north-side guests retain circulation.
    addFixedCutout(
      'banquet-table-chairs',
      'dining-banquet-table',
      DINING_BANQUET_FOOTPRINT.halfWidth * 2,
      3.6,
      DINING_BANQUET_FOOTPRINT.x,
      DINING_BANQUET_FOOTPRINT.z,
      2,
      false,
    )
    addFixedCutout(
      'grandfather-clock-v2',
      'dining-grandfather-clock',
      DINING_GRANDFATHER_CLOCK_FOOTPRINT.halfWidth * 2,
      2.58,
      DINING_GRANDFATHER_CLOCK_FOOTPRINT.x,
      DINING_GRANDFATHER_CLOCK_FOOTPRINT.z,
      2,
      false,
    )
  }

  /** The keyboard faces southwest into the Ballroom while the curved body
   * recedes toward the northeast corner, matching the authored perspective. */
  private buildBallroomGrandPiano(g: THREE.Group) {
    const height = 2.2
    const width = height * (1536 / 1024)
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/ballroom/grand-piano.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const piano = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.035,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    )
    piano.name = 'ballroom-grand-piano'
    piano.position.set(BALLROOM_PIANO_FOOTPRINT.x, height / 2, BALLROOM_PIANO_FOOTPRINT.z)
    piano.renderOrder = 2
    g.add(piano)

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 128
    const context = shadowCanvas.getContext('2d')!
    const gradient = context.createRadialGradient(128, 64, 10, 128, 64, 122)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.82)')
    gradient.addColorStop(0.58, 'rgba(0, 0, 0, 0.48)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 128)
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.45, 1.55),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.74,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    shadow.name = 'ballroom-grand-piano-shadow'
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(BALLROOM_PIANO_FOOTPRINT.x, 0.02, BALLROOM_PIANO_FOOTPRINT.z + 0.4)
    shadow.renderOrder = 1
    g.add(shadow)
  }

  /** Tall ivory panels establish the same symmetric cadence around the
   * Ballroom's centred east window and its three centred entryways. */
  private buildBallroomCurtains(g: THREE.Group) {
    const height = WALL_H + 0.1
    const width = height * (856 / 1920)
    // Project the textile slightly into the room, matching the shallow
    // furnishing depth used by the Conservatory shelving.
    const wallFace = ROOM_HALF - WALL_T / 2 - 0.085
    const doorwayOffset = 3.02
    const windowOffset = 1.82
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/ballroom/tall-white-curtain.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const placements = [
      // East exterior window: close enough to frame its 2.2-unit opening.
      { side: 'east', x: wallFace, z: -windowOffset, rotationY: -Math.PI / 2, mirrored: false },
      { side: 'east', x: wallFace, z: windowOffset, rotationY: -Math.PI / 2, mirrored: true },
      // Remaining pairs share an exact offset from their centred entryways.
      { side: 'north', x: -doorwayOffset, z: -wallFace, rotationY: 0, mirrored: false },
      { side: 'north', x: doorwayOffset, z: -wallFace, rotationY: 0, mirrored: true },
      { side: 'south', x: -doorwayOffset, z: wallFace, rotationY: Math.PI, mirrored: true },
      { side: 'south', x: doorwayOffset, z: wallFace, rotationY: Math.PI, mirrored: false },
      { side: 'west', x: -wallFace, z: -doorwayOffset, rotationY: Math.PI / 2, mirrored: true },
      { side: 'west', x: -wallFace, z: doorwayOffset, rotationY: Math.PI / 2, mirrored: false },
    ] as const

    const southernSegments = this.southernWalls.filter(wall => wall.room === 'ballroom')
    for (const [index, placement] of placements.entries()) {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      })
      const curtain = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
      curtain.name = `ballroom-white-curtain-${placement.side}-${index % 2 === 0 ? 'left' : 'right'}`
      curtain.position.set(placement.x, height / 2, placement.z)
      curtain.rotation.y = placement.rotationY
      curtain.scale.x = placement.mirrored ? -1 : 1
      curtain.renderOrder = 2
      g.add(curtain)

      // Keep foreground textiles synchronized with their fading south wall.
      if (placement.side === 'south') {
        const segment = southernSegments.reduce((nearest, wall) =>
          Math.abs(wall.mesh.position.x - placement.x) < Math.abs(nearest.mesh.position.x - placement.x)
            ? wall
            : nearest
        )
        segment.materials.push(material)
      }
    }
  }

  /** The furniture remains still; only tiny highlights within the filled
   * coupe bowls rise and fade to suggest continuously bubbling champagne. */
  private buildBallroomChampagneTower(g: THREE.Group) {
    const height = 2.42
    const width = height * (1004 / 1566)
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/ballroom/champagne-tower.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const tower = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.035,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    )
    tower.name = 'ballroom-champagne-tower'
    tower.position.set(
      BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.x,
      height / 2 + 0.02,
      BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.z,
    )
    tower.renderOrder = 3
    g.add(tower)

    const bubbleCenters = [
      [0, 2.27],
      [-0.23, 2.08], [0.23, 2.08],
      [-0.38, 1.89], [0, 1.89], [0.38, 1.89],
      [-0.51, 1.69], [-0.17, 1.69], [0.17, 1.69], [0.51, 1.69],
      [-0.61, 1.49], [-0.31, 1.49], [0, 1.49], [0.31, 1.49], [0.61, 1.49],
    ] as const
    const bubbleGeometry = new THREE.CircleGeometry(0.018, 10)
    for (const [index, [x, y]] of bubbleCenters.entries()) {
      const material = new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? 0xfff4bf : 0xffdf78,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        toneMapped: false,
      })
      const bubble = new THREE.Mesh(bubbleGeometry, material)
      bubble.name = `ballroom-champagne-bubble-${index}`
      bubble.position.set(BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.x + x, y, BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.z + 0.025)
      bubble.scale.setScalar(0.72 + (index % 4) * 0.13)
      bubble.renderOrder = 4
      g.add(bubble)
      this.champagneBubbles.push({
        mesh: bubble,
        centerY: y,
        phase: index * 0.83,
        speed: 1.8 + (index % 5) * 0.23,
      })
    }
  }

  /** A fixed, top-down textile layer softens the Suite's open central floor. */
  private buildMasterSuiteRug(g: THREE.Group) {
    const width = 6
    const length = 6.82
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/suite/aubusson-rug.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.035,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    rug.name = 'suite-aubusson-rug'
    rug.rotation.x = -Math.PI / 2
    rug.position.set(0, 0.018, 0)
    rug.renderOrder = 1
    g.add(rug)
  }

  /** A coordinated first furniture pass occupies three corner zones while
   * preserving the Suite's centred north/west entries and east/south windows. */
  private buildMasterSuiteFurniture(g: THREE.Group) {
    const placements = [
      { id: 'bed', asset: 'large-victorian-bed', width: 4.14, height: 2.76, renderOrder: 2 },
      { id: 'vanity', asset: 'vanity-v2', width: 1.87, height: 2.82, renderOrder: 2 },
      { id: 'plant', asset: 'rubber-plant', width: 1.6, height: 2.4, renderOrder: 3 },
    ] as const

    for (const placement of placements) {
      const footprint = MASTER_SUITE_FURNITURE_FOOTPRINTS.find(item => item.id === placement.id)!
      const texture = new THREE.TextureLoader().load(
        `${import.meta.env.BASE_URL}assets/decor/sprites/suite/${placement.asset}.png`,
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      })
      const furniture = new THREE.Mesh(
        new THREE.PlaneGeometry(placement.width, placement.height),
        material,
      )
      furniture.name = `suite-${placement.id}`
      furniture.position.set(footprint.x, placement.height / 2 + 0.02, footprint.z)
      // Keep the bed's depth angle fixed, then add a small clockwise artwork
      // tilt that remains visibly locked as the camera moves.
      if (placement.id === 'bed') {
        furniture.rotation.y = THREE.MathUtils.degToRad(13)
        furniture.rotation.z = THREE.MathUtils.degToRad(-8)
      }
      furniture.renderOrder = placement.renderOrder
      g.add(furniture)
    }
  }

  /** Four matched portrait busts form an exact mirrored 2x2 gallery grid. */
  private buildGalleryBusts(g: THREE.Group) {
    const height = 2.35
    const width = height * (887 / 1774)
    for (const bust of GALLERY_BUST_FOOTPRINTS) {
      const texture = new THREE.TextureLoader().load(
        `${import.meta.env.BASE_URL}assets/decor/sprites/gallery/bust-${bust.id}.png`,
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
      })
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
      plane.name = `gallery-bust-${bust.id}`
      plane.position.set(bust.x, height / 2 + 0.025, bust.z)
      plane.renderOrder = 2
      g.add(plane)
    }
  }

  /** Six framed works sit directly on the Gallery's wall planes. Side-wall
   * rotation supplies the correct in-world perspective without baking a
   * camera-specific skew into the source paintings. */
  private buildGalleryWallArt(g: THREE.Group) {
    const wallInset = ROOM_HALF - WALL_T / 2 - 0.018
    const height = 1.62
    const placements = [
      { asset: 'art-north-manor', x: -2.78, z: -wallInset, rotationY: 0 },
      { asset: 'art-north-coast', x: 2.78, z: -wallInset, rotationY: 0 },
      { asset: 'art-west-botanical', x: -wallInset, z: -3.38, rotationY: Math.PI / 2 },
      { asset: 'art-west-hunt', x: -wallInset, z: 3.38, rotationY: Math.PI / 2 },
      { asset: 'art-east-portrait', x: wallInset, z: -3.38, rotationY: -Math.PI / 2 },
      { asset: 'art-east-library', x: wallInset, z: 3.38, rotationY: -Math.PI / 2 },
    ]

    for (const placement of placements) {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.04,
          toneMapped: false,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      const material = plane.material as THREE.MeshBasicMaterial
      const texture = new THREE.TextureLoader().load(
        `${import.meta.env.BASE_URL}assets/decor/sprites/gallery/${placement.asset}.png`,
        loaded => {
          const image = loaded.image as { width?: number; height?: number } | undefined
          if (image?.width && image.height) plane.scale.x = height * image.width / image.height
        },
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      material.map = texture
      material.needsUpdate = true

      plane.name = `gallery-${placement.asset}`
      plane.position.set(placement.x, 1.62, placement.z)
      plane.rotation.y = placement.rotationY
      plane.scale.set(height * 0.72, height, 1)
      plane.renderOrder = 1
      g.add(plane)
    }

    const drapeHeight = 2.27
    const drapeTexture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/gallery/gallery-maroon-drapes.png`,
    )
    drapeTexture.colorSpace = THREE.SRGBColorSpace
    drapeTexture.generateMipmaps = false
    drapeTexture.minFilter = THREE.LinearFilter
    drapeTexture.magFilter = THREE.NearestFilter
    drapeTexture.anisotropy = 4
    const drapes = new THREE.Mesh(
      new THREE.PlaneGeometry(drapeHeight * 1.5, drapeHeight),
      new THREE.MeshBasicMaterial({
        map: drapeTexture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    )
    drapes.name = 'gallery-maroon-window-drapes'
    // The window's three-dimensional frame projects slightly into the room.
    // Keep the textile plane clearly ahead of it and let opaque curtain pixels
    // write depth, preventing the bars from bleeding through the fabric.
    drapes.position.set(0, 1.55, -wallInset + 0.12)
    drapes.renderOrder = 2
    g.add(drapes)
  }

  /** Four two-unit shelf bays flank the Conservatory's exterior windows.
   * Reused themes are shuffled into different bays and mirrored on their
   * second appearance so no adjacent silhouettes repeat. */
  private buildConservatoryGardenShelves(g: THREE.Group) {
    const wallFace = ROOM_HALF - WALL_T / 2 - 0.14
    const height = 2.62
    const width = 1.66
    const placements = [
      { asset: 'garden-shelf-north-left', x: -3.94, z: -wallFace, rotationY: 0, mirrored: false },
      { asset: 'garden-shelf-east-south', x: -2.16, z: -wallFace, rotationY: 0, mirrored: true },
      { asset: 'garden-shelf-east-north', x: 2.16, z: -wallFace, rotationY: 0, mirrored: true },
      { asset: 'garden-shelf-north-right', x: wallFace, z: -2.16, rotationY: -Math.PI / 2, mirrored: true },
      { asset: 'garden-shelf-north-left', x: wallFace, z: 2.16, rotationY: -Math.PI / 2, mirrored: true },
      { asset: 'garden-shelf-east-south', x: wallFace, z: 3.94, rotationY: -Math.PI / 2, mirrored: false },
    ]

    for (const placement of placements) {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.04,
          toneMapped: false,
          side: THREE.DoubleSide,
          depthWrite: true,
        }),
      )
      const material = plane.material as THREE.MeshBasicMaterial
      const texture = new THREE.TextureLoader().load(
        `${import.meta.env.BASE_URL}assets/decor/sprites/conservatory/${placement.asset}.png`,
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      material.map = texture
      material.needsUpdate = true

      plane.name = `conservatory-${placement.asset}${placement.mirrored ? '-mirrored' : ''}`
      plane.position.set(placement.x, height / 2 + 0.025, placement.z)
      plane.rotation.y = placement.rotationY
      plane.scale.set(placement.mirrored ? -width : width, height, 1)
      plane.renderOrder = 1
      g.add(plane)
    }
  }

  /** A broad monstera softens the Conservatory's otherwise empty southwest
   * corner. The authored cutout stays front-facing to the primary camera. */
  private buildConservatoryCornerPlant(g: THREE.Group) {
    const height = 2.25
    const width = height * (410 / 581)
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/conservatory/potted-monstera.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const plant = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    )
    plant.name = 'conservatory-southwest-monstera'
    plant.position.set(-3.7, height / 2 + 0.025, 3.15)
    plant.renderOrder = 2
    g.add(plant)
  }

  /** A tall palm fills the northeast corner after removing the two shelf bays
   * that formerly converged there. */
  private buildConservatoryNortheastPalm(g: THREE.Group) {
    const height = 2.82
    const width = height * (1024 / 1536)
    const texture = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}assets/decor/sprites/conservatory/kentia-palm-urn.png`,
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = true
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    const palm = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    )
    palm.name = 'conservatory-northeast-kentia-palm'
    palm.position.set(3.68, height / 2 + 0.025, -3.5)
    palm.renderOrder = 2
    g.add(palm)
  }

  private buildCeilingInsects(g: THREE.Group, room: RoomId, kind: 'fly' | 'moth', x: number, y: number, z: number, count: number) {
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
        room,
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
    const sharedMaterial = new THREE.MeshStandardMaterial({
      map: getWallTexture(room),
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.04,
    })
    const sharedExteriorMaterial = new THREE.MeshStandardMaterial({
      map: getExteriorWallTexture(),
      color: 0xffffff,
      roughness: 0.94,
      metalness: 0.01,
    })
    const gap = PASS_HALF + 0.6 // door half-width
    const mk = (w: number, d: number, x: number, z: number, outsideFace: 0 | 1 | 4 | 5, southern = false) => {
      const interior = southern ? sharedMaterial.clone() : sharedMaterial
      const exterior = southern ? sharedExteriorMaterial.clone() : sharedExteriorMaterial
      const materials = Array<THREE.MeshStandardMaterial>(6).fill(interior)
      materials[outsideFace] = exterior
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), materials)
      wall.position.set(x, WALL_H / 2, z)
      if (southern) {
        interior.transparent = true
        exterior.transparent = true
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x08070a, transparent: true, opacity: 0.42 })
        wall.add(new THREE.LineSegments(new THREE.EdgesGeometry(wall.geometry), edgeMaterial))
        this.southernWalls.push({ room, mesh: wall, materials: [interior, exterior], edgeMaterial, opacity: 1, occluded: false })
      } else {
        this.addBoxEdges(wall)
      }
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
        const outsideFace = s.sign < 0 ? 5 : 4
        if (s.has) {
          const seg = L - gap
          mk(seg, WALL_T, -(gap + seg / 2), z, outsideFace, s.sign > 0)
          mk(seg, WALL_T, gap + seg / 2, z, outsideFace, s.sign > 0)
        } else {
          mk(L * 2, WALL_T, 0, z, outsideFace, s.sign > 0)
        }
      } else {
        const x = s.sign * L
        const outsideFace = s.sign < 0 ? 1 : 0
        if (s.has) {
          const seg = L - gap
          mk(WALL_T, seg, x, -(gap + seg / 2), outsideFace)
          mk(WALL_T, seg, x, gap + seg / 2, outsideFace)
        } else {
          mk(WALL_T, L * 2, x, 0, outsideFace)
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
    let actorShadow: THREE.Mesh | null = null
    const spriteScale = isDetective ? 1 : (NPC_ATLAS_V3.scaleByArchetype[archetypeId ?? ''] ?? 1)
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
      actorShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.43, 16),
        new THREE.MeshBasicMaterial({ color: 0x050407, transparent: true, opacity: 0.42, depthWrite: false }),
      )
      // Keep the floor shadow in actor space. The portrait root continually
      // billboards toward the camera and flips for directional art; parenting
      // the shadow there makes its floor registration vary with those visual
      // transforms as the camera tracks north/south through a room.
      actorShadow.scale.set(spriteScale, spriteScale * 0.42, 1)
      actorShadow.rotation.x = -Math.PI / 2
      actorShadow.position.y = 0.018
      actorShadow.renderOrder = 3
      group.add(actorShadow)
      group.add(spriteRoot)
    }
    this.scene.add(group)

    const label = document.createElement('div')
    label.textContent = name
    label.style.cssText = `position:absolute;transform:translate(-50%,-100%);font:600 11px Georgia,serif;color:${isDetective ? '#e8d8a0' : '#d8d0c0'};text-shadow:0 1px 3px #000,0 0 6px #000;white-space:nowrap;letter-spacing:0.04em;`
    this.labelLayer.appendChild(label)

    if (spriteRoot) spriteRoot.scale.set(spriteScale, spriteScale, 1)
    this.actors.set(id, { group, body, head, label, walking: false, dead: false, bob: Math.random() * Math.PI * 2, leftArm, rightArm, leftLeg, rightLeg, prop, idleKind, facingY: 0, targetFacingY: 0, outline, outlined: false, spriteRoot, spriteMaterial, shadow: actorShadow, spriteFlip: 1, spriteScale, spriteAtlas: true, spriteKind: isDetective ? 'detective' : 'npc', spriteRows: isDetective ? CHARACTER_ATLAS.detectiveRows : NPC_ATLAS_V3.rowsPerAtlas, spriteFrame: 0, defaultForward: !isDetective, action: null, actionStartedAt: 0, actionUntil: 0 })
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
      if (a.shadow?.material instanceof THREE.MeshBasicMaterial) a.shadow.material.opacity = 0.42 * reveal
      a.label.style.opacity = String(reveal)
    }
  }

  faceActorAt(id: string, x: number, z: number, immediate = false) {
    const a = this.actors.get(id)
    if (!a || a.dead) return
    const dx = x - a.group.position.x
    const dz = z - a.group.position.z
    if (dx * dx + dz * dz > 0.000001) {
      a.targetFacingY = Math.atan2(-dx, -dz)
      if (immediate) a.facingY = a.targetFacingY
      a.defaultForward = false
    }
  }

  playActorAction(id: string, action: 'investigate', duration = 1.88) {
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
      const actionScale = NPC_ATLAS_V3.actionScaleByArchetype[a.idleKind] ?? 1
      a.spriteRoot.scale.set(1.15 * actionScale * a.spriteScale, 1.15 * actionScale * a.spriteScale, 1)
      const art = a.spriteRoot.children[0]
      art.position.set(0, 0, 0)
      if (a.shadow) a.shadow.visible = false
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

  resetRoomLights() {
    for (const r of ROOMS) {
      const lights = this.roomLights.get(r.id) ?? []
      for (const l of lights) {
        l.color.setHex(r.lightColor)
        l.userData.baseIntensity = r.lightIntensity * 21 * Number(l.userData.lightShare ?? 1)
        l.intensity = Number(l.userData.baseIntensity)
        l.visible = true
      }
      this.roomLightLevels.set(r.id, 1)
      this.roomLightTargets.set(r.id, r.id === this.focusedRoom ? 1 : INACTIVE_ROOM_LIGHT_LEVEL)
      const veil = this.roomDarknessVeils.get(r.id)
      if (veil) {
        veil.material.opacity = 0
        veil.visible = false
      }
    }
  }

  focusRoom(room: RoomId) {
    for (const candidate of ROOMS) {
      this.roomLightTargets.set(
        candidate.id,
        candidate.id === room ? 1 : INACTIVE_ROOM_LIGHT_LEVEL,
      )
    }
    this.focusedRoom = room
    const c = roomCenter(room)
    this.camTarget.set(c.x, 0, c.z)
    // keep dust in the focused room
    const pos = this.dust.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      this.dustBase[i * 3] = c.x + (Math.random() - 0.5) * 8
      this.dustBase[i * 3 + 2] = c.z + (Math.random() - 0.5) * 8
    }
  }

  private updateVisibleRooms() {
    if (!this.focusedRoom) return

    this.cullingProjection.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
    this.cullingFrustum.setFromProjectionMatrix(this.cullingProjection)

    const requiredMask = REQUIRED_ROOM_MASKS.get(this.focusedRoom) ?? 0
    let nextMask = 0
    for (let index = 0; index < ROOMS.length; index++) {
      const room = ROOMS[index].id
      const bounds = this.roomBounds.get(room)
      if ((requiredMask & (1 << index)) !== 0 || (bounds && this.cullingFrustum.intersectsBox(bounds))) {
        nextMask |= 1 << index
      }
    }
    if (nextMask === this.visibleRoomMask) return
    this.visibleRoomMask = nextMask
    this.visibleRooms = new Set(
      ROOMS.filter((_, index) => (nextMask & (1 << index)) !== 0).map(room => room.id),
    )
    for (const [roomId, root] of this.roomRoots) root.visible = this.visibleRooms.has(roomId)

    // Explicit raycast lists are not pruned by a hidden ancestor consistently,
    // so keep a compact active list and restore hidden fade state immediately.
    this.visibleSouthernWallMeshes = []
    for (const wall of this.southernWalls) {
      if (this.visibleRooms.has(wall.room)) {
        this.visibleSouthernWallMeshes.push(wall.mesh)
        continue
      }
      wall.occluded = false
      wall.opacity = 1
      for (const material of wall.materials) {
        material.opacity = 1
        material.depthWrite = true
      }
      wall.edgeMaterial.opacity = 0.42
    }
    for (const fixture of this.hangingFixtures) {
      if (this.visibleRooms.has(fixture.room)) continue
      fixture.occluded = false
      fixture.opacity = 1
      fixture.material.opacity = 1
      fixture.material.depthWrite = true
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
      (playerZ + guestZ) * 0.5 + CONVERSATION_FOCUS_Z_OFFSET,
    )
  }

  cameraDebug() {
    return {
      desiredFocus: { x: this.camTarget.x, z: this.camTarget.z },
      lookAt: { x: this.camLook.x, z: this.camLook.z },
      position: { x: this.camPos.x, y: this.camPos.y, z: this.camPos.z },
      culling: {
        visibleRooms: [...this.visibleRooms],
        visibleRoomCount: this.visibleRooms.size,
        totalRoomCount: this.roomRoots.size,
      },
      roomLighting: Object.fromEntries(ROOMS.map(room => [
        room.id,
        {
          level: Number((this.roomLightLevels.get(room.id) ?? 1).toFixed(2)),
          target: this.roomLightTargets.get(room.id) ?? 1,
          activeLights: (this.roomLights.get(room.id) ?? []).filter(light => light.visible).length,
          veilOpacity: Number((this.roomDarknessVeils.get(room.id)?.material.opacity ?? 0).toFixed(2)),
        },
      ])),
      fadedSouthernWalls: this.southernWalls.filter(wall => wall.opacity < 0.99).map(wall => ({
        x: Number(wall.mesh.getWorldPosition(new THREE.Vector3()).x.toFixed(2)),
        z: Number(wall.mesh.getWorldPosition(new THREE.Vector3()).z.toFixed(2)),
        opacity: Number(wall.opacity.toFixed(2)),
      })),
      fadedHangingLights: this.hangingFixtures.filter(fixture => fixture.opacity < 0.99).map(fixture => ({
        x: Number(fixture.sprite.getWorldPosition(new THREE.Vector3()).x.toFixed(2)),
        z: Number(fixture.sprite.getWorldPosition(new THREE.Vector3()).z.toFixed(2)),
        opacity: Number(fixture.opacity.toFixed(2)),
      })),
    }
  }

  private updateSouthernWallOpacity(dt: number) {
    for (const wall of this.southernWalls) {
      if (this.visibleRooms.has(wall.room)) wall.occluded = false
    }

    const target = this.wallOcclusionTarget
    const direction = this.wallOcclusionDirection
    for (const actor of this.actors.values()) {
      if (!actor.group.visible) continue
      actor.group.getWorldPosition(target)
      // Test the grounded portion of each cutout: the foreground wall first
      // hides a character's feet/lower body as they approach it.
      target.y += actor.dead ? 0.08 : 0.28
      direction.copy(target).sub(this.camera.position)
      const actorDistance = direction.length()
      this.wallRaycaster.set(this.camera.position, direction.normalize())
      this.wallRaycaster.far = Math.max(0, actorDistance - 0.05)
      for (const hit of this.wallRaycaster.intersectObjects(this.visibleSouthernWallMeshes, false)) {
        const wall = this.southernWallByMesh.get(hit.object)
        if (wall) wall.occluded = true
      }
    }

    const blend = 1 - Math.exp(-dt * WALL_FADE_SPEED)
    for (const wall of this.southernWalls) {
      if (!this.visibleRooms.has(wall.room)) continue
      const targetOpacity = wall.occluded ? OCCLUDED_WALL_OPACITY : 1
      wall.opacity = THREE.MathUtils.lerp(wall.opacity, targetOpacity, blend)
      if (Math.abs(wall.opacity - targetOpacity) < 0.005) wall.opacity = targetOpacity
      for (const material of wall.materials) {
        material.opacity = wall.opacity
        // Once the character clears the sightline, restore the wall's depth
        // immediately while its color eases back in. Leaving depth writes off
        // until the fade was nearly complete let wall-mounted sprites behind
        // the masonry pop through during the entire fade-in transition.
        material.depthWrite = !wall.occluded
      }
      wall.edgeMaterial.opacity = 0.42 * wall.opacity
    }
  }

  private updateHangingFixtureOpacity(dt: number) {
    for (const fixture of this.hangingFixtures) {
      if (this.visibleRooms.has(fixture.room)) fixture.occluded = false
    }

    const cameraRight = this.fixtureCameraRight.setFromMatrixColumn(this.camera.matrixWorld, 0)
    const cameraUp = this.fixtureCameraUp.setFromMatrixColumn(this.camera.matrixWorld, 1)
    const world = this.fixtureWorld
    const corner = this.fixtureCorner
    const projected = this.fixtureProjected
    for (const actor of this.actors.values()) {
      if (!actor.group.visible || actor.dead) continue
      actor.group.getWorldPosition(world)

      // Compare the projected head/shoulder box with the fixture's projected
      // billboard bounds. This matches what the player sees on screen instead
      // of treating the whole character body as one sightline.
      let headMinX = Infinity; let headMaxX = -Infinity
      let headMinY = Infinity; let headMaxY = -Infinity
      for (const xOffset of ACTOR_HEAD_X_OFFSETS) {
        for (const yOffset of ACTOR_HEAD_Y_OFFSETS) {
          projected.copy(world)
          projected.x += xOffset
          projected.y += yOffset
          projected.project(this.camera)
          headMinX = Math.min(headMinX, projected.x); headMaxX = Math.max(headMaxX, projected.x)
          headMinY = Math.min(headMinY, projected.y); headMaxY = Math.max(headMaxY, projected.y)
        }
      }

      const actorDistance = this.camera.position.distanceTo(world)
      for (const fixture of this.hangingFixtures) {
        if (!this.visibleRooms.has(fixture.room)) continue
        fixture.sprite.getWorldPosition(corner)
        if (this.camera.position.distanceTo(corner) >= actorDistance) continue
        let fixtureMinX = Infinity; let fixtureMaxX = -Infinity
        let fixtureMinY = Infinity; let fixtureMaxY = -Infinity
        for (const u of FIXTURE_CORNERS) {
          for (const v of FIXTURE_CORNERS) {
            projected.copy(corner)
              .addScaledVector(cameraRight, (u - fixture.sprite.center.x) * fixture.sprite.scale.x)
              .addScaledVector(cameraUp, (v - fixture.sprite.center.y) * fixture.sprite.scale.y)
              .project(this.camera)
            fixtureMinX = Math.min(fixtureMinX, projected.x); fixtureMaxX = Math.max(fixtureMaxX, projected.x)
            fixtureMinY = Math.min(fixtureMinY, projected.y); fixtureMaxY = Math.max(fixtureMaxY, projected.y)
          }
        }
        if (headMaxX >= fixtureMinX && headMinX <= fixtureMaxX
          && headMaxY >= fixtureMinY && headMinY <= fixtureMaxY) fixture.occluded = true
      }
    }

    const blend = 1 - Math.exp(-dt * FIXTURE_FADE_SPEED)
    for (const fixture of this.hangingFixtures) {
      if (!this.visibleRooms.has(fixture.room)) continue
      const targetOpacity = fixture.occluded ? OCCLUDED_FIXTURE_OPACITY : 1
      fixture.opacity = THREE.MathUtils.lerp(fixture.opacity, targetOpacity, blend)
      if (Math.abs(fixture.opacity - targetOpacity) < 0.005) fixture.opacity = targetOpacity
      fixture.material.opacity = fixture.opacity
      fixture.material.depthWrite = fixture.opacity > 0.98
    }
  }

  // ------------------------------------------------------------ frame

  update(dt: number) {
    this.time += dt
    if (this.inspectionMarker.visible) {
      this.inspectionMarker.position.y += Math.sin(this.time * 4.2) * 0.0008
    }
    this.updateRoomLightLevels(dt)
    // The camera follows the player near doorways, then settles on the room.
    const desired = this.desiredCameraPosition.set(this.camTarget.x, CAMERA_HEIGHT, this.camTarget.z + CAMERA_Z_OFFSET)
    this.camPos.lerp(desired, 1 - Math.exp(-dt * 2.15))
    this.camLook.lerp(this.camTarget, 1 - Math.exp(-dt * 3.4))
    this.camera.position.copy(this.camPos)
    this.camera.lookAt(this.camLook.x, 0.6, this.camLook.z)
    this.camera.updateMatrixWorld()
    this.updateVisibleRooms()
    this.updateSouthernWallOpacity(dt)
    this.updateHangingFixtureOpacity(dt)

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
    for (const window of this.stormWindows) {
      const room = this.stormWindowRooms.get(window)
      if (room && this.visibleRooms.has(room)) window.update(this.time, lightningLevel)
    }
    if (this.visibleRooms.has('study')) this.studyFireplace?.update(this.time)
    if (this.visibleRooms.has('conservatory')) this.conservatoryFountain?.update(this.time)
    if (this.visibleRooms.has('cellar')) this.cellarSconces?.update(this.time)

    if (this.visibleRooms.has('ballroom')) {
      for (const bubble of this.champagneBubbles) {
        const cycle = (this.time * bubble.speed + bubble.phase) % 1
        bubble.mesh.position.y = bubble.centerY - 0.035 + cycle * 0.075
        const material = bubble.mesh.material as THREE.MeshBasicMaterial
        material.opacity = Math.sin(cycle * Math.PI) * 0.78
      }
    }

    for (const insect of this.ceilingInsects) {
      if (!this.visibleRooms.has(insect.room)) continue
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
            // The authored investigation cells face screen-left. Mirror them
            // whenever the faced target lies to the detective's screen-right,
            // so the pose always turns toward the body instead of inheriting
            // the flip from the detective's previous movement.
            const cameraYaw = Math.atan2(
              this.camera.position.x - a.group.position.x,
              this.camera.position.z - a.group.position.z,
            )
            const targetScreenX = Math.sin(cameraYaw - a.facingY)
            if (Math.abs(targetScreenX) > 0.001) a.spriteFlip = targetScreenX > 0 ? -1 : 1
            // The rebuilt atlas registers the kneeling pose at a deliberately
            // shorter physical height, so the full investigate sequence no
            // longer produces the old oversized crouch/pop.
            const actionElapsed = this.time - a.actionStartedAt
            const nextFrame = actionElapsed < 0.78 ? 14 : 15
            const writingJustStarted = nextFrame === 15 && a.spriteFrame !== 15
            this.setSpriteFrame(a, nextFrame)
            if (writingJustStarted) this.onInvestigationWriting?.()
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

    // Render directly to the drawing buffer. The former zero-sample offscreen
    // target added a full-resolution texture copy without providing MSAA.
    this.renderer.render(this.scene, this.camera)
  }

  private updateRoomLightLevels(dt: number) {
    const blend = 1 - Math.exp(-dt * ROOM_LIGHT_FADE_SPEED)
    for (const room of ROOMS) {
      const target = this.roomLightTargets.get(room.id) ?? 1
      let level = THREE.MathUtils.lerp(this.roomLightLevels.get(room.id) ?? 1, target, blend)
      if (Math.abs(level - target) < 0.002) level = target
      this.roomLightLevels.set(room.id, level)
      const active = room.id === this.focusedRoom || level > 0.04
      for (const light of this.roomLights.get(room.id) ?? []) {
        light.visible = active
        light.intensity = Number(light.userData.baseIntensity ?? 0) * level
      }
      const veil = this.roomDarknessVeils.get(room.id)
      if (veil) {
        const opacity = INACTIVE_ROOM_VEIL_OPACITY * (1 - level)
        veil.material.opacity = opacity
        veil.visible = opacity > 0.005
      }
    }
  }

  private updateLabels() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    const v = this.labelPosition
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
