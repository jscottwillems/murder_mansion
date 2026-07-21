/**
 * Stateful story threads for the Columnist, Surgeon, and Curator.
 *
 * This module is deliberately data-only. The current authored-dialogue runtime is
 * linear; an adapter can present available choices, apply their effects, and move
 * to `next`. Evidence IDs are the canonical IDs from data.ts.
 */

import type { ConversationEmotion, QuestionTopic } from '../types'

export type StoryArchetype = 'columnist' | 'surgeon' | 'curator'
export type StoryEndingTone = 'alliance' | 'truth' | 'compromise' | 'failure'

export interface StoryCondition {
  flag?: string
  notFlag?: string
  minTrust?: number
  maxTrust?: number
  hasEvidence?: string
  lacksEvidence?: string
}

export interface StoryEffect {
  trust?: number
  setFlags?: string[]
  clearFlags?: string[]
  unlockEvidence?: string[]
}

export interface StoryChoice {
  id: string
  label: string
  next: string
  condition?: StoryCondition
  effects?: StoryEffect
}

export interface StoryNode {
  id: string
  topic: QuestionTopic
  speakerText: string
  emotion: ConversationEmotion
  choices: StoryChoice[]
  /** Optional writer-room note; never shown to the player. */
  note?: string
}

export interface StoryEnding {
  id: string
  title: string
  tone: StoryEndingTone
  text: string
  epilogue: string
}

export interface CharacterStory {
  archetypeId: StoryArchetype
  title: string
  premise: string
  startNodeId: string
  initialTrust: number
  nodes: Record<string, StoryNode>
  endings: Record<string, StoryEnding>
}

const choice = (id: string, label: string, next: string, effects?: StoryEffect, condition?: StoryCondition): StoryChoice =>
  ({ id, label, next, effects, condition })

