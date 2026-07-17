# Character Model Redesign — Visual Handoff

## Design goal

Rebuild the full cast as a cohesive set of stylized, low-poly 1920s–30s mystery figures. The journal sprites in `public/assets/characters/` are the visual source of truth for the ten guests. Preserve their recognizable silhouette, clothing hierarchy, hair/headwear, palette, and signature object rather than merely applying each sprite's dominant color to the same body.

The detective has no journal sprite, so the design below deliberately complements the cast: a practical investigator silhouette that reads instantly as the player and does not borrow any guest's signature.

## Shared model language

- **Scale and proportions:** Keep the current actor height near 1.7–1.85 world units so collision, labels, doors, and furniture remain compatible. Use a stylized 4.5-head-tall figure: head about 22% of total height, compact torso, slightly oversized hands/props, and clear feet. Vary shoulder, coat, skirt, and hat widths, not overall gameplay footprint.
- **Geometry:** Favor tapered boxes, low-sided cylinders/cones, and simple extruded planes. Use 6–8 radial segments. Bevels are optional and should be sparse. Silhouette matters more than facial detail at the isometric camera distance.
- **Layering:** Every actor should visibly separate into legs/skirt, inner garment, outer garment, head/hair, and at least one accent or prop. Avoid the current “single colored box with attachments” look.
- **Faces:** Warm skin base with a small shadow plane beneath the brow/nose. Hair, moustaches, and beards should be geometric silhouette pieces. Do not add tiny eyes or mouth geometry that will shimmer in the pixel pass.
- **Materials:** Matte roughness 0.72–0.92; metal and satin accents can use 0.42–0.62. Keep values separated under dim room lighting. Black should be charcoal rather than absolute black.
- **Readability:** Props, hat brims, capes, sleeves, and skirts may be 15–25% larger than realistic. Keep thin objects at least 0.055 world units thick. Favor front and side projection so objects remain visible from the isometric view.
- **Orientation:** Build the character's visual “front” consistently with the existing actor forward axis. Props should sit forward or on the camera-readable side, never entirely behind the torso.
- **Motion rig:** Create simple named pivots for torso, left/right arms, and left/right legs where practical. Walking should use a restrained opposing arm/leg swing plus the existing bob. Static accessories should not bob independently.
- **Idle identity:** Add a small, archetype-specific loop described below. These should be slow and subtle (roughly 2.5–5 seconds), and may be procedural rather than skeletal.
- **Death pose:** Rotate the whole actor as today, but offset the signature prop slightly toward the floor and reduce idle motion to zero. Ensure wide hats, cape, microphone, and cane do not clip deeply below the floor.

## Cast specifications

### Society Columnist (`columnist`)

- **Reference read:** Purple skirt suit, cream fur/lapel, wide asymmetric cloche-style hat with pale feather, gloves, slim cigarette holder, notebook.
- **Silhouette/proportions:** Narrow, upright, poised silhouette; fitted waist and knee-length pencil skirt. Shoulder width 0.58, skirt taper 0.42 → 0.34, total height about 1.72. Hat brim should be the widest element at 0.72–0.78.
- **Palette:** aubergine `#533047`, plum `#70405D`, deep wine `#34202D`, cream `#E4D6B7`, gold `#C4A15B`, charcoal `#252128`.
- **Hair/headwear:** Dark-brown bob visible as two side wedges below a broad purple hat. Add a cream feather sweeping upward/backward from one side.
- **Clothing layers:** Purple jacket with peplum taper, cream V-shaped fur/lapel insert, pencil skirt, dark gloves, low dark shoes. A thin gold bracelet/cuff is enough jewelry.
- **Signature prop:** Long gold cigarette holder held diagonally away from the body in one gloved hand; a small brown notebook tucked against the opposite hip. Prioritize the holder if geometry budget is tight.
- **Pose/animation:** Chin-up contrapposto. Idle: lift/angle the cigarette holder, pause, then lower; the notebook arm stays close. Walk with minimal arm swing, as if maintaining composure.

