Original prompt: the music for this game is currently horrible and very hard to listen to, please work it to be something that players will want to continue listening to as they play

Room small-item cleanup follow-up (current prompt): remove all small room objects while retaining the main furniture so sprite props can replace them later.
- Removed procedural books, papers, desk accessories, dishes, candles, plants, sculptures, cookware, knives, cosmetics, and other small decorative geometry from all nine rooms.
- Retained the major furniture and fixtures: tables, chairs, shelves, beds, counters/appliances, piano, pedestals, benches, greenhouse structure/planter, chandelier, barrels, crates, wardrobes, vanity, mirror, ladder, and sideboards.
- Shelving now renders empty, ready for future sprite dressing. Removed the unused small-prop rendering helpers and material cache.
- Production build and focused world ESLint pass. The mandated live browser client traversed Dining Hall to Library; both cleaned rooms were visually inspected in `output/room-small-item-cleanup/`, retained furniture remains readable, movement/room transition works, and no browser error artifact was produced.

Pre-murder interview questions follow-up (current prompt): when no body has been discovered, interviews offer a distinct, less accusatory set of four questions about the evening, unease, social contact, and the current room. Once a victim is known, the existing investigative question pool returns.
- Verification: production build and focused ESLint pass. The mandated web-game client started a case without browser errors. Targeted captures in `output/pre-murder-questions-targeted/` verify all four pre-murder questions fit the dialog and that a discovered victim restores the investigative pool; both screenshots were visually inspected and metadata reports zero console/page errors.

Progressive interview questions follow-up (current prompt): interviews now advance through victim-count stages. The first known death adds victim/last-seen questions; the second adds connections; the third adds patterns and beneficiaries; four or more deaths replace the menu with selection, motive, survival, and next-target questions.
- Added built-in contextual answers and journal leads for last-seen, connection, motive, survival, and next-victim topics. LLM interviews now receive the exact on-screen question wording as well as full victim context.
- Verification: production build, focused ESLint, and the full-night simulation pass. The mandated browser client ran without errors. Targeted UI/answer coverage for one through four discovered victims is in `output/progressive-questions-targeted/`; all four screenshots were visually inspected, every menu fits cleanly, every new topic returns a matching answer, and metadata reports zero console/page errors.
- Built-in AI hardening follow-up: expanded the simulation regression suite to exercise all five progressive topics across every archetype, both last-seen/contact branches and their leads, and the single-survivor endgame where no other guest can be selected. Live built-in UI coverage asked all four late-game questions and verified contextual answers plus thoughtful, suspicious, worried, and surprised portrait states. Build, focused ESLint, simulation, and the mandated client pass; inspected artifacts are in `output/builtin-progressive-ai-targeted/` with zero browser errors.

Conversation emotion-tag follow-up (current prompt): LLM interview answers should select the conversation portrait expression with a trailing emotion tag that is removed before display.
- Built-in AI emotion follow-up: offline answers now select from the same six authored expressions using topic, killer status, alibi strength, archetype temperament, and repeated-question count. Suspicion/motive becomes suspicious, death/danger becomes worried, recall/pattern questions become thoughtful, next-victim questions become surprised, and repeated probing escalates from guarded to angry. LLM failure fallbacks use the same built-in selector.
- Built-in emotion verification: production build and focused ESLint pass. The mandated client completed in `output/builtin-emotions-runtime/`. A targeted offline-only interview with the chauffeur exercised all six states in one sequence—neutral, thoughtful, suspicious, worried, surprised, then angry after repeating a guarded topic. Metadata reports `director: builtin`, all six unique emotions, and zero browser errors; the final angry portrait screenshot was visually inspected in `output/builtin-emotions-targeted/`.
- Expression audit follow-up: visually reviewed the authored atlas slots and corrected the shared vocabulary to neutral, suspicious, worried, angry, thoughtful, and surprised. The former `happy` label was inaccurate for the visibly shocked/surprised sixth frame.
- Added archetype-specific reaction guidance for all ten NPCs plus explicit expression-selection rules. Interview prompts now include total prior questions and repeated-topic count, direct pressure/repetition toward anger or suspicion, and tell the model not to default to neutral when a more specific reaction fits.
- Expression-rule verification: production build and focused ESLint pass. The mandated runtime client completed in `output/conversation-expression-rules-runtime/`. A targeted mocked-LLM sequence asked the same pressure question twice; the second request contained the prior answer, `1` prior question, `1` prior use of the topic, all six choices, and the correspondent-specific anger rule. Its `[angry]` response rendered the angry atlas portrait with the tag removed and zero browser errors; screenshot and metadata were visually inspected in `output/conversation-expression-rules-targeted/`.
- Added a six-state conversation emotion protocol matching the six authored portrait frames: neutral, happy, suspicious, worried, angry, and thoughtful. Interview prompts require exactly one trailing tag, and the response parser strips it before answers or transcripts are stored.
- Interview state now carries the parsed emotion directly to the atlas portrait; thinking remains thoughtful, initial/built-in responses safely default to neutral, and missing/unknown tags also fall back to neutral.
- Verification: production build and focused ESLint pass. The mandated web-game client completed in `output/conversation-emotion-runtime/`. A targeted browser check parsed an `[angry]` response, rendered the angry atlas frame, confirmed the tag was absent from visible text, and reported zero browser errors; inspected artifacts are in `output/conversation-emotion-targeted/`.
- Parenthesized-tag compatibility follow-up: the parser now accepts either `[angry]` or `(angry)` for all six supported emotions, while leaving unrelated trailing parentheticals untouched. The prompt still explicitly requests square brackets.
- Parenthesized-tag verification: production build and focused ESLint pass. The mandated client completed in `output/conversation-parenthesis-runtime/`. Targeted live UI coverage confirmed `(angry)` is removed and selects the angry portrait, bracket tags still parse, `(after midnight)` remains dialogue, and no browser errors occur; inspected artifacts are in `output/conversation-parenthesis-targeted/`.
- Emotion-value residue follow-up: expanded suffix parsing to remove the complete control value for labeled forms such as `(emotion: angry)`, `(emotion) angry`, and `Emotion: angry`, plus a bare emotion when it appears alone on the final line. Ordinary prose and unrelated parentheticals remain untouched.
- Prompt-format clarification follow-up: interview requests now define the exact `<spoken dialogue> [emotion]` schema, enumerate the six valid final tokens, provide a valid example, and explicitly forbid parentheses, labels, JSON, Markdown, stage directions, newlines before the tag, and trailing text.
- Prompt-format verification: production build and focused ESLint pass. The mandated live browser client completed in `output/conversation-format-prompt-runtime/`; its gameplay screenshot was visually inspected and no browser error artifact was produced.

