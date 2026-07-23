# Project architecture

## Runtime flow

`src/App.tsx` creates the game facade and renders the game-specific interface.
`src/game/game.ts` is the composition root: it coordinates simulation, the Three.js
scene, audio, and narrative presentation. UI code observes snapshots through
`src/state/store.ts` and calls the facade rather than reaching into subsystems.

## Game subsystems

- `game.ts` — application facade and browser/game-loop orchestration
- `sim.ts` — authoritative case and guest simulation state
- `world.ts` — Three.js scene facade and mansion rendering
- `audio.ts` — soundtrack, ambience, footsteps, and cue playback
- `data.ts` / `types.ts` — shared domain definitions and static case data
- `dialogue/` — authored interview content
- `narrative/` — case graph, escalation, endings, and narrative state
- `stories/` — legacy story-pack catalog retained for compatibility and tests
- `llm/` — prompt construction, provider transport, validation, and beat rendering
- `decor/` and rendering helpers — room geometry, fixtures, sprites, and effects

## Assets and tooling

Runtime images and sound live under `public/assets/`. Character atlas tools in
`scripts/` intentionally target `public/assets/characters`. Source artwork retained
under `tmp/imagegen-*` is not disposable build output. Generated QA captures belong
under ignored `output/`.

## Change-safety rules

1. Keep `Game`, `Simulation`, and `MansionScene` as stable facades when extracting
   implementation details.
2. Move public assets atomically with every code and script reference.
3. Do not delete apparently unused story, dialogue, UI, or source-art files during
   structural work; removal requires a separate usage audit.
4. Treat dialogue packs as authored data. Avoid mass formatting or incidental edits.
5. After a meaningful runtime change, run the production build, focused lint, the
   relevant standalone regression suite, and a browser gameplay smoke test.

## Staged cleanup backlog

The largest modules (`world.ts`, `game.ts`, `sim.ts`, and `audio.ts`) should be split
behind their existing facades in separate behavior-focused changes. The shared type
cycle between domain, dialogue, and narrative types should be broken by introducing
core domain types before those modules are broadly moved. Both operations have a
larger regression surface than the folder-level organization completed here.
