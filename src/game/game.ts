// Game orchestrator: loop, input, phases, interviews, accusation, endings,
// optional LLM dialogue hookup, and the pub/sub store bridge for React.
import type {
  CollectedEvidence, ConversationEmotion, EndInfo, EvidenceId, Guest, InterviewState, Lead, LogLine, Phase,
  QuestionOption, RoomId, Settings, Snapshot, TranscriptEntry,
} from './types'
import { ARCHETYPES, EVIDENCE_BY_ID, ROOMS, ROOM_BY_ID, ROOM_HALF, roomAt, roomCenter, roomOfPoint, canOccupy, fmtTime, NIGHT_LENGTH_MIN } from './data'
import { Simulation } from './sim'
import { MansionScene } from './world'
import { Soundtrack } from './audio'
import { BeatVisibilityGuard, renderLegalBeat } from './llmBeatRenderer'
import type { BeatPacketContext, BeatPresentation } from './llmPromptBuilder'
import { DOSSIERS, NARRATIVE_THREADS } from './narrative/dossierStoryData'
import { escalationTier, pickMoodGreeting } from './narrative/escalation'
import {
  applyStoryChoice,
  evaluateCaseEnding,
  getLegalBeat,
  initializeNarrativeCase,
  markCharacterUnavailable,
  resumePausedThread,
  setDisposition,
  setNarrativeClock,
} from './narrative/storyEngine'
import type {
  ArchetypeDossier,
  ArchiveDisposition,
  CaseEndingEvaluation,
  CharacterNarrativeState,
  LegalBeat,
  NarrativeCaseState,
  NarrativeThread,
  StoryChoice,
  ThreadStatus,
} from './narrative/types'
import type { RevealMechanism } from './dialogue/types'

const SETTINGS_KEY = 'murder-mansion-settings'
const PLAYER_SPEED = 4.4
const ACTOR_RADIUS = 0.42

/** Plain third-person phrasing of how an evidence association was established. */
const MECHANISM_SUMMARY: Record<RevealMechanism, string> = {
  comparison: 'the two samples match side by side',
  reconstruction: 'the sequence only fits one way once you walk it back',
  contradiction: 'their own account can’t be squared with it',
  corroboration: 'a second, independent source backs it up',
  bait: 'they corrected a false detail only the knowing would catch',
  chronology: 'the timing pins it against the clock',
  custody: 'the chain of hands that touched it holds',
}

function archetypeOf(guest: Guest) {
  const archetype = ARCHETYPES.find(item => item.id === guest.archetypeId)
  if (!archetype) throw new Error(`Unknown archetype ${guest.archetypeId}`)
  return archetype
}

declare global {
  interface Window {
    murderMansionGame?: Game
    render_game_to_text?: () => string
    advanceTime?: (ms: number) => void
  }
}