NPC atlas expansion (current prompt): generate movement atlases for all ten NPCs, plus face-down deceased poses with mild blood, matching chalk outlines, and multiple dialogue face sprites; integrate every state.
- Standardized each NPC atlas as a 4x5 grid: idle directions, two four-direction walking rows, deceased, chalk outline, and six dialogue expressions.
- Runtime integration now loads `<archetype>-atlas.png`, selects directional idle/walk frames, places deceased art flat on the floor, swaps investigated bodies to the generated chalk frame, and crops mood-varying dialogue faces from the atlas.
- Focused ESLint and TypeScript compilation pass while parallel asset generation is underway.
- Completed all ten final transparent atlases plus retained chroma masters. Every final is content-aware repacked into a strict 4x5 grid of square cells with transparent seams, so no pose is cut or stretched during sampling.
- Final contact sheet `output/npc-atlas-qa-final.png` was visually inspected across every identity's idle, deceased, chalk, and dialogue frames.
- Targeted runtime state verification in `output/npc-atlas-states/` covers a living vocalist, face-down deceased floor pose, generated chalk replacement, and accountant dialogue face; metadata reports zero browser errors. The mandated web-game client also completed at `output/npc-atlas-runtime/` without error artifacts.
- `npm run build`, focused ESLint, and TypeScript compilation pass.

Sprite scale normalization follow-up (current prompt): synchronize character scale across identities/poses and standardize conversation bust framing.
- Mechanically normalized all eleven final atlases without regenerating artwork. Standing, walking, and directional cells now occupy a consistent 86% of cell height with common foot alignment; floor poses/outlines share a common footprint envelope.
- Conversation frames now fill either 84% cell width or 86% height, are horizontally centered, and share the same bottom-aligned bust framing.
- Removed an inherited detached chalk fragment from the magician's neutral dialogue cell. Pre-normalization finals are retained in `output/sprite-scale-before/` for recovery.
- Final atlas QA contact sheet: `output/sprite-scale-normalized-qa.png`. In-game ten-NPC lineup and dialogue capture: `output/sprite-scale-lineup/`; metadata reports zero browser errors. Mandated web-game client also passes in `output/sprite-scale-runtime/`.
- `npm run build` and focused ESLint pass.

Character sway removal follow-up (current prompt): removed the sprite-root Z-axis rocking from both walking and idle animation paths. Directional frame animation, subtle vertical gait motion, and idle breathing remain; every living character now stays laterally upright.
- `npm run build` and focused ESLint pass. The mandated browser run exercised idle, movement, and return-to-idle states; `output/no-character-sway/shot-0.png` was visually inspected and no browser error artifact was produced.
- Residual-sway follow-up: removed all remaining procedural whole-sprite transforms—idle breathing scale, walking compression/stretch, and vertical bob. Authored atlas frame changes and direction mirroring are now the only visible sprite animation.
- `npm run build` and focused ESLint pass. The mandated client exercised left/right travel and idle recovery in `output/no-character-transform/`; the gameplay screenshot was visually inspected, characters remain rigidly upright, and no browser error artifact was produced.
- Detective heading follow-up: removed smooth heading interpolation for the player sprite. The detective now snaps its hidden heading to the requested direction and immediately selects the corresponding atlas frame, preventing slow sideward drift during movement.
- `npm run build` and focused ESLint pass. The mandated client exercised repeated left/right reversals in `output/detective-heading-snap/`; the final gameplay capture was visually inspected and no browser error artifact was produced.
- Detective authored-tilt follow-up: atlas inspection showed the remaining lean is baked into lateral walk cells 9 and 11. Sideways detective travel now holds the upright authored walk cells 5 and 7; front/back walking retains its two-frame gait.
- Final lateral-tilt correction: runtime captures showed even side-walk cells 5 and 7 read as leaning because of their extended-leg stance. Lateral detective movement now uses the fully upright profile cells 1 and 3; front/back movement retains authored gait animation.
- `npm run build` and focused ESLint pass. The mandated client exercised repeated full-width left/right travel in `output/detective-no-side-tilt/`; the final upright profile capture was visually inspected and no browser error artifact was produced.
- Side-gait restoration: lateral movement now alternates correctly paired poses despite the atlas's opposite idle/walk column conventions—right uses frames 3/5 and left uses 1/7. This restores animation while preserving correct facing and avoiding the more strongly leaning second-step frames 9/11.
- `npm run build` and focused ESLint pass. Mandated runtime capture is in `output/detective-side-gait-restored/`. Targeted frame sampling in `output/detective-side-gait-frames/` confirms left cycles through 1/7 and right through 3/5; both screenshots were visually inspected for correct facing and metadata reports zero browser errors.

