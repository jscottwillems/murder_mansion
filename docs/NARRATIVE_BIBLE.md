# Murder Mansion Narrative Bible

Status: canonical writer-room source of truth. This document supersedes contradictory story-pack details while preserving their strongest hooks. `src/game/data.ts` remains authoritative for room IDs, archetype IDs, and the immutable evidence matrix.

## 1. Core promise

Each run is a procedural-authored country-house mystery. The ten archetypes, their histories, and the conspiracy are stable; names, murderer, victims, movements, discovered bodies, and the order in which storylets surface vary by seed. The mystery is never “which profession owns this trace?” A trace establishes association only. A sound accusation requires:

1. material: a scene trace tied to the accused by a fair reveal;
2. opportunity: a verified route and time window;
3. deception or motive: a broken cover fact, deliberate false trail, or reason to silence a victim.

The murder sits atop a second crime. The host has operated a blackmail and corruption exchange through the Blue Case for years. Every guest has been touched by it, but no archetype is inherently the murderer. An innocent may hide a grave offense; the murderer may tell the truth about that offense while lying about movement and intent.

Tone is interwar Gothic noir: rain, class pressure, compromised institutions, brittle wit, and humane choices about what truth should cost. Research is structural inspiration only. Do not copy prose, reproduce a historical person, or imitate a living or dead author’s signature style.

## 2. Setting canon

### Time and place

- England, autumn 1931.
- Rookwood Hall is an old country estate modernized unevenly: electric lamps and a motorcar coexist with servants’ bells, coal heat, sealing wax, fountain pens, and hidden service routes.
- A violent storm has flooded the drive and disabled the rural telephone line. The house is isolated from midnight until the road becomes passable near sunrise.
- The player is an invited private investigator summoned after the opening victim is found shortly before midnight. The playable clock runs from 12:00 AM to 6:00 AM.
- Avoid post-period products, procedures, slang, media, and forensic certainty. In particular, never use chlorhexidine or modern quaternary disinfectant. Use carbolic solution, iodine, boric wash, surgical spirit, plant sulphur wash, petrol, paraffin, or period-appropriate motor solvent as context requires.

### The host

Sir Edgar Rooke, called “the Host” in implementation-facing text, is fixed and is not one of the ten randomized guests. He built the Blue Case system. At 11:35 PM he suffers a collapse after the gallery quarrel and is confined under household care in a non-playable family bedroom. He is alive but unavailable during the investigation. Whether the collapse was illness, fear, or a self-protective performance may remain ambiguous; it is not the murder solution.

The Host invited each guest under a plausible social or professional pretext. In truth, he intended to renew leverage, exchange the Blue Case, and identify whoever had begun copying his records. The household staff are mostly occupied with flooding and the Host. Named confidants such as Celia or June appear through testimony and artifacts, not as roaming suspects.

## 3. The Blue Case conspiracy

The blue dispatch case contains the Host’s control archive: coded payment schedules, compromising correspondence, copied contracts, provenance records, medical leverage, and instructions for intermediaries. It is not a single magic proof object. Its contents require witnesses and domain interpretation.

The system works as follows:

- Compromising information enters through gossip, reporting, estate accounts, forged provenance, private treatment, and surveillance.
- Payments are disguised in two synchronized books. A zero is inserted or erased in the estate ledger; the matching amount appears in a flower-order book as a rare bloom or “special bed.”
- “Flower” payments can mean purchased silence, a bribe, restitution diverted by the Host, or transport of illicit property.
- The brass key opens the blue dispatch cabinet and the keyed deadbolt inside the west service passage. The Host had duplicates made and used their circulation to test loyalty.
- Instructions travel by a requested song, counted rests, or two answering knocks. The musical code names a route; the knocks confirm that the west door is clear.
- Gardenia is the conspiracy’s preferred false trail because three public-facing women plausibly wear it and the conservatory supplies a natural explanation.
- A false limp hides route use: the courier drags the left heel while observed, then walks normally in the blind service corridor. No archetype owns the limp.
- The intended 12:10 AM exchange is the night’s fixed hinge. An assigned carrier is to bring the brass key to the gallery panel; a second person is to move the Blue Case toward the side door or Bentley. The opening murder disrupts the plan, but surviving conspirators may attempt, cancel, counterfeit, or exploit the exchange.

