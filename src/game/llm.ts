// LLM layer: settings, OpenAI-compatible client, master prompts.
// Every NPC has a master prompt (personality) + an optional murderer addendum.
// When configured, decision ticks and interview answers are delegated to the LLM;
// on any failure the caller falls back to the built-in behavioral engine.
import type { ConversationEmotion, Guest, QuestionTopic, RoomId } from './types'
import { ROOM_BY_ID, fmtTime, ARCHETYPES } from './data'

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

async function chat(cfg: LLMConfig, messages: ChatMessage[], timeoutMs = 9000): Promise<string> {
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
      body: JSON.stringify({ model: cfg.model, messages, temperature: 0.9, max_tokens: 220 }),
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
  const tag = EMOTION_SUFFIXES.map(pattern => unwrapped.match(pattern)).find(Boolean)
  const candidate = tag?.at(-1)?.toLowerCase() as ConversationEmotion | undefined
  const emotion = candidate && CONVERSATION_EMOTIONS.includes(candidate) ? candidate : 'neutral'
  return {
    text: normalizeSpokenDialogue(tag ? unwrapped.slice(0, tag.index).trim() : unwrapped),
    emotion,
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
      `AVAILABLE PORTRAIT EXPRESSIONS: neutral, suspicious, worried, angry, thoughtful, surprised. All six are available for this character.`,
      `EXPRESSION RULES: Use neutral only for a calm, routine answer. Use suspicious when guarded, evasive, distrustful, or challenging the detective's premise. Use worried when frightened, grieving, vulnerable, or afraid of implication. Use angry when offended, accused, pressured about a boundary, or repeatedly questioned—especially for the pressure topic or a repeated topic. Use thoughtful when carefully recalling or reasoning. Use surprised only for a genuinely unexpected revelation or question. Prefer the most specific non-neutral reaction that fits; do not default to neutral.`,
      `CHARACTER-SPECIFIC REACTION STYLE: ${REACTION_STYLE[g.archetypeId]}`,
      `Answer in character, 1-3 sentences. If the topic is intel/social and you know a rumor, work it in naturally.`,
      `RESPONSE FORMAT (REQUIRED): <plain spoken dialogue without surrounding quotation marks> [emotion]`,
      `Replace [emotion] with exactly one of these six tags: [neutral], [suspicious], [worried], [angry], [thoughtful], or [surprised].`,
      `Valid example: I saw him leave the library shortly after midnight. [suspicious]`,
      `The emotion tag must be the final token of the response, on the same line as the dialogue. Use square brackets exactly as shown. Do not wrap the dialogue in straight, curly, single, or doubled quotation marks. Do not use parentheses, an "emotion:" label, JSON, Markdown, stage directions, or any text after the tag.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
    return parseInterviewAnswer(raw)
  } catch {
    return null
  }
}
