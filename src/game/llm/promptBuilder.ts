import { ROOM_BY_ID } from '../data'
import { DOSSIERS } from '../narrative/dossierStoryData'
import type {
  FactSource,
  LegalBeat,
  NarrativeCaseState,
  RoleMode,
  VoiceCard,
} from '../narrative/types'
import type { ArchetypeId, ConversationEmotion, Guest } from '../types'

export const BEAT_PROMPT_VERSION = 'mm-beat-2'

export const BEAT_EMOTIONS = [
  'neutral',
  'suspicious',
  'worried',
  'angry',
  'thoughtful',
  'surprised',
] as const satisfies readonly ConversationEmotion[]

export type KnowledgePhase = 'pre-discovery' | 'post-discovery'

export interface AtomicFact {
  factId: string
  source: FactSource
  proposition: string
  attribution?: {
    sourceId: string
    displayName: string
    requiredPhrase: string
  }
  requiredAnchors: string[]
}

export interface BeatChoiceSpec {
  choiceId: string
  intent: LegalBeat['choices'][number]['intent']
  labelDirective: string
  requiredAnchors: string[]
}

export interface BeatPacket {
  packetVersion: 1
  promptVersion: string
  caseSeed: string
  beatId: string
  beatRevision: number
  guest: {
    guestId: string
    displayName: string
    archetypeId: ArchetypeId
    roleMode: RoleMode
  }
  posture: {
    trustBand: 'low' | 'mid' | 'high'
    pressureBand: 'low' | 'mid' | 'high'
    tellIds: string[]
  }
  knowledgePhase: KnowledgePhase
  publicVictims: Array<{ guestId: string; displayName: string }>
  beat: {
    intent: string
    facts: AtomicFact[]
    noNewFact: boolean
    options: BeatChoiceSpec[]
  }
  coverFacts?: {
    preAnchor: { room: string; timeBand: string }
    privateInterval: { room: string; timeBand: string; claimedWitness: string }
    reentry: { room: string; timeBand: string; witness: string }
    allowedClaimIds: string[]
  }
  safeguards: {
    allowedProperNouns: string[]
    allowedTimes: string[]
    allowedRooms: string[]
    requiredAnchors: string[]
    forbiddenTerms: string[]
    recentNpcLines: string[]
    recentOptionLabels: string[]
  }
  limits: {
    npcWords: 32
    npcSentences: 2
    optionWords: 14
    optionCount: number
  }
}

export interface BeatPresentation {
  npcLine: string
  emotion: ConversationEmotion
  options: Array<{ choiceId: string; label: string }>
}

export interface BeatPacketContext {
  beatRevision?: number
  safeFacts?: AtomicFact[]
  noNewFact?: boolean
  allowedProperNouns?: string[]
  allowedTimes?: string[]
  allowedRooms?: string[]
  requiredAnchors?: string[]
  choiceRequiredAnchors?: Readonly<Record<string, readonly string[]>>
  forbiddenTerms?: string[]
  recentNpcLines?: string[]
  recentOptionLabels?: string[]
  coverRequiredClaimIds?: string[]
}

export interface BuiltBeatRequest {
  packet: BeatPacket
  fallback: BeatPresentation
  systemPrompt: string
  userPrompt: string
}

export interface BeatVoiceContext {
  trustBand: BeatPacket['posture']['trustBand']
  pressureBand: BeatPacket['posture']['pressureBand']
  roleMode: RoleMode
}

function canonicalValue(value: unknown): unknown {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return typeof value === 'string' ? value.normalize('NFC') : value
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON rejects non-finite numbers')
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => {
        if (entry === undefined) throw new TypeError('Canonical JSON rejects undefined')
        return [key, canonicalValue(entry)]
      })
    return Object.fromEntries(entries)
  }
  throw new TypeError(`Canonical JSON rejects ${typeof value}`)
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value))
}

function activeVoiceRules(voiceCard: VoiceCard, context: BeatVoiceContext): string[] {
  return unique([
    ...voiceCard.base,
    ...(context.trustBand === 'high' ? voiceCard.trust : []),
    ...(context.pressureBand === 'high' ? voiceCard.pressure : []),
    ...voiceCard[context.roleMode],
  ])
}

function optionalList(key: string, values: readonly string[]): Record<string, readonly string[]> {
  return values.length ? { [key]: values } : {}
}