The randomized murderer kills to control the immediate consequences of the Blue Case: suppress a witness, recover an item, stop exposure of a personal vulnerability, or seize leverage. The murderer did not create the whole conspiracy and does not know every branch of it.

## 4. Canonical timeline

All times except murders are fixed anchors. Writers may place optional beats between them but may not contradict them.

- 8:00–10:30 PM — Guests arrive, dine, perform, inspect collections, work, or play cards. Personal story objects are seeded in their canonical rooms.
- 10:40 PM — The Accountant notices the altered zero. The Columnist receives copied flower entries. The Correspondent receives an attributed source warning.
- 11:00 PM — The Magician rehearses; the Vocalist receives the false third-verse request; the Chauffeur is paid to warm the Bentley.
- 11:10 PM — The brass key changes pockets under cover of the card game. The Debutante sees the exchange.
- 11:20 PM — A search disturbs the Debutante’s vanity, the Vocalist’s music case, or both. Powder and gardenia become available for deliberate transfer.
- 11:30 PM — The Curator discovers a disturbed root ball and pale grit. The Antiquarian notices a fresh hinge and the crooked gallery landscape.
- 11:35 PM — Gallery quarrel. A door slams; ink spills; a page tears. The Host collapses soon afterward.
- 11:42–11:55 PM — Opening murder window. The first randomized victim dies; the body is found shortly before midnight. The killer relocates and adopts the generated cover timeline.
- 12:00 AM — Play begins. Nine survivors remain. The storm closes the roads.
- 12:10 AM — Planned key/case exchange. It may complete, fail, or become a trap, but witnesses can always recover at least two independent facts: time plus route, object, gait, or signal.
- 12:15–2:00 AM — Initial interviews and circuit crossings. Further procedural murders can occur. External corroboration begins to replace unavailable witnesses.
- 2:00–4:30 AM — Contradictions converge: payment code, key route, false presence, and material provenance point toward a testable reconstruction.
- 4:30–5:40 AM — The player may accuse, set a counter-trap, or prioritize rescue and containment.
- 5:40–6:00 AM — Final convergence and dawn consequences.

### Killer cover timeline

At assembly, generate one three-beat cover and never reroll it:

1. a true public anchor before the relevant murder;
2. a false private interval spanning the murder;
3. a true re-entry observation after the killer relocates.

The killer repeats the same rooms, time band, and claimed witness. Pressure may change wording, not facts. The claimed witness can deny, narrow, or contextualize the claim. The killer knows the victim is dead only after discovery unless they personally discover the body as part of a seeded cover beat.

## 5. World and room canon

The nine rooms in `data.ts` are immutable playable locations.

- Study — center of paper power: estate ledger, adding machine, blotter, locked correspondence cabinet. Primary paper/payment room.
- Gallery — public display and private transit: reliquary cabinet, crooked landscape, concealed west-panel catch. Primary 11:35 quarrel and 12:10 exchange site.
- Conservatory — pale potting grit, plant treatments, propagation book, disturbed orchid crate. Material and coded-payment bridge.
- Kitchen — household labor, servant messages, drying coats, indirect access to the service route. Safe alternate carrier location for staff artifacts.
- Dining Hall — formal dinner, silver inventory, card table after the meal, clear sightlines that make covert exchanges depend on distraction.
- Ballroom — piano, performance area, dressing screen, Mercy Box or equivalent stage cabinet. Coded song and false-presence room.
- Cellar — estate stores, flower-order duplicates, motor supplies temporarily moved from the flooded garage, and the lower service stair.
- Library — private treatment, source meetings, dispatch drafts, and sealed letters. Quiet corroboration room.
- Master Suite — guest dressing area, vanity, perfume and powder transfers, personal papers. It is not the Host’s inaccessible family bedroom.

The west service passage is a narrow hidden route behind the gallery landscape, joining a study service cupboard to a stair descending toward kitchen/cellar access. It is a narrative sub-location, not a tenth room. A person can snag a sleeve, leave grit, hear knocks, or bypass public sightlines there. The brass key operates its inner deadbolt; the painted shepherd’s crook releases the unkeyed gallery panel.

## 6. Clue and knowledge rules

### Evidence matrix

The matrix in `src/game/data.ts` is immutable. Each archetype has exactly three IDs:

