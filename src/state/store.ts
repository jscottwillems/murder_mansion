import { useSyncExternalStore } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'

export function useGame(game: Game): Snapshot {
  return useSyncExternalStore(game.subscribe, game.getSnapshot)
}
