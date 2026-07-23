// Aggregated personal-aside pools, merged from the three writers' rooms.
// Consumed by dossierStoryData.ts to compile the per-archetype pool of
// lightweight "get to know them" topics that keep the interview menu full and
// varied once evidence threads appear.
import type { ArchetypeId } from '../types'
import type { PersonalAside } from './types'
import { ASIDES_A } from './asidesA'
import { ASIDES_B } from './asidesB'
import { ASIDES_C } from './asidesC'

export const PERSONAL_ASIDES_BY_ARCHETYPE: Record<ArchetypeId, PersonalAside[]> = {
  ...ASIDES_A,
  ...ASIDES_B,
  ...ASIDES_C,
}
