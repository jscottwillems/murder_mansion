import type { Guest, QuestionOption } from './types'
import { EVIDENCE_BY_ARCHETYPE } from './data'
import {
  AUTHORED_DIALOGUE_BY_ARCHETYPE,
  type AuthoredDialogueChoice,
  type AuthoredDialogueRoute,
  type AuthoredEffect,
} from './authoredDialogue'

const EFFECTS: AuthoredEffect[] = ['advance', 'stall', 'close']
const PREMATURE_DEATH_REFERENCE = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i

export function validateAuthoredDialogue(): string[] {
  const errors: string[] = []
  for (const [archetypeId, routes] of Object.entries(AUTHORED_DIALOGUE_BY_ARCHETYPE)) {
    const expectedEvidence = new Set((EVIDENCE_BY_ARCHETYPE[archetypeId] ?? []).map(e => e.id))
    const ids = new Set<string>()
    const roots = new Set<string>()
    if (routes.length !== expectedEvidence.size + 1) errors.push(`${archetypeId}: expected ${expectedEvidence.size + 1} routes, found ${routes.length}`)
    for (const route of routes) {
      if (ids.has(route.id)) errors.push(`${archetypeId}: duplicate route id ${route.id}`)
      ids.add(route.id)
      const rootKey = route.rootQuestion.trim().toLowerCase()
      if (!route.rootQuestion.trim().endsWith('?') || roots.has(rootKey)) errors.push(`${archetypeId}/${route.id}: invalid or duplicate root question`)
      roots.add(rootKey)
      if (!route.openingResponse.trim() || route.stages.length !== 2) errors.push(`${archetypeId}/${route.id}: incomplete route`)
      if (PREMATURE_DEATH_REFERENCE.test(`${route.rootQuestion} ${route.openingResponse}`)) errors.push(`${archetypeId}/${route.id}: opening mentions an undiscovered death`)
      if (route.evidenceId && !expectedEvidence.has(route.evidenceId)) errors.push(`${archetypeId}/${route.id}: non-canonical evidence ${route.evidenceId}`)
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
    for (const evidenceId of expectedEvidence) {
      if (routes.filter(route => route.evidenceId === evidenceId).length !== 1) errors.push(`${archetypeId}: evidence ${evidenceId} must have exactly one route`)
    }
    if (routes.filter(route => !route.evidenceId).length !== 1) errors.push(`${archetypeId}: expected exactly one informational route`)
  }
  return errors
}

const validationErrors = validateAuthoredDialogue()
if (validationErrors.length) throw new Error(`Invalid authored dialogue:\n${validationErrors.join('\n')}`)

/** Return the three canonical evidence routes in guest assignment order, plus the informational route. */
export function authoredRoutesForGuest(g: Guest): AuthoredDialogueRoute[] {
  const routes = AUTHORED_DIALOGUE_BY_ARCHETYPE[g.archetypeId] ?? []
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
