// LLM layer: settings, OpenAI-compatible client, master prompts.
// Every NPC has a master prompt (personality) + an optional murderer addendum.
// When configured, decision ticks and interview answers are delegated to the LLM;
// on any failure the caller falls back to the built-in behavioral engine.
import type { ConversationEmotion, Guest, QuestionTopic, RoomId } from './types'
import { ROOM_BY_ID, fmtTime, ARCHETYPES } from './data'
import type { SceneEvidence } from './data'
import type { AuthoredDialogueRoute, AuthoredDialogueStage, AuthoredDialogueChoice } from './authoredDialogue'

export interface LLMConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export function archetypeOf(g: Guest) {
  return ARCHETYPES.find(a => a.id === g.archetypeId)!
}

/** The master prompt that dictates this NPC's personality and behavior. */
export function masterPrompt(g: Guest): string {
  const a = archetypeOf(g)
  return [
    `You are ${g.name}, the ${a.name}, a guest trapped in a stormbound mansion from midnight to sunrise. A detective is investigating a murder among the ten guests.`,
    `PERSONALITY: ${a.trait}. ${a.quirk}.`,
    `VOICE: ${a.voice} Always stay in character. Speak in 1-3 short sentences. Be evasive, personality-driven, and clue-rich — never generic exposition.`,
    `BEHAVIOR: Move deliberately, not constantly. Stay in a room long enough to plausibly read, observe, rest, or speak with someone. Change rooms only with a clear reason tied to your profession, a person you want to find, or information you want to pursue. Prefer rooms that suit your character, avoid immediately returning to the room you just left, and never dart aimlessly back and forth. Hold conversations and trade rumors when useful. You update what you believe as you hear new information; some of it may be mistaken.`,
  ].join('\n')
}

/** Second prompt given only to the randomly selected murderer. */
export function murdererPrompt(g: Guest): string {
  return [
    `SECRET: You are the murderer. Never confess or act suspicious.`,
    `HUNT CUNNINGLY: Your main strategic goal is to find a living guest who is alone, move to their room, and isolate yourself with them while keeping the detective elsewhere. Use the guest counts and detective location in each decision to seek rooms containing exactly one guest. Avoid crowded rooms, avoid drawing a group toward your intended target, and behave normally while waiting for a safe opportunity.`,
    `ABSOLUTE KILL RULE: Never attempt a kill while the detective is in your room. A safe kill opportunity requires one intended victim, no more than one additional living guest as a witness, and the detective in a different room. If any part of that condition is not true, do not attack: move toward an isolated guest, misdirect others, converse, rest, or wait instead. After a kill, leave promptly and blend back into normal social behavior.`,
    `COVER STORY: When asked who you suspect, deflect onto a specific innocent guest with a plausible detail. Lie about your whereabouts confidently and consistently. You may plant rumors naming innocent guests, but do not overplay your suspicion or reveal knowledge only the murderer would have.`,
    `(Your name is ${g.name}; maintain your cover personality at all times.)`,
  ].join('\n')
}

interface ChatMessage { role: 'system' | 'user'; content: string }

