// Standalone exhaustive integrity test for built-in authored investigations.
// Bundle with esbuild and run under Node; throws on the first catalog defect.
import { AUTHORED_DIALOGUE_BY_ARCHETYPE } from './src/game/authoredDialogue'
import { ARCHETYPES, EVIDENCE_BY_ARCHETYPE, EVIDENCE_BY_ID } from './src/game/data'

const EFFECTS = ['advance', 'stall', 'close'] as const
const FORBIDDEN_PRE_DEATH = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function normalized(text: string): string {
  return text.toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, '')
}

const archetypeIds = ARCHETYPES.map(archetype => archetype.id)
const catalogIds = Object.keys(AUTHORED_DIALOGUE_BY_ARCHETYPE)
check(catalogIds.length === 10, `expected 10 authored archetypes, found ${catalogIds.length}`)
check(new Set(catalogIds).size === catalogIds.length, 'authored archetype IDs must be unique')
check(
  archetypeIds.every(id => catalogIds.includes(id)) && catalogIds.every(id => archetypeIds.includes(id)),
  `authored archetypes do not exactly match game archetypes: ${catalogIds.join(', ')}`,
)

const globalRouteIds = new Set<string>()
let evidenceRouteCount = 0
let informationalRouteCount = 0
let choiceCount = 0

for (const archetype of ARCHETYPES) {
  const routes = AUTHORED_DIALOGUE_BY_ARCHETYPE[archetype.id]
  check(Array.isArray(routes), `${archetype.id}: missing route array`)
  check(routes.length === 4, `${archetype.id}: expected 4 routes, found ${routes.length}`)

  const expectedEvidence = EVIDENCE_BY_ARCHETYPE[archetype.id].map(evidence => evidence.id).sort()
  const actualEvidence = routes.flatMap(route => route.evidenceId ? [route.evidenceId] : []).sort()
  check(actualEvidence.length === 3, `${archetype.id}: expected 3 evidence routes, found ${actualEvidence.length}`)
  check(new Set(actualEvidence).size === 3, `${archetype.id}: evidence routes must map to distinct evidence IDs`)
  check(
    actualEvidence.join('|') === expectedEvidence.join('|'),
    `${archetype.id}: evidence mapping ${actualEvidence.join(', ')} does not match ${expectedEvidence.join(', ')}`,
  )
  check(routes.filter(route => !route.evidenceId).length === 1, `${archetype.id}: expected exactly one informational route`)

  const routeQuestions = new Set<string>()
  for (const route of routes) {
    check(route.id.trim().length > 0, `${archetype.id}: route has an empty ID`)
    check(!globalRouteIds.has(route.id), `${archetype.id}: duplicate global route ID ${route.id}`)
    globalRouteIds.add(route.id)
    check(route.topic.trim().length > 0, `${route.id}: missing topic`)
    check(route.rootQuestion.trim().endsWith('?'), `${route.id}: root must be a question`)
    check(route.openingResponse.trim().length > 0, `${route.id}: opening response is empty`)
    const rootFingerprint = normalized(route.rootQuestion)
    check(!routeQuestions.has(rootFingerprint), `${archetype.id}: duplicate root question ${route.rootQuestion}`)
    routeQuestions.add(rootFingerprint)
    if (route.evidenceId) {
      evidenceRouteCount++
      check(!!EVIDENCE_BY_ID[route.evidenceId], `${route.id}: unknown evidence ID ${route.evidenceId}`)
    } else {
      informationalRouteCount++
    }
    check(route.stages.length === 2, `${route.id}: expected exactly 2 stages`)

    const allPreDeathText: { location: string; text: string }[] = [
      { location: 'root question', text: route.rootQuestion },
      { location: 'opening response', text: route.openingResponse },
    ]
    const routeChoiceLabels = new Set<string>()
    route.stages.forEach((stage, stageIndex) => {
      check(Object.keys(stage).length === 3, `${route.id} stage ${stageIndex}: expected exactly 3 effects`)
      for (const effect of EFFECTS) {
        const choice = stage[effect]
        check(!!choice, `${route.id} stage ${stageIndex}: missing ${effect} branch`)
        check(choice.label.trim().length > 0, `${route.id} stage ${stageIndex} ${effect}: empty label`)
        check(choice.response.trim().length > 0, `${route.id} stage ${stageIndex} ${effect}: empty response`)
        const fingerprint = normalized(choice.label)
        check(!routeChoiceLabels.has(fingerprint), `${route.id}: duplicate choice label ${choice.label}`)
        routeChoiceLabels.add(fingerprint)
        allPreDeathText.push(
          { location: `stage ${stageIndex} ${effect} label`, text: choice.label },
          { location: `stage ${stageIndex} ${effect} response`, text: choice.response },
        )
        choiceCount++
      }
    })

    for (const item of allPreDeathText) {
      check(!FORBIDDEN_PRE_DEATH.test(item.text), `${route.id} ${item.location}: forbidden pre-death language in ${JSON.stringify(item.text)}`)
    }
  }
}

check(evidenceRouteCount === 30, `expected 30 evidence routes, found ${evidenceRouteCount}`)
check(informationalRouteCount === 10, `expected 10 informational routes, found ${informationalRouteCount}`)
check(choiceCount === 240, `expected 240 authored branch choices, found ${choiceCount}`)

console.log(
  `AUTHORED DIALOGUE VALIDATION PASSED: ${catalogIds.length} archetypes, ${evidenceRouteCount} evidence routes, ` +
  `${informationalRouteCount} informational routes, ${choiceCount} branch choices`,
)
