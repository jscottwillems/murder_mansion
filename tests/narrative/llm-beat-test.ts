import {
  renderLegalBeat,
  renderPreparedBeat,
  resetBeatRendererCaches,
} from '../../src/game/llm/beatRenderer'
import {
  BEAT_PROMPT_VERSION,
  buildBeatPacket,
  buildBeatRenderPacket,
  buildBeatSystemPrompt,
  canonicalJson,
  type BeatPacket,
  type BuiltBeatRequest,
} from '../../src/game/llm/promptBuilder'
import { validateBeatPresentation } from '../../src/game/llm/validation'
import { DOSSIERS } from '../../src/game/narrative/dossierStoryData'
import { getLegalBeat, initializeNarrativeCase } from '../../src/game/narrative/storyEngine'
import { Simulation } from '../../src/game/sim'

function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

const config = {
  provider: 'groq' as const,
  baseUrl: 'https://api.groq.com/openai/v1',
  apiKey: 'test-secret',
  model: 'openai/gpt-oss-20b',
}

const packet: BeatPacket = {
  packetVersion: 1,
  promptVersion: BEAT_PROMPT_VERSION,
  caseSeed: 'fixture-seed',
  beatId: 'columnist:test',
  beatRevision: 1,
  guest: {
    guestId: 'guest-columnist',
    displayName: 'Ada Finch',
    archetypeId: 'columnist',
    roleMode: 'innocent',
  },
  posture: { trustBand: 'mid', pressureBand: 'low', tellIds: [] },
  knowledgePhase: 'post-discovery',
  publicVictims: [],
  beat: {
    intent: 'context',
    facts: [{
      factId: 'safe-ledger',
      source: 'artifact',
      proposition: 'The ledger contains an altered zero.',
      requiredAnchors: ['ledger'],
    }],
    noNewFact: false,
    options: [
      { choiceId: 'choice:analyze', intent: 'analyze', labelDirective: 'Ask about the ledger', requiredAnchors: ['ledger'] },
      { choiceId: 'choice:withdraw', intent: 'withdraw', labelDirective: 'Leave the subject', requiredAnchors: [] },
    ],
  },
  safeguards: {
    allowedProperNouns: ['Ada Finch'],
    allowedTimes: [],
    allowedRooms: [],
    requiredAnchors: ['ledger'],
    forbiddenTerms: [],
    recentNpcLines: [],
    recentOptionLabels: [],
  },
  limits: { npcWords: 32, npcSentences: 2, optionWords: 14, optionCount: 2 },
}

const fallback = {
  npcLine: 'The ledger bears a corrected figure.',
  emotion: 'thoughtful' as const,
  options: [
    { choiceId: 'choice:analyze', label: 'Ask about the ledger?' },
    { choiceId: 'choice:withdraw', label: 'Leave the subject' },
  ],
}

const voiceContext = {
  trustBand: packet.posture.trustBand,
  pressureBand: packet.posture.pressureBand,
  roleMode: packet.guest.roleMode,
}
const request: BuiltBeatRequest = {
  packet,
  fallback,
  systemPrompt: buildBeatSystemPrompt(DOSSIERS.columnist.voice, voiceContext),
  userPrompt: canonicalJson(buildBeatRenderPacket(packet)),
}

function output(line = 'The ledger bears one altered zero.') {
  return JSON.stringify({
    npcLine: line,
    emotion: 'thoughtful',
    options: [
      { choiceId: 'choice:analyze', label: 'Ask about the ledger?' },
      { choiceId: 'choice:withdraw', label: 'Leave the subject' },
    ],
  })
}

function completion(content: string, status = 200, finishReason = 'stop'): Response {
  if (status !== 200) return new Response('', { status })
  return new Response(JSON.stringify({
    choices: [{ finish_reason: finishReason, message: { content } }],
    usage: { prompt_tokens: 20, completion_tokens: 30 },
  }), { status: 200 })
}

const requests: Array<Record<string, unknown>> = []
globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
  return completion(output())
}) as typeof fetch

resetBeatRendererCaches()
let result = await renderPreparedBeat(config, request)
check(result.source === 'llm', 'valid presentation should use the LLM result')
check(result.presentation.options.map(option => option.choiceId).join('|') === 'choice:analyze|choice:withdraw', 'choice IDs changed')
check(requests.length === 1, 'valid output should issue one request')
const body = requests[0]
check(body.temperature === 0.35 && body.max_tokens === 512, 'Groq beat parameters do not balance reasoning headroom and TPM usage')
check(body.reasoning_effort === 'low' && body.include_reasoning === false, 'GPT-OSS capability controls missing')
check(body.response_format === undefined, 'structured output must not be inferred')
check(JSON.stringify(body).includes('test-secret') === false, 'API key leaked into request body')
const messages = body.messages as Array<{ role: string; content: string }>
check(messages.length === 2 && messages[1].content === canonicalJson(buildBeatRenderPacket(packet)), 'user message is not canonical render-packet JSON')
check(messages[1].content.length < canonicalJson(packet).length * 0.75, 'provider packet did not remove enough local-only metadata')
check(!messages[1].content.includes('fixture-seed') && !messages[1].content.includes('guest-columnist'), 'local case or guest IDs leaked into provider packet')
check(messages[0].content.length < 1000, 'active-voice system prompt exceeded the compact budget')
check(messages[0].content.includes('neutral, suspicious, worried, angry, thoughtful, surprised'), 'system prompt omits the legal emotion enum')
check(!messages[1].content.includes('nextNodeId') && !messages[1].content.includes('effects'), 'hidden story mechanics leaked')