- Columnist: `ink-fiber`, `floral-perfume`, `torn-note`
- Surgeon: `antiseptic`, `blade-oil`, `wax-resin`
- Curator: `antiseptic`, `fine-earth`, `torn-note`
- Magician: `black-wool`, `face-powder`, `blade-oil`
- Correspondent: `ink-fiber`, `black-wool`, `torn-note`
- Accountant: `ink-fiber`, `metal-polish`, `blade-oil`
- Vocalist: `floral-perfume`, `face-powder`, `wax-resin`
- Antiquarian: `fine-earth`, `metal-polish`, `wax-resin`
- Chauffeur: `antiseptic`, `black-wool`, `metal-polish`
- Debutante: `fine-earth`, `floral-perfume`, `face-powder`

Every pair receives a personal reveal thread below. These explanations remain true whether the character is innocent, murderer, or victim. They explain legitimate association, not scene deposition. The killer overlay adds a separate transfer/deception fact explaining how one of their associated materials reached a murder scene.

### Fairness

- A player-facing reveal names a concrete possession, action, transfer, route, or comparison.
- No trace identifies one person; each ID always retains three plausible archetype associations.
- A personal confession without material corroboration cannot convict.
- A material trace without opportunity and deception/motive cannot convict.
- Locked dialogue never destroys the only path. Every personal thread specifies an alternate carrier or artifact.
- If a character dies, only pre-seeded artifacts, prior statements, or a named confidant can preserve their facts. The corpse does not generate new knowledge.
- If an artifact is destroyed by choice, a narrower copy, impression, account entry, residue comparison, or external witness survives.

### Knowledge-state guard

- Before the opening body is discovered, no dialogue may use victim, murder, killing, death, corpse, body, or imply a known fatality.
- After discovery, NPCs know only what they personally saw/heard, what an identified speaker told them, and public discoveries.
- Rumors must be attributed: “Celia told me…,” “I heard the Chauffeur say…,” or “someone at cards claimed….” Never grant omniscient summaries.
- The killer can know their own acts but must not reveal murder-only details. Their generated cover remains stable.
- Facts belonging to dead characters survive only through artifacts/confidants listed in their entry.
- The Host’s culpability may be inferred from records; no NPC can quote a private Host conversation they did not attend.

## 7. Cross-thread circuits

Each circuit has four owners and at least one physical bridge. Completing any three owners can establish the circuit; the fourth deepens consequences rather than gates solvability.

- Paper/payments — Columnist exposes flower orders; Correspondent supplies source time/route; Accountant restores the altered zero; Curator decodes botanical entries. Bridge: matching date, amount, and 12:10 notation.
- Key/route — Debutante sees the key change pockets; Antiquarian opens and dates the hidden panel; Chauffeur holds the escape route; Magician explains the duplicate/key impression and concealed mechanism. Bridge: brass key tooth pattern plus west-passage route.
- Performance/false presence — Vocalist decodes song/knocks; Magician reconstructs misdirection; Columnist distinguishes staged scent from presence; Debutante proves the scented alibi was prepared while she was at cards. Bridge: gardenia transfer and an early movement on the coded cue.
- Material provenance — Surgeon distinguishes period medical residue/oil/wax; Curator distinguishes plant wash and grit; Antiquarian authenticates resin, polish, and dust; Accountant dates custody through inventories and ledgers. Bridge: comparison samples with documented origin.

## 8. Character canon

Names randomize; roles and histories do not. Relationship references therefore use archetype titles.

### Society Columnist — “The Paragraph That Never Ran”