### Retired Surgeon (`surgeon`)

- **Reference read:** White-haired older man, moustache, long ivory medical coat over charcoal three-piece suit, small surgical instrument in hand.
- **Silhouette/proportions:** Tall, square, authoritative. Broad long coat (0.68 shoulders) falling to below the knee, narrow trouser legs, slightly large head to retain white hair/moustache. Height about 1.82.
- **Palette:** surgical ivory `#DDD9CA`, warm white `#EEE9DB`, charcoal `#252A29`, waistcoat green-black `#273129`, muted brass `#A88A45`, white hair `#E6E1D5`.
- **Hair/headwear:** Swept white side hair with bald/skin crown plane; large white horizontal moustache is essential.
- **Clothing layers:** Split-tail/open lab coat over dark waistcoat, white shirt, narrow black tie, charcoal trousers. Model lapels and the dark inner column so the coat reads as an outer layer, not a white box.
- **Signature prop:** Small dark metal scalpel/forceps held upright near chest level. Oversize to approximately 0.22 long and use a pale highlight edge.
- **Pose/animation:** One hand in coat pocket, instrument hand raised. Idle: inspect/rotate the instrument a few degrees; slight clinical head tilt. Long, economical walk stride.

### Greenhouse Curator (`curator`)

- **Reference read:** Broad flowered straw garden hat, cream rolled-sleeve blouse, green embroidered apron dress, potted plant, garden tools in pocket.
- **Silhouette/proportions:** Soft A-line silhouette with a wide hat and ankle-length layered skirt. Height about 1.74; hat diameter 0.82, skirt hem 0.66. Rounded rather than angular shoulders.
- **Palette:** moss `#3F612D`, leaf `#587D37`, apron green `#668447`, cream `#E5DCC1`, straw `#B79A55`, terracotta `#9A5332`, floral orange `#C77A39`, small pink `#B96B72`.
- **Hair/headwear:** Brown low bun beneath broad straw hat. Add an asymmetric cluster of green leaves and 2–3 tiny flower blocks on the brim.
- **Clothing layers:** Cream blouse with rolled/puffed sleeves, dark green under-skirt, lighter apron panel, large front pocket. Suggest floral embroidery with 4–6 larger colored blocks, not noisy speckles.
- **Signature prop:** Terracotta pot with a high three-leaf plant, cradled forward at waist/chest height. Add two pale tool handles peeking from the apron pocket only if readable.
- **Pose/animation:** Slight nurturing hunch toward the pot. Idle: plant/pot tilts gently as she checks a leaf. Walk carefully with short steps and low bob.

### Stage Magician (`magician`)

- **Reference read:** Very tall black top hat with red band, charcoal tuxedo and grey waistcoat, floor-length black cape with vivid red lining, playing card, gold-topped cane, white gloves, small goatee.
- **Silhouette/proportions:** Tallest and most triangular guest at about 1.9 including hat. Slim torso, cape flaring from 0.65 shoulders to 0.9 hem. The top hat and cape must dominate the read.
- **Palette:** charcoal `#171A1E`, soft black `#24272B`, oxblood `#781B22`, crimson lining `#A42629`, silver grey `#A8A6A0`, white `#E9E5D7`, gold `#BD8F35`.
- **Hair/headwear:** Black hair edge under a tall cylindrical top hat; narrow moustache/goatee block. Red hatband must remain visible from all useful angles.
- **Clothing layers:** Black tuxedo, pale grey waistcoat/shirt triangle, bow tie, cape as two rear/side panels with red inner planes. White gloves are strong visual punctuation.
- **Signature prop:** Oversized white playing card held beside the face with a black suit mark; gold-topped black cane planted on the other side. If only one articulated prop is possible, animate the card and keep the cane fixed.
- **Pose/animation:** Showman's open stance, one elbow lifted. Idle: card rotates/reveals, cape subtly opens 5–8 degrees. Walk with cape held stiff and a slightly theatrical stride.