export const COLUMNIST_STORY: CharacterStory = {
  archetypeId: 'columnist',
  title: 'The Paragraph That Never Ran',
  premise: 'The Columnist came to expose the host, but her source is inside the house and her notebook could ruin the wrong life.',
  startNodeId: 'col-margin',
  initialTrust: 0,
  nodes: {
    'col-margin': {
      id: 'col-margin', topic: 'social', emotion: 'thoughtful',
      speakerText: 'You are staring at the missing leaf in my notebook. Good. I removed it so someone would stare at the absence instead of reading the names.',
      choices: [
        choice('notice-pressure', 'The tear runs inward. Someone ripped it out while you held the book, didn’t they?', 'col-grip', { trust: 1, setFlags: ['noticed_forced_tear'] }),
        choice('offer-discretion', 'Tell me off the record. I decide what enters the journal.', 'col-terms', { trust: 1, setFlags: ['promised_discretion'] }),
        choice('accuse-sale', 'You planned to sell the names back to their owners.', 'col-bristles', { trust: -1, setFlags: ['accused_extortion'] }),
      ],
    },
    'col-grip': {
      id: 'col-grip', topic: 'pressure', emotion: 'surprised',
      speakerText: 'A gloved hand closed over mine in the gallery. Very firm. Very frightened. The corner stayed with me; the rest went into the fire.',
      choices: [
        choice('ask-corner', 'Show me the corner. Fibers remember what people edit.', 'col-corner', { trust: 1 }),
        choice('ask-glove', 'Forget the page. What did the glove smell of?', 'col-scent', { setFlags: ['followed_scent'] }),
        choice('push-name', 'Give me the name now.', 'col-shutout', { trust: -2 }),
      ],
    },
    'col-terms': {
      id: 'col-terms', topic: 'connection', emotion: 'suspicious',
      speakerText: 'Off the record is a church with no roof. Still—my source found payments hidden as flower orders. Your host was buying silence by the bouquet.',
      choices: [
        choice('protect-source', 'I need the scheme, not your source.', 'col-ledger', { trust: 2, setFlags: ['protected_source'] }),
        choice('demand-source', 'Without a name, it is gossip.', 'col-source', { trust: -1, setFlags: ['demanded_source'] }),
        choice('trade', 'I can keep the source out if you surrender the original notes.', 'col-bargain', { trust: 1, setFlags: ['offered_trade'] }),
      ],
    },
    'col-bristles': {
      id: 'col-bristles', topic: 'motive', emotion: 'angry',
      speakerText: 'Blackmail is gossip with an invoice. I write columns. There is a difference, although this house has labored to erase it.',
      choices: [
        choice('apologize-specific', 'You’re right. The torn edge shows you tried to protect someone, not price them.', 'col-corner', { trust: 2, clearFlags: ['accused_extortion'], setFlags: ['earned_second_chance'] }),
        choice('double-down', 'Then prove the difference.', 'col-shutout', { trust: -1 }),
      ],
    },
    'col-corner': {
      id: 'col-corner', topic: 'intel', emotion: 'worried',
      speakerText: 'Three strokes remain: “twelve-ten,” a C, and the tail of a room name. The paper is cheap; the ink is mine. Do not mistake ownership for authorship.',
      choices: [
        choice('bag-fiber', 'The torn edge can be compared with the scrap from the scene.', 'col-source', { unlockEvidence: ['ink-fiber'], setFlags: ['secured_corner'] }),
        choice('read-code', 'C is a person, not a room. Your source signed the note.', 'col-source', { trust: 1, setFlags: ['decoded_initial'] }),
        choice('return-it', 'Keep it. Someone searched you once already.', 'col-source', { trust: 2, setFlags: ['returned_corner'] }),
      ],
    },
    'col-scent': {
      id: 'col-scent', topic: 'room', emotion: 'thoughtful',
      speakerText: 'Gardenia. Not a polite trace—a wet bloom of it. The hand had just handled my atomizer, or wanted me blamed by anyone with a nose.',
      choices: [
        choice('test-glove', 'Your spare glove will show whether the scent was transferred to you.', 'col-ledger', { unlockEvidence: ['floral-perfume'], setFlags: ['tested_transfer'] }),
        choice('ask-atomizer', 'Who knew where you kept the atomizer?', 'col-ledger', { trust: 1, setFlags: ['atomizer_access'] }),
        choice('mock-perfume', 'A perfume cloud is not a witness.', 'col-shutout', { trust: -1 }),
      ],
    },
    'col-ledger': {
      id: 'col-ledger', topic: 'timeline', emotion: 'thoughtful',
      speakerText: 'The flower orders form a calendar: every payment arrives the morning after a certain guest visits the study. Tonight’s order was written before dinner, then altered after the gallery quarrel.',
      choices: [
        choice('compare-shorthand', 'Let me compare the alteration with your shorthand.', 'col-bargain', { unlockEvidence: ['torn-note'], setFlags: ['proved_alteration'] }),
        choice('reconstruct', 'Read me the dates. We can reconstruct the visitor without exposing the source.', 'col-bargain', { trust: 2, setFlags: ['reconstructed_calendar'] }),
        choice('publish-threat', 'Announce what you know. Panic may shake loose the culprit.', 'col-shutout', { trust: -2, setFlags: ['threatened_publication'] }),
      ],
    },
    'col-source': {
      id: 'col-source', topic: 'connection', emotion: 'worried',
      speakerText: 'Celia, the junior housemaid. She copied the orders because one “bouquet” cost more than her family earns in a year. She believes I can make powerful people feel shame. I have not corrected her.',
      choices: [
        choice('shield-celia', 'Celia stays out of it. Give me only what she copied.', 'col-bargain', { trust: 2, setFlags: ['protected_source'] }),
        choice('summon-celia', 'She must make a statement herself.', 'col-bargain', { trust: -1, setFlags: ['exposed_source'] }),
        choice('burn-copy', 'Destroy the copy. No clue is worth handing her to them.', 'ending:col-silence', { trust: 1, setFlags: ['destroyed_copy'] }),
      ],
    },
    'col-bargain': {
      id: 'col-bargain', topic: 'follow_up', emotion: 'suspicious',
      speakerText: 'Here is the bargain: you get the column and its ugly little spine. I get your word that the maid is not the headline. Decide which promise matters more—your case or her safety.',
      choices: [
        choice('accept-clean', 'Agreed. I’ll use the pattern and keep Celia unnamed.', 'ending:col-alliance', { unlockEvidence: ['torn-note'], setFlags: ['columnist_allied'] }, { minTrust: 2 }),
        choice('take-by-authority', 'I’m taking the notes. I can’t promise how they’ll be used.', 'ending:col-truth', { unlockEvidence: ['torn-note', 'ink-fiber'], setFlags: ['notes_seized'] }),
        choice('let-her-publish', 'Keep them. Publish after we survive the night.', 'ending:col-byline', { setFlags: ['publication_promised'] }),
      ],
    },
    'col-shutout': {
      id: 'col-shutout', topic: 'pressure', emotion: 'angry',
      speakerText: 'No. You want a clean confession from a dirty room. Write this down yourself: I have nothing further for you.',
      choices: [
        choice('last-detail', 'Then only confirm the page was torn at 12:10.', 'ending:col-truth', { unlockEvidence: ['ink-fiber'] }, { flag: 'noticed_forced_tear' }),
        choice('leave', 'Keep your version.', 'ending:col-locked'),
      ],
    },
  },
  endings: {
    'col-alliance': { id: 'col-alliance', title: 'A Source, Not a Sacrifice', tone: 'alliance', text: 'She hands over a carbon copy with Celia’s name neatly cut away.', epilogue: 'The Columnist becomes a candid witness; the payment calendar enters the case without consuming its source.' },
    'col-truth': { id: 'col-truth', title: 'Everything in Print', tone: 'truth', text: 'The notebook yields its times and fibers, but not willingly.', epilogue: 'You gain hard evidence. The Columnist will answer facts and volunteer nothing.' },
    'col-byline': { id: 'col-byline', title: 'Held for the Morning Edition', tone: 'compromise', text: 'She buttons the notebook inside her coat and gives you one verifying date.', epilogue: 'The deeper scandal remains alive for a later encounter; she trusts you to make a morning possible.' },
    'col-silence': { id: 'col-silence', title: 'Merciful Bonfire', tone: 'compromise', text: 'The copied names curl black in the grate.', epilogue: 'Celia is safe and the payment trail is gone, but the Columnist remembers that you chose a person over a perfect case.' },
    'col-locked': { id: 'col-locked', title: 'No Comment', tone: 'failure', text: 'The notebook snaps shut.', epilogue: 'Her evidence remains locked unless another clue reopens the thread.' },
  },
}