- Public mask: amused social predator who turns danger into copy.
- Private need: protect junior housemaid Celia, the source who copied the flower orders, without wasting her courage.
- Secret: came to expose the Host and has selectively suppressed stories when publication would crush a powerless source.
- Vulnerability: fears that restraint makes her another broker of silence; her missing notebook leaf can look like extortion.
- Relationships: trades source ethics with the Correspondent; recognizes the Accountant’s figures in Celia’s copy; distrusts the Debutante’s guardian; envies the Vocalist’s control of a room.
- Voice rules: compact epigrams; one precise social image per answer; terms of endearment are defensive, not constant. Never speak in generic exposition.
- Trust tell: stops saying “darling,” gives dates, and allows the detective to hold paper.
- Pressure tell: over-polishes jokes, grips notebook, attacks the detective’s taste or methods.
- `ink-fiber` thread: her leaking blue-black fountain pen flooded the corner torn during the 11:35 gallery struggle. Compare notebook stock, inward tear, and her blotting glove. Alternate: corner in the gallery grate plus Celia’s carbon copy.
- `floral-perfume` thread: someone handled or emptied her gardenia atomizer to scent a glove and corridor; transfer pattern is stronger on the glove than her wrist. Alternate: atomizer bulb in the suite wastebasket and the Vocalist/Debutante comparison.
- `torn-note` thread: surviving shorthand reads “12:10,” a partial C, and the tail of “gallery”; it records an exchange, not an accusation. Alternate: Celia’s copy of the flower order and Correspondent’s copied time.
- Innocent overlay: she hid Celia’s name and moved the corner after being searched. She lies about custody, not route or murder.
- Killer overlay: she kills to keep a victim from exposing that Celia’s copy implicates her own prior bargain. She plants gardenia and uses an unpublished detail as false authority. Her cover fails when the notebook tear predates the claimed private interval.
- Personal endings: **Source, Not Sacrifice** (alliance; sanitized copy and testimony); **Everything in Print** (truth seized, trust lost); **Held for Morning** (publication deferred); **Merciful Bonfire** (source safe, broad paper trail narrowed); **No Comment** (locked, artifacts reroute the case).

### Retired Surgeon — “The Unrevised Record”

- Public mask: exacting retired clinician who insists observation is not speculation.
- Private need: make one honest record after years of living beneath a falsified surgical chart.
- Secret: revised an old operation note after an exhausted error; the Host used the original to demand a dubious competency letter.
- Vulnerability: professional disgrace and fear of harming a coerced patient by naming them.
- Relationships: helps the Curator distinguish washes; respects the Accountant’s chain of custody; disputes the Antiquarian’s material identifications; treated one guest privately in the Library.
- Voice rules: period clinical vocabulary, short anatomical observations, explicit uncertainty. Never use chlorhexidine, modern diagnostic language, or impossible toxicology.
- Trust tell: states limits, times, dilutions, and hands over comparison samples.
- Pressure tell: washes hands, corrects nouns, addresses the detective as an irresponsible trainee.
- `antiseptic` thread: carbolic solution or iodine from a hurried library dressing splashed his cuff. Compare dilution, stopper fiber, and dressing. Alternate: sealed treatment instruction in the Library and laundry basin odor.
- `blade-oil` thread: one drop of light instrument oil freed his case hinge; the same batch marks the hinge and sleeve. Alternate: oil vial with measured level and instrument inventory in his pocketbook.
- `wax-resin` thread: brittle amber sealing wax from the private medical letter clings to lapel and envelope. Alternate: broken seal in the Library grate and recipient’s retained half.
- Innocent overlay: treated a shallow self-inflicted puncture and withheld the false letter. He conceals identity under confidentiality.
- Killer overlay: kills when the victim threatens to expose both chart and coercion. He exploits legitimate treatment residue to muddy provenance and gives technically true wound facts while shifting treatment time. His cover breaks on sealed-letter timing and an impossible instrument inventory.
- Personal endings: **Unrevised Record** (full testimony); **Names Under Seal** (physical chain, patient protected); **Convenient Diagnosis** (immediate lead, Host’s blackmail proof lost); **Professional Silence** (shutdown, samples survive).

### Greenhouse Curator — “The Night-Blooming Ledger”

- Public mask: patient steward who appears more comfortable with plants than people.
- Private need: protect living specimens while exposing the people who treated them as contraband and bookkeeping symbols.
- Secret: moved endangered plants through false labels and allowed a correspondent abroad to hide payment intelligence in propagation code.
- Vulnerability: seizure could kill the collection and make her care look like trafficking.
- Relationships: decodes the Accountant’s flower ledger; gave Celia access to order books; shares material expertise with Surgeon and Antiquarian; saw the Debutante follow the grit.
- Voice rules: restrained botanical metaphors grounded in real observation; plants are living responsibilities, not mystical informants.
- Trust tell: names species, lets another person hold the ledger, invites joint custody.
- Pressure tell: speaks to a plant, becomes still, rejects ownership language.
- `antiseptic` thread: period sulphur/boric plant wash kicked back from the crate sprayer onto her cuff; concentration differs from medical and motor residues. Alternate: labeled mixing card and treated crate swab.
- `fine-earth` thread: pale mineral potting mix spilled when a searched root ball was exchanged; breaks in the trail map gallery rug to study vent. Alternate: shoe/hem sample and Debutante’s heel observation.
- `torn-note` thread: onion-skin strip in the roots uses genus, bed, and bloom-time code for dates, initials, and payments, including 12:10/west bed. Alternate: propagation ledger key plus overseas cable copy.
- Innocent overlay: moved plants and message to protect both; lies about legal ownership, not the night route.
- Killer overlay: kills to recover the coded strip or stop seizure that would reveal prior smuggling. She uses grit as an obvious false association and misstates when the crate was treated. Her cover breaks where the grit trail resumes after her claimed return.
- Personal endings: **Chain of Care** (alliance and documented collection); **Uprooted Truth** (ledger seized); **Safe Transplant** (plants moved, tonight’s entry survives); **Glasshouse Closed** (shutdown, external samples reroute).