NPC facing-state follow-up (current prompt): idle NPCs now default to atlas frame 0 (forward), travel continues to use movement direction, and any conversation-facing command overrides the idle default. Interview guests therefore always select the direction toward the player while the detective faces the guest.
- Added robust side-profile mirroring because several generated atlases contain same-facing art in both nominal profile columns. Conversation and travel now use one canonical side frame and mirror it toward the actual target.
- `npm run build` and focused ESLint pass. Mandated runtime capture is in `output/npc-facing-final/`. Targeted left/right interview verification in `output/npc-facing-player-final/` confirms frame 1 with flip `1` for a player on the left and `-1` for a player on the right; screenshots were visually inspected and metadata reports zero browser errors.
- Side-approach correction: inverted the canonical profile's screen-space flip after gameplay feedback showed the previous mapping made NPCs look away from left/right approaches.
- `npm run build` and focused ESLint pass. Mandated runtime capture is in `output/npc-side-facing-fix/`. Targeted interview captures in `output/npc-side-facing-final/` visually confirm the magician faces the detective from both sides; metadata records flip `-1` for a left-side approach and `1` for a right-side approach with zero browser errors.
- Per-archetype facing correction: canonical atlas profile orientation is inconsistent—accountant and antiquarian face right in frame 1, while the other eight archetypes face left. Replaced the global flip assumption with identity-aware mirroring toward the target.
- `npm run build` and focused ESLint pass. Mandated runtime capture is in `output/npc-profile-aware-facing/`. Targeted all-archetype verification in `output/npc-profile-facing-all/meta.json` confirms each NPC uses the correct identity-specific flip for targets on both sides, with zero browser errors. Canonical profile reference was visually inspected in `output/npc-canonical-profiles.png`.
- Accountant-specific correction: gameplay confirmed the accountant's canonical frame 1 faces left, not right. Antiquarian is now the sole right-facing canonical profile; accountant uses the same left-facing rule as the other eight archetypes.
- `npm run build` and focused ESLint pass. Mandated capture is in `output/accountant-facing-runtime/`; focused accountant assertions in `output/accountant-facing-final/meta.json` confirm frame 1/flip `1` for a player on the left and frame 1/flip `-1` for a player on the right, with zero browser errors.

Detective sprite follow-up (current prompt): create a detective sprite matching the existing NPC art, with directional, walking, turning, and investigating poses, then replace the geometric player model.
- Generated a consistent 16-pose 4x4 detective atlas against the existing ten NPC portraits, removed the chroma key to alpha, and saved the project assets under `public/assets/characters/`.
- Replaced the visible detective geometry with an atlas-driven 2.5D cutout. Runtime frame selection now covers four idle directions, two four-direction walk cycles, two turning poses, and two investigating poses.
- `npm run build` and focused ESLint pass. The mandated browser client started a live case and exercised movement/turning with deterministic steps; `output/detective-sprite-runtime-2/` was visually inspected. The new detective matches the NPC cutout scale and painted style, changes pose with heading/gait, remains grounded, and produced no console/page error artifact.
- Direction correction follow-up: the camera views the world from +Z while the model's zero heading points toward -Z, so the atlas lookup was half a turn out. Added the required 180-degree offset: north uses the back pose, south the front pose, east the right-looking silhouette, and west the left-looking silhouette.
- Direction verification: focused ESLint passes. Four isolated mandated browser runs were visually inspected in `output/detective-direction-up/`, `-down/`, `-left/`, and `-right/`; each final pose faces its actual travel direction and no browser error artifact was produced. Full build is currently blocked by unrelated existing unused declarations in `src/game/audio.ts` (`EIGHTH_MS`, `buildSoftDelay`, and `playCompositionStep`).

Murderer aggression follow-up: user reported that the murderer was not eliminating NPCs and asked for fast pursuit subject to no detective and no more than one witness.
- Root cause: legal kills still required a low-probability roll on infrequent idle ticks, hunting only happened 40% of the time, and cooldowns lasted 55-80 game minutes.
- Changed legal opportunities to deterministic kills, added an arrival-time opportunity check, made low-occupancy prey hunting the killer's default decision, and shortened repeat cooldowns to 20-30 game minutes. Legal rooms contain the victim plus at most one additional witness, with the detective elsewhere.
- Fixed movement recovery so repeated sideways shuffling actually triggers a detour; this was trapping the killer at a doorway even after the hunting logic selected a target.
- Verification: focused ESLint and production build pass. Deterministic rule assertions cover legal kills, detective presence, and excessive witnesses. The full-night simulation now produces 7 deaths for the fixed smoke-test seed (previously 0). The mandated browser client started a live case without errors; `output/web-game/shot-0.png` and matching state were inspected.
- Cooldown pacing follow-up: increased the repeat-murder cooldown from 20-30 to a randomized 30-45 game minutes and added a focused range assertion.

NPC traffic-jam follow-up (current prompt): stuck NPCs should find a new direction and resume traveling.
- Added per-NPC blocked/progress tracking and randomized, alternating recovery detours. After 0.65 seconds without meaningful progress toward its waypoint (including fruitless sideways shuffling), a guest temporarily sidesteps/backtracks into nearby open space and then resumes the original waypoint path.
- If no nearby recovery direction is open, the congested route is abandoned and the NPC immediately makes a fresh movement decision instead of remaining permanently stuck.
- Verification: `npm run build` and focused ESLint pass. The mandated web-game client advanced a live case through NPC decision/movement time with no browser error artifact; inspected capture and state are in `output/npc-stuck-recovery-final/`.

