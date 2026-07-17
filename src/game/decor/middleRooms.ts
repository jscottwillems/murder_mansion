import type { DecorPlacement } from './types'

export const middleRoomDecor: DecorPlacement[] = [
  { room: 'kitchen', asset: 'cookware-rack', x: 2.75, z: -4.48, height: 1.72, baseY: 1.18, flip: true },
  { room: 'kitchen', asset: 'provision-crate', x: -3.62, z: 1.92, height: 0.78, baseY: 0.025 },
  { room: 'kitchen', asset: 'pastry-table', x: 2.75, z: 3.35, height: 1.18, baseY: 0.025, flip: true },

  { room: 'dining', asset: 'decanter-stand', x: -2.9, z: -4.18, height: 0.72, baseY: 0.84, renderOrder: 2 },
  { room: 'dining', asset: 'serving-trolley', x: -3.58, z: -3.12, height: 1.05, baseY: 0.025 },
  { room: 'dining', asset: 'grandfather-clock', x: 3.72, z: -4.2, height: 2.38, baseY: 0.025, flip: true },
  { room: 'dining', asset: 'silver-candelabra', x: 1.82, z: 0.82, height: 0.72, baseY: 0.86, flip: true, renderOrder: 2 },

  { room: 'ballroom', asset: 'gramophone', x: -3.28, z: -3.12, height: 0.72, baseY: 1.08, renderOrder: 2 },
  { room: 'ballroom', asset: 'music-stand', x: -1.72, z: -3.52, height: 1.62, baseY: 0.025, flip: true },
  { room: 'ballroom', asset: 'lavender-settee', x: 2.52, z: 2.12, height: 1.38, baseY: 0.025, flip: true },
  { room: 'ballroom', asset: 'cocktail-table', x: 1.8, z: 3.18, height: 1, baseY: 0.025 },
  { room: 'ballroom', asset: 'potted-palm', x: 3.72, z: 1.72, height: 2.25, baseY: 0.025, flip: true },
]
