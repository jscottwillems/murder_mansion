import { AUTHORED_DIALOGUE_BY_ARCHETYPE, type RevealMechanism } from '../authoredDialogue'
import { ARCHETYPES, BUILTIN_EVIDENCE_HINTS, EVIDENCE_BY_ID } from '../data'
import { CLOSINGS_BY_ROUTE } from '../dialogue/closings'
import { PERSONAL_ASIDES_BY_ARCHETYPE } from '../dialogue/personalAsides'
import { c, pa, r, rep, s, type AuthoredClosing, type AuthoredDialogueChoice, type AuthoredDialogueRoute, type PersonalAside } from '../dialogue/types'
import { EVIDENCE_IDS, type ArchetypeId, type EvidenceId, type QuestionTopic } from '../types'
import type {
  ArchetypeDossier,
  CarrierDefinition,
  EvidenceThreadDefinition,
  NarrativeThread,
  PersonalEndingDefinition,
  StoryChoice,
  StoryNode,
  ThreadClosing,
  VoiceCard,
} from './types'

/** How many rapport threads each archetype exposes before evidence unlocks. */
const REGULAR_THREAD_COUNT = 3

/**
 * Size of each archetype's personal-aside pool. Once evidence threads appear,
 * the interview menu is topped up with a seed-shuffled subset of these so it
 * always offers at least a handful of options and the personal filler differs
 * every run.
 */
const PERSONAL_ASIDE_COUNT = 4

/** Round-robin topics for synthesized rapport threads that lack authored text. */
const REGULAR_TOPICS: QuestionTopic[] = ['intel', 'social', 'connection']

const GLOBAL_BANS = [
  'generic exposition', 'omniscience', 'game mechanics', 'archetype-as-guilt',
  'chlorhexidine', 'quaternary disinfectant', 'DNA', 'CCTV', 'internet',
]

/** Default reveal-choice label when a route does not author its own. */
function defaultRevealLabel(mechanism: RevealMechanism | undefined, evidenceId: string): string {
  switch (mechanism) {
    case 'comparison': return 'Hold it against the comparison sample'
    case 'reconstruction': return 'Have them reconstruct exactly how it happened'
    case 'contradiction': return 'Pin the claim that cannot be true'
    case 'corroboration': return 'Confirm it against the other account'
    case 'bait': return 'Set the false detail and watch the reaction'
    case 'chronology': return 'Fix the trace against the clock'
    case 'custody': return 'Trace who handled it, and when'
    case undefined: return `Record the ${evidenceId} association`
    default: return `Record the ${evidenceId} association`
  }
}

/** A distinct terminal line reused from an already-authored branch response. */
function reuseClosing(choice: AuthoredDialogueChoice): ThreadClosing {
  return { line: choice.response, emotion: choice.emotion }
}

/** Promote an authored closing (when present) to a runtime ThreadClosing. */
function authoredClosing(closing: AuthoredClosing | undefined): ThreadClosing | undefined {
  if (!closing) return undefined
  return { line: closing.line, emotion: closing.emotion, ...(closing.summary ? { summary: closing.summary } : {}) }
}

/**
 * Tolerant no-reveal wrap-up for routes a writers' room has not yet authored.
 * Synthesized routes have no bespoke `noReveal`, so this keeps the untied path
 * playable: the guest's innocent account holds and the trace clears them.
 */
function genericNoRevealClosing(evidenceId: EvidenceId): ThreadClosing {
  const trace = EVIDENCE_BY_ID[evidenceId].label.toLocaleLowerCase()
  return {
    line: `Compare it as long as you like—the ${trace} was never mine to leave there. You will have to look elsewhere.`,
    emotion: 'neutral',
  }
}

interface DossierSeed {
  id: ArchetypeId
  title: string
  mask: string
  need: string
  secret: string
  vulnerability: string
  relationships: ArchetypeId[]
  voice: [string, string, string]
  trustTell: string
  pressureTell: string
  innocent: string
  killer: string
  endingTitles: string[]
}