### Stage Magician — “The Honest Trick”

- Public mask: playful master of misdirection, always turning humiliation into patter.
- Private need: restore credit to the former assistant who invented his famous Mercy Box.
- Secret: the Host bought the assistant’s silence and rented the invention to him; he entered the west cabinet to retrieve the original contract and cue sheet.
- Vulnerability: exposure can end his career and reveal that his best work was appropriated.
- Relationships: understands the Vocalist’s cue timing; supplied a duplicate-key technique used by the conspiracy; recognizes the Debutante’s deliberate card loss as misdirection; resents the Columnist’s old review.
- Voice rules: concrete stagecraft under theatrical phrasing; one flourish at most; when trust rises, patter falls away.
- Trust tell: empties pockets, credits collaborators, demonstrates a mechanism openly.
- Pressure tell: palms coins faster, answers with fake applause, protects left hand/pocket.
- `black-wool` thread: hidden pocket of his performance coat snagged on the west cabinet’s brass tooth. Alternate: thread on third latch and tailor’s repair ticket.
- `face-powder` thread: ivory stage powder from a cracked compact made the floating-face illusion and transferred to concealed lamp, lapel, and card carrier. Alternate: powder-set print on ballroom switch and the Vocalist’s door.
- `blade-oil` thread: light precision oil freed the Mercy Box spring/false back; vial, thumb, and latch share it. Alternate: oiled reset pin left in the prop and rehearsal cloth.
- Innocent overlay: burgled the cabinet for authorship proof and hid the duplicate key out of shame.
- Killer overlay: kills to secure the cue sheet or prevent exposure of a prior coercive bargain. He uses timed applause or the box to manufacture false presence. His cover breaks when a cue occurs while the box could be opened externally.
- Personal endings: **Name Beneath the Name** (confession and restored credit); **Honest Reconstruction** (route demonstrated); **Secrets for Sale** (facts traded, no trust); **Curtain Without Applause** (rupture, room evidence survives).

### War Correspondent — “The Unfiled Dispatch”

- Public mask: sleepless, clipped observer who counts exits and distrusts authority.
- Private need: prove the truth without burning the source who saw the exchange.
- Secret: his source is June Bell, present under protected circumstances after the Host destroyed her livelihood.
- Vulnerability: an earlier dispatch exposed a source; he will obstruct rather than repeat it.
- Relationships: source-ethics rival of the Columnist; decodes her shorthand conventions; maps the Chauffeur’s route; hears the Vocalist’s knock code.
- Voice rules: cable economy, concrete verbs, dry understatement. No generic war similes and no omniscient “front” knowledge.
- Trust tell: puts facts on a map and separates verified from unverified.
- Pressure tell: counts exits, clips sentences to fragments, covers inside pocket.
- `ink-fiber` thread: pen pierced a blue-black draft when the gallery door slammed; saturated corner was folded around the nib. Alternate: unfinished dispatch and matching blotter fibers.
- `black-wool` thread: field coat snagged on the west passage’s third latch while he followed a figure whose limp stopped. Alternate: marked latch and coat seam comparison.
- `torn-note` thread: June’s shorthand gives time, gallery, envelope, and false limp while initials remain concealed. Alternate: his fact-only transcription and June’s coded song response.
- Innocent overlay: followed the courier, then withdrew to protect June; lies by omission about her identity.
- Killer overlay: kills because the victim can prove he bargained away an earlier source or now knows June’s location. He plants a report-like rumor and falsifies one map segment. His cover breaks against his own contemporaneous draft and source knock timing.
- Personal endings: **Byline** (signed route); **Deep Background** (source protected, corroborated facts); **Deliberate Error** (bait detail catches knower); **Source Burned** (rupture, fragments survive).

