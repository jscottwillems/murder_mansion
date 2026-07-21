// Game orchestrator: loop, input, phases, interviews, accusation, endings,
// optional LLM dialogue hookup, and the pub/sub store bridge for React.
import type {
  CollectedEvidence, EndInfo, Guest, InterviewState, Lead, LogLine, Phase,
  QuestionOption, QuestionTopic, RoomId, Settings, Snapshot, TranscriptEntry,
} from './types'
import { EVIDENCE_BY_ID, ROOM_BY_ID, ROOM_HALF, roomAt, roomCenter, roomOfPoint, canOccupy, fmtTime, NIGHT_LENGTH_MIN } from './data'
import { Simulation } from './sim'
import { MansionScene } from './world'
import { Soundtrack } from './audio'
import { llmConversationPlan, archetypeOf } from './llm'
import type { AuthoredDialogueRoute } from './authoredDialogue'
import { authoredChoice, authoredQuestionOptions, authoredRoutesForGuest } from './dialogueResolver'

const SETTINGS_KEY = 'murder-mansion-settings'
const PLAYER_SPEED = 4.4
const ACTOR_RADIUS = 0.42

type ThreadEffect = 'advance' | 'stall' | 'close'
interface DialogueThread {
  id: string
  scriptId: string
  topic: QuestionTopic
  rootLabel: string
  evidenceId?: string
  stage: number
  wrongTurns: number
  status: 'unstarted' | 'active' | 'resolved' | 'exhausted'
  offered: QuestionOption[]
  effects: Record<string, ThreadEffect>
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
  llmModel: 'llama-3.1-8b-instant',
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
  private dialogueThreads: Record<string, Record<string, DialogueThread>> = {}
  private conversationPlans: Record<string, AuthoredDialogueRoute[]> = {}
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

  constructor(container: HTMLElement) {
    this.world = new MansionScene(container)
    this.world.onThunder = (i) => this.audio.thunder(i)
    this.world.addActor('player', 0x8a7a5a, 'Detective', true)
    this.world.focusRoom(this.playerRoom)
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
      default: break
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
    this.dialogueThreads = {}
    this.conversationPlans = {}
    this.interviewRequestN++

    this.sim = new Simulation(seed, {
      log: (text, tone) => this.pushLog(text, tone),
      lead: (kind, source, text) => this.pushLead(kind, source, text),
      guestDied: (g) => {
        this.world.setActorDead(g.id, g.x, g.z)
      },
      bodyDiscovered: (g) => {
        this.world.markBodyRoom(g.deathRoom!)
      },
      overheard: (_who, text) => this.pushLog(text, 'rumor'),
    })

    this.world.removeAllActors()
    this.world.addActor('player', 0x8a7a5a, 'Detective', true)
    for (const g of this.sim.guests) {
      this.world.addActor(g.id, g.colorNum, g.name, false, g.archetypeId)
    }
    const openingVictim = this.sim.createOpeningCrime()
    this.world.resetRoomLights()

    // player starts in the Dining Hall (center of the mansion)
    this.playerRoom = 'dining'
    const c = { x: 0, z: 2 }
    this.px = c.x
    this.pz = c.z
    this.world.focusRoom(this.playerRoom)

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
    if (!this.sim || this.phase !== 'playing') return
    const g = this.sim.byId(guestId)
    if (!g || !g.alive) return
    this.audio.ensure()
    g.interviewed = true
    this.interviewsHeld++
    if (this.llmConfigured() && !this.conversationPlans[g.id]) {
      const requestN = ++this.interviewRequestN
      this.interview = {
        guestId,
        questions: [],
        lastQuestion: '',
        lastAnswer: 'Planning this conversation…',
        emotion: 'thoughtful',
        thinking: true,
        concluded: false,
        activeThreadId: null,
        threadStatus: 'topics',
        responseSource: 'llm',
      }
      this.phase = 'interview'
      this.audio.onGameMinute(this.sim.clockMin, this.settings.speed, false)
      this.emit()
      const sim = this.sim
      llmConversationPlan(
        { baseUrl: this.settings.llmBaseUrl, apiKey: this.settings.llmApiKey, model: this.settings.llmModel },
        g,
        {
          clockMin: sim.clockMin,
          roomName: ROOM_BY_ID[this.playerRoom].name,
          knownVictims: sim.victims().map(victim => victim.name),
          caseEvents: this.caseEventsFor(g),
          otherGuests: sim.aliveGuests().filter(other => other.id !== g.id).map(other => other.name),
          evidence: g.evidenceIds.map(id => EVIDENCE_BY_ID[id]).filter(Boolean),
        },
      ).then(plan => {
        if (!this.interview || this.interview.guestId !== g.id || requestN !== this.interviewRequestN) return
        if (plan) {
          this.conversationPlans[g.id] = plan
          this.llmLive = true
        } else {
          this.conversationPlans[g.id] = authoredRoutesForGuest(g)
          this.llmLive = false
        }
        delete this.dialogueThreads[g.id]
        this.interview = {
          ...this.interview,
          questions: this.buildRootQuestions(g),
          lastAnswer: `“${this.pickGreet(g)}”`,
          emotion: 'neutral',
          thinking: false,
          responseSource: plan ? 'llm' : 'fallback',
        }
        this.emit()
      }).catch(() => {
        if (!this.interview || this.interview.guestId !== g.id || requestN !== this.interviewRequestN) return
        this.conversationPlans[g.id] = authoredRoutesForGuest(g)
        this.llmLive = false
        delete this.dialogueThreads[g.id]
        this.interview = {
          ...this.interview,
          questions: this.buildRootQuestions(g),
          lastAnswer: `“${this.pickGreet(g)}”`,
          emotion: 'neutral',
          thinking: false,
          responseSource: 'fallback',
        }
        this.emit()
      })
      return
    }
    const active = Object.values(this.ensureGuestThreads(g)).find(thread => thread.status === 'active')
    this.interview = {
      guestId,
      questions: active?.offered.length ? active.offered : this.buildRootQuestions(g),
      lastQuestion: '',
      lastAnswer: `“${this.pickGreet(g)}”`,
      emotion: 'neutral',
      thinking: false,
      concluded: false,
      activeThreadId: active?.id ?? null,
      threadStatus: active ? 'active' : 'topics',
      responseSource: this.llmConfigured()
        ? (this.llmLive ? 'llm' : 'fallback')
        : 'builtin',
    }
    this.phase = 'interview'
    this.audio.onGameMinute(this.sim.clockMin, this.settings.speed, false)
    this.emit()
  }

