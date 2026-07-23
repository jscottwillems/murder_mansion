# Mansion Decor Layout Design

This is the controlled re-layout specification for the camera-facing decor cutouts. Coordinates are room-local. The camera looks generally from positive `z` toward negative `z`; room doors occupy centered wall openings. This plan intentionally uses 34 of the 45 available sprites and omits 11 that duplicate major procedural furniture or would overfill a room.

## Shared scale classes

`height` is the cutout's visible world-unit height, normalized by the real-world category rather than by source-image dimensions. `baseY` is the world-unit height of the cutout's lower edge. Unless stated otherwise, `baseY` is `0.025` (floor-standing).

| Category | Standard height | Typical range | Base/anchor |
|---|---:|---:|---|
| Loose floor props: crates, jugs, lantern | 0.75 | 0.60-0.90 | floor, `baseY: 0.025` |
| Tabletop props: banker lamp, decanter, candelabra, gramophone | 0.70 | 0.55-0.90 | supporting top + 0.02 |
| Occasional/tea/cocktail tables and trolleys | 1.05 | 0.90-1.20 | floor |
| Chairs, benches, settees, chaise | 1.35 | 1.20-1.55 | floor |
| Desks, prep tables, chests, carts | 1.25 | 1.05-1.45 | floor |
| Globes, birdbaths, stanchions | 1.35 | 1.15-1.50 | floor |
| Bust above a plinth | 1.00 | 0.90-1.15 | plinth top |
| Tall stands, plants, music stands | 1.80 | 1.55-2.15 | floor |
| Clocks, screens, racks | 2.25 | 1.95-2.50 | floor |
| Wall portraits | 2.35 | 2.10-2.65 | wall-mounted, lower edge 1.05-1.35 |
| Major beds/bookcases | 2.50 | 2.30-2.75 | floor; generally omitted when procedural equivalent exists |

Scale exceptions should reflect a recognizable physical subtype, never compensate for transparent padding or image aspect ratio.

## Depth, overlap, and circulation rules

1. Cutouts remain parallel to the `xy` plane. Because the camera is on positive `z`, increasing `z` moves an item visually in front of another. A prop composited onto procedural furniture should be `0.04-0.10` world units toward positive `z` from the support's visual center/front, with `baseY` set to the support top.
2. Two floor cutouts in one vignette need at least `0.30` of `z` separation. Put the taller anchor at lower `z` and smaller secondary pieces at higher `z`, so the secondary overlaps the anchor rather than being swallowed by it.
3. Wall-mounted art sits at `z: -4.48` on north walls, just inside the wall face, and uses a raised `baseY`. It must not be treated as floor-standing or given a collider.
4. A tabletop or shelf prop uses the support's exact `baseY` and a slight positive-`z` bias. It is decorative only: it inherits no gameplay footprint. Use `renderOrder: 2` if depth testing still causes the procedural support to break the cutout.
5. Preserve a hard doorway approach lane of `±1.55` around the relevant center axis: for north/south doors keep floor-standing objects at `|x| > 1.55`; for east/west doors keep them at `|z| > 1.55`. Raised props supported by furniture that already occupies a lane and wall-mounted art do not add a new circulation footprint.
6. Keep the central room crossing readable. Large floor cutouts stay in perimeter thirds or attach to existing furniture. No freestanding cutout should sit directly on a major collider.
7. `flip` changes composition only. Face visual weight inward toward its vignette or away from the nearest wall; do not use flip as a scale correction.

## Room compositions

### Study

The procedural desk at `(0, -2.65)` is the primary work vignette: the banker lamp sits on its left half and the globe stands at its right end. The existing southwest armchair and drinks cylinder become a compact after-dinner vignette with the decanter table. North bookcases remain unobscured. East (`z = 0`) and south (`x = 0`) door lanes stay clear.

Omit `writing-desk` and `leather-armchair`: both directly duplicate the substantial desk and two procedural chairs.

### Gallery

The uninterrupted north wall receives one ancestral portrait with a candelabrum below and to one side. The existing western plinth receives the marble bust. The eastern plinth becomes a protected relic exhibit with velvet stanchions slightly in front. These are two legible exhibit groupings, outside the east/west (`z = 0`) and south (`x = 0`) approaches.

Use all five sprites; the procedural plinths and bench are supports rather than competing representations.

### Conservatory

The southwest procedural worktable becomes an orchid-potting vignette via a raised orchid stand cutout. A monstera and birdbath form a lush northwest glasshouse cluster. The southeast garden bench creates a restrained sitting vignette, without adding another table. West (`z = 0`) and south (`x = 0`) approaches remain open, and the procedural tree at `(1.9, -1.9)` remains the room's dominant plant.

