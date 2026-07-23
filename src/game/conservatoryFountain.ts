import * as THREE from 'three'

const FRAME_COUNT = 4
const FRAME_SECONDS = 0.16
const FRAME_ASPECT = 495 / 793

export interface ConservatoryFountain {
  group: THREE.Group
  update: (time: number) => void
  dispose: () => void
}

/** A fixed, front-facing four-frame fountain at the Conservatory's center. */
export function createConservatoryFountain(): ConservatoryFountain {
  const group = new THREE.Group()
  group.name = 'conservatory-animated-fountain'

  const texture = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/decor/sprites/conservatory/animated-fountain.png`,
  )
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.repeat.set(1 / FRAME_COUNT, 1)

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.035,
    depthWrite: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  const height = 3.2
  const fountain = new THREE.Mesh(new THREE.PlaneGeometry(height * FRAME_ASPECT, height), material)
  fountain.name = 'conservatory-fountain-sprite'
  fountain.position.y = height / 2
  fountain.renderOrder = 2
  group.add(fountain)

  const update = (time: number) => {
    const frame = Math.floor(time / FRAME_SECONDS) % FRAME_COUNT
    texture.offset.x = frame / FRAME_COUNT
  }

  const dispose = () => {
    texture.dispose()
    material.dispose()
    fountain.geometry.dispose()
  }

  return { group, update, dispose }
}
