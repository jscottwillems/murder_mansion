import { llmConversationPlan } from './src/game/llm'
import { ARCHETYPES, EVIDENCE_BY_ARCHETYPE } from './src/game/data'
import type { Guest } from './src/game/types'

const requests: { max_tokens: number; messages: { content: string }[] }[] = []

function choice(label: string) {
  return { label: `${label}?`, response: `A specific answer about ${label}.`, emotion: 'thoughtful' }
}

globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body)) as typeof requests[number]
  requests.push(body)
  const prompt = body.messages[1].content
  const specs = [...prompt.matchAll(/^- id="([^"]+)", evidenceId=("[^"]+"|null)/gm)]
  const routes = specs.map((match, index) => ({
    id: match[1],
    topic: index ? 'intel' : 'timeline',
    evidenceId: match[2] === 'null' ? null : JSON.parse(match[2]),
    rootQuestion: `What specific detail belongs to ${match[1]}?`,
    openingResponse: `I remember one precise detail concerning ${match[1]}.`,
    openingEmotion: 'thoughtful',
    stages: [
      { advance: choice(`Advance ${match[1]} one`), stall: choice(`Stall ${match[1]} one`), close: choice(`Close ${match[1]} one`) },
      { advance: choice(`Advance ${match[1]} two`), stall: choice(`Stall ${match[1]} two`), close: choice(`Close ${match[1]} two`) },
    ],
  }))
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ routes }) } }] }), { status: 200 })
}) as typeof fetch

const archetype = ARCHETYPES[0]
const guest = {
  id: 'guest-1',
  name: 'Test Guest',
  archetypeId: archetype.id,
  isKiller: false,
} as Guest
const evidence = EVIDENCE_BY_ARCHETYPE[archetype.id]
const plan = await llmConversationPlan(
  { baseUrl: 'https://api.groq.com/openai/v1', apiKey: 'test', model: 'llama-3.1-8b-instant' },
  guest,
  { clockMin: 0, roomName: 'Dining Hall', knownVictims: [], caseEvents: [], otherGuests: [], evidence },
)

if (!plan || plan.length !== 4) throw new Error(`expected four validated routes, received ${plan?.length ?? 0}`)
if (requests.length !== 2) throw new Error(`expected two requests, received ${requests.length}`)
if (requests.some(request => request.max_tokens !== 3200)) throw new Error('every route batch must use the provider-safe 3,200-token cap')
if (requests.some(request => !request.messages[1].content.includes('Create exactly 2 distinct conversation routes'))) {
  throw new Error('each request must contain exactly two routes')
}

console.log('LLM PLAN VALIDATION PASSED: 4 routes across 2 provider-safe requests')