### War Correspondent (`correspondent`)

- **Reference read:** Rugged younger man with brown swept hair and stubble, tan field jacket, red scarf, large box camera at chest, canvas satchel, boots.
- **Silhouette/proportions:** Stocky utilitarian silhouette, height about 1.76, broad jacket and satchel creating an asymmetric side bulge. Camera forms a strong dark rectangle on the chest.
- **Palette:** field tan `#8B663D`, camel `#A37A48`, brown `#523923`, red scarf `#8B2527`, charcoal `#232527`, lens grey `#777B77`, boot brown `#3B291D`.
- **Hair/headwear:** Thick swept brown hair; small dark jaw/stubble plane. No hat.
- **Clothing layers:** Tan field jacket with dark lapels/cuffs over grey-green shirt, red wrapped scarf, loose brown trousers tucked into heavy boots. Satchel hangs cross-body on one hip with a visible flap/buckle.
- **Signature prop:** Black/brown box camera held at sternum height with a protruding circular 8-sided lens and side grip. Strap may be a simple diagonal dark bar across torso.
- **Pose/animation:** Forward, alert lean. Idle: raise camera slightly and scan 10–15 degrees, then lower. Walk briskly with reduced arm swing because both hands stabilize the camera.

### Estate Accountant (`accountant`)

- **Reference read:** Neat dark-haired man with black glasses and moustache, forest-green suit over charcoal waistcoat, thick brown ledger.
- **Silhouette/proportions:** Compact, rectangular, conservative. Height about 1.73; squared jacket, straight trouser column, ledger held tight against one side. Avoid making him as broad as the surgeon.
- **Palette:** forest `#314B2D`, olive green `#47613A`, charcoal `#272B28`, cream `#E2D9C4`, ledger brown `#5A3B26`, paper `#D4C39D`, brass `#B39448`.
- **Hair/headwear:** Precisely side-parted near-black hair, small moustache. Bold glasses: two thick rectangular dark frames and a bridge, slightly oversized.
- **Clothing layers:** Green suit jacket, darker waistcoat, cream shirt, olive/black tie, matching trousers. Add a pale pocket square and three small waistcoat buttons.
- **Signature prop:** Thick brown ledger with pale page block, held vertically against chest/hip. Free hand touches glasses.
- **Pose/animation:** Slightly closed posture, elbows in. Idle: adjust glasses, then glance/tilt toward ledger. Short, measured walking cadence.

### Jazz Vocalist (`vocalist`)

- **Reference read:** Black waved hair with red flower, fitted deep-red evening gown with thigh slit and train, matching feather/fur stole, long black gloves, pearls, vintage silver microphone.
- **Silhouette/proportions:** Elegant hourglass into a flared asymmetric gown/train. Height about 1.78; skirt hem 0.64 plus a short rear train. One bare/light leg can be suggested through a front split, not detailed anatomy.
- **Palette:** cabaret red `#7D1C22`, wine `#54171D`, highlight red `#A53335`, near-black `#171519`, pearl `#DED6C1`, microphone silver `#8E918D`, warm gold `#C29450`.
- **Hair/headwear:** Glossy black side-parted waves formed as layered lobes; large red flower above one ear. Gold drop earring on opposite side if visible.
- **Clothing layers:** Sleeveless V-neck red bodice, long gown with split/front overlap, red textured stole draped around forearms/back, elbow-length dark gloves, short pearl necklace.
- **Signature prop:** Vintage ribbed microphone on a slim dark stand at her forward side. Keep stand thick enough to survive rendering and attach to the actor group so it travels cleanly.
- **Pose/animation:** One hip dropped, shoulders angled toward microphone. Idle: slow sway and 3–5 degree mic lean; stole follows slightly. Walk animation should suppress stand swing and use a smooth glide.

