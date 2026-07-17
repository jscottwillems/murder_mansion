import { lowerRoomDecor } from './lowerRooms'
import { middleRoomDecor } from './middleRooms'
import type { DecorPlacement } from './types'
import { upperRoomDecor } from './upperRooms'

export const DECOR_PLACEMENTS: DecorPlacement[] = [
  ...upperRoomDecor,
  ...middleRoomDecor,
  ...lowerRoomDecor,
]