### Estate Accountant — “The Cost of a Zero”

- Public mask: dry keeper of balanced books who treats emotion as an unposted liability.
- Private need: make the figures testify so courage is not the only support for truth.
- Secret: signed false relief accounts under pressure and retained enough records to restore the fraud.
- Vulnerability: loss of livelihood, prosecution as accomplice, and fear that a negotiated truth is still corruption.
- Relationships: authenticates the Columnist/Curator payment calendar; knows the Debutante’s trust account was siphoned; inventories objects the Antiquarian handles; distrusts the Host’s legal men.
- Voice rules: use ledger language sparingly and precisely; figures before judgments; resentment appears as understatement.
- Trust tell: makes copies, initials corrections, admits his own signature.
- Pressure tell: recounts silver, corrects amounts, closes ledger physically.
- `ink-fiber` thread: split nib flooded the altered zero and he tore the saturated margin. Alternate: edge-fit to ledger plus carbon audit copy.
- `metal-polish` thread: he tested a candlestick polished only where prints would be; residue transferred to glove and ledger cuff. Alternate: inventory order and unexposed-base comparison.
- `blade-oil` thread: adding-machine carriage oil migrated to fingers and ledger clasp. Alternate: machine rail, vial, and dated repair notation.
- Innocent overlay: preserved the fraudulent line while pretending to complete the Host’s alteration.
- Killer overlay: kills to stop exposure of his signed complicity or to seize the only clean copy. He moves a polished object to stage the scene and shifts one ledger time. His cover breaks because machine jam and ink flood have a fixed order.
- Personal endings: **Signed Audit** (full testimony); **Marked Pages** (counter-trap); **Private Settlement** (names for protection); **Account Foreclosed** (book secured, interpreter lost).

### Jazz Vocalist — “Four Bars Missing”

- Public mask: self-possessed performer who reads mood and speaks in rhythm.
- Private need: protect June Bell while refusing to let the code that once kept women safe become the Host’s weapon.
- Secret: knows the requested-song code and recognized the false third verse before the exchange.
- Vulnerability: outing June, losing work through scandal, and having gardenia/powder used to construct a gendered false trail.
- Relationships: trusts the Correspondent with source protocol; understands the Magician’s cueing; compares atomizers with Columnist/Debutante; the Host once controlled her bookings.
- Voice rules: lyrical cadence without parody; period club vocabulary; terms such as “sugar” only when deflecting or comforting. Facts sharpen when trust rises.
- Trust tell: stops humming, repeats exact rests, agrees to perform a test.
- Pressure tell: hums the wrong phrase, folds arms over music case, goes deliberately quiet.
- `floral-perfume` thread: gardenia was poured onto her scarf to lay a route she never walked. Alternate: over-wet scarf fibers and atomizer volume comparison.
- `face-powder` thread: card carrier pressed into spilled ivory powder and left the same seam-print on dressing-room door. Alternate: request card print and ballroom switch dust.
- `wax-resin` thread: amber performance grip wax in her music case holds a brass-key impression. Alternate: chipped wax cake and key-tooth rubbing retained in sheet music.
- Innocent overlay: withholds June’s identity but offers a repeatable musical sting.
- Killer overlay: kills to prevent June or another witness exposing her coerced role in past exchanges. She uses the song to trigger movement and a scented scarf as false presence. Her cover breaks when she reacts to the answering knocks before the public cue.
- Personal endings: **Answering Knock** (sting); **Second Voice** (allied testimony); **Protected Verse** (code supplied, June withheld); **No Encore** (walkout, artifacts survive).

### Antiquarian — “The Saint with Two Birthdays”