const DEFAULT_SETTINGS: Settings = {
  director: 'builtin',
  llmProvider: 'groq',
  llmBaseUrl: 'https://api.groq.com/openai/v1',
  llmApiKey: '',
  llmModel: 'openai/gpt-oss-20b',
  speed: 1,
  bgmVolume: 0.7,
  sfxVolume: 0.7,
  muted: false,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings> & { volume?: number }
      // Configurations saved before provider presets existed are custom endpoints.
      if (!saved.llmProvider && saved.llmBaseUrl) saved.llmProvider = 'custom'
      // Migrate the former single volume control into both independent buses.
      if (typeof saved.volume === 'number') {
        if (saved.bgmVolume === undefined) saved.bgmVolume = saved.volume
        if (saved.sfxVolume === undefined) saved.sfxVolume = saved.volume
        delete saved.volume
      }
      // Groq's former default supports JSON Object Mode but not the strict
      // schema required by full interview plans. Migrate that preset to Groq's
      // supported structured-output successor while preserving custom models.
      if (saved.llmProvider === 'groq' && saved.llmModel === 'llama-3.1-8b-instant') {
        saved.llmModel = 'openai/gpt-oss-20b'
      }
      return { ...DEFAULT_SETTINGS, ...saved }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

export class Game {
  private world: MansionScene
  private audio = new Soundtrack()
  private sim: Simulation | null = null
  private phase: Phase = 'title'
  private settingsReturn: 'title' | 'paused' = 'title'
  private settings: Settings = loadSettings()
  private keys = new Set<string>()
  private px = 0
  private pz = 0
  private playerRoom: RoomId = 'dining'
  private guestRevealOpacity = 1
  private playerWalking = false
  private playerEncounteredBodyIds = new Set<string>()
  private leads: Lead[] = []
  private evidence: CollectedEvidence[] = []
  private logLines: LogLine[] = []
  private transcripts: Record<string, TranscriptEntry[]> = {}
  private interview: InterviewState | null = null
  private evidenceDiscovery: Snapshot['evidenceDiscovery'] = null
  private evidenceDiscoveryN = 0
  private evidenceDiscoveryTimer: ReturnType<typeof setTimeout> | null = null
  private endInfo: EndInfo | null = null
  private interviewsHeld = 0
  private narrative: NarrativeCaseState | null = null
  private beatRevision = 0
  private beatVisibility = new BeatVisibilityGuard()
  private recentNpcLines: string[] = []
  private recentOptionLabels: string[] = []
  private interviewRequestN = 0
  private llmLive = false
  private lastTs = 0
  private emitTimer = 0
  private leadN = 0
  private logN = 0
  private snap: Snapshot
  private listeners = new Set<() => void>()
  private disposed = false

  private llmConfigured(): boolean {
    return this.settings.director === 'llm'
      && (this.settings.llmProvider === 'ollama' || !!this.settings.llmApiKey)
  }

  private personalEndingTitle(character: CharacterNarrativeState): string | undefined {
    if (!character.flags.includes(`${character.archetypeId}:private-addressed`)) return undefined
    const ending = [...DOSSIERS[character.archetypeId].endings].sort((left, right) =>
      (character.endingScores[right.id] ?? 0) - (character.endingScores[left.id] ?? 0),
    )[0]
    return ending?.title
  }

  private recoveredNarrativeLeads(): Snapshot['narrative'] extends infer T
    ? T extends { recoveredLeads: infer R } ? R : never
    : never {
    if (!this.narrative) return []
    const recovered: Array<{
      id: string
      guestId: string
      threadId: string
      guestName: string
      description: string
      resolved: boolean
    }> = []
    for (const character of Object.values(this.narrative.characters)) {
      if (!character.discovered) continue
      const dossier = DOSSIERS[character.archetypeId]
      const threads = [
        ...Object.values(dossier.evidenceThreads).filter((thread): thread is NonNullable<typeof thread> => Boolean(thread)),
        ...dossier.regularThreads,
      ]
      for (const thread of threads) {
        if (thread.kind !== 'evidence') continue
        for (const carrierId of thread.fallbackCarrierIds) {
          const carrier = dossier.carriers.find(candidate => candidate.id === carrierId)
          if (carrier && this.narrative.flags.includes(`carrier-active:${carrier.id}`)) {
            recovered.push({
              id: carrier.id,
              guestId: character.guestId,
              threadId: thread.id,
              guestName: character.displayName,
              description: carrier.description,
              resolved: character.threadStatuses[thread.id] === 'resolved',
            })
          }
        }
      }
    }
    return recovered
  }

  constructor(container: HTMLElement) {
    this.world = new MansionScene(container)
    this.world.onThunder = (i) => this.audio.thunder(i)
    this.world.addActor('player', 0x8a7a5a, 'Detective', true)
    this.world.focusRoom(this.playerRoom)
    this.audio.setRoomAmbience(this.playerRoom)
    this.audio.setMuted(this.settings.muted)
    this.audio.setBgmVolume(this.settings.bgmVolume)
    this.audio.setSfxVolume(this.settings.sfxVolume)
    window.murderMansionGame = this
    window.render_game_to_text = this.renderGameToText
    window.advanceTime = this.advanceTime

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.snap = this.buildSnapshot()
    requestAnimationFrame(this.frame)
  }

  dispose() {
    this.disposed = true
    if (this.evidenceDiscoveryTimer) clearTimeout(this.evidenceDiscoveryTimer)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    if (window.murderMansionGame === this) {
      delete window.murderMansionGame
    }
    if (window.render_game_to_text === this.renderGameToText) {
      delete window.render_game_to_text
    }
    if (window.advanceTime === this.advanceTime) {
      delete window.advanceTime
    }
    this.world.dispose()
    this.audio.dispose()
  }

  // ------------------------------------------------------------- store bridge

  subscribe = (cb: () => void) => {
    this.listeners.add(cb)
    return () => { this.listeners.delete(cb) }
  }

  getSnapshot = () => this.snap

  setDialogueTyping = (active: boolean, restart = false) => {
    this.audio.setDialogueTyping(active, restart)
  }

  private advanceTime = (ms: number) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)))
    for (let i = 0; i < steps; i++) {
      const dt = 1 / 60
      if (this.phase === 'playing' && this.sim) this.stepPlaying(dt)
      else {
        this.playerWalking = false
      }
      this.syncActors()
      this.world.update(dt)
      this.audio.setPlayerWalking(this.playerWalking)
      this.audio.onGameMinute(this.sim?.clockMin ?? 0, this.settings.speed, this.timeIsRunning())
    }
    this.emit()
  }

  private emit() {
    this.snap = this.buildSnapshot()
    for (const cb of this.listeners) cb()
  }

  private buildSnapshot(): Snapshot {
    const sim = this.sim
    const guests = sim ? sim.guests.map(g => {
      const visible = g.alive && g.room === this.playerRoom
      const character = this.narrative?.characters[g.id]
      const threadCounts = character
        ? Object.values(character.threadStatuses).reduce<Partial<Record<ThreadStatus, number>>>((counts, status) => {
            counts[status] = (counts[status] ?? 0) + 1
            return counts
          }, {})
        : {}
      return {
        id: g.id,
        name: g.name,
        archetypeId: g.archetypeId,
        archetypeName: archetypeOf(g).name,
        color: g.color,
        alive: g.alive,
        interviewed: g.interviewed,
        visible,
        recentlyActive: g.alive && g.lastSeenMin > -100 && sim.clockMin - g.lastSeenMin < 30,
        suspicion: Math.min(1, (sim.suspicion[g.id] ?? 0) / sim.maxSuspicion()),
        roomName: visible ? ROOM_BY_ID[g.room].name : null,
        evidenceIds: g.evidenceIds,
        revealedEvidenceIds: g.revealedEvidenceIds,
        narrative: character ? {
          trust: character.trust,
          pressure: character.pressure,
          threadCounts,
          personalEndingTitle: this.personalEndingTitle(character),
        } : null,
      }
    }) : []
    const room = ROOM_BY_ID[this.playerRoom]
    return {
      phase: this.phase,
      clockMin: sim?.clockMin ?? 0,
      clockText: fmtTime(sim?.clockMin ?? 0),
      playerRoomId: this.playerRoom,
      playerRoomName: room.name,
      playerRoomBrief: room.brief,
      aliveCount: sim?.aliveCount() ?? 10,
      bodiesFound: sim?.bodiesFound() ?? 0,
      guests,
      leads: this.leads,
      evidence: this.evidence.map(item => {
        if (!sim) return item
        const owners = sim.guests.filter(g => g.evidenceIds.includes(item.evidenceId))
        const knownNames = owners.filter(g => g.revealedEvidenceIds.includes(item.evidenceId)).map(g => g.name)
        return {
          ...item,
          candidateNames: [
            ...knownNames,
            ...owners.slice(knownNames.length).map((_, index) => `Unknown source ${index + 1}`),
          ],
        }
      }),
      transcripts: this.transcripts,
      log: this.logLines.slice(-6),
      interview: this.interview,
      evidenceDiscovery: this.evidenceDiscovery,
      interactHint: this.computeHint(),
      settings: this.settings,
      endInfo: this.endInfo,
      llmActive: this.llmLive,
      caseSeed: sim?.seed ?? 0,
      narrative: this.narrative ? {
        act: this.narrative.act,
        resolvedAssociations: this.narrative.revealedAssociations.length,
        completedCircuits: Object.values(this.narrative.circuits).filter(circuit => circuit.completed).length,
        totalCircuits: Object.keys(this.narrative.circuits).length,
        recoveredLeads: this.recoveredNarrativeLeads(),
      } : null,
      minimap: {
        playerRoom: this.playerRoom,
        visibleGuestRooms: sim
          ? sim.guestsInRoom(this.playerRoom).map(g => ({ id: g.id, color: g.color, room: g.room }))
          : [],
        bodyRooms: sim ? sim.guests.filter(g => !g.alive && g.bodyFound && g.deathRoom).map(g => g.deathRoom!) : [],
      },
    }
  }

  // ------------------------------------------------------------- input

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if (k === 'tab') e.preventDefault()
    this.audio.ensure()

    if (k === 'escape') {
      this.handleEscape()
      return
    }
    if ((k === 'j' || k === 'tab')) {
      if (this.phase === 'playing') this.setPhase('journal')
      else if (this.phase === 'journal') this.setPhase('playing')
      return
    }
    if (k === 'e' && this.phase === 'playing') {
      const body = this.nearestBody()
      if (body) {
        this.investigateBody(body)
        return
      }
      const g = this.nearestGuest()
      if (g) this.startInterview(g.id)
      return
    }
    this.keys.add(k)
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  private handleEscape() {
    switch (this.phase) {
      case 'playing': this.setPhase('paused'); break
      case 'paused': this.setPhase('playing'); break
      case 'journal': this.setPhase('playing'); break
      case 'accuse': this.setPhase('playing'); break
      case 'interview': this.endInterview(); break
      case 'settings': this.setPhase(this.settingsReturn === 'title' ? 'title' : 'paused'); break
      case 'howto': this.setPhase('title'); break
      case 'title':
      case 'setup':
      case 'won':
      case 'lost':
        break
      default: {
        const exhaustive: never = this.phase
        throw new Error(`Unhandled phase: ${exhaustive}`)
      }
    }
  }

  private nearestGuest(): Guest | null {
    if (!this.sim) return null
    let best: Guest | null = null
    let bestD = 3.4
    for (const g of this.sim.guestsInRoom(this.playerRoom)) {
      const d = Math.hypot(g.x - this.px, g.z - this.pz)
      if (d < bestD) { bestD = d; best = g }
    }
    return best
  }

  private nearestBody(): Guest | null {
    if (!this.sim) return null
    let best: Guest | null = null
    let bestD = 3.4
    for (const g of this.sim.guests) {
      if (g.alive || !g.bodyFound || g.deathRoom !== this.playerRoom || g.evidenceInvestigated) continue
      const d = Math.hypot(g.x - this.px, g.z - this.pz)
      if (d < bestD) { bestD = d; best = g }
    }
    return best
  }

  private investigateBody(body: Guest) {
    if (!body.evidenceId || body.evidenceInvestigated) return
    const evidence = EVIDENCE_BY_ID[body.evidenceId]
    if (!evidence) return
    body.evidenceInvestigated = true
    this.syncNarrativeBodyDiscovery(body)
    this.world.faceActorAt('player', body.x, body.z)
    this.world.playActorAction('player', 'investigate')
    this.world.replaceBodyWithOutline(body.id, body.x, body.z)
    const owners = this.sim?.guests.filter(g => g.evidenceIds.includes(evidence.id)) ?? []
    const knownNames = owners.filter(g => g.revealedEvidenceIds.includes(evidence.id)).map(g => g.name)
    const candidateNames = [
      ...knownNames,
      ...owners.slice(knownNames.length).map((_, index) => `Unknown source ${index + 1}`),
    ]
    const candidates = candidateNames.join(', ')
    const text = `${evidence.label}: ${evidence.description} Possible sources: ${candidates}.`
    this.evidence = [...this.evidence, {
      id: `evidence-${body.id}`,
      evidenceId: evidence.id,
      label: evidence.label,
      description: evidence.description,
      candidateNames,
      source: `${body.name} — ${ROOM_BY_ID[body.deathRoom!].name}`,
      atMin: this.sim?.clockMin ?? 0,
    }]
    this.pushLead('evidence', `Scene: ${body.name}`, text)
    this.audio.evidenceDiscovered()
    this.showEvidenceDiscovery(evidence.id, evidence.label, body.name, 'physical')
    this.pushLog(`Evidence collected — ${evidence.label}. Added to your journal.`, 'info')
  }

  private syncNarrativeBodyDiscovery(body: Guest) {
    if (!this.narrative) return
    const character = this.narrative.characters[body.id]
    if (!character) return
    const wasUnavailable = !character.alive
    if (!wasUnavailable) this.narrative = markCharacterUnavailable(this.narrative, body.id, 'death')
    this.narrative.characters[body.id].discovered = true
    if (!wasUnavailable) {
      this.pushLead(
        'discovery',
        body.name,
        `Recovered records and pre-seeded carriers now preserve unresolved lines from ${body.name}.`,
        true,
      )
    }
  }

  private computeHint(): string | null {
    if (this.phase !== 'playing') return null
    const body = this.nearestBody()
    if (body) return `E — Investigate ${body.name}'s body`
    const g = this.nearestGuest()
    return g ? `E — Interview ${g.name}` : null
  }

  // ------------------------------------------------------------- phase control (UI actions)

  setPhase(p: Phase) {
    this.phase = p
    this.emit()
  }

  startCase() {
    this.audio.ensure()
    const seed = Math.floor(Math.random() * 1e9)
    this.leads = []
    this.evidence = []
    this.logLines = []
    this.transcripts = {}
    this.interview = null
    this.playerEncounteredBodyIds.clear()
    this.evidenceDiscovery = null
    if (this.evidenceDiscoveryTimer) {
      clearTimeout(this.evidenceDiscoveryTimer)
      this.evidenceDiscoveryTimer = null
    }
    this.endInfo = null
    this.interviewsHeld = 0
    this.narrative = null
    this.beatRevision = 0
    this.beatVisibility.invalidate()
    this.recentNpcLines = []
    this.recentOptionLabels = []
    this.interviewRequestN++

    this.sim = new Simulation(seed, {
      log: (text, tone) => this.pushLog(text, tone),
      lead: (kind, source, text) => this.pushLead(kind, source, text),
      guestDied: (g) => {
        this.world.setActorDead(g.id, g.x, g.z)
        if (this.narrative) this.narrative = markCharacterUnavailable(this.narrative, g.id, 'death')
      },
      bodyDiscovered: (g) => {
        this.world.markBodyRoom(g.deathRoom!)
        this.syncNarrativeBodyDiscovery(g)
      },
      overheard: (_who, text) => this.pushLog(text, 'rumor'),
    })

    this.world.removeAllActors()
    this.world.addActor('player', 0x8a7a5a, 'Detective', true)
    for (const g of this.sim.guests) {
      this.world.addActor(g.id, g.colorNum, g.name, false, g.archetypeId)
    }
    const openingVictim = this.sim.createOpeningCrime()
    this.narrative = initializeNarrativeCase({
      caseSeed: this.sim.seed,
      guests: this.sim.guests,
      openingVictimId: openingVictim.id,
    })
    this.narrative = markCharacterUnavailable(this.narrative, openingVictim.id, 'death')
    this.narrative.characters[openingVictim.id].discovered = true
    this.world.resetRoomLights()

    // player starts in the Dining Hall (center of the mansion)
    this.playerRoom = 'dining'
    // Start south of the banquet collider, facing into the Dining Hall.
    const c = { x: 0, z: 3 }
    this.px = c.x
    this.pz = c.z
    this.world.focusRoom(this.playerRoom)
    this.audio.setRoomAmbience(this.playerRoom)

    const openingRoom = ROOM_BY_ID[openingVictim.deathRoom!].name
    this.pushLog(`${openingVictim.name} was found dead in the ${openingRoom}. You were summoned before the storm cut the roads.`, 'danger')
    this.pushLog('Nine surviving guests remain, and one of them is the murderer. Find the killer before sunrise (6:00 AM).', 'system')
    this.pushLog('WASD to move, E to interview or examine the body, J for the case journal.', 'system')
    this.pushLead('discovery', 'Opening crime', `${openingVictim.name}'s body was discovered in the ${openingRoom} shortly before midnight. This death is why the detective came to the mansion.`)
    this.setPhase('playing')
    this.emit()
  }

  quitToTitle() {
    this.setPhase('title')
  }

  openSettings(from: 'title' | 'paused') {
    this.settingsReturn = from
    this.setPhase('settings')
  }

  closeSettings() {
    this.setPhase(this.settingsReturn === 'title' ? 'title' : 'paused')
  }

  updateSettings(patch: Partial<Settings>) {
    this.settings = { ...this.settings, ...patch }
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)) } catch { /* ignore */ }
    this.audio.setMuted(this.settings.muted)
    this.audio.setBgmVolume(this.settings.bgmVolume)
    this.audio.setSfxVolume(this.settings.sfxVolume)
    if (!this.llmConfigured()) this.llmLive = false
    this.emit()
  }

  // ------------------------------------------------------------- interviews

  startInterview(guestId: string) {
    if (!this.sim || !this.narrative || this.phase !== 'playing') return
    const g = this.sim.byId(guestId)
    if (!g || !g.alive) return
    this.audio.ensure()
    g.interviewed = true
    this.interviewsHeld++
    const character = this.narrative.characters[g.id]
    const activeThread = Object.entries(character.threadStatuses)
      .find(([, status]) => status === 'active')?.[0] ?? null
    const activeBeat = activeThread ? getLegalBeat(this.narrative, g.id, activeThread) : null
    this.interview = {
      guestId,
      questions: activeBeat ? this.choiceOptions(activeBeat) : this.buildRootQuestions(g),
      lastQuestion: '',
      lastAnswer: `“${this.pickGreet(g)}”`,
      emotion: 'neutral',
      thinking: false,
      concluded: false,
      conclusion: null,
      activeThreadId: activeThread,
      threadStatus: activeThread ? 'active' : 'topics',
      responseSource: 'builtin',
      trust: character.trust,
      pressure: character.pressure,
      personalEndingTitle: this.personalEndingTitle(character),
    }
    this.phase = 'interview'
    this.audio.onGameMinute(this.sim.clockMin, this.settings.speed, false)
    this.emit()
    if (activeBeat && activeThread) this.renderVisibleBeat(g, activeThread, activeBeat, '')
  }

  private pickGreet(g: Guest): string {
    // Tone follows the body count: the same guest greets the detective very
    // differently in the composed first hour than in the desperate small hours.
    const tier = escalationTier(this.sim?.bodiesFound() ?? 0)
    const role = this.narrative?.characters[g.id]?.roleMode ?? 'innocent'
    return pickMoodGreeting(g.archetypeId, tier, role, Math.random)
  }

  /**
   * Evidence types the detective has physically recovered from a body. Reveal
   * threads for a type are only worth asking about once such a trace exists,
   * so this set gates which evidence topics an NPC will engage.
   */
  private discoveredPhysicalEvidenceIds(): Set<EvidenceId> {
    return new Set(this.evidence.map(item => item.evidenceId))
  }

  private buildRootQuestions(g: Guest): QuestionOption[] {
    if (!this.narrative) return []
    const character = this.narrative.characters[g.id]
    const dossier = DOSSIERS[g.archetypeId]
    const discovered = this.discoveredPhysicalEvidenceIds()
    // An evidence reveal thread surfaces for *every* guest once the trace has
    // been recovered from a body — not only the guests tied to it — so the
    // player cannot narrow the field by which NPCs gained new dialogue. Only the
    // tied owners resolve into a recorded association; the rest reach a no-reveal
    // dead end. Until at least one trace is found, guests offer regular rapport
    // threads instead; the moment evidence unlocks, those "get to know them"
    // topics are replaced by the evidence topics for all guests alike.
    const availableEvidence = Object.values(dossier.evidenceThreads)
      .filter((thread): thread is NonNullable<typeof thread> => Boolean(thread))
      .filter(thread => discovered.has(thread.evidenceId))
    const threads = availableEvidence.length > 0
      ? [...availableEvidence, ...this.personalFillThreads(g, dossier, character, availableEvidence.length)]
      : dossier.regularThreads
    return threads.map(thread => {
      const status = character.threadStatuses[thread.id]
      return {
      id: `root:${thread.id}`,
      topic: thread.topic,
      label: status === 'resolved' ? `${thread.rootLabel} — association recorded`
        : status === 'paused' ? `${thread.rootLabel} — resume`
          : status === 'rerouted' ? `${thread.rootLabel} — recovered route`
            : status === 'closed-personal' ? `${thread.rootLabel} — externally rerouted`
              : status === 'spent' ? `${thread.rootLabel} — concluded`
                : thread.rootLabel,
      kind: 'root',
      disabled: status === 'resolved' || status === 'spent',
      }
    })
  }

  /**
   * Once evidence topics appear they no longer replace the personal threads;
   * instead we top the menu up with personal options so it always offers at
   * least a handful of things to ask. The pool (rapport + personal asides) is
   * larger than what is shown and ordered by a per-run, per-guest seed, so the
   * personal filler differs every run while staying stable within a single case.
   */
  private personalFillThreads(
    g: Guest,
    dossier: ArchetypeDossier,
    character: CharacterNarrativeState,
    evidenceCount: number,
  ): NarrativeThread[] {
    const MIN_ROOT_OPTIONS = 4
    const PERSONAL_TARGET = 3
    const isActionable = (thread: NarrativeThread): boolean => {
      const status = character.threadStatuses[thread.id]
      return status === 'open' || status === 'active' || status === 'paused' || status === 'rerouted'
    }
    const pool = [...dossier.regularThreads, ...dossier.bonusPersonalThreads]
    const actionable = this.seededPersonalOrder(pool, g.id).filter(isActionable)
    const want = Math.max(MIN_ROOT_OPTIONS - evidenceCount, PERSONAL_TARGET)
    return actionable.slice(0, want)
  }

  /**
   * Deterministic per-run, per-guest shuffle. The order is fixed for a given
   * case seed and guest, so the personal menu stays stable across a night while
   * varying between playthroughs.
   */
  private seededPersonalOrder<T extends { id: string }>(pool: readonly T[], guestId: string): T[] {
    let state = 2166136261 >>> 0
    const mix = (text: string): void => {
      for (let index = 0; index < text.length; index++) {
        state ^= text.charCodeAt(index)
        state = Math.imul(state, 16777619) >>> 0
      }
    }
    mix(String(this.sim?.seed ?? 0))
    mix(':')
    mix(guestId)
    const next = (): number => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state / 4294967296
    }
    const arr = [...pool]
    for (let index = arr.length - 1; index > 0; index--) {
      const swap = Math.floor(next() * (index + 1))
      ;[arr[index], arr[swap]] = [arr[swap], arr[index]]
    }
    return arr
  }

  returnToInterviewTopics() {
    if (!this.interview || !this.sim) return
    const g = this.sim.byId(this.interview.guestId)
    if (!g) return
    this.beatVisibility.invalidate()
    this.interviewRequestN++
    this.interview = {
      ...this.interview,
      activeThreadId: null,
      threadStatus: 'topics',
      concluded: false,
      conclusion: null,
      questions: this.buildRootQuestions(g),
    }
    this.emit()
  }

  private choiceOptions(beat: LegalBeat, presentation?: BeatPresentation): QuestionOption[] {
    return beat.choices.map(choice => ({
      id: choice.id,
      topic: NARRATIVE_THREADS[beat.node.threadId]?.topic ?? 'follow_up',
      label: presentation?.options.find(option => option.choiceId === choice.id)?.label ?? choice.label,
      kind: 'branch',
      intent: choice.intent,
    }))
  }

  ask(questionId: string) {
    if (!this.sim || !this.narrative || !this.interview) return
    const g = this.sim.byId(this.interview.guestId)
    if (!g) return
    const q = this.interview.questions.find(option => option.id === questionId)
    if (!q || q.disabled) return
    if (q.kind === 'root') {
      const threadId = questionId.slice('root:'.length)
      const thread = NARRATIVE_THREADS[threadId]
      if (thread?.kind === 'evidence' && !this.discoveredPhysicalEvidenceIds().has(thread.evidenceId)) return
      const status = this.narrative.characters[g.id].threadStatuses[threadId]
      if (status === 'paused') this.narrative = resumePausedThread(this.narrative, g.id, threadId)
      const beat = getLegalBeat(this.narrative, g.id, threadId)
      if (beat) this.renderVisibleBeat(g, threadId, beat, q.label)
      return
    }
    const threadId = this.interview.activeThreadId
    if (!threadId) return
    const before = this.narrative
    const beforeAssociations = new Set(before.revealedAssociations)
    const selected = getLegalBeat(before, g.id, threadId)?.choices.find(choice => choice.id === questionId)
    if (!selected) return
    this.beatVisibility.invalidate()
    this.interviewRequestN++
    this.narrative = applyStoryChoice(before, g.id, threadId, selected.id)
    const statusAfterChoice = this.narrative.characters[g.id].threadStatuses[threadId]
    if (statusAfterChoice === 'closed-personal') {
      this.narrative = markCharacterUnavailable(this.narrative, g.id, 'shutdown')
    }
    for (const association of this.narrative.revealedAssociations) {
      if (beforeAssociations.has(association)) continue
      const [archetypeId, evidenceId] = association.split(':')
      if (archetypeId === g.archetypeId && EVIDENCE_BY_ID[evidenceId as EvidenceId]) {
        this.revealGuestEvidence(g, evidenceId as EvidenceId)
      }
    }
    const nextBeat = getLegalBeat(this.narrative, g.id, threadId)
    if (nextBeat) {
      this.renderVisibleBeat(g, threadId, nextBeat, q.label)
      return
    }
    const status = this.narrative.characters[g.id].threadStatuses[threadId]
    this.finishNarrativeThread(g, threadId, selected, status, q.label)
  }

  private renderVisibleBeat(g: Guest, threadId: string, beat: LegalBeat, questionLabel: string) {
    if (!this.narrative || !this.interview) return
    const revision = ++this.beatRevision
    const beatKey = this.beatVisibility.show(g.id, threadId, beat.node.id, revision)
    const character = this.narrative.characters[g.id]
    const authored: BeatPresentation = {
      npcLine: beat.node.text,
      emotion: beat.node.emotion,
      options: beat.choices.map(choice => ({ choiceId: choice.id, label: choice.label })),
    }
    const context = this.beatPacketContext(beat, revision)
    this.interview = {
      ...this.interview,
      activeThreadId: threadId,
      threadStatus: character.threadStatuses[threadId],
      lastQuestion: questionLabel,
      lastAnswer: `“${authored.npcLine}”`,
      emotion: authored.emotion,
      questions: this.choiceOptions(beat, authored),
      thinking: false,
      concluded: authored.options.length === 0,
      conclusion: authored.options.length === 0
        ? this.conclusionFor(g, threadId, character.threadStatuses[threadId])
        : null,
      responseSource: 'builtin',
      trust: character.trust,
      pressure: character.pressure,
      personalEndingTitle: this.personalEndingTitle(character),
    }
    this.recordTranscript(g, questionLabel, authored.npcLine)
    this.rememberPresentation(authored)
    this.emit()
    if (!this.llmConfigured()) return
    const stateAtRequest = this.narrative
    void renderLegalBeat({
      config: {
        provider: this.settings.llmProvider,
        baseUrl: this.settings.llmBaseUrl,
        apiKey: this.settings.llmApiKey,
        model: this.settings.llmModel,
      },
      legalBeat: beat,
      state: stateAtRequest,
      guest: g,
      context,
    }).then(result => {
      if (!this.beatVisibility.isCurrent(beatKey) || !this.interview || this.interview.guestId !== g.id) return
      if (this.narrative !== stateAtRequest) return
      this.llmLive = result.source === 'llm' || result.source === 'repair'
      this.interview = {
        ...this.interview,
        lastAnswer: `“${result.presentation.npcLine}”`,
        emotion: result.presentation.emotion,
        questions: this.choiceOptions(beat, result.presentation),
        responseSource: result.source,
      }
      this.rememberPresentation(result.presentation)
      this.replaceLatestTranscript(g.id, result.presentation.npcLine)
      this.emit()
    }).catch(() => undefined)
  }

  private beatPacketContext(beat: LegalBeat, revision: number): BeatPacketContext {
    const authoredText = [
      beat.node.text,
      ...beat.choices.map(choice => choice.label),
    ].join(' ').normalize('NFC').toLocaleLowerCase()
    const mentioned = (value: string) => authoredText.includes(value.normalize('NFC').toLocaleLowerCase())
    const properNouns = (this.sim
      ? [...this.sim.guests.map(guest => guest.name), 'Sir Edgar Rooke', 'Celia', 'June Bell', 'Lady Vale', 'Blue Case', 'Bentley', 'Mercy Box']
      : []).filter(mentioned)
    const rooms = [...ROOMS.map(room => room.name), 'west service passage'].filter(mentioned)
    const times = ['10:40 PM', '11:00 PM', '11:10 PM', '11:20 PM', '11:30 PM', '11:35 PM', '11:42 PM', '11:55 PM', '12:00 AM', '12:10 AM', 'midnight', 'dawn', 'sunrise'].filter(mentioned)
    return {
      beatRevision: revision,
      allowedProperNouns: properNouns,
      allowedRooms: rooms,
      allowedTimes: times,
      recentNpcLines: this.recentNpcLines.slice(-2),
      recentOptionLabels: this.recentOptionLabels.slice(-6),
    }
  }

  private rememberPresentation(presentation: BeatPresentation) {
    this.recentNpcLines = [...this.recentNpcLines, presentation.npcLine].slice(-12)
    this.recentOptionLabels = [...this.recentOptionLabels, ...presentation.options.map(option => option.label)].slice(-24)
  }

  private recordTranscript(g: Guest, question: string, answer: string) {
    if (!question) return
    const entry: TranscriptEntry = { atMin: this.sim?.clockMin ?? 0, q: question, a: answer }
    this.transcripts = { ...this.transcripts, [g.id]: [...(this.transcripts[g.id] ?? []), entry] }
  }

  private replaceLatestTranscript(guestId: string, answer: string) {
    const entries = [...(this.transcripts[guestId] ?? [])]
    const latest = entries.at(-1)
    if (!latest) return
    entries[entries.length - 1] = { ...latest, a: answer }
    this.transcripts = { ...this.transcripts, [guestId]: entries }
  }

  private finishNarrativeThread(g: Guest, threadId: string, choice: StoryChoice, status: ThreadStatus, question: string) {
    if (!this.interview || !this.narrative) return
    const character = this.narrative.characters[g.id]
    // A bespoke, thread-specific wrap-up takes precedence over the generic
    // status/intent lines so no two threads conclude on the same words.
    const closing = choice.closing
      ? { line: choice.closing.line, emotion: choice.closing.emotion }
      : this.closingLineFor(g, status, choice.intent)
    const baseConclusion = this.conclusionFor(g, threadId, status, choice.intent)
    const conclusion = choice.closing?.summary && baseConclusion
      ? { ...baseConclusion, summary: choice.closing.summary }
      : baseConclusion
    this.interview = {
      ...this.interview,
      activeThreadId: threadId,
      threadStatus: status,
      lastQuestion: question,
      lastAnswer: `“${closing.line}”`,
      emotion: closing.emotion,
      questions: [],
      concluded: true,
      conclusion,
      responseSource: 'builtin',
      trust: character.trust,
      pressure: character.pressure,
      personalEndingTitle: this.personalEndingTitle(character),
    }
    this.recordTranscript(g, question, closing.line)
    this.emit()
  }

  /** A final in-character statement from the guest that closes the thread meaningfully. */
  private closingLineFor(_g: Guest, status: ThreadStatus, intent?: StoryChoice['intent']): { line: string; emotion: ConversationEmotion } {
    if (status === 'closed-personal') {
      return { line: `That is as far as I will go, and no further. Do not raise it with me again.`, emotion: 'angry' }
    }
    if (status === 'paused' || intent === 'withdraw') {
      return { line: `Then we will leave it there for now. I have told you what I can bear to, Detective.`, emotion: 'worried' }
    }
    if (status === 'rerouted') {
      return { line: `I have said all I intend to say. If you need more, you will have to find it without my help.`, emotion: 'suspicious' }
    }
    if (status === 'resolved' || status === 'spent') {
      return { line: `There. That is the whole of it — every last detail. Make of it what you will.`, emotion: 'thoughtful' }
    }
    return { line: `That is everything I can tell you on the matter. The rest is for the record to settle.`, emotion: 'neutral' }
  }

  private conclusionFor(g: Guest, threadId: string, status: ThreadStatus, intent?: StoryChoice['intent']): InterviewState['conclusion'] {
    const thread = NARRATIVE_THREADS[threadId]
    if (thread?.kind === 'evidence' && status === 'resolved') {
      const label = EVIDENCE_BY_ID[thread.evidenceId]?.label ?? 'This trace'
      const how = thread.revealMechanism ? MECHANISM_SUMMARY[thread.revealMechanism] : 'the details line up'
      return {
        kind: 'evidence',
        evidenceId: thread.evidenceId,
        summary: `${label} now links to ${g.name} — ${how}. It places them, not proves them guilty.`,
      }
    }
    // Evidence threads that end without a reveal clear this guest of the trace:
    // the investigative act came up empty, so nothing is recorded against them.
    if (thread?.kind === 'evidence' && status === 'spent') {
      const label = EVIDENCE_BY_ID[thread.evidenceId]?.label ?? 'This trace'
      return {
        kind: 'cleared',
        evidenceId: thread.evidenceId,
        summary: `${label} does not link to ${g.name} — the comparison comes up empty. No association is recorded against them.`,
      }
    }
    if (status === 'paused' || intent === 'withdraw') {
      return { kind: 'withdrawn', summary: `You leave this subject without erasing its progress. ${g.name} may be approached again.` }
    }
    if (status === 'closed-personal') {
      return { kind: 'closed', summary: `${g.name} has shut down this personal route. External corroboration remains available.` }
    }
    if (status === 'rerouted') {
      return { kind: 'rerouted', summary: `${g.name}'s testimony is unavailable; a pre-seeded artifact or confidant now carries the unresolved fact.` }
    }
    // Personal asides are colour, not case material — they conclude as a note in
    // the record rather than a testable "subject."
    if (threadId.includes(':aside:')) {
      return { kind: 'information', summary: `A personal aside from ${g.name} — noted for colour. It settles nothing about the case.` }
    }
    if (status === 'resolved' || status === 'spent') {
      return { kind: 'resolved', summary: `This subject is concluded. Its testable details remain in the case record.` }
    }
    return { kind: 'information', summary: `This detail can be checked against the case record without establishing guilt.` }
  }

  private revealGuestEvidence(g: Guest, evidenceId: EvidenceId) {
    if (g.revealedEvidenceIds.includes(evidenceId)) return
    const evidence = EVIDENCE_BY_ID[evidenceId]
    if (!evidence) return
    g.revealedEvidenceIds = [...g.revealedEvidenceIds, evidenceId]
    this.pushLead('evidence', g.name, `A detail in ${g.name}'s answer suggests an association with ${evidence.label}.`, true)
    this.audio.evidenceDiscovered()
    this.showEvidenceDiscovery(evidence.id, evidence.label, g.name, 'association')
    this.pushLog(`Evidence association discovered — ${g.name}: ${evidence.label}.`, 'info')
  }

  recoverNarrativeFallback(guestId: string, threadId: string) {
    if (!this.narrative || !this.sim) return
    const guest = this.sim.byId(guestId)
    const beat = getLegalBeat(this.narrative, guestId, threadId)
    if (!guest || !beat?.node.deathSafe || !beat.choices[0]) return
    const beforeAssociations = new Set(this.narrative.revealedAssociations)
    this.narrative = applyStoryChoice(this.narrative, guestId, threadId, beat.choices[0].id)
    for (const association of this.narrative.revealedAssociations) {
      if (beforeAssociations.has(association)) continue
      const [archetypeId, evidenceId] = association.split(':')
      if (archetypeId === guest.archetypeId && EVIDENCE_BY_ID[evidenceId as EvidenceId]) {
        this.revealGuestEvidence(guest, evidenceId as EvidenceId)
      }
    }
    const thread = NARRATIVE_THREADS[threadId]
    this.pushLead(
      'evidence',
      `Recovered record — ${guest.name}`,
      thread?.kind === 'evidence'
        ? `${EVIDENCE_BY_ID[thread.evidenceId]?.label ?? 'A trace'} still links to ${guest.name} through a recovered record — ${thread.revealMechanism ? MECHANISM_SUMMARY[thread.revealMechanism] : 'the details line up'}. It does not establish guilt.`
        : `A pre-seeded record preserves part of ${guest.name}'s unfinished account.`,
      true,
    )
    this.emit()
  }

  private showEvidenceDiscovery(evidenceId: EvidenceId, label: string, guestName: string, kind: 'association' | 'physical') {
    this.evidenceDiscovery = {
      id: ++this.evidenceDiscoveryN,
      guestName,
      evidenceId,
      label,
      kind,
    }
    if (this.evidenceDiscoveryTimer) clearTimeout(this.evidenceDiscoveryTimer)
    this.evidenceDiscoveryTimer = setTimeout(() => {
      this.evidenceDiscovery = null
      this.evidenceDiscoveryTimer = null
      this.emit()
    }, 4200)
    this.emit()
  }

  endInterview() {
    if (this.phase !== 'interview') return
    this.interviewRequestN++
    this.beatVisibility.invalidate()
    this.interview = null
    this.phase = 'playing'
    this.audio.onGameMinute(this.sim?.clockMin ?? 0, this.settings.speed, true)
    this.emit()
  }

  // ------------------------------------------------------------- accusation

  accuse(guestId: string, disposition: ArchiveDisposition = 'seal') {
    if (!this.sim || !this.narrative) return
    const sim = this.sim
    const accused = sim.byId(guestId)
    const killer = sim.byId(sim.killerId)
    if (!accused || !killer) return
    const stats = {
      interviews: this.interviewsHeld,
      leads: this.leads.length,
      timeMin: sim.clockMin,
      bodiesFound: sim.bodiesFound(),
    }
    this.audio.stinger('accuse')
    this.narrative = setDisposition(this.narrative, disposition)
    const evaluation = evaluateCaseEnding(this.narrative, {
      accusedGuestId: accused.id,
      suspectedGuestId: accused.id,
      disposition,
      attackPrevented: this.narrative.counterTrapSucceeded,
      trapCaughtGuestId: this.narrative.counterTrapSucceeded ? accused.id : null,
    })
    this.endInfo = this.buildEndInfo(
      evaluation,
      accused.isKiller ? 'win' : 'wrong',
      stats,
      killer,
      accused.name,
    )
    this.phase = accused.isKiller ? 'won' : 'lost'
    setTimeout(() => this.audio.stinger(accused.isKiller ? 'win' : 'lose'), 900)
    this.emit()
  }

  private buildEndInfo(
    evaluation: CaseEndingEvaluation,
    outcome: EndInfo['outcome'],
    stats: EndInfo['stats'],
    killer: Guest,
    accusedName?: string,
  ): EndInfo {
    const personalEpilogues = Object.entries(evaluation.personalEndingIds).map(([guestId, endingId]) => {
      const character = this.narrative!.characters[guestId]
      const baseId = endingId.replace(/:legacy$/, '')
      const ending = DOSSIERS[character.archetypeId].endings.find(candidate => candidate.id === baseId)
      const legacy = endingId.endsWith(':legacy')
      const unresolved = baseId === `${character.archetypeId}:ending:unresolved`
      return {
        guestName: character.displayName,
        title: ending ? `${ending.title}${legacy ? ' — Legacy' : ''}` : `Unresolved${legacy ? ' — Legacy' : ''}`,
        text: ending?.text ?? (unresolved && legacy
          ? `${character.displayName} died before their private stakes were addressed. Seeded artifacts preserve case facts, but no personal resolution was earned.`
          : `${character.displayName}'s private stakes were never addressed, so the night closes without inventing a personal resolution.`),
      }
    })
    return {
      outcome,
      narrativeOutcome: evaluation.outcome,
      disposition: evaluation.disposition,
      proof: evaluation.proof,
      missingProof: evaluation.missingProof,
      circuitCount: evaluation.corroboratedCircuitCount,
      personalEpilogues,
      killerName: killer.name,
      killerArchetype: archetypeOf(killer).name,
      accusedName,
      stats,
    }
  }

  // ------------------------------------------------------------- loop

  private frame = (ts: number) => {
    if (this.disposed) return
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000 || 0.016)
    this.lastTs = ts

    if (this.phase === 'playing' && this.sim) this.stepPlaying(dt)
    else {
      this.playerWalking = false
    }
    this.syncActors()
    this.world.update(dt)

    this.audio.setPlayerWalking(this.playerWalking)
    this.audio.onGameMinute(this.sim?.clockMin ?? 0, this.settings.speed, this.timeIsRunning())

    this.emitTimer += dt
    if (this.emitTimer > 0.15) {
      this.emitTimer = 0
      this.emit()
    }
    requestAnimationFrame(this.frame)
  }

  private stepPlaying(dt: number) {
    const sim = this.sim!
    const previousX = this.px
    const previousZ = this.pz
    // player movement
    let mx = 0
    let mz = 0
    if (this.keys.has('w') || this.keys.has('arrowup')) mz -= 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) mz += 1
    if (this.keys.has('a') || this.keys.has('arrowleft')) mx -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) mx += 1
    if (mx !== 0 || mz !== 0) {
      const len = Math.hypot(mx, mz)
      const step = (PLAYER_SPEED * dt) / len
      const nx = this.px + mx * step
      const nz = this.pz + mz * step
      // Guests remain collision-aware with one another, but they should never
      // be able to body-block the player in a doorway or against furniture.
      if (canOccupy(nx, this.pz, ACTOR_RADIUS)) this.px = nx
      if (canOccupy(this.px, nz, ACTOR_RADIUS)) this.pz = nz
    }
    this.playerWalking = Math.hypot(this.px - previousX, this.pz - previousZ) > 0.001
    const r = roomOfPoint(this.px, this.pz)
    if (r && r !== this.playerRoom) {
      this.playerRoom = r
      this.guestRevealOpacity = 0
      sim.playerRoom = r
      this.world.focusRoom(r)
      this.audio.setRoomAmbience(r)
      // Record newly reported bodies, then play the sting the first time the
      // detective personally enters a room containing each body. This also
      // covers the opening victim and bodies an NPC reported first.
      const found = sim.playerDiscovers(r)
      for (const body of found) {
        this.syncNarrativeBodyDiscovery(body)
        this.world.markBodyRoom(body.deathRoom!)
        this.pushLog(`You found ${body.name}'s body.`, 'danger')
        this.pushLead('discovery', 'You', `You discovered ${body.name}'s body in the ${ROOM_BY_ID[r].name} (~${fmtTime(body.diedAtMin)}).`)
      }
      const firstEncounters = sim.guests.filter(body =>
        !body.alive
        && body.deathRoom === r
        && !this.playerEncounteredBodyIds.has(body.id)
      )
      if (firstEncounters.length > 0) {
        for (const body of firstEncounters) this.playerEncounteredBodyIds.add(body.id)
        this.audio.stinger('body')
      }
    }

    sim.playerRoom = this.playerRoom
    this.advanceSimulation(dt)

  }

  private timeIsRunning() {
    return this.phase === 'playing'
  }

  private advanceSimulation(dt: number, movementLockedGuestId?: string) {
    const sim = this.sim!
    sim.advance(dt, this.settings.speed, movementLockedGuestId)
    if (this.narrative) this.narrative = setNarrativeClock(this.narrative, sim.clockMin)

    // endings
    if (sim.clockMin >= NIGHT_LENGTH_MIN) {
      const killer = sim.byId(sim.killerId)!
      this.endInfo = this.buildSilenceEndInfo('sunrise', killer)
      this.audio.stinger('lose')
      this.phase = 'lost'
      this.emit()
      return
    }
    if (sim.allDead()) {
      const killer = sim.byId(sim.killerId)!
      this.endInfo = this.buildSilenceEndInfo('wiped', killer)
      this.audio.stinger('lose')
      this.phase = 'lost'
      this.emit()
    }
  }

  private buildSilenceEndInfo(outcome: 'sunrise' | 'wiped', killer: Guest): EndInfo {
    if (!this.narrative || !this.sim) throw new Error('Cannot end an uninitialized case')
    const disposition: ArchiveDisposition = this.narrative.disposition ?? 'seal'
    this.narrative = setDisposition(this.narrative, disposition)
    const evaluation = evaluateCaseEnding(this.narrative, {
      accusedGuestId: null,
      suspectedGuestId: null,
      disposition,
      attackPrevented: false,
      trapCaughtGuestId: null,
    })
    return this.buildEndInfo(evaluation, outcome, {
      interviews: this.interviewsHeld,
      leads: this.leads.length,
      timeMin: this.sim.clockMin,
      bodiesFound: this.sim.bodiesFound(),
    }, killer)
  }

  private syncActors() {
    const sim = this.sim
    this.world.setActor('player', this.px, this.pz, this.isMoving(), this.phase !== 'title')
    const interviewGuest = this.phase === 'interview' && this.interview && sim
      ? sim.byId(this.interview.guestId)
      : null
    if (interviewGuest) {
      this.world.focusConversation(this.px, this.pz, interviewGuest.x, interviewGuest.z)
    } else {
      this.world.trackPlayer(this.px, this.pz, this.playerRoom)
    }
    if (!sim) return
    const guestReveal = this.guestRevealAtRoomEntrance()
    for (const g of sim.guests) {
      const inRoom = g.room === this.playerRoom
      this.world.setActor(g.id, g.x, g.z, g.state === 'walk', inRoom, guestReveal)
      if (g.state === 'talk' && g.talkPartnerId) {
        const partner = sim.byId(g.talkPartnerId)
        if (partner) this.world.faceActorAt(g.id, partner.x, partner.z)
      }
    }
    if (interviewGuest) {
      // Conversation poses must be correct on the first visible frame. Guests
      // normally ease toward a new heading, which can leave their prior walk
      // direction (including a rear-facing frame) visible behind the dialogue.
      this.world.faceActorAt('player', interviewGuest.x, interviewGuest.z, true)
      this.world.faceActorAt(interviewGuest.id, this.px, this.pz, true)
    }
  }

  /**
   * Ease guests into view as the detective crosses a doorway. Room membership
   * changes exactly at the wall plane, so a short depth-based reveal prevents
   * everyone in the destination room appearing on a single frame.
   */
  private guestRevealAtRoomEntrance(): number {
    const room = ROOM_BY_ID[this.playerRoom]
    const center = roomCenter(this.playerRoom)
    const entrances: { x: number; z: number }[] = []
    if (roomAt(room.col - 1, room.row)) entrances.push({ x: center.x - ROOM_HALF, z: center.z })
    if (roomAt(room.col + 1, room.row)) entrances.push({ x: center.x + ROOM_HALF, z: center.z })
    if (roomAt(room.col, room.row - 1)) entrances.push({ x: center.x, z: center.z - ROOM_HALF })
    if (roomAt(room.col, room.row + 1)) entrances.push({ x: center.x, z: center.z + ROOM_HALF })
    if (entrances.length === 0) return 1

    const distance = Math.min(...entrances.map(e => Math.hypot(this.px - e.x, this.pz - e.z)))
    if (roomOfPoint(this.px, this.pz) === this.playerRoom) {
      const entryT = Math.max(0, Math.min(1, distance / 2.8))
      const entryReveal = entryT * entryT * (3 - 2 * entryT)
      // Entry is one-way: after guests finish fading in they stay fully visible
      // everywhere inside the room, including right up to an exit threshold.
      this.guestRevealOpacity = Math.max(this.guestRevealOpacity, entryReveal)
    } else {
      const hallT = Math.max(0, Math.min(1, distance / 2.2))
      const exitReveal = 1 - hallT * hallT * (3 - 2 * hallT)
      // Start fading only after crossing into the unassigned passage. Latching
      // downward prevents the outgoing room from reappearing past its midpoint.
      this.guestRevealOpacity = Math.min(this.guestRevealOpacity, exitReveal)
    }
    return this.guestRevealOpacity
  }

  private isMoving(): boolean {
    return this.keys.has('w') || this.keys.has('a') || this.keys.has('s') || this.keys.has('d')
      || this.keys.has('arrowup') || this.keys.has('arrowdown') || this.keys.has('arrowleft') || this.keys.has('arrowright')
  }

  // ------------------------------------------------------------- logs & leads

  private pushLog(text: string, tone: LogLine['tone']) {
    this.logLines = [...this.logLines, { id: `l${++this.logN}`, atMin: this.sim?.clockMin ?? 0, text, tone }]
    if (this.logLines.length > 60) this.logLines = this.logLines.slice(-60)
  }

  private pushLead(kind: Lead['kind'], source: string, text: string, silent = false) {
    this.leads = [...this.leads, { id: `e${++this.leadN}`, atMin: this.sim?.clockMin ?? 0, kind, source, text }]
    if (!silent && kind !== 'system') this.pushLog(text, kind === 'discovery' ? 'danger' : 'rumor')
  }

  private renderGameToText = () => JSON.stringify({
    coordinates: 'World x/z coordinates; y is vertical. Rooms are arranged in a 3x3 grid.',
    phase: this.phase,
    player: {
      x: Number(this.px.toFixed(2)),
      z: Number(this.pz.toFixed(2)),
      room: this.playerRoom,
      roomName: ROOM_BY_ID[this.playerRoom].name,
      moving: this.isMoving(),
    },
    camera: this.world.cameraDebug(),
    guestsVisible: this.sim
      ? this.sim.guestsInRoom(this.playerRoom).map(g => ({
        id: g.id,
        name: g.name,
        x: Number(g.x.toFixed(2)),
        z: Number(g.z.toFixed(2)),
        state: g.state,
        alive: g.alive,
      }))
      : [],
    crimeScenes: this.sim
      ? this.sim.guests.filter(g => !g.alive && g.deathRoom === this.playerRoom).map(g => ({
        victim: g.name,
        x: Number(g.x.toFixed(2)),
        z: Number(g.z.toFixed(2)),
        appearance: g.evidenceInvestigated ? 'chalk outline' : 'body',
      }))
      : [],
    evidenceCollected: this.evidence.map(item => ({
      id: item.evidenceId,
      label: item.label,
      source: item.source,
      possibleSources: item.candidateNames,
    })),
    interview: this.interview && this.sim ? (() => {
      const guest = this.sim.byId(this.interview!.guestId)
      return {
        guest: guest?.name,
        archetype: guest?.archetypeId,
        answer: this.interview!.lastAnswer,
        conclusion: this.interview!.conclusion,
        choices: this.interview!.questions.map(q => q.label),
        concluded: this.interview!.concluded,
      }
    })() : null,
    clockText: fmtTime(this.sim?.clockMin ?? 0),
    hint: this.computeHint(),
  })
}
