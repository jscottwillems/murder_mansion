import type { ArchetypeId, EvidenceId, Guest, QuestionOption } from './types'
import { EVIDENCE_IDS } from './types'
import {
  AUTHORED_DIALOGUE_BY_ARCHETYPE,
  type AuthoredDialogueChoice,
  type AuthoredDialogueRoute,
  type AuthoredEffect,
} from './authoredDialogue'

const EFFECTS: AuthoredEffect[] = ['advance', 'stall', 'close']
const PREMATURE_DEATH_REFERENCE = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i
const EVIDENCE_ID_SET = new Set<EvidenceId>(EVIDENCE_IDS)

/**
 * Structural validation for authored routes. Evidence assignment shuffles per
 * case and unauthored pairs are synthesized at compile time, so route counts are
 * intentionally flexible: an archetype may author zero to ten evidence routes
 * and any number of informational (rapport) routes. What must hold is that every
 * authored route is well-formed, uniquely identified, and never names a death
 * before one is discovered.
 */
export function validateAuthoredDialogue(): string[] {
  const errors: string[] = []
  for (const [rawArchetypeId, routes] of Object.entries(AUTHORED_DIALOGUE_BY_ARCHETYPE)) {
    const archetypeId = rawArchetypeId as ArchetypeId
    const ids = new Set<string>()
    const roots = new Set<string>()
    const evidenceSeen = new Set<EvidenceId>()
    for (const route of routes) {
      if (ids.has(route.id)) errors.push(`${archetypeId}: duplicate route id ${route.id}`)
      ids.add(route.id)
      const rootKey = route.rootQuestion.trim().toLowerCase()
      if (!route.rootQuestion.trim().endsWith('?') || roots.has(rootKey)) errors.push(`${archetypeId}/${route.id}: invalid or duplicate root question`)
      roots.add(rootKey)
      if (!route.openingResponse.trim() || route.stages.length !== 2) errors.push(`${archetypeId}/${route.id}: incomplete route`)
      if (PREMATURE_DEATH_REFERENCE.test(`${route.rootQuestion} ${route.openingResponse}`)) errors.push(`${archetypeId}/${route.id}: opening mentions an undiscovered death`)
      if (route.evidenceId) {
        if (!EVIDENCE_ID_SET.has(route.evidenceId)) errors.push(`${archetypeId}/${route.id}: unknown evidence ${route.evidenceId}`)
        if (evidenceSeen.has(route.evidenceId)) errors.push(`${archetypeId}: evidence ${route.evidenceId} authored more than once`)
        evidenceSeen.add(route.evidenceId)
      }
      for (const [stageIndex, stage] of route.stages.entries()) {
        const labels = new Set<string>()
        for (const effect of EFFECTS) {
          const choice = stage[effect]
          const label = choice?.label.trim() ?? ''
          if (!label.endsWith('?') && effect !== 'close') errors.push(`${archetypeId}/${route.id}/${stageIndex}/${effect}: choice is not a question`)
          if (!label || !choice.response.trim() || labels.has(label.toLowerCase())) errors.push(`${archetypeId}/${route.id}/${stageIndex}: incomplete or duplicate choice`)
          if (PREMATURE_DEATH_REFERENCE.test(`${label} ${choice.response}`)) errors.push(`${archetypeId}/${route.id}/${stageIndex}/${effect}: mentions an undiscovered death`)
          labels.add(label.toLowerCase())
        }
      }
    }
  }
  return errors
}

const validationErrors = validateAuthoredDialogue()
if (validationErrors.length) throw new Error(`Invalid authored dialogue:\n${validationErrors.join('\n')}`)

/** Return the three canonical evidence routes in guest assignment order, plus the informational route. */
export function authoredRoutesForGuest(g: Guest): AuthoredDialogueRoute[] {
  const routes = AUTHORED_DIALOGUE_BY_ARCHETYPE[g.archetypeId]
  const selected = g.evidenceIds.map(evidenceId => routes.find(route => route.evidenceId === evidenceId)).filter((route): route is AuthoredDialogueRoute => !!route)
  const informational = routes.find(route => !route.evidenceId)
  return informational ? [...selected, informational] : selected
}

export function authoredChoice(route: AuthoredDialogueRoute, stage: number, effect: AuthoredEffect): AuthoredDialogueChoice {
  return route.stages[Math.max(0, Math.min(1, stage))][effect]
}

export function authoredQuestionOptions(route: AuthoredDialogueRoute, stage: number, idPrefix: string): QuestionOption[] {
  return EFFECTS.map((effect, index) => ({
    id: `${idPrefix}:c${index}`,
    topic: 'follow_up',
    label: authoredChoice(route, stage, effect).label,
    kind: 'branch',
  }))
}