const DOSSIER_SEEDS: DossierSeed[] = [
  {
    id: 'columnist', title: 'The Paragraph That Never Ran',
    mask: 'An amused social predator who turns danger into copy.',
    need: 'Protect Celia and preserve the value of her courage.',
    secret: 'She came to expose the Host and has suppressed stories to protect powerless sources.',
    vulnerability: 'Her missing notebook leaf resembles extortion.',
    relationships: ['correspondent', 'accountant', 'debutante', 'vocalist'],
    voice: ['Compact epigrams with one precise social image.', 'Drop endearments; give dates and paper custody.', 'Over-polish jokes and attack method.'],
    trustTell: 'Stops saying “darling” and permits paper custody.',
    pressureTell: 'Grips the notebook and attacks the detective’s taste.',
    innocent: 'Conceals Celia and custody, never her route.', killer: 'Uses cool false authority and only the stable supplied cover.',
    endingTitles: ['Source, Not Sacrifice', 'Everything in Print', 'Held for Morning', 'Merciful Bonfire', 'No Comment'],
  },
  {
    id: 'surgeon', title: 'The Unrevised Record',
    mask: 'An exacting clinician who separates observation from speculation.',
    need: 'Make one honest record after years beneath a falsified chart.',
    secret: 'He revised an operation note after an exhausted error.',
    vulnerability: 'Disgrace and harm to a coerced patient.',
    relationships: ['curator', 'accountant', 'antiquarian'],
    voice: ['Short clinical observations with explicit uncertainty.', 'State limits, times, and dilutions.', 'Correct nouns and address an irresponsible trainee.'],
    trustTell: 'Offers exact limits and comparison samples.', pressureTell: 'Washes his hands and corrects nouns.',
    innocent: 'Protects patient identity under confidentiality.', killer: 'May shift treatment timing only when the stable cover says so.',
    endingTitles: ['Unrevised Record', 'Names Under Seal', 'Convenient Diagnosis', 'Professional Silence'],
  },
  {
    id: 'curator', title: 'The Night-Blooming Ledger',
    mask: 'A patient steward more comfortable with plants than people.',
    need: 'Protect living specimens while exposing their use as contraband and code.',
    secret: 'She moved endangered plants under false labels and carried payment intelligence.',
    vulnerability: 'Seizure could kill the collection and recast care as trafficking.',
    relationships: ['accountant', 'columnist', 'surgeon', 'antiquarian', 'debutante'],
    voice: ['Restrained, accurate botanical metaphor.', 'Name species and invite joint custody.', 'Become still and reject ownership language.'],
    trustTell: 'Lets another person hold the ledger.', pressureTell: 'Speaks briefly to a plant and becomes still.',
    innocent: 'Conceals ownership, not the night route.', killer: 'Uses only the stored treatment time and cover.',
    endingTitles: ['Chain of Care', 'Uprooted Truth', 'Safe Transplant', 'Glasshouse Closed'],
  },
  {
    id: 'magician', title: 'The Honest Trick',
    mask: 'A playful master of misdirection who turns humiliation into patter.',
    need: 'Restore credit to the former assistant who invented the Mercy Box.',
    secret: 'He entered the west cabinet for the original contract and cue sheet.',
    vulnerability: 'Exposure ends his career and reveals appropriated work.',
    relationships: ['vocalist', 'debutante', 'columnist'],
    voice: ['Concrete stagecraft with at most one flourish.', 'Drop patter, credit collaborators, demonstrate openly.', 'Use fake applause and guard the left pocket.'],
    trustTell: 'Empties pockets and credits collaborators.', pressureTell: 'Palms coins faster and protects his left hand.',
    innocent: 'Shame concerns authorship and duplicate-key work.', killer: 'Uses only supplied cue and false-presence claims.',
    endingTitles: ['Name Beneath the Name', 'Honest Reconstruction', 'Secrets for Sale', 'Curtain Without Applause'],
  },
  {
    id: 'correspondent', title: 'The Unfiled Dispatch',
    mask: 'A sleepless observer who counts exits and distrusts authority.',
    need: 'Prove the route without burning June Bell.',
    secret: 'June is his protected source after the Host destroyed her livelihood.',
    vulnerability: 'An earlier dispatch exposed a source.',
    relationships: ['columnist', 'chauffeur', 'vocalist'],
    voice: ['Cable economy, concrete verbs, dry understatement.', 'Map facts and mark verified from unverified.', 'Use fragments and count exits.'],
    trustTell: 'Places facts on a map by confidence.', pressureTell: 'Covers his inside pocket and clips sentences.',
    innocent: 'Omits June’s identity while preserving attribution.', killer: 'Never promotes source material into eyewitness fact.',
    endingTitles: ['Byline', 'Deep Background', 'Deliberate Error', 'Source Burned'],
  },
  {
    id: 'accountant', title: 'The Cost of a Zero',
    mask: 'A dry keeper of books who treats emotion as an unposted liability.',
    need: 'Make figures testify so truth does not depend on courage.',
    secret: 'He signed false relief accounts and retained records that restore the fraud.',
    vulnerability: 'Prosecution as an accomplice and loss of livelihood.',
    relationships: ['columnist', 'curator', 'debutante', 'antiquarian', 'surgeon'],
    voice: ['Figures before judgment; sparse exact ledger language.', 'Make copies and admit the signature.', 'Correct sums and close the ledger physically.'],
    trustTell: 'Initials corrections and admits his own signature.', pressureTell: 'Recounts silver and closes the ledger.',
    innocent: 'Conceals false-account custody, not movement.', killer: 'Repeats only the stored ledger-time lie.',
    endingTitles: ['Signed Audit', 'Marked Pages', 'Private Settlement', 'Account Foreclosed'],
  },
  {
    id: 'vocalist', title: 'Four Bars Missing',
    mask: 'A self-possessed performer who reads mood and speaks in rhythm.',
    need: 'Protect June while taking the song code back from the Host.',
    secret: 'She knows the requested-song code and recognized the false third verse.',
    vulnerability: 'June’s exposure and a gendered gardenia false trail.',
    relationships: ['correspondent', 'magician', 'columnist', 'debutante'],
    voice: ['Lyrical cadence without parody.', 'Stop humming and repeat exact rests.', 'Hum the wrong phrase or go deliberately quiet.'],
    trustTell: 'Stops humming and agrees to a repeatable test.', pressureTell: 'Folds her arms over the music case.',
    innocent: 'Protects June while offering the repeatable code.', killer: 'Reacts only to packeted cues.',
    endingTitles: ['Answering Knock', 'Second Voice', 'Protected Verse', 'No Encore'],
  },
  {
    id: 'antiquarian', title: 'The Saint with Two Birthdays',
    mask: 'A provenance expert who treats objects more gently than people.',
    need: 'Correct a fraudulent authentication without sacrificing its coerced patron.',
    secret: 'He authenticated a false reliquary whose modern hinge concealed a compartment.',
    vulnerability: 'Professional disgrace and loss of the collection.',
    relationships: ['surgeon', 'curator', 'accountant', 'magician', 'chauffeur'],
    voice: ['Provenance first; one historical aside at most.', 'Permit handling and authenticate publicly.', 'Apologize to objects and become pedantic.'],
    trustTell: 'Permits handling and states his own role.', pressureTell: 'Corrects catalog terms and apologizes to objects.',
    innocent: 'Protects patron and chain of custody.', killer: 'Any dating claim must be a supplied fact.',
    endingTitles: ['Entered in Record', 'Private Provenance', 'Conserved Truth', 'Deaccessioned'],
  },
  {
    id: 'chauffeur', title: 'The Fare That Never Arrived',
    mask: 'A terse hired observer whom employers mistake for furniture.',
    need: 'Be treated as a witness with agency.',
    secret: 'He accepted money to warm the Bentley and retained the escape route.',
    vulnerability: 'Class prejudice recasts every work residue as guilt.',
    relationships: ['correspondent', 'debutante', 'accountant', 'surgeon'],
    voice: ['Short concrete sentences; pauses used sparingly.', 'Remove cap and put the route on record.', 'Reduce answers to nouns and call out rank.'],
    trustTell: 'Takes off his cap and self-corrects on record.', pressureTell: 'Polishes the cap brim and answers in nouns.',
    innocent: 'Admits warming the Bentley and refusing flight.', killer: 'Uses only the stable passenger, fare, and return cover.',
    endingTitles: ['Seat at the Table', 'Blue Case Trap', 'Quiet Road', 'Meter Stopped'],
  },
  {
    id: 'debutante', title: 'The Girl Who Could Count',
    mask: 'An underestimated young woman who performs frivolity.',
    need: 'Authority over her money, accusation, and future.',
    secret: 'She lost at cards while auditing her guardian; copies are sewn into her vanity.',
    vulnerability: 'Adults can seize her papers and dismiss her exact observations.',
    relationships: ['accountant', 'columnist', 'curator', 'antiquarian', 'magician', 'chauffeur', 'vocalist'],
    voice: ['Apparent naivety followed by one exact observation.', 'Become less breathy and share one page at a time.', 'Smile too brightly and echo patronizing words.'],
    trustTell: 'Stops twisting pearls and states exact sums.', pressureTell: 'Smiles brightly and withholds names.',
    innocent: 'Controls guardian and copy disclosure.', killer: 'Weaponizes underestimation only in tone.',
    endingTitles: ['Her Own Account', 'Deliberate Loss', 'Controlled Disclosure', 'Back Under Glass'],
  },
]

