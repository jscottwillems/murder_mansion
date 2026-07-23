import type { ArchetypeId } from './types'
import { PACK_A } from './dialogue/packA'
import { PACK_B } from './dialogue/packB'
import { PACK_C } from './dialogue/packC'
import type { AuthoredDialogueRoute } from './dialogue/types'

// Re-export the authored-dialogue schema so existing importers are unaffected
// by the split into per-pack writer-room files.
export type {
  AuthoredEmotion,
  AuthoredEffect,
  RevealMechanism,
  AuthoredDialogueChoice,
  AuthoredDialogueStage,
  AuthoredDialogueRoute,
} from './dialogue/types'

/**
 * The built-in investigation catalog. Assembled from three writers' rooms; each
 * pack owns a disjoint set of archetypes so the rooms can iterate independently.
 * Runtime story nodes/threads are derived from this data in dossierStoryData.ts.
 */
export const AUTHORED_DIALOGUE_BY_ARCHETYPE: Record<ArchetypeId, AuthoredDialogueRoute[]> = {
  ...PACK_A,
  ...PACK_B,
  ...PACK_C,
}
