# Hallway Sprite Design Handoff

## Goal and geometry contract

Replace the single flat brown passage material with a restrained family of transitional hallway surfaces. Hallways must remain quieter and darker than rooms: they connect room identities rather than becoming a tenth room type.

Current passages are approximately **3.6 world units long × 3.0 wide**, centered between 10×10 rooms on a 13-unit grid. At the floor artwork's established density (418 px per 10 world units), author each passage floor master at **160×128 px**. The live mesh may crop the outer 5 px rather than stretch it. Use nearest filtering, no mipmaps, and no smoothing.

- Author horizontal masters with travel running left-to-right. Rotate the same asset 90° for vertical passages when the mapping permits.
- Keep a **12 px threshold-safe strip** at each short end free of strong motifs. This overlaps visually with the existing room threshold sill.
- Make patterns seamless on the two long edges. Do not tile along the passage length; one sprite spans threshold to threshold.
- If wall-facing overlay sprites are added, use **160×80 px** masters for each long side. The lower 10 px is baseboard; the upper field may repeat every 32 px, but stains/cracks should occur only once per master.
- Hall floor art is color-stable/unlit like room floor surfaces. Wall overlays may use `MeshStandardMaterial` so practical light and lightning affect them.

## Four coordinated variants

### A. Walnut runner — formal upper band

Dark walnut boards run with travel, interrupted by a narrow oxblood runner with a single dull-brass line on each side. Use broad 8–12 px planks and only three value steps. Walls are tobacco plaster over near-black walnut wainscot.

Palette: `#211815`, `#39271f`, `#55382b`, runner `#4a2229`, brass `#8b6938`.

Use for the Study–Gallery and Gallery–Conservatory horizontal passages. At the conservatory end, fade the final 18 px from oxblood toward desaturated moss instead of introducing a hard green stripe.

### B. Service tile — working middle-west

Large smoke-gray quarry tiles with a sparse cream corner inset; never a busy checkerboard. One copper-colored drainage/seam line runs with travel. Walls are soot-softened putty plaster with a charcoal dado and occasional broad water mark.

Palette: `#292827`, `#44413d`, `#6c655b`, inset `#9a8d75`, copper `#85512f`.

Use for Kitchen–Dining. Its kitchen end may show two pale inset corners; remove them toward Dining so the burgundy room reads cleanly.

### C. Formal stone runner — public middle-east

Blue-black rectangular stone slabs with a muted plum central runner and tiny ivory end ticks. This is the cleanest, most symmetrical passage family. Walls use cool charcoal plaster, low beveled panels, and one subdued lavender-gray highlight band.

Palette: `#20222b`, `#343744`, `#55566a`, runner `#49364f`, ivory `#aaa39b`.

Use for Dining–Ballroom. The last 18 px toward Dining shifts the runner toward burgundy; toward Ballroom it shifts toward muted violet. No medallion or radial motif in the hall.

### D. Damp flagstone — lower/service band

Four to six broad irregular charcoal stones, thin blue-gray mortar, and one restrained damp edge rather than scattered speckles. Walls are rough umber-gray masonry with large blocks and dark lower staining. This family may be mirrored/rotated to avoid identical crack placement.

Palette: `#1e1e1d`, `#34332f`, `#4c4a43`, mortar `#59616a`, damp `#263946`.

Use for Cellar–Library and Library–Suite. For Library–Suite, overlay a narrow worn green-brown runner so it feels inhabited; keep the underlying stone visible at both edges. At the Suite end, introduce one dusty-rose thread only in the final 18 px.

## Vertical connector mapping

Vertical passages should visually describe descent through the mansion. Use the adjacent band styles with a deliberate halfway transition rather than inventing six more assets.

| Connection | Base / orientation | Transition treatment |
|---|---|---|
| Study–Kitchen | Service tile, rotated | Walnut threshold cap at Study; tile begins after first 18 px |
| Kitchen–Cellar | Damp flagstone, rotated | Putty plaster darkens downward; add a single drain groove near Cellar |
| Gallery–Dining | Formal stone runner, rotated | Cool blue-black stone throughout; runner changes slate-blue to burgundy at midpoint |
| Dining–Library | Walnut runner, rotated | Burgundy thread above, desaturated forest-green thread below; boards become more worn toward Library |
| Conservatory–Ballroom | Formal stone runner, rotated | Moss-gray end cap above, muted plum below; subtle rain-darkened wall stain at Conservatory end |
| Ballroom–Suite | Walnut runner, rotated | Plum thread above, dusty rose below; maintain the same dark walnut boards throughout |

Transitions occupy **18 px at each endpoint** and may use a quiet 24 px midpoint blend. Never crossfade whole textures; preserve one continuous floor material and change only runner/thread/inset accents.

## Doorways, walls, and depth

- Existing brass threshold meshes remain the brightest dividing line. Hall sprites stop visually beneath them; do not paint a second sill.
- Preserve a plain central travel lane at least **64 px wide**. Cracks, grout intersections, runner borders, and wall stains should not resemble evidence or collision edges.
- Hall wall sprites should be architectural side bands only: wainscot, plaster, masonry, and broad stains. No paintings, windows, sconces, furniture, or unique story clues in passages.
- Terminate wainscot/baseboard 8 px before each threshold so it does not visually bridge across the doorway opening.
- Keep long-side walls 15–20% darker than both adjacent room walls. Their top edges and columns may retain the existing near-black geometry outline.
- Use mirrored masters on alternating links of the same variant. Do not rotate textural lighting; all painted highlights should remain neutral enough for either orientation.

## Deterministic assignment rule

Choose by explicit connection ID, not at random. The table above is canonical. If the map expands: same-row formal links use the row's horizontal variant; vertical links use the darker of the two adjacent floor families, then borrow only a narrow accent from each endpoint. Randomized cases must never change architecture.

## Visual acceptance criteria

- Every passage is visibly continuous from threshold to threshold with no stretched pixels, UV seams, or z-fighting.
- At full-mansion camera distance, upper/formal, middle/service, middle/public, and lower/damp links remain distinguishable by pattern as well as hue.
- Passage contrast stays below both adjacent rooms; actors, labels, bodies, and chalk outlines remain dominant.
- The centered 64 px travel lane reads open, and no decorative line resembles a wall or blocked boundary.
- Rotated vertical assets retain correct pixel density and do not show directional baked lighting.
- Thresholds remain crisp under normal room light and lightning flashes; no hall overlay covers door openings or columns.
- Neighboring rooms keep their identities: Study walnut, Kitchen tile, Ballroom violet stone/parquet, Cellar damp slab, Library green/walnut, and Suite rose accents appear only as restrained endpoint cues.
