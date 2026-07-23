import {
  BEAT_EMOTIONS,
  type BeatPacket,
  type BeatPresentation,
} from './llmPromptBuilder'

export type BeatValidationErrorCode =
  | 'E_PARSE_JSON'
  | 'E_SCHEMA_KEYS'
  | 'E_OPTION_COUNT'
  | 'E_CHOICE_ID'
  | 'E_EMOTION'
  | 'E_EMPTY_TEXT'
  | 'E_LENGTH'
  | 'E_PUNCTUATION'
  | 'E_PRE_DISCOVERY'
  | 'E_PROPER_NOUN'
  | 'E_TIME'
  | 'E_ROOM'
  | 'E_ATTRIBUTION'
  | 'E_COVER'
  | 'E_REQUIRED_ANCHOR'
  | 'E_FORBIDDEN_TERM'
  | 'E_STATE_CLAIM'
  | 'E_REPETITION'
  | 'E_UNSAFE_SEMANTICS'

export type BeatValidationResult =
  | { ok: true; presentation: BeatPresentation }
  | { ok: false; errors: BeatValidationErrorCode[] }

const TOP_LEVEL_KEYS = ['emotion', 'npcLine', 'options']
const OPTION_KEYS = ['choiceId', 'label']
const DEATH_TERMS = /\b(victim|murder(?:er|ed)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies)|slain|fatal|obituary|the late)\b/i
const FATAL_EUPHEMISMS = /\b(no longer (?:with us|among the living)|met (?:his|her|their) end|breathed (?:his|her|their) last)\b/i
const GLOBAL_FORBIDDEN = [
  'chlorhexidine', 'quaternary disinfectant', 'dna', 'cctv', 'smartphone',
  'mobile phone', 'phone call', 'internet', 'computer', 'email', 'podcast',
  'game mechanic', 'archetype-as-guilt',
]
const MECHANICS_TERMS = [
  'choice id', 'choose option', 'select option', 'next node', 'unlock',
  'evidence awarded', 'evidence gained', 'trust increased', 'pressure increased',
  'route opened', 'ending unlocked', 'quest', 'game state',
]
const STATE_CLAIMS = [
  'you have unlocked', 'this unlocks', 'evidence added', 'the next node',
  'this choice will', 'you win', 'case closed', 'therefore guilty',
  'proves guilt', 'is the murderer', 'is innocent',
]
const ROOM_ALIASES: Record<string, string[]> = {
  Study: ['study'],
  Gallery: ['gallery'],
  Conservatory: ['conservatory'],
  Kitchen: ['kitchen'],
  'Dining Hall': ['dining hall'],
  Ballroom: ['ballroom'],
  Cellar: ['cellar'],
  Library: ['library'],
  'Master Suite': ['master suite', 'suite'],
  'west service passage': ['west service passage', 'west passage', 'service passage', 'hidden passage'],
}
const KNOWN_CASE_NAMES = [
  'Sir Edgar Rooke', 'Edgar Rooke', 'Celia', 'June Bell', 'June',
  'Lady Vale', 'Rookwood Hall', 'Blue Case', 'Bentley', 'Mercy Box',
]
const NAME_TITLES = new Set(['Mr', 'Mrs', 'Miss', 'Ms', 'Sir', 'Lady', 'Lord', 'Dr', 'Doctor'])
const EMOTION_ALIASES: Readonly<Record<string, BeatPresentation['emotion']>> = {
  calm: 'neutral',
  composed: 'neutral',
  guarded: 'suspicious',
  doubtful: 'suspicious',
  wary: 'suspicious',
  concerned: 'worried',
  anxious: 'worried',
  uneasy: 'worried',
  nervous: 'worried',
  irritated: 'angry',
  annoyed: 'angry',
  furious: 'angry',
  curious: 'thoughtful',
  pensive: 'thoughtful',
  reflective: 'thoughtful',
  startled: 'surprised',
  shocked: 'surprised',
  astonished: 'surprised',
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim()
}

function words(value: string): string[] {
  return value.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []
}

