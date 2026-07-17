import type { DecorPlacement } from './types'

export const lowerRoomDecor: DecorPlacement[] = [
  // Cellar: storage vignette beside the barrel stack and a utility cluster by
  // the east worktable and northeast shelving. The barrel-rack is omitted.
  { room: 'cellar', asset: 'stoneware-jugs', x: -1.72, z: 3.58, height: 0.72, baseY: 0.025 },
  { room: 'cellar', asset: 'wine-crate', x: -1.88, z: 2.72, height: 0.78, baseY: 0.025, flip: true },
  { room: 'cellar', asset: 'iron-lantern', x: 4.05, z: 2.08, height: 0.65, baseY: 0.72, renderOrder: 2 },
  { room: 'cellar', asset: 'storage-chest', x: 3.32, z: -3.22, height: 1.02, baseY: 0.025, flip: true },

  // Library: a parked cart at the west shelving and a southeast reading nook.
  // Duplicate bookcase and ladder sprites are omitted.
  { room: 'library', asset: 'book-cart', x: -3.72, z: 1.92, height: 1.18, baseY: 0.025 },
  { room: 'library', asset: 'reading-table', x: 2.12, z: 2.38, height: 1.08, baseY: 0.025 },
  { room: 'library', asset: 'reading-chair', x: 3.32, z: 2.92, height: 1.38, baseY: 0.025, flip: true },

  // Suite: a raised jewelry display on the procedural vanity and a southeast
  // dressing vignette. Duplicate bed and vanity sprites are omitted.
  { room: 'suite', asset: 'jewelry-table', x: 4.02, z: 2.52, height: 0.72, baseY: 0.8, flip: true, renderOrder: 2 },
  { room: 'suite', asset: 'dressing-screen', x: 1.82, z: 3.62, height: 2.18, baseY: 0.025 },
  { room: 'suite', asset: 'chaise-longue', x: 3.18, z: 1.72, height: 1.34, baseY: 0.025, flip: true },
]
