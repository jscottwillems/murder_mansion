# Branching Case Design

Status: canonical writer-facing implementation blueprint. This document defines how the material in `docs/NARRATIVE_BIBLE.md` becomes a fair procedural-authored case. It describes story logic, not a mandate for a particular code architecture.

## 1. Design goals

The runtime must assemble a different night without asking a language model or a developer to invent mystery logic. Authored data supplies truths, lies, dependencies, fallbacks, and consequences. Procedural systems select identities, victims, locations, ordering, and available carriers. Generated dialogue may realize an approved beat in character; it may not create facts.

A successful assembly guarantees:

- exactly one randomized killer among the ten archetypes;
- one randomized opening victim and zero or more later randomized victims;
- exactly three immutable evidence associations per archetype, as defined in `data.ts`;
- at least one reachable personal reveal for all thirty archetype/evidence pairs;
- for every critical fact, one primary path and at least one alternate artifact, carrier, or external corroboration path;
- a stable killer cover timeline;
- enough surviving, reachable facts to establish material + opportunity + deception/motive;
- choices that alter trust, pressure, flags, other NPCs, personal endings, and the whole-case ending;
- no choice, death, shutdown, or destroyed object that makes correct resolution impossible.

## 2. Canonical blueprint concepts

### Case seed

The immutable identifier for one run. Every random selection below derives from it so tests and saved games reproduce the same case.

### Archetype dossier

Stable authored content for one of the ten roles:

- public mask, private need, secret, vulnerability;
- relationship edges;
- voice and tell rules;
- three canonical evidence threads;
- innocent and killer overlays;
- personal-ending definitions;
- dead/shutdown fallback carriers.

### Case role

The procedural assignment layered over a dossier:

- `killer`;
- `opening-victim`;
- `later-victim`;
- `survivor`;
- optionally `attempted-target`, `exchange-carrier`, `case-custodian`, or `confidant-contact`.

Case roles do not rewrite dossier truth. A victim may have acted suspiciously before death; the killer still owns their ordinary personal history.

### Fact

The smallest canonical proposition that can be true in case state. Facts are not prose. Example: `exchange.time = 00:10`, `route.west-panel-opened = true`, or `columnist.atomizer-transferred = true`.

Every fact declares:

- scope: personal, circuit, murder, or global;
- source type: observation, attributed rumor, artifact, expert inference, or confession;
- earliest act;
- knowledge owners;
- carriers and fallbacks;
- whether it supports material, opportunity, deception/motive, or conspiracy only.

### Storylet

An authored encounter that consumes current context and offers a small meaningful choice. A storylet has:

- entry conditions;
- speaker and optional referenced character;
- player-visible hook;
- knowledge-safe response variants;
- two to four choices;
- intent for each choice;
- state effects;
- exit facts or an explicit no-fact result;
- fallback activation if its speaker is unavailable.

A storylet is not a whole interview tree. It should be reusable in different orders and able to re-enter after external corroboration.

### Thread

A goal-directed set of storylets around one exact subject. Standard personal evidence threads use:

1. **notice** — fair sensory or behavioral hook;
2. **context** — legitimate possession/action;
3. **test** — comparison, reconstruction, or named corroboration;
4. **resolution** — association entered into the journal, without implying guilt.

Threads may branch, pause, reroute, or terminate. Their canonical truth does not change.

### Circuit

A cross-NPC network joining personal facts into a larger inference. The four circuits are paper/payments, key/route, performance/false presence, and material provenance. A circuit has four owners, physical bridges, three-owner completion, and optional fourth-owner enrichment.

### Reveal

A journal-worthy, testable fact. A reveal must state concrete contact or transfer. “The Surgeon seems suspicious” is not a reveal. “Carbolic solution splashed his cuff while he dressed a wound in the Library” is.

### Carrier

Anything capable of delivering a fact: living NPC, prior transcript, artifact, confidant statement, room reconstruction, or cross-NPC inference. A carrier has availability conditions and authority limits.

### Convergence

A late-case synthesis that combines facts already obtained. It never introduces a surprise solution fact. Convergence tells the player what their evidence can test, not whom to accuse.

### Personal ending and case ending

