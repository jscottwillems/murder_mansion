# Murder Mansion

A browser-based 3D murder mystery built with React, TypeScript, Three.js, and Vite.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:3000`.

## Quality checks

```bash
npm run build
npm run lint:game
npm run lint
```

`npm run build` is the production typecheck and bundle gate. `lint:game` checks the
handwritten game and interface code. The full lint command also checks the vendored
UI component library; see `tests/README.md` for the regression suites and their
current baseline.

## Repository map

- `src/game/` — simulation, narrative, dialogue, rendering, sound, and LLM integration
- `src/ui/` — game-specific React interface
- `src/components/ui/` — reusable UI primitives
- `src/state/` — React-facing game state adapter
- `public/assets/` — runtime images and audio
- `tests/` — standalone regression suites
- `docs/` — narrative, architecture, and visual design documentation
- `scripts/` — asset generation and validation utilities
- `tmp/` — retained source artwork and local scratch artifacts; do not bulk-delete
- `output/` — ignored visual QA artifacts generated during development

For subsystem boundaries and change-safety rules, see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
