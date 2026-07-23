import {
  buildBeatPacket,
  buildRepairPrompt,
  canonicalJson,
  type BeatPacketContext,
  type BeatPresentation,
  type BuiltBeatRequest,
} from './promptBuilder'
import {
  completeChat,
  normalizeLlmOrigin,
  providerCapabilityProfile,
  type ChatCompletionResult,
  type CompletionFailureKind,
  type LLMConfig,
} from './transport'
import {
  validateBeatPresentation,
  type BeatValidationErrorCode,
} from './validation'
import type { LegalBeat, NarrativeCaseState } from '../narrative/types'
import type { Guest } from '../types'

export interface BeatRenderDiagnostics {
  fingerprintPrefix: string
  promptVersion: string
  providerProfileId: string
  model: string
  archetypeId: Guest['archetypeId']
  roleMode: 'innocent' | 'killer'
  knowledgePhase: 'pre-discovery' | 'post-discovery'
  latencyBucket: '<50ms' | '50-250ms' | '250ms-1s' | '1-3s' | '3-6s' | '6-10s' | '>10s'
  cacheStatus: 'miss' | 'positive' | 'negative' | 'provider-negative' | 'breaker'
  httpStatusClass?: string
  validationCodes: BeatValidationErrorCode[]
  repairAttempted: boolean
  repairSucceeded: boolean
  fallbackUsed: boolean
  promptTokens?: number
  completionTokens?: number
}

export interface BeatRenderResult {
  presentation: BeatPresentation
  source: 'llm' | 'repair' | 'fallback'
  diagnostics: BeatRenderDiagnostics
}

export interface RenderLegalBeatInput {
  config: LLMConfig
  legalBeat: LegalBeat
  state: NarrativeCaseState
  guest: Guest
  context?: BeatPacketContext
}

/** Guards presentation swaps; story effects never pass through this object. */
export class BeatVisibilityGuard {
  private visibleKey: string | null = null

  show(guestId: string, threadId: string, nodeId: string, revision: number): string {
    this.visibleKey = `${guestId}:${threadId}:${nodeId}:${revision}`
    return this.visibleKey
  }

  invalidate(): void {
    this.visibleKey = null
  }

  isCurrent(key: string): boolean {
    return this.visibleKey === key
  }
}

interface ProviderFailureState {
  until: number
}

interface BreakerState {
  failures: number[]
  openUntil: number
  probing: boolean
}

const positiveCache = new Map<string, BeatPresentation>()
const inFlight = new Map<string, Promise<BeatRenderResult>>()
const negativeContentCache = new Map<string, number>()
const providerNegativeCache = new Map<string, ProviderFailureState>()
const providerBreakers = new Map<string, BreakerState>()
const POSITIVE_CACHE_LIMIT = 128