async function chat(cfg: LLMConfig, messages: ChatMessage[], timeoutMs = 9000, maxTokens = 220): Promise<string> {
  const base = cfg.baseUrl.replace(/\/$/, '') || 'https://api.openai.com/v1'
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: cfg.model, messages, temperature: 0.9, max_tokens: maxTokens }),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`)
    const json = await res.json()
    const content: string = json?.choices?.[0]?.message?.content ?? ''
    if (!content) throw new Error('LLM empty response')
    return content.trim()
  } finally {
    clearTimeout(t)
  }
}

export interface NPCDecision {
  action: 'move' | 'talk' | 'rest' | 'idle'
  targetRoom?: RoomId
  targetGuest?: string
  line?: string
}

function currentCaseMemory(lines: string[]): string {
  return [
    `CURRENT CASE MEMORY (this run only; treat it as the authoritative record of events you know):`,
    ...(lines.length ? lines.map(line => `- ${line}`) : ['- No relevant events yet.']),
    `Use these facts when relevant. Do not invent events, conversations, victims, or evidence that are not listed here.`,
  ].join('\n')
}

/** Normalize model dialogue to unquoted plain text for consistent UI/log rendering. */
export function normalizeSpokenDialogue(raw: string): string {
  let text = raw.trim().replace(/^```(?:text)?\s*/i, '').replace(/\s*```$/, '').trim()
  const pairs: [string, string][] = [['"', '"'], ["'", "'"], ['“', '”'], ['‘', '’']]
  let changed = true
  while (changed && text.length >= 2) {
    changed = false
    for (const [open, close] of pairs) {
      if (text.startsWith(open) && text.endsWith(close)) {
        text = text.slice(open.length, -close.length).trim()
        changed = true
        break
      }
    }
  }
  return text
}

function extractJson(text: string): unknown | null {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

/** Ask the LLM how this NPC should act next. Returns null on any failure. */
export async function llmDecision(
  cfg: LLMConfig,
  g: Guest,
  ctx: { clockMin: number; othersHere: string[]; roomsWithGuests: Record<string, number>; detectiveRoom: RoomId; knownRumors: string[]; caseEvents?: string[] },
): Promise<NPCDecision | null> {
  try {
    const sys = masterPrompt(g) + (g.isKiller ? '\n' + murdererPrompt(g) : '')
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. You are in the ${ROOM_BY_ID[g.room].name}.`,
      `Guests in your room: ${ctx.othersHere.length ? ctx.othersHere.join(', ') : 'none'}.`,
      `Guests per room: ${JSON.stringify(ctx.roomsWithGuests)}.`,
      `The detective is currently in the ${ROOM_BY_ID[ctx.detectiveRoom].name} (${ctx.detectiveRoom}).`,
      `Things you know: ${ctx.knownRumors.slice(-5).join(' | ') || 'nothing yet'}.`,
      currentCaseMemory(ctx.caseEvents ?? []),
      `Choose rest or idle unless there is a specific reason to move or a useful person here to talk to. Movement should feel intentional and infrequent.`,
      `RESPONSE FORMAT (REQUIRED): return exactly one compact JSON object and nothing else: {"action":"move"|"talk"|"rest"|"idle","targetRoom":"${Object.keys(ROOM_BY_ID).join('|')}" (required for move),"targetGuest":"name" (optional, for talk),"line":"plain dialogue without surrounding quotation marks, or an empty string"}. Do not use Markdown or code fences.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
    const parsed = extractJson(raw) as Partial<NPCDecision> | null
    if (!parsed || typeof parsed.action !== 'string') return null
    if (!['move', 'talk', 'rest', 'idle'].includes(parsed.action)) return null
    if (parsed.action === 'move' && !(parsed.targetRoom && parsed.targetRoom in ROOM_BY_ID)) return null
    if (typeof parsed.line === 'string') parsed.line = normalizeSpokenDialogue(parsed.line)
    return parsed as NPCDecision
  } catch {
    return null
  }
}

const TOPIC_LABEL: Record<QuestionTopic, string> = {
  timeline: 'Where were you, and when?',
  suspicion: 'Who do you suspect?',
  intel: 'What have you heard tonight?',
  alibi: 'Can anyone vouch for you?',
  room: 'What do you make of this room?',
  pressure: 'You are hiding something. Talk.',
  social: 'Who have you spoken with tonight?',
  victim: 'Did you know the victim?',
  last_seen: 'When did you last see the most recent victim?',
  connection: 'What connects the victims?',
  motive: 'Who benefits from these deaths?',
  survival: 'Why do you think you are still alive?',
  next_victim: 'Who do you think will be next?',
  follow_up: 'Explain what you just said in more detail.',
}

const CONVERSATION_EMOTIONS: ConversationEmotion[] = [
  'neutral', 'suspicious', 'worried', 'angry', 'thoughtful', 'surprised',
]

// All ten atlases share these six expression slots. This guidance personalizes
// when each established character is most likely to leave a neutral pose.
const REACTION_STYLE: Record<string, string> = {
  columnist: 'Become suspicious or angry when challenged; use surprised for genuinely fresh gossip or a revelation.',
  surgeon: 'Use thoughtful for precise recall, suspicious for flawed premises, and angry when your expertise or integrity is repeatedly questioned.',
  curator: 'Use thoughtful while observing, worried around death or danger, and angry when persistent pressure breaks your patience.',
  magician: 'Use suspicious when guarding a secret, surprised for a genuine reveal, and angry when the detective ignores a boundary.',
  correspondent: 'Use suspicious while evaluating claims, worried for credible danger, and angry under repeated or insulting pressure.',
  accountant: 'Use thoughtful for details, worried when money implicates you, and angry when accused or repeatedly interrogated.',
  vocalist: 'Use thoughtful for memories, worried around victims or threats, and angry when intimate subjects are pushed after you resist.',
  antiquarian: 'Use thoughtful for history, worried when implicated, surprised by new discoveries, and angry when accused or disrespected.',
  chauffeur: 'Use suspicious when withholding information and angry when the detective keeps pushing after a terse refusal.',
  debutante: 'Use surprised for revelations, worried when frightened or implicated, suspicious when underestimated, and angry when patronized or cornered.',
}

export interface LLMInterviewAnswer {
  text: string
  emotion: ConversationEmotion
  concluded: boolean
  /** @deprecated Evidence progression is game-owned. Always false for new responses. */
  evidenceMentioned: boolean
}

export type InvestigationChoiceEffect = 'advance' | 'stall' | 'close'

/**
 * A game-authored branch that the model may phrase, but may not create, remove,
 * or change. `effect` is deliberately omitted from the model's response.
 */
export interface InvestigationChoiceSpec {
  id: string
  effect: InvestigationChoiceEffect
  intent: string
}

export interface LLMInvestigationChoice {
  id: string
  label: string
}

export interface LLMThreadTurn {
  text: string
  emotion: ConversationEmotion
  concluded: boolean
  choices: LLMInvestigationChoice[]
}

const EMOTION_VALUE = '(neutral|suspicious|worried|angry|thoughtful|surprised)'
const EMOTION_LABEL = '(?:facial\\s+expression|emotion|mood|expression|state)'
const EMOTION_SUFFIXES = [
  // [angry], (angry), [emotion: angry], (mood = angry)
  new RegExp(`[\\[(]\\s*(?:${EMOTION_LABEL}\\s*[:=-]?\\s*)?${EMOTION_VALUE}\\s*[\\])]\\s*$`, 'i'),
  // (emotion) angry
  new RegExp(`[\\[(]\\s*${EMOTION_LABEL}\\s*[\\])]\\s*[:=-]?\\s*${EMOTION_VALUE}\\s*$`, 'i'),
  // Emotion: angry, either on the answer line or its own final line.
  new RegExp(`(?:^|\\s+)${EMOTION_LABEL}\\s*[:=-]\\s*${EMOTION_VALUE}\\s*$`, 'i'),
  // A bare emotion is accepted only when the model puts it on its own final line.
  new RegExp(`(?:^|\\n)\\s*${EMOTION_VALUE}\\s*$`, 'i'),
]

/** Remove a trailing portrait-control suffix in the formats models commonly emit. */
export function parseInterviewAnswer(raw: string): LLMInterviewAnswer {
  // Some models wrap the entire required payload, including the emotion tag,
  // so remove those wrappers before looking for the suffix.
  const unwrapped = normalizeSpokenDialogue(raw)
  const evidenceTag = unwrapped.match(/\s*\[(evidence|no-evidence)\]\s*$/i)
  const withoutEvidence = evidenceTag ? unwrapped.slice(0, evidenceTag.index).trim() : unwrapped
  const statusTag = withoutEvidence.match(/\s*\[(continue|closed)\]\s*$/i)
  const withoutStatus = statusTag ? withoutEvidence.slice(0, statusTag.index).trim() : withoutEvidence
  const tag = EMOTION_SUFFIXES.map(pattern => withoutStatus.match(pattern)).find(Boolean)
  const candidate = tag?.at(-1)?.toLowerCase() as ConversationEmotion | undefined
  const emotion = candidate && CONVERSATION_EMOTIONS.includes(candidate) ? candidate : 'neutral'
  return {
    text: normalizeSpokenDialogue(tag ? withoutStatus.slice(0, tag.index).trim() : withoutStatus),
    emotion,
    concluded: statusTag?.[1].toLowerCase() === 'closed',
    evidenceMentioned: evidenceTag?.[1].toLowerCase() === 'evidence',
  }
}

/** Ask the LLM for an in-character interview answer. Returns null on failure. */
export async function llmAnswer(
  cfg: LLMConfig,
  g: Guest,
  ctx: {
    clockMin: number
    topic: QuestionTopic
    questionLabel?: string
    roomName: string
    rumors: string[]
    victims: string[]
    suspectNames: string[]
    talkedWith: string[]
    caseEvents: string[]
    questionsAsked: number
    timesAskedTopic: number
    evidenceCue?: SceneEvidence
  },
): Promise<LLMInterviewAnswer | null> {
  try {
    const sys = masterPrompt(g) + (g.isKiller ? '\n' + murdererPrompt(g) : '')
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. The detective is interviewing you in the ${ctx.roomName}.`,
      `The detective asks: ${ctx.questionLabel ?? TOPIC_LABEL[ctx.topic]}`,
      ctx.rumors.length ? `What you have heard tonight: ${ctx.rumors.join(' | ')}` : 'You have heard nothing useful yet.',
      ctx.victims.length ? `Known victims: ${ctx.victims.join(', ')}.` : 'No bodies found yet.',
      `Other guests: ${ctx.suspectNames.join(', ')}.`,
      `You have spoken with: ${ctx.talkedWith.join(', ') || 'no one yet'}.`,
      currentCaseMemory(ctx.caseEvents),
      `Interview history: the detective has already asked you ${ctx.questionsAsked} question${ctx.questionsAsked === 1 ? '' : 's'}; this topic has been asked ${ctx.timesAskedTopic} time${ctx.timesAskedTopic === 1 ? '' : 's'} before.`,
      `If you have already fully answered this line of inquiry, would only repeat yourself, have no further relevant information, or the exchange has naturally concluded, mark the conversation closed. Otherwise keep it open. Do not invent a new fact merely to keep talking.`,
      `AVAILABLE PORTRAIT EXPRESSIONS: neutral, suspicious, worried, angry, thoughtful, surprised. All six are available for this character.`,
      `EXPRESSION RULES: Use neutral only for a calm, routine answer. Use suspicious when guarded, evasive, distrustful, or challenging the detective's premise. Use worried when frightened, grieving, vulnerable, or afraid of implication. Use angry when offended, accused, pressured about a boundary, or repeatedly questioned—especially for the pressure topic or a repeated topic. Use thoughtful when carefully recalling or reasoning. Use surprised only for a genuinely unexpected revelation or question. Prefer the most specific non-neutral reaction that fits; do not default to neutral.`,
      `CHARACTER-SPECIFIC REACTION STYLE: ${REACTION_STYLE[g.archetypeId]}`,
      `EVIDENCE CONTROL: You do not decide whether evidence is revealed. Do not emit an evidence tag or claim that an association has been unlocked.`,
      `Answer in character, 1-3 sentences. If the topic is intel/social and you know a rumor, work it in naturally.`,
      `RESPONSE FORMAT (REQUIRED): <plain spoken dialogue without surrounding quotation marks> [emotion] [status]`,
      `Replace [emotion] with exactly one of these six tags: [neutral], [suspicious], [worried], [angry], [thoughtful], or [surprised].`,
      `Replace [status] with [continue] when another useful question could advance the exchange, or [closed] when there is nothing meaningful left to discuss right now.`,
      `Valid example: I saw him leave the library shortly after midnight. [suspicious] [continue]`,
      `Both tags must be the final tokens on the same line as the dialogue. Use square brackets exactly as shown. Do not wrap the dialogue in quotation marks. Do not use labels, JSON, Markdown, stage directions, evidence-control tags, or any text after the status tag.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
    return parseInterviewAnswer(raw)
  } catch {
    return null
  }
}

function parseWholeJson(raw: string): unknown | null {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try { return JSON.parse(text) } catch { return null }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function validQuestionLabel(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const label = normalizeSpokenDialogue(raw).replace(/\s+/g, ' ').trim()
  if (label.length < 8 || label.length > 140) return null
  if (!label.endsWith('?')) return null
  if (/^(tell me more|can you elaborate|what do you mean|why is that important|what aren['’]t you telling me|is there anything else)\b/i.test(label)) return null
  return label
}

const PLAN_TOPICS: QuestionTopic[] = ['timeline', 'suspicion', 'intel', 'alibi', 'room', 'pressure', 'social', 'victim', 'last_seen', 'connection', 'motive', 'survival', 'next_victim']
const PREMATURE_DEATH_REFERENCE = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i

function planText(raw: unknown, min: number, max: number): string | null {
  if (typeof raw !== 'string') return null
  const text = normalizeSpokenDialogue(raw).replace(/\s+/g, ' ').trim()
  if (text.length < min || text.length > max || /\[(?:evidence|advance|stall|close|continue|closed)\]/i.test(text)) return null
  return text
}

function parsePlanChoice(raw: unknown, knownVictims: string[]): AuthoredDialogueChoice | null {
  if (!isPlainObject(raw) || Object.keys(raw).some(key => !['label', 'response', 'emotion'].includes(key))) return null
  const label = planText(raw.label, 6, 140)
  const response = planText(raw.response, 3, 500)
  const emotion = raw.emotion as ConversationEmotion
  if (!label || !response || !CONVERSATION_EMOTIONS.includes(emotion)) return null
  if (knownVictims.length === 0 && (PREMATURE_DEATH_REFERENCE.test(label) || PREMATURE_DEATH_REFERENCE.test(response))) return null
  return { label, response, emotion }
}

function parsePlanStage(raw: unknown, knownVictims: string[]): AuthoredDialogueStage | null {
  if (!isPlainObject(raw) || Object.keys(raw).sort().join('|') !== 'advance|close|stall') return null
  const advance = parsePlanChoice(raw.advance, knownVictims)
  const stall = parsePlanChoice(raw.stall, knownVictims)
  const close = parsePlanChoice(raw.close, knownVictims)
  if (!advance || !stall || !close) return null
  const labels = [advance.label, stall.label, close.label].map(label => label.toLowerCase().replace(/\W/g, ''))
  if (new Set(labels).size !== 3) return null
  return { advance, stall, close }
}

/**
 * Plan and freeze an NPC's complete interview graph in one request. The model
 * authors every visible line and selects where each allowed association lives;
 * the game validates the graph and remains responsible for applying its paths.
 */
export async function llmConversationPlan(
  cfg: LLMConfig,
  g: Guest,
  ctx: {
    clockMin: number
    roomName: string
    knownVictims: string[]
    caseEvents: string[]
    otherGuests: string[]
    evidence: SceneEvidence[]
  },
): Promise<AuthoredDialogueRoute[] | null> {
  try {
    if (ctx.evidence.length !== 3 || new Set(ctx.evidence.map(item => item.id)).size !== 3) return null
    const routeSpecs = [
      ...ctx.evidence.map(item => ({ id: `llm:${item.id}`, evidenceId: item.id, evidence: item })),
      { id: 'llm:information', evidenceId: null, evidence: null },
    ]
    const sys = [
      masterPrompt(g),
      g.isKiller ? murdererPrompt(g) : '',
      `You are planning the COMPLETE interactive interview for this NPC before the player sees any questions. Return the entire immutable branching conversation as JSON. The game will save it for this run; no later model call will rewrite a response or choice.`,
    ].filter(Boolean).join('\n')
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. Interview location: ${ctx.roomName}.`,
      `Other guests: ${ctx.otherGuests.join(', ')}.`,
      currentCaseMemory(ctx.caseEvents),
      ctx.knownVictims.length
        ? `KNOWN VICTIMS: ${ctx.knownVictims.join(', ')}. Mention only these discovered victims.`
        : `KNOWN VICTIMS: None. No body has been discovered. Every root, answer, choice, and response must avoid victim, murder, killing, death, corpse, body, or any implication that someone has died.`,
      `Create exactly four distinct conversation routes using these exact immutable route assignments:`,
      ...routeSpecs.map(spec => spec.evidence
        ? `- id=${JSON.stringify(spec.id)}, evidenceId=${JSON.stringify(spec.evidenceId)}. This route's second-stage ADVANCE response is the reveal moment for this allowed association: ${spec.evidence.description} Build a fair two-step conversational trail toward an ordinary habit, possession, material, scent, residue, or activity. Do not use the evidence label ${JSON.stringify(spec.evidence.label)} in dialogue and do not call it evidence or a clue.`
        : `- id=${JSON.stringify(spec.id)}, evidenceId=null. This is an information/personality route and must never imply a physical evidence association.`),
      `For EACH route: write one unique detective root question, one in-character opening response, and exactly two stages. Each stage has ADVANCE, STALL, and CLOSE choices. Every choice contains the player's exact dialogue label plus the NPC response and portrait emotion it will produce.`,
      `ADVANCE must follow a concrete hook planted in the preceding response and move toward the route's planned reveal. STALL must be plausible and yield characterful context without revealing the association. CLOSE must naturally end that subject. The second-stage ADVANCE response is the only reveal moment.`,
      `Plan the paths now as a coherent whole: later choices must explicitly follow facts established earlier. Make all roots and choices distinct, specific, and genuinely useful to choose between. Never use generic lines such as "tell me more", "what do you mean", "why is that important", or "what aren't you telling me".`,
      `Allowed topic values: ${PLAN_TOPICS.join('|')}. Allowed emotion values: ${CONVERSATION_EMOTIONS.join('|')}.`,
      `RESPONSE FORMAT (REQUIRED): return exactly one JSON object, no Markdown, commentary, tags, or surrounding quotes. Use this exact shape:`,
      `{"routes":[{"id":"exact supplied id","topic":"allowed topic","evidenceId":"exact supplied evidence id or null","rootQuestion":"detective question?","openingResponse":"NPC response","openingEmotion":"allowed emotion","stages":[{"advance":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"},"stall":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"},"close":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"}},{"advance":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"},"stall":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"},"close":{"label":"player dialogue","response":"NPC response","emotion":"allowed emotion"}}]}]}`,
      `The routes array must contain exactly four entries in the supplied order. Do not add fields.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }], 24000, 3200)
    const parsed = parseWholeJson(raw)
    if (!isPlainObject(parsed) || Object.keys(parsed).join('|') !== 'routes' || !Array.isArray(parsed.routes) || parsed.routes.length !== 4) return null
    const routes: AuthoredDialogueRoute[] = []
    const rootFingerprints = new Set<string>()
    for (let index = 0; index < routeSpecs.length; index++) {
      const rawRoute = parsed.routes[index]
      const spec = routeSpecs[index]
      if (!isPlainObject(rawRoute) || Object.keys(rawRoute).some(key => !['id', 'topic', 'evidenceId', 'rootQuestion', 'openingResponse', 'openingEmotion', 'stages'].includes(key))) return null
      if (rawRoute.id !== spec.id || rawRoute.evidenceId !== spec.evidenceId || typeof rawRoute.topic !== 'string' || !PLAN_TOPICS.includes(rawRoute.topic as QuestionTopic)) return null
      const rootQuestion = planText(rawRoute.rootQuestion, 8, 150)
      const openingResponse = planText(rawRoute.openingResponse, 3, 500)
      const openingEmotion = rawRoute.openingEmotion as ConversationEmotion
      if (!rootQuestion?.endsWith('?') || !openingResponse || !CONVERSATION_EMOTIONS.includes(openingEmotion) || !Array.isArray(rawRoute.stages) || rawRoute.stages.length !== 2) return null
      if (ctx.knownVictims.length === 0 && (PREMATURE_DEATH_REFERENCE.test(rootQuestion) || PREMATURE_DEATH_REFERENCE.test(openingResponse))) return null
      const fingerprint = rootQuestion.toLowerCase().replace(/\W/g, '')
      if (rootFingerprints.has(fingerprint)) return null
      rootFingerprints.add(fingerprint)
      const first = parsePlanStage(rawRoute.stages[0], ctx.knownVictims)
      const second = parsePlanStage(rawRoute.stages[1], ctx.knownVictims)
      if (!first || !second) return null
      routes.push({ id: spec.id, topic: rawRoute.topic as QuestionTopic, evidenceId: spec.evidenceId ?? undefined, rootQuestion, openingResponse, openingEmotion, stages: [first, second] })
    }
    return routes
  } catch {
    return null
  }
}

/**
 * Render one state-machine-controlled investigation turn. The caller owns all
 * effects and progression; this function only writes dialogue and choice labels.
 */
export async function llmThreadTurn(
  cfg: LLMConfig,
  g: Guest,
  ctx: {
    clockMin: number
    roomName: string
    detectiveQuestion: string
    latestAnswer?: string
    caseEvents: string[]
    knownVictims: string[]
    threadHistory: { question: string; answer: string }[]
    stageGoal: string
    selectedEffect: InvestigationChoiceEffect | 'root'
    nextChoices: InvestigationChoiceSpec[]
    terminal: boolean
    evidenceCue?: SceneEvidence
  },
): Promise<LLMThreadTurn | null> {
  try {
    if (ctx.terminal ? ctx.nextChoices.length !== 0 : ctx.nextChoices.length !== 3) return null
    const ids = ctx.nextChoices.map(choice => choice.id)
    if (new Set(ids).size !== ids.length || ids.some(id => !id || id.length > 80)) return null
    if (ctx.nextChoices.some(choice => !['advance', 'stall', 'close'].includes(choice.effect) || !choice.intent.trim())) return null

    const sys = [
      masterPrompt(g),
      g.isKiller ? murdererPrompt(g) : '',
      `You are rendering one turn in a game-owned investigation state machine. The game alone controls branch effects, progress, closure, and evidence unlocks. Never invent a branch ID, alter an ID, announce an effect, or claim an unlock.`,
    ].filter(Boolean).join('\n')
    const privateBranches = ctx.nextChoices.map(choice =>
      `- id=${JSON.stringify(choice.id)}; private effect=${choice.effect}; detective intent=${choice.intent}`,
    ).join('\n')
    const history = ctx.threadHistory.slice(-6).map(turn =>
      `Detective: ${turn.question}\n${g.name}: ${turn.answer}`,
    ).join('\n') || 'No earlier turns in this thread.'
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. Location: ${ctx.roomName}.`,
      ctx.knownVictims.length
        ? `KNOWN VICTIMS: ${ctx.knownVictims.join(', ')}. The detective may ask about these named victims only.`
        : `KNOWN VICTIMS: None. No body has been discovered and the detective does not yet know anyone has been murdered. Do not mention or imply a victim, murder, killing, death, corpse, or body in the answer or in any detective choice. Do not ask whether the guest can discuss "the victim yet." Keep every choice grounded in ordinary whereabouts, relationships, observations, and suspicious behavior tonight.`,
      `Detective's selected question: ${ctx.detectiveQuestion}`,
      ctx.latestAnswer ? `Most recent NPC answer before this selection: ${ctx.latestAnswer}` : '',
      `Game-owned result of that selection: ${ctx.selectedEffect}. Reflect this result naturally, but never name the result or discuss game mechanics.`,
      `Current stage goal: ${ctx.stageGoal}`,
      `THREAD HISTORY:\n${history}`,
      currentCaseMemory(ctx.caseEvents),
      ctx.evidenceCue
        ? `FINAL-STAGE DETAIL: Naturally include one subtle ordinary detail grounded in: ${ctx.evidenceCue.description} Do not say the label ${JSON.stringify(ctx.evidenceCue.label)}, call it evidence/a clue, or explain its significance.`
        : `FINAL-STAGE DETAIL: None. Do not invent physical traces, possessions, stains, scents, residues, or materials solely to manufacture a clue.`,
      ctx.terminal
        ? `This thread has reached its terminal turn. Conclude the subject naturally and return no choices.`
        : `Write exactly three next detective choices using the exact opaque IDs below. Each label must be a concise question grounded in a concrete statement in your new answer or the thread history. Phrase the intents distinctly and make the productive route fairly inferable from the answer. A stall/close choice must still sound plausible, not obviously marked as wrong.`,
      ctx.terminal ? '' : `PRIVATE BRANCH SPECIFICATIONS (never expose effects or intents verbatim):\n${privateBranches}`,
      `Do not repeat or paraphrase a prior question. Ban generic prompts such as "Tell me more", "Can you elaborate?", "What do you mean?", "Why is that important?", "What aren't you telling me?", and "Anything else?".`,
      `Return exactly one compact JSON object and nothing else. Schema: {"answer":"1-3 short in-character sentences, no surrounding quotes or tags","emotion":"neutral|suspicious|worried|angry|thoughtful|surprised","status":"open|closed","choices":[{"id":"exact supplied opaque ID","label":"specific question?"}]}.`,
      ctx.terminal
        ? `Required: status="closed" and choices=[].`
        : `Required: status="open" and exactly three choices, one for each supplied ID, in the supplied order. Do not include effect, intent, evidence, progress, Markdown, or extra keys.`,
    ].filter(Boolean).join('\n')

    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
    const parsed = parseWholeJson(raw)
    if (!isPlainObject(parsed)) return null
    if (Object.keys(parsed).some(key => !['answer', 'emotion', 'status', 'choices'].includes(key))) return null
    if (typeof parsed.answer !== 'string' || typeof parsed.emotion !== 'string' || typeof parsed.status !== 'string' || !Array.isArray(parsed.choices)) return null
    const text = normalizeSpokenDialogue(parsed.answer).replace(/\s+/g, ' ').trim()
    if (!text || text.length > 500 || /\[(?:evidence|no-evidence|continue|closed)\]\s*$/i.test(text)) return null
    const prematureDeathReference = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i
    if (ctx.knownVictims.length === 0 && prematureDeathReference.test(text)) return null
    const emotion = parsed.emotion as ConversationEmotion
    if (!CONVERSATION_EMOTIONS.includes(emotion)) return null
    if (ctx.terminal) {
      if (parsed.status !== 'closed' || parsed.choices.length !== 0) return null
      return { text, emotion, concluded: true, choices: [] }
    }
    if (parsed.status !== 'open' || parsed.choices.length !== 3) return null
    const priorLabels = new Set(ctx.threadHistory.map(turn => turn.question.toLowerCase().replace(/\W/g, '')))
    const choices: LLMInvestigationChoice[] = []
    for (let i = 0; i < parsed.choices.length; i++) {
      const choice = parsed.choices[i]
      if (!isPlainObject(choice) || Object.keys(choice).some(key => !['id', 'label'].includes(key))) return null
      if (choice.id !== ids[i]) return null
      const label = validQuestionLabel(choice.label)
      if (!label) return null
      if (ctx.knownVictims.length === 0 && prematureDeathReference.test(label)) return null
      const fingerprint = label.toLowerCase().replace(/\W/g, '')
      if (priorLabels.has(fingerprint) || choices.some(existing => existing.label.toLowerCase().replace(/\W/g, '') === fingerprint)) return null
      choices.push({ id: choice.id as string, label })
    }
    return { text, emotion, concluded: false, choices }
  } catch {
    return null
  }
}

