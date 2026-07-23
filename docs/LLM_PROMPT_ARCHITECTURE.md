# LLM Prompt Architecture

Status: implementation contract. This document governs generated dialogue. `src/game/data.ts` remains authoritative for IDs and the evidence matrix; `docs/NARRATIVE_BIBLE.md` governs canon; `docs/BRANCHING_CASE_DESIGN.md` governs story logic.

## 1. Boundary and guarantee

The deterministic story engine owns every fact and consequence:

- case seed, killer, victims, names, rooms, clock, cover timeline, knowledge, rumors and attribution;
- storylet/beat selection, exact choice IDs and order, effects, evidence unlocks, next nodes, route closure, fallbacks, deaths and endings;
- whether a fact may be presented now and whether a choice is currently legal.

The model is only a presentation renderer. For one selected beat it receives a compact, knowledge-scoped packet and may return only:

```ts
type BeatPresentation = {
  npcLine: string
  emotion: 'neutral' | 'suspicious' | 'worried' | 'angry' | 'thoughtful' | 'surprised'
  options: Array<{ choiceId: string; label: string }>
}
```

Generated prose may naturally realize the packet's supplied atomic facts. It may not add a fact, effect, choice, unlock, node, victim, culprit, route, object, observation, rumor, relationship, time, room or ending. The engine applies a choice by looking up `choiceId`; it never parses `npcLine` or `label` into state.

Local checks can guarantee schema, IDs, order, lexical constraints and use of required anchors. They cannot mathematically prove unrestricted semantic correctness in natural-language paraphrases. Therefore the hard guarantee is: every beat has a validated authored presentation, and any uncertain or invalid generation is discarded in favor of that fallback before display. Model output can never mutate story state.

## 2. Delivery strategy

| Strategy | Benefit | Cost/risk | Decision |
| --- | --- | --- | --- |
| On demand, one beat | Small packet, current knowledge, simple validation and fallback | A replacement may arrive after the authored text | **Initial implementation** |
| Full interview plan | One wait and internally consistent prose | Large output, stale knowledge, broad leakage surface, expensive partial repair; current implementation blocks UI | Do not use |
| Prefetch likely beats | Hides latency | Wasted calls, invalidation and cache complexity | Optional phase 2, only for already-legal successor beats |

Render the authored `BeatPresentation` immediately. Start one on-demand request in parallel. Replace only the presentation—not state—when a valid response arrives and the same `caseSeed + guestId + beatId + beatRevision` is still visible and no choice has been selected. Never show a spinner in place of usable authored dialogue. If initial complexity must be limited, ship on-demand replacement, exact validation, fallback and in-flight deduplication first; defer background prefetch and persistent caches.

## 3. Stable prompts and voice data

Prompt builders must be generic data serializers. They may not contain `switch`/`if` prose for archetypes, killers or innocents. Each archetype has a versioned data voice card. To minimize uncached input, the system prompt serializes only the active base, role, high-trust and high-pressure voice rules; inactive branches and voice metadata remain local.

### Exact system prompt template

Substitute only `{{PROMPT_VERSION}}` and canonical minified `{{ACTIVE_VOICE_JSON}}`. Preserve all other bytes:

```text
MURDER MANSION DIALOGUE RENDERER {{PROMPT_VERSION}}
Render one authored 1931 mystery beat. PACKET is exhaustive: add no fact, name, relationship, observation, object, room, time, motive, alibi, route, culprit, or conclusion.
Realize facts naturally. Keep rumors attributed; never turn hearsay or inference into eyewitness knowledge. Use cover only when supplied. Never imply inherent guilt or innocence.
Obey every safeguard and limit. Return minified JSON with exactly npcLine, emotion, options. Options contain exactly choiceId and label; copy IDs unchanged and in order.
emotion must be one of: neutral, suspicious, worried, angry, thoughtful, surprised.
ACTIVE_VOICE={{ACTIVE_VOICE_JSON}}
```