/** Provider-facing projection. Local IDs and empty/default state remain only in `BeatPacket`. */
export function buildBeatRenderPacket(packet: BeatPacket): Record<string, unknown> {
  const facts = packet.beat.facts.map(fact => ({
    text: fact.proposition,
    ...(fact.source === 'public' ? {} : { source: fact.source }),
    ...(fact.attribution ? {
      attribution: {
        name: fact.attribution.displayName,
        phrase: fact.attribution.requiredPhrase,
      },
    } : {}),
    ...optionalList('anchors', fact.requiredAnchors),
  }))
  const options = packet.beat.options.map(option => ({
    choiceId: option.choiceId,
    intent: option.intent,
    directive: option.labelDirective,
    ...optionalList('anchors', option.requiredAnchors),
  }))
  const safeguards = {
    ...optionalList('names', packet.safeguards.allowedProperNouns),
    ...optionalList('times', packet.safeguards.allowedTimes),
    ...optionalList('rooms', packet.safeguards.allowedRooms),
    ...optionalList('anchors', packet.safeguards.requiredAnchors),
    ...optionalList('forbidden', packet.safeguards.forbiddenTerms),
    ...optionalList('avoidNpcLines', packet.safeguards.recentNpcLines),
    ...optionalList('avoidOptionLabels', packet.safeguards.recentOptionLabels),
  }
  const cover = packet.coverFacts?.allowedClaimIds.length ? packet.coverFacts : undefined
  return {
    speaker: {
      name: packet.guest.displayName,
      role: packet.guest.roleMode,
    },
    knowledge: packet.knowledgePhase,
    ...(packet.publicVictims.length ? {
      victims: packet.publicVictims.map(victim => victim.displayName),
    } : {}),
    beat: {
      intent: packet.beat.intent,
      facts,
      ...(packet.beat.noNewFact ? { noNewFact: true } : {}),
      options,
    },
    ...(cover ? { cover } : {}),
    ...(Object.keys(safeguards).length ? { safeguards } : {}),
    limits: {
      npcWords: packet.limits.npcWords,
      npcSentences: packet.limits.npcSentences,
      optionWords: packet.limits.optionWords,
    },
  }
}

export function buildBeatSystemPrompt(
  voiceCard: VoiceCard,
  context: BeatVoiceContext,
  promptVersion = BEAT_PROMPT_VERSION,
): string {
  return `MURDER MANSION DIALOGUE RENDERER ${promptVersion}
Render one authored 1931 mystery beat. PACKET is exhaustive: add no fact, name, relationship, observation, object, room, time, motive, alibi, route, culprit, or conclusion.
Realize facts naturally. Keep rumors attributed; never turn hearsay or inference into eyewitness knowledge. Use cover only when supplied. Never imply inherent guilt or innocence.
Obey every safeguard and limit. Return minified JSON with exactly npcLine, emotion, options. Options contain exactly choiceId and label; copy IDs unchanged and in order.
emotion must be one of: ${BEAT_EMOTIONS.join(', ')}.
ACTIVE_VOICE=${canonicalJson(activeVoiceRules(voiceCard, context))}`
}

function band(value: number): 'low' | 'mid' | 'high' {
  if (value >= 3) return 'high'
  if (value <= 0) return 'low'
  return 'mid'
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.map(value => value.normalize('NFC').trim()).filter(Boolean))]
}

function roomName(roomId: keyof typeof ROOM_BY_ID): string {
  return ROOM_BY_ID[roomId].name
}

function displayName(state: NarrativeCaseState, guestId: string): string {
  return state.characters[guestId]?.displayName ?? guestId
}