### Antiquarian (`antiquarian`)

- **Reference read:** Older grey-haired man with full moustache/beard, warm brown checked three-piece suit and bow tie, open antique book, pocket watch/magnifier.
- **Silhouette/proportions:** Slightly stooped, layered and scholarly. Height about 1.72 upright; broad jacket/vest middle, narrow legs. Book and round watch/magnifier create two readable forward shapes.
- **Palette:** tobacco `#76502F`, ochre brown `#926A3C`, dark brown `#493321`, vest `#694629`, parchment `#C6AD72`, grey hair `#A9A396`, bow-tie burgundy `#6E2B24`, brass `#AE8C47`.
- **Hair/headwear:** Receding swept grey hair, large grey moustache, short pointed beard. These three shapes must distinguish him from the surgeon.
- **Clothing layers:** Brown checked/tweed jacket over matching waistcoat and trousers, cream shirt, red-brown bow tie. Suggest plaid with a few darker vertical/horizontal strips only if it remains calm at distance.
- **Signature prop:** Open parchment book held forward in one hand and a round brass pocket watch or magnifier in the other. The circular object should be at least 0.18 diameter.
- **Pose/animation:** Stooped neck, book-reading pose. Idle: book tips and watch/magnifier rises toward it. Walk with cautious shortened stride, book remaining stable.

### Off-Duty Chauffeur (`chauffeur`)

- **Reference read:** Dark navy double-breasted uniform, peaked cap with gold badge, white gloves, gold buttons and cuff stripes; crisp, restrained military bearing.
- **Silhouette/proportions:** Straight, formal, broad upper coat tapering to narrow trousers. Height about 1.8; cap brim extends clearly forward and shoulders are squared.
- **Palette:** midnight navy `#152839`, blue-black `#101C28`, lapel navy `#22394B`, gold `#C4942F`, white `#E7E3D6`, skin-shadow brown `#6E4A35`, black shoe `#17191B`.
- **Hair/headwear:** Short brown hair mostly hidden by peaked cap. Cap needs crown, band, forward brim, and central gold badge as separate shapes.
- **Clothing layers:** Double-breasted navy jacket with two columns of three oversized gold buttons, dark lapels, white shirt/black tie, matching straight trousers, white gloves, thin gold cuff stripes.
- **Signature prop:** The polished peaked cap is the primary signature and should be enough. Optionally add a small pale polishing cloth pinched in one glove, but no extra luggage.
- **Pose/animation:** Heels-together, one gloved hand near cap brim and the other behind/at hip. Idle: polish or adjust brim with a tiny wrist movement. Walk upright with disciplined, even steps.

### Debutante (`debutante`)

- **Reference read:** Blonde high bun with jeweled tiara, icy blue beaded evening gown with white trim and front slit, long white opera gloves, layered pearls, gold clutch with tassel/fringe.
- **Silhouette/proportions:** Tall, delicate hourglass opening into a wide floor-length skirt. Height about 1.79 plus tiara; hem 0.7. Long pale gloves make the arm silhouette conspicuous.
- **Palette:** ice blue `#8EADB9`, pale blue `#B8CDD2`, blue-grey shadow `#607B87`, ivory `#E7E3D8`, pearl `#D9D4C3`, blonde `#C89B43`, gold `#B88D39`.
- **Hair/headwear:** Sculpted blonde high bun with two front curl wedges. Small silver/pearl tiara must rise visibly above the bun.
- **Clothing layers:** Pale blue sleeveless bodice, draped/beaded skirt with ivory edge and front overlap/slit, opera gloves above elbow, layered pearl necklace, pale stole hanging from one forearm.
- **Signature prop:** Small gold fan-shaped clutch with fringe/tassel, held forward at hip. It should read as a fan/semicircle, not a rectangular book.
- **Pose/animation:** One wrist bent, shoulders open, one foot suggested forward through split. Idle: clutch/fan flick plus a small pearl-touch gesture. Walk with restrained gown sway and no exaggerated bob.

