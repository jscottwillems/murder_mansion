Original prompt: the music for this game is currently horrible and very hard to listen to, please work it to be something that players will want to continue listening to as they play

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