  private pickGreet(g: Guest): string {
    const a = archetypeOf(g)
    return a.greet[Math.floor(Math.random() * a.greet.length)]
  }

  private ensureGuestThreads(g: Guest): Record<string, DialogueThread> {
    if (this.dialogueThreads[g.id]) return this.dialogueThreads[g.id]
    const threads: Record<string, DialogueThread> = {}
    this.routesForGuest(g).forEach(route => {
      const id = `thread:${route.id}`
      threads[id] = {
        id, scriptId: route.id, topic: route.topic, rootLabel: route.rootQuestion,
        evidenceId: route.evidenceId,
        stage: 0, wrongTurns: 0, status: 'unstarted', offered: [], effects: {},
      }
    })
    this.dialogueThreads[g.id] = threads
    return threads
  }

  private routesForGuest(g: Guest): AuthoredDialogueRoute[] {
    return this.conversationPlans[g.id] ?? authoredRoutesForGuest(g)
  }

  private buildRootQuestions(g: Guest): QuestionOption[] {
    return Object.values(this.ensureGuestThreads(g)).map(thread => ({
      id: `root:${thread.id}`,
      topic: thread.topic,
      label: thread.status === 'resolved' ? `${thread.rootLabel} — resolved`
        : thread.status === 'exhausted' ? `${thread.rootLabel} — no further lead`
          : thread.rootLabel,
      kind: 'root',
      disabled: thread.status === 'resolved' || thread.status === 'exhausted',
    }))
  }

  private authoredRoute(g: Guest, thread: DialogueThread): AuthoredDialogueRoute | undefined {
    return this.routesForGuest(g).find(route => route.id === thread.scriptId)
  }

