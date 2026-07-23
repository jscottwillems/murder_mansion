import { BeatVisibilityGuard } from '../../src/game/llm/beatRenderer'
import { DOSSIERS } from '../../src/game/narrative/dossierStoryData'
import {
  applyStoryChoice,
  evaluateCaseEnding,
  getLegalBeat,
  initializeNarrativeCase,
  markCharacterUnavailable,
  recordNarrativeFact,
  resumePausedThread,
} from '../../src/game/narrative/storyEngine'
import type {
  ArchiveDisposition,
  CaseOutcome,
  NarrativeCaseState,
  ProofCategory,
} from '../../src/game/narrative/types'
import { Simulation } from '../../src/game/sim'

function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

function makeCase(seed = 7211931) {
  const sim = new Simulation(seed, {
    log: () => {},
    lead: () => {},
    guestDied: () => {},
    bodyDiscovered: () => {},
    overheard: () => {},
  })
  const openingVictim = sim.createOpeningCrime()
  return {
    sim,
    state: initializeNarrativeCase({
      caseSeed: seed,
      guests: sim.guests,
      openingVictimId: openingVictim.id,
    }),
  }
}

const runtime = makeCase()
const living = runtime.sim.guests.find(guest => guest.alive)
check(living, 'expected a living interview guest')
// Use a trace this guest is actually assigned this case (an open thread).
const thread = DOSSIERS[living.archetypeId].evidenceThreads[living.evidenceIds[0]]
check(thread, 'expected an assigned evidence thread')

let state = runtime.state
const root = getLegalBeat(state, living.id, thread.id)
check(root?.node.id === thread.startNodeId, 'root did not display its authored legal beat immediately')
const firstChoice = root.choices.find(choice => choice.intent === 'analyze')
check(firstChoice, 'root lacked its semantic analyze choice')
const immutableBefore = JSON.stringify(state)
state = applyStoryChoice(state, living.id, thread.id, firstChoice.id)
check(JSON.stringify(runtime.state) === immutableBefore, 'applyStoryChoice mutated the prior case state')
const context = getLegalBeat(state, living.id, thread.id)
check(context, 'multi-beat thread did not advance to context')
const testChoice = context.choices.find(choice => choice.intent === 'test') ?? context.choices[0]
state = applyStoryChoice(state, living.id, thread.id, testChoice.id)
const testBeat = getLegalBeat(state, living.id, thread.id)
check(testBeat?.choices[0], 'multi-beat thread did not reach its test')
state = applyStoryChoice(state, living.id, thread.id, testBeat.choices[0].id)
check(state.revealedAssociations.includes(`${living.archetypeId}:${thread.evidenceId}`), 'deterministic reveal-evidence effect was not mirrored in state')
check(state.characters[living.id].threadStatuses[thread.id] === 'resolved', 'resolved thread status did not persist')

const pauseCase = makeCase(7211932)
const pauseGuest = pauseCase.sim.guests.find(guest => guest.alive)
check(pauseGuest, 'expected pause test guest')
const pauseThread = DOSSIERS[pauseGuest.archetypeId].evidenceThreads[pauseGuest.evidenceIds[0]]
check(pauseThread, 'expected pause test thread')
const pauseRoot = getLegalBeat(pauseCase.state, pauseGuest.id, pauseThread.id)
const withdraw = pauseRoot?.choices.find(choice => choice.intent === 'withdraw')
check(withdraw, 'expected a withdrawal choice')
const paused = applyStoryChoice(pauseCase.state, pauseGuest.id, pauseThread.id, withdraw.id)
check(paused.characters[pauseGuest.id].threadStatuses[pauseThread.id] === 'paused', 'withdrawal did not pause the thread')
const resumed = resumePausedThread(paused, pauseGuest.id, pauseThread.id)
check(getLegalBeat(resumed, pauseGuest.id, pauseThread.id)?.node.id === pauseThread.startNodeId, 'paused thread did not reopen on re-entry')
check(resumed.characters[pauseGuest.id].trust === paused.characters[pauseGuest.id].trust, 're-entry reset persistent trust')

const shutdownRoot = getLegalBeat(pauseCase.state, pauseGuest.id, pauseThread.id)
const pressure = shutdownRoot?.choices.find(choice => choice.intent === 'pressure')
check(pressure, 'expected shutdown pressure choice')
const personallyClosed = applyStoryChoice(pauseCase.state, pauseGuest.id, pauseThread.id, pressure.id)
const shutdown = markCharacterUnavailable(personallyClosed, pauseGuest.id, 'shutdown')
check(shutdown.characters[pauseGuest.id].threadStatuses[pauseThread.id] === 'rerouted', 'shutdown did not reroute the unresolved thread')
check(getLegalBeat(shutdown, pauseGuest.id, pauseThread.id)?.node.deathSafe, 'shutdown fallback was not accessible')

const death = markCharacterUnavailable(pauseCase.state, pauseGuest.id, 'death')
const deathBeat = getLegalBeat(death, pauseGuest.id, pauseThread.id)
check(deathBeat?.node.deathSafe && deathBeat.choices[0], 'death fallback beat was inaccessible')
const recovered = applyStoryChoice(death, pauseGuest.id, pauseThread.id, deathBeat.choices[0].id)
check(recovered.revealedAssociations.includes(`${pauseGuest.archetypeId}:${pauseThread.evidenceId}`), 'recovered fallback did not preserve the association')
check(
  pauseThread.fallbackCarrierIds.every(id => death.flags.includes(`carrier-active:${id}`)),
  'death did not expose pre-seeded fallback carriers',
)

