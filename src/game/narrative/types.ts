import type {
  ArchetypeId,
  ConversationEmotion,
  EvidenceId,
  Guest,
  QuestionTopic,
  RoomId,
} from '../types'
import type { RevealMechanism } from '../dialogue/types'

export type RoleMode = 'innocent' | 'killer'
export type StoryOwner = ArchetypeId | 'global'
export type ThreadStatus =
  | 'latent' | 'open' | 'active' | 'paused' | 'rerouted'
  | 'resolved' | 'closed-personal' | 'spent'
export type ChoiceIntent =
  | 'rapport' | 'analyze' | 'challenge' | 'pressure' | 'bargain'
  | 'protect' | 'expose' | 'conceal' | 'test' | 'withdraw'
export type FactSource = 'observed' | 'attributed-rumor' | 'artifact' | 'inferred' | 'confessed' | 'public'
export type ProofCategory = 'material' | 'opportunity' | 'deception-motive' | 'conspiracy'
export type CarrierKind = 'npc' | 'transcript' | 'artifact' | 'confidant' | 'reconstruction' | 'cross-npc'
export type CrossNpcEventType =
  | 'source-protected' | 'source-burned' | 'worker-respected' | 'worker-dismissed'
  | 'collection-seized' | 'authorship-restored' | 'medical-record-sealed'
  | 'ledger-seized' | 'publication-threatened' | 'false-detail-published'
  | 'key-custody-changed' | 'body-discovered' | 'npc-shutdown' | 'countertrap-prepared'
export type CircuitId = 'paper-payments' | 'key-route' | 'performance-presence' | 'material-provenance'
export type CaseOutcome =
  | 'complete-public-exposure' | 'correct-culprit-scandal-sealed'
  | 'counter-trap-prevented-attack' | 'correct-suspicion-without-proof'
  | 'wrong-accusation' | 'house-of-silence'
export type ArchiveDisposition = 'publish' | 'seal' | 'destroy'
export type PersonalEndingTone = 'alliance' | 'truth' | 'compromise' | 'rupture' | 'legacy'

export interface VoiceCard {
  version: 1
  archetypeId: ArchetypeId
  roleName: string
  base: string[]
  trust: string[]
  pressure: string[]
  innocent: string[]
  killer: string[]
  banned: string[]
}

export interface CarrierDefinition {
  id: string
  kind: CarrierKind
  description: string
  seededRoom?: RoomId
  confidant?: 'Celia' | 'June Bell' | 'Lady Vale'
  deathSafe: boolean
  shutdownSafe: boolean
}

export type StoryCondition =
  | { kind: 'flag' | 'not-flag' | 'fact' | 'not-fact'; value: string }
  | { kind: 'trust-at-least' | 'pressure-at-least'; value: number }
  | { kind: 'alive'; value: boolean }
  // Whether this guest is actually tied to a trace this case. Evidence threads
  // surface for every guest once the trace is found, but only the assigned
  // owners resolve into a recorded association; the rest reach a no-reveal
  // dead end. These gate the two mutually exclusive terminal choices.
  | { kind: 'assigned-evidence' | 'not-assigned-evidence'; value: EvidenceId }

export interface TrustEffect {
  kind: 'trust'
  target: ArchetypeId
  delta: number
}

export interface PressureEffect {
  kind: 'pressure'
  target: ArchetypeId
  delta: number
}

export interface FlagEffect {
  kind: 'set-flag' | 'clear-flag'
  flag: string
}

export interface EmitFactEffect {
  kind: 'emit-fact'
  factId: string
  source: FactSource
}

export interface RevealEvidenceEffect {
  kind: 'reveal-evidence'
  archetypeId: ArchetypeId
  evidenceId: EvidenceId
  factId: string
}

export interface ThreadEffect {
  kind: 'thread-status'
  threadId: string
  status: ThreadStatus
}

export interface QueueEventEffect {
  kind: 'queue-event'
  eventType: CrossNpcEventType
}

export interface EndingScoreEffect {
  kind: 'ending-score'
  archetypeId: ArchetypeId
  endingId: string
  delta: number
}

export type StoryEffect =
  | TrustEffect | PressureEffect | FlagEffect | EmitFactEffect
  | RevealEvidenceEffect | ThreadEffect | QueueEventEffect | EndingScoreEffect

/** A bespoke conclusion attached to a thread's terminal choice. */
export interface ThreadClosing {
  line: string
  emotion: ConversationEmotion
  summary?: string
}

export interface StoryChoice {
  id: string
  label: string
  intent: ChoiceIntent
  requires: StoryCondition[]
  effects: StoryEffect[]
  nextNodeId: string | null
  /** Present only on terminal choices that end the thread on a distinct note. */
  closing?: ThreadClosing
}

export interface StoryNode {
  id: string
  threadId: string
  owner: StoryOwner
  phase: 'notice' | 'context' | 'test' | 'resolution' | 'private'
  text: string
  emotion: ConversationEmotion
  choices: StoryChoice[]
  fallbackCarrierIds: string[]
  deathSafe: boolean
}

