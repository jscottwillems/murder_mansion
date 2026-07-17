// LLM layer: settings, OpenAI-compatible client, master prompts.
// Every NPC has a master prompt (personality) + an optional murderer addendum.
// When configured, decision ticks and interview answers are delegated to the LLM;
// on any failure the caller falls back to the built-in behavioral engine.
import type { Guest, QuestionTopic, RoomId } from './types'
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

function extractJson(text: string): unknown | null {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

/** Ask the LLM how this NPC should act next. Returns null on any failure. */
export async function llmDecision(
  cfg: LLMConfig,
  g: Guest,
  ctx: { clockMin: number; othersHere: string[]; roomsWithGuests: Record<string, number>; detectiveRoom: RoomId; knownRumors: string[] },
): Promise<NPCDecision | null> {
  try {
    const sys = masterPrompt(g) + (g.isKiller ? '\n' + murdererPrompt(g) : '')
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. You are in the ${ROOM_BY_ID[g.room].name}.`,
      `Guests in your room: ${ctx.othersHere.length ? ctx.othersHere.join(', ') : 'none'}.`,
      `Guests per room: ${JSON.stringify(ctx.roomsWithGuests)}.`,
      `The detective is currently in the ${ROOM_BY_ID[ctx.detectiveRoom].name} (${ctx.detectiveRoom}).`,
      `Things you know: ${ctx.knownRumors.slice(-5).join(' | ') || 'nothing yet'}.`,
      `Choose rest or idle unless there is a specific reason to move or a useful person here to talk to. Movement should feel intentional and infrequent.`,
      `Decide your next action. Reply ONLY with compact JSON: {"action":"move"|"talk"|"rest"|"idle","targetRoom":"${Object.keys(ROOM_BY_ID).join('|')}" (required for move),"targetGuest":"name" (optional, for talk),"line":"a short in-character remark or empty string"}.`,
    ].join('\n')
    const raw = await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
    const parsed = extractJson(raw) as Partial<NPCDecision> | null
    if (!parsed || typeof parsed.action !== 'string') return null
    if (!['move', 'talk', 'rest', 'idle'].includes(parsed.action)) return null
    if (parsed.action === 'move' && !(parsed.targetRoom && parsed.targetRoom in ROOM_BY_ID)) return null
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
}

/** Ask the LLM for an in-character interview answer. Returns null on failure. */
export async function llmAnswer(
  cfg: LLMConfig,
  g: Guest,
  ctx: {
    clockMin: number
    topic: QuestionTopic
    roomName: string
    rumors: string[]
    victims: string[]
    suspectNames: string[]
    talkedWith: string[]
  },
): Promise<string | null> {
  try {
    const sys = masterPrompt(g) + (g.isKiller ? '\n' + murdererPrompt(g) : '')
    const user = [
      `Time: ${fmtTime(ctx.clockMin)}. The detective is interviewing you in the ${ctx.roomName}.`,
      `Question topic: ${TOPIC_LABEL[ctx.topic]}.`,
      ctx.rumors.length ? `What you have heard tonight: ${ctx.rumors.join(' | ')}` : 'You have heard nothing useful yet.',
      ctx.victims.length ? `Known victims: ${ctx.victims.join(', ')}.` : 'No bodies found yet.',
      `Other guests: ${ctx.suspectNames.join(', ')}.`,
      `You have spoken with: ${ctx.talkedWith.join(', ') || 'no one yet'}.`,
      `Answer in character, 1-3 sentences. If the topic is intel/social and you know a rumor, work it in naturally. Do not output JSON or stage directions.`,
    ].join('\n')
    return await chat(cfg, [{ role: 'system', content: sys }, { role: 'user', content: user }])
  } catch {
    return null
  }
}