  private authoredBranchChoices(thread: DialogueThread, route: AuthoredDialogueRoute): QuestionOption[] {
    const idPrefix = `${thread.id}:s${thread.stage}:w${thread.wrongTurns}`
    const options = authoredQuestionOptions(route, thread.stage, idPrefix)
    const specs = options.map((option, index) => ({
      option,
      effect: (['advance', 'stall', 'close'] as ThreadEffect[])[index],
    }))
    // Rotate by stable thread/stage data so the productive option is not fixed
    // to the same screen position across every conversation.
    const offset = (thread.id.length + thread.stage + thread.wrongTurns) % specs.length
    const rotated = [...specs.slice(offset), ...specs.slice(0, offset)]
    thread.effects = {}
    thread.offered = rotated.map(spec => {
      thread.effects[spec.option.id] = spec.effect
      return spec.option
    })
    return thread.offered
  }

  returnToInterviewTopics() {
    if (!this.interview || this.interview.thinking || !this.sim) return
    const g = this.sim.byId(this.interview.guestId)
    if (!g) return
    this.interview = {
      ...this.interview,
      activeThreadId: null,
      threadStatus: 'topics',
      concluded: false,
      questions: this.buildRootQuestions(g),
    }
    this.emit()
  }

  private caseEventsFor(g: Guest): string[] {
    if (!this.sim) return []
    const events: string[] = []
    if (g.talkedWith.length) events.push(`You spoke with ${g.talkedWith.slice(-5).join(', ')}.`)
    for (const rumor of g.knowledge.slice(-5)) events.push(`You learned: ${rumor.text}.`)
    for (const victim of this.sim.victims().slice(-3)) {
      events.push(`${victim.name}'s body was discovered in the ${ROOM_BY_ID[victim.deathRoom!].name}.`)
    }
    for (const entry of (this.transcripts[g.id] ?? []).slice(-4)) {
      events.push(`The detective previously asked "${entry.q}"; you answered: ${entry.a}`)
    }
    return events
  }

  ask(questionId: string) {
    if (!this.sim || !this.interview || this.interview.thinking) return
    const g = this.sim.byId(this.interview.guestId)
    if (!g) return
    const q = this.interview.questions.find(option => option.id === questionId)
    if (!q || q.disabled) return
    const threads = this.ensureGuestThreads(g)
    const thread = q.kind === 'root'
      ? threads[questionId.slice('root:'.length)]
      : (this.interview.activeThreadId ? threads[this.interview.activeThreadId] : undefined)
    if (!thread || thread.status === 'resolved' || thread.status === 'exhausted') return
    const route = this.authoredRoute(g, thread)
    if (!route) return

    const selectedEffect: ThreadEffect | 'root' = q.kind === 'root' ? 'root' : thread.effects[q.id]
    if (!selectedEffect) return
    const selectedStage = thread.stage
    const authoredBeat = selectedEffect === 'root'
      ? { text: route.openingResponse, emotion: route.openingEmotion }
      : (() => {
          const choice = authoredChoice(route, selectedStage, selectedEffect)
          return { text: choice.response, emotion: choice.emotion }
        })()
    thread.status = 'active'
    thread.offered = []
    const terminalSuccess = selectedEffect === 'advance' && thread.stage + 1 >= 2
    if (selectedEffect === 'advance') thread.stage++
    if (selectedEffect === 'stall') thread.wrongTurns++
    const terminalFailure = selectedEffect === 'close' || (selectedEffect === 'stall' && thread.wrongTurns >= 2)
    const terminal = terminalSuccess || terminalFailure
    const evidenceCue = terminalSuccess && thread.evidenceId ? EVIDENCE_BY_ID[thread.evidenceId] : undefined
    const fallbackChoices = terminal ? [] : this.authoredBranchChoices(thread, route)
    const requestN = ++this.interviewRequestN
    this.interview = {
      ...this.interview,
      activeThreadId: thread.id,
      threadStatus: 'active',
      thinking: true,
      lastQuestion: q.label,
      questions: fallbackChoices,
    }
    this.emit()

    const applyAnswer = (
      answer: string,
      leadList: { source: string; text: string }[],
      emotion: InterviewState['emotion'],
      renderedChoices: QuestionOption[],
    ) => {
      if (!this.interview || this.interview.guestId !== g.id || requestN !== this.interviewRequestN) return
      for (const l of leadList) this.pushLead('interview', l.source, l.text, true)
      const entry: TranscriptEntry = { atMin: this.sim!.clockMin, q: q.label, a: answer }
      this.transcripts = {
        ...this.transcripts,
        [g.id]: [...(this.transcripts[g.id] ?? []), entry],
      }
      if (terminalSuccess) {
        thread.status = 'resolved'
        if (evidenceCue) this.revealGuestEvidence(g, evidenceCue.id)
      } else if (terminalFailure) {
        thread.status = 'exhausted'
      } else {
        thread.status = 'active'
        thread.offered = renderedChoices
      }
      this.interview = {
        ...this.interview,
        thinking: false,
        lastAnswer: terminal ? 'nothing more to discuss right now' : (answer.startsWith('“') ? answer : `“${answer}”`),
        emotion: terminal ? 'neutral' : emotion,
        concluded: terminal,
        threadStatus: terminalSuccess ? 'resolved' : terminalFailure ? 'exhausted' : 'active',
        questions: terminal ? [] : renderedChoices,
      }
      this.emit()
    }

    // Both modes now play from an immutable plan. Built-in plans are authored
    // locally; LLM plans are generated once at interview start and persisted.
    setTimeout(() => {
      applyAnswer(authoredBeat.text, [], authoredBeat.emotion, fallbackChoices)
    }, 350)
  }

