import { Simulation } from './src/game/sim'
import { EVIDENCE_IDS, type QuestionTopic } from './src/game/types'
import { DOSSIERS, NARRATIVE_NODES, NARRATIVE_THREADS } from './src/game/narrative/dossierStoryData'
import {
  applyStoryChoice,
  dispatchCrossNpcEvent,
  evaluateCaseEnding,
  getLegalBeat,
  initializeNarrativeCase,
  markCharacterUnavailable,
  recordNarrativeFact,
  reopenThread,
} from './src/game/narrative/storyEngine'
function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

const QUESTION_TOPICS = new Set<QuestionTopic>([
  'timeline', 'suspicion', 'intel', 'alibi', 'room', 'pressure', 'social',
  'victim', 'last_seen', 'connection', 'motive', 'survival', 'next_victim',
  'follow_up',
])

function makeCase(seed = 1931, openingCrime = true) {
  const sim = new Simulation(seed, {
    log: () => {},
    lead: () => {},
    guestDied: () => {},
    bodyDiscovered: () => {},
    overheard: () => {},
  })
  const openingVictim = openingCrime ? sim.createOpeningCrime() : null
  return {
    sim,
    state: initializeNarrativeCase({
      caseSeed: sim.seed,
      guests: sim.guests,
      openingVictimId: openingVictim?.id ?? null,
    }),
  }
}

const dossierIds = Object.keys(DOSSIERS)
check(dossierIds.length === 10 && new Set(dossierIds).size === 10, 'expected ten unique dossiers')
// 10 archetypes x (10 evidence reveal threads + 3 rapport threads + 4 personal asides) = 170.
check(Object.keys(NARRATIVE_THREADS).length === 170, `expected 170 threads, found ${Object.keys(NARRATIVE_THREADS).length}`)

const globalIds = new Set<string>()
for (const [nodeId, node] of Object.entries(NARRATIVE_NODES)) {
  check(node.id === nodeId, `${nodeId}: node key mismatch`)
  check(!globalIds.has(nodeId), `${nodeId}: duplicate node ID`)
  globalIds.add(nodeId)
  check(NARRATIVE_THREADS[node.threadId], `${nodeId}: missing thread ${node.threadId}`)
  for (const choice of node.choices) {
    check(!globalIds.has(choice.id), `${nodeId}: duplicate choice ID ${choice.id}`)
    globalIds.add(choice.id)
    check(choice.nextNodeId === null || Boolean(NARRATIVE_NODES[choice.nextNodeId]), `${choice.id}: missing target ${choice.nextNodeId}`)
  }
}

let pairCount = 0
const carrierIds = new Set<string>()
const endingIds = new Set<string>()
const endingTexts = new Set<string>()
for (const dossier of Object.values(DOSSIERS)) {
  const threads = Object.values(dossier.evidenceThreads).filter(thread => thread !== undefined)
  const allThreads = [...threads, ...dossier.regularThreads, ...dossier.bonusPersonalThreads]
  const rootLabels = new Set<string>()
  check(threads.length === 10, `${dossier.id}: expected ten evidence threads`)
  check(dossier.regularThreads.length === 3, `${dossier.id}: expected three rapport threads`)
  check(dossier.regularThreads.every(thread => thread.kind === 'private-intel'), `${dossier.id}: rapport thread has wrong kind`)
  check(dossier.bonusPersonalThreads.length === 4, `${dossier.id}: expected four personal asides`)
  check(dossier.bonusPersonalThreads.every(thread => thread.kind === 'private-intel'), `${dossier.id}: personal aside has wrong kind`)
  check(dossier.endings.length >= 3 && dossier.endings.length <= 5, `${dossier.id}: expected 3–5 endings`)
  for (const thread of allThreads) {
    const rootLabel = thread.rootLabel.trim()
    const normalizedRoot = rootLabel.toLocaleLowerCase()
    check(rootLabel.length > 0, `${thread.id}: missing writer-owned root label`)
    check(!rootLabels.has(normalizedRoot), `${dossier.id}: duplicate root label ${JSON.stringify(rootLabel)}`)
    check(QUESTION_TOPICS.has(thread.topic), `${thread.id}: invalid topic ${thread.topic}`)
    rootLabels.add(normalizedRoot)
  }
  for (const carrier of dossier.carriers) {
    check(!carrierIds.has(carrier.id), `${dossier.id}: duplicate carrier ${carrier.id}`)
    carrierIds.add(carrier.id)
    check(carrier.deathSafe && carrier.shutdownSafe, `${carrier.id}: fallback is not death/shutdown safe`)
  }
  for (const ending of dossier.endings) {
    check(!endingIds.has(ending.id), `${dossier.id}: duplicate ending ${ending.id}`)
    const normalizedText = ending.text.toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, '')
    const sentenceCount = ending.text.match(/[.!?](?:\s|$)/g)?.length ?? 0
    check(ending.text.length >= 80, `${ending.id}: ending text is not concrete enough`)
    check(sentenceCount >= 1 && sentenceCount <= 2, `${ending.id}: ending must be one or two sentences`)
    check(!/resolves .+ according to|chosen archive disposition/i.test(ending.text), `${ending.id}: generic ending template survived`)
    check(!endingTexts.has(normalizedText), `${ending.id}: ending text duplicates another definition`)
    endingIds.add(ending.id)
    endingTexts.add(normalizedText)
    check(carrierIds.has(ending.legacyCarrierId), `${ending.id}: missing legacy carrier`)
  }
  for (const evidenceId of EVIDENCE_IDS) {
    const expected = dossier.evidenceThreads[evidenceId]
    if (!expected) continue
    pairCount++
    check(expected.evidenceId === evidenceId, `${dossier.id}/${evidenceId}: evidence mismatch`)
    check(expected.fallbackCarrierIds.length > 0, `${dossier.id}/${evidenceId}: missing fallback`)
    check(expected.fallbackCarrierIds.every(id => carrierIds.has(id)), `${dossier.id}/${evidenceId}: unknown fallback`)
  }
}
check(pairCount === 100, `expected 100 archetype/evidence pairs, found ${pairCount}`)
check(endingTexts.size === 41, `expected 41 distinct authored ending texts, found ${endingTexts.size}`)