Personal endings resolve a character’s need/secret. Case endings resolve proof/prevention. The publish/seal/destroy disposition resolves the Blue Case archive. These are three independent layers evaluated together at epilogue.

## 3. Case assembly

Assembly occurs before player control and must be fully validated.

### Step 1: instantiate the stable world

Load the nine room IDs, hidden west-passage sub-location, fixed Host, fixed timeline anchors, motifs, ten dossiers, four circuits, and immutable evidence matrix from canon.

### Step 2: assign names and identities

Assign one period-appropriate randomized name to each archetype using existing gender/model constraints. Names affect presentation only. Reserve fixed non-roaming names (Sir Edgar Rooke, Celia, June Bell, Lady Vale) so pools cannot create confusing duplicates.

### Step 3: select killer and victims

Select one killer uniformly unless balancing rules intentionally weight recent seeds. Select the opening victim from the other nine. Later victims remain procedural, but before allowing a death run the reachability check in section 10.

No archetype-specific story can prohibit being killer or victim.

### Step 4: instantiate killer overlay

Select one motive pressure compatible with the dossier:

- suppress exposure of personal complicity;
- protect a vulnerable confidant by wrongful means;
- recover the Blue Case or one component;
- prevent loss of livelihood/status/freedom;
- seize leverage from the Host’s failing system.

Select one of the killer’s three associated materials as the murder-scene trace for each death, rotating as current simulation behavior requires. Author one deposition fact explaining transfer. Select a deception package:

- gardenia false trail;
- false limp;
- staged song/knock response;
- moved/polished object;
- altered/counterfeit note;
- staged escape/Bentley;
- false presence through performance.

The deception package must implicate at least two plausible innocent associations and must be disprovable by a circuit.

### Step 5: generate stable cover timeline

Choose:

- one true pre-window anchor in a public room;
- one false private interval covering the murder opportunity;
- one true post-window re-entry observation;
- one claimed witness and exact wording of the claim;
- one cover weakness discoverable through external corroboration.

Store these as structured facts. All killer dialogue, rumors, and LLM prompts receive the same structure. Never generate a new alibi per question.

### Step 6: assign conspiracy functions

Procedurally choose surviving archetypes for:

- intended brass-key carrier;
- intended Blue Case receiver;
- 12:10 watcher;
- signal initiator;
- signal answerer.

These functions may overlap only if validation preserves two independent witnesses. The killer may hold one function, but not all. If the opening victim held a function, activate its pre-seeded artifact/confidant handoff.

### Step 7: seed artifacts

Place all critical artifacts before play, whether visible or latent:

- Columnist notebook corner and Celia carbon;
- Surgeon treatment note, dressing, oil vial, broken seal;
- Curator crate sample, propagation key, onion-skin strip;
- Magician coat fiber, Mercy Box reset pin, contract/cue strip;
- Correspondent unfinished draft, map, fact-only source transcription;
- Accountant ledger margin, audit carbon, inventory, machine-oil notation;
- Vocalist scarf, request card, key impression, marked score;
- Antiquarian cabinet sample, catalog card, hinge invoice;
- Chauffeur route envelope, motor tins, tailor patch;
- Debutante slipper, score sheet, atomizer, sewn ledger pages.

Artifacts can be held by their owner initially, but their fallback locations are determined at assembly and cannot materialize only after a death.

### Step 8: build route graph

Instantiate:

- thirty personal evidence threads;
- ten informational/private-need threads;
- four circuits;
- murder-opportunity thread;
- killer-deception thread;
- Blue Case disposition thread;
- relevant personal-ending storylets;
- at least two available counter-traps.

### Step 9: run reachability validation

Reject and reroll any assembly that fails section 10. The player should never enter an invalid seed.

## 4. Act structure

Acts are state bands, not rigid clock chapters. Clock, discovered bodies, circuit progress, and threat level all contribute.

### Act 0 — The loaded house, before discovery

Used for setup scenes or future variants in which play begins before the opening discovery.

- No death language.
- Hooks concern unease, disturbed objects, arguments, weather, payments, routes, and the 12:10 plan.
- NPC knowledge is limited to personal observations and attributed rumors.

Current opening-crime mode may transition through Act 0 off-screen, but authored roots must remain safe because the same content can be reused.

### Act I — Association

