export const CHARACTER_ATLAS = {
  columns: { front: 0, right: 1, back: 2, left: 3 },
  rows: { idle: 0, walkA: 1, walkB: 2, actions: 3, portraits: 4 },
  columnsPerRow: 4,
  npcRows: 5,
  detectiveRows: 4,
  detectiveFrames: {
    passingRight: 13,
    passingLeft: 12,
    investigateCrouch: 14,
    investigateNotebook: 15,
  },
} as const

export const NPC_ATLAS_V3 = {
  columns: CHARACTER_ATLAS.columns,
  rows: {
    idle: 0,
    walkA: 1,
    passing: 2,
    walkB: 3,
    actions: 4,
    portraits: 5,
  },
  columnsPerRow: 4,
  rowsPerAtlas: 6,
  cellSize: 320,
  standingHeight: 270,
  footBaseline: 294,
  scaleByArchetype: {
    curator: 0.92,
  } as Readonly<Record<string, number>>,
  actionScaleByArchetype: {
    // These face-down poses fill far more of their cells than the matching
    // upright silhouettes. Counter the shared 1.15 floor-pose enlargement so
    // each body and chalk outline retains its character's standing footprint.
    antiquarian: 0.86,
    chauffeur: 0.86,
    debutante: 0.86,
  } as Readonly<Record<string, number>>,
} as const

export function atlasFrame(row: number, column: number): number {
  return row * CHARACTER_ATLAS.columnsPerRow + column
}