  private revealGuestEvidence(g: Guest, evidenceId: string) {
    if (g.revealedEvidenceIds.includes(evidenceId)) return
    const evidence = EVIDENCE_BY_ID[evidenceId]
    if (!evidence) return
    g.revealedEvidenceIds = [...g.revealedEvidenceIds, evidenceId]
    this.pushLead('evidence', g.name, `A detail in ${g.name}'s answer suggests an association with ${evidence.label}.`, true)
    this.audio.evidenceDiscovered()
    this.showEvidenceDiscovery(evidence.id, evidence.label, g.name, 'association')
    this.pushLog(`Evidence association discovered — ${g.name}: ${evidence.label}.`, 'info')
  }

  private showEvidenceDiscovery(evidenceId: string, label: string, guestName: string, kind: 'association' | 'physical') {
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
    this.interview = null
    this.phase = 'playing'
    this.audio.onGameMinute(this.sim?.clockMin ?? 0, this.settings.speed, true)
    this.emit()
  }

  // ------------------------------------------------------------- accusation

  accuse(guestId: string) {
    if (!this.sim) return
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
    if (accused.isKiller) {
      this.endInfo = {
        outcome: 'win',
        killerName: killer.name,
        killerArchetype: archetypeOf(killer).name,
        accusedName: accused.name,
        stats,
      }
      this.phase = 'won'
      setTimeout(() => this.audio.stinger('win'), 900)
    } else {
      this.endInfo = {
        outcome: 'wrong',
        killerName: killer.name,
        killerArchetype: archetypeOf(killer).name,
        accusedName: accused.name,
        stats,
      }
      this.phase = 'lost'
      setTimeout(() => this.audio.stinger('lose'), 900)
    }
    this.emit()
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
      // Record newly reported bodies, then play the sting the first time the
      // detective personally enters a room containing each body. This also
      // covers the opening victim and bodies an NPC reported first.
      const found = sim.playerDiscovers(r)
      for (const body of found) {
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

    // endings
    if (sim.clockMin >= NIGHT_LENGTH_MIN) {
      const killer = sim.byId(sim.killerId)!
      this.endInfo = {
        outcome: 'sunrise',
        killerName: killer.name,
        killerArchetype: archetypeOf(killer).name,
        stats: { interviews: this.interviewsHeld, leads: this.leads.length, timeMin: sim.clockMin, bodiesFound: sim.bodiesFound() },
      }
      this.audio.stinger('lose')
      this.phase = 'lost'
      this.emit()
      return
    }
    if (sim.allDead()) {
      const killer = sim.byId(sim.killerId)!
      this.endInfo = {
        outcome: 'wiped',
        killerName: killer.name,
        killerArchetype: archetypeOf(killer).name,
        stats: { interviews: this.interviewsHeld, leads: this.leads.length, timeMin: sim.clockMin, bodiesFound: sim.bodiesFound() },
      }
      this.audio.stinger('lose')
      this.phase = 'lost'
      this.emit()
    }
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
        choices: this.interview!.questions.map(q => q.label),
        concluded: this.interview!.concluded,
      }
    })() : null,
    clockText: fmtTime(this.sim?.clockMin ?? 0),
    hint: this.computeHint(),
  })
}