const malformed = validateBeatPresentation(`{"npcLine":"Fine.","emotion":"neutral","options":[],"extra":true}`, packet)
check(!malformed.ok && malformed.errors.includes('E_SCHEMA_KEYS'), 'extra keys were accepted')
const periodLabelOutput = JSON.parse(output()) as {
  npcLine: string
  emotion: string
  options: Array<{ choiceId: string; label: string }>
}
periodLabelOutput.options[1].label = 'Leave this subject.'
const periodLabel = validateBeatPresentation(JSON.stringify(periodLabelOutput), packet)
check(periodLabel.ok, 'a valid single-sentence option label ending in a period was rejected')
const concernedOutput = JSON.parse(output()) as {
  npcLine: string
  emotion: string
  options: Array<{ choiceId: string; label: string }>
}
concernedOutput.emotion = 'concerned'
const concerned = validateBeatPresentation(JSON.stringify(concernedOutput), packet)
check(concerned.ok && concerned.presentation.emotion === 'worried', 'concerned emotion was not normalized to worried')
const unknownEmotionOutput = { ...concernedOutput, emotion: 'melancholy' }
const unknownEmotion = validateBeatPresentation(JSON.stringify(unknownEmotionOutput), packet)
check(!unknownEmotion.ok && unknownEmotion.errors.includes('E_EMOTION'), 'unknown emotion was accepted')
const reordered = validateBeatPresentation(JSON.stringify({
  npcLine: 'The ledger bears one altered zero.',
  emotion: 'neutral',
  options: [...JSON.parse(output()).options].reverse(),
}), packet)
check(!reordered.ok && reordered.errors.includes('E_CHOICE_ID'), 'reordered IDs were accepted')
const unknown = validateBeatPresentation(output().replace('choice:analyze', 'choice:invented'), packet)
check(!unknown.ok && unknown.errors.includes('E_CHOICE_ID'), 'unknown ID was accepted')

let responseIndex = 0
globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
  return completion(responseIndex++ === 0 ? 'not json' : output('The ledger retains one altered zero.'))
}) as typeof fetch
resetBeatRendererCaches()
responseIndex = 0
result = await renderPreparedBeat(config, request)
check(result.source === 'repair' && result.diagnostics.repairAttempted && result.diagnostics.repairSucceeded, 'one successful repair was not used')
const repairBody = requests.at(-1) as { messages: Array<{ content: string }> }
check(repairBody.messages[1].content.startsWith('REPAIR ONE INVALID PRESENTATION.\nERROR_CODES=["E_PARSE_JSON"]'), 'repair prompt contract changed')
check((repairBody as unknown as { temperature: number }).temperature === 0, 'repair must use temperature zero')

const nonStopBodies: Array<Record<string, unknown>> = []
responseIndex = 0
globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  nonStopBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
  return responseIndex++ === 0
    ? completion(output('The ledger appears complete but was length-limited.'), 200, 'length')
    : completion(output('The ledger retains one altered zero.'))
}) as typeof fetch
resetBeatRendererCaches()
result = await renderPreparedBeat(config, request)
check(result.source === 'repair' && nonStopBodies.length === 2, 'non-stop completion was accepted or not repaired')
check(nonStopBodies[0].temperature === 0.35 && nonStopBodies[1].temperature === 0, 'creative and repair temperatures are incorrect')
check(result.diagnostics.validationCodes.includes('E_UNSAFE_SEMANTICS'), 'non-stop finish was not classified as incomplete content')

let truncatedCalls = 0
globalThis.fetch = (async () => {
  truncatedCalls++
  return completion('{"npcLine":"The ledger', 200, 'length')
}) as typeof fetch
resetBeatRendererCaches()
result = await renderPreparedBeat(config, request)
check(result.source === 'fallback' && result.diagnostics.repairAttempted && truncatedCalls === 2, 'truncated completion or repair was accepted')

let failedRepairCalls = 0
globalThis.fetch = (async () => {
  failedRepairCalls++
  return completion('still not json')
}) as typeof fetch
resetBeatRendererCaches()
result = await renderPreparedBeat(config, request)
check(result.source === 'fallback' && result.diagnostics.repairAttempted, 'failed repair did not return fallback')
await renderPreparedBeat(config, request)
check(failedRepairCalls === 2, 'failed generation was not negative-cached after one repair')