export const SURGEON_STORY: CharacterStory = {
  archetypeId: 'surgeon', title: 'The Last Operation',
  premise: 'The retired Surgeon secretly treated a guest before dinner and altered the medical record to hide a career-ending mistake.',
  startNodeId: 'sur-cuff', initialTrust: 0,
  nodes: {
    'sur-cuff': { id: 'sur-cuff', topic: 'room', emotion: 'neutral', speakerText: 'The odor is chlorhexidine. If you intend to accuse me by smell, at least use the correct noun.', choices: [
      choice('observe-dilution', 'Too dilute for surgery. You cleaned a person in a hurry.', 'sur-patient', { trust: 1, setFlags: ['recognized_dilution'] }),
      choice('ask-case', 'May I inspect the instrument case?', 'sur-case', { setFlags: ['requested_case'] }),
      choice('call-blood', 'Antiseptic usually comes before blood.', 'sur-denial', { trust: -1, setFlags: ['accused_early'] }),
    ]},
    'sur-patient': { id: 'sur-patient', topic: 'victim', emotion: 'worried', speakerText: 'A guest came to me shaking, with a puncture beneath the ribs. Alive, coherent, and adamant that nobody know. I closed it in the library.', choices: [
      choice('ask-consent', 'Why did secrecy matter more than proper care?', 'sur-history', { trust: 1 }),
      choice('ask-wound', 'Describe the puncture before you describe the patient.', 'sur-wound', { setFlags: ['clinical_route'] }),
      choice('name-patient', 'Name them or I treat you as the cause.', 'sur-denial', { trust: -2 }),
    ]},
    'sur-case': { id: 'sur-case', topic: 'intel', emotion: 'suspicious', speakerText: 'You may observe it closed. One hinge was oiled tonight. Breaking the latch would contaminate everything inside and tell me what sort of investigator you are.', choices: [
      choice('inspect-hinge', 'I only need a swab from the hinge and your sleeve.', 'sur-wound', { trust: 1, unlockEvidence: ['blade-oil'], setFlags: ['respected_case'] }),
      choice('force-case', 'Open it.', 'sur-denial', { trust: -2, unlockEvidence: ['blade-oil'], setFlags: ['forced_case'] }),
      choice('inventory-memory', 'Recite the inventory. You know every slot.', 'sur-wound', { trust: 1, setFlags: ['inventory_taken'] }),
    ]},
    'sur-denial': { id: 'sur-denial', topic: 'pressure', emotion: 'angry', speakerText: 'You confuse urgency with force. I did that once on an operating table. The patient paid for it. I will not indulge the habit in you.', choices: [
      choice('own-pressure', 'Then slow me down. Start with what you regret.', 'sur-history', { trust: 2, setFlags: ['accepted_correction'] }),
      choice('use-residue', 'Your cuff can speak without your permission.', 'sur-wound', { unlockEvidence: ['antiseptic'], setFlags: ['seized_swab'] }),
      choice('threaten', 'Silence makes you obstruction, not a doctor.', 'ending:sur-board', { trust: -2 }),
    ]},
    'sur-history': { id: 'sur-history', topic: 'motive', emotion: 'thoughtful', speakerText: 'Years ago I operated while exhausted. I nicked an artery, repaired it, and revised the notes. Tonight’s patient found the original chart in our host’s safe. That chart has purchased my obedience ever since.', choices: [
      choice('separate-acts', 'Tonight’s treatment and the old falsification are separate facts. I’ll keep them separate.', 'sur-letter', { trust: 2, setFlags: ['offered_fair_record'] }),
      choice('condemn', 'You falsified a death record. Retirement was not punishment enough.', 'sur-letter', { trust: -1, setFlags: ['condemned_history'] }),
      choice('ask-blackmail', 'What did the host make you do?', 'sur-letter', { trust: 1, setFlags: ['followed_blackmail'] }),
    ]},
    'sur-wound': { id: 'sur-wound', topic: 'last_seen', emotion: 'thoughtful', speakerText: 'Narrow entry, shallow angle, no tearing. Not a knife thrust—a stiff pin or dressing tool. Amber grains adhered to the fabric. I sealed my written instructions with the same old resin.', choices: [
      choice('collect-resin', 'Give me the broken seal and the stained dressing.', 'sur-letter', { unlockEvidence: ['wax-resin', 'antiseptic'], setFlags: ['collected_dressing'] }),
      choice('infer-staged', 'Someone wanted a wound that looked worse than it was.', 'sur-letter', { trust: 1, setFlags: ['recognized_staging'] }),
      choice('infer-self', 'The angle is reachable. Your patient injured themself.', 'sur-letter', { trust: 1, setFlags: ['recognized_self_infliction'] }),
    ]},
    'sur-letter': { id: 'sur-letter', topic: 'connection', emotion: 'worried', speakerText: 'My patient stole the old chart and staged the puncture to force my help. They wanted a medical letter declaring our host unfit to manage the estate. I wrote it, then withheld it.', choices: [
      choice('ask-letter', 'Hand me the letter as evidence of the coercion.', 'sur-choice', { setFlags: ['letter_requested'] }),
      choice('ask-patient', 'Give me the patient’s name; the letter can remain sealed.', 'sur-choice', { trust: 1, setFlags: ['patient_requested'] }),
      choice('destroy', 'Destroy the false opinion in front of me.', 'sur-choice', { trust: 2, setFlags: ['letter_destroyed'] }),
    ]},
    'sur-choice': { id: 'sur-choice', topic: 'follow_up', emotion: 'suspicious', speakerText: 'There is no sterile outcome. Expose the patient and you expose my old crime. Suppress both and the host’s coercion survives unproved. Choose the injury you can live with.', choices: [
      choice('full-record', 'We document all of it—the error, the blackmail, the staged wound.', 'ending:sur-testimony', { unlockEvidence: ['antiseptic', 'wax-resin'], setFlags: ['surgeon_testifies'] }, { minTrust: 2 }),
      choice('physical-only', 'Give me the dressing and resin. Names stay sealed for now.', 'ending:sur-compromise', { unlockEvidence: ['antiseptic', 'wax-resin'], setFlags: ['medical_names_sealed'] }),
      choice('patient-only', 'Name the patient. I’ll leave the old chart out.', 'ending:sur-breach', { setFlags: ['patient_exposed'] }),
    ]},
  },
  endings: {
    'sur-testimony': { id: 'sur-testimony', title: 'The Unrevised Record', tone: 'truth', text: 'For the first time in years, the Surgeon signs a statement without changing a line.', epilogue: 'The full medical chain becomes usable evidence, and the Surgeon will testify despite the cost.' },
    'sur-compromise': { id: 'sur-compromise', title: 'Names Under Seal', tone: 'alliance', text: 'He gives you the dressing, seal fragments, and exact treatment time.', epilogue: 'You gain the physical trail while preserving leverage for a later confrontation.' },
    'sur-breach': { id: 'sur-breach', title: 'A Convenient Diagnosis', tone: 'compromise', text: 'He names the patient and burns the false letter.', epilogue: 'The immediate lead survives; proof of the host’s medical blackmail does not.' },
    'sur-board': { id: 'sur-board', title: 'Professional Silence', tone: 'failure', text: 'He asks you to leave in the voice of a man dismissing a resident.', epilogue: 'Only independently collected residue can reopen the consultation.' },
  },
}