Current evidence follow-up: investigating a dead body should yield one deterministic, archetype-based clue; every archetype needs three possible clues and every clue must overlap multiple archetypes.
- Added ten semantic evidence types. Each clue is shared by exactly three archetypes, and each of the ten archetypes has exactly three possible traces.
- Murder scenes select from the killer archetype's fixed three-clue sequence; bodies can be examined once at close range with E, adding an Evidence lead that names three possible profession sources.
- Body investigation takes interaction priority over interviewing a nearby living guest.
- Verification: build, focused ESLint, simulation evidence assertions, mandated web-game client, and targeted browser investigation all pass. `output/evidence-investigation/journal.png` was visually inspected; metadata confirms the clue included the actual killer archetype among three candidates and no browser errors occurred.
- Chalk-outline follow-up: after evidence is collected, the victim model is hidden and replaced in place by a persistent floor-level chalk silhouette; text-state output distinguishes bodies from investigated chalk outlines.
- Chalk-outline verification: production build, focused ESLint, simulation smoke test, mandated browser client, and a targeted before/after investigation pass all succeed. `output/chalk-outline-final/after.png` was visually inspected and clearly shows the detective beside the replacement outline; metadata reports `appearance: "chalk outline"` with no browser errors.

Current collision follow-up: characters should not pass through one another or major room objects.
- Added shared collision footprints for major furniture, actor-radius movement checks for the detective and NPCs, collision-aware NPC steering, and valid spawn/destination sampling.
- Verification: `npm run build` and focused ESLint pass. The mandated browser client confirmed the detective stops at the expanded dining-table footprint and newly spawned NPCs remain on open floor; inspected artifact: `output/collision-verification-final/shot-0.png`. No browser error artifact was produced.

Current follow-up prompt: the character models should change which direction they are facing based on movement or conversation

Name/gender constraint follow-up: user requested that randomized guest names match the gender conveyed by each established character sprite.
- Classified columnist, curator, vocalist, and debutante as female; surgeon, magician, correspondent, accountant, antiquarian, and chauffeur as male based on the supplied sprites.
- Split randomized names into gendered pools and assign from the matching pool after archetypes are shuffled.
- Verification: `npm run build`, focused ESLint, and `sim-test.ts` pass. The mandated browser client started a live randomized case with no browser errors; its screenshot/state are in `output/name-gender-verify/` and were visually inspected.
- Expanded the randomized roster from 5 female/6 male names to 40 names in each pool, preserving the sprite-gender constraint while greatly increasing case-to-case variety.
- Verification for expanded pools: confirmed all 80 names are unique, `npm run build` and focused ESLint pass, and the mandated live browser check was visually inspected in `output/name-pool-expanded/` with no console/page error artifacts.

Character facing follow-up:
- Added persistent, smoothly interpolated actor headings. Movement now turns each model toward its actual x/z travel direction instead of the walk animation overwriting Y rotation with sway.
- NPCs in simulated conversations face their talk partners; during interviews the detective and guest turn toward one another.
- Kept walk motion as a subtle body-only sway so it no longer destroys the actor heading.
- Verification: `npm run build` and focused ESLint pass. The mandated web-game client ran without browser errors and its inspected gameplay capture is in `output/character-facing-movement/`. A targeted browser check confirmed opposite headings for north/south movement and opposing player/guest headings during an interview; the inspected interview capture is `output/character-facing-movement/interview.png`.

Notes:
- Found the soundtrack in `src/game/audio.ts`; it is procedural WebAudio with no external assets.
- Current likely fatigue sources: bright rain noise, loud static pad, sharp square tick, and sawtooth dissonant stingers.

TODO:
- Replaced the soundtrack mix with a softer, longer-form procedural noir bed: rain, warm pad, slow bass pulse, sparse melody, softer thunder/tick/stingers.
- Added `window.render_game_to_text` so browser verification can record concise gameplay state.
- `npm run build` passes after the audio changes.
- Web-game Playwright verification passes after installing Playwright for the verifier; artifacts are in `output/music-verify/`.
- `npm run lint` still fails on pre-existing UI component template issues outside this task (`react-refresh/only-export-components` and `react-hooks/purity` in shared `src/components/ui/*` files).

TODO:
- Listen in a real browser with speakers/headphones and fine-tune musical taste if desired; automated checks can prove runtime health, but not taste.
- Follow-up audio request: user still heard an unpleasant siren-like quality and asked for more structured, intriguing music that supports deep thought and mystery.
- Replaced the continuous gliding pad approach in `src/game/audio.ts` with a structured 66 BPM procedural score: repeating chord progression, bass clue, chord shadow, sparse mallet arpeggios, and short question/answer phrases.
- `npm run build` and `npx eslint src/game/audio.ts` pass after the structured score change.
- Web-game Playwright verification passes with artifacts in `output/music-verify-structured/`; no console/page error files were produced.

Camera transition note (current prompt): user reported the camera angle swing on room entry felt jarring and did not read as a clean space-to-space transition.
- Updated `src/game/world.ts` so camera look-at eases toward its desired focus instead of snapping immediately.
- Added doorway/passages focus weighting via `trackPlayer`, so the camera follows the player near thresholds and settles back to the room center once inside.
- Added `window.render_game_to_text` debug output in `src/game/game.ts` for automated verification.
- Verification: `npm run build` passes. Production-build Playwright check against `http://127.0.0.1:8000` crossed from Dining Hall into Ballroom with no console errors; final state in `output/camera-transition-door-2/state-0.json` showed player in Ballroom and camera focus biased smoothly between the entry-side player and room center.

