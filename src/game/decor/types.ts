import type { RoomId } from '../types'

/** Gameplay metadata for one visible, physical furnishing in the mansion. */
export interface FurnishingPlacement {
  id: string
  name: string
  room: RoomId
  /** Sprite asset stem, retained for runtime auditing and debugging. */
  asset: string
  x: number
  z: number
  height: number
  baseY?: number
  interactionHalfWidth?: number
  interactionHalfDepth?: number
  /** Absolute local-room y position when artwork height is not a useful physical top. */
  markerY?: number
  /** Natural-language location used when evidence is recovered from this object. */
  evidenceHidingPlace: string
}