export const CURATOR_STORY: CharacterStory = {
  archetypeId: 'curator', title: 'The Night-Blooming Ledger',
  premise: 'The Curator has been using rare plant shipments to smuggle endangered specimens—and one human message—through the estate.',
  startNodeId: 'cur-orchid', initialTrust: 0,
  nodes: {
    'cur-orchid': { id: 'cur-orchid', topic: 'room', emotion: 'worried', speakerText: 'That orchid is not sick. It is homesick. The label says Sussex; the roots still hold red earth from a valley three thousand miles away.', choices: [
      choice('notice-soil', 'And the pot beside it holds pale grit. Two plants were exchanged.', 'cur-exchange', { trust: 1, setFlags: ['noticed_exchange'] }),
      choice('ask-treatment', 'What did you spray on it?', 'cur-spray', { setFlags: ['followed_spray'] }),
      choice('dismiss-plant', 'I’m investigating people, not homesick flowers.', 'cur-thorns', { trust: -1 }),
    ]},
    'cur-exchange': { id: 'cur-exchange', topic: 'timeline', emotion: 'surprised', speakerText: 'Yes. At midnight I found the rare orchid moved and an ordinary cutting in its crate. Someone searched the root ball, poorly, then tried to restore the arrangement.', choices: [
      choice('track-grit', 'The pale mix will preserve their route through the house.', 'cur-crate', { unlockEvidence: ['fine-earth'], setFlags: ['tracked_grit'] }),
      choice('ask-hidden', 'What were they searching for?', 'cur-message', { trust: 1 }),
      choice('accuse-smuggling', 'A false label and hidden cargo make you the smuggler.', 'cur-thorns', { trust: -1, setFlags: ['accused_smuggling'] }),
    ]},
    'cur-spray': { id: 'cur-spray', topic: 'intel', emotion: 'thoughtful', speakerText: 'A quaternary wash, safe at this dilution. The nozzle kicked back across my cuff. I treated the crate, not the orchid; someone had introduced mold to hide a disturbed seal.', choices: [
      choice('take-swab', 'A cuff swab can distinguish your diluted wash from the concentrated trace.', 'cur-crate', { unlockEvidence: ['antiseptic'], setFlags: ['distinguished_wash'] }),
      choice('ask-seal', 'Who knew the crate seal mattered?', 'cur-message', { trust: 1 }),
      choice('blame-chemicals', 'Convenient that your chemicals resemble the scene trace.', 'cur-thorns', { trust: -1 }),
    ]},
    'cur-thorns': { id: 'cur-thorns', topic: 'pressure', emotion: 'angry', speakerText: 'People who say “only a plant” have filled museums with stolen forests. If you want my help, show me you can tell possession from care.', choices: [
      choice('correct-self', 'You kept it alive; that does not mean you had the right to move it. Both can be true.', 'cur-message', { trust: 2, setFlags: ['understood_stewardship'] }),
      choice('follow-footprints', 'I’ll let the soil answer ownership.', 'cur-crate', { unlockEvidence: ['fine-earth'] }),
      choice('threaten-seizure', 'Then I’ll seize the whole greenhouse.', 'ending:cur-barren', { trust: -2 }),
    ]},
    'cur-crate': { id: 'cur-crate', topic: 'last_seen', emotion: 'thoughtful', speakerText: 'The grit crosses the conservatory, breaks at the gallery rug, and resumes near the study vent. Whoever carried the root ball stopped there long enough to open it.', choices: [
      choice('reconstruct-path', 'Mark the breaks and stride length for my journal.', 'cur-message', { trust: 1, setFlags: ['mapped_route'] }),
      choice('check-note', 'A root ball is a good place to hide paper. Was there a note?', 'cur-message', { setFlags: ['anticipated_note'] }),
      choice('follow-now', 'We follow the trail now, together.', 'cur-message', { trust: 2, setFlags: ['escorted_curator'] }),
    ]},
    'cur-message': { id: 'cur-message', topic: 'connection', emotion: 'worried', speakerText: 'There was a strip of onion paper among the roots: dates, initials, and payments in my propagation code. A collector overseas used my rescue shipments to record who bought looted specimens from this house.', choices: [
      choice('decode-together', 'Teach me the code. You keep custody of the original.', 'cur-decode', { trust: 2, setFlags: ['shared_custody'] }),
      choice('take-note', 'The note comes with me.', 'cur-decode', { trust: -1, setFlags: ['note_seized'] }),
      choice('ask-destroy', 'Why not destroy it and protect the rescued plants?', 'cur-roots', { setFlags: ['considered_destruction'] }),
    ]},
    'cur-decode': { id: 'cur-decode', topic: 'follow_up', emotion: 'thoughtful', speakerText: 'The marks are not names: genus, bed, bloom time. “C. alba, twelve-ten, west bed” identifies a person only if you know where each guest stood when the clock chimed.', choices: [
      choice('use-observations', 'Your bed ledger and my timeline turn the code into a witness.', 'cur-roots', { unlockEvidence: ['torn-note'], setFlags: ['decoded_note'] }),
      choice('compare-scrap', 'The torn scrap elsewhere may complete the west-bed entry.', 'cur-roots', { unlockEvidence: ['torn-note'], setFlags: ['matched_scrap'] }),
      choice('publish-list', 'Decode every buyer. The collection should burn in daylight.', 'cur-roots', { trust: -1, setFlags: ['wants_publication'] }),
    ]},
    'cur-roots': { id: 'cur-roots', topic: 'motive', emotion: 'suspicious', speakerText: 'If authorities take the greenhouse, the living specimens become exhibits and die behind seals. If we hide the ledger, thieves keep their reputations. Justice and care have grown around each other like strangler figs.', choices: [
      choice('document-living', 'Photograph each plant in place, then submit the ledger with a care order attached.', 'ending:cur-steward', { unlockEvidence: ['fine-earth', 'torn-note'], setFlags: ['curator_allied'] }, { minTrust: 2 }),
      choice('submit-ledger', 'The buyers come first. I’ll take the original ledger now.', 'ending:cur-ledger', { unlockEvidence: ['torn-note', 'fine-earth'], setFlags: ['ledger_seized'] }),
      choice('hide-plants', 'Move the endangered specimens; leave me a copy of tonight’s entry.', 'ending:cur-transplant', { unlockEvidence: ['torn-note'], setFlags: ['plants_hidden'] }),
    ]},
  },
  endings: {
    'cur-steward': { id: 'cur-steward', title: 'Chain of Custody, Chain of Care', tone: 'alliance', text: 'Together you catalogue roots, grit, labels, and every living specimen before the ledger leaves the glasshouse.', epilogue: 'The Curator becomes an active ally; both evidence and vulnerable plants remain protected.' },
    'cur-ledger': { id: 'cur-ledger', title: 'The Uprooted Truth', tone: 'truth', text: 'The ledger enters your case intact. The Curator watches it go without saying goodbye.', epilogue: 'You gain the strongest documentary trail, but lose access to their private observations.' },
    'cur-transplant': { id: 'cur-transplant', title: 'What Survives the Search', tone: 'compromise', text: 'By dawn, several pots will have innocent labels and safer destinations.', epilogue: 'Tonight’s coded entry remains available; the larger trafficking case becomes harder to prove.' },
    'cur-barren': { id: 'cur-barren', title: 'Glasshouse Closed', tone: 'failure', text: 'The Curator locks the cabinet and pockets the key.', epilogue: 'The living collection and its paper trail remain beyond reach until independent evidence changes the balance.' },
  },
}

export const STORY_PACK_A: Record<StoryArchetype, CharacterStory> = {
  columnist: COLUMNIST_STORY,
  surgeon: SURGEON_STORY,
  curator: CURATOR_STORY,
}

/** Evaluate one choice gate against runtime-owned thread state. */
export function storyConditionMet(condition: StoryCondition | undefined, trust: number, flags: Set<string>, evidence: Set<string>): boolean {
  if (!condition) return true
  if (condition.flag && !flags.has(condition.flag)) return false
  if (condition.notFlag && flags.has(condition.notFlag)) return false
  if (condition.minTrust !== undefined && trust < condition.minTrust) return false
  if (condition.maxTrust !== undefined && trust > condition.maxTrust) return false
  if (condition.hasEvidence && !evidence.has(condition.hasEvidence)) return false
  if (condition.lacksEvidence && evidence.has(condition.lacksEvidence)) return false
  return true
}