Omit `tea-table`: it repeats the procedural worktable and would make the room table-heavy.

### Kitchen

The north procedural range is already visually complete. A cookware rack mounts over the open north-east wall stretch, while a provision crate sits near the east side of the procedural prep table at `(-2.15, 2.25)`. A pastry table occupies the southeast perimeter as a distinct baking station. North/south (`x = 0`) and east (`z = 0`) traffic remains clear.

Omit `range-stove` and `butcher-block`: they duplicate the procedural range and central prep table.

### Dining Hall

The two north sideboards become the service vignette: a decanter sits on the west sideboard and a serving trolley parks beside it. A grandfather clock anchors the northeast wall. A silver candelabra sits on the banquet table but is offset from the north/south center lane and away from place settings. All four centered doors retain their cross-shaped circulation.

Omit `dining-chair`: the procedural banquet arrangement already supplies nine chairs, including a distinct head chair.

### Ballroom

The procedural piano in the northwest gains a gramophone on its rear ledge and a music stand nearby, forming the music vignette. A lavender settee, cocktail table, and palm form a southeast salon vignette around (not on) the procedural raised platform/curtain area. The broad central dance floor and west/north/south approaches remain empty.

Use all five sprites: none duplicate the procedural piano, chandelier, curtains, or platform, and they resolve into only two clusters.

### Cellar

The south-west barrel stack gains nearby stoneware jugs and a wine crate, forming a storage vignette without another barrel silhouette. The east worktable receives an iron lantern; a storage chest sits below the northeast shelving as a second utility cluster. East (`z = 0`) and north (`x = 0`) approaches stay clear.

Omit `barrel-rack`: the procedural room already has a three-barrel stack and two full north-wall shelving units.

### Library

The west wall shelving receives a parked book cart as a circulation prop. A reading table and chair form a southeast reading nook, well away from the procedural central globe table at `(0, 2.75)`. Existing north and side-wall bookcases remain the dominant architecture. East/west (`z = 0`) and north (`x = 0`) approaches stay clear.

Omit `bookcase` and `library-ladder`: four procedural bookcases and a procedural ladder already establish both motifs.

### Master Suite

The procedural bed remains the dominant northwest anchor. The procedural east vanity receives the jewelry table sprite as a small raised jewelry-box/tabletop read. A dressing screen and chaise form a southeast dressing/lounge vignette while keeping north (`x = 0`) and west (`z = 0`) circulation open.

Omit `four-poster-bed` and `vanity`: both directly duplicate major procedural furniture.

## Exact placement table

Rows below are the complete intended placement set. `baseY` should be added as an optional schema field; absent values default to `0.025`.

