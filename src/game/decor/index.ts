import type { FurnishingPlacement } from './types'
import {
  BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT,
  BALLROOM_PIANO_FOOTPRINT,
  CONSERVATORY_FOUNTAIN_FOOTPRINT,
  DINING_BANQUET_FOOTPRINT,
  GALLERY_BUST_FOOTPRINTS,
  MASTER_SUITE_FURNITURE_FOOTPRINTS,
} from '../data'

/**
 * The authoritative pool of visible, physical furnishings that can be
 * inspected and can hide evidence. Keep this beside each furnishing's world
 * builder when adding or removing room content. Architecture, wall art,
 * curtains, windows, rugs, lights, and visual effects never belong here.
 */
export const FURNISHING_PLACEMENTS: FurnishingPlacement[] = [
  {
    id: 'study-partners-desk', name: 'Partners Desk', room: 'study', asset: 'partners-desk',
    x: -2.75, z: -2.35, height: 1.9, interactionHalfWidth: 1.55, interactionHalfDepth: 0.72,
  },
  ...GALLERY_BUST_FOOTPRINTS.map(bust => ({
    id: `gallery-bust-${bust.id}`,
    name: `${bust.id[0].toUpperCase()}${bust.id.slice(1)} Bust`,
    room: 'gallery' as const,
    asset: `bust-${bust.id}`,
    x: bust.x,
    z: bust.z,
    height: 2.35,
  })),
  {
    id: 'conservatory-animated-fountain', name: 'Fountain', room: 'conservatory', asset: 'fountain',
    x: CONSERVATORY_FOUNTAIN_FOOTPRINT.x, z: CONSERVATORY_FOUNTAIN_FOOTPRINT.z, height: 1.65,
    interactionHalfWidth: CONSERVATORY_FOUNTAIN_FOOTPRINT.halfWidth,
    interactionHalfDepth: CONSERVATORY_FOUNTAIN_FOOTPRINT.halfDepth,
  },
  {
    id: 'conservatory-southwest-monstera', name: 'Monstera', room: 'conservatory', asset: 'potted-monstera',
    x: -3.7, z: 3.15, height: 2.25,
  },
  {
    id: 'conservatory-northeast-kentia-palm', name: 'Kentia Palm', room: 'conservatory', asset: 'kentia-palm-urn',
    x: 3.68, z: -3.5, height: 2.82,
  },
  {
    id: 'dining-grandfather-clock', name: 'Grandfather Clock', room: 'dining', asset: 'grandfather-clock-v2',
    x: 3.62, z: -4.05, height: 2.58,
  },
  {
    id: 'dining-banquet-table',
    name: 'Dining Table',
    room: 'dining',
    asset: 'banquet-table-chairs',
    x: DINING_BANQUET_FOOTPRINT.x,
    z: DINING_BANQUET_FOOTPRINT.z,
    height: 3.6,
    interactionHalfWidth: DINING_BANQUET_FOOTPRINT.halfWidth,
    interactionHalfDepth: DINING_BANQUET_FOOTPRINT.northDepth,
    markerY: 2.75,
  },
  {
    id: 'ballroom-grand-piano',
    name: 'Grand Piano',
    room: 'ballroom',
    asset: 'grand-piano',
    x: BALLROOM_PIANO_FOOTPRINT.x,
    z: BALLROOM_PIANO_FOOTPRINT.z,
    height: 2.2,
    interactionHalfWidth: BALLROOM_PIANO_FOOTPRINT.halfWidth,
    interactionHalfDepth: BALLROOM_PIANO_FOOTPRINT.halfDepth,
  },
  {
    id: 'ballroom-champagne-tower',
    name: 'Champagne Tower',
    room: 'ballroom',
    asset: 'champagne-tower',
    x: BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.x,
    z: BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.z,
    height: 2.42,
    baseY: 0.02,
    interactionHalfWidth: BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.halfWidth,
    interactionHalfDepth: BALLROOM_CHAMPAGNE_TOWER_FOOTPRINT.halfDepth,
  },
  ...MASTER_SUITE_FURNITURE_FOOTPRINTS.map(furnishing => {
    const details = {
      bed: { name: 'Victorian Bed', asset: 'large-victorian-bed', height: 2.76 },
      vanity: { name: 'Vanity', asset: 'vanity-v2', height: 2.82 },
      plant: { name: 'Rubber Plant', asset: 'rubber-plant', height: 2.4 },
    }[furnishing.id]
    return {
      id: `suite-${furnishing.id}`,
      room: 'suite' as const,
      ...details,
      x: furnishing.x,
      z: furnishing.z,
      interactionHalfWidth: furnishing.halfWidth,
      interactionHalfDepth: furnishing.halfDepth,
    }
  }),
]