Room readability note (current prompt): user reported muddy room details, too many indoor particles, and walls/furniture visually conflicting with doorways.
- Increased the Three.js render-target resolution from 0.32 to 0.58 and reduced scene fog.
- Reduced indoor dust from 90 bright motes to 22 subtle motes.
- Reduced rain count/opacity/size and sampled rain outside covered room/passage areas so it no longer falls through interiors.
- Added subtle box edge outlines to floors, walls, passages, thresholds, and furniture to improve silhouettes.
- Fixed wall segment math so doorway-side walls run from room corners to the door gap, then added threshold strips so openings read intentionally.
- Lowered wall height from 2.7 to 1.85 to reduce top-down doorway occlusion.
- Split library shelves away from north/east/west doorway bands so shelves no longer visually sit over openings.
- Softened the app-level vignette and scanline overlay.
- Added `window.advanceTime` and `window.murderMansionGame` alongside the existing `window.render_game_to_text` hook.
- Verification: `npm run build` passes. Web-game checker completed against `http://127.0.0.1:3001/`; inspected `output/visual-rooms-2/shot-0.png`, `output/visual-east-door/shot-0.png`, `output/visual-north-door/shot-0.png`, and `output/visual-east-transition/shot-0.png`. Latest targeted runs produced no error logs.
- Follow-up suggestion: horizontal doors are centered at z=0 while the Dining Hall start is z=2, so holding right from the start correctly hits a wall. If players keep trying that, add a stronger floor/path cue toward the east/west doorway centerline.

Journal portrait note (current prompt): user asked for each guest NPC journal entry to use the corresponding character from `character-sprite-reference-alpha.png`.
- Cropped the ten guest archetypes into transparent PNG assets under `public/assets/characters/`.
- Added archetype IDs to guest snapshots so randomized guest assignments always resolve to the correct portrait.
- Updated guest cards and interview transcript rows to render the matching portrait, with a subdued treatment for deceased guests.
- Made the journal header and guest-card grid responsive so portraits remain readable on narrow screens.
- Verification: `npm run build` and focused ESLint checks pass. Web-game runtime verification and desktop/mobile journal screenshots pass with all ten unique portraits loaded and no browser errors; artifacts are in `output/journal-portraits-runtime/` and `output/journal-portraits-ui-final-2/`.

Room rework note (current prompt): user asked for a designer subagent to create distinct, readable concepts for all nine rooms, followed by a developer subagent implementing the approved handoff.
- Current room set: Study, Gallery, Conservatory, Kitchen, Dining Hall, Ballroom, Cellar, Library, and Master Suite.
- Workflow underway: inventory/current screenshot review -> designer room-by-room concept and shared visual language -> developer implementation -> build and Playwright visual verification.
- Developer pass: added cached shared materials plus reusable inlay/rug/table/chair/shelf/frame/candle/plant/barrel primitives in `src/game/world.ts`; implemented nine distinct floor languages and room-specific landmark/prop/mystery compositions. Furniture remains visual-only and `isWalkable` is unchanged.
- Room rework verification: `npm run build` passes. The mandated web-game client successfully captured `output/web-game/` (Dining Hall) and `output/room-rework-gallery/` (north transition into Gallery); both screenshots were opened and inspected. Dining's herringbone/rug/table/candle composition reads cleanly with visible north/south space and distinct adjacent Kitchen checker/Ballroom medallion floors. Gallery's central portrait, unequal sculptures, runner, bench, and door lanes read clearly; state confirms the player transitioned into Gallery and no console/page error artifact was produced. Longer chained traversals were too slow for the verifier's execution window, so lower-row rooms were reviewed through the central neighboring-room framing and build/runtime health rather than a completed chained artifact.
- Room rework follow-up suggestion: if a future pass needs isolated close-ups of every room, add a debug-only room teleport/query hook or run one short doorway transition per capture; the mandated client's per-frame choreography is slow for two consecutive 13-unit crossings.
- Kitchen floor artifact follow-up: the original dense one-unit checker grid aliased into bands at the low-resolution pixel pass, and its two route-strip meshes were coplanar with the tiles/each other. Replaced it with broader, lower-contrast quarry tiles and raised non-overlapping route-strip pieces. `npm run build` passes; the mandated client traversed Dining Hall -> Kitchen and produced `output/kitchen-floor-fix-direct/`. The screenshot was inspected at full resolution, state confirms the Kitchen, and no console/page error artifact was produced.
- Shared floor-lighting artifact follow-up: remaining circular effects in Kitchen, Study, and Conservatory were point-light falloff gradients quantizing through the low-resolution nearest-neighbor render target. Added ACES filmic output and softened practical-light falloff, then made room floor surfaces/inlays use cached flat materials so dynamic lighting cannot paint rings across them; walls, furniture, actors, and bulbs remain dynamically lit. `npm run build` passes. Mandated client traversals and inspected screenshots cover all affected rooms in `output/floor-flat-fix-kitchen/`, `output/floor-flat-fix-study/`, and `output/floor-flat-fix-conservatory/`; state confirms each destination and none produced error artifacts.

Character model note: user asked for the in-world character models to clearly match their corresponding journal sprites.
- Reworked all ten guest models around their archetype IDs instead of giving every guest the same body and hat with a randomized color.
- Added portrait-matched palettes, silhouettes, hair/headwear, and signature props: columnist hat/feather, surgeon coat, curator garden hat/apron, magician top hat/cape, correspondent camera/satchel, accountant glasses/ledger, antiquarian beard/magnifier, chauffeur peaked cap/brass buttons, debutante gown/tiara, and vocalist gown/hair/flower/microphone.
- Kept the detective model and generic fallback intact.
- `npm run build` and focused ESLint checks pass.
- Automated all-character lineup and journal comparison artifacts are in `output/character-models-final/`; all ten models rendered and no console/page errors were recorded.

Dialog portrait follow-up (current prompt): user asked for guest sprite portraits to appear in the interview dialog card too.
- Extracted the archetype portrait mapping and renderer into a shared `GuestPortrait` component used by journal cards, transcript rows, and the interview dialog.
- Reworked the dialog header so a larger portrait sits beside the guest identity and current response without increasing the card's overall height.
- Verification: `npm run build`, focused ESLint, and the web-game client pass. Desktop/mobile dialog screenshots and a live question/answer interaction are in `output/dialog-portrait-ui/`; all ten archetype mappings load correctly with no browser errors.