function latencyBucket(milliseconds: number): BeatRenderDiagnostics['latencyBucket'] {
  if (milliseconds < 50) return '<50ms'
  if (milliseconds < 250) return '50-250ms'
  if (milliseconds < 1000) return '250ms-1s'
  if (milliseconds < 3000) return '1-3s'
  if (milliseconds < 6000) return '3-6s'
  if (milliseconds <= 10000) return '6-10s'
  return '>10s'
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

async function requestFingerprint(config: LLMConfig, request: BuiltBeatRequest): Promise<string> {
  const profile = providerCapabilityProfile(config)
  const systemHash = await sha256(request.systemPrompt)
  return sha256([
    'mm-beat-v1',
    request.packet.promptVersion,
    profile.id,
    normalizeLlmOrigin(config.baseUrl),
    config.model,
    systemHash,
    canonicalJson(request.packet),
  ].join('\n'))
}

function providerKey(config: LLMConfig): string {
  const profile = providerCapabilityProfile(config)
  return `${profile.id}\n${normalizeLlmOrigin(config.baseUrl)}\n${config.model}`
}

function httpStatusClass(status: number | undefined): string | undefined {
  return status === undefined ? undefined : `${Math.floor(status / 100)}xx`
}

function diagnostics(
  request: BuiltBeatRequest,
  config: LLMConfig,
  fingerprint: string,
  startedAt: number,
  cacheStatus: BeatRenderDiagnostics['cacheStatus'],
  overrides: Partial<BeatRenderDiagnostics> = {},
): BeatRenderDiagnostics {
  const profile = providerCapabilityProfile(config)
  return {
    fingerprintPrefix: fingerprint.slice(0, 12),
    promptVersion: request.packet.promptVersion,
    providerProfileId: profile.id,
    model: config.model,
    archetypeId: request.packet.guest.archetypeId,
    roleMode: request.packet.guest.roleMode,
    knowledgePhase: request.packet.knowledgePhase,
    latencyBucket: latencyBucket(Date.now() - startedAt),
    cacheStatus,
    validationCodes: [],
    repairAttempted: false,
    repairSucceeded: false,
    fallbackUsed: false,
    ...overrides,
  }
}

function fallbackResult(
  request: BuiltBeatRequest,
  config: LLMConfig,
  fingerprint: string,
  startedAt: number,
  cacheStatus: BeatRenderDiagnostics['cacheStatus'],
  overrides: Partial<BeatRenderDiagnostics> = {},
): BeatRenderResult {
  return {
    presentation: request.fallback,
    source: 'fallback',
    diagnostics: diagnostics(request, config, fingerprint, startedAt, cacheStatus, {
      fallbackUsed: true,
      ...overrides,
    }),
  }
}

function readPositive(fingerprint: string, request: BuiltBeatRequest): BeatPresentation | null {
  const cached = positiveCache.get(fingerprint)
  if (!cached) return null
  const validation = validateBeatPresentation(JSON.stringify(cached), request.packet)
  if (!validation.ok) {
    positiveCache.delete(fingerprint)
    return null
  }
  positiveCache.delete(fingerprint)
  positiveCache.set(fingerprint, validation.presentation)
  return validation.presentation
}

function writePositive(fingerprint: string, presentation: BeatPresentation): void {
  positiveCache.delete(fingerprint)
  positiveCache.set(fingerprint, presentation)
  while (positiveCache.size > POSITIVE_CACHE_LIMIT) {
    const oldest = positiveCache.keys().next().value
    if (oldest === undefined) break
    positiveCache.delete(oldest)
  }
}

function breakerBlocked(key: string, now: number): boolean {
  const breaker = providerBreakers.get(key)
  if (!breaker || breaker.openUntil <= 0) return false
  if (breaker.openUntil > now) return true
  if (breaker.probing) return true
  breaker.probing = true
  return false
}

function noteProviderSuccess(key: string): void {
  providerNegativeCache.delete(key)
  providerBreakers.delete(key)
}

function isBreakerFailure(result: Extract<ChatCompletionResult, { ok: false }>): boolean {
  return result.kind === 'timeout'
    || result.kind === 'network'
    || (result.kind === 'http' && (result.status ?? 0) >= 500)
}

function noteProviderFailure(key: string, result: Extract<ChatCompletionResult, { ok: false }>, now: number): void {
  let duration = 0
  if (result.kind === 'auth') duration = Number.POSITIVE_INFINITY
  else if (result.status === 404) duration = 5 * 60_000
  else if (result.kind === 'rate-limit') duration = Math.max(5_000, Math.min(60_000, result.retryAfterMs ?? 5_000))
  else if (result.kind === 'timeout'
    || result.kind === 'network'
    || result.kind === 'invalid-response'
    || result.kind === 'empty'
    || result.status === 408
    || result.status === 409) duration = 15_000
  else if (result.kind === 'http' && (result.status ?? 0) >= 500) duration = 30_000
  if (duration > 0) providerNegativeCache.set(key, { until: now + duration })

  if (!isBreakerFailure(result)) return
  const breaker = providerBreakers.get(key) ?? { failures: [], openUntil: 0, probing: false }
  breaker.probing = false
  breaker.failures = breaker.failures.filter(timestamp => now - timestamp <= 60_000)
  breaker.failures.push(now)
  if (breaker.failures.length >= 3) breaker.openUntil = now + 60_000
  providerBreakers.set(key, breaker)
}

function tokenDiagnostics(result: ChatCompletionResult): Partial<BeatRenderDiagnostics> {
  if (!result.ok || !result.usage) return {}
  return {
    ...(result.usage.promptTokens !== undefined ? { promptTokens: result.usage.promptTokens } : {}),
    ...(result.usage.completionTokens !== undefined ? { completionTokens: result.usage.completionTokens } : {}),
  }
}

function transportFallback(
  request: BuiltBeatRequest,
  config: LLMConfig,
  fingerprint: string,
  startedAt: number,
  result: Extract<ChatCompletionResult, { ok: false }>,
): BeatRenderResult {
  const key = providerKey(config)
  noteProviderFailure(key, result, Date.now())
  return fallbackResult(request, config, fingerprint, startedAt, 'miss', {
    httpStatusClass: httpStatusClass(result.status),
  })
}

function shouldRepair(kind: CompletionFailureKind): boolean {
  switch (kind) {
    case 'invalid-response':
    case 'empty':
    case 'timeout':
    case 'network':
    case 'auth':
    case 'rate-limit':
    case 'http':
      return false
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function performRender(
  request: BuiltBeatRequest,
  config: LLMConfig,
  fingerprint: string,
  startedAt: number,
): Promise<BeatRenderResult> {
  const profile = providerCapabilityProfile(config)
  const key = providerKey(config)
  const messages = [
    { role: 'system' as const, content: request.systemPrompt },
    { role: 'user' as const, content: request.userPrompt },
  ]
  let first = await completeChat(
    config,
    messages,
    {
      timeoutMs: profile.deadlineMs,
      maxTokens: profile.maxOutputTokens,
      temperature: profile.temperature,
    },
  )
  if (!first.ok && first.kind === 'rate-limit' && first.retryAfterMs !== undefined) {
    const waitMs = Math.ceil(first.retryAfterMs) + 100
    const remainingAfterWait = profile.deadlineMs - (Date.now() - startedAt) - waitMs
    if (remainingAfterWait >= 1500) {
      await delay(waitMs)
      first = await completeChat(
        config,
        messages,
        {
          timeoutMs: Math.max(1500, profile.deadlineMs - (Date.now() - startedAt)),
          maxTokens: profile.maxOutputTokens,
          temperature: profile.temperature,
        },
      )
    }
  }
  if (!first.ok) {
    shouldRepair(first.kind)
    return transportFallback(request, config, fingerprint, startedAt, first)
  }
  noteProviderSuccess(key)
  const validation = validateBeatPresentation(first.content, request.packet)
  if (validation.ok && first.finishReason === 'stop') {
    writePositive(fingerprint, validation.presentation)
    return {
      presentation: validation.presentation,
      source: 'llm',
      diagnostics: diagnostics(request, config, fingerprint, startedAt, 'miss', tokenDiagnostics(first)),
    }
  }
  const validationErrors: BeatValidationErrorCode[] = [
    ...(validation.ok ? [] : validation.errors),
    ...(first.finishReason === 'stop' ? [] : ['E_UNSAFE_SEMANTICS' as const]),
  ]

  const remainingMs = profile.deadlineMs - (Date.now() - startedAt)
  if (remainingMs < 1500) {
    negativeContentCache.set(fingerprint, Date.now() + 5 * 60_000)
    return fallbackResult(request, config, fingerprint, startedAt, 'miss', {
      validationCodes: validationErrors,
      ...tokenDiagnostics(first),
    })
  }
  const repair = await completeChat(
    config,
    [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: buildRepairPrompt(request.packet, validationErrors, first.content) },
    ],
    {
      timeoutMs: remainingMs,
      maxTokens: profile.maxOutputTokens,
      temperature: 0,
    },
  )
  if (!repair.ok) {
    noteProviderFailure(key, repair, Date.now())
    negativeContentCache.set(fingerprint, Date.now() + 5 * 60_000)
    return fallbackResult(request, config, fingerprint, startedAt, 'miss', {
      validationCodes: validationErrors,
      repairAttempted: true,
      httpStatusClass: httpStatusClass(repair.status),
      ...tokenDiagnostics(first),
    })
  }
  noteProviderSuccess(key)
  const repairedValidation = validateBeatPresentation(repair.content, request.packet)
  if (!repairedValidation.ok || repair.finishReason !== 'stop') {
    const repairErrors: BeatValidationErrorCode[] = [
      ...(repairedValidation.ok ? [] : repairedValidation.errors),
      ...(repair.finishReason === 'stop' ? [] : ['E_UNSAFE_SEMANTICS' as const]),
    ]
    negativeContentCache.set(fingerprint, Date.now() + 5 * 60_000)
    return fallbackResult(request, config, fingerprint, startedAt, 'miss', {
      validationCodes: repairErrors,
      repairAttempted: true,
      ...tokenDiagnostics(repair),
    })
  }
  writePositive(fingerprint, repairedValidation.presentation)
  return {
    presentation: repairedValidation.presentation,
    source: 'repair',
    diagnostics: diagnostics(request, config, fingerprint, startedAt, 'miss', {
      validationCodes: validationErrors,
      repairAttempted: true,
      repairSucceeded: true,
      ...tokenDiagnostics(repair),
    }),
  }
}

export async function renderPreparedBeat(config: LLMConfig, request: BuiltBeatRequest): Promise<BeatRenderResult> {
  const startedAt = Date.now()
  const fingerprint = await requestFingerprint(config, request)
  const positive = readPositive(fingerprint, request)
  if (positive) {
    return {
      presentation: positive,
      source: 'llm',
      diagnostics: diagnostics(request, config, fingerprint, startedAt, 'positive'),
    }
  }
  const now = Date.now()
  if ((negativeContentCache.get(fingerprint) ?? 0) > now) {
    return fallbackResult(request, config, fingerprint, startedAt, 'negative')
  }
  negativeContentCache.delete(fingerprint)
  const key = providerKey(config)
  if ((providerNegativeCache.get(key)?.until ?? 0) > now) {
    return fallbackResult(request, config, fingerprint, startedAt, 'provider-negative')
  }
  providerNegativeCache.delete(key)
  if (breakerBlocked(key, now)) {
    return fallbackResult(request, config, fingerprint, startedAt, 'breaker')
  }
  const existing = inFlight.get(fingerprint)
  if (existing) return existing
  const pending = performRender(request, config, fingerprint, startedAt)
  inFlight.set(fingerprint, pending)
  try {
    return await pending
  } finally {
    if (inFlight.get(fingerprint) === pending) inFlight.delete(fingerprint)
  }
}

/** Presentation-only API. It reads but never mutates narrative state. */
export async function renderLegalBeat(input: RenderLegalBeatInput): Promise<BeatRenderResult> {
  const request = buildBeatPacket(input.legalBeat, input.state, input.guest, input.context)
  return renderPreparedBeat(input.config, request)
}

export function resetBeatRendererCaches(): void {
  positiveCache.clear()
  inFlight.clear()
  negativeContentCache.clear()
  providerNegativeCache.clear()
  providerBreakers.clear()
}
