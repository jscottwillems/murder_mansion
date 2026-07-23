# Murder Mansion Room Rework — Design Handoff

## Design target

Rework the nine 10×10 rooms into readable miniature noir sets that can be identified from silhouette before color. The camera is high, isometric, pixel-quantized, and often shows neighboring rooms; therefore every room needs one dominant landmark, one secondary prop family, and generous negative space. All assets must be assembled from procedural Three.js primitives. Furniture remains visual only: do not add furniture collision or alter `isWalkable`/room-boundary behavior.

The local room coordinate system used below is `x = west/east`, `z = north/south`, with walls at ±5. North is `z = -5`. Coordinates are recommendations and can move ±0.25 during visual tuning.

## Shared art and readability rules

- **One landmark, one supporting rhythm.** Give each room one large recognizable silhouette occupying roughly 15–25% of the floor. Supporting props repeat a simple shape and stay lower/smaller. Do not distribute equally weighted objects around the whole room.
- **Protect the doorway cross.** For every side that has a door, preserve the centered doorway band (`±1.5` on the cross-axis) from the threshold to at least 2.25 units inside. Connect opposing doors with a visually quiet 3-unit-wide floor lane. Low, flat floor inlays may cross it; furniture must not. For a turn between adjacent doors, keep a clear central turning square of at least 3×3.
- **Keep actors legible.** Most freestanding props should be below `y=1.1`. Tall pieces belong against walls or in corners, never between the camera and the room center/door. Use a maximum of 2–3 tall silhouette clusters per room.
- **Favor broad pixel shapes.** At the 0.58 render scale, details thinner than ~0.08 world units shimmer or disappear. Important lines should be 0.10–0.16 thick; small clues should use a bright 0.18–0.30 silhouette rather than texture detail.
- **Separate surfaces by value.** Floors should be medium-dark, furniture either 15–25% lighter or darker, and the landmark accent the brightest/saturated non-character element. Avoid black furniture on black walls. Keep existing near-black edge outlines, but do not outline every tiny decoration.
- **Use light to compose, not wash.** Retain one gameplay room light, but add at most one or two low-intensity practical glows where useful. Bias the main light 0.5–1 unit toward the landmark so the hotspot is not identical in all rooms. Keep doorway thresholds readable under all room palettes.
- **Limit geometry.** Aim for 18–35 meshes per room before edge lines. Prefer instanced/reused geometries and shared materials. A prop with four clear pieces is better than one with twelve indistinct details.
- **No transparent clutter.** Transparency is reserved for conservatory glass and mirror highlights. Avoid many coplanar layers and closely overlapping silhouettes.
- **Floor language helps navigation.** Each floor gets a distinct large-scale pattern, but every connected doorway receives a subtle path cue leading inward. Use shallow geometry at `y=0.01–0.035` to avoid z-fighting.
- **Mystery details are rewards, not obstacles.** Each room has one small story anomaly in a high-contrast color. It should be visible after a moment of looking, never resemble an actor or block a lane.

## Shared implementation kit

Add small reusable helpers rather than expanding one monolithic switch with raw boxes:

- `addFloorInlay(group, shape, color, x, z, rotation?)`: thin boxes, planes, rings, or radial wedges at `y≈0.02`; no edge lines on large flat inlays.
- `addRug(group, w, d, color, borderColor, x, z, rotation?)`: 0.025-high base plus a slightly smaller center. Keep rugs out of doorway thresholds or align them as paths.
- `addTable(group, w, d, topY, wood, x, z, rotation?)`: thin top and two trestle/pedestal supports; supports must be visually separated from the top.
- `addChair(group, color, x, z, rotation?)`: seat, back, and one sturdy under-block/paired legs; use a recognizable L-shaped profile rather than a single cube.
- `addCabinet` / `addShelf`: dark carcass, 2–3 lighter shelf bands, a few grouped colored book/bottle blocks. Tall storage stays within 0.55 of a wall.
- `addFrame(group, w, h, frameColor, imageColor, x, y, z, wallSide)`: thick outer box and inset canvas, offset enough to avoid z-fighting.
- `addCandleCluster(group, count, x, y, z)`: shared cylinder geometry and emissive/basic flames; clusters, not evenly spaced single candles.
- `addPlant(group, scale, potColor, leafColor, x, z, lean?)`: pot plus 2–3 overlapping low-poly cones/elongated leaf shapes; vary height and lean to prevent “green cone” repetition.
- `addBarrel`, `addCrate`, `addBottleCluster`: reuse geometry/materials; add broad bands or top faces only where they survive the pixel pass.
- `addPracticalGlow(group, color, intensity, distance, x, y, z)`: optional and capped; room light remains the dominant source.
- Cache geometries and materials by dimensions/color where practical. Do not allocate a new material for every repeated chair, book, pane, or candle.

