import { EVIDENCE_BY_ARCHETYPE } from './src/game/data'
import { STORY_CATALOG, newStoryState, type StoryRuntimeState } from './src/game/stories/storyCatalog'

function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

function key(state: StoryRuntimeState) {
  return [state.nodeId, state.trust, state.pressure, [...state.flags].sort(), [...state.evidence].sort(), [...state.usedChoices].sort(), state.endingId].join('|')
}

for (const [archetypeId, story] of Object.entries(STORY_CATALOG)) {
  const endings = new Set<string>()
  const evidence = new Set<string>()
  const seen = new Set<string>()
  const queue: StoryRuntimeState[] = []
  const openingQuestions = story.rootQuestions(newStoryState())
  check(openingQuestions.length >= 3, `${archetypeId}: expected at least three first-contact choices`)
  for (const root of openingQuestions) {
    check(root.label.endsWith('?'), `${archetypeId}: opening is not a question: ${root.label}`)
    check(!root.label.includes(story.title), `${archetypeId}: opening leaks internal story title`)
    const state = newStoryState()
    const beat = story.choose(state, root.id)
    check(beat, `${archetypeId}: root ${root.id} did not resolve`)
    state.offered = beat.choices
    queue.push(state)
  }
  while (queue.length) {
    const state = queue.shift()!
    const fingerprint = key(state)
    if (seen.has(fingerprint)) continue
    seen.add(fingerprint)
    state.evidence.forEach(id => evidence.add(id))
    if (state.endingId) {
      endings.add(state.endingId)
      continue
    }
    check(state.offered.length > 0, `${archetypeId}: dead end at ${state.nodeId}`)
    for (const option of state.offered) {
      const next = structuredClone(state)
      const beat = story.choose(next, option.id)
      check(beat, `${archetypeId}: choice ${option.id} did not resolve`)
      next.offered = beat.choices
      queue.push(next)
    }
    check(seen.size < 20000, `${archetypeId}: graph appears cyclic without convergence`)
  }
  const expectedEvidence = EVIDENCE_BY_ARCHETYPE[archetypeId].map(item => item.id).sort()
  check(endings.size >= 3, `${archetypeId}: only ${endings.size} reachable endings`)
  check(expectedEvidence.every(id => evidence.has(id)), `${archetypeId}: unreachable evidence; reached ${[...evidence].join(', ')}`)
  console.log(`${archetypeId}: ${seen.size} states, ${endings.size} endings, evidence ${[...evidence].sort().join(', ')}`)
}

check(Object.keys(STORY_CATALOG).length === 10, 'story catalog must cover all ten archetypes')
console.log('STORY GRAPH VALIDATION PASSED')