export interface NarrativeThread {
  id: string
  owner: ArchetypeId
  kind: 'private-intel'
  rootLabel: string
  topic: QuestionTopic
  startNodeId: string
  nodeIds: string[]
  fallbackCarrierIds: string[]
  reopenFactIds: string[]
}

export interface EvidenceThreadDefinition extends Omit<NarrativeThread, 'kind'> {
  kind: 'evidence'
  evidenceId: EvidenceId
  revealFactId: string
  concreteReveal: string
  /** How the association was established, used to phrase the reveal summary. */
  revealMechanism?: RevealMechanism
}

export interface PersonalEndingDefinition {
  id: string
  title: string
  tone: PersonalEndingTone
  minTrust: number
  maxPressure: number
  requiresFlags: string[]
  forbidsFlags: string[]
  disposition?: ArchiveDisposition
  legacyCarrierId: string
  text: string
}

export interface ArchetypeDossier {
  id: ArchetypeId
  title: string
  publicMask: string
  privateNeed: string
  secret: string
  vulnerability: string
  relationships: ArchetypeId[]
  voice: VoiceCard
  trustTell: string
  pressureTell: string
  innocentOverlay: string
  killerOverlay: string
  evidenceThreads: Record<EvidenceId, EvidenceThreadDefinition | undefined>
  /**
   * "Get to know them" rapport threads shown before any evidence is uncovered.
   * Each archetype exposes a few; they are replaced in the topic picker once
   * evidence-reveal threads unlock.
   */
  regularThreads: NarrativeThread[]
  /**
   * Pool of lightweight, single-beat personal "asides" used to keep the
   * interview menu full and varied once evidence threads appear. A seed-shuffled
   * subset surfaces per case, so the personal filler differs every run. Asides
   * only nudge trust/pressure — they never touch the evidence graph or scoring.
   */
  bonusPersonalThreads: NarrativeThread[]
  carriers: CarrierDefinition[]
  endings: PersonalEndingDefinition[]
}

export interface FactRecord {
  id: string
  proposition: string
  source: FactSource
  carrierId: string
  acquiredAtMin: number
  proof: ProofCategory
  suspectId?: string
  survivesCarrierDeath: boolean
}

export interface CoverTimeline {
  preAnchor: { room: RoomId; timeBand: string }
  privateInterval: { room: RoomId; timeBand: string; claimedWitnessId: string }
  reentry: { room: RoomId; timeBand: string; witnessId: string }
  weaknessFactId: string
}

export interface CharacterNarrativeState {
  guestId: string
  archetypeId: ArchetypeId
  displayName: string
  roleMode: RoleMode
  alive: boolean
  discovered: boolean
  trust: number
  pressure: number
  flags: string[]
  knownFactIds: string[]
  threadStatuses: Record<string, ThreadStatus>
  currentNodeIds: Record<string, string | null>
  endingScores: Record<string, number>
  /**
   * The evidence traces this guest can be associated with this case, in the
   * per-case shuffled order. Index 0 carries the opportunity (route) proof and
   * index 1 carries the deception-motive proof when their reveal threads land.
   */
  assignedEvidenceIds: EvidenceId[]
  cover?: CoverTimeline
}

export interface CircuitState {
  id: CircuitId
  ownerIds: ArchetypeId[]
  resolvedOwners: ArchetypeId[]
  completed: boolean
}

export interface CrossNpcEvent {
  id: string
  type: CrossNpcEventType
  sourceArchetypeId: ArchetypeId
  recipients: ArchetypeId[]
  processed: boolean
}

export interface NarrativeCaseState {
  schemaVersion: 1
  caseSeed: string
  storyId: string
  clockMin: number
  act: 0 | 1 | 2 | 3 | 4
  killerGuestId: string
  openingVictimId: string | null
  characters: Record<string, CharacterNarrativeState>
  facts: Record<string, FactRecord>
  collectedEvidenceIds: EvidenceId[]
  revealedAssociations: string[]
  flags: string[]
  circuits: Record<CircuitId, CircuitState>
  queuedEvents: CrossNpcEvent[]
  counterTrapsPrepared: string[]
  counterTrapSucceeded: boolean
  disposition: ArchiveDisposition | null
}

export interface CaseInitialization {
  caseSeed: string | number
  guests: readonly Guest[]
  openingVictimId?: string | null
}

export interface LegalBeat {
  node: StoryNode
  choices: StoryChoice[]
}

export interface CaseEndingInput {
  accusedGuestId: string | null
  suspectedGuestId: string | null
  disposition: ArchiveDisposition
  attackPrevented: boolean
  trapCaughtGuestId: string | null
}

export interface CaseEndingEvaluation {
  outcome: CaseOutcome
  disposition: ArchiveDisposition
  correctCulprit: boolean
  proof: Record<Exclude<ProofCategory, 'conspiracy'>, boolean>
  corroboratedCircuitCount: number
  missingProof: Exclude<ProofCategory, 'conspiracy'>[]
  personalEndingIds: Record<string, string>
}