| Room | Asset | x | z | height | baseY | flip | Anchor type | Intended relationship / anchor |
|---|---|---:|---:|---:|---:|:---:|---|---|
| Study | banker-lamp | -0.72 | -2.54 | 0.68 | 0.88 | no | tabletop | On left half of procedural desk; slight positive-z compositing bias |
| Study | globe | 1.92 | -2.60 | 1.42 | 0.025 | yes | floor-standing | At east end of desk, outside desk collider |
| Study | decanter-table | -2.42 | 3.18 | 1.02 | 0.025 | no | floor-standing | Beside existing southwest chair and drinks cylinder |
| Gallery | ancestral-portrait | 0.00 | -4.48 | 2.42 | 1.12 | no | wall-mounted | Centerpiece on uninterrupted north wall |
| Gallery | candelabrum | -1.72 | -4.12 | 1.90 | 0.025 | no | floor-standing | Left-side light framing portrait, outside south lane |
| Gallery | marble-bust | -2.80 | -1.77 | 1.02 | 1.07 | no | plinth-mounted | Centered on west procedural plinth, positive-z offset |
| Gallery | relic-display | 2.80 | -2.00 | 1.68 | 1.07 | yes | plinth-mounted | Centered on east procedural plinth with rear depth bias |
| Gallery | velvet-stanchions | 2.78 | -1.62 | 1.18 | 0.025 | yes | floor-standing | In front of relic plinth, just outside east/west doorway lane |
| Conservatory | orchid-stand | -3.35 | 3.28 | 1.12 | 0.77 | no | tabletop | Orchid display on procedural southwest worktable |
| Conservatory | potted-monstera | -3.55 | -3.58 | 2.02 | 0.025 | no | floor-standing | Tall rear anchor of northwest planting cluster |
| Conservatory | birdbath | -2.22 | -2.92 | 1.28 | 0.025 | yes | floor-standing | Foreground secondary in planting cluster |
| Conservatory | garden-bench | 2.82 | 3.35 | 1.32 | 0.025 | yes | floor-standing | Southeast sitting vignette, clear of south approach |
| Kitchen | cookware-rack | 2.75 | -4.48 | 1.72 | 1.18 | yes | wall-mounted | North-east wall above clear counter-height zone |
| Kitchen | provision-crate | -3.62 | 1.92 | 0.78 | 0.025 | no | floor-standing | Beside west end of prep table, not on its collider |
| Kitchen | pastry-table | 2.75 | 3.35 | 1.18 | 0.025 | yes | floor-standing | Separate southeast baking station |
| Dining | decanter-stand | -2.90 | -4.18 | 0.72 | 0.84 | no | tabletop | On west procedural sideboard |
| Dining | serving-trolley | -3.58 | -3.12 | 1.05 | 0.025 | no | floor-standing | Parked beside west sideboard |
| Dining | grandfather-clock | 3.72 | -4.20 | 2.38 | 0.025 | yes | floor-standing | Northeast wall anchor |
| Dining | silver-candelabra | 1.82 | 0.82 | 0.72 | 0.86 | yes | tabletop | On east half of banquet table, outside north/south lane |
| Ballroom | gramophone | -3.28 | -3.12 | 0.72 | 1.08 | no | tabletop | On procedural piano's rear/top plane |
| Ballroom | music-stand | -1.72 | -3.52 | 1.62 | 0.025 | yes | floor-standing | Beside piano, facing into music corner |
| Ballroom | lavender-settee | 2.52 | 2.12 | 1.38 | 0.025 | yes | floor-standing | Rear anchor of southeast salon |
| Ballroom | cocktail-table | 1.80 | 3.18 | 1.00 | 0.025 | no | floor-standing | Foreground/left of settee, clear of raised platform geometry |
| Ballroom | potted-palm | 3.72 | 1.72 | 2.25 | 0.025 | yes | floor-standing | Tall inward-facing salon edge anchor |
| Cellar | stoneware-jugs | -1.72 | 3.58 | 0.72 | 0.025 | no | floor-standing | Loose vessels beside southwest barrel stack |
| Cellar | wine-crate | -1.88 | 2.72 | 0.78 | 0.025 | yes | floor-standing | Foreground storage layer beside barrels |
| Cellar | iron-lantern | 4.05 | 2.08 | 0.65 | 0.72 | no | tabletop | On procedural east worktable |
| Cellar | storage-chest | 3.32 | -3.22 | 1.02 | 0.025 | yes | floor-standing | Beneath/right of northeast shelving, away from crate collider |
| Library | book-cart | -3.72 | 1.92 | 1.18 | 0.025 | no | floor-standing | Parked adjacent to west shelving, outside west-door lane |
| Library | reading-table | 2.12 | 2.38 | 1.08 | 0.025 | no | floor-standing | Center of southeast reading nook, clear of globe collider |
| Library | reading-chair | 3.32 | 2.92 | 1.38 | 0.025 | yes | floor-standing | Angled inward toward reading table |
| Suite | jewelry-table | 4.02 | 2.52 | 0.72 | 0.80 | yes | tabletop | Small jewelry display on procedural vanity |
| Suite | dressing-screen | 1.82 | 3.62 | 2.18 | 0.025 | no | floor-standing | Rear privacy anchor of southeast dressing vignette |
| Suite | chaise-longue | 3.18 | 1.72 | 1.34 | 0.025 | yes | floor-standing | Lounge seat bridging screen and vanity, outside west lane |

## Explicit omission list

| Room | Omitted asset | Reason |
|---|---|---|
| Study | writing-desk | Duplicates primary procedural desk |
| Study | leather-armchair | Duplicates two procedural chairs, including reading chair |
| Conservatory | tea-table | Duplicates procedural worktable and weakens plant-first composition |
| Kitchen | range-stove | Duplicates large procedural north-wall range |
| Kitchen | butcher-block | Duplicates procedural prep table |
| Dining | dining-chair | Duplicates nine-chair procedural banquet arrangement |
| Cellar | barrel-rack | Duplicates barrel stack and shelving mass |
| Library | bookcase | Duplicates four procedural bookcases |
| Library | library-ladder | Duplicates procedural southeast ladder |
| Suite | four-poster-bed | Duplicates dominant procedural four-poster bed |
| Suite | vanity | Duplicates procedural east vanity and mirror |

No Gallery or Ballroom sprites are omitted. The complete table contains 34 placements and the omission list contains 11 assets, accounting for all 45 generated sprites.
