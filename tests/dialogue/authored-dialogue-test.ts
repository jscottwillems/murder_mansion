// Standalone exhaustive integrity test for built-in authored investigations.
// Bundle with esbuild and run under Node; throws on the first catalog defect.
import { AUTHORED_DIALOGUE_BY_ARCHETYPE } from '../../src/game/authoredDialogue'
import { CLOSINGS_BY_ROUTE } from '../../src/game/dialogue/closings'
import { PERSONAL_ASIDES_BY_ARCHETYPE } from '../../src/game/dialogue/personalAsides'
import type { AuthoredClosing, AuthoredDialogueRoute } from '../../src/game/dialogue/types'
import { ARCHETYPES, EVIDENCE_BY_ID } from '../../src/game/data'

const EFFECTS = ['advance', 'stall', 'close'] as const
const EMOTIONS = ['neutral', 'suspicious', 'worried', 'angry', 'thoughtful', 'surprised'] as const
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
const routesById = new Map<string, AuthoredDialogueRoute>()
let evidenceRouteCount = 0
let informationalRouteCount = 0
let choiceCount = 0

for (const archetype of ARCHETYPES) {
  const routes = AUTHORED_DIALOGUE_BY_ARCHETYPE[archetype.id]
  check(Array.isArray(routes), `${archetype.id}: missing route array`)
  // Evidence assignment shuffles per case, so an archetype may author anywhere
  // from zero to ten evidence routes plus one or more rapport routes. Unauthored
  // pairs are synthesized at compile time. We only require well-formed, distinct
  // routes and at least one informational (rapport) route.
  const actualEvidence = routes.flatMap(route => route.evidenceId ? [route.evidenceId] : [])
  check(new Set(actualEvidence).size === actualEvidence.length, `${archetype.id}: evidence routes must map to distinct evidence IDs`)
  check(routes.filter(route => !route.evidenceId).length >= 1, `${archetype.id}: expected at least one informational route`)

  const routeQuestions = new Set<string>()
  for (const route of routes) {
    check(route.id.trim().length > 0, `${archetype.id}: route has an empty ID`)
    check(!globalRouteIds.has(route.id), `${archetype.id}: duplicate global route ID ${route.id}`)
    globalRouteIds.add(route.id)
    routesById.set(route.id, route)
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

// Every authored route contributes 6 branch choices (2 stages x 3 effects).
check(evidenceRouteCount >= 0, `unexpected evidence route count ${evidenceRouteCount}`)
check(informationalRouteCount >= 10, `expected at least one informational route per archetype, found ${informationalRouteCount}`)
check(choiceCount === (evidenceRouteCount + informationalRouteCount) * 6, `branch choice count ${choiceCount} is inconsistent with route count`)

// ── Thread closings ────────────────────────────────────────────────────────
// Every thread must conclude on its own note. Evidence routes need a bespoke
// `resolve` (tied owner, association recorded) *and* a bespoke `noReveal` (untied
// this case, the trace clears them) — the two must read naturally after the same
// lead-up. Rapport routes need distinct `warm`/`measured`/`hostile` stances.
// Optional `shutdown`/`pause` are validated when present. All closing prose obeys
// the same knowledge-state guard and must be globally unique (no boilerplate).
const CLOSING_KEYS = ['resolve', 'noReveal', 'shutdown', 'pause', 'warm', 'measured', 'hostile'] as const
const seenClosingLines = new Map<string, string>()
let resolveClosingCount = 0
let noRevealClosingCount = 0
let rapportClosingCount = 0

function validateClosing(routeId: string, key: string, closing: AuthoredClosing): void {
  const where = `${routeId} closing:${key}`
  check(closing.line.trim().length > 0, `${where}: empty closing line`)
  check((EMOTIONS as readonly string[]).includes(closing.emotion), `${where}: invalid emotion ${closing.emotion}`)
  check(!FORBIDDEN_PRE_DEATH.test(closing.line), `${where}: forbidden knowledge-guard language in ${JSON.stringify(closing.line)}`)
  if (closing.summary !== undefined) {
    check(closing.summary.trim().length > 0, `${where}: empty summary`)
    check(!FORBIDDEN_PRE_DEATH.test(closing.summary), `${where}: forbidden knowledge-guard language in summary`)
  }
  const fingerprint = normalized(closing.line)
  const prior = seenClosingLines.get(fingerprint)
  check(!prior, `${where}: closing line duplicates ${prior}`)
  seenClosingLines.set(fingerprint, where)
}

for (const [routeId, closings] of Object.entries(CLOSINGS_BY_ROUTE)) {
  check(routesById.has(routeId), `closings reference unknown route id ${routeId}`)
  for (const key of Object.keys(closings)) {
    check((CLOSING_KEYS as readonly string[]).includes(key), `${routeId}: unknown closing key ${key}`)
  }
  for (const key of CLOSING_KEYS) {
    const closing = closings[key]
    if (closing) validateClosing(routeId, key, closing)
  }
}

// Completeness: every authored route concludes bespoke, not on a shared line.
for (const route of routesById.values()) {
  const closings = CLOSINGS_BY_ROUTE[route.id]
  if (route.evidenceId) {
    check(!!closings?.resolve, `${route.id}: evidence route is missing a bespoke resolve closing`)
    check(!!closings?.noReveal, `${route.id}: evidence route is missing a bespoke no-reveal closing`)
    resolveClosingCount++
    noRevealClosingCount++
  } else {
    check(!!closings?.warm && !!closings?.measured && !!closings?.hostile,
      `${route.id}: rapport route must author warm, measured, and hostile closings`)
    rapportClosingCount += 3
  }
}

// ── Personal asides ─────────────────────────────────────────────────────────
// Once evidence threads appear, the interview menu is topped up with a
// seed-shuffled subset of each archetype's personal-aside pool so it always
// offers a handful of options that differ every run. Every archetype must author
// a full pool of PERSONAL_ASIDE_COUNT bespoke asides. Each aside is a single beat
// (a rooted question, an opening, and 2–4 terminal replies). Reply lines share
// the global uniqueness pool with closings, and all prose obeys the same
// knowledge-state guard.
const PERSONAL_ASIDE_COUNT = 4
const asideIds = new Set<string>()
let asideCount = 0
let asideReplyCount = 0

const asideArchetypeIds = Object.keys(PERSONAL_ASIDES_BY_ARCHETYPE)
check(
  archetypeIds.every(id => asideArchetypeIds.includes(id)) && asideArchetypeIds.every(id => archetypeIds.includes(id)),
  `personal-aside archetypes do not exactly match game archetypes: ${asideArchetypeIds.join(', ')}`,
)

for (const archetype of ARCHETYPES) {
  const asides = PERSONAL_ASIDES_BY_ARCHETYPE[archetype.id]
  check(Array.isArray(asides), `${archetype.id}: missing personal-aside array`)
  check(asides.length === PERSONAL_ASIDE_COUNT, `${archetype.id}: expected ${PERSONAL_ASIDE_COUNT} personal asides, found ${asides.length}`)
  const asideQuestions = new Set<string>()
  for (const aside of asides) {
    check(aside.id.trim().length > 0, `${archetype.id}: personal aside has an empty ID`)
    check(!asideIds.has(aside.id), `${archetype.id}: duplicate personal aside ID ${aside.id}`)
    asideIds.add(aside.id)
    asideCount++
    check(aside.topic.trim().length > 0, `${aside.id}: missing topic`)
    check(aside.rootQuestion.trim().endsWith('?'), `${aside.id}: root must be a question`)
    const rootFingerprint = normalized(aside.rootQuestion)
    check(!asideQuestions.has(rootFingerprint), `${archetype.id}: duplicate aside root question ${aside.rootQuestion}`)
    asideQuestions.add(rootFingerprint)
    check(aside.opening.trim().length > 0, `${aside.id}: empty opening`)
    check((EMOTIONS as readonly string[]).includes(aside.openingEmotion), `${aside.id}: invalid opening emotion ${aside.openingEmotion}`)
    check(aside.replies.length >= 2 && aside.replies.length <= 4, `${aside.id}: expected 2–4 replies, found ${aside.replies.length}`)
    const guarded: { location: string; text: string }[] = [
      { location: 'root question', text: aside.rootQuestion },
      { location: 'opening', text: aside.opening },
    ]
    const replyLabels = new Set<string>()
    for (const reply of aside.replies) {
      check(reply.label.trim().length > 0, `${aside.id}: empty reply label`)
      check(reply.line.trim().length > 0, `${aside.id}: empty reply line`)
      check((EMOTIONS as readonly string[]).includes(reply.emotion), `${aside.id}: invalid reply emotion ${reply.emotion}`)
      const labelFingerprint = normalized(reply.label)
      check(!replyLabels.has(labelFingerprint), `${aside.id}: duplicate reply label ${reply.label}`)
      replyLabels.add(labelFingerprint)
      guarded.push({ location: 'reply label', text: reply.label }, { location: 'reply line', text: reply.line })
      // Reply lines are terminal closings, so they join the global uniqueness pool.
      const lineFingerprint = normalized(reply.line)
      const prior = seenClosingLines.get(lineFingerprint)
      check(!prior, `${aside.id} reply line: duplicates ${prior}`)
      seenClosingLines.set(lineFingerprint, `${aside.id} reply line`)
      asideReplyCount++
    }
    for (const item of guarded) {
      check(!FORBIDDEN_PRE_DEATH.test(item.text), `${aside.id} ${item.location}: forbidden knowledge-guard language in ${JSON.stringify(item.text)}`)
    }
  }
}

console.log(
  `AUTHORED DIALOGUE VALIDATION PASSED: ${catalogIds.length} archetypes, ${evidenceRouteCount} evidence routes, ` +
  `${informationalRouteCount} informational routes, ${choiceCount} branch choices, ` +
  `${resolveClosingCount} resolve closings, ${noRevealClosingCount} no-reveal closings, ${rapportClosingCount} rapport closings, ` +
  `${asideCount} personal asides, ${asideReplyCount} aside replies`,
)
