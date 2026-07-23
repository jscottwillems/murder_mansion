import * as THREE from 'three'

import { ROOM_HALF } from './data'

const FRAME_COUNT = 4
const FRAME_SECONDS = 0.18

export interface StudyFireplace {
  group: THREE.Group
  material: THREE.MeshBasicMaterial
  glow: THREE.PointLight
  spillMaterial: THREE.MeshBasicMaterial
  update: (time: number) => void
  dispose: () => void
}

/** A wall-mounted animated practical, replacing the Study's north window. */
export function createStudyFireplace(wallThickness: number): StudyFireplace {
  const group = new THREE.Group()
  group.name = 'study-grand-fireplace'
  group.position.set(0, 0, -(ROOM_HALF - wallThickness / 2 - 0.02))

  const texture = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/decor/sprites/study/grand-fireplace-animated.png`,
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
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  const height = 3.68
  const fireplace = new THREE.Mesh(new THREE.PlaneGeometry(height * 0.75, height), material)
  // The generated strip has transparent breathing room beneath each sprite;
  // lower the plane so the visible stone plinth lands directly on the floor.
  fireplace.position.set(0, 1.21, 0.018)
  fireplace.renderOrder = 3
  group.add(fireplace)

  // Project the warmth well into the room. Its deliberately incommensurate
  // waves avoid a mechanical pulse while staying gentle enough for ambience.
  const glow = new THREE.PointLight(0xff7a24, 24, 10.5, 1.65)
  glow.position.set(0, 0.72, 0.95)
  group.add(glow)

  // The room floors intentionally use an unlit material to avoid color
  // banding, so paint a feathered additive reflection across the boards. The
  // narrow end begins at the hearth and opens naturally into the room.
  const spillCanvas = document.createElement('canvas')
  spillCanvas.width = 256
  spillCanvas.height = 256
  const context = spillCanvas.getContext('2d')!
  const spillGradient = context.createRadialGradient(128, 34, 4, 128, 74, 176)
  spillGradient.addColorStop(0, 'rgba(255, 147, 48, 0.78)')
  spillGradient.addColorStop(0.38, 'rgba(255, 105, 24, 0.32)')
  spillGradient.addColorStop(1, 'rgba(255, 76, 12, 0)')
  context.fillStyle = spillGradient
  context.fillRect(0, 0, 256, 256)
  const spillTexture = new THREE.CanvasTexture(spillCanvas)
  spillTexture.colorSpace = THREE.SRGBColorSpace
  const spillMaterial = new THREE.MeshBasicMaterial({
    map: spillTexture,
    color: 0xffd2a0,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 6.4), spillMaterial)
  spill.rotation.x = -Math.PI / 2
  spill.position.set(0, 0.026, 2.55)
  spill.renderOrder = 2
  group.add(spill)

  const update = (time: number) => {
    const frame = Math.floor(time / FRAME_SECONDS) % FRAME_COUNT
    texture.offset.x = frame / FRAME_COUNT

    const dance = Math.sin(time * 3.1) * 0.5 + Math.sin(time * 5.7 + 1.4) * 0.28 + Math.sin(time * 8.9 + 0.3) * 0.12
    glow.intensity = 24 + dance * 2.8
    glow.color.setHSL(0.075 + Math.sin(time * 1.7) * 0.008, 0.94, 0.58)
    spillMaterial.opacity = 0.11 + dance * 0.009
    spillMaterial.color.setHSL(0.075 + Math.sin(time * 1.45) * 0.004, 0.72, 0.78)
  }

  const dispose = () => {
    texture.dispose()
    spillTexture.dispose()
    material.dispose()
    spillMaterial.dispose()
    fireplace.geometry.dispose()
    spill.geometry.dispose()
  }

  return { group, material, glow, spillMaterial, update, dispose }
}