const ENDING_TEXTS: Record<ArchetypeId, string[]> = {
  columnist: [
    'She gives you Celia’s carbon copy with the maid’s name cut cleanly away, allowing the payment calendar to speak without consuming its source.',
    'The notebook and its ugly full record go forward under her byline; every name is printable, but she no longer trusts you to judge what publication will cost.',
    'She keeps the notebook buttoned inside her coat until morning and supplies one verifying date, preserving both the investigation and her choice of when to publish.',
    'Celia’s dangerous copy curls into ash, while the gallery fragment and flower-order pattern preserve a narrower trail that cannot expose the maid by itself.',
    'She closes the notebook and offers no further confidence; the gallery grate, carbon copy, and prior transcript must carry what remains of her account.',
  ],
  surgeon: [
    'He signs an unrevised statement naming his old error, the Host’s coercion, and tonight’s treatment, accepting disgrace rather than alter one more line.',
    'He releases the dressing, seal fragments, and exact treatment time while the patient’s name remains under seal, preserving proof without repeating the Host’s abuse.',
    'He identifies the coerced patient and burns the false competency letter, solving the immediate medical question at the cost of the broader blackmail record.',
    'He ends the consultation and withholds expert testimony; the measured oil vial, broken seal, and Library treatment note survive outside his silence.',
  ],
  curator: [
    'She catalogs every root, label, and sample with you before the ledger leaves the glasshouse, keeping the collection alive and its evidence in documented custody.',
    'The coded ledger is seized intact and its buyers face daylight, but she withdraws the living context that could have protected the endangered plants.',
    'The rare specimens leave under safer labels while a copy of tonight’s west-bed entry stays behind, preserving the case without sacrificing the collection.',
    'She locks the glasshouse and refuses further help; crate swabs, shoe grit, and the overseas cable keep the material route from dying with the conversation.',
  ],
  magician: [
    'He surrenders the contract strip and duplicate key after the final account restores his former assistant’s name to the Mercy Box.',
    'He rebuilds the Mercy Box in full view, proving how the concealed mechanism and west route manufactured a false presence without inventing a new fact.',
    'He trades the cue sheet’s hiding place for discretion, giving the case usable facts while turning every later confidence into a transaction.',
    'He closes coat, case, and conversation without applause; the third-latch thread, reset pin, and repair ticket preserve the honest parts of the trick.',
  ],
  correspondent: [
    'He signs the mapped route and exchange time under his own byline, putting his reputation behind the facts while June Bell remains unnamed.',
    'He gives you a corroborated route on deep background, protecting June while the draft, latch, and coded response independently support his account.',
    'He publishes one deliberate error about the envelope, and the person who corrects it reveals knowledge they could only have gained from the exchange.',
    'He burns the source relationship rather than surrender June; his unfinished dispatch and fact-only transcription survive, but he will volunteer nothing more.',
  ],
  accountant: [
    'He signs the restored audit and initials the altered zero, allowing dates and figures—not borrowed courage—to establish the payment chain.',
    'He leaves a false total on marked pages beside the misplaced candlestick, turning the ledger into a trap for whoever returns to correct it.',
    'He exchanges shell-company names and account numbers for limited protection, advancing the case while making justice acknowledge its negotiated price.',
    'The falsified book enters custody without its interpreter; carbon copies and repair notations survive, but the clean route above the shell company closes.',
  ],
  vocalist: [
    'She repeats the coded opening chord, and the conspirator who answers with two knocks exposes the west-door signal without forcing June into view.',
    'She performs the false verse again while you watch the room; the early mover supplies a second voice to the route, and June chooses her own moment to speak.',
    'She gives you the counted rests and answering-knock pattern but keeps June’s identity out of the record, preserving a testable code without sacrificing its teacher.',
    'She walks out before another name can be demanded; the marked score, scarf fibers, and wax key impression carry the tune after her silence.',
  ],
  antiquarian: [
    'He enters the false authentication under his own name and publicly opens the west panel, trading his reputation for a verifiable route and honest provenance.',
    'He authenticates the modern hinge and hidden compartment while Lady Vale’s coerced role remains sealed, separating the useful route from the patron’s shame.',
    'He shares custody of the reliquary, catalog card, and comparison batches, conserving both the object and the truth needed to interpret its alterations.',
    'He withdraws his expertise and accepts professional disgrace; cabinet dust, the hinge invoice, and resin samples remain in the record without his commentary.',
  ],
  chauffeur: [
    'Given a chair at the table, he puts the fare, service route, and false limp on the record as a witness whose agency is no longer mistaken for hired silence.',
    'He parks the Bentley beneath the porte-cochère with a decoy Blue Case, helping turn the staged escape into a watch for whoever returns to claim it.',
    'He supplies the route and return time while withholding the hidden passenger’s identity, leaving the road narrow but honest enough to test.',
    'He stops answering people who hear rank before facts; the route envelope, motor tins, and tailor patch preserve what the hired man saw.',
  ],
  debutante: [
    'She releases the copied accounts on her own schedule and joins the reconstruction as an equal, retaining authority over both her money and accusation.',
    'She loses a false ledger total deliberately, and the person who steals the bait exposes the hand above her guardian.',
    'She releases one proved target and keeps the upper chain sealed until custody is safe, exercising control rather than accepting another guardian’s rescue.',
    'Treated as property again, she withholds the full vanity cache; one shared page and the card score survive, but her strategy does not.',
  ],
}