function withProof(base: NarrativeCaseState, guestId: string, categories: ProofCategory[]): NarrativeCaseState {
  return categories.reduce((next, proof) => recordNarrativeFact(next, {
    id: `integration:${guestId}:${proof}`,
    proposition: `${proof} established for integration coverage.`,
    source: 'artifact',
    carrierId: 'integration',
    proof,
    suspectId: guestId,
    survivesCarrierDeath: true,
  }), base)
}

const endingBase = makeCase(7211933)
const killerId = endingBase.state.killerGuestId
const innocentId = endingBase.sim.guests.find(guest => guest.id !== killerId)?.id
check(innocentId, 'expected an innocent ending target')
const untouchedEvaluation = evaluateCaseEnding(endingBase.state, {
  accusedGuestId: null,
  suspectedGuestId: null,
  disposition: 'seal',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
for (const character of Object.values(endingBase.state.characters)) {
  const expectedId = `${character.archetypeId}:ending:unresolved${character.alive ? '' : ':legacy'}`
  check(untouchedEvaluation.personalEndingIds[character.guestId] === expectedId, `${character.archetypeId}: untouched ending was not unresolved`)
}
const privateGuest = endingBase.sim.guests.find(guest => guest.alive)
check(privateGuest, 'expected a living private-ending guest')
const privateDossier = DOSSIERS[privateGuest.archetypeId]
const privateRegularThread = privateDossier.regularThreads[0]
const privateBeat = getLegalBeat(endingBase.state, privateGuest.id, privateRegularThread.id)
check(privateBeat?.choices[0], 'rapport thread lacked its authored ending choice')
const privateChoiceState = applyStoryChoice(endingBase.state, privateGuest.id, privateRegularThread.id, privateBeat.choices[0].id)
const privateEvaluation = evaluateCaseEnding(privateChoiceState, {
  accusedGuestId: null,
  suspectedGuestId: null,
  disposition: 'seal',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
check(privateEvaluation.personalEndingIds[privateGuest.id] === privateDossier.endings[0].id, 'private choice did not earn its exact authored ending')
const privateLegacy = markCharacterUnavailable(privateChoiceState, privateGuest.id, 'death')
const privateLegacyEvaluation = evaluateCaseEnding(privateLegacy, {
  accusedGuestId: null,
  suspectedGuestId: null,
  disposition: 'seal',
  attackPrevented: false,
  trapCaughtGuestId: null,
})
check(privateLegacyEvaluation.personalEndingIds[privateGuest.id] === `${privateDossier.endings[0].id}:legacy`, 'earned ending did not survive death as legacy')
const complete = withProof(endingBase.state, killerId, ['material', 'opportunity', 'deception-motive'])
for (const circuit of Object.values(complete.circuits).slice(0, 3)) circuit.completed = true

const evaluations: Array<[CaseOutcome, ReturnType<typeof evaluateCaseEnding>]> = [
  ['complete-public-exposure', evaluateCaseEnding(complete, { accusedGuestId: killerId, suspectedGuestId: killerId, disposition: 'publish', attackPrevented: false, trapCaughtGuestId: null })],
  ['correct-culprit-scandal-sealed', evaluateCaseEnding(withProof(endingBase.state, killerId, ['material', 'opportunity', 'deception-motive']), { accusedGuestId: killerId, suspectedGuestId: killerId, disposition: 'seal', attackPrevented: false, trapCaughtGuestId: null })],
  ['counter-trap-prevented-attack', evaluateCaseEnding(withProof(endingBase.state, killerId, ['material']), { accusedGuestId: killerId, suspectedGuestId: killerId, disposition: 'destroy', attackPrevented: true, trapCaughtGuestId: killerId })],
  ['correct-suspicion-without-proof', evaluateCaseEnding(endingBase.state, { accusedGuestId: killerId, suspectedGuestId: killerId, disposition: 'seal', attackPrevented: false, trapCaughtGuestId: null })],
  ['wrong-accusation', evaluateCaseEnding(endingBase.state, { accusedGuestId: innocentId, suspectedGuestId: innocentId, disposition: 'publish', attackPrevented: false, trapCaughtGuestId: null })],
  ['house-of-silence', evaluateCaseEnding(endingBase.state, { accusedGuestId: null, suspectedGuestId: null, disposition: 'destroy', attackPrevented: false, trapCaughtGuestId: null })],
]
for (const [expected, evaluation] of evaluations) {
  check(evaluation.outcome === expected, `expected ${expected}, received ${evaluation.outcome}`)
}
const dispositions = new Set(evaluations.map(([, evaluation]) => evaluation.disposition))
for (const disposition of ['publish', 'seal', 'destroy'] satisfies ArchiveDisposition[]) {
  check(dispositions.has(disposition), `archive disposition ${disposition} was not integrated`)
}

const guard = new BeatVisibilityGuard()
const firstKey = guard.show(living.id, thread.id, 'node:first', 1)
const secondKey = guard.show(living.id, thread.id, 'node:second', 2)
check(!guard.isCurrent(firstKey), 'stale LLM completion remained eligible after a newer beat')
check(guard.isCurrent(secondKey), 'current LLM completion was incorrectly rejected')
guard.invalidate()
check(!guard.isCurrent(secondKey), 'selected/exited beat did not invalidate its pending completion')

console.log('NARRATIVE INTEGRATION PASSED: choices, persistence, reroutes, endings, dispositions, stale guards')