Full character-model redesign (current prompt): designer handoff is in `CHARACTER_MODEL_DESIGN.md` and covers ten portrait-matched guests plus the detective.
- Replaced the shared box-body actor construction with layered model assemblies, reusable limb/prop pivots, separated legs/shoes/arms/hands, tapered skirts/coats, portrait palettes, distinct headwear/hair, and oversized signature props for all ten archetypes.
- Rebuilt the detective with a split belted trench silhouette, shirt/tie/lapels, badge, pinched medium-brim fedora, notebook, and flashlight.
- Added restrained opposing limb walk motion and archetype-sensitive idle prop/head gestures while preserving actor positions, visibility, labels, death state, and gameplay simulation APIs.
- Verification: `npm run build` and `npx eslint src/game/world.ts` pass. The mandated web-game client started a live case at `http://127.0.0.1:3004`, advanced deterministic frames, and captured `output/character-redesign/shot-0.png` plus matching `state-0.json`; the screenshot was opened and inspected. The detective and nearby guest render stably in the Dining Hall with labels and props attached, and no console/page error artifact was produced. There is no existing all-character lineup/debug teleport, so this focused runtime capture covers the normal gameplay camera rather than all eleven models simultaneously.

LLM provider presets (current prompt): user asked to configure a free default option for LLM-driven characters.
- Added Groq Free, Ollama Local, and Custom provider presets. Groq is the recommended/preconfigured hosted choice when LLM mode is selected; built-in minds remain the reliable out-of-box director.
- Groq defaults to `https://api.groq.com/openai/v1` with `llama-3.1-8b-instant`. Ollama defaults to `http://localhost:11434/v1` with `llama3.2`.
- Ollama can now run without a fake API key, and the LLM client omits the Authorization header when no key is present.
- Preserved old saved endpoint configurations by migrating them to the Custom preset.
- Focused ESLint passes for all changed files. Web-game client screenshots were inspected for Groq and Ollama in `output/llm-provider-settings/` and `output/llm-provider-ollama-2/`; no browser error artifacts were produced.
- Full `npm run build` is currently blocked by an unrelated existing `src/game/world.ts` Actor type error (the object at line 665 lacks limb/animation fields). This provider work did not modify that file.

GitHub Pages portrait-path fix (current prompt): character sprites loaded locally but not from the deployed project subpath.
- Root cause: `GuestPortrait.tsx` used root-absolute `/assets/characters/...` URLs, which bypassed the repository subpath on GitHub Pages.
- Updated portrait URLs to prepend Vite's `import.meta.env.BASE_URL`, preserving local development while resolving correctly under the deployed base.
- Verification: `npm run build` passes. The mandated browser client successfully loaded gameplay from the nested `/murder_mansion/dist/` path with no browser error artifact. A targeted journal check loaded all ten sprite images at nonzero natural widths with no console errors; `output/github-pages-sprite-fix-final/journal.png` was visually inspected.

Animated in-world sprite follow-up (current prompt): user found the geometric character models too blocky and asked to turn the actual character sprites into animated models.
- Replaced the visible geometric guest assemblies with the same transparent full-body artwork used by the journal. The underlying actor/gameplay rig remains intact, while the rendered guest is now a depth-tested 2.5D cutout with a floor shadow.
- Added procedural walk bounce, compression, lean, idle breathing/sway, camera-facing billboarding, and movement-heading mirroring. The detective remains the authored 3D player model because no detective sprite asset exists.
- Death state now desaturates/dims the sprite and preserves the existing fallen pose and chalk-outline workflow.
- `npm run build` and focused ESLint pass. The mandated web-game client completed two runtime scenarios with deterministic frame advancement and no console/page error artifacts. Screenshots and matching state are in `output/animated-sprite-characters/` and `output/animated-sprite-idle-walk/`; both sets were visually inspected. Guests render as crisp, recognizable sprite cutouts with grounded shadows and stable labels at the normal isometric camera scale.
- Follow-up option: a true multi-frame hand/leg animation would require drawing or generating additional per-character frames; the current source sprites contain one pose each, so this pass uses procedural whole-character motion and mirroring.

Lower camera-angle follow-up (current prompt): user liked the sprite actors but found their viewing angle too steep.
- Lowered the camera height from 15.5 to 12.6 world units, moved it farther forward from 8.6 to 10.4, and widened FOV slightly from 46° to 47°. This changes the view from a steep floor-dominant angle to a more character-forward composition while keeping approximately the same room coverage.
- `npm run build` and focused ESLint pass. The mandated browser client verified the normal Dining Hall view and a south-door camera transition; screenshots/state are in `output/lower-camera-sprites/` and `output/lower-camera-transition/`. All captures were visually inspected: sprites read more upright, room coverage remains clear, foreground walls do not obscure the player, labels remain stable, and no browser error artifacts were produced.

Second camera-height follow-up (current prompt): user requested one more subtle downward adjustment.
- Lowered camera height from 12.6 to 11.7 while preserving the 10.4 forward offset and 47° FOV, producing a modestly more upright character view without changing horizontal framing.
- `npm run build` and focused ESLint pass. The mandated client traversed Dining Hall to Library at the new height; `output/lower-camera-final/` was visually inspected. Sprites read more upright in both rooms, the detective and doorways remain visible, foreground walls do not interfere, and no browser error artifacts were produced.