- Public mask: fussy provenance expert who treats objects more gently than people.
- Private need: correct a fraudulent authentication without sacrificing the frightened patron coerced into commissioning it.
- Secret: helped Lady Vale authenticate a false reliquary; its modern hinge concealed a Blue Case compartment.
- Vulnerability: professional disgrace and the loss of the collection he believes he protects.
- Relationships: debates material origins with Surgeon/Curator; inventories with Accountant; identifies the Magician’s key work; knows the Chauffeur was excluded from formal access.
- Voice rules: provenance first, one historical aside maximum, no invented occult history. Objects supply evidence, not prophecy.
- Trust tell: permits handling, states his own role, authenticates publicly.
- Pressure tell: apologizes to objects, becomes pedantic, corrects catalog terms.
- `fine-earth` thread: pale pumice-like packing dust fell from the reliquary’s false base and tracked to the west panel. Alternate: cabinet recess sample and Debutante/Curator comparison.
- `metal-polish` thread: waxy brass polish tested the new hinge and streaked his split glove/catalog card. Alternate: missing card recovered near passage and polish tin composition.
- `wax-resin` thread: fresh restoration resin lifted veneer; his cake differs in age from older passage flecks. Alternate: reliquary lip sample and workbench batch.
- Innocent overlay: concealed patron and forgery, then tried to preserve chain of custody.
- Killer overlay: kills when the victim can prove he knowingly serviced the Blue Case compartment. He exploits his authority to misdate material and plants dust. His cover breaks under batch comparison and the modern hinge invoice.
- Personal endings: **Entered in Record** (public confession); **Private Provenance** (route, patron sealed); **Conserved Truth** (artifact custody shared); **Deaccessioned** (rupture, samples remain).

### Off-Duty Chauffeur — “The Fare That Never Arrived”

- Public mask: terse hired observer who has learned that employers confuse silence with ignorance.
- Private need: be treated as a witness with agency, not as furniture or a purchasable servant.
- Secret: accepted money to warm the Bentley for a midnight escape and kept the route rather than completing or destroying it.
- Vulnerability: class prejudice makes every work residue look incriminating and every payment look like complicity.
- Relationships: maps service access with Correspondent; recognizes Debutante’s repaired heel; carries motor materials compared by Surgeon/Curator/Accountant; distrusts the Host and respects Celia.
- Voice rules: short concrete sentences, pauses represented sparingly, mechanical comparisons only when earned.
- Trust tell: takes off cap, produces route, corrects himself onto the record.
- Pressure tell: polishes cap brim, reduces answers to nouns, calls out rank assumptions.
- `antiseptic` thread: sharp battery-cleaning/motor solvent splashed his cuff; it is not medical antiseptic. Alternate: labeled motor tin and battery corrosion sample.
- `black-wool` thread: uniform seam tore at wrist on Bentley seat; passage thread tore at an elbow and differs in weave. Alternate: tailor patch and third-latch fiber comparison.
- `metal-polish` thread: radiator-badge polish moved through a split glove to garage latch/cuff. Alternate: polish tin, badge residue, and Accountant’s candlestick comparison.
- Innocent overlay: prepared the car, recognized the gardenia envelope as bait, and refused flight.
- Killer overlay: kills to keep the fare, protect a hidden passenger, or seize the Blue Case. He stages a getaway and uses legitimate solvent. His cover breaks because the car remained in place while the service-route note records his actual return.
- Personal endings: **Seat at the Table** (testimony); **Blue Case Trap** (counter-trap); **Quiet Road** (limited route, identity withheld); **Meter Stopped** (rupture, car artifacts survive).

### Debutante — “The Girl Who Could Count”

- Public mask: breathy, underestimated young society woman who performs frivolity.
- Private need: authority over her own money, accusation, and future rather than rescue by another guardian.
- Secret: deliberately lost at cards while auditing a crooked guardian; copies of the siphoned trust account are sewn into her vanity.
- Vulnerability: adults can seize her papers, dismiss observation as fantasy, or treat her as property.
- Relationships: payment figures connect her to Accountant/Columnist; follows Curator’s grit; sees key relevant to Antiquarian/Magician/Chauffeur; shares cosmetic provenance with Vocalist.
- Voice rules: apparent naivety followed by one exact observation; no childishness; she becomes less breathy when respected.
- Trust tell: stops twisting pearls, states sums, shares one page at a time.
- Pressure tell: smiles too brightly, repeats patronizing words back, withholds names.
- `fine-earth` thread: conservatory grit entered her satin slipper as she followed a repaired left heel to the panel. Alternate: slipper packing pattern and crescent repair-nail mark.
- `floral-perfume` thread: her atomizer was emptied to fabricate corridor presence while card witnesses place her at the table. Alternate: empty bulb, scented vanity scarf, and score sheet.
- `face-powder` thread: a gloved searcher swept her compact aside; ivory dust preserved glove seams on brass latch. Alternate: vanity-lining print and shared ledger page envelope.
- Innocent overlay: hides copies and guardian identity until custody is safe; her card losses are intentional.
- Killer overlay: kills to escape guardianship or stop a victim trading her copied accounts back to the Host. She weaponizes underestimation and the prepared scented alibi. Her cover breaks on exact card-score timing and grit trapped inside rather than outside her slipper.
- Personal endings: **Her Own Account** (equal partnership); **Deliberate Loss** (ledger trap); **Controlled Disclosure** (one target exposed, upper chain sealed); **Back Under Glass** (rupture, one page survives).

