import { EVIDENCE_BY_ARCHETYPE } from '../data'
import type { ArchetypeId, Guest, RoomId } from '../types'
import { DOSSIERS, NARRATIVE_NODES, NARRATIVE_THREADS } from './dossierStoryData'
import type {
  ArchiveDisposition,
  CaseEndingEvaluation,
  CaseEndingInput,
  CaseInitialization,
  CharacterNarrativeState,
  CircuitId,
  CrossNpcEvent,
  CrossNpcEventType,
  FactRecord,
  LegalBeat,
  NarrativeCaseState,
  PersonalEndingDefinition,
  ProofCategory,
  StoryChoice,
  StoryCondition,
  StoryEffect,
  ThreadStatus,
} from './types'

const CIRCUIT_OWNERS: Record<CircuitId, ArchetypeId[]> = {
  'paper-payments': ['columnist', 'correspondent', 'accountant', 'curator'],
  'key-route': ['debutante', 'antiquarian', 'chauffeur', 'magician'],
  'performance-presence': ['vocalist', 'magician', 'columnist', 'debutante'],
  'material-provenance': ['surgeon', 'curator', 'antiquarian', 'accountant'],
}

const COVER_ROOMS: RoomId[] = ['dining', 'gallery', 'study', 'library', 'ballroom']

function assertNever(value: never): never {
  throw new Error(`Unhandled narrative variant: ${JSON.stringify(value)}`)
}