const FALLBACKS: Record<ArchetypeId, Record<EvidenceId, string | undefined>> = {
  columnist: { 'ink-fiber': 'Gallery-grate corner and Celia’s carbon copy.', antiseptic: undefined, 'fine-earth': undefined, 'black-wool': undefined, 'metal-polish': undefined, 'floral-perfume': 'Atomizer bulb plus Vocalist/Debutante comparison.', 'face-powder': undefined, 'blade-oil': undefined, 'wax-resin': undefined, 'torn-note': 'Celia’s flower-order copy and Correspondent’s time.' },
  surgeon: { 'ink-fiber': undefined, antiseptic: 'Library treatment instruction and laundry-basin odor.', 'fine-earth': undefined, 'black-wool': undefined, 'metal-polish': undefined, 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': 'Measured oil vial and instrument inventory.', 'wax-resin': 'Broken Library seal and recipient’s retained half.', 'torn-note': undefined },
  curator: { 'ink-fiber': undefined, antiseptic: 'Labeled mixing card and treated crate swab.', 'fine-earth': 'Shoe/hem sample and Debutante’s heel observation.', 'black-wool': undefined, 'metal-polish': undefined, 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': undefined, 'wax-resin': undefined, 'torn-note': 'Propagation key and overseas cable copy.' },
  magician: { 'ink-fiber': undefined, antiseptic: undefined, 'fine-earth': undefined, 'black-wool': 'Third-latch thread and tailor repair ticket.', 'metal-polish': undefined, 'floral-perfume': undefined, 'face-powder': 'Ballroom switch print and Vocalist’s door.', 'blade-oil': 'Mercy Box reset pin and rehearsal cloth.', 'wax-resin': undefined, 'torn-note': undefined },
  correspondent: { 'ink-fiber': 'Unfinished dispatch and matching blotter fibers.', antiseptic: undefined, 'fine-earth': undefined, 'black-wool': 'Marked third latch and coat-seam comparison.', 'metal-polish': undefined, 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': undefined, 'wax-resin': undefined, 'torn-note': 'Fact-only transcription and June’s coded response.' },
  accountant: { 'ink-fiber': 'Ledger edge-fit and carbon audit copy.', antiseptic: undefined, 'fine-earth': undefined, 'black-wool': undefined, 'metal-polish': 'Inventory order and unexposed-base comparison.', 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': 'Machine rail, vial, and dated repair notation.', 'wax-resin': undefined, 'torn-note': undefined },
  vocalist: { 'ink-fiber': undefined, antiseptic: undefined, 'fine-earth': undefined, 'black-wool': undefined, 'metal-polish': undefined, 'floral-perfume': 'Over-wet scarf fibers and atomizer-volume comparison.', 'face-powder': 'Request-card print and ballroom switch dust.', 'blade-oil': undefined, 'wax-resin': 'Chipped wax cake and key-tooth rubbing.', 'torn-note': undefined },
  antiquarian: { 'ink-fiber': undefined, antiseptic: undefined, 'fine-earth': 'Cabinet recess sample and Curator/Debutante comparison.', 'black-wool': undefined, 'metal-polish': 'Missing catalog card and polish-tin composition.', 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': undefined, 'wax-resin': 'Reliquary-lip sample and workbench batch.', 'torn-note': undefined },
  chauffeur: { 'ink-fiber': undefined, antiseptic: 'Labeled motor tin and battery-corrosion sample.', 'fine-earth': undefined, 'black-wool': 'Tailor patch and third-latch fiber comparison.', 'metal-polish': 'Polish tin, badge residue, and candlestick comparison.', 'floral-perfume': undefined, 'face-powder': undefined, 'blade-oil': undefined, 'wax-resin': undefined, 'torn-note': undefined },
  debutante: { 'ink-fiber': undefined, antiseptic: undefined, 'fine-earth': 'Slipper packing and crescent repair-nail mark.', 'black-wool': undefined, 'metal-polish': undefined, 'floral-perfume': 'Empty bulb, vanity scarf, and card score sheet.', 'face-powder': 'Vanity-lining print and ledger-page envelope.', 'blade-oil': undefined, 'wax-resin': undefined, 'torn-note': undefined },
}

const STORY_NODES: Record<string, StoryNode> = {}
const STORY_THREADS: Record<string, NarrativeThread | EvidenceThreadDefinition> = {}

function endingDefinitions(seed: DossierSeed, legacyCarrierId: string): PersonalEndingDefinition[] {
  const texts = ENDING_TEXTS[seed.id]
  if (texts.length !== seed.endingTitles.length) throw new Error(`Ending text count mismatch for ${seed.id}`)
  return seed.endingTitles.map((title, index) => ({
    id: `${seed.id}:ending:${index + 1}`,
    title,
    tone: index === 0 ? 'alliance' : index === seed.endingTitles.length - 1 ? 'rupture' : index === 1 ? 'truth' : 'compromise',
    minTrust: index === 0 ? 2 : -5,
    maxPressure: index === seed.endingTitles.length - 1 ? 10 : 5,
    requiresFlags: [],
    forbidsFlags: index === 0 ? [`${seed.id}:shutdown`] : [],
    legacyCarrierId,
    text: texts[index],
  }))
}

/**
 * Serviceable, in-voice reveal thread synthesized for any archetype/evidence
 * pair that a writers' room has not yet authored. Because evidence assignment
 * shuffles every case, every archetype must be able to discuss every trace; this
 * keeps the game fully playable while bespoke prose is filled in over time.
 */
function genericEvidenceRoute(seed: DossierSeed, evidenceId: EvidenceId): AuthoredDialogueRoute {
  const evidence = EVIDENCE_BY_ID[evidenceId]
  const trace = evidence.label.toLocaleLowerCase()
  const hints = BUILTIN_EVIDENCE_HINTS[evidenceId]
  const roleName = ARCHETYPES.find(item => item.id === seed.id)?.name ?? seed.id
  return r(
    `${seed.id}-${evidenceId}`, 'room', evidenceId,
    `Is that ${trace} I notice about you?`,
    hints[0], 'neutral',
    s(
      c('Where would that have come from tonight?', hints[1] ?? 'It settled on me somewhere between the rooms; I could not tell you exactly where.', 'thoughtful'),
      c('Is that usual for someone in your position?', `Common enough for ${roleName.toLocaleLowerCase()} work. I would not read a great deal into it.`, 'neutral'),
      c('I think you are hiding where it came from.', 'Think what you like. I have given you all I intend to on it.', 'neutral'),
    ),
    s(
      c('Walk me through exactly how it settled on you?', 'If you must have the particulars, I can show you where and roughly when it caught me.', 'worried'),
      c('Could another guest have left the same trace?', 'Possibly. Half the house brushes past the very things I do.', 'suspicious'),
      c('Then the trace tells me nothing.', 'On that much, at least, we may agree.', 'neutral'),
    ),
    {
      revealMechanism: 'comparison',
      revealLabel: `Match the ${trace} against its source and record the association.`,
      bargain: c('Help me quietly and I keep it discreet?', `Decently put. I can account for the ${trace}; there is nothing sinister in it.`, 'thoughtful'),
      challenge: c('The trace already points your way — care to explain?', 'Then it points. A trace is not a verdict, detective.', 'angry'),
    },
  )
}

/** Resolve the authored reveal route for a pair, or synthesize a tolerant one. */
function resolveEvidenceRoute(seed: DossierSeed, evidenceId: EvidenceId): AuthoredDialogueRoute {
  return AUTHORED_DIALOGUE_BY_ARCHETYPE[seed.id].find(item => item.evidenceId === evidenceId)
    ?? genericEvidenceRoute(seed, evidenceId)
}

/** Synthesized rapport route used when a writers' room has not authored enough. */
function genericRegularRoute(seed: DossierSeed, index: number): AuthoredDialogueRoute {
  const roleName = ARCHETYPES.find(item => item.id === seed.id)?.name ?? seed.id
  const prompts = [
    `How did someone like you come to be under this roof tonight?`,
    `What do you make of the company you are keeping this evening?`,
    `What should I understand about you before the night runs on?`,
  ]
  const openings = [
    `${seed.mask} That is the part people meet first, at least.`,
    `A careful crowd. Everyone here is performing something, myself no less than the rest.`,
    `${seed.need} Beyond that, I am much as I appear.`,
  ]
  return r(
    `${seed.id}-regular-${index}`, REGULAR_TOPICS[index % REGULAR_TOPICS.length], undefined,
    prompts[index % prompts.length],
    openings[index % openings.length], 'thoughtful',
    s(
      c('I would rather understand you than corner you?', `Kind of you to say. ${roleName} or not, I would sooner be understood than accused.`, 'thoughtful'),
      c('What do you notice that the rest of us miss?', 'More than I say aloud. Habit of the trade.', 'neutral'),
      c('Enough. I have no time for pleasantries.', 'As you like. I did not come here to be interviewed either.', 'neutral'),
    ),
    s(
      c('Then let us keep this civil?', 'Civil suits me.', 'neutral'),
      c('Tell me one thing worth knowing?', 'One thing, then, and freely given.', 'thoughtful'),
      c('We are done here.', 'Suit yourself, detective.', 'neutral'),
    ),
  )
}

/** Up to REGULAR_THREAD_COUNT rapport routes: authored informational first. */
function resolveRegularRoutes(seed: DossierSeed): AuthoredDialogueRoute[] {
  const authored = AUTHORED_DIALOGUE_BY_ARCHETYPE[seed.id].filter(item => !item.evidenceId)
  const routes = [...authored]
  for (let index = routes.length; index < REGULAR_THREAD_COUNT; index++) {
    routes.push(genericRegularRoute(seed, index))
  }
  return routes.slice(0, REGULAR_THREAD_COUNT)
}

function evidenceStory(seed: DossierSeed, evidenceId: EvidenceId): EvidenceThreadDefinition {
  const route = resolveEvidenceRoute(seed, evidenceId)
  const closings = CLOSINGS_BY_ROUTE[route.id] ?? {}
  const threadId = `${seed.id}:evidence:${evidenceId}`
  const carrierId = `${threadId}:fallback`
  const ids = ['notice', 'context', 'test'].map(phase => `${threadId}:${phase}`)
  const choice = (
    id: string, label: string, intent: StoryChoice['intent'], nextNodeId: string | null,
    effects: StoryChoice['effects'], requires: StoryChoice['requires'] = [], closing?: ThreadClosing,
  ): StoryChoice => ({ id, label, intent, requires, nextNodeId, effects, ...(closing ? { closing } : {}) })
  const noticeChoices: StoryChoice[] = [
    choice(`${ids[0]}:analyze`, route.stages[0].advance.label, 'analyze', ids[1], [
      { kind: 'trust', target: seed.id, delta: 1 },
      { kind: 'thread-status', threadId, status: 'active' },
    ]),
  ]
  const bargainNodeId = `${threadId}:bargain`
  const challengeNodeId = `${threadId}:challenge`
  // State-relevant option: a warmer approach only appears once the detective has
  // built genuine rapport with this guest across earlier threads. It opens a
  // distinct, softer path into the same reveal.
  if (route.bargain) {
    noticeChoices.push(choice(`${ids[0]}:bargain`, route.bargain.label, 'bargain', bargainNodeId, [
      { kind: 'trust', target: seed.id, delta: 1 },
      { kind: 'thread-status', threadId, status: 'active' },
    ], [{ kind: 'trust-at-least', value: 2 }]))
    STORY_NODES[bargainNodeId] = {
      id: bargainNodeId, threadId, owner: seed.id, phase: 'context', text: route.bargain.response,
      emotion: route.bargain.emotion, fallbackCarrierIds: [carrierId], deathSafe: false,
      choices: [choice(`${bargainNodeId}:test`, route.stages[1].advance.label, 'test', ids[2], [
        { kind: 'set-flag', flag: `${threadId}:test-requested` },
      ])],
    }
  }
  // State-relevant option: a confrontational lever only surfaces once tension is
  // already high. It reaches the reveal faster but costs the relationship.
  if (route.challenge) {
    noticeChoices.push(choice(`${ids[0]}:challenge`, route.challenge.label, 'challenge', challengeNodeId, [
      { kind: 'pressure', target: seed.id, delta: 1 },
      { kind: 'thread-status', threadId, status: 'active' },
    ], [{ kind: 'pressure-at-least', value: 2 }]))
    STORY_NODES[challengeNodeId] = {
      id: challengeNodeId, threadId, owner: seed.id, phase: 'context', text: route.challenge.response,
      emotion: route.challenge.emotion, fallbackCarrierIds: [carrierId], deathSafe: false,
      choices: [choice(`${challengeNodeId}:test`, route.stages[1].advance.label, 'test', ids[2], [
        { kind: 'pressure', target: seed.id, delta: 1 },
        { kind: 'set-flag', flag: `${threadId}:test-requested` },
      ])],
    }
  }
  noticeChoices.push(
    choice(`${ids[0]}:withdraw`, 'We can return to this later.', 'withdraw', null, [
      { kind: 'thread-status', threadId, status: 'paused' },
      { kind: 'pressure', target: seed.id, delta: -1 },
    ], [], authoredClosing(closings.pause)),
    choice(`${ids[0]}:pressure`, route.stages[0].close.label, 'pressure', null, [
      { kind: 'pressure', target: seed.id, delta: 2 },
      { kind: 'thread-status', threadId, status: 'closed-personal' },
      { kind: 'queue-event', eventType: 'npc-shutdown' },
    ], [], authoredClosing(closings.shutdown) ?? reuseClosing(route.stages[0].close)),
  )
  STORY_NODES[ids[0]] = {
    id: ids[0], threadId, owner: seed.id, phase: 'notice', text: route.openingResponse,
    emotion: route.openingEmotion, fallbackCarrierIds: [carrierId], deathSafe: false,
    choices: noticeChoices,
  }
  STORY_NODES[ids[1]] = {
    id: ids[1], threadId, owner: seed.id, phase: 'context', text: route.stages[0].advance.response,
    emotion: route.stages[0].advance.emotion, fallbackCarrierIds: [carrierId], deathSafe: false,
    choices: [
      choice(`${ids[1]}:test`, route.stages[1].advance.label, 'test', ids[2], [
        { kind: 'pressure', target: seed.id, delta: 1 },
        { kind: 'set-flag', flag: `${threadId}:test-requested` },
      ]),
      choice(`${ids[1]}:rapport`, route.stages[1].stall.label, 'rapport', ids[2], [
        { kind: 'trust', target: seed.id, delta: 1 },
        { kind: 'set-flag', flag: `${threadId}:test-requested` },
      ]),
    ],
  }
  // Both terminal choices share the same label and intent so the player cannot
  // tell from the option whether this guest is tied to the trace — only the
  // guest's spoken conclusion differs. Which one is legal is decided at runtime
  // by the guest's per-case assigned evidence.
  const revealLabel = route.revealLabel ?? defaultRevealLabel(route.revealMechanism, evidenceId)
  const revealIntent: StoryChoice['intent'] = route.revealMechanism === 'contradiction' ? 'challenge' : 'test'
  STORY_NODES[ids[2]] = {
    id: ids[2], threadId, owner: seed.id, phase: 'test', text: route.stages[1].advance.response,
    emotion: route.stages[1].advance.emotion, fallbackCarrierIds: [carrierId], deathSafe: true,
    choices: [
      // Tied owners record the association. The material fact is always emitted
      // here; the opportunity (route) and deception-motive facts depend on the
      // guest's per-case shuffled evidence order, so they are emitted at runtime
      // by the reveal-evidence handler rather than baked into this node.
      choice(`${ids[2]}:record`, revealLabel, revealIntent, null, [
        { kind: 'emit-fact', factId: `${threadId}:fact`, source: 'inferred' },
        { kind: 'reveal-evidence', archetypeId: seed.id, evidenceId, factId: `${threadId}:fact` },
        { kind: 'thread-status', threadId, status: 'resolved' },
      ], [{ kind: 'assigned-evidence', value: evidenceId }], authoredClosing(closings.resolve)),
      // Untied guests reach the same investigative act, but it clears them: no
      // fact, no association, and a distinct no-reveal conclusion.
      choice(`${ids[2]}:clear`, revealLabel, revealIntent, null, [
        { kind: 'thread-status', threadId, status: 'spent' },
      ], [{ kind: 'not-assigned-evidence', value: evidenceId }], authoredClosing(closings.noReveal) ?? genericNoRevealClosing(evidenceId)),
    ],
  }
  const thread: EvidenceThreadDefinition = {
    id: threadId, owner: seed.id, kind: 'evidence', evidenceId,
    rootLabel: route.rootQuestion, topic: route.topic,
    startNodeId: ids[0], nodeIds: ids, fallbackCarrierIds: [carrierId],
    reopenFactIds: [`${threadId}:fallback-found`], revealFactId: `${threadId}:fact`,
    concreteReveal: route.stages[1].advance.response,
    revealMechanism: route.revealMechanism,
  }
  STORY_THREADS[threadId] = thread
  return thread
}

/**
 * A "get to know them" rapport thread. Its three closing stances (warm,
 * measured, hostile) move trust/pressure and score personal endings so that a
 * player who never uncovers evidence can still shape an NPC's epilogue. The
 * three threads together keep every ending reachable.
 */
function regularStory(seed: DossierSeed, route: AuthoredDialogueRoute, index: number): NarrativeThread {
  const threadId = `${seed.id}:regular:${index}`
  const nodeId = `${threadId}:notice`
  const carrierId = `${seed.id}:private:fallback`
  const endingCount = seed.endingTitles.length
  // Warm → alliance (ending 0); measured → a distinct middle ending per thread;
  // hostile → rupture (last ending).
  const warmEnding = 0
  const measuredEnding = Math.min(1 + index, Math.max(1, endingCount - 2))
  const hostileEnding = endingCount - 1
  const closings = CLOSINGS_BY_ROUTE[route.id] ?? {}
  // Each stance ends the personal thread on its own note: warm opens the guest
  // up, measured leaves things civil, hostile shuts the subject down. A bespoke
  // closing wins; otherwise the stance's already-authored response is reused so
  // no two stances share the same wrap-up.
  const closing: Array<{ label: string; intent: StoryChoice['intent']; ending: number; trust: number; pressure: number; closing: ThreadClosing }> = [
    { label: route.stages[0].advance.label, intent: 'rapport', ending: warmEnding, trust: 2, pressure: 0, closing: authoredClosing(closings.warm) ?? reuseClosing(route.stages[0].advance) },
    { label: route.stages[0].stall.label, intent: 'analyze', ending: measuredEnding, trust: 1, pressure: 0, closing: authoredClosing(closings.measured) ?? reuseClosing(route.stages[0].stall) },
    { label: route.stages[0].close.label, intent: 'pressure', ending: hostileEnding, trust: 0, pressure: 2, closing: authoredClosing(closings.hostile) ?? reuseClosing(route.stages[0].close) },
  ]
  STORY_NODES[nodeId] = {
    id: nodeId, threadId, owner: seed.id, phase: 'private', text: route.openingResponse,
    emotion: route.openingEmotion, fallbackCarrierIds: [carrierId], deathSafe: false,
    choices: closing.map((option, optionIndex) => ({
      id: `${nodeId}:choice:${optionIndex + 1}`,
      label: option.label,
      intent: option.intent,
      requires: [],
      nextNodeId: null,
      closing: option.closing,
      effects: [
        ...(option.trust ? [{ kind: 'trust' as const, target: seed.id, delta: option.trust }] : []),
        ...(option.pressure ? [{ kind: 'pressure' as const, target: seed.id, delta: option.pressure }] : []),
        { kind: 'ending-score' as const, archetypeId: seed.id, endingId: `${seed.id}:ending:${option.ending + 1}`, delta: 2 },
        { kind: 'set-flag' as const, flag: `${seed.id}:private-addressed` },
      ],
    })),
  }
  const thread: NarrativeThread = {
    id: threadId, owner: seed.id, kind: 'private-intel',
    rootLabel: route.rootQuestion, topic: route.topic, startNodeId: nodeId,
    nodeIds: [nodeId], fallbackCarrierIds: [carrierId],
    reopenFactIds: [`${seed.id}:private:corroborated`],
  }
  STORY_THREADS[threadId] = thread
  return thread
}

/** Serviceable filler aside for any archetype a writers' room has not yet fully stocked. */
function genericPersonalAside(seed: DossierSeed, index: number): PersonalAside {
  const roleName = ARCHETYPES.find(item => item.id === seed.id)?.name ?? seed.id
  const prompts = [
    'What do you do with yourself, when you are not caught up in an evening like this?',
    'How are you bearing up, with the house shut fast against the storm?',
    'Is there anyone here whose company you would actually choose?',
    'What ought I to know about you, before this long night is over?',
  ]
  const openings = [
    seed.mask,
    'Well enough. I have learned to sit still in rooms I would rather leave.',
    'A face or two. One keeps one\u2019s own counsel in company like this.',
    seed.need,
  ]
  return pa(
    `${seed.id}-aside-${index}`, REGULAR_TOPICS[index % REGULAR_TOPICS.length],
    prompts[index % prompts.length], openings[index % openings.length], 'thoughtful',
    [
      rep('I would rather understand you than corner you.', `Kind of you to say. A ${roleName.toLocaleLowerCase()} would sooner be understood than accused.`, 'thoughtful', 1),
      rep('Tell me one true thing about yourself.', 'One thing, then, freely given, and no more than that.', 'neutral'),
      rep('Never mind. I have little time for pleasantries.', 'As you like. I did not come here to be interviewed either.', 'neutral', 0, 1),
    ],
  )
}

/** Up to PERSONAL_ASIDE_COUNT asides: authored first, synthesized to fill. */
function resolvePersonalAsides(seed: DossierSeed): PersonalAside[] {
  const authored = PERSONAL_ASIDES_BY_ARCHETYPE[seed.id] ?? []
  const asides = [...authored]
  for (let index = asides.length; index < PERSONAL_ASIDE_COUNT; index++) {
    asides.push(genericPersonalAside(seed, index))
  }
  return asides.slice(0, PERSONAL_ASIDE_COUNT)
}

/**
 * A single-beat personal "aside" thread: the detective raises a personal topic,
 * the guest answers, and a chosen reply ends the exchange on a bespoke line.
 * These only move trust/pressure — they never emit facts, reveal evidence, or
 * score personal endings — so they are safe, seed-shuffled interview filler.
 */
function personalAsideStory(seed: DossierSeed, aside: PersonalAside, index: number): NarrativeThread {
  const threadId = `${seed.id}:aside:${index}`
  const nodeId = `${threadId}:notice`
  STORY_NODES[nodeId] = {
    id: nodeId, threadId, owner: seed.id, phase: 'private', text: aside.opening,
    emotion: aside.openingEmotion, fallbackCarrierIds: [], deathSafe: false,
    choices: aside.replies.map((reply, replyIndex) => ({
      id: `${nodeId}:reply:${replyIndex + 1}`,
      label: reply.label,
      intent: 'rapport' as const,
      requires: [],
      nextNodeId: null,
      closing: { line: reply.line, emotion: reply.emotion },
      effects: [
        ...(reply.trust ? [{ kind: 'trust' as const, target: seed.id, delta: reply.trust }] : []),
        ...(reply.pressure ? [{ kind: 'pressure' as const, target: seed.id, delta: reply.pressure }] : []),
      ],
    })),
  }
  const thread: NarrativeThread = {
    id: threadId, owner: seed.id, kind: 'private-intel',
    rootLabel: aside.rootQuestion, topic: aside.topic, startNodeId: nodeId,
    nodeIds: [nodeId], fallbackCarrierIds: [], reopenFactIds: [],
  }
  STORY_THREADS[threadId] = thread
  return thread
}

function dossier(seed: DossierSeed): ArchetypeDossier {
  const evidenceThreads: Partial<Record<EvidenceId, EvidenceThreadDefinition>> = {}
  const carriers: CarrierDefinition[] = []
  // Every archetype now carries a reveal thread for every trace, because
  // evidence-to-guest assignment shuffles each case.
  for (const evidenceId of EVIDENCE_IDS) {
    const thread = evidenceStory(seed, evidenceId)
    evidenceThreads[evidenceId] = thread
    carriers.push({
      id: thread.fallbackCarrierIds[0], kind: 'artifact',
      description: FALLBACKS[seed.id][evidenceId] ?? `Pre-seeded comparison artifact tying ${EVIDENCE_BY_ID[evidenceId].label.toLocaleLowerCase()} to ${seed.title}.`,
      seededRoom: seed.id === 'chauffeur' ? 'cellar' : seed.id === 'vocalist' ? 'ballroom' : seed.id === 'debutante' ? 'suite' : 'library',
      deathSafe: true, shutdownSafe: true,
    })
  }
  const regularThreads = resolveRegularRoutes(seed).map((route, index) => regularStory(seed, route, index))
  const bonusPersonalThreads = resolvePersonalAsides(seed).map((aside, index) => personalAsideStory(seed, aside, index))
  carriers.push({
    id: `${seed.id}:private:fallback`, kind: seed.id === 'columnist' ? 'confidant' : 'artifact',
    description: `Pre-seeded private/intel corroboration for ${seed.title}.`,
    confidant: seed.id === 'columnist' ? 'Celia' : seed.id === 'correspondent' || seed.id === 'vocalist' ? 'June Bell' : undefined,
    seededRoom: 'library', deathSafe: true, shutdownSafe: true,
  })
  const voice: VoiceCard = {
    version: 1, archetypeId: seed.id, roleName: ARCHETYPES.find(item => item.id === seed.id)?.name ?? seed.id,
    base: [seed.voice[0]], trust: [seed.voice[1]], pressure: [seed.voice[2]],
    innocent: [seed.innocent], killer: [seed.killer], banned: GLOBAL_BANS,
  }
  return {
    id: seed.id, title: seed.title, publicMask: seed.mask, privateNeed: seed.need,
    secret: seed.secret, vulnerability: seed.vulnerability, relationships: seed.relationships,
    voice, trustTell: seed.trustTell, pressureTell: seed.pressureTell,
    innocentOverlay: seed.innocent, killerOverlay: seed.killer,
    evidenceThreads: evidenceThreads as ArchetypeDossier['evidenceThreads'],
    regularThreads, bonusPersonalThreads, carriers, endings: endingDefinitions(seed, carriers[0].id),
  }
}

export const DOSSIERS = Object.fromEntries(DOSSIER_SEEDS.map(seed => [seed.id, dossier(seed)])) as Record<ArchetypeId, ArchetypeDossier>
export const NARRATIVE_NODES: Readonly<Record<string, StoryNode>> = STORY_NODES
export const NARRATIVE_THREADS: Readonly<Record<string, NarrativeThread | EvidenceThreadDefinition>> = STORY_THREADS