## Room concepts

### Study — “The interrupted correspondence”

- **Floor:** dark walnut plank strips running north–south, with a compact oxblood rug under the desk. A thin brass line from the south doorway stops just before the rug, making the route intentional.
- **Focal landmark:** an angled writing desk at `(0, -2.65)`, about `3.2×1.25`, facing southeast. Give it a readable sloped blotter, one green-shaded lamp, and a chair pulled back toward `(0.9, -1.45)`. The asymmetry distinguishes it from Dining Hall.
- **Silhouettes/props:** tall bookcases in the northwest and northeast wall bays, broken into shelf bands; a low leather club chair and tiny round side table in the southwest corner. Keep the east/west doorway band free.
- **Lighting/color:** warm amber concentrated on desk papers; deep umber floor, oxblood textile, one emerald lamp shade. Keep walls cooler/darker than the desk.
- **Door/traffic:** Study has east and south connections. Preserve the east lane at `|z|≤1.5` to the center and the south lane at `|x|≤1.5`; the desk stays north of `z=-2` and the lounge stays west/south but outside both bands.
- **Mystery detail:** one pale letter lies half under the desk, pointing toward the east door; add a tiny dark-red broken wax seal beside it.

### Gallery — “The accusing portrait”

- **Floor:** cool blue-black stone tiles in a restrained 2×2 grid, with a narrow desaturated-blue runner along the north–south travel axis. No concentric light-ring-like floor decoration.
- **Focal landmark:** one oversized gold-framed portrait centered on the north wall, `2.1×2.35`, flanked by two smaller portraits at `x≈±3.25`. Its canvas should contain a simple two-tone bust silhouette that reads at distance.
- **Silhouettes/props:** two sculpture plinths only, at `(-2.8, -1.7)` and `(2.8, -1.7)`, with clearly different tops (angular bust versus narrow urn). A low upholstered bench sits at `(0, 2.75)`. Remove the current three-equal-plinth lineup.
- **Lighting/color:** moonlit slate and ivory, with restrained gold frames. Main light cool and slightly north-biased; tiny warm picture-light bars can highlight the central frame.
- **Door/traffic:** Gallery connects west, east, and south. Keep `|z|≤1.5` fully clear across the room; leave the south-to-center lane clear. Bench must remain south of `z=2.25`, and be no wider than 2.4.
- **Mystery detail:** the central painted figure wears a bright crimson signet; repeat a tiny crimson mark on the floor beneath the frame, suggesting fresh paint or blood.

### Conservatory — “Storm glass and the strangler fig”

- **Floor:** dark green-gray flagstones with thin pale grout bands; a curved/corner-to-center vine inlay can guide the eye without occupying space.
- **Focal landmark:** a circular, tiered fountain/planter at `(1.9, -1.9)`, diameter ~2.0, with a pale basin and one twisted dark trunk surrounded by broad asymmetrical leaves. This replaces the ambiguous central box.
- **Silhouettes/props:** a glass-pane wall rhythm across north and east exterior walls using dark mullions and only 10–16% opacity panes; planting bench in the southwest wall bay; three plant clusters of different heights, never five identical cones.
- **Lighting/color:** cold green-blue storm light through glass, with a subdued mint highlight on wet leaves and one warm terracotta pot family. Avoid saturating the whole floor green.
- **Door/traffic:** Conservatory connects west and south. Keep the west lane `|z|≤1.5` and south lane `|x|≤1.5` open; place the fountain in the northeast quadrant and bench west but north/south outside lanes.
- **Mystery detail:** one planter has a snapped pale plant label and a single purple flower on the floor, subtly implying a toxic specimen was removed.

### Kitchen — “Service interrupted”