function sentenceCount(value: string): number {
  return (value.match(/[.!?…]+(?=(?:["'”’)]*)?(?:\s|$))/g) ?? []).length
}

function fingerprint(value: string): string {
  return normalizeText(value).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function containsLiteral(text: string, value: string): boolean {
  return text.toLocaleLowerCase().includes(value.normalize('NFC').toLocaleLowerCase())
}

function add(errors: Set<BeatValidationErrorCode>, code: BeatValidationErrorCode): void {
  errors.add(code)
}

function normalizeEmotion(value: string): BeatPresentation['emotion'] | null {
  const normalized = value.trim().toLocaleLowerCase()
  if (BEAT_EMOTIONS.includes(normalized as BeatPresentation['emotion'])) {
    return normalized as BeatPresentation['emotion']
  }
  return EMOTION_ALIASES[normalized] ?? null
}

function detectTimes(text: string): string[] {
  const matches = text.match(/\b(?:1[0-2]|0?[1-9]):[0-5]\d\s*(?:AM|PM)\b|\b(?:midnight|sunrise|dawn)\b|\b\d{1,2}:\d{2}\b/gi)
  return matches ?? []
}

function allowedMatch(value: string, allowed: readonly string[]): boolean {
  return allowed.some(candidate => containsLiteral(candidate, value) || containsLiteral(value, candidate))
}

function validateRooms(text: string, packet: BeatPacket, errors: Set<BeatValidationErrorCode>): void {
  for (const [canonical, aliases] of Object.entries(ROOM_ALIASES)) {
    if (!aliases.some(alias => containsLiteral(text, alias))) continue
    if (!allowedMatch(canonical, packet.safeguards.allowedRooms)
      && !aliases.some(alias => allowedMatch(alias, packet.safeguards.allowedRooms))) {
      add(errors, 'E_ROOM')
    }
  }
}

function properNounCandidates(text: string): string[] {
  const candidates = new Set<string>()
  for (const known of KNOWN_CASE_NAMES) {
    if (containsLiteral(text, known)) candidates.add(known)
  }
  const tokens = [...text.matchAll(/\b[\p{Lu}][\p{L}’'-]*(?:\s+[\p{Lu}][\p{L}’'-]*)*/gu)]
  for (const match of tokens) {
    const phrase = match[0]
    const start = match.index ?? 0
    const previous = text.slice(0, start).trimEnd().slice(-1)
    const parts = phrase.split(/\s+/)
    const sentenceInitial = start === 0 || /[.!?…]/.test(previous)
    if (phrase === 'I' || (sentenceInitial && parts.length === 1 && !NAME_TITLES.has(parts[0]))) continue
    candidates.add(phrase)
  }
  return [...candidates]
}

function validateProperNouns(text: string, packet: BeatPacket, errors: Set<BeatValidationErrorCode>): void {
  for (const candidate of properNounCandidates(text)) {
    if (!allowedMatch(candidate, packet.safeguards.allowedProperNouns)) add(errors, 'E_PROPER_NOUN')
  }
}

function trigrams(text: string): Set<string> {
  const values = fingerprint(text).split(' ').filter(Boolean)
  const result = new Set<string>()
  for (let index = 0; index + 2 < values.length; index++) {
    result.add(values.slice(index, index + 3).join(' '))
  }
  return result
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (!left.size || !right.size) return 0
  let intersection = 0
  for (const value of left) if (right.has(value)) intersection++
  return intersection / (left.size + right.size - intersection)
}

function sharesSixWords(left: string, right: string): boolean {
  const leftWords = fingerprint(left).split(' ').filter(Boolean)
  const rightText = ` ${fingerprint(right)} `
  for (let index = 0; index + 5 < leftWords.length; index++) {
    if (rightText.includes(` ${leftWords.slice(index, index + 6).join(' ')} `)) return true
  }
  return false
}

function repeated(text: string, recent: readonly string[]): boolean {
  const target = fingerprint(text)
  const targetTrigrams = trigrams(text)
  return recent.some(previous => {
    const prior = fingerprint(previous)
    return target === prior || sharesSixWords(text, previous) || jaccard(targetTrigrams, trigrams(previous)) > 0.7
  })
}

function validateContent(presentation: BeatPresentation, packet: BeatPacket, errors: Set<BeatValidationErrorCode>): void {
  const texts = [presentation.npcLine, ...presentation.options.map(option => option.label)]
  const combined = texts.join(' ')
  if (words(presentation.npcLine).length > packet.limits.npcWords
    || sentenceCount(presentation.npcLine) > packet.limits.npcSentences
    || presentation.options.some(option => words(option.label).length > packet.limits.optionWords)) {
    add(errors, 'E_LENGTH')
  }
  if (!/[.!?…]["'”’)]*$/.test(presentation.npcLine)
    || sentenceCount(presentation.npcLine) < 1
    || presentation.options.some(option => sentenceCount(option.label) > 1)) {
    add(errors, 'E_PUNCTUATION')
  }
  if (packet.knowledgePhase === 'pre-discovery' && (DEATH_TERMS.test(combined) || FATAL_EUPHEMISMS.test(combined))) {
    add(errors, 'E_PRE_DISCOVERY')
  }
  const forbidden = [...GLOBAL_FORBIDDEN, ...MECHANICS_TERMS, ...packet.safeguards.forbiddenTerms]
  if (forbidden.some(term => term && containsLiteral(combined, term))) add(errors, 'E_FORBIDDEN_TERM')
  if (STATE_CLAIMS.some(term => containsLiteral(combined, term))) add(errors, 'E_STATE_CLAIM')

  const times = detectTimes(combined)
  if (times.some(time => !allowedMatch(time, packet.safeguards.allowedTimes))) add(errors, 'E_TIME')
  validateRooms(combined, packet, errors)
  validateProperNouns(combined, packet, errors)

  for (const anchor of packet.safeguards.requiredAnchors) {
    if (!containsLiteral(combined, anchor)) add(errors, 'E_REQUIRED_ANCHOR')
  }
  for (const fact of packet.beat.facts) {
    for (const anchor of fact.requiredAnchors) {
      if (!containsLiteral(presentation.npcLine, anchor)) add(errors, 'E_REQUIRED_ANCHOR')
    }
    if (fact.source === 'attributed-rumor' && fact.attribution) {
      if (!containsLiteral(presentation.npcLine, fact.attribution.requiredPhrase)
        || /\bI\s+(?:saw|heard|noticed|watched|observed)\b/i.test(presentation.npcLine)) {
        add(errors, 'E_ATTRIBUTION')
      }
    }
  }
  presentation.options.forEach((option, index) => {
    for (const anchor of packet.beat.options[index]?.requiredAnchors ?? []) {
      if (!containsLiteral(option.label, anchor)) add(errors, 'E_REQUIRED_ANCHOR')
    }
  })

  if (packet.coverFacts && packet.coverFacts.allowedClaimIds.length > 0) {
    const cover = packet.coverFacts
    const anchors = [
      cover.preAnchor.room, cover.preAnchor.timeBand,
      cover.privateInterval.room, cover.privateInterval.timeBand, cover.privateInterval.claimedWitness,
      cover.reentry.room, cover.reentry.timeBand, cover.reentry.witness,
    ]
    if (anchors.some(anchor => !containsLiteral(presentation.npcLine, anchor))) add(errors, 'E_COVER')
  }

  const labelFingerprints = presentation.options.map(option => fingerprint(option.label))
  if (new Set(labelFingerprints).size !== labelFingerprints.length
    || repeated(presentation.npcLine, packet.safeguards.recentNpcLines)
    || presentation.options.some(option => repeated(option.label, packet.safeguards.recentOptionLabels))) {
    add(errors, 'E_REPETITION')
  }
}

export function validateBeatPresentation(raw: string, packet: BeatPacket): BeatValidationResult {
  let decoded: unknown
  try {
    decoded = JSON.parse(raw.trim())
  } catch {
    return { ok: false, errors: ['E_PARSE_JSON'] }
  }
  if (!isObject(decoded) || !exactKeys(decoded, TOP_LEVEL_KEYS)
    || typeof decoded.npcLine !== 'string'
    || typeof decoded.emotion !== 'string'
    || !Array.isArray(decoded.options)
    || decoded.options.length > 4
    || decoded.npcLine.length > 500
    || decoded.options.some(option => !isObject(option)
      || !exactKeys(option, OPTION_KEYS)
      || typeof option.choiceId !== 'string'
      || typeof option.label !== 'string'
      || option.choiceId.length < 1
      || option.choiceId.length > 160
      || option.label.length > 180)) {
    return { ok: false, errors: ['E_SCHEMA_KEYS'] }
  }

  const options = decoded.options as Array<{ choiceId: string; label: string }>
  const errors = new Set<BeatValidationErrorCode>()
  if (options.length !== packet.beat.options.length) add(errors, 'E_OPTION_COUNT')
  const expectedIds = packet.beat.options.map(option => option.choiceId)
  if (options.some((option, index) => option.choiceId !== expectedIds[index])
    || new Set(options.map(option => option.choiceId)).size !== options.length) {
    add(errors, 'E_CHOICE_ID')
  }
  const emotion = normalizeEmotion(decoded.emotion)
  if (!emotion) add(errors, 'E_EMOTION')

  const presentation: BeatPresentation = {
    npcLine: normalizeText(decoded.npcLine),
    emotion: emotion ?? 'neutral',
    options: options.map(option => ({
      choiceId: option.choiceId,
      label: normalizeText(option.label),
    })),
  }
  if (!presentation.npcLine || presentation.options.some(option => !option.label)) add(errors, 'E_EMPTY_TEXT')
  validateContent(presentation, packet, errors)
  return errors.size ? { ok: false, errors: [...errors] } : { ok: true, presentation }
}
