// Game orchestrator: loop, input, phases, interviews, accusation, endings,
// LLM director hookup, and the pub/sub store bridge for React.
import type {
  EndInfo, Guest, InterviewState, Lead, LogLine, Phase,
  QuestionOption, QuestionTopic, RoomId, Settings, Snapshot, TranscriptEntry,
} from './types'
import { ARCHETYPES, EVIDENCE_BY_ID, ROOM_BY_ID, roomOfPoint, canOccupy, fmtTime, NIGHT_LENGTH_MIN } from './data'
import { Simulation } from './sim'
import { MansionScene } from './world'
import { Soundtrack } from './audio'
import { llmDecision, llmAnswer, archetypeOf } from './llm'

const SETTINGS_KEY = 'murder-mansion-settings'
const PLAYER_SPEED = 4.4
const ACTOR_RADIUS = 0.42

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
  volume: 0.7,
  muted: false,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>
      // Configurations saved before provider presets existed are custom endpoints.
      if (!saved.llmProvider && saved.llmBaseUrl) saved.llmProvider = 'custom'
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
  private leads: Lead[] = []
  private logLines: LogLine[] = []
  private transcripts: Record<string, TranscriptEntry[]> = {}
  private interview: InterviewState | null = null
  private endInfo: EndInfo | null = null
  private interviewsHeld = 0
  private llmPending = new Set<string>()
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
    this.audio.setVolume(this.settings.volume)
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

  private advanceTime = (ms: number) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)))
    for (let i = 0; i < steps; i++) {
      const dt = 1 / 60
      if (this.phase === 'playing' && this.sim) this.stepPlaying(dt)
      this.syncActors()
      this.world.update(dt)
      this.audio.onGameMinute(this.sim?.clockMin ?? 0)
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
      transcripts: this.transcripts,
      log: this.logLines.slice(-6),
      interview: this.interview,
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
    this.world.replaceBodyWithOutline(body.id, body.x, body.z)
    const candidates = evidence.archetypeIds
      .map(id => ARCHETYPES.find(a => a.id === id)?.name)
      .filter((name): name is string => !!name)
      .join(', ')
    const text = `${evidence.label}: ${evidence.description} Possible sources: ${candidates}.`
    this.pushLead('evidence', `Scene: ${body.name}`, text)
    this.pushLog(`Evidence collected — ${evidence.label}. Added to your journal.`, 'info')
    this.emit()
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
    this.logLines = []
    this.transcripts = {}
    this.interview = null
    this.endInfo = null
    this.interviewsHeld = 0
    this.llmPending.clear()

    this.sim = new Simulation(seed, {
      log: (text, tone) => this.pushLog(text, tone),
      lead: (kind, source, text) => this.pushLead(kind, source, text),
      guestDied: (g) => {
        this.world.setActorDead(g.id, g.x, g.z)
      },
      bodyDiscovered: (g, byName) => {
        this.world.markBodyRoom(g.deathRoom!)
        if (byName === 'You') {
          this.audio.stinger('body')
          this.pushLog(`You found ${g.name}'s body in the ${ROOM_BY_ID[g.deathRoom!].name}.`, 'danger')
          this.pushLead('discovery', 'You', `You discovered ${g.name}'s body in the ${ROOM_BY_ID[g.deathRoom!].name} (~${fmtTime(g.diedAtMin)}).`)
        } else {
          this.audio.stinger('body')
        }
      },
      overheard: (_who, text) => this.pushLog(text, 'rumor'),
    })

    if (this.llmConfigured()) {
      this.sim.externalDecider = (g) => this.llmDecide(g)
    }

    this.world.removeAllActors()
    this.world.addActor('player', 0x8a7a5a, 'Detective', true)
    for (const g of this.sim.guests) {
      this.world.addActor(g.id, g.colorNum, g.name, false, g.archetypeId)
    }
    this.world.resetRoomLights()

    // player starts in the Dining Hall (center of the mansion)
    this.playerRoom = 'dining'
    const c = { x: 0, z: 2 }
    this.px = c.x
    this.pz = c.z
    this.world.focusRoom(this.playerRoom)

    this.pushLog('Midnight. The storm has cut the roads. Ten guests, one detective — and one murderer.', 'system')
    this.pushLog('Find the killer before sunrise (6:00 AM). WASD to move, E to interview, J for the case journal.', 'system')
    this.pushLead('system', 'Case', 'The case begins at midnight. One of the ten guests is the murderer.')
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
    this.audio.setVolume(this.settings.volume)
    if (this.sim) {
      if (this.llmConfigured()) {
        this.sim.externalDecider = (g) => this.llmDecide(g)
      } else {
        this.sim.externalDecider = undefined
        this.llmLive = false
      }
    }
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
    this.interview = {
      guestId,
      questions: this.buildQuestions(g),
      lastQuestion: '',
      lastAnswer: `“${this.pickGreet(g)}”`,
      thinking: false,
    }
    this.phase = 'interview'
    this.emit()
  }

  private pickGreet(g: Guest): string {
    const a = archetypeOf(g)
    return a.greet[Math.floor(Math.random() * a.greet.length)]
  }

  private buildQuestions(g: Guest): QuestionOption[] {
    const sim = this.sim!
    const pool: QuestionOption[] = [
      { topic: 'timeline', label: 'Where were you earlier tonight?' },
      { topic: 'suspicion', label: 'Who do you suspect?' },
    ]
    const extras: QuestionOption[] = []
    if (g.knowledge.length > 0) extras.push({ topic: 'intel', label: 'Heard anything worth knowing?' })
    extras.push({ topic: 'alibi', label: 'Can anyone vouch for you?' })
    if (g.talkedWith.length > 0) extras.push({ topic: 'social', label: 'Who have you spoken with?' })
    if (sim.victims().length > 0) extras.push({ topic: 'victim', label: 'Did you know the victim?' })
    extras.push({ topic: 'room', label: `What do you make of the ${ROOM_BY_ID[this.playerRoom].name}?` })
    extras.push({ topic: 'pressure', label: 'You’re hiding something. Talk.' })
    // rotate extras for variety, take 2
    const off = this.interviewsHeld % extras.length
    const rotated = [...extras.slice(off), ...extras.slice(0, off)]
    return [...pool, ...rotated.slice(0, 2)]
  }

  ask(topic: QuestionTopic) {
    if (!this.sim || !this.interview || this.interview.thinking) return
    const g = this.sim.byId(this.interview.guestId)
    if (!g) return
    const q = this.interview.questions.find(o => o.topic === topic)
    this.interview = { ...this.interview, thinking: true, lastQuestion: q?.label ?? '' }
    this.emit()

    const applyAnswer = (answer: string, leadList: { source: string; text: string }[]) => {
      if (!this.interview || this.interview.guestId !== g.id) return
      for (const l of leadList) this.pushLead('interview', l.source, l.text, true)
      const entry: TranscriptEntry = { atMin: this.sim!.clockMin, q: q?.label ?? topic, a: answer }
      this.transcripts = {
        ...this.transcripts,
        [g.id]: [...(this.transcripts[g.id] ?? []), entry],
      }
      this.interview = {
        ...this.interview,
        thinking: false,
        lastAnswer: answer.startsWith('“') ? answer : `“${answer}”`,
        questions: this.buildQuestions(g),
      }
      this.emit()
    }

    const llmOn = this.llmConfigured()
    if (llmOn) {
      const sim = this.sim
      llmAnswer(
        { baseUrl: this.settings.llmBaseUrl, apiKey: this.settings.llmApiKey, model: this.settings.llmModel },
        g,
        {
          clockMin: sim.clockMin,
          topic,
          roomName: ROOM_BY_ID[this.playerRoom].name,
          rumors: g.knowledge.slice(-6).map(r => r.text),
          victims: sim.victims().map(v => v.name),
          suspectNames: sim.aliveGuests().filter(o => o.id !== g.id).map(o => o.name),
          talkedWith: g.talkedWith,
        },
      ).then(text => {
        if (text) {
          this.llmLive = true
          // LLM gives prose; still mine a lead for factual topics
          const fb = sim.answerQuestion(g, topic, this.playerRoom)
          applyAnswer(text, topic === 'intel' || topic === 'timeline' || topic === 'suspicion' || topic === 'alibi' ? fb.leads : [])
        } else {
          this.llmLive = false
          const fb = sim.answerQuestion(g, topic, this.playerRoom)
          applyAnswer(fb.answer, fb.leads)
        }
      }).catch(() => {
        const fb = sim.answerQuestion(g, topic, this.playerRoom)
        applyAnswer(fb.answer, fb.leads)
      })
    } else {
      // small delay for pacing
      const fb = this.sim.answerQuestion(g, topic, this.playerRoom)
      setTimeout(() => applyAnswer(fb.answer, fb.leads), 350)
    }
  }

  endInterview() {
    if (this.phase !== 'interview') return
    this.interview = null
    this.phase = 'playing'
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

  // ------------------------------------------------------------- LLM director

  /** Returns true to claim the decision (async); applies result or falls back. */
  private llmDecide = (g: Guest): boolean => {
    const sim = this.sim
    if (!sim || this.llmPending.has(g.id)) return false
    this.llmPending.add(g.id)
    llmDecision(
      { baseUrl: this.settings.llmBaseUrl, apiKey: this.settings.llmApiKey, model: this.settings.llmModel },
      g,
      sim.decisionContext(g),
    ).then(d => {
      if (d && this.sim === sim) {
        this.llmLive = true
        const ok = sim.applyLLMDecision(g, d)
        if (!ok) sim.decide(g)
        if (d.line && g.room === this.playerRoom) {
          this.pushLog(`${g.name}: “${d.line}”`, 'rumor')
        }
      } else if (this.sim === sim) {
        this.llmLive = false
        sim.decide(g)
      }
    }).catch(() => {
      if (this.sim === sim) sim.decide(g)
    }).finally(() => {
      this.llmPending.delete(g.id)
    })
    return true
  }

  // ------------------------------------------------------------- loop

  private frame = (ts: number) => {
    if (this.disposed) return
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000 || 0.016)
    this.lastTs = ts

    if (this.phase === 'playing' && this.sim) {
      this.stepPlaying(dt)
    }
    this.syncActors()
    this.world.update(dt)

    this.audio.onGameMinute(this.sim?.clockMin ?? 0)

    this.emitTimer += dt
    if (this.emitTimer > 0.15) {
      this.emitTimer = 0
      this.emit()
    }
    requestAnimationFrame(this.frame)
  }

  private stepPlaying(dt: number) {
    const sim = this.sim!
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
      const actorClear = (x: number, z: number) => !sim.aliveGuests().some(g => Math.hypot(g.x - x, g.z - z) < ACTOR_RADIUS * 2)
      if (canOccupy(nx, this.pz, ACTOR_RADIUS) && actorClear(nx, this.pz)) this.px = nx
      if (canOccupy(this.px, nz, ACTOR_RADIUS) && actorClear(this.px, nz)) this.pz = nz
    }
    const r = roomOfPoint(this.px, this.pz)
    if (r && r !== this.playerRoom) {
      this.playerRoom = r
      sim.playerRoom = r
      this.world.focusRoom(r)
      // discover bodies
      const found = sim.playerDiscovers(r)
      for (const body of found) {
        this.world.markBodyRoom(body.deathRoom!)
        this.audio.stinger('body')
        this.pushLog(`You found ${body.name}'s body.`, 'danger')
        this.pushLead('discovery', 'You', `You discovered ${body.name}'s body in the ${ROOM_BY_ID[r].name} (~${fmtTime(body.diedAtMin)}).`)
      }
    }

    sim.playerRoom = this.playerRoom
    sim.advance(dt, this.settings.speed)

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
    this.world.trackPlayer(this.px, this.pz, this.playerRoom)
    if (!sim) return
    for (const g of sim.guests) {
      const inRoom = g.room === this.playerRoom
      this.world.setActor(g.id, g.x, g.z, g.state === 'walk', inRoom)
      if (g.state === 'talk' && g.talkPartnerId) {
        const partner = sim.byId(g.talkPartnerId)
        if (partner) this.world.faceActorAt(g.id, partner.x, partner.z)
      }
    }
    if (this.phase === 'interview' && this.interview) {
      const guest = sim.byId(this.interview.guestId)
      if (guest) {
        this.world.faceActorAt('player', guest.x, guest.z)
        this.world.faceActorAt(guest.id, this.px, this.pz)
      }
    }
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
    clockText: fmtTime(this.sim?.clockMin ?? 0),
    hint: this.computeHint(),
  })
}