Authored MP3 soundtrack follow-up (current prompt): user added `Midnight in the Static.mp3` at the project root and asked to use it as background music.
- Replaced the procedural musical composition with the authored MP3, bundled through Vite and looped through the existing Web Audio music bus. Procedural rain, thunder, clock tick, and event stingers remain intact.
- Existing master volume and mute controls continue to govern the full mix; autoplay retry remains tied to subsequent user gestures.
- Removed the obsolete procedural score code and slightly lowered the music-bus gain so ambience and gameplay cues remain audible beneath the track.
- Verification: production build and focused ESLint pass. The mandated web-game client started a case and its inspected gameplay capture is in `output/mp3-soundtrack/`. A targeted browser check confirmed one loaded MP3 element, active playback, a 119.96-second duration, looping enabled, advancing play time, working mute UI, and no console/page errors.
- SFX audibility follow-up: the effects were connected but substantially masked by the song, with rain at a near-inaudible gain, thunder delayed 26-68 seconds, and clock ticks occurring only every 60 real-time seconds at normal speed. Lowered the music bed, raised ambience/SFX/rain and individual cue levels, scheduled the first thunder for 4-6.5 seconds, moved clock ticks to each in-game quarter hour, and added brief music ducking for story stingers.
- Re-verification: production build and focused ESLint pass. The mandated client ran seven seconds into a live case; `output/sfx-rebalance/shot-0.png` was visually inspected with no browser errors. Targeted Web Audio instrumentation confirmed looping rain plus thunder buffer sources start, advancing to the quarter-hour starts the clock oscillator, and no console/page errors occur.
- Authored clock follow-up: replaced the synthesized quarter-hour oscillator with the root-level `ticktock.mp3` as a continuous loop at 10% gain on the ambience bus. It starts and retries alongside the soundtrack, follows the existing master volume/mute setting, and is cleaned up with the other audio elements when the game is disposed.
- Clock-loop verification: production build and focused ESLint pass; Vite bundles the 524 KB clock asset. The mandated client started a live case and `output/ticktock-loop/shot-0.png` was visually inspected. A targeted browser check confirmed both the 278.96-second soundtrack and 16.38-second clock file are loaded, actively advancing, loop-enabled, mute-controlled, and produce no console/page errors.
- Game-time clock synchronization follow-up: mapped one second of `ticktock.mp3` to one simulated minute, continuously correcting small phase drift. The clock playback rate now follows the selected 0.5x/1x/2x/4x game speed, pauses when the case is paused or outside gameplay, and re-aligns to simulation time on resume.
- Synchronization verification: production build and focused ESLint pass. The mandated client capture in `output/clock-game-time-sync/` was visually inspected. A targeted browser sequence confirmed clock audio at 1x tracks the fractional game minute, switches to playbackRate 4 at 4x, remains exactly stationary while paused, resumes aligned to the new game minute, and produces no console/page errors.
- Authored body-discovery cue follow-up: replaced the synthesized body stinger with root-level `chord.mp3`, routed at controlled gain through the existing SFX bus. Body discovery now restarts the 1.896-second cue from its beginning and ducks the soundtrack for three seconds; accusation/win/lose cues remain synthesized and unchanged.
- Body-cue verification: production build and focused ESLint pass; Vite bundles the 37 KB cue. The mandated live-case capture in `output/body-discovery-chord/` was visually inspected. A targeted browser test confirmed the cue preloads, is non-looping, advances when `body` fires, restarts near zero on a repeated trigger, creates no legacy oscillator for body discovery, and produces no console/page errors.

Calmer NPC movement follow-up (current prompt): guests felt random and repeatedly darted between rooms.
- Reduced guest walking speed from 2.4 to 1.55 world units/second and lengthened decision/linger intervals.
- Replaced mostly random adjacent-room travel with archetype-specific room preferences, purposeful social seeking, two-room travel memory to prevent immediate backtracking, and a much stronger tendency to stay put when there is no reason to move.
- Guests prioritize people they have not spoken with; repeated conversations are less likely. Murderer hunt/escape behavior remains strategically exempt from ordinary pacing.
- Updated LLM movement instructions to require an explicit character, person, or information-based reason before changing rooms and to avoid aimless back-and-forth travel.
- Verification: production build, focused ESLint, and full-night simulation smoke test pass. The mandated live browser run advanced the case to 12:40 AM with stable idle behavior and no browser errors; `output/calm-npc-movement/shot-1.png` and matching state were inspected.

Single-pass investigation animation follow-up (current prompt): user reported that the detective's body-investigation animation cycles repeatedly.
- Root cause: the two investigation atlas poses were selected with a global-time modulo, deliberately alternating about four to five times during the 1.15-second action.
- Added an action start timestamp and mapped normalized action progress to pose 14 for the first half and pose 15 for the second half. Each investigation now advances through the two authored poses exactly once before returning to directional idle.
- Production build and focused ESLint pass. The mandated web-game client completed a live gameplay run with no browser errors (`output/investigation-once-runtime/`). A targeted deterministic action test sampled the detective atlas through the full 1.15-second sequence and recorded `14,14,14,15,15,15,15,2`: one forward transition from the first investigation pose to the second, then a return to directional idle with the action cleared. Metadata and the visually inspected post-action capture are in `output/investigation-once-sequence/`.

Detective stopped-facing follow-up (current prompt): user reported that releasing left or right makes the detective face the wrong way.
- Root cause: the detective atlas stores horizontal idle profiles in the opposite column order from the horizontal walking profiles. The renderer reused the walking direction column when returning to idle, flipping the visible pose.
- Added a detective-only idle-row mapping that swaps horizontal columns 1 and 3 while leaving walking, vertical idle, turning, NPC, and investigation frames unchanged.
- Production build and focused ESLint pass. The mandated client verified an actual walk-left/release sequence (`output/detective-facing-left/`) with no browser errors. A deterministic two-direction check then forced walk-left/stop and walk-right/stop separately: the detective settles on atlas frame 1 facing screen-left and frame 3 facing screen-right, with both screenshots visually inspected in `output/detective-facing-horizontal/` and no console/page errors.