function definedThread<T>(thread: T | undefined): thread is T {
  return thread !== undefined
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function sortedGuests(guests: readonly Guest[]): Guest[] {
  return [...guests].sort((left, right) => left.id.localeCompare(right.id))
}

function coverFor(caseSeed: string, killer: Guest, guests: readonly Guest[]) {
  const others = sortedGuests(guests).filter(guest => guest.id !== killer.id)
  const hash = stableHash(`${caseSeed}:${killer.id}:cover`)
  const witness = others[hash % others.length]
  const reentryWitness = others[(hash + 3) % others.length]
  return {
    preAnchor: { room: COVER_ROOMS[hash % COVER_ROOMS.length], timeBand: '11:30–11:42 PM' },
    privateInterval: {
      room: COVER_ROOMS[(hash + 1) % COVER_ROOMS.length],
      timeBand: '11:42–11:55 PM',
      claimedWitnessId: witness.id,
    },
    reentry: {
      room: COVER_ROOMS[(hash + 2) % COVER_ROOMS.length],
      timeBand: '11:55 PM–12:00 AM',
      witnessId: reentryWitness.id,
    },
    weaknessFactId: `${killer.archetypeId}:cover:external-contradiction`,
  }
}

function initialCharacter(caseSeed: string, guest: Guest, guests: readonly Guest[]): CharacterNarrativeState {
  const dossier = DOSSIERS[guest.archetypeId]
  const threadStatuses: Record<string, ThreadStatus> = {}
  const currentNodeIds: Record<string, string | null> = {}
  const assigned = new Set(guest.evidenceIds)
  // Every evidence reveal thread is playable while the guest is alive, so a
  // discovered trace surfaces a thread on *every* guest and the player cannot
  // narrow the field by absence of dialogue. Only the assigned owners resolve
  // into a recorded association; the rest reach a no-reveal dead end. On death,
  // only tied traces reroute into recoverable fallbacks — untied ones stay
  // latent because they never carried an association to preserve.
  for (const thread of Object.values(dossier.evidenceThreads).filter(definedThread)) {
    const tied = assigned.has(thread.evidenceId)
    threadStatuses[thread.id] = guest.alive ? 'open' : tied ? 'rerouted' : 'latent'
    currentNodeIds[thread.id] = thread.startNodeId
  }
  for (const thread of dossier.regularThreads) {
    threadStatuses[thread.id] = guest.alive ? 'open' : 'rerouted'
    currentNodeIds[thread.id] = thread.startNodeId
  }
  // Personal asides are pure flavour with no case value, so a dead guest simply
  // spends them rather than leaving a recoverable fallback behind.
  for (const thread of dossier.bonusPersonalThreads) {
    threadStatuses[thread.id] = guest.alive ? 'open' : 'spent'
    currentNodeIds[thread.id] = thread.startNodeId
  }
  return {
    guestId: guest.id,
    archetypeId: guest.archetypeId,
    displayName: guest.name,
    roleMode: guest.isKiller ? 'killer' : 'innocent',
    alive: guest.alive,
    discovered: guest.bodyFound,
    trust: 0,
    pressure: 0,
    flags: [],
    knownFactIds: [],
    threadStatuses,
    currentNodeIds,
    endingScores: Object.fromEntries(dossier.endings.map(ending => [ending.id, 0])),
    assignedEvidenceIds: [...guest.evidenceIds],
    cover: guest.isKiller ? coverFor(caseSeed, guest, guests) : undefined,
  }
}

/** Build stable narrative state from the simulation's already-assigned guest list. */
export function initializeNarrativeCase(input: CaseInitialization): NarrativeCaseState {
  const caseSeed = String(input.caseSeed)
  const guests = sortedGuests(input.guests)
  const killer = guests.find(guest => guest.isKiller)
  if (!killer) throw new Error('Narrative case requires exactly one killer')
  if (guests.filter(guest => guest.isKiller).length !== 1) throw new Error('Narrative case requires exactly one killer')
  if (new Set(guests.map(guest => guest.archetypeId)).size !== 10) throw new Error('Narrative case requires all ten unique archetypes')
  const openingVictimId = input.openingVictimId
    ?? guests.find(guest => !guest.alive && guest.bodyFound)?.id
    ?? null
  const characters = Object.fromEntries(guests.map(guest => [
    guest.id,
    initialCharacter(caseSeed, guest, guests),
  ]))
  const circuits: NarrativeCaseState['circuits'] = {
    'paper-payments': { id: 'paper-payments', ownerIds: CIRCUIT_OWNERS['paper-payments'], resolvedOwners: [], completed: false },
    'key-route': { id: 'key-route', ownerIds: CIRCUIT_OWNERS['key-route'], resolvedOwners: [], completed: false },
    'performance-presence': { id: 'performance-presence', ownerIds: CIRCUIT_OWNERS['performance-presence'], resolvedOwners: [], completed: false },
    'material-provenance': { id: 'material-provenance', ownerIds: CIRCUIT_OWNERS['material-provenance'], resolvedOwners: [], completed: false },
  }
  return {
    schemaVersion: 1,
    caseSeed,
    storyId: `rookwood:${stableHash(`${caseSeed}:${guests.map(guest => `${guest.id}:${guest.archetypeId}`).join('|')}`).toString(36)}`,
    clockMin: 0,
    act: openingVictimId ? 1 : 0,
    killerGuestId: killer.id,
    openingVictimId,
    characters,
    facts: {},
    collectedEvidenceIds: [],
    revealedAssociations: [],
    flags: [],
    circuits,
    queuedEvents: [],
    counterTrapsPrepared: [],
    counterTrapSucceeded: false,
    disposition: null,
  }
}

function conditionMet(condition: StoryCondition, state: NarrativeCaseState, character: CharacterNarrativeState): boolean {
  switch (condition.kind) {
    case 'flag': return state.flags.includes(String(condition.value)) || character.flags.includes(String(condition.value))
    case 'not-flag': return !state.flags.includes(String(condition.value)) && !character.flags.includes(String(condition.value))
    case 'fact': return Boolean(state.facts[String(condition.value)])
    case 'not-fact': return !state.facts[String(condition.value)]
    case 'trust-at-least': return character.trust >= Number(condition.value)
    case 'pressure-at-least': return character.pressure >= Number(condition.value)
    case 'alive': return character.alive === Boolean(condition.value)
    case 'assigned-evidence': return character.assignedEvidenceIds.includes(condition.value)
    case 'not-assigned-evidence': return !character.assignedEvidenceIds.includes(condition.value)
    default: return assertNever(condition)
  }
}

function findCharacterByArchetype(state: NarrativeCaseState, archetypeId: ArchetypeId): CharacterNarrativeState {
  const character = Object.values(state.characters).find(item => item.archetypeId === archetypeId)
  if (!character) throw new Error(`Missing character for ${archetypeId}`)
  return character
}

export function getLegalBeat(state: NarrativeCaseState, guestId: string, threadId: string): LegalBeat | null {
  const character = state.characters[guestId]
  if (!character) return null
  const status = character.threadStatuses[threadId]
  if (!status || status === 'latent' || status === 'paused' || status === 'closed-personal' || status === 'spent') return null
  const nodeId = character.currentNodeIds[threadId]
  if (!nodeId) return null
  const node = NARRATIVE_NODES[nodeId]
  if (!node || node.owner !== character.archetypeId) return null
  if (!character.alive && !node.deathSafe) return null
  return {
    node,
    choices: node.choices.filter(choice => choice.requires.every(condition => conditionMet(condition, state, character))),
  }
}

function eventRecipients(type: CrossNpcEventType, source: ArchetypeId): ArchetypeId[] {
  const withoutSource = (ids: ArchetypeId[]) => ids.filter(id => id !== source)
  switch (type) {
    case 'source-protected': return withoutSource(['columnist', 'correspondent', 'vocalist'])
    case 'source-burned': return withoutSource(['columnist', 'correspondent', 'vocalist'])
    case 'worker-respected': return withoutSource(['chauffeur', 'debutante'])
    case 'worker-dismissed': return withoutSource(['chauffeur', 'debutante'])
    case 'collection-seized': return withoutSource(['curator', 'antiquarian'])
    case 'authorship-restored': return withoutSource(['magician', 'vocalist'])
    case 'medical-record-sealed': return withoutSource(['surgeon', 'accountant'])
    case 'ledger-seized': return withoutSource(['accountant', 'debutante'])
    case 'publication-threatened': return ['columnist', 'correspondent']
    case 'false-detail-published': return ['correspondent', 'columnist']
    case 'key-custody-changed': return withoutSource(['debutante', 'antiquarian', 'chauffeur', 'magician'])
    case 'body-discovered': return []
    case 'npc-shutdown': return []
    case 'countertrap-prepared': return withoutSource(['accountant', 'vocalist', 'chauffeur', 'magician'])
    default: return assertNever(type)
  }
}

function queueEvent(state: NarrativeCaseState, type: CrossNpcEventType, source: ArchetypeId): void {
  state.queuedEvents.push({
    id: `${state.storyId}:event:${state.queuedEvents.length + 1}`,
    type,
    sourceArchetypeId: source,
    recipients: eventRecipients(type, source),
    processed: false,
  })
}

function factProof(factId: string): ProofCategory {
  if (factId.includes(':evidence:')) return 'material'
  if (factId.includes(':cover:') || factId.includes(':route:')) return 'opportunity'
  if (factId.includes(':motive:') || factId.includes(':deception:')) return 'deception-motive'
  return 'conspiracy'
}

function addFact(state: NarrativeCaseState, character: CharacterNarrativeState, factId: string, source: FactRecord['source']): void {
  if (state.facts[factId]) return
  const threadId = Object.keys(NARRATIVE_THREADS).find(id => factId.startsWith(id))
  const thread = threadId ? NARRATIVE_THREADS[threadId] : undefined
  state.facts[factId] = {
    id: factId,
    proposition: thread?.kind === 'evidence'
      ? thread.concreteReveal
      : factId,
    source,
    carrierId: character.guestId,
    acquiredAtMin: state.clockMin,
    proof: factProof(factId),
    suspectId: character.guestId,
    survivesCarrierDeath: source === 'artifact' || source === 'public' || source === 'inferred',
  }
  if (!character.knownFactIds.includes(factId)) character.knownFactIds.push(factId)
}

function applyEffect(state: NarrativeCaseState, actor: CharacterNarrativeState, effect: StoryEffect): void {
  switch (effect.kind) {
    case 'trust': {
      const target = findCharacterByArchetype(state, effect.target)
      target.trust = Math.max(-5, Math.min(5, target.trust + effect.delta))
      return
    }
    case 'pressure': {
      const target = findCharacterByArchetype(state, effect.target)
      target.pressure = Math.max(0, Math.min(10, target.pressure + effect.delta))
      return
    }
    case 'set-flag':
      if (!state.flags.includes(effect.flag)) state.flags.push(effect.flag)
      if (!actor.flags.includes(effect.flag)) actor.flags.push(effect.flag)
      return
    case 'clear-flag':
      state.flags = state.flags.filter(flag => flag !== effect.flag)
      actor.flags = actor.flags.filter(flag => flag !== effect.flag)
      return
    case 'emit-fact':
      addFact(state, actor, effect.factId, effect.source)
      return
    case 'reveal-evidence': {
      const association = `${effect.archetypeId}:${effect.evidenceId}`
      if (!state.revealedAssociations.includes(association)) state.revealedAssociations.push(association)
      if (!state.collectedEvidenceIds.includes(effect.evidenceId)) state.collectedEvidenceIds.push(effect.evidenceId)
      // Opportunity (route) and deception-motive proofs are tied to a guest's
      // per-case shuffled evidence order: their first assigned trace carries the
      // route proof, their second carries the deception proof. Emitting here
      // keeps proof categories correct regardless of the shuffle.
      const owner = findCharacterByArchetype(state, effect.archetypeId)
      if (owner.assignedEvidenceIds[0] === effect.evidenceId) {
        addFact(state, owner, `${effect.archetypeId}:route:${effect.evidenceId}`, 'inferred')
      }
      if (owner.assignedEvidenceIds[1] === effect.evidenceId) {
        addFact(state, owner, `${effect.archetypeId}:deception:${effect.evidenceId}`, 'inferred')
      }
      return
    }
    case 'thread-status':
      actor.threadStatuses[effect.threadId] = effect.status
      return
    case 'queue-event':
      queueEvent(state, effect.eventType, actor.archetypeId)
      return
    case 'ending-score':
      actor.endingScores[effect.endingId] = (actor.endingScores[effect.endingId] ?? 0) + effect.delta
      return
    default:
      return assertNever(effect)
  }
}

/** Apply only an offered local choice ID; presentation text is never interpreted. */
export function applyStoryChoice(
  state: NarrativeCaseState,
  guestId: string,
  threadId: string,
  choiceId: string,
): NarrativeCaseState {
  const next = structuredClone(state)
  const character = next.characters[guestId]
  if (!character) throw new Error(`Unknown guest ${guestId}`)
  const beat = getLegalBeat(next, guestId, threadId)
  const choice = beat?.choices.find(candidate => candidate.id === choiceId)
  if (!choice) throw new Error(`Illegal narrative choice ${choiceId}`)
  for (const effect of choice.effects) applyEffect(next, character, effect)
  character.currentNodeIds[threadId] = choice.nextNodeId
  if (choice.nextNodeId && character.threadStatuses[threadId] === 'open') character.threadStatuses[threadId] = 'active'
  if (!choice.nextNodeId && (character.threadStatuses[threadId] === 'active' || character.threadStatuses[threadId] === 'open')) {
    character.threadStatuses[threadId] = 'spent'
  }
  updateCircuits(next)
  processCrossNpcEvents(next)
  updateAct(next)
  return next
}

function updateCircuits(state: NarrativeCaseState): void {
  for (const circuit of Object.values(state.circuits)) {
    circuit.resolvedOwners = circuit.ownerIds.filter(owner => {
      const dossier = DOSSIERS[owner]
      return Object.values(dossier.evidenceThreads).some(thread =>
        thread && state.revealedAssociations.includes(`${owner}:${thread.evidenceId}`),
      )
    })
    circuit.completed = circuit.resolvedOwners.length >= 3
  }
}

function processEvent(state: NarrativeCaseState, event: CrossNpcEvent): void {
  for (const recipientId of event.recipients) {
    const recipient = findCharacterByArchetype(state, recipientId)
    switch (event.type) {
      case 'source-protected':
      case 'worker-respected':
      case 'authorship-restored':
      case 'medical-record-sealed':
        recipient.trust = Math.min(5, recipient.trust + 1)
        break
      case 'source-burned':
      case 'worker-dismissed':
      case 'collection-seized':
      case 'publication-threatened':
        recipient.trust = Math.max(-5, recipient.trust - 1)
        recipient.pressure = Math.min(10, recipient.pressure + 1)
        break
      case 'ledger-seized':
      case 'false-detail-published':
      case 'key-custody-changed':
      case 'body-discovered':
      case 'npc-shutdown':
      case 'countertrap-prepared':
        if (!recipient.flags.includes(`observed-event:${event.type}`)) recipient.flags.push(`observed-event:${event.type}`)
        break
      default:
        assertNever(event.type)
    }
  }
  event.processed = true
}

export function processCrossNpcEvents(state: NarrativeCaseState): void {
  for (const event of state.queuedEvents) {
    if (!event.processed) processEvent(state, event)
  }
}

export function dispatchCrossNpcEvent(
  state: NarrativeCaseState,
  type: CrossNpcEventType,
  sourceArchetypeId: ArchetypeId,
): NarrativeCaseState {
  const next = structuredClone(state)
  queueEvent(next, type, sourceArchetypeId)
  processCrossNpcEvents(next)
  return next
}

export function recordNarrativeFact(
  state: NarrativeCaseState,
  fact: Omit<FactRecord, 'acquiredAtMin'>,
): NarrativeCaseState {
  const next = structuredClone(state)
  if (!next.facts[fact.id]) next.facts[fact.id] = { ...fact, acquiredAtMin: next.clockMin }
  updateAct(next)
  return next
}

export function prepareCounterTrap(
  state: NarrativeCaseState,
  trapId: string,
  sourceArchetypeId: ArchetypeId,
): NarrativeCaseState {
  const next = structuredClone(state)
  if (!next.counterTrapsPrepared.includes(trapId)) next.counterTrapsPrepared.push(trapId)
  queueEvent(next, 'countertrap-prepared', sourceArchetypeId)
  processCrossNpcEvents(next)
  return next
}

function updateAct(state: NarrativeCaseState): void {
  const resolved = state.revealedAssociations.length
  const proof = new Set(Object.values(state.facts).map(fact => fact.proof))
  if (state.disposition || state.clockMin >= 340) state.act = 4
  else if (proof.has('material') && proof.has('opportunity') && proof.has('deception-motive')) state.act = 3
  else if (resolved >= 2 || Object.values(state.circuits).some(circuit => circuit.completed) || state.clockMin >= 120) state.act = 2
  else if (state.openingVictimId) state.act = 1
  else state.act = 0
}

export function setNarrativeClock(state: NarrativeCaseState, clockMin: number): NarrativeCaseState {
  const next = structuredClone(state)
  next.clockMin = Math.max(0, Math.min(360, clockMin))
  updateAct(next)
  return next
}

/** Death freezes testimony and activates every pre-seeded fallback route. */
export function markCharacterUnavailable(
  state: NarrativeCaseState,
  guestId: string,
  reason: 'death' | 'shutdown',
): NarrativeCaseState {
  const next = structuredClone(state)
  const character = next.characters[guestId]
  if (!character) throw new Error(`Unknown guest ${guestId}`)
  if (reason === 'death') character.alive = false
  if (!character.flags.includes(`${character.archetypeId}:${reason}`)) character.flags.push(`${character.archetypeId}:${reason}`)
  const dossier = DOSSIERS[character.archetypeId]
  for (const thread of [...Object.values(dossier.evidenceThreads).filter(definedThread), ...dossier.regularThreads]) {
    const status = character.threadStatuses[thread.id]
    // An evidence thread this guest is not tied to this case never carried an
    // association, so it must not reroute into a recoverable fallback (that
    // would fabricate evidence). It simply goes latent when the guest becomes
    // unavailable.
    if (thread.kind === 'evidence' && !character.assignedEvidenceIds.includes(thread.evidenceId)) {
      if (status !== 'resolved' && status !== 'spent') character.threadStatuses[thread.id] = 'latent'
      continue
    }
    // Latent threads never opened, so they must not be rerouted into recoverable
    // fallbacks. Everything else that has not already concluded gets its
    // fallback carrier activated.
    if (status !== 'resolved' && status !== 'spent' && status !== 'latent' && status !== 'rerouted') {
      character.threadStatuses[thread.id] = 'rerouted'
      character.currentNodeIds[thread.id] = thread.nodeIds.find(nodeId => NARRATIVE_NODES[nodeId].deathSafe) ?? null
      for (const carrierId of thread.fallbackCarrierIds) {
        addFact(next, character, `${thread.id}:fallback-found`, 'artifact')
        if (!next.flags.includes(`carrier-active:${carrierId}`)) next.flags.push(`carrier-active:${carrierId}`)
      }
    }
  }
  // Personal asides carry nothing worth recovering, so they are simply spent
  // when the guest becomes unavailable — never rerouted into a fallback.
  for (const thread of dossier.bonusPersonalThreads) {
    const status = character.threadStatuses[thread.id]
    if (status !== 'resolved' && status !== 'spent') character.threadStatuses[thread.id] = 'spent'
  }
  queueEvent(next, reason === 'death' ? 'body-discovered' : 'npc-shutdown', character.archetypeId)
  processCrossNpcEvents(next)
  return next
}

export function reopenThread(state: NarrativeCaseState, guestId: string, threadId: string, corroboratingFactId: string): NarrativeCaseState {
  const next = structuredClone(state)
  const character = next.characters[guestId]
  const thread = NARRATIVE_THREADS[threadId]
  if (!character || !thread || !thread.reopenFactIds.includes(corroboratingFactId) || !next.facts[corroboratingFactId]) {
    throw new Error(`Thread ${threadId} cannot reopen from ${corroboratingFactId}`)
  }
  character.threadStatuses[threadId] = character.alive ? 'active' : 'rerouted'
  character.currentNodeIds[threadId] = thread.nodeIds.find(nodeId => character.alive || NARRATIVE_NODES[nodeId].deathSafe) ?? null
  return next
}

/** Voluntary withdrawal pauses a subject without erasing its persistent costs. */
export function resumePausedThread(state: NarrativeCaseState, guestId: string, threadId: string): NarrativeCaseState {
  const next = structuredClone(state)
  const character = next.characters[guestId]
  const thread = NARRATIVE_THREADS[threadId]
  if (!character || !thread || character.threadStatuses[threadId] !== 'paused') {
    throw new Error(`Thread ${threadId} is not paused`)
  }
  character.threadStatuses[threadId] = 'open'
  character.currentNodeIds[threadId] = thread.startNodeId
  return next
}

function proofFor(state: NarrativeCaseState, guestId: string, category: Exclude<ProofCategory, 'conspiracy'>): boolean {
  return Object.values(state.facts).some(fact => fact.suspectId === guestId && fact.proof === category)
}

function endingEligible(
  ending: PersonalEndingDefinition,
  character: CharacterNarrativeState,
  disposition: ArchiveDisposition,
): boolean {
  return character.trust >= ending.minTrust
    && character.pressure <= ending.maxPressure
    && ending.requiresFlags.every(flag => character.flags.includes(flag))
    && ending.forbidsFlags.every(flag => !character.flags.includes(flag))
    && (!ending.disposition || ending.disposition === disposition)
}

export function unresolvedPersonalEndingId(archetypeId: ArchetypeId, legacy = false): string {
  const id = `${archetypeId}:ending:unresolved`
  return legacy ? `${id}:legacy` : id
}

function personalEnding(character: CharacterNarrativeState, disposition: ArchiveDisposition): string {
  if (!character.flags.includes(`${character.archetypeId}:private-addressed`)) {
    return unresolvedPersonalEndingId(character.archetypeId, !character.alive)
  }
  const endings = DOSSIERS[character.archetypeId].endings
  const eligible = endings.filter(ending => endingEligible(ending, character, disposition))
  const selected = (eligible.length ? eligible : endings).sort((left, right) =>
    (character.endingScores[right.id] ?? 0) - (character.endingScores[left.id] ?? 0)
    || right.minTrust - left.minTrust
    || left.id.localeCompare(right.id),
  )[0]
  return character.alive ? selected.id : `${selected.id}:legacy`
}

export function evaluateCaseEnding(state: NarrativeCaseState, input: CaseEndingInput): CaseEndingEvaluation {
  const targetId = input.accusedGuestId ?? input.suspectedGuestId
  const correctCulprit = targetId === state.killerGuestId
  const proof = {
    material: targetId ? proofFor(state, targetId, 'material') : false,
    opportunity: targetId ? proofFor(state, targetId, 'opportunity') : false,
    'deception-motive': targetId ? proofFor(state, targetId, 'deception-motive') : false,
  }
  const missingProof = (Object.keys(proof) as Array<keyof typeof proof>).filter(category => !proof[category])
  const corroboratedCircuitCount = Object.values(state.circuits).filter(circuit => circuit.completed).length
  let outcome: CaseEndingEvaluation['outcome']
  if (input.attackPrevented && input.trapCaughtGuestId === state.killerGuestId && proof.material) {
    outcome = 'counter-trap-prevented-attack'
  } else if (input.accusedGuestId && !correctCulprit) {
    outcome = 'wrong-accusation'
  } else if (correctCulprit && missingProof.length === 0 && corroboratedCircuitCount >= 3) {
    outcome = 'complete-public-exposure'
  } else if (correctCulprit && missingProof.length === 0) {
    outcome = 'correct-culprit-scandal-sealed'
  } else if (correctCulprit) {
    outcome = 'correct-suspicion-without-proof'
  } else {
    outcome = 'house-of-silence'
  }
  return {
    outcome,
    disposition: input.disposition,
    correctCulprit,
    proof,
    corroboratedCircuitCount,
    missingProof,
    personalEndingIds: Object.fromEntries(Object.values(state.characters).map(character => [
      character.guestId,
      personalEnding(character, input.disposition),
    ])),
  }
}

export function legalChoices(state: NarrativeCaseState, guestId: string, threadId: string): StoryChoice[] {
  return getLegalBeat(state, guestId, threadId)?.choices ?? []
}

export function setDisposition(state: NarrativeCaseState, disposition: ArchiveDisposition): NarrativeCaseState {
  const next = structuredClone(state)
  next.disposition = disposition
  updateAct(next)
  return next
}

export function canonicalEvidenceIdsFor(archetypeId: ArchetypeId) {
  return EVIDENCE_BY_ARCHETYPE[archetypeId].map(evidence => evidence.id)
}
