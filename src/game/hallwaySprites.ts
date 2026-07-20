import * as THREE from 'three'
import type { RoomId } from './types'

export type HallwayVariant = 'walnut-runner' | 'service-tile' | 'formal-stone' | 'damp-flagstone'
export type HallwayOrientation = 'horizontal' | 'vertical'

export type HallwayConnectionId =
  | 'study-gallery' | 'gallery-conservatory'
  | 'kitchen-dining' | 'dining-ballroom'
  | 'cellar-library' | 'library-suite'
  | 'study-kitchen' | 'kitchen-cellar'
  | 'gallery-dining' | 'dining-library'
  | 'conservatory-ballroom' | 'ballroom-suite'

export interface HallwayDefinition {
  rooms: readonly [RoomId, RoomId]
  variant: HallwayVariant
  orientation: HallwayOrientation
  mirrored: boolean
}

export const HALLWAY_CONNECTIONS: Record<HallwayConnectionId, HallwayDefinition> = {
  'study-gallery': { rooms: ['study', 'gallery'], variant: 'walnut-runner', orientation: 'horizontal', mirrored: false },
  'gallery-conservatory': { rooms: ['gallery', 'conservatory'], variant: 'walnut-runner', orientation: 'horizontal', mirrored: true },
  'kitchen-dining': { rooms: ['kitchen', 'dining'], variant: 'service-tile', orientation: 'horizontal', mirrored: false },
  'dining-ballroom': { rooms: ['dining', 'ballroom'], variant: 'formal-stone', orientation: 'horizontal', mirrored: false },
  'cellar-library': { rooms: ['cellar', 'library'], variant: 'damp-flagstone', orientation: 'horizontal', mirrored: false },
  'library-suite': { rooms: ['library', 'suite'], variant: 'damp-flagstone', orientation: 'horizontal', mirrored: true },
  'study-kitchen': { rooms: ['study', 'kitchen'], variant: 'service-tile', orientation: 'vertical', mirrored: false },
  'kitchen-cellar': { rooms: ['kitchen', 'cellar'], variant: 'damp-flagstone', orientation: 'vertical', mirrored: true },
  'gallery-dining': { rooms: ['gallery', 'dining'], variant: 'formal-stone', orientation: 'vertical', mirrored: false },
  'dining-library': { rooms: ['dining', 'library'], variant: 'walnut-runner', orientation: 'vertical', mirrored: true },
  'conservatory-ballroom': { rooms: ['conservatory', 'ballroom'], variant: 'formal-stone', orientation: 'vertical', mirrored: true },
  'ballroom-suite': { rooms: ['ballroom', 'suite'], variant: 'walnut-runner', orientation: 'vertical', mirrored: false },
}

const textureCache = new Map<HallwayConnectionId, THREE.Texture>()

export function hallwayConnectionBetween(a: RoomId, b: RoomId): HallwayConnectionId | null {
  for (const [id, definition] of Object.entries(HALLWAY_CONNECTIONS) as [HallwayConnectionId, HallwayDefinition][]) {
    if ((definition.rooms[0] === a && definition.rooms[1] === b) || (definition.rooms[0] === b && definition.rooms[1] === a)) return id
  }
  return null
}

/** High-resolution authored floor sprite, one UV-safe instance per connection. */
export function getHallwayTexture(id: HallwayConnectionId): THREE.Texture {
  const cached = textureCache.get(id)
  if (cached) return cached

  const definition = HALLWAY_CONNECTIONS[id]
  const texture = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/hallways/floors/${definition.variant}-v2.png`,
  )
  texture.name = `hallway-floor-${id}`
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 4
  if (definition.mirrored) {
    texture.wrapS = THREE.RepeatWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
  }
  texture.needsUpdate = true
  textureCache.set(id, texture)
  return texture
}

export function disposeHallwayTextures() {
  for (const texture of textureCache.values()) texture.dispose()
  textureCache.clear()
}