No secrets, case facts, names or API keys appear in the system prompt.

### Voice-card shape and transformations

```ts
interface VoiceCard {
  archetypeId: ArchetypeId
  roleName: string
  base: string[]
  trust: string[]
  pressure: string[]
  innocent: string[]
  killer: string[]
  banned: string[]
}
```

`base` always applies. `trust` applies at high trust, `pressure` at high pressure, and exactly one of `innocent`/`killer` applies. Trust and pressure are independent; when both are high, apply both without changing facts. These are style transformations, never additional knowledge:

- `columnist` — Base: compact epigrams, at most one precise social image; “darling” is defensive, not habitual. Trust: drop endearments, give dates, permit paper custody. Pressure: over-polish the joke and attack taste or method. Innocent: conceal Celia/custody, not route. Killer: cool false authority; repeat the supplied cover and never invent an unpublished detail.
- `surgeon` — Base: short clinical observations, period vocabulary, explicit uncertainty. Trust: state limits, times and dilutions; offer comparison samples. Pressure: correct nouns and address the detective as an irresponsible trainee. Innocent: protect patient identity under confidentiality. Killer: technically exact tone may shift treatment timing only when the packet supplies that lie.
- `curator` — Base: restrained, botanically accurate metaphor; plants are responsibilities, not oracles. Trust: name species and invite joint custody. Pressure: become still, speak briefly to a plant, reject ownership language. Innocent: protect collection/message ownership, not route. Killer: use the supplied treatment time and cover; do not mystify grit.
- `magician` — Base: concrete stagecraft with at most one flourish. Trust: patter falls away; credit collaborators and demonstrate openly. Pressure: fake applause, quicker patter, guarded left hand/pocket. Innocent: shame concerns authorship and duplicate-key work. Killer: use only the supplied cue/false-presence cover; no spontaneous trick-created alibi.
- `correspondent` — Base: cable economy, concrete verbs, dry understatement; no generic war similes. Trust: map facts and mark verified versus unverified. Pressure: fragments, counted exits, protected inner pocket. Innocent: omit June's identity while preserving attribution. Killer: planted report or map claim must be supplied; never promote source copy to eyewitness fact.
- `accountant` — Base: figures before judgments; ledger language sparse and exact; resentment understated. Trust: make copies, initial corrections, admit own signature. Pressure: correct sums and close the ledger physically. Innocent: conceal false-account custody, not movement. Killer: repeat only the supplied ledger-time lie and stable cover.
- `vocalist` — Base: lyrical cadence without parody; period club vocabulary; “sugar” only to deflect or comfort. Trust: stop humming, repeat exact rests, agree to a test. Pressure: hum the wrong phrase or go deliberately quiet. Innocent: protect June while offering the supplied repeatable code. Killer: react to cues only as packeted; scent is false presence, never proof.
- `antiquarian` — Base: provenance first, at most one historical aside; objects are evidence, not prophecy. Trust: permit handling, state own role, authenticate publicly. Pressure: apologize to objects and become pedantic. Innocent: protect patron and chain of custody. Killer: any dating claim must come from supplied facts; never invent occult or object history.
- `chauffeur` — Base: short concrete sentences; pauses rare; mechanical comparisons only when earned. Trust: remove cap, put route on record, self-correct. Pressure: nouns and clipped answers; call out rank assumptions. Innocent: admit warming the Bentley while denying only what the packet permits. Killer: stable passenger/fare/return cover only; no new road or vehicle movement.
- `debutante` — Base: apparent naivety followed by one exact observation; never childish. Trust: less breathy, exact sums, one page at a time. Pressure: smile too brightly, echo patronizing words, withhold names. Innocent: control guardian/copy disclosure. Killer: weaponize underestimation only in tone; card score, rooms and times remain packet-exact.