export function buildBeatPacket(
  legalBeat: LegalBeat,
  state: NarrativeCaseState,
  guest: Guest,
  context: BeatPacketContext = {},
): BuiltBeatRequest {
  const character = state.characters[guest.id]
  if (!character) throw new Error(`Missing narrative character ${guest.id}`)
  if (character.archetypeId !== guest.archetypeId || legalBeat.node.owner !== guest.archetypeId) {
    throw new Error('Legal beat does not belong to the supplied guest')
  }
  const dossier = DOSSIERS[guest.archetypeId]
  const publicVictims = Object.values(state.characters)
    .filter(candidate => !candidate.alive && candidate.discovered)
    .map(candidate => ({ guestId: candidate.guestId, displayName: candidate.displayName }))
  const safeFacts = context.safeFacts ?? [{
    factId: `${legalBeat.node.id}:authored`,
    source: 'public' as const,
    proposition: legalBeat.node.text,
    requiredAnchors: [],
  }]
  const options = legalBeat.choices.map(choice => ({
    choiceId: choice.id,
    intent: choice.intent,
    labelDirective: choice.label,
    requiredAnchors: [...(context.choiceRequiredAnchors?.[choice.id] ?? [])],
  }))
  const tellIds = [
    ...(band(character.trust) === 'high' ? [`${guest.archetypeId}:trust`] : []),
    ...(band(character.pressure) === 'high' ? [`${guest.archetypeId}:pressure`] : []),
  ]
  const cover = character.cover
  const packet: BeatPacket = {
    packetVersion: 1,
    promptVersion: BEAT_PROMPT_VERSION,
    caseSeed: state.caseSeed,
    beatId: legalBeat.node.id,
    beatRevision: context.beatRevision ?? 0,
    guest: {
      guestId: guest.id,
      displayName: guest.name,
      archetypeId: guest.archetypeId,
      roleMode: character.roleMode,
    },
    posture: {
      trustBand: band(character.trust),
      pressureBand: band(character.pressure),
      tellIds,
    },
    knowledgePhase: publicVictims.length ? 'post-discovery' : 'pre-discovery',
    publicVictims,
    beat: {
      intent: legalBeat.node.phase,
      facts: safeFacts.map(fact => ({
        ...fact,
        requiredAnchors: unique(fact.requiredAnchors),
      })),
      noNewFact: context.noNewFact ?? safeFacts.length === 0,
      options,
    },
    ...(cover ? {
      coverFacts: {
        preAnchor: { room: roomName(cover.preAnchor.room), timeBand: cover.preAnchor.timeBand },
        privateInterval: {
          room: roomName(cover.privateInterval.room),
          timeBand: cover.privateInterval.timeBand,
          claimedWitness: displayName(state, cover.privateInterval.claimedWitnessId),
        },
        reentry: {
          room: roomName(cover.reentry.room),
          timeBand: cover.reentry.timeBand,
          witness: displayName(state, cover.reentry.witnessId),
        },
        allowedClaimIds: [...(context.coverRequiredClaimIds ?? [])],
      },
    } : {}),
    safeguards: {
      allowedProperNouns: unique([
        guest.name,
        ...publicVictims.map(victim => victim.displayName),
        ...(context.allowedProperNouns ?? []),
      ]),
      allowedTimes: unique(context.allowedTimes ?? []),
      allowedRooms: unique(context.allowedRooms ?? []),
      requiredAnchors: unique(context.requiredAnchors ?? []),
      forbiddenTerms: unique([...dossier.voice.banned, ...(context.forbiddenTerms ?? [])]),
      recentNpcLines: [...(context.recentNpcLines ?? [])],
      recentOptionLabels: [...(context.recentOptionLabels ?? [])],
    },
    limits: {
      npcWords: 32,
      npcSentences: 2,
      optionWords: 14,
      optionCount: options.length,
    },
  }
  const fallback: BeatPresentation = {
    npcLine: legalBeat.node.text,
    emotion: legalBeat.node.emotion,
    options: legalBeat.choices.map(choice => ({ choiceId: choice.id, label: choice.label })),
  }
  const systemPrompt = buildBeatSystemPrompt(dossier.voice, {
    trustBand: packet.posture.trustBand,
    pressureBand: packet.posture.pressureBand,
    roleMode: packet.guest.roleMode,
  })
  return {
    packet,
    fallback,
    systemPrompt,
    userPrompt: canonicalJson(buildBeatRenderPacket(packet)),
  }
}

export function buildRepairPrompt(packet: BeatPacket, errorCodes: readonly string[], invalidOutput: string): string {
  return `REPAIR ONE INVALID PRESENTATION.
ERROR_CODES=${canonicalJson(errorCodes)}
PACKET=${canonicalJson(buildBeatRenderPacket(packet))}
INVALID_OUTPUT=${canonicalJson(invalidOutput)}
Return a complete replacement, not commentary. Output one minified JSON object only with exactly npcLine, emotion, options. Copy choiceId values exactly in supplied order. Set emotion to exactly one of: ${BEAT_EMOTIONS.join(', ')}. Use only supplied facts and safeguards.`
}