let { state } = makeCase(1931, false)
for (const character of Object.values(state.characters)) {
  const dossier = DOSSIERS[character.archetypeId]
  // Only the traces this guest is assigned this case are playable; the rest are
  // latent by design.
  for (const evidenceId of character.assignedEvidenceIds) {
    const thread = dossier.evidenceThreads[evidenceId]
    check(thread, `${character.archetypeId}/${evidenceId}: missing assigned thread`)
    const notice = getLegalBeat(state, character.guestId, thread.id)
    check(notice, `${thread.id}: notice is unreachable`)
    const analyze = notice.choices.find(choice => choice.intent === 'analyze')
    check(analyze, `${thread.id}: no productive notice choice`)
    state = applyStoryChoice(state, character.guestId, thread.id, analyze.id)
    const context = getLegalBeat(state, character.guestId, thread.id)
    check(context, `${thread.id}: context is unreachable`)
    const test = context.choices.find(choice => choice.intent === 'test') ?? context.choices[0]
    state = applyStoryChoice(state, character.guestId, thread.id, test.id)
    const testBeat = getLegalBeat(state, character.guestId, thread.id)
    check(testBeat?.choices[0], `${thread.id}: test resolution is unreachable`)
    state = applyStoryChoice(state, character.guestId, thread.id, testBeat.choices[0].id)
    check(state.revealedAssociations.includes(`${character.archetypeId}:${thread.evidenceId}`), `${thread.id}: reveal did not apply`)
  }
}
// Ten guests each resolve their three assigned traces.
check(state.revealedAssociations.length === 30, `expected 30 reveals, found ${state.revealedAssociations.length}`)

// Untied traces are fully playable while the guest is alive so the player cannot
// narrow the field by absence of dialogue, but they end in a no-reveal dead end:
// exactly one terminal choice is legal, no association is recorded, and the
// thread ends spent rather than resolved.
{
  let clearState = makeCase(1931, false).state
  const someCharacter = Object.values(clearState.characters)[0]
  const dossier = DOSSIERS[someCharacter.archetypeId]
  const untied = EVIDENCE_IDS.find(id => !someCharacter.assignedEvidenceIds.includes(id))
  check(untied, 'expected at least one untied trace')
  const thread = dossier.evidenceThreads[untied]
  check(thread, `${someCharacter.archetypeId}/${untied}: missing untied thread`)
  const notice = getLegalBeat(clearState, someCharacter.guestId, thread.id)
  check(notice, `${thread.id}: untied notice unreachable while alive`)
  const analyze = notice.choices.find(choice => choice.intent === 'analyze')
  check(analyze, `${thread.id}: untied notice missing analyze choice`)
  clearState = applyStoryChoice(clearState, someCharacter.guestId, thread.id, analyze.id)
  const context = getLegalBeat(clearState, someCharacter.guestId, thread.id)
  check(context, `${thread.id}: untied context unreachable`)
  const test = context.choices.find(choice => choice.intent === 'test') ?? context.choices[0]
  clearState = applyStoryChoice(clearState, someCharacter.guestId, thread.id, test.id)
  const testBeat = getLegalBeat(clearState, someCharacter.guestId, thread.id)
  check(testBeat?.choices.length === 1, `${thread.id}: exactly one terminal choice should be legal for an untied guest`)
  clearState = applyStoryChoice(clearState, someCharacter.guestId, thread.id, testBeat.choices[0].id)
  check(!clearState.revealedAssociations.includes(`${someCharacter.archetypeId}:${untied}`), `${thread.id}: an untied trace must never record an association`)
  check(clearState.characters[someCharacter.guestId].threadStatuses[thread.id] === 'spent', `${thread.id}: untied thread should end spent (no reveal)`)
}