## 9. Relationship tensions and cross-NPC consequences

Choices must propagate beyond the speaker.

- Protecting Celia raises Columnist and Curator trust; publicly summoning her raises paper certainty but causes staff artifacts to move into guarded custody.
- Protecting June raises Vocalist and Correspondent trust; using her as bait enables a faster sting but can end both alliances.
- Respecting the Chauffeur’s testimony makes the Debutante more willing to demand equal standing. Treating him as hired help hardens both.
- Seizing the Curator’s ledger without care gains documentary access but causes the Antiquarian to dispute custody and the Curator to withhold living-context interpretation.
- Restoring credit to the Magician’s assistant makes the Vocalist cooperate in a public reconstruction.
- Offering the Surgeon a sealed record increases Accountant willingness to sign a limited audit; threatening professional exposure can still produce residue but not expert testimony.
- Giving the Debutante control of timing unlocks the false-total trap; seizing her pages gives the Accountant raw figures but loses the clean chain above her guardian.
- Publishing a false detail with the Correspondent can reveal the person with guilty knowledge; if the Columnist has promised immediate publication, the bait is spoiled.

## 10. Whole-case ending matrix

Case outcome and epilogue disposition are separate axes. The outcome answers “what was proved or prevented?” The disposition answers “what happened to the Blue Case archive?”

### Case outcomes

- **Complete Public Exposure** — Correct killer; material, opportunity, and deception/motive proved; at least three conspiracy circuits corroborated. Murder and Host’s system become public.
- **Correct Culprit, Scandal Sealed** — Correct killer and minimum proof triad established; player suppresses or lacks enough circuit proof to expose the wider system.
- **Counter-Trap / Prevented Attack** — A coded-song, marked-ledger, Bentley, or Blue Case trap catches the killer attempting recovery or a further attack. The trap itself supplies opportunity/deception but still needs one material association.
- **Correct Suspicion Without Proof** — Player identifies the killer but lacks one leg of the triad. The culprit is watched or contained until authorities arrive, but conviction is uncertain.
- **Wrong Accusation** — Accused is innocent or proof contradicts the accusation. The real killer exploits the fracture; surviving alliances determine whether another death is prevented.
- **House of Silence / Sunrise** — No accusation or trap resolves before 6:00 AM. Survivors leave with partial truths; the Blue Case may disappear, and the murderer’s fate remains open.

### Epilogue disposition

- **Publish** — Records and testimony go to press/public authorities. Maximizes exposure, threatens sources and vulnerable collections, and improves institutional accountability only when chain of custody is strong.
- **Seal** — Murder proof is released while selected names or the broader archive remain under legal/private seal. Protects people, leaves some corrupt structures intact.
- **Destroy** — The Blue Case is burned, drowned, or otherwise rendered unusable. Can protect sources and end the Host’s leverage, but sacrifices prosecutions and restitution unless copies survive.

Every case outcome supports all three dispositions, though tone changes. Examples: Complete Exposure + Destroy means the public learns the system through distributed copies while the leverage originals are burned; Wrong Accusation + Publish spreads a damaging false account; Sunrise + Seal leaves the house’s bargains dormant rather than solved.

### Personal-ending rollup

At epilogue, select one ending per encountered character from that character’s 3–5 outcomes using trust, pressure, flags, survival, and the global disposition. Death does not erase an earned ending: render it as legacy through the named artifact/confidant. A personal alliance cannot override a wrong accusation; a rupture cannot delete already secured physical facts.

## 11. Canon maintenance rules

- New dialogue must point to this bible and the immutable evidence matrix.
- Story text may elaborate texture but may not create a new culprit-only trace, room, fixed victim, or omniscient witness.
- Preserve the motifs: 12:10 exchange, brass key, west service passage, blue dispatch case, gardenia false trail, false limp, coded song/knocks, altered ledger zero/flower payments.
- Preserve randomized killer and victims. Never write an archetype as “naturally guilty.”
- When old packs conflict, keep their emotional dilemma and concrete prop, then use the corrected chronology, period materials, knowledge guard, and fallback listed here.