## Detective (player)

- **Design intent:** A practical noir investigator whose silhouette reads instantly from above and remains distinct from the columnist's broad hat, chauffeur's peaked cap, magician's top hat, and correspondent's camera. He should feel rain-soaked and mobile rather than aristocratic.
- **Silhouette/proportions:** Medium-tall at about 1.82. Broad trench-coat shoulders (0.7), fitted torso, coat skirts splitting into two tapered panels down to knee height, narrow trouser legs, sturdy shoes. Use a **medium-brim fedora**, not the current stacked round cylinders; crown should be pinched/creased through simple angled boxes and brim about 0.66 wide.
- **Palette:** charcoal trench `#2B2D2C`, warm dark brown `#332923`, muted olive shadow `#373A31`, tan shirt `#B8A98C`, oxblood tie `#6B2527`, antique brass `#A78643`, near-black hat band `#171819`, warm skin `#CBA685`.
- **Hair/headwear:** Minimal dark hair under fedora. The fedora is charcoal-brown with a darker band and a small asymmetrical brim tilt. Do not copy the columnist's feather or the magician's red band.
- **Clothing layers:** Belted double-breasted trench coat with raised collar/lapels, visible shirt/tie triangle, split coat tails, dark trousers, practical shoes. Add one contrasting brass badge on the chest or belt and a small notebook pocket.
- **Signature prop:** Folded case notebook in the left hand and compact flashlight in the right. The flashlight should be a short thick cylinder with a pale lens; use its emissive material very lightly, or keep it unlit, so it does not fight room lighting. If hand props complicate interaction, holster the notebook at the belt and retain the flashlight.
- **Pose/animation:** Forward-leaning investigative stance. Idle: brief notebook glance or flashlight sweep of 8–12 degrees. Walk gets the clearest coat-tail counter-swing in the cast. During interaction, settle into a squared stance facing the guest.
- **Player readability:** Retain the gold/cream “Detective” label, but also use the badge and small warm hat-band/belt accents so the player remains findable when labels overlap or are hidden.

## Implementation priorities

1. Replace the shared box-body construction with reusable helpers for head, tapered torso/coat, paired legs, arms, skirt/coat panels, hat, and prop pivots.
2. Implement the detective at the same time as the guests; it is part of the redesign, not a follow-up.
3. Lock silhouettes first in unlit/flat preview: columnist hat, surgeon coat, curator hat/plant, magician cape/top hat, correspondent camera/satchel, accountant glasses/ledger, vocalist gown/mic, antiquarian beard/book, chauffeur cap/buttons, debutante gown/bun, detective fedora/trench.
4. Apply palette/material layers, then add signature props and only afterward small accent geometry.
5. Verify all eleven models alive, walking, interviewing, and dead from the normal gameplay camera. Check that props and wide garments neither clip the floor nor obscure labels.

## Acceptance checklist

- All ten guest archetypes can be identified from silhouette alone at normal gameplay zoom.
- Each guest matches the corresponding journal sprite's dominant palette and signature object.
- The detective is visibly redesigned with fedora, layered trench coat, badge, and investigative prop(s).
- No two hats collapse into the same shape: columnist asymmetrical feathered brim, curator flowered straw brim, magician tall top hat, chauffeur peaked cap, detective pinched fedora.
- Surgeon and antiquarian remain distinct in grayscale through coat length/posture and moustache-versus-beard/book shapes.
- Columnist, curator, vocalist, and debutante use materially different skirt/gown silhouettes.
- Props remain readable from the isometric camera and do not disappear behind torsos.
- Walking, idle, interview, and death states remain stable with no floor penetration or detached accessories.
- Materials retain readable value separation in the mansion's darkest rooms.