- **Floor:** alternating charcoal/cream quarry tiles in large 1-unit checks, darkened enough to remain noir. Use a plain charcoal strip through east and north door bands so the checks do not make navigation noisy.
- **Focal landmark:** a heavy prep island at `(-2.15, 1.9)`, `2.3×1.25`, with a pale butcher-block top and hanging towel silhouette. Do not center it in the north/east turn route.
- **Silhouettes/props:** north-wall range with black hood/chimney and orange fire slit; west-wall sink/counter run; northeast tall icebox; 3–4 copper pans grouped above the counter, with handles thick enough to read. Vary heights so it reads as a kitchen skyline, not a row of boxes.
- **Lighting/color:** neutral warm task light, copper accents, cool steel/stone surroundings, low orange glow from the range.
- **Door/traffic:** Kitchen connects north, east, and south. Preserve the `|x|≤1.5` north–south spine and `|z|≤1.5` route to east. All counter runs stop at least 0.35 before doorway bands.
- **Mystery detail:** the magnetic/wood knife rail shows four pale knife shapes and one conspicuous empty slot, with a small dark-red smear below it.

### Dining Hall — “The eleventh place”

- **Floor:** dark herringbone impression using broad diagonal plank strips; a burgundy runner rug under the table, shortened to leave at least 2.0 units before east/west thresholds.
- **Focal landmark:** long banquet table oriented east–west but reduced to about `5.2×1.35`, centered at `z=0.65` rather than exactly on the doorway line. Use a thin top with two visible trestles, not a solid block. Chairs should have backs and be grouped with gaps.
- **Silhouettes/props:** two candelabra clusters rather than three isolated candles; a north-wall sideboard split left/right of the north doorway; one high-backed host chair at west end. The table setting itself supplies the supporting rhythm.
- **Lighting/color:** rich amber pool, mahogany, burgundy, aged ivory. Let candle flames be the brightest points while the table top remains mid-value.
- **Door/traffic:** Dining connects all four sides. This is the strictest room: preserve both centered lanes. Leave an obvious 1.5-wide passage along the north edge of the table for east–west travel and gaps at both table ends; shift/size table until an actor never visually merges with chairs while entering. Floor runner may cross, furniture may not.
- **Mystery detail:** set ten small ivory plates plus an eleventh place at the otherwise empty host end; that plate is overturned and paired with a single red napkin.

### Ballroom — “The last dance”

- **Floor:** the room landmark is the floor itself: pale lavender-and-ebony parquet forming an octagonal dance medallion, using broad wedges/rings rather than thin torus lines. Keep the outer floor quiet.
- **Focal landmark:** a branching chandelier overhead at `(0, 0)` made from a central stem, one broad ring, and 6 chunky candle bulbs. Its height must not obscure actors; use the floor medallion as the primary silhouette from the camera.
- **Silhouettes/props:** grand piano in the northwest corner, unmistakably angled 25–35° with keyboard, raised-lid triangle, and three legs; two curtain masses on the east exterior wall; a small musicians’ dais in the southeast corner. Keep the dance floor otherwise empty.
- **Lighting/color:** cool violet ambient with warm ivory chandelier points. Piano nearly black with a readable ivory keyboard; curtains muted plum.
- **Door/traffic:** Ballroom connects north, west, and south. The open dance floor naturally carries all three centered routes. Piano and dais remain entirely in corner footprints outside `|x|≤1.6` and `|z|≤1.6` lanes.
- **Mystery detail:** add two pale shoeprint marks on the medallion that face different directions, one ending abruptly before the south door.

### Cellar — “The bricked-up vintage”

- **Floor:** uneven dark stone slabs in 4–6 broad patches, plus a narrow damp desaturated-blue channel along the west wall. Avoid many tiny tiles.
- **Focal landmark:** a north-wall wine rack split around the north doorway; the western half is normal bottle rhythm, the eastern half exposes a jagged pale brick patch/false panel. This wall silhouette is more distinctive than scattered barrels.
- **Silhouettes/props:** barrel pyramid in the southwest corner (two horizontal barrels below, one above), crate stack in southeast, small worktable against east wall. Add broad barrel hoops. Keep floor scatter minimal.
- **Lighting/color:** lowest-key room, but raise local contrast: burnt-orange hanging bulb near `(1.5, 2)`, cold gray damp stones, tobacco-brown wood. The floor and props must still separate under normal ambient light.
- **Door/traffic:** Cellar connects north and east. Preserve the north lane `|x|≤1.5` and east lane `|z|≤1.5`; barrel/crate masses occupy southwest/southeast corners without projecting into the east route.
- **Mystery detail:** one fresh pale brick sits on the floor below the false panel, with a tiny black cavity visible in the rack behind it.