let rateLimitRetryCalls = 0
globalThis.fetch = (async () => {
  rateLimitRetryCalls++
  return rateLimitRetryCalls === 1
    ? new Response(JSON.stringify({
      error: { message: 'Rate limit reached. Please try again in 0s.' },
    }), { status: 429 })
    : completion(output())
}) as typeof fetch
resetBeatRendererCaches()
result = await renderPreparedBeat(config, request)
check(result.source === 'llm' && rateLimitRetryCalls === 2, 'short provider rate limit was not retried once')

let transportCalls = 0
globalThis.fetch = (async () => {
  transportCalls++
  return completion('', 429)
}) as typeof fetch
resetBeatRendererCaches()
result = await renderPreparedBeat(config, request)
check(result.source === 'fallback' && !result.diagnostics.repairAttempted && transportCalls === 1, '429 must not repair')

globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
  transportCalls++
  init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
})) as typeof fetch
const ollamaRequest = { ...request, packet: { ...packet, beatRevision: 2 } }
resetBeatRendererCaches()
const timeoutConfig = { ...config, provider: 'custom' as const }
const originalSetTimeout = globalThis.setTimeout
globalThis.setTimeout = ((callback: TimerHandler) => originalSetTimeout(callback, 1)) as typeof setTimeout
result = await renderPreparedBeat(timeoutConfig, ollamaRequest)
globalThis.setTimeout = originalSetTimeout
check(result.source === 'fallback' && !result.diagnostics.repairAttempted, 'timeout must not repair')

const preDiscovery = structuredClone(packet)
preDiscovery.knowledgePhase = 'pre-discovery'
const leaked = validateBeatPresentation(output('The body lay beside the ledger.'), preDiscovery)
check(!leaked.ok && leaked.errors.includes('E_PRE_DISCOVERY'), 'pre-discovery fatality leaked')
const invented = validateBeatPresentation(output('Lord Blackwood marked the ledger.'), packet)
check(!invented.ok && invented.errors.includes('E_PROPER_NOUN'), 'invented proper noun was accepted')
const repeatedPacket = structuredClone(packet)
repeatedPacket.safeguards.recentNpcLines = ['The ledger bears one altered zero.']
const repeated = validateBeatPresentation(output(), repeatedPacket)
check(!repeated.ok && repeated.errors.includes('E_REPETITION'), 'repeated line was accepted')

let cacheCalls = 0
globalThis.fetch = (async () => {
  cacheCalls++
  await new Promise(resolve => originalSetTimeout(resolve, 10))
  return completion(output())
}) as typeof fetch
resetBeatRendererCaches()
const [firstDedup, secondDedup] = await Promise.all([
  renderPreparedBeat(config, request),
  renderPreparedBeat(config, request),
])
check(cacheCalls === 1 && firstDedup.source === 'llm' && secondDedup.source === 'llm', 'in-flight requests were not deduplicated')
await renderPreparedBeat(config, request)
check(cacheCalls === 1, 'validated response cache missed')

const sim = new Simulation(1931, {
  log: () => {},
  lead: () => {},
  guestDied: () => {},
  bodyDiscovered: () => {},
  overheard: () => {},
})
const state = initializeNarrativeCase({ caseSeed: sim.seed, guests: sim.guests })
const guest = sim.guests.find(candidate => candidate.archetypeId === 'columnist')
check(guest, 'missing test columnist')
// Use a trace this columnist is actually assigned this case (an open thread).
const thread = DOSSIERS.columnist.evidenceThreads[guest.evidenceIds[0]]
check(thread, 'missing test thread')
const legalBeat = getLegalBeat(state, guest.id, thread.id)
check(legalBeat, 'missing legal test beat')
const built = buildBeatPacket(legalBeat, state, guest)
check(!JSON.stringify(built.packet).includes('nextNodeId') && !JSON.stringify(built.packet).includes('effects'), 'packet exposed effects or next nodes')
check(JSON.stringify(built.packet).includes(built.fallback.npcLine) && built.userPrompt.includes('"fallback"') === false, 'fallback must remain local, not packet metadata')
const before = JSON.stringify(state)
globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const sent = JSON.parse(String(init?.body)) as { messages: Array<{ content: string }> }
  const sentPacket = JSON.parse(sent.messages[1].content) as {
    beat: { options: Array<{ choiceId: string }> }
  }
  return completion(JSON.stringify({
    npcLine: 'I can answer this precisely.',
    emotion: 'neutral',
    options: sentPacket.beat.options.map(option => ({ choiceId: option.choiceId, label: 'Continue?' })),
  }))
}) as typeof fetch
resetBeatRendererCaches()
await renderLegalBeat({ config, legalBeat, state, guest })
check(JSON.stringify(state) === before, 'beat rendering mutated narrative state')

console.log('LLM BEAT VALIDATION PASSED: requests, repair, fallback, safety, cache, and immutability')
