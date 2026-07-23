// Shared types for Murder Mansion
import type {
  ArchiveDisposition,
  CaseOutcome,
  ChoiceIntent,
  ThreadStatus,
} from './narrative/types'

export type RoomId =
  | 'study' | 'gallery' | 'conservatory'
  | 'kitchen' | 'dining' | 'ballroom'
  | 'cellar' | 'library' | 'suite'

export type ArchetypeId =
  | 'columnist' | 'surgeon' | 'curator' | 'magician' | 'correspondent'
  | 'accountant' | 'vocalist' | 'antiquarian' | 'chauffeur' | 'debutante'

/** Canonical scene-trace IDs. Keep this list in lockstep with SCENE_EVIDENCE. */
export const EVIDENCE_IDS = [
  'ink-fiber', 'antiseptic', 'fine-earth', 'black-wool', 'metal-polish',
  'floral-perfume', 'face-powder', 'blade-oil', 'wax-resin', 'torn-note',
] as const

export type EvidenceId = (typeof EVIDENCE_IDS)[number]

export type GuestState = 'idle' | 'walk' | 'talk' | 'rest' | 'dead'

export interface Rumor {
  id: string
  aboutId: string          // guest the rumor concerns
  room: RoomId             // room they were allegedly seen in
  atMin: number            // alleged time (game minutes since midnight)
  text: string             // human-readable phrasing
  reliable: boolean        // false = mistaken / planted
  sourceId: string         // who originally produced it
  heardAtMin: number       // when the current holder learned it
}

export interface Guest {
  id: string
  name: string
  archetypeId: ArchetypeId
  color: string            // hex css, e.g. '#c9a227'
  colorNum: number         // three.js numeric color
  room: RoomId
  x: number
  z: number
  tx: number               // movement target
  tz: number
  state: GuestState
  alive: boolean
  isKiller: boolean
  knowledge: Rumor[]
  talkedWith: string[]     // names of guests they have conversed with
  interviewed: boolean
  lastSeenMin: number      // last time player shared a room with them
  talkPartnerId: string | null
  talkUntilMin: number
  nextDecisionMin: number
  killCooldownUntilMin: number
  bodyFound: boolean
  evidenceId: EvidenceId | null
  evidenceInvestigated: boolean
  evidenceIds: EvidenceId[]
  revealedEvidenceIds: EvidenceId[]
  diedAtMin: number
  deathRoom: RoomId | null
}

export type LeadKind = 'rumor' | 'interview' | 'discovery' | 'evidence' | 'system'

export interface Lead {
  id: string
  atMin: number
  kind: LeadKind
  source: string
  text: string
}

export interface CollectedEvidence {
  id: string
  evidenceId: EvidenceId
  label: string
  description: string
  candidateNames: string[]
  source: string
  atMin: number
}

export interface TranscriptEntry {
  atMin: number
  q: string
  a: string
}

export type QuestionTopic =
  | 'timeline' | 'suspicion' | 'intel' | 'alibi'
  | 'room' | 'pressure' | 'social' | 'victim'
  | 'last_seen' | 'connection' | 'motive' | 'survival' | 'next_victim'
  | 'follow_up'

export type ConversationEmotion =
  | 'neutral' | 'suspicious' | 'worried'
  | 'angry' | 'thoughtful' | 'surprised'

export interface QuestionOption {
  id: string
  topic: QuestionTopic
  label: string
  kind: 'root' | 'branch'
  intent?: ChoiceIntent
  disabled?: boolean
}

export interface ThreadConclusion {
  kind: 'evidence' | 'cleared' | 'information' | 'withdrawn' | 'paused' | 'closed' | 'rerouted' | 'resolved'
  summary: string
  evidenceId?: EvidenceId
}

export interface InterviewState {
  guestId: string
  questions: QuestionOption[]
  lastQuestion: string
  lastAnswer: string
  emotion: ConversationEmotion
  thinking: boolean
  concluded: boolean
  conclusion: ThreadConclusion | null
  activeThreadId: string | null
  threadStatus: 'topics' | ThreadStatus
  responseSource?: 'builtin' | 'llm' | 'repair' | 'fallback'
  trust: number
  pressure: number
  personalEndingTitle?: string
}

export interface LogLine {
  id: string
  atMin: number
  text: string
  tone: 'info' | 'rumor' | 'danger' | 'system'
}

export type Phase =
  | 'title' | 'setup' | 'howto' | 'settings' | 'playing'
  | 'interview' | 'journal' | 'accuse' | 'paused'
  | 'won' | 'lost'

export interface Settings {
  director: 'builtin' | 'llm'
  llmProvider: 'groq' | 'ollama' | 'custom'
  llmBaseUrl: string
  llmApiKey: string
  llmModel: string
  speed: number            // game minutes per real second
  bgmVolume: number        // 0..1
  sfxVolume: number        // 0..1
  muted: boolean
}

export interface GuestSummary {
  id: string
  name: string
  archetypeId: ArchetypeId
  archetypeName: string
  color: string
  alive: boolean
  interviewed: boolean
  visible: boolean
  recentlyActive: boolean
  suspicion: number        // 0..1
  roomName: string | null  // only if visible
  evidenceIds: EvidenceId[]
  revealedEvidenceIds: EvidenceId[]
  narrative: {
    trust: number
    pressure: number
    threadCounts: Partial<Record<ThreadStatus, number>>
    personalEndingTitle?: string
  } | null
}

export interface EvidenceDiscoveryNotice {
  id: number
  guestName: string
  evidenceId: EvidenceId
  label: string
  kind: 'association' | 'physical'
}

export interface EndInfo {
  outcome: 'win' | 'wrong' | 'sunrise' | 'wiped'
  narrativeOutcome: CaseOutcome
  disposition: ArchiveDisposition
  proof: Record<'material' | 'opportunity' | 'deception-motive', boolean>
  missingProof: Array<'material' | 'opportunity' | 'deception-motive'>
  circuitCount: number
  personalEpilogues: Array<{ guestName: string; title: string; text: string }>
  killerName: string
  killerArchetype: string
  accusedName?: string
  stats: { interviews: number; leads: number; timeMin: number; bodiesFound: number }
}

export interface Snapshot {
  phase: Phase
  clockMin: number
  clockText: string
  playerRoomId: RoomId
  playerRoomName: string
  playerRoomBrief: string
  aliveCount: number
  bodiesFound: number
  guests: GuestSummary[]
  leads: Lead[]
  evidence: CollectedEvidence[]
  transcripts: Record<string, TranscriptEntry[]>
  log: LogLine[]
  interview: InterviewState | null
  evidenceDiscovery: EvidenceDiscoveryNotice | null
  interactHint: string | null
  settings: Settings
  endInfo: EndInfo | null
  llmActive: boolean       // true after configured LLM dialogue succeeds
  caseSeed: number
  narrative: {
    act: 0 | 1 | 2 | 3 | 4
    resolvedAssociations: number
    completedCircuits: number
    totalCircuits: number
    recoveredLeads: Array<{
      id: string
      guestId: string
      threadId: string
      guestName: string
      description: string
      resolved: boolean
    }>
  } | null
  // positions for the minimap (only what the player legitimately knows)
  minimap: {
    playerRoom: RoomId
    visibleGuestRooms: { id: string; color: string; room: RoomId }[]
    bodyRooms: RoomId[]
  }
}