All cards ban generic exposition, author imitation, omniscience, game-mechanic language and archetype-as-guilt framing. Global period bans include modern forensics or products, especially `chlorhexidine`, `quaternary disinfectant`, DNA, CCTV, mobile/phone calls, internet, computer, email, podcast and modern police certainty. Prefer the exact period material supplied by the packet: carbolic solution, iodine, boric wash, surgical spirit, sulphur wash, petrol, paraffin or motor solvent.

## 4. Beat packet

The engine constructs this canonical local object after eligibility and reachability checks. It includes presentation-safe data only and remains the validator/cache authority. Before transport, `buildBeatRenderPacket` projects it to a smaller provider object: local case/guest/fact IDs, versions, revisions, posture metadata, inactive voice branches, empty arrays, default booleans and unused cover facts are omitted. The projection preserves speaker name/role, active facts and provenance, immutable choice IDs/directives, non-empty safeguards, relevant cover claims and output limits. Never send the hidden case graph, other NPC knowledge, choice effects or authored fallback text.

```ts
type KnowledgePhase = 'pre-discovery' | 'post-discovery'
type RoleMode = 'innocent' | 'killer'
type FactSource = 'observed' | 'attributed-rumor' | 'artifact' | 'inferred' | 'confessed' | 'public'

interface AtomicFact {
  factId: string
  source: FactSource
  proposition: string                 // already safe to reveal in this beat
  attribution?: {
    sourceId: string
    displayName: string
    requiredPhrase: string            // e.g. "Celia told me"
  }
  requiredAnchors: string[]            // literal, case-insensitive tokens/phrases
}

interface BeatChoiceSpec {
  choiceId: string                     // immutable semantic ID
  intent: 'rapport' | 'analyze' | 'challenge' | 'pressure' | 'bargain'
    | 'protect' | 'expose' | 'conceal' | 'test' | 'withdraw'
  labelDirective: string               // presentation intent, no effect data
  requiredAnchors: string[]
}

interface BeatPacket {
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
    options: BeatChoiceSpec[]           // exact display order
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
```

Rules:

1. `facts` contains only facts the speaker may state now. A rumor includes its attribution object. `inferred` facts retain uncertainty in `proposition`.
2. `noNewFact` is true for reactions/refusals; then `facts` must be empty.
3. `coverFacts` is present if and only if `roleMode === 'killer'`, is generated once at case assembly, and never changes. A beat that does not discuss the cover should omit cover anchors from `requiredAnchors` but still supplies the same cover object.
4. `allowedProperNouns` includes the speaker's display name and only names legal in this beat. Fixed names such as Sir Edgar Rooke, Celia, June Bell and Lady Vale are not automatically allowed.
5. `allowedTimes` contains exact visible renderings such as `12:10 AM` and approved time bands. `allowedRooms` contains only canonical rooms needed by the beat; include `west service passage` only when legal.
6. `requiredAnchors` is the union of exact terms that must survive generation. It is not a license to mention unrelated packet fields.
7. Player-visible prose never includes `factId`, `sourceId`, `tellIds`, role mode or engine terminology.

## 5. Output JSON Schema