Begins when the opening body is publicly known.

- Player learns personal masks and legitimate reasons for traces.
- Personal evidence threads open through observable hooks.
- The 12:10 exchange occurs, fails, or becomes visibly contested.
- At least one route into each circuit is available.
- Choices establish trust/pressure style.

Act I should produce breadth, not a culprit reveal.

### Act II — Contradiction

Triggered by any two of: two personal reveals, one completed circuit bridge, a later death, or clock threshold.

- Cover claims can be checked.
- Cross-NPC events fire.
- External corroboration can reopen shut threads.
- The gardenia, false limp, song/knocks, and altered zero are shown as engineered ambiguity.
- Personal secrets become separable from murder facts.

### Act III — Convergence

Triggered when the player has at least one material fact, one opportunity fact, and one deception/motive lead, even if they concern multiple suspects.

- Circuit synthesis storylets summarize only collected facts.
- Counter-traps become executable.
- NPC personal endings begin to lock based on choices.
- The Blue Case can be located or its distributed contents reconstructed.

### Act IV — Reckoning

Begins with accusation, trap, final attack, or the last dawn band.

- Evaluate proof triad.
- Resolve correct/wrong/insufficient suspicion.
- Resolve prevented attack if applicable.
- Evaluate publish/seal/destroy.
- Roll up personal and cross-NPC consequences.

No Act IV reveal may retroactively supply a missing proof leg unless it is the observable result of a player-prepared trap.

## 5. Storylet and thread specification

Writers should author storylets in a common shape even if implementation types differ.

### Required storylet fields

- `id`: globally stable semantic ID.
- `owner`: archetype or `global`.
- `threadId`: exact subject.
- `actMin` / `actMax`.
- `requiresAll`, `requiresAny`, `forbids`.
- `knowledgeBasis`: fact IDs the speaker personally knows.
- `hook`: player-facing root that can be asked from currently visible information.
- `responseVariants`: innocent, killer-safe, pressured, trusted, and post-corroboration where needed.
- `choices`: label, intent, effects, next candidates.
- `emitsFacts`.
- `fallbackCarrierIds`.
- `deathSafe`: whether already seeded content can run after owner death.
- `notes`: writer-only intent and anti-spoiler constraints.

### Thread status

Use more expressive state than “active/resolved/exhausted”:

- `latent` — no fair hook yet;
- `open` — hook is available;
- `active` — player entered the subject;
- `paused` — NPC refuses or required corroboration is absent;
- `rerouted` — primary speaker unavailable; fallback active;
- `resolved` — concrete association/fact established;
- `closed-personal` — the person will not discuss it further, but fallback may remain;
- `spent` — all available content consumed.

`closed-personal` is never equivalent to “fact permanently impossible.”

### Personal evidence thread template

1. Notice something concrete already present: cuff odor, torn seam, missing margin, broken compact.
2. Offer at least one rapport, analytic, and forceful intent.
3. Explain ordinary provenance without absolving or accusing.
4. Invite a test: compare samples, fit edges, reconstruct timing, repeat cue, or ask a named witness.
5. Emit the association reveal only after the test or an equivalent externally corroborated route.
6. If closed, emit a fallback activation event, not the reveal itself.

### Informational/private-need thread

Each archetype also owns one thread about their need and secret. This thread controls alliance and personal endings. It may provide motive context or circuit facts but never substitutes for all three evidence threads.

## 6. Choice intent taxonomy

Every choice has one primary intent and optional secondary intent. Labels should express what the player is doing, not hide it behind tone trivia.

### Rapport

Protect dignity, source, patient, worker, collection, or authorship. Usually raises trust, lowers pressure, and unlocks voluntary testimony. Cost: may delay names or public exposure.

### Analyze

Ask for comparison, chronology, mechanism, route, or chain of custody. Usually yields the cleanest testable fact with modest emotional impact.

### Challenge

Present a contradiction or separate two claims. Raises pressure and can expose deception. If unsupported, lowers trust; if corroborated, may earn respect.

### Pressure

Threaten consequence, demand surrender, or force a name. Can obtain an artifact quickly while damaging witness quality, relationships, and endings.

### Bargain

Trade discretion, protection, credit, custody, or limited immunity. Produces explicit obligations and may alter publish/seal/destroy options.