for (const original of Object.values(makeCase(1942, false).state.characters)) {
  const rerouted = markCharacterUnavailable(makeCase(1942, false).state, original.guestId, 'death')
  const character = rerouted.characters[original.guestId]
  // Only assigned traces open into recoverable fallbacks; latent traces stay latent.
  for (const evidenceId of character.assignedEvidenceIds) {
    const thread = DOSSIERS[character.archetypeId].evidenceThreads[evidenceId]
    check(thread, `${character.archetypeId}/${evidenceId}: missing assigned thread`)
    check(character.threadStatuses[thread.id] === 'rerouted', `${thread.id}: death did not reroute`)
    check(thread.fallbackCarrierIds.every(id => rerouted.flags.includes(`carrier-active:${id}`)), `${thread.id}: fallback carrier inactive`)
    const fallbackBeat = getLegalBeat(rerouted, character.guestId, thread.id)
    check(fallbackBeat?.node.deathSafe, `${thread.id}: no death-safe reveal route`)
  }
  for (const evidenceId of EVIDENCE_IDS) {
    if (character.assignedEvidenceIds.includes(evidenceId)) continue
    const thread = DOSSIERS[character.archetypeId].evidenceThreads[evidenceId]
    check(thread && character.threadStatuses[thread.id] === 'latent', `${thread?.id}: unassigned trace should stay latent`)
  }
}

