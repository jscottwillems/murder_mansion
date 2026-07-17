import type { DecorPlacement } from './types'

export const upperRoomDecor: DecorPlacement[] = [
  // Study: work vignette at the procedural desk and drinks vignette by the
  // existing southwest chair. Duplicate desk and armchair sprites are omitted.
  { room: 'study', asset: 'banker-lamp', x: -0.72, z: -2.54, height: 0.68, baseY: 0.88 },
  { room: 'study', asset: 'globe', x: 1.92, z: -2.6, height: 1.42, baseY: 0.025, flip: true },
  { room: 'study', asset: 'decanter-table', x: -2.42, z: 3.18, height: 1.02, baseY: 0.025 },

  // Gallery: a north-wall portrait composition plus two exhibits using the
  // procedural plinths, with stanchions in front of the eastern relic.
  { room: 'gallery', asset: 'ancestral-portrait', x: 0, z: -4.48, height: 2.42, baseY: 1.12 },
  { room: 'gallery', asset: 'candelabrum', x: -1.72, z: -4.12, height: 1.9, baseY: 0.025 },
  { room: 'gallery', asset: 'marble-bust', x: -2.8, z: -1.77, height: 1.02, baseY: 1.07 },
  { room: 'gallery', asset: 'relic-display', x: 2.8, z: -2, height: 1.68, baseY: 1.07, flip: true },
  { room: 'gallery', asset: 'velvet-stanchions', x: 2.78, z: -1.62, height: 1.18, baseY: 0.025, flip: true },

  // Conservatory: orchid worktable, northwest planting cluster, and southeast
  // garden seat. The duplicative tea-table sprite is omitted.
  { room: 'conservatory', asset: 'orchid-stand', x: -3.35, z: 3.28, height: 1.12, baseY: 0.77 },
  { room: 'conservatory', asset: 'potted-monstera', x: -3.55, z: -3.58, height: 2.02, baseY: 0.025 },
  { room: 'conservatory', asset: 'birdbath', x: -2.22, z: -2.92, height: 1.28, baseY: 0.025, flip: true },
  { room: 'conservatory', asset: 'garden-bench', x: 2.82, z: 3.35, height: 1.32, baseY: 0.025, flip: true },
]