### Protect

Choose a vulnerable person or living collection over maximal proof. Must preserve a narrower proof route while changing epilogue consequences.

### Expose

Put a fact or secret on record. Improves public-proof strength but may burn confidants or close cooperative routes.

### Conceal

Seal, return, or destroy sensitive material. Reduces scandal proof and leverage; must not erase the murder proof triad if the case was still winnable.

### Test

Set a controlled reconstruction, bait, marked-page trap, coded-song sting, or Bentley watch. Consumes time and can turn deception into observed opportunity.

### Withdraw

End the subject without escalation. Preserves relationship state and allows later reopening; should not silently count as failure.

### Choice effect requirements

Every substantive choice should affect at least two of:

- trust;
- pressure;
- local flags/facts;
- cross-NPC event queue;
- artifact custody;
- route availability;
- personal-ending score;
- case-ending/publication score;
- time or threat.

Avoid cosmetic three-choice menus whose branches reconverge with identical state.

## 7. State model

The following is the minimum narrative state, independent of storage syntax.

### Per character

- alive/dead, discovered/undiscovered;
- trust, pressure, and relationship posture;
- knowledge facts and attributed rumors;
- selected killer/innocent overlay;
- stable cover data if killer;
- thread statuses;
- artifact custody;
- promises and breaches;
- ending flags and ending eligibility.

### Global

- act and clock;
- discovered victims;
- fact ledger with provenance;
- collected scene evidence;
- revealed archetype associations;
- four circuit progress records;
- 12:10 exchange status;
- brass key and Blue Case custody;
- signal state;
- active false trails;
- counter-traps prepared/executed;
- proof-triad score per suspect;
- publish/seal/destroy commitments;
- queued cross-NPC events.

### Trust and pressure

Trust and pressure are independent.

- High trust/low pressure: voluntary nuance, source protection, alliance.
- High trust/high pressure: painful candor, public testimony at personal cost.
- Low trust/high pressure: seized artifacts, brittle admissions, shutdown risk.
- Low trust/low pressure: polite distance and incomplete context.

Do not use one scalar to represent both. A character can respect an incisive challenge while feeling pressured.

### Fact provenance

Each journal fact stores:

- proposition;
- source/carrier;
- time acquired;
- direct, attributed, inferred, or tested status;
- contradiction links;
- suspect support category;
- whether usable after carrier death;
- publication sensitivity.

This prevents rumors from being promoted silently into facts.

## 8. Cross-NPC events

Cross-NPC events make choices visible in the house. They are queued by state changes and run only when knowledge-safe.

Required event families:

- `source_protected` — Columnist/Correspondent/Vocalist cooperation rises; source-exposure routes close.
- `source_burned` — confidant artifacts move to fallback custody; related witnesses harden.
- `worker_respected` — Chauffeur and Celia-derived routes improve; Debutante alliance score rises.
- `worker_dismissed` — Chauffeur shuts down sooner; Debutante pressure tell activates.
- `collection_seized` — Curator loses trust; Antiquarian challenges custody; physical samples remain.
- `authorship_restored` — Magician and Vocalist reconstruction becomes available.
- `medical_record_sealed` — Surgeon testimony narrows; Accountant accepts sealed corroboration.
- `ledger_seized` — Accountant data available; Debutante controls only remaining chain-above-guardian route.
- `publication_threatened` — culprit may attempt artifact recovery; bait plans can be spoiled.
- `false_detail_published` — only a character with direct knowledge may react; reaction becomes deception evidence, not automatic guilt.
- `key_custody_changed` — route storylets update; no speaker knows new custody unless they observed or were told.
- `body_discovered` — public knowledge updates; death-safe fallbacks activate.
- `npc_shutdown` — external corroboration route becomes visible.
- `countertrap_prepared` — raises threat and schedules a response opportunity.

Each event declares recipients and knowledge basis. Never broadcast hidden state to all NPCs.

## 9. Evidence fallback carriers

All thirty personal associations use the detailed primary and fallback objects in the Bible. At the system level, fallback priority is:

1. prior secured transcript or already transferred artifact;
2. pre-seeded duplicate/fragment in a canonical room;
3. named confidant statement already established before death;
4. another circuit owner’s direct observation;
5. expert comparison or room reconstruction.