/** Ask the model to write the detective's next useful, answer-specific probe. */
export async function llmFollowUpQuestion(
  cfg: LLMConfig,
  g: Guest,
  ctx: {
    latestQuestion: string
    latestAnswer: string
    priorQuestions: string[]
    caseEvents: string[]
  },
): Promise<string | null> {
  try {
    const user = [
      `You are writing ONE optional follow-up question for the detective to ask ${g.name}, the ${archetypeOf(g).name}. Do not answer as ${g.name}.`,
      `Latest detective question: ${ctx.latestQuestion}`,
      `Latest character answer: ${ctx.latestAnswer}`,
      currentCaseMemory(ctx.caseEvents),
      `Questions already asked: ${ctx.priorQuestions.join(' | ') || 'none'}.`,
      `Choose one concrete unresolved detail, contradiction, named person, location, time, motive, relationship, or claim from the latest answer and ask about it directly. The question must create a realistic chance to reveal new case information or clarify a specific inconsistency.`,
      `Do not merely paraphrase the previous question. Do not repeat an already-asked question. Never use generic prompts such as "What aren't you telling me?", "Why is that important?", "Tell me more", "Can you elaborate?", or "What do you mean?".`,
      `If the answer contains no specific thread that could meaningfully advance the investigation, return null instead of inventing one.`,
      `RESPONSE FORMAT (REQUIRED): exactly one compact JSON object and nothing else: {"question":"a single concise detective question ending in ?"} or {"question":null}. Do not use Markdown or quotation marks around the entire JSON object.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: 'Write precise detective interview follow-up questions grounded only in the supplied case record.' }, { role: 'user', content: user }])
    const parsed = extractJson(raw) as { question?: unknown } | null
    if (!parsed || typeof parsed.question !== 'string') return null
    const question = normalizeSpokenDialogue(parsed.question).replace(/\s+/g, ' ').trim()
    if (question.length < 8 || question.length > 140) return null
    const generic = /^(tell me more|can you elaborate|what do you mean|why is that important|what aren['’]t you telling me)/i
    if (generic.test(question)) return null
    return question.endsWith('?') ? question : `${question}?`
  } catch {
    return null
  }
}
