export interface LLMConfig {
  baseUrl: string
  apiKey: string
  model: string
  provider?: 'groq' | 'ollama' | 'custom'
}

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export interface ChatOptions {
  timeoutMs: number
  maxTokens: number
  temperature?: number
  responseSchema?: Record<string, unknown>
}

const GPT_OSS_MODELS = new Set(['openai/gpt-oss-20b', 'openai/gpt-oss-120b'])

export interface ProviderCapabilityProfile {
  id: 'groq-gpt-oss' | 'ollama-openai' | 'custom-openai-compatible'
  temperature: number
  maxOutputTokens: number
  deadlineMs: number
  structuredOutput: 'none' | 'json-schema'
  extraBody: Record<string, unknown>
}

export type CompletionFinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'unknown'

export type CompletionFailureKind =
  | 'timeout' | 'network' | 'auth' | 'rate-limit' | 'http'
  | 'invalid-response' | 'empty'

export type ChatCompletionResult =
  | {
      ok: true
      content: string
      finishReason: CompletionFinishReason
      usage?: { promptTokens?: number; completionTokens?: number }
      status: number
    }
  | {
      ok: false
      kind: CompletionFailureKind
      status?: number
      retryAfterMs?: number
      message: string
    }

export function normalizeLlmOrigin(baseUrl: string): string {
  const configured = baseUrl.trim() || 'https://api.openai.com/v1'
  try {
    return new URL(configured).origin.toLowerCase()
  } catch {
    return configured.replace(/\/+$/, '').toLowerCase()
  }
}

export function providerCapabilityProfile(config: LLMConfig): ProviderCapabilityProfile {
  const origin = normalizeLlmOrigin(config.baseUrl)
  const isGroq = config.provider === 'groq' || origin === 'https://api.groq.com'
  if (isGroq && GPT_OSS_MODELS.has(config.model)) {
    return {
      id: 'groq-gpt-oss',
      temperature: 0.35,
      // Groq counts GPT-OSS reasoning tokens against max_tokens even when
      // include_reasoning is false. Leave enough room for both the model's
      // internal reasoning and the complete compact JSON presentation.
      maxOutputTokens: 512,
      deadlineMs: 12000,
      structuredOutput: 'none',
      extraBody: { reasoning_effort: 'low', include_reasoning: false },
    }
  }
  const isOllama = config.provider === 'ollama'
    || origin === 'http://localhost:11434'
    || origin === 'http://127.0.0.1:11434'
  if (isOllama) {
    return {
      id: 'ollama-openai',
      temperature: 0.4,
      maxOutputTokens: 220,
      deadlineMs: 10000,
      structuredOutput: 'none',
      extraBody: {},
    }
  }
  return {
    id: 'custom-openai-compatible',
    temperature: 0.35,
    maxOutputTokens: 220,
    deadlineMs: 8000,
    structuredOutput: 'none',
    extraBody: {},
  }
}

function finishReason(value: unknown): CompletionFinishReason {
  switch (value) {
    case 'stop': return 'stop'
    case 'length': return 'length'
    case 'content_filter': return 'content_filter'
    case 'tool_calls': return 'tool_calls'
    default: return 'unknown'
  }
}

function retryAfterMs(response: Response): number | undefined {
  const raw = response.headers.get('Retry-After')
  if (!raw) return undefined
  const seconds = Number(raw)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(raw)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined
}

async function retryAfterBodyMs(response: Response): Promise<number | undefined> {
  try {
    const body = await response.text()
    const match = body.match(/try again in\s+(\d+(?:\.\d+)?)\s*(ms|s)\b/i)
    if (!match) return undefined
    const amount = Number(match[1])
    if (!Number.isFinite(amount)) return undefined
    return Math.max(0, match[2].toLocaleLowerCase() === 'ms' ? amount : amount * 1000)
  } catch {
    return undefined
  }
}

export async function completeChat(
  config: LLMConfig,
  messages: ChatMessage[],
  options: ChatOptions,
): Promise<ChatCompletionResult> {
  const baseUrl = config.baseUrl.replace(/\/$/, '') || 'https://api.openai.com/v1'
  const profile = providerCapabilityProfile(config)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)

  try {
    let response: Response
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: options.temperature ?? profile.temperature,
          max_tokens: options.maxTokens,
          ...(profile.structuredOutput === 'json-schema' && options.responseSchema
            ? { response_format: { type: 'json_schema', json_schema: options.responseSchema } }
            : {}),
          ...profile.extraBody,
        }),
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return { ok: false, kind: 'timeout', message: 'LLM request timed out' }
      }
      return { ok: false, kind: 'network', message: error instanceof Error ? error.message : 'LLM network failure' }
    }
    if (!response.ok) {
      const status = response.status
      const kind: CompletionFailureKind = status === 401 || status === 403
        ? 'auth'
        : status === 429
          ? 'rate-limit'
          : 'http'
      const retryAfter = retryAfterMs(response)
        ?? (status === 429 ? await retryAfterBodyMs(response) : undefined)
      return {
        ok: false,
        kind,
        status,
        retryAfterMs: retryAfter,
        message: `LLM HTTP ${status}`,
      }
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      return { ok: false, kind: 'invalid-response', status: response.status, message: 'Unreadable LLM response' }
    }
    const decoded = completionContent(payload)
    if (!decoded?.content.trim()) {
      return { ok: false, kind: 'empty', status: response.status, message: 'LLM empty response' }
    }
    return {
      ok: true,
      content: decoded.content.trim(),
      finishReason: decoded.finishReason,
      usage: decoded.usage,
      status: response.status,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function completionContent(payload: unknown): {
  content: string
  finishReason: CompletionFinishReason
  usage?: { promptTokens?: number; completionTokens?: number }
} | null {
  if (!payload || typeof payload !== 'object' || !('choices' in payload)) return null
  const choices = payload.choices
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object' || !('message' in choices[0])) return null
  const message = choices[0].message
  if (!message || typeof message !== 'object' || !('content' in message)) return null
  if (typeof message.content !== 'string') return null
  const choice = choices[0] as Record<string, unknown>
  const usageRaw = 'usage' in payload && payload.usage && typeof payload.usage === 'object'
    ? payload.usage as Record<string, unknown>
    : null
  return {
    content: message.content,
    finishReason: finishReason(choice.finish_reason),
    ...(usageRaw ? {
      usage: {
        ...(typeof usageRaw.prompt_tokens === 'number' ? { promptTokens: usageRaw.prompt_tokens } : {}),
        ...(typeof usageRaw.completion_tokens === 'number' ? { completionTokens: usageRaw.completion_tokens } : {}),
      },
    } : {}),
  }
}