Fallbacks may be weaker or costlier, but must remain sufficient when combined.

### Death behavior

When an NPC dies:

- freeze their knowledge; do not generate new recollection;
- retain secured transcripts;
- transfer held critical artifacts only according to predeclared death disposition: on person, room cache, confidant cache, or dropped during a known event;
- open death-safe artifact storylets;
- update personal ending to a legacy form if earned;
- rerun reachability before permitting another murder.

### Shutdown behavior

When trust/pressure closes a personal route:

- mark it `closed-personal`;
- identify the exact external corroboration that can reopen it;
- make that corroboration discoverable within the current or next act;
- allow a repaired approach if the player corrects the original harm;
- never reset trust or pretend the rupture did not happen.

### Artifact destruction

Destroy choices remove the original, not history. Before offering destruction, validation confirms a narrower survivor:

- carbon copy;
- edge impression;
- inventory entry;
- comparison residue;
- attributed witness account;
- photographed/catalogued state;
- distributed transcription.

Destruction meaningfully limits public conspiracy exposure and some personal endings.

## 10. Fairness and reachability rules

### Rule A: three-owner ambiguity

Every scene evidence ID always has exactly the three canonical associated archetypes. UI and dialogue may reveal owner names gradually, but writers cannot add a fourth association or make one owner chemically unique without a separate comparison fact.

### Rule B: proof triad

For the actual killer, the graph must contain at least:

- two routes to a material association;
- two routes to opportunity, one of which does not depend on the killer speaking;
- two routes to deception/motive, one of which is testable behavior or document timing.

At least one complete material + opportunity + deception/motive combination must survive any single NPC death, any single shutdown, and any single offered artifact destruction.

### Rule C: no critical single point

No critical fact may depend only on:

- one living NPC;
- one destructible artifact;
- one random rumor;
- one LLM response;
- one optional room visit before an unannounced deadline.

### Rule D: fair hooks

A root question can reference only:

- visible object/behavior;
- journal fact;
- public discovery;
- attributed rumor;
- prior answer.

It cannot presuppose the secret it is meant to reveal.

### Rule E: no guilt by association

Evidence-thread conclusions use “associated,” “consistent with,” “could explain,” or a concrete transfer statement. They do not say “therefore guilty.”

### Rule F: route closure is legible

When a route closes, the player is told the subject is closed and receives or can later discover a concrete alternate lead. Hidden permanent lockouts are prohibited.

### Rule G: external reopening

Corroboration may change a closed speaker’s available response because the conversation is now about a proved contradiction, not a request for trust. Reopening should preserve the prior relationship cost.

### Rule H: dead facts are seeded

A post-death artifact must have existed and had a plausible location before death. Debug output should be able to list its seed location.

### Rule I: pre-discovery guard

Automated validation scans all eligible text before first public discovery for forbidden death language. Generated text receives the same validation. Fallback authored text replaces violations.

### Rule J: stable killer knowledge

Automated validation compares all killer timeline claims to the stored cover. Differences in room, interval, or witness are contradictions only when an authored pressure beat intentionally exposes one; they cannot arise from random answer selection.

### Rule K: murder permission

Before each later murder, simulate removal of the proposed victim and their carried artifacts. Permit the murder only if:

- all thirty personal pair reveals still have reachable primary or fallback threads, unless the dead owner’s reveal is already secured;
- the actual-killer proof triad remains reachable;
- at least one counter-trap or direct accusation path remains;
- the Blue Case disposition remains selectable.

### Rule L: ending honesty

The ending evaluator may award “correct suspicion without proof” but cannot upgrade it to conviction. A trap supplies only what it visibly demonstrates.

## 11. Convergence design

Convergence is progressive and suspect-agnostic.

### Circuit convergence

When three owners in a circuit are resolved, offer a synthesis:

- paper/payments: match altered zero, flower entry, date, and 12:10 notation;
- key/route: reconstruct key custody and west-passage transit;
- performance/false presence: separate scent/sound/applause from actual presence;
- material provenance: compare batches and custody so a common-looking trace gains context.

The fourth owner can improve confidence, protect a source, or unlock a better ending.

### Murder convergence