### Library — “The missing volume”

- **Floor:** warm dark parquet with a narrow green carpet path forming an L between north and east/west connections; use broad rectangular segments, not a thin maze.
- **Focal landmark:** full-height bookshelf walls with clear colored book bands, but a centered conspicuous pale gap in the north-west shelf bay. Add crown caps so shelves read as furniture, not walls.
- **Silhouettes/props:** compact round/hexagonal reading table at `(0, 2.7)` with one green lamp; rolling ladder parked diagonally against the southeast shelf; two low book stacks in a corner only. Existing shelf bays remain split clear of doors.
- **Lighting/color:** amber reading pool, forest-green carpet/lamp, chestnut shelving, jewel-tone book clusters. Keep book colors grouped in blocks rather than confetti.
- **Door/traffic:** Library connects north, east, and west. Maintain `|z|≤1.5` across the full room and north-center lane. The reading table stays far south and ≤1.5 diameter; ladder hugs the wall.
- **Mystery detail:** the shelf gap is one missing volume; place a matching green book face-down beneath the reading table with a small torn ivory page beside it.

### Master Suite — “The room left in haste”

- **Floor:** muted rose-brown wood with a large asymmetrical dusty-pink rug confined to the northwest bed zone; a slim gold border line leads from west/north doors toward the vanity, without crossing as clutter.
- **Focal landmark:** a curtained four-poster bed in the northwest quadrant, approximately `2.5×3.0`. Use four dark posts, a low mattress, pale pillows, and only two broad translucent/opaque drape slabs so it reads instantly without becoming a cage.
- **Silhouettes/props:** vanity and oval/faceted mirror on the east wall south of the east doorway; tall wardrobe in southwest corner; small upholstered stool tucked under vanity. Keep toiletries to one clustered silhouette.
- **Lighting/color:** rose/peach practical warmth at vanity, deeper wine textiles, cool silver-blue mirror face. The bed should be darker than pillows but lighter than the wall.
- **Door/traffic:** Suite connects north and west. Preserve the north lane and west lane into the central turning square. Bed remains northwest but outside both bands; vanity stays at `x≈4.1, z≈2.4`, wardrobe southwest at `x≈-3.8, z≈3.2`.
- **Mystery detail:** the jewelry box on the vanity is open; one bright pearl trail of three chunky beads leads toward the west door, sparse enough not to resemble particles.

## Recommended implementation order

1. **Foundation/readability:** introduce helpers/material caching, floor-inlay support, door-clearance constants/guides, and shared prop primitives. Do not change walkability.
2. **Highest-impact central rooms:** Dining Hall, Gallery, Ballroom. They are frequently visible together and currently show the strongest “generic block”/flat-light problem. Validate all four Dining routes immediately.
3. **Strong service/nature contrast:** Kitchen, Conservatory, Cellar. These establish checker/stone/glass vocabularies and test warm/cool extremes.
4. **Dense wall rooms:** Study and Library. Reuse shelf/frame/table helpers and verify tall furniture never masks north/east/west entries.
5. **Character room:** Master Suite, reusing textile, mirror, cabinet, and clustered-detail patterns.
6. **Polish pass:** tune light positions/intensities, reduce any props that merge at the pixel scale, and ensure every mystery detail survives without becoming a beacon.

## Visual acceptance checklist

- At a glance and in grayscale, each room can be named from its landmark/floor silhouette without reading the HUD.
- Centered threshold strips and the first 2.25 units inside every door are unobstructed and visibly connected to room negative space.
- Actor bodies and labels remain distinct against furniture in the center and at every entry.
- No tall object visually bridges across a doorway, and no prop resembles a closed door in a doorway band.
- Dining Hall supports clean north↔south and east↔west reads despite the table; Ballroom remains visibly open; Gallery does not read as three identical pedestals.
- The nine floors do not rely on color alone: plank, stone grid, flagstone, checker, herringbone, medallion parquet, rough slab, parquet/carpet, and rug/wood treatments remain distinct.
- Main landmarks survive the pixel pass without shimmer, z-fighting, or overly thin lines.
- Mystery details are discoverable in a close room capture but do not compete with guests, the detective, doors, or focal landmarks.
- Build and gameplay state remain unchanged apart from visuals; furniture introduces no collision assumptions.
