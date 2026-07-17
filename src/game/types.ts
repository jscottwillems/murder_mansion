// Shared types for Murder Mansion

export type RoomId =
  | 'study' | 'gallery' | 'conservatory'
  | 'kitchen' | 'dining' | 'ballroom'
  | 'cellar' | 'library' | 'suite'

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
  archetypeId: string
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
  evidenceId: string | null
  evidenceInvestigated: boolean
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

export interface TranscriptEntry {
  atMin: number
  q: string
  a: string
}

export type QuestionTopic =
  | 'timeline' | 'suspicion' | 'intel' | 'alibi'
  | 'room' | 'pressure' | 'social' | 'victim'

export interface QuestionOption {
  topic: QuestionTopic
  label: string
}

export interface InterviewState {
  guestId: string
  questions: QuestionOption[]
  lastQuestion: string
  lastAnswer: string
  thinking: boolean
}

export interface LogLine {
  id: string
  atMin: number
  text: string
  tone: 'info' | 'rumor' | 'danger' | 'system'
}

export type Phase =
  | 'title' | 'howto' | 'settings' | 'playing'
  | 'interview' | 'journal' | 'accuse' | 'paused'
  | 'won' | 'lost'

export interface Settings {
  director: 'builtin' | 'llm'
  llmProvider: 'groq' | 'ollama' | 'custom'
  llmBaseUrl: string
  llmApiKey: string
  llmModel: string
  speed: number            // game minutes per real second
  volume: number           // 0..1
  muted: boolean
}

export interface GuestSummary {
  id: string
  name: string
  archetypeId: string
  archetypeName: string
  color: string
  alive: boolean
  interviewed: boolean
  visible: boolean
  recentlyActive: boolean
  suspicion: number        // 0..1
  roomName: string | null  // only if visible
}

export interface EndInfo {
  outcome: 'win' | 'wrong' | 'sunrise' | 'wiped'
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
  transcripts: Record<string, TranscriptEntry[]>
  log: LogLine[]
  interview: InterviewState | null
  interactHint: string | null
  settings: Settings
  endInfo: EndInfo | null
  llmActive: boolean
  caseSeed: number
  // positions for the minimap (only what the player legitimately knows)
  minimap: {
    playerRoom: RoomId
    visibleGuestRooms: { id: string; color: string; room: RoomId }[]
    bodyRooms: RoomId[]
  }
}