For each suspect, display or internally score:

- material associations secured;
- opportunity facts supporting or contradicting presence;
- deceptions/motives established;
- unresolved contradictions;
- source quality.

Do not display a magical percentage of guilt. The journal should help the player see missing proof legs.

### Counter-traps

At least two of these must be viable each run:

- play the coded opening chord and watch for answering knocks/early movement;
- leave a false ledger total on marked pages;
- stage the Bentley with a decoy Blue Case;
- reconstruct the Mercy Box and concealed route;
- announce a false envelope detail;
- circulate a false key-custody claim.

Traps require preparation facts, consume time, and can fail through an earlier choice. Failure reroutes to accusation/containment rather than making the case unwinnable.

## 12. Ending evaluation

Evaluate in this order:

1. Was an attack prevented or culprit caught in a prepared trap?
2. Was the accused/suspected character the generated killer?
3. Does the record contain material + opportunity + deception/motive?
4. How many conspiracy circuits are corroborated?
5. What publish/seal/destroy disposition did the player choose or enable?
6. Which NPC promises, ruptures, alliances, and legacy states apply?

Map to the six whole-case outcomes in the Bible. Then apply the independent disposition axis. Finally choose one personal ending per character.

The ending payload should explain why the proof level was awarded, naming the three categories present or missing. It must not reveal unseen canonical facts merely to tell the player the “real story.”

## 13. Dialogue and prompt-engineering contract

Prompt engineers receive structured case facts, not the whole hidden case.

For each response provide:

- archetype voice rules and current tells;
- role-safe overlay instructions;
- only the speaker’s knowledge facts and attributed rumors;
- exact thread/storylet intent;
- permitted reveal fact, if this is a reveal beat;
- stable killer cover, only when speaker is killer;
- known public victims;
- forbidden claims and pre-discovery guard;
- maximum response length and supported emotion.

The model may choose phrasing and emphasis. It may not:

- invent a victim, room, object, relationship, alibi, or evidence association;
- identify the killer;
- change the cover timeline;
- convert rumor to direct observation;
- reveal facts owned only by another character;
- use anachronistic materials;
- bypass a choice or test;
- announce game mechanics or evidence unlocks.

LLM failure uses the authored response for the same storylet. Narrative state never depends on model success.

## 14. Migration map

The current material has four overlapping layers: three story packs, `storyCatalog.ts`, linear `authoredDialogue.ts`, and generated plans. Migrate content, not incompatible schemas.

### Story Pack A: Columnist, Surgeon, Curator

Preserve:

- Columnist’s forced notebook tear, Celia source dilemma, flower-payment calendar, publication bargain;
- Surgeon’s old revised chart, coerced private treatment, sealed-letter dilemma, record-versus-confidentiality choice;
- Curator’s exchanged orchid, disturbed root ball, coded propagation entry, stewardship-versus-seizure dilemma.

Reconcile:

- replace chlorhexidine with carbolic solution/iodine appropriate to the exact treatment;
- replace “quaternary wash” with a period plant wash such as sulphur/boric preparation;
- move all three stories onto the fixed 11:35 quarrel and planned 12:10 exchange;
- treat every evidence unlock as association only;
- add pressure state and cross-NPC effects consistently;
- add the Bible’s killer variants and death/shutdown carriers;
- keep Celia and overseas correspondence as attributed, non-roaming sources.

### Story Pack B: Magician, Correspondent, Accountant

Preserve:

- Magician’s Mercy Box, stolen authorship, torn black coat, duplicate key, public reconstruction;
- Correspondent’s protected source, unfinished blue-black dispatch, third passage latch, stopped limp, deliberate-error bait;
- Accountant’s altered zero, split nib, selectively polished candlestick, adding-machine oil, signed audit and marked-page trap.

Reconcile:

- replace “former assistant is here” with a fixed absent/former assistant whose proof is in contract/cue artifacts, unless a seeded confidant role explicitly supports presence;
- identify June Bell as the Correspondent/Vocalist protected source and limit each speaker to their own contact;
- anchor envelope and route to the Blue Case’s 12:10 exchange;
- prevent the Accountant’s payoff thread from naming a random attendee without assembled shell-company facts;
- add alternate carriers and killer overlays;
- normalize choice effects to trust + pressure + flags + cross-NPC consequences.