Use this schema locally for every provider. Use provider structured output only when the capability profile explicitly enables it; local validation remains mandatory.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["npcLine", "emotion", "options"],
  "properties": {
    "npcLine": { "type": "string", "minLength": 1, "maxLength": 500 },
    "emotion": {
      "enum": ["neutral", "suspicious", "worried", "angry", "thoughtful", "surprised"]
    },
    "options": {
      "type": "array",
      "minItems": 0,
      "maxItems": 4,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["choiceId", "label"],
        "properties": {
          "choiceId": { "type": "string", "minLength": 1, "maxLength": 160 },
          "label": { "type": "string", "minLength": 1, "maxLength": 180 }
        }
      }
    }
  }
}
```

The runtime additionally requires `options.length === packet.beat.options.length`; JSON Schema alone cannot express the packet-dependent IDs and order.

## 6. Validation contract

Parse the whole trimmed response as JSON. Do not extract JSON from prose or fences. Normalize Unicode to NFC and collapse internal whitespace only after parsing. Return all applicable codes, but stop expensive checks when parsing or shape fails.

### Error codes

- `E_PARSE_JSON` — not one complete JSON object.
- `E_SCHEMA_KEYS` — missing/extra field, wrong type, null, bounds failure or non-string.
- `E_OPTION_COUNT` — option count differs from packet.
- `E_CHOICE_ID` — an ID differs at its index, is duplicated or is unknown.
- `E_EMOTION` — emotion is outside the six-value enum and the conservative synonym map. Harmless presentation synonyms such as `concerned` normalize to their supported UI state (`worried`); unknown moods still fail.
- `E_EMPTY_TEXT` — line or label is blank after normalization.
- `E_LENGTH` — NPC exceeds 32 words/two sentences or a label exceeds 14 words.
- `E_PUNCTUATION` — NPC is not one or two complete sentences or a label has multiple sentences. Single-sentence labels may use any appropriate terminal punctuation or no terminal mark.
- `E_PRE_DISCOVERY` — pre-discovery text uses or implies known fatality; lexical set includes victim, murder, murderer, murdered, kill/killed/killing, death, dead, corpse, body/bodies, slain, fatal and obituary.
- `E_PROPER_NOUN` — a detected proper name is not in `allowedProperNouns`.
- `E_TIME` — a clock expression or time band is not in `allowedTimes`.
- `E_ROOM` — a canonical room or west-passage reference is not in `allowedRooms`.
- `E_ATTRIBUTION` — an attributed rumor omits its exact `requiredPhrase`, changes source, or is phrased as the speaker's direct observation.
- `E_COVER` — a killer cover beat omits required room/time/witness anchors or introduces a different room, time or witness.
- `E_REQUIRED_ANCHOR` — a packet or per-field literal anchor is absent.
- `E_FORBIDDEN_TERM` — packet/global forbidden term, anachronism, mechanics or state mutation language appears.
- `E_STATE_CLAIM` — prose claims an unlock, effect, next node, evidence award, choice result, guilt verdict or ending.
- `E_REPETITION` — normalized duplicate, excessive overlap with recent text, or repeated label.
- `E_UNSAFE_SEMANTICS` — optional conservative semantic classifier cannot establish that prose is limited to supplied propositions.

### Ordered algorithm

1. Classify request outcome before content validation. HTTP/auth/transport failures go directly to fallback under section 8.
2. Parse whole JSON; require exact keys recursively and schema bounds.
3. Require option IDs to equal `packet.beat.options.map(x => x.choiceId)` byte-for-byte and in order. Never repair IDs locally.
4. Validate emotion, non-empty normalized strings, word/sentence counts and punctuation. Count contractions as one word.
5. Scan the combined NPC line and labels for pre-discovery terms when applicable. Also reject euphemisms from a maintained fixture list that clearly imply a known fatality.
6. Detect times with clock/time-band regexes and rooms with the canonical nine-room lexicon plus west-passage aliases; every match must be allowlisted.
7. Detect proper nouns using an allowlist-first tokenizer plus known case-name dictionary. Exempt sentence-initial ordinary words and approved period vocabulary. Any uncertain name fails closed.
8. For every presented attributed rumor, require its literal attribution phrase before the proposition and reject first-person witness constructions (`I saw/heard/noticed`) unless the source is `observed`.
9. On cover beats, require supplied cover anchors and reject every other detected room, time and person. On non-cover beats, still reject cover claims not represented in `facts`.
10. Require all global/NPC/choice anchors in their designated field. Scan global and packet forbidden terms and mechanics phrases.
11. Normalize text to lowercase Unicode letters/numbers, remove punctuation and compare: exact fingerprints must differ; label fingerprints must be unique; reject a reused six-word sequence or trigram Jaccard similarity over `0.70` against recent lines/labels.
12. If a conservative semantic checker exists, it may reject but never approve around failed deterministic checks. It receives no hidden facts.
13. If all checks pass, atomically swap presentation only if the visible beat identity still matches. Effects remain bound to local IDs.

Required local unit tests must exercise each code independently and combinations. Validators use exhaustive handling of error-code unions.

## 7. Request and provider profiles

Send two messages: the compact active-voice system prompt and canonical JSON from `buildBeatRenderPacket(packet)` as the user message. Repair uses the same projection. Defaults target low-variance concise prose:

```ts
interface ProviderCapabilityProfile {
  id: 'groq-gpt-oss' | 'ollama-openai' | 'custom-openai-compatible'
  temperature: number
  maxOutputTokens: number
  deadlineMs: number
  structuredOutput: 'none' | 'json-schema'
  extraBody: Record<string, unknown>
}
```

- **Groq GPT-OSS** — Match Groq origin plus model `openai/gpt-oss-20b` or `openai/gpt-oss-120b`. `temperature: 0.35`, `max_tokens: 512`, deadline `12000 ms`, `structuredOutput: none`, extras `{ "reasoning_effort": "low", "include_reasoning": false }`. Groq counts internal reasoning against this ceiling even when reasoning is omitted from the response; 512 retains headroom over measured beat completions while reducing rate-limit reservation pressure.
- **Ollama OpenAI compatibility** — Default base URL `http://localhost:11434/v1`, user-selected model (current preset `llama3.2`). `temperature: 0.4`, `max_tokens: 220`, deadline `10000 ms`, `structuredOutput: none`, no nonstandard fields. Browser/CORS availability remains a setup concern.
- **Unknown custom OpenAI-compatible endpoint** — Conservative `/chat/completions` profile: `temperature: 0.35`, `max_tokens: 220`, deadline `8000 ms`, `structuredOutput: none`, no `seed`, reasoning or vendor fields. A future explicit tested capability registry may enable JSON Schema by exact normalized origin + model; never infer support from “OpenAI-compatible.”

