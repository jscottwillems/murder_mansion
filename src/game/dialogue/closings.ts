// Aggregated bespoke thread closings, merged from the three writers' rooms.
// Consumed by dossierStoryData.ts to attach a distinct conclusion to each
// thread's terminal choices.
import { CLOSINGS_A } from './closingsA'
import { CLOSINGS_B } from './closingsB'
import { CLOSINGS_C } from './closingsC'
import type { AuthoredClosings } from './types'

export const CLOSINGS_BY_ROUTE: Record<string, AuthoredClosings> = {
  ...CLOSINGS_A,
  ...CLOSINGS_B,
  ...CLOSINGS_C,
}