### Story Pack C: Antiquarian, Chauffeur, Vocalist, Debutante

Preserve:

- Antiquarian’s false reliquary, modern hinge, missing catalog card, resin/polish/dust provenance, west panel;
- Chauffeur’s warm Bentley, gardenia envelope, route note, false limp, class-conscious witness bargain and car trap;
- Vocalist’s nonexistent third verse, coded rests/two knocks, searched music case, gardenia frame, key impression, musical sting;
- Debutante’s deliberate card losses, guardian fraud, hidden copies, witnessed brass key, searched vanity, equal-partner demand.

Reconcile:

- Lady Vale remains a fixed off-stage patron reference, not a guaranteed randomized guest;
- June Bell is a protected confidant, not automatically another roaming archetype;
- “blue case” always means the canonical dispatch case;
- all 12:10, west-passage, key, scent, gait, and signal details use fixed canon;
- add fourth personal endings where the Bible specifies them;
- add killer variants and external recovery for every shutdown.

### `authoredDialogue.ts`

Current strengths:

- exhaustive ten-archetype coverage;
- exactly three evidence routes plus one information route per archetype;
- concrete two-stage advance/stall/close cadence;
- pre-discovery language validation;
- concise archetype voice.

Migration:

- retain route IDs as aliases where practical for save compatibility;
- convert each evidence route into notice/context/test/resolution storylets;
- map `advance` primarily to Analyze/Rapport/Test depending on wording;
- map `stall` to Challenge or Withdraw, not automatic failure;
- map `close` to Pressure/Withdraw and `closed-personal`, with fallback activation;
- replace generic ordinary explanations with the richer Blue Case-connected provenance in the Bible;
- keep all thirty evidence IDs exactly unchanged;
- add structured trust, pressure, facts, artifact custody, and cross-NPC effects;
- separate pre- and post-discovery variants rather than relying only on a word blacklist.

### `storyCatalog.ts`

Current strengths:

- adapts three pack schemas to one runtime;
- tracks trust, pressure, flags, evidence, used choices, and endings.

Migration:

- replace pack-specific adapters with one canonical storylet evaluator;
- replace raw string flags with documented semantic fact/event IDs;
- distinguish `closed-personal`, `rerouted`, and `resolved`;
- retain used-choice tracking but allow explicit post-corroboration re-entry;
- evaluate evidence unlocks through emitted concrete facts and tests;
- expose cross-NPC event queue and artifact custody;
- validate a visible choice before rendering it so no selected choice can dead-end.

### Generated conversation plans

Preserve:

- complete-plan generation before questions appear;
- strict evidence-ID assignment;
- authored per-route fallback;
- pre-discovery validation and source labeling.

Reconcile:

- generated plans should realize selected storylets, not author free-standing mystery routes;
- provide the dossier voice/tells and current state;
- provide only allowed knowledge;
- validate period vocabulary and stable killer cover;
- never let generated text create or remove reachability;
- keep authored fallback at storylet granularity so one bad response does not discard valid work.

### Legacy simulation dialogue

Generic timeline, suspicion, alibi, and rumor answers may remain ambient only after:

- killer timeline responses are bound to the stable cover;
- innocent timeline responses are based on sampled history rather than random room fallback when presented as fact;
- rumors retain attribution and reliability;
- no generic line contradicts a dossier fact or public discovery;
- suspicion lines do not count as proof.

## 15. Authoring acceptance checks

Before a narrative data change ships, automated or writer review must confirm:

- all ten dossiers still have mask, need, secret, vulnerability, relationships, overlays, voice/tells, and 3–5 endings;
- all thirty archetype/evidence pairs have primary reveal and alternate carrier;
- all evidence IDs and three-owner memberships match `data.ts`;
- no pre-discovery eligible line contains death knowledge;
- no period vocabulary is anachronistic;
- killer cover claims are stable;
- each critical fact has two carriers;
- each offered destructive choice leaves a narrower route;
- each shutdown names a reopen/reroute;
- every seed survives single-NPC removal in reachability simulation;
- all six case outcomes and three dispositions remain evaluable;
- no generated-text failure can alter truth, proof, or reachability.