Provider profile is selected from configured provider, normalized origin and exact model. Unknown combinations use the custom profile. The initial UI need not expose these controls.

## 8. Repair and fallback

Every beat has an authored `BeatPresentation` validated at build/startup with the same deterministic rules (except model-only repair metadata). The fallback is available before the request starts.

Classify failures:

- **Content/schema:** any `E_*` validation code, empty completion or provider-declared malformed generation. Permit exactly one repair request.
- **Transport/config:** DNS/network/CORS, abort/deadline, HTTP `401/403/404/408/409/429`, `5xx`, invalid endpoint, unavailable model or unreadable HTTP payload. Do not content-repair these failures. A `429` with a short provider `Retry-After` may retry the original request once when the wait and at least 1500 ms of request time fit inside the provider deadline.

### Exact repair prompt

Use the same system prompt. The user message is exactly these lines, substituting canonical minified JSON values:

```text
REPAIR ONE INVALID PRESENTATION.
ERROR_CODES={{ERROR_CODES_JSON}}
BEAT_PACKET={{BEAT_PACKET_JSON}}
INVALID_OUTPUT={{INVALID_OUTPUT_JSON}}
Return a complete replacement, not commentary. Output one minified JSON object only with exactly npcLine, emotion, options. Copy choiceId values exactly in supplied order. Set emotion to exactly one of: neutral, suspicious, worried, angry, thoughtful, surprised. Use only supplied facts and safeguards.
```

The repair uses the provider profile's output limit and remaining deadline only if at least 1500 ms remains; otherwise fallback immediately. Never repair a repair. Never merge original and repaired fields. If repair fails any check, use fallback.

Fallback policy:

1. Authored presentation is displayed immediately.
2. Valid generation or valid one-time repair may replace it while the identical beat remains unselected.
3. Any other outcome keeps authored presentation silently, with optional non-intrusive source status.
4. State transitions only after a player selects a locally known `choiceId`.
5. State never rolls back, generation never replays an effect, and a late response is ignored.
6. A fallback may be less varied, but must expose the same choices and supplied reveal as the selected authored beat.

## 9. Cache, deduplication and resilience

### Canonical fingerprint

Canonical JSON recursively sorts object keys, preserves array order, normalizes strings to NFC, rejects `undefined`/non-finite numbers, and emits UTF-8 without insignificant whitespace. Compute:

```text
sha256(
  "mm-beat-v1\n" +
  promptVersion + "\n" +
  providerProfileId + "\n" +
  normalizedOrigin + "\n" +
  exactModel + "\n" +
  sha256(exactSystemPromptUtf8) + "\n" +
  canonicalJson(beatPacket)
)
```

All output-affecting fields are included. API key, authored fallback, telemetry IDs and UI timestamps are excluded. Do not share generated output across different provider/model/system/packet fingerprints.

- **Positive cache:** valid presentation by fingerprint, memory LRU of 128 entries for the case/session. Revalidate on read. Persistent caching is deferred until privacy/version invalidation is designed.
- **In-flight deduplication:** one promise per fingerprint. All callers await it; remove it in `finally`. UI cancellation detaches a caller but need not abort a request still used elsewhere.
- **Negative content cache:** after generation plus repair fail, cache fallback decision for that beat fingerprint for five minutes.
- **Provider breaker key:** `providerProfileId + normalizedOrigin + exactModel`, never API key. Three transport/`5xx` failures in 60 seconds open for 60 seconds; one half-open probe follows. A success closes it.
- **Negative provider cache:** `401/403` until settings fingerprint changes (or session ends); `404` unavailable model for five minutes; a final `429` after the optional one-time wait for `Retry-After` clamped to 5–60 seconds; timeout/network/CORS for 15 seconds; `5xx` for 30 seconds. During open/negative periods, use authored output without requests.
- Content failures do not trip the provider breaker. `429` does not consume the breaker threshold.

### Privacy-safe telemetry

Record only: random session ID, prompt/profile/model version, hashed beat fingerprint prefix, archetype ID, role mode, knowledge phase, latency bucket, cache/dedup status, HTTP status class, validation codes, repair attempted/succeeded, fallback used and token counts when supplied. Never record API keys, endpoint query strings, names, prose, prompts, packet contents, facts, rumor text, cover data or full case seed. Debug prose logging must be explicit, local-only, off by default and visually warned.

## 10. Benchmarks and adversarial fixtures

Benchmark a fixed, non-secret corpus covering all ten archetypes, both roles, all trust/pressure corners, all six emotions, pre/post-discovery, each source type, zero through four choices, all nine rooms, west passage, exact 12:10 references and every evidence ID. Run at least 200 packets per supported profile/model version and retain aggregate metrics only.

Metrics:

- first-pass valid rate; valid-after-one-repair rate; authored fallback rate;
- p50/p95 end-to-end latency and replacement-before-interaction rate;
- exact ID/order, schema and deterministic-safeguard pass rates;
- per-error-code counts, timeout/HTTP rate, output tokens and estimated cost;
- voice-card adherence from blinded rubric sampling;
- unsupported-fact, attribution, cover-drift, pre-discovery and period-violation rates;
- duplicate/repetition rate and cache/dedup hit rates.

Required adversarial fixtures:

1. Markdown fence, commentary before JSON, trailing JSON and duplicate keys.
2. Extra/missing fields, nulls, arrays instead of objects and overlong strings.
3. Changed, reordered, duplicated, omitted and fabricated choice IDs.
4. Unsupported emotion and emotion-like prose.
5. Pre-discovery `body`, euphemistic fatality, obituary and “the late [name].”
6. Undiscovered victim name and another NPC's private fact.
7. Invented proper name, servant, relationship and fixed name not allowlisted.
8. Invented tenth room, misuse of Master Suite as Host bedroom and hidden-passage alias.
9. Unapproved time, changed `12:10`, modern time formatting and impossible chronology.
10. Rumor without attribution, changed source and “I saw” promotion.
11. Killer changes private room, interval or witness; reveals murder-only detail; confesses.
12. Innocent is declared cleared or an archetype is framed as naturally guilty.
13. Fourth evidence association, culprit identification and evidence-as-conviction.
14. New unlock/effect/ending, `[evidence unlocked]`, “choose option” or next-node language.
15. Chlorhexidine, DNA, CCTV, smartphone, internet, modern slang and forensic certainty.
16. Fake quotation from the Host, dead NPC acquiring a recollection and omniscient summary.
17. Prompt injection inside a fact proposition or label directive.
18. Exact repeat, close paraphrase, repeated six-word span and duplicate labels.
19. Oversized/unterminated output, empty completion, reasoning leakage and malformed UTF-8.
20. `401`, `403`, `404`, `429`, `5xx`, CORS/network failure, timeout and late completion after selection.

### Acceptance targets

- `100%` exact choice-ID/order preservation among displayed output.
- `100%` displayed schema, approved-emotion, length, pre-discovery, allowlisted proper-noun/time/room and attributed-rumor compliance.
- `100%` adversarial deterministic fixtures rejected to authored fallback.
- `0` model-driven state mutations, unlocks, node changes, cover changes or rollbacks.
- `0` repair attempts for transport/auth/rate-limit failures; at most one for content/schema.
- Authored presentation available synchronously for `100%` of legal beats.
- On the benchmark: first-pass valid `>= 90%`, valid after repair `>= 97%`, fallback `<= 3%` excluding transport failures.
- Warm-cache p95 `< 50 ms`; network p95 within provider deadline; no request exceeds `10 s`.
- Blinded voice adherence `>= 4/5` for `>= 90%` of sampled valid generations.
- Unsupported-fact, attribution-drift, cover-drift and period-violation rate in displayed generated prose: `0` in fixtures and sampled release gate. Uncertain samples become fallbacks, not exceptions.

## 11. Developer acceptance checklist

- [ ] Story engine selects a legal beat and owns facts, choice order/IDs, effects, unlocks, next nodes and endings.
- [ ] UI renders authored presentation immediately and only swaps an unchanged, unselected beat.
- [ ] Output type is exactly `{npcLine, emotion, options:[{choiceId,label}]}`.
- [ ] Stable system template and ten versioned data voice cards contain no case-specific data.
- [ ] Prompt/request builders contain no archetype or role prose branches.
- [ ] Packet contains only speaker-safe/public facts and preserves rumor provenance.
- [ ] Killer packet always carries the one immutable assembled cover; validators reject drift.
- [ ] Exact schema, ID/order, emotion, length, punctuation, repetition, discovery, proper-noun, time, room, attribution, period and mechanics checks run locally.
- [ ] All validator error codes have isolated unit tests and exhaustive TypeScript handling.
- [ ] Authored fallback for every legal beat passes equivalent startup/build validation.
- [ ] Content/schema failure gets at most one repair; transport/auth/rate-limit failure gets none.
- [ ] Late, stale and canceled responses cannot apply effects or roll back state.
- [ ] Groq GPT-OSS, Ollama and unknown custom endpoints use the explicit conservative profiles above.
- [ ] Canonical fingerprint, 128-entry LRU, in-flight dedupe, negative caches and circuit breaker match this contract.
- [ ] Telemetry contains no keys, names, prose, prompts, packet facts, cover facts or full seed.
- [ ] Benchmark corpus covers ten archetypes, role/posture/knowledge combinations and all adversarial fixtures.
- [ ] Release meets every acceptance target; otherwise generated presentation remains disabled and authored dialogue ships.