Character name-tag spacing follow-up (current prompt): labels visually merged into character heads and hats.
- Raised the living-actor label anchor from 1.95 to 2.32 world units, placing the bottom of each name above the 2.2-unit sprite silhouette. Dead-body label positioning remains unchanged.
- Production build and focused ESLint pass. The mandated client completed two live runtime captures in `output/raised-name-tags/`; both were visually inspected. The detective label now has a clean visible gap above the fedora instead of intersecting it, remains comfortably associated with the character, and no browser error artifacts were produced.

Room floor texture follow-up (current prompt): replace buggy procedural floors with room-specific sprite textures and fix feet clipping through the floor.
- Generated a 3x3 source atlas and cropped nine room-specific top-down floor sprites under `public/assets/floors/`.
- Replaced the overlapping procedural floor-language mesh stacks with one textured floor plane per room, eliminating the primary coplanar/z-fighting source.
- Raised standing character sprite planes to their mathematically correct half-height plus clearance so their feet no longer intersect the floor surface.
- Production build and focused world ESLint pass. Mandated web-game captures in `output/floor-textures-dining/` and `output/floor-textures-library/` were visually inspected; they show stable single-surface floors, distinct neighboring room materials, grounded character feet, correct room traversal/state, and no browser error artifacts.
- Cellar crop correction: the initial `sips` offset exports silently retained the entire 1254px atlas for off-center cells. Re-exported all nine room assets with explicit pixel crop rectangles; every consumer texture is now exactly 418x418. Visually inspected `cellar.png` and the cellar floor as rendered in the neighboring-room view in `output/cellar-floor-crop-fix-final/`; it now shows only the intended dark stone tile.

Player/NPC pass-through follow-up (current prompt): user reported that NPC collision can trap the detective.
- Removed living-guest proximity from player movement acceptance. Player movement still checks room boundaries, walls, passages, and furniture through `canOccupy`, while the NPC simulation retains its own guest-to-guest collision avoidance.
- Production build and focused game ESLint pass. The mandated client traversed the Dining Hall doorway normally with no browser errors (`output/player-npc-pass-runtime/`). A forced worst-case test placed an idle NPC directly in the detective's narrow south-door path: the detective advanced from z=2 through the NPC at z=3.5 to z=5.3, while the NPC stayed fixed. A furniture regression check from the same starting point still blocked northward movement at z=2 against the dining table. Metadata and the visually inspected capture are in `output/player-npc-pass-forced/`; no console/page errors occurred.

Conversation layout follow-up (current prompt): move the interview UI to the bottom-right, enlarge it and its character bust, and prevent long answers from resizing the panel.
- Reworked the interview panel into a fixed-height, viewport-capped bottom-right window with an independently scrollable conversation/question region and a pinned action footer.
- Increased the dialogue panel width from 42rem to 48rem and the character bust from 6rem square to 10rem square.
- Production build and focused ESLint pass. The mandated web-game client completed without browser errors, and a targeted live interview capture was visually inspected at `output/conversation-layout-final/interview.png`. Desktop metrics confirm a 768x672 panel anchored 16px from the bottom-right, a 158px rendered bust, active `overflow-y: auto`, and zero console/page errors.

Conversation space follow-up (current prompt): remove the dead area below the selectable questions and give it to the conversation response.
- Made the portrait/header row consume the available panel height and expanded the bordered conversation response area to fill that space; the selectable questions now sit directly beneath it with a tighter gap.
- Kept independent overflow scrolling on the expanded response area for unusually long answers.
- Locked the conversation response box itself to a 25rem height so short, long, and loading answers cannot alter its dimensions.
- Production build and focused ESLint pass. Mandated runtime and targeted interview verification pass; `output/conversation-fixed-height-final/interview.png` was visually inspected and browser metrics confirm the response box remains exactly 400px tall with `overflow-y: auto` and zero console/page errors.
- Halved the fixed response height from 25rem/400px to 12.5rem/200px and reduced the fixed panel height proportionally from 42rem to 29.5rem so the reclaimed space does not become another empty gap.
- Reduced the response box by another 50px to 9.375rem/150px and proportionally reduced the panel height to 26.375rem.

LLM case-memory and response-format follow-up (current prompt): keep character prompts current within a run, reset them for each new case, and normalize inconsistent quote wrapping.
- LLM decision and interview requests now include authoritative current-run memory assembled from that NPC's conversations, learned rumors, discovered victims, and prior detective exchanges. It is derived only from the freshly reset simulation and transcript state, so no memory crosses case boundaries.
- Prompts now specify exact response contracts, including unquoted dialogue. Runtime normalization removes repeated straight, curly, or single quote wrappers (and accidental text fences) before UI/log code adds its one canonical pair of curly quotes.
- Interview parsing also unwraps models that put the required emotion tag inside their outer quotation marks, ensuring both the tag and redundant quotes are removed consistently.
- Verification: production build, focused ESLint, diff checks, and targeted parser assertions pass for plain, quoted, double-wrapped, and tag-inside-wrapper responses. The mandated live-game capture/state in `output/llm-memory-format-runtime/` was inspected and contains no browser error artifact.

Minimap sizing follow-up (current prompt): increase the minimap so its width matches the option row beneath it.
- Made the top-right HUD stack size to the button row and set the square minimap canvas to stretch to that shared width, with a higher 300x300 drawing buffer for crisp rendering at the larger size.
- Production build passed. The mandated web-game client entered live gameplay and the resulting capture was visually inspected at `output/minimap-width-gameplay/shot-0.png`; the minimap and four-button row have matching left/right edges and no browser error artifact is present.