const untouched = makeCase(1952, false).state
const untouchedEvaluation = evaluateCaseEnding(untouched, {
  accusedGuestId: null,
  suspectedGuestId: null,
  disposition: 'seal',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
for (const character of Object.values(untouched.characters)) {
  check(
    untouchedEvaluation.personalEndingIds[character.guestId] === `${character.archetypeId}:ending:unresolved`,
    `${character.archetypeId}: untouched private story received ${untouchedEvaluation.personalEndingIds[character.guestId]}`,
  )
}
const untouchedCharacter = Object.values(untouched.characters)[0]
const untouchedDead = markCharacterUnavailable(untouched, untouchedCharacter.guestId, 'death')
const untouchedDeadEvaluation = evaluateCaseEnding(untouchedDead, {
  accusedGuestId: null,
  suspectedGuestId: null,
  disposition: 'seal',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
check(
  untouchedDeadEvaluation.personalEndingIds[untouchedCharacter.guestId] === `${untouchedCharacter.archetypeId}:ending:unresolved:legacy`,
  'untouched dead character did not receive an unresolved legacy state',
)

// Locate a rapport thread + closing choice that scores a given ending index.
// Warm closings (choice 0) score the alliance ending; hostile closings
// (choice 2) score the rupture ending; measured closings (choice 1) score a
// distinct middle ending per thread.
function locateEndingChoice(endingIndex: number, endingCount: number): [number, number] {
  if (endingIndex === 0) return [0, 0]
  if (endingIndex === endingCount - 1) return [0, 2]
  return [endingIndex - 1, 1]
}

for (const original of Object.values(makeCase(1953, false).state.characters)) {
  const dossier = DOSSIERS[original.archetypeId]
  for (const [index, ending] of dossier.endings.entries()) {
    const fresh = makeCase(1953, false).state
    const character = fresh.characters[original.guestId]
    const [threadIndex, choiceIndex] = locateEndingChoice(index, dossier.endings.length)
    const thread = dossier.regularThreads[threadIndex]
    const beat = getLegalBeat(fresh, character.guestId, thread.id)
    check(beat?.choices[choiceIndex], `${ending.id}: ending choice is unreachable`)
    const chosen = applyStoryChoice(fresh, character.guestId, thread.id, beat.choices[choiceIndex].id)
    const evaluation = evaluateCaseEnding(chosen, {
      accusedGuestId: null,
      suspectedGuestId: null,
      disposition: 'seal',
      attackPrevented: false,
      trapCaughtGuestId: null,
    })
    check(evaluation.personalEndingIds[character.guestId] === ending.id, `${ending.id}: evaluator selected ${evaluation.personalEndingIds[character.guestId]}`)
    const legacyState = markCharacterUnavailable(chosen, character.guestId, 'death')
    const legacyEvaluation = evaluateCaseEnding(legacyState, {
      accusedGuestId: null,
      suspectedGuestId: null,
      disposition: 'seal',
      attackPrevented: false,
      trapCaughtGuestId: null,
    })
    check(
      legacyEvaluation.personalEndingIds[character.guestId] === `${ending.id}:legacy`,
      `${ending.id}: earned ending did not survive as a truthful legacy`,
    )
  }
}

const deterministicA = makeCase(1964).state
const deterministicB = makeCase(1964).state
check(JSON.stringify(deterministicA) === JSON.stringify(deterministicB), 'same seed and guests must initialize identically')
const columnist = Object.values(deterministicA.characters).find(character => character.archetypeId === 'columnist')
check(columnist, 'missing columnist')
const privateThread = DOSSIERS.columnist.regularThreads[0]
const choiceId = getLegalBeat(deterministicA, columnist.guestId, privateThread.id)?.choices[0]?.id
check(choiceId, 'missing deterministic transition choice')
const transitionedA = applyStoryChoice(deterministicA, columnist.guestId, privateThread.id, choiceId)
const transitionedB = applyStoryChoice(deterministicB, columnist.guestId, privateThread.id, choiceId)
check(JSON.stringify(transitionedA) === JSON.stringify(transitionedB), 'same legal choice must produce identical state')

const chauffeurBefore = Object.values(transitionedA.characters).find(character => character.archetypeId === 'chauffeur')
const debutanteBefore = Object.values(transitionedA.characters).find(character => character.archetypeId === 'debutante')
check(chauffeurBefore && debutanteBefore, 'missing worker-respect recipients')
const crossed = dispatchCrossNpcEvent(transitionedA, 'worker-respected', 'chauffeur')
check(
  crossed.characters[debutanteBefore.guestId].trust === debutanteBefore.trust + 1,
  'worker-respected did not propagate to Debutante',
)

const reopenBase = makeCase(1975, false).state
const reopenCharacter = Object.values(reopenBase.characters).find(character => character.archetypeId === 'columnist')
check(reopenCharacter, 'missing reopening character')
// Use a trace the columnist is actually assigned this case (an open thread).
const reopenEvidenceThread = DOSSIERS.columnist.evidenceThreads[reopenCharacter.assignedEvidenceIds[0]]
check(reopenEvidenceThread, 'missing reopening thread')
const reopenNotice = getLegalBeat(reopenBase, reopenCharacter.guestId, reopenEvidenceThread.id)
const closeChoice = reopenNotice?.choices.find(choice => choice.intent === 'pressure')
check(closeChoice, 'missing route-closing choice')
const closed = applyStoryChoice(reopenBase, reopenCharacter.guestId, reopenEvidenceThread.id, closeChoice.id)
check(closed.characters[reopenCharacter.guestId].threadStatuses[reopenEvidenceThread.id] === 'closed-personal', 'pressure did not close personal route')
const rerouted = markCharacterUnavailable(closed, reopenCharacter.guestId, 'shutdown')
const fallbackFactId = `${reopenEvidenceThread.id}:fallback-found`
const reopened = reopenThread(rerouted, reopenCharacter.guestId, reopenEvidenceThread.id, fallbackFactId)
check(getLegalBeat(reopened, reopenCharacter.guestId, reopenEvidenceThread.id), 'external corroboration did not reopen thread')

const killerId = state.killerGuestId
state = recordNarrativeFact(state, {
  id: 'test:killer:opportunity',
  proposition: 'External route timing places the killer in the west passage.',
  source: 'artifact',
  carrierId: 'test-route',
  proof: 'opportunity',
  suspectId: killerId,
  survivesCarrierDeath: true,
})
state = recordNarrativeFact(state, {
  id: 'test:killer:deception',
  proposition: 'The stable cover conflicts with the marked exchange time.',
  source: 'inferred',
  carrierId: 'test-cover',
  proof: 'deception-motive',
  suspectId: killerId,
  survivesCarrierDeath: true,
})
const ending = evaluateCaseEnding(state, {
  accusedGuestId: killerId,
  suspectedGuestId: killerId,
  disposition: 'publish',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
check(ending.outcome === 'complete-public-exposure', `expected complete exposure, received ${ending.outcome}`)
check(ending.missingProof.length === 0, `unexpected missing proof: ${ending.missingProof.join(', ')}`)

console.log(`NARRATIVE STORY VALIDATION PASSED: ${pairCount}/100 pairs, ${Object.keys(NARRATIVE_NODES).length} nodes, ${endingIds.size} endings`)
