import type { RoomId } from '../types'

export interface DecorPlacement {
  room: RoomId
  asset: string
  x: number
  z: number
  height: number
  baseY?: number
  flip?: boolean
  renderOrder?: number
}
