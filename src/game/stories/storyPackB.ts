import type { ConversationEmotion, QuestionTopic } from '../types'

/**
 * Branching story data for the Magician, Correspondent, and Accountant.
 *
 * Unlike AuthoredDialogueRoute, these threads are graphs: choices may set durable
 * facts, alter trust/pressure, unlock canonical evidence, or end the interview.
 * A future resolver can select the first eligible response variant and filter
 * choices by `when`. This module deliberately owns no runtime state.
 */
export type StoryFlag = string

export interface StoryCondition {
  all?: StoryFlag[]
  any?: StoryFlag[]
  none?: StoryFlag[]
  trustAtLeast?: number
  pressureAtLeast?: number
}

export interface StoryEffect {
  setFlags?: StoryFlag[]
  trust?: number
  pressure?: number
  unlockEvidence?: string
}

export interface StoryChoice {
  id: string
  label: string
  next: string
  when?: StoryCondition
  effects?: StoryEffect
}

export interface StoryResponse {
  text: string
  emotion: ConversationEmotion
  when?: StoryCondition
}

export interface StoryNode {
  id: string
  topic: QuestionTopic
  prompt: string
  responses: StoryResponse[]
  choices: StoryChoice[]
}

export interface StoryEnding {
  id: string
  title: string
  text: string
  emotion: ConversationEmotion
  kind: 'confidence' | 'bargain' | 'rupture' | 'exposure'
}

export interface CharacterStory {
  archetypeId: 'magician' | 'correspondent' | 'accountant'
  title: string
  premise: string
  entryNodeIds: string[]
  evidenceIds: string[]
  nodes: Record<string, StoryNode>
  endings: Record<string, StoryEnding>
}

const magician: CharacterStory = {
  archetypeId: 'magician',
  title: 'The Honest Trick',
  premise: 'A failed escape act, a stolen cue, and the humiliating truth behind a perfect alibi.',
  entryNodeIds: ['magician-coat', 'magician-rehearsal', 'magician-applause'],
  evidenceIds: ['black-wool', 'face-powder', 'blade-oil'],
  nodes: {
    'magician-coat': {
      id: 'magician-coat', topic: 'room',
      prompt: 'That coat has a fresh tear. Which door caught it?',
      responses: [{ text: 'Not a door. A cabinet in the west passage bit me while I was retrieving something the host had no intention of returning.', emotion: 'suspicious' }],
      choices: [
        { id: 'm-coat-object', label: 'What was hidden in the cabinet?', next: 'magician-contract', effects: { setFlags: ['m_admits_cabinet'], trust: 1 } },
        { id: 'm-coat-thread', label: 'Show me where the cloth tore.', next: 'magician-sleeve', effects: { pressure: 1 } },
        { id: 'm-coat-theft', label: 'So you were stealing from our host?', next: 'magician-defiance', effects: { setFlags: ['m_accused_thief'], pressure: 2, trust: -2 } },
      ],
    },
    'magician-rehearsal': {
      id: 'magician-rehearsal', topic: 'timeline',
      prompt: 'You rehearsed during dinner. What needed fixing that badly?',
      responses: [{ text: 'The Mercy Box. It frees the volunteer before the audience decides prayer would be quicker. Tonight, its spring refused to forgive me.', emotion: 'worried' }],
      choices: [
        { id: 'm-reh-spring', label: 'How did you free the spring?', next: 'magician-mechanism', effects: { setFlags: ['m_asks_method'], trust: 1 } },
        { id: 'm-reh-volunteer', label: 'Who was meant to enter the box?', next: 'magician-assistant', effects: { setFlags: ['m_asks_assistant'] } },
        { id: 'm-reh-fraud', label: 'Perhaps the trick never worked.', next: 'magician-defiance', effects: { pressure: 1, trust: -1 } },
      ],
    },
    'magician-applause': {
      id: 'magician-applause', topic: 'social',
      prompt: 'Someone applauded in the ballroom after the music stopped. Was that for you?',
      responses: [{ text: 'One pair of hands. Slow. Mocking. My former assistant used that exact rhythm whenever a trick had gone wrong.', emotion: 'angry' }],
      choices: [
        { id: 'm-app-assistant', label: 'Why is your former assistant here?', next: 'magician-assistant', effects: { trust: 1 } },
        { id: 'm-app-effect', label: 'Which trick had gone wrong?', next: 'magician-mirror', effects: { setFlags: ['m_followed_applause'] } },
        { id: 'm-app-ignore', label: 'One sarcastic clap hardly matters.', next: 'ending:magician-curtain', effects: { trust: -2 } },
      ],
    },
    'magician-sleeve': {
      id: 'magician-sleeve', topic: 'room',
      prompt: 'The tear runs from the hidden pocket, not the cuff.',
      responses: [{ text: 'Excellent eye. The pocket held my duplicate key and, briefly, a strip of contract. I pulled away too hard; black wool stayed on the brass tooth.', emotion: 'thoughtful' }],
      choices: [
        { id: 'm-sleeve-contract', label: 'Why tear up your own contract?', next: 'magician-contract', effects: { unlockEvidence: 'black-wool', setFlags: ['m_found_wool'], trust: 1 } },
        { id: 'm-sleeve-key', label: 'What does the duplicate key open?', next: 'magician-mechanism', effects: { unlockEvidence: 'black-wool', setFlags: ['m_found_wool', 'm_knows_key'], pressure: 1 } },
        { id: 'm-sleeve-seize', label: 'I am taking the coat.', next: 'ending:magician-curtain', effects: { unlockEvidence: 'black-wool', pressure: 2, trust: -2 } },
      ],
    },
    'magician-mechanism': {
      id: 'magician-mechanism', topic: 'timeline',
      prompt: 'Talk me through the jammed mechanism.',
      responses: [
        { text: 'You noticed the duplicate key. It resets the false back; the spring still needed one drop from my precision-oil vial.', emotion: 'worried', when: { all: ['m_knows_key'] } },
        { text: 'A sewing pin to lift the catch, then one drop from my precision-oil vial. The excess found my thumb and, from there, nearly everything.', emotion: 'thoughtful' },
      ],
      choices: [
        { id: 'm-mech-cuff', label: 'Where did you wipe your thumb?', next: 'magician-assistant', effects: { unlockEvidence: 'blade-oil', setFlags: ['m_found_oil'], trust: 1 } },
        { id: 'm-mech-test', label: 'Let me test the mechanism myself.', next: 'magician-contract', effects: { unlockEvidence: 'blade-oil', setFlags: ['m_found_oil', 'm_respected_craft'], trust: 2 } },
        { id: 'm-mech-weapon', label: 'A spring blade makes a convenient weapon.', next: 'magician-defiance', effects: { unlockEvidence: 'blade-oil', pressure: 2, trust: -2 } },
      ],
    },
    'magician-mirror': {
      id: 'magician-mirror', topic: 'social',
      prompt: 'What was the mirror effect supposed to show?',
      responses: [{ text: 'My face floating in darkness. Ivory powder catches the concealed lamp; the cracked compact made half the ballroom look consumptive.', emotion: 'surprised' }],
      choices: [
        { id: 'm-mirror-table', label: 'Which surfaces did the powder reach?', next: 'magician-contract', effects: { unlockEvidence: 'face-powder', setFlags: ['m_found_powder'], trust: 1 } },
        { id: 'm-mirror-switch', label: 'Who operated the concealed lamp?', next: 'magician-assistant', effects: { unlockEvidence: 'face-powder', setFlags: ['m_found_powder', 'm_asks_assistant'] } },
        { id: 'm-mirror-vanity', label: 'All this trouble for vanity?', next: 'magician-defiance', effects: { unlockEvidence: 'face-powder', trust: -2, pressure: 1 } },
      ],
    },
    'magician-assistant': {
      id: 'magician-assistant', topic: 'connection',
      prompt: 'What did your former assistant take from the act?',
      responses: [{ text: 'My applause, my savings, and the only copy of a cue sheet proving the Mercy Box can be opened from outside. Tonight, the host offered to sell it back.', emotion: 'angry' }],
      choices: [
        { id: 'm-asst-believe', label: 'You came for the cue sheet, not revenge.', next: 'magician-contract', effects: { setFlags: ['m_offered_belief'], trust: 2 } },
        { id: 'm-asst-trap', label: 'Whoever has that sheet could frame you neatly.', next: 'magician-contract', effects: { setFlags: ['m_sees_frame'], trust: 1 } },
        { id: 'm-asst-threat', label: 'Hand over the key or I expose the burglary.', next: 'ending:magician-bargain', effects: { pressure: 3, trust: -2 } },
      ],
    },
    'magician-contract': {
      id: 'magician-contract', topic: 'motive',
      prompt: 'What is on the torn contract strip?',
      responses: [
        { text: 'The clause that names my former assistant as inventor. You gave me room to say it plainly: my famous escape was never mine.', emotion: 'worried', when: { trustAtLeast: 2 } },
        { text: 'A name beneath mine in smaller type. The host bought that person’s silence and rented me the credit.', emotion: 'suspicious' },
      ],
      choices: [
        { id: 'm-con-public', label: 'Give me the strip and I will put the right name on the trick.', next: 'ending:magician-confession', effects: { setFlags: ['m_restores_credit'], trust: 2 }, when: { trustAtLeast: 1 } },
        { id: 'm-con-stage', label: 'Help me stage a reconstruction using the box.', next: 'ending:magician-reconstruction', effects: { setFlags: ['m_reconstruction'], trust: 1 }, when: { any: ['m_found_oil', 'm_knows_key'] } },
        { id: 'm-con-leverage', label: 'Your secret buys your freedom. What will you trade?', next: 'ending:magician-bargain', effects: { pressure: 2 } },
      ],
    },
    'magician-defiance': {
      id: 'magician-defiance', topic: 'pressure',
      prompt: 'You keep turning questions into patter.',
      responses: [{ text: 'Because patter is what stands between a performer and a room full of people delighted to see him fail.', emotion: 'angry' }],
      choices: [
        { id: 'm-def-soften', label: 'Then stop performing. Tell me what failure costs you.', next: 'magician-contract', effects: { trust: 2, pressure: -1 } },
        { id: 'm-def-proof', label: 'I care about the mechanism, not your reputation.', next: 'magician-mechanism', effects: { trust: 1 } },
        { id: 'm-def-break', label: 'Keep the act. I have enough to search your things.', next: 'ending:magician-curtain', effects: { pressure: 2, trust: -2 } },
      ],
    },
  },
  endings: {
    'magician-confession': { id: 'magician-confession', title: 'The Name Beneath the Name', kind: 'confidence', emotion: 'thoughtful', text: 'He surrenders the contract strip and the duplicate key. In return, you promise the final account will credit the assistant who built the impossible box.' },
    'magician-reconstruction': { id: 'magician-reconstruction', title: 'The Honest Trick', kind: 'exposure', emotion: 'surprised', text: 'He resets the Mercy Box in full view. The reconstruction exposes both the concealed route and the person who knew when its latch would be open.' },
    'magician-bargain': { id: 'magician-bargain', title: 'Secrets for Sale', kind: 'bargain', emotion: 'suspicious', text: 'Cornered, he trades the cue sheet’s hiding place for discretion. You gain facts, but he will never again volunteer a truth.' },
    'magician-curtain': { id: 'magician-curtain', title: 'Curtain Without Applause', kind: 'rupture', emotion: 'angry', text: 'He closes the coat, the case, and the conversation. Anything more will have to come from the room rather than the man.' },
  },
}

const correspondent: CharacterStory = {
  archetypeId: 'correspondent',
  title: 'The Unfiled Dispatch',
  premise: 'A source asked to be erased from the record; the reporter must decide whether protecting them still serves the truth.',
  entryNodeIds: ['correspondent-copy', 'correspondent-coat', 'correspondent-source'],
  evidenceIds: ['ink-fiber', 'black-wool', 'torn-note'],
  nodes: {
    'correspondent-copy': {
      id: 'correspondent-copy', topic: 'timeline', prompt: 'Your draft ends in the middle of a sentence. What stopped you?',
      responses: [{ text: 'A source knocked twice. Wrong rhythm. Frightened people forget codes. I put the pen through the page when the west door slammed.', emotion: 'suspicious' }],
      choices: [
        { id: 'c-copy-page', label: 'What did you do with the spoiled page?', next: 'correspondent-draft', effects: { setFlags: ['c_asks_page'], trust: 1 } },
        { id: 'c-copy-source', label: 'What frightened your source?', next: 'correspondent-source', effects: { setFlags: ['c_asks_source'] } },
        { id: 'c-copy-seize', label: 'Give me the whole notebook.', next: 'correspondent-standoff', effects: { pressure: 2, trust: -2 } },
      ],
    },
    'correspondent-coat': {
      id: 'correspondent-coat', topic: 'room', prompt: 'Why keep a field coat on in a heated house?',
      responses: [{ text: 'Pockets stay where I left them. Also, the side passage is cold enough to preserve meat and narrow enough to eat a sleeve.', emotion: 'neutral' }],
      choices: [
        { id: 'c-coat-seam', label: 'Show me the damaged sleeve.', next: 'correspondent-passage', effects: { pressure: 1 } },
        { id: 'c-coat-pockets', label: 'Which pocket holds the source notes?', next: 'correspondent-standoff', effects: { setFlags: ['c_guessed_notes'], pressure: 1 } },
        { id: 'c-coat-exits', label: 'Which exit were you preparing to use?', next: 'correspondent-map', effects: { trust: 1 } },
      ],
    },
    'correspondent-source': {
      id: 'correspondent-source', topic: 'connection', prompt: 'You keep checking that inside pocket. What are you protecting?',
      responses: [{ text: 'A source. They feared not being disbelieved, but being believed by the wrong person. They saw an envelope change hands after the argument and wrote the time for me.', emotion: 'worried' }],
      choices: [
        { id: 'c-source-protect', label: 'Keep the name. Give me something I can verify.', next: 'correspondent-shorthand', effects: { setFlags: ['c_respects_source'], trust: 2 } },
        { id: 'c-source-envelope', label: 'Describe the envelope instead.', next: 'correspondent-map', effects: { trust: 1 } },
        { id: 'c-source-name', label: 'Name them now, or I treat you as an accomplice.', next: 'correspondent-standoff', effects: { pressure: 3, trust: -3 } },
      ],
    },
    'correspondent-draft': {
      id: 'correspondent-draft', topic: 'timeline', prompt: 'The missing corner was saturated with ink, wasn’t it?',
      responses: [{ text: 'Blue-black. Tore it off, folded it around the nib, forgot it in the wrong pocket. Sloppy. Put that in the obituary for my standards.', emotion: 'thoughtful' }],
      choices: [
        { id: 'c-draft-pocket', label: 'Which pocket was the wrong one?', next: 'correspondent-passage', effects: { unlockEvidence: 'ink-fiber', setFlags: ['c_found_ink'], trust: 1 } },
        { id: 'c-draft-compare', label: 'Let me compare the paper with the scene fragment.', next: 'correspondent-shorthand', effects: { unlockEvidence: 'ink-fiber', setFlags: ['c_found_ink', 'c_shared_copy'], trust: 2 } },
        { id: 'c-draft-accuse', label: 'A convenient explanation for paper found where it should not be.', next: 'correspondent-standoff', effects: { unlockEvidence: 'ink-fiber', pressure: 2, trust: -1 } },
      ],
    },
    'correspondent-passage': {
      id: 'correspondent-passage', topic: 'room', prompt: 'Where did the passage catch your coat?',
      responses: [{ text: 'Third latch from the gallery. I went through sideways; old black wool stayed behind. I was following someone who had stopped limping.', emotion: 'suspicious' }],
      choices: [
        { id: 'c-pass-thread', label: 'Mark the exact latch on my map.', next: 'correspondent-map', effects: { unlockEvidence: 'black-wool', setFlags: ['c_found_wool'], trust: 1 } },
        { id: 'c-pass-limp', label: 'Why did the limp matter?', next: 'correspondent-map', effects: { unlockEvidence: 'black-wool', setFlags: ['c_found_wool', 'c_fake_limp'] } },
        { id: 'c-pass-coward', label: 'You followed, then did nothing?', next: 'correspondent-standoff', effects: { unlockEvidence: 'black-wool', trust: -2, pressure: 1 } },
      ],
    },
    'correspondent-shorthand': {
      id: 'correspondent-shorthand', topic: 'intel', prompt: 'Show me the source’s notation without showing me the name.',
      responses: [
        { text: 'Fair terms. Time, gallery, envelope, false limp. The initials remain under my thumb.', emotion: 'thoughtful', when: { all: ['c_respects_source'] } },
        { text: 'A cramped line: time, room, transaction. Read the facts. Leave the initials alone.', emotion: 'suspicious' },
      ],
      choices: [
        { id: 'c-short-copy', label: 'I will copy only the time and room.', next: 'correspondent-map', effects: { unlockEvidence: 'torn-note', setFlags: ['c_found_note', 'c_kept_terms'], trust: 2 } },
        { id: 'c-short-edge', label: 'The torn edge can identify the missing half.', next: 'correspondent-map', effects: { unlockEvidence: 'torn-note', setFlags: ['c_found_note'], pressure: 1 } },
        { id: 'c-short-grab', label: 'Move your thumb.', next: 'correspondent-standoff', effects: { unlockEvidence: 'torn-note', pressure: 3, trust: -3 } },
      ],
    },
    'correspondent-map': {
      id: 'correspondent-map', topic: 'intel', prompt: 'Put your sightings on the floor plan.',
      responses: [
        { text: 'Ink says the meeting began here. Wool says I followed through here. Your map says the limping figure doubled back before anyone reached the stairs.', emotion: 'surprised', when: { all: ['c_found_ink', 'c_found_wool'] } },
        { text: 'Source at the gallery. Envelope through the passage. A staged limp between them. That route avoids every occupied room.', emotion: 'thoughtful', when: { all: ['c_fake_limp'] } },
        { text: 'Gallery to passage, then a blind turn by the stairs. Useful route. Bad view. Worse witness.', emotion: 'neutral' },
      ],
      choices: [
        { id: 'c-map-record', label: 'File this as a signed statement.', next: 'ending:correspondent-on-record', effects: { trust: 1 }, when: { trustAtLeast: 2 } },
        { id: 'c-map-source', label: 'Keep the source off record; I can prove the route another way.', next: 'ending:correspondent-protected', effects: { trust: 2 }, when: { any: ['c_found_note', 'c_found_wool'] } },
        { id: 'c-map-bait', label: 'Print a false detail and watch who tries to correct it.', next: 'ending:correspondent-bait', effects: { setFlags: ['c_plants_detail'] } },
      ],
    },
    'correspondent-standoff': {
      id: 'correspondent-standoff', topic: 'pressure', prompt: 'You are obstructing an investigation.',
      responses: [{ text: 'I have watched authorities call a firing squad an investigation. Bring facts, not volume.', emotion: 'angry' }],
      choices: [
        { id: 'c-stand-terms', label: 'Your source stays unnamed if their facts survive scrutiny.', next: 'correspondent-shorthand', effects: { setFlags: ['c_respects_source'], trust: 3, pressure: -1 } },
        { id: 'c-stand-map', label: 'No names. Just draw the route you followed.', next: 'correspondent-map', effects: { trust: 1 } },
        { id: 'c-stand-end', label: 'Then I will search your room without your help.', next: 'ending:correspondent-burned', effects: { pressure: 2, trust: -3 } },
      ],
    },
  },
  endings: {
    'correspondent-on-record': { id: 'correspondent-on-record', title: 'Byline', kind: 'confidence', emotion: 'thoughtful', text: 'The correspondent signs the route and time, staking a career on the account. The source remains a blank space—for now.' },
    'correspondent-protected': { id: 'correspondent-protected', title: 'Deep Background', kind: 'bargain', emotion: 'neutral', text: 'You preserve the source and gain a verifiable route through the house. The correspondent becomes a cautious ally instead of a captive witness.' },
    'correspondent-bait': { id: 'correspondent-bait', title: 'The Deliberate Error', kind: 'exposure', emotion: 'suspicious', text: 'A false color is added to the envelope’s description. Only someone who saw it will know enough to object.' },
    'correspondent-burned': { id: 'correspondent-burned', title: 'Source Burned', kind: 'rupture', emotion: 'angry', text: 'The notebook closes. You may still recover its fragments, but no reporter in the house will mistake you for a safe listener.' },
  },
}

const accountant: CharacterStory = {
  archetypeId: 'accountant',
  title: 'The Cost of a Zero',
  premise: 'A false charitable account hides a payoff, while one erased zero threatens the accountant’s livelihood and conscience.',
  entryNodeIds: ['accountant-ledger', 'accountant-silver', 'accountant-machine'],
  evidenceIds: ['ink-fiber', 'metal-polish', 'blade-oil'],
  nodes: {
    'accountant-ledger': {
      id: 'accountant-ledger', topic: 'motive', prompt: 'Why does the relief fund have two totals?',
      responses: [{ text: 'Because one is arithmetic and the other is what the family wished the arithmetic to say. There is a zero between them worth more than this house.', emotion: 'angry' }],
      choices: [
        { id: 'a-ledger-zero', label: 'Who ordered the extra zero?', next: 'accountant-payoff', effects: { pressure: 1 } },
        { id: 'a-ledger-paper', label: 'Why is the correction torn out?', next: 'accountant-margin', effects: { trust: 1 } },
        { id: 'a-ledger-complicit', label: 'You signed it, so the fraud is yours.', next: 'accountant-audit', effects: { pressure: 2, trust: -2, setFlags: ['a_accused'] } },
      ],
    },
    'accountant-silver': {
      id: 'accountant-silver', topic: 'room', prompt: 'You counted the silver twice. What changed?',
      responses: [{ text: 'A candlestick returned to the wrong place, newly bright at the base and still dull above it. Someone polished only where fingerprints would be.', emotion: 'suspicious' }],
      choices: [
        { id: 'a-silver-test', label: 'How did you test the fresh polish?', next: 'accountant-candlestick', effects: { trust: 1 } },
        { id: 'a-silver-list', label: 'Who knew your inventory order?', next: 'accountant-payoff', effects: { setFlags: ['a_inventory_leak'] } },
        { id: 'a-silver-trivial', label: 'A misplaced candlestick is hardly a crime.', next: 'accountant-audit', effects: { trust: -1 } },
      ],
    },
    'accountant-machine': {
      id: 'accountant-machine', topic: 'timeline', prompt: 'Your adding machine jammed on one particular account. Coincidence?',
      responses: [{ text: 'No. I struck the same key until the carriage locked. Rage is expensive; replacement parts are not deductible.', emotion: 'angry' }],
      choices: [
        { id: 'a-mach-repair', label: 'How did you repair the carriage?', next: 'accountant-oil', effects: { trust: 1 } },
        { id: 'a-mach-account', label: 'Which account made you lose your temper?', next: 'accountant-payoff', effects: { pressure: 1 } },
        { id: 'a-mach-damage', label: 'You destroy records when they inconvenience you?', next: 'accountant-audit', effects: { trust: -2, pressure: 1 } },
      ],
    },
    'accountant-margin': {
      id: 'accountant-margin', topic: 'timeline', prompt: 'What happened to the missing ledger margin?',
      responses: [{ text: 'The nib split when someone entered behind me. Blue-black ink flooded the altered zero. I tore off the strip before it could stain the facing page.', emotion: 'worried' }],
      choices: [
        { id: 'a-margin-blotter', label: 'Where did you leave the saturated strip?', next: 'accountant-payoff', effects: { unlockEvidence: 'ink-fiber', setFlags: ['a_found_ink'], trust: 1 } },
        { id: 'a-margin-fit', label: 'The torn edge can be fitted back into the ledger.', next: 'accountant-audit', effects: { unlockEvidence: 'ink-fiber', setFlags: ['a_found_ink', 'a_can_restore'], pressure: 1 } },
        { id: 'a-margin-hide', label: 'You removed the one part that implicated you.', next: 'accountant-audit', effects: { unlockEvidence: 'ink-fiber', pressure: 2, trust: -2 } },
      ],
    },
    'accountant-candlestick': {
      id: 'accountant-candlestick', topic: 'room', prompt: 'How did the candlestick prove it had been moved?',
      responses: [{ text: 'I touched waxy polish to an unexposed patch. It matched the fresh smear underneath. My glove took the rest; an occupational indignity.', emotion: 'thoughtful' }],
      choices: [
        { id: 'a-candle-glove', label: 'Let me compare the residue on your glove.', next: 'accountant-payoff', effects: { unlockEvidence: 'metal-polish', setFlags: ['a_found_polish'], trust: 2 } },
        { id: 'a-candle-base', label: 'What was concealed beneath the base?', next: 'accountant-payoff', effects: { unlockEvidence: 'metal-polish', setFlags: ['a_found_polish', 'a_found_receipt'], pressure: 1 } },
        { id: 'a-candle-seize', label: 'I will take the glove and the inventory.', next: 'accountant-audit', effects: { unlockEvidence: 'metal-polish', trust: -2, pressure: 2 } },
      ],
    },
    'accountant-oil': {
      id: 'accountant-oil', topic: 'timeline', prompt: 'What did the repair require?',
      responses: [{ text: 'One drop of machine oil on the carriage rail. It migrated to my fingers, then the ledger clasp. Lubrication has no respect for categories.', emotion: 'thoughtful' }],
      choices: [
        { id: 'a-oil-vial', label: 'Show me the vial and the stained clasp.', next: 'accountant-payoff', effects: { unlockEvidence: 'blade-oil', setFlags: ['a_found_oil'], trust: 1 } },
        { id: 'a-oil-timing', label: 'Did the machine jam before or after the altered entry?', next: 'accountant-margin', effects: { unlockEvidence: 'blade-oil', setFlags: ['a_found_oil', 'a_timing_link'], pressure: 1 } },
        { id: 'a-oil-excuse', label: 'Convenient that so many devices use the same oil.', next: 'accountant-audit', effects: { unlockEvidence: 'blade-oil', trust: -1 } },
      ],
    },
    'accountant-payoff': {
      id: 'accountant-payoff', topic: 'motive', prompt: 'Where did the false relief money actually go?',
      responses: [
        { text: 'The receipt under the candlestick names a shell company. The same amount appears in my ledger, minus its charitable halo.', emotion: 'surprised', when: { all: ['a_found_receipt'] } },
        { text: 'A shell company owned by someone at this gathering. I kept the transfer line because figures are less obedient than employers.', emotion: 'worried' },
      ],
      choices: [
        { id: 'a-pay-copy', label: 'Make a clean copy before the ledger disappears.', next: 'accountant-audit', effects: { setFlags: ['a_copy_made'], trust: 2 } },
        { id: 'a-pay-follow', label: 'Follow the payment through the household accounts.', next: 'accountant-audit', effects: { setFlags: ['a_money_trail'], trust: 1 } },
        { id: 'a-pay-threat', label: 'You kept this quiet to protect your position.', next: 'accountant-audit', effects: { setFlags: ['a_accused'], pressure: 2, trust: -2 } },
      ],
    },
    'accountant-audit': {
      id: 'accountant-audit', topic: 'pressure', prompt: 'What outcome are you balancing for yourself?',
      responses: [
        { text: 'If the restored margin and copy agree, I can testify without asking anyone to trust my courage. Sensible. Almost affordable.', emotion: 'thoughtful', when: { all: ['a_can_restore', 'a_copy_made'] } },
        { text: 'Employment against complicity. Reputation against the figures. Every column closes; people are where the remainder hides.', emotion: 'worried' },
      ],
      choices: [
        { id: 'a-audit-testify', label: 'Sign the audit and let the numbers accuse whom they accuse.', next: 'ending:accountant-testimony', effects: { trust: 2 }, when: { any: ['a_copy_made', 'a_can_restore', 'a_money_trail'] } },
        { id: 'a-audit-trap', label: 'Leave the altered ledger out and mark the page edges.', next: 'ending:accountant-trap', effects: { setFlags: ['a_sets_trap'] }, when: { any: ['a_found_polish', 'a_inventory_leak'] } },
        { id: 'a-audit-immunity', label: 'Trade me the shell company for protection.', next: 'ending:accountant-settlement', effects: { pressure: 2 } },
        { id: 'a-audit-charge', label: 'You falsified the account. The rest can wait.', next: 'ending:accountant-foreclosed', effects: { pressure: 3, trust: -3 } },
      ],
    },
  },
  endings: {
    'accountant-testimony': { id: 'accountant-testimony', title: 'The Signed Audit', kind: 'confidence', emotion: 'thoughtful', text: 'The accountant signs every page and initials the restored zero. The money trail becomes testimony instead of rumor.' },
    'accountant-trap': { id: 'accountant-trap', title: 'Marked Pages', kind: 'exposure', emotion: 'suspicious', text: 'The altered ledger is left temptingly unattended. Powdered page edges and a deliberately misplaced candlestick will identify whoever returns for it.' },
    'accountant-settlement': { id: 'accountant-settlement', title: 'A Private Settlement', kind: 'bargain', emotion: 'neutral', text: 'Names and account numbers change hands under limited protection. The case advances, though justice now carries a negotiated fee.' },
    'accountant-foreclosed': { id: 'accountant-foreclosed', title: 'Account Closed Early', kind: 'rupture', emotion: 'angry', text: 'You secure the falsified book but lose its interpreter. The shell company remains three tidy entries away from a living name.' },
  },
}

export const STORY_PACK_B = {
  magician,
  correspondent,
  accountant,
} satisfies Record<CharacterStory['archetypeId'], CharacterStory>

export const STORY_PACK_B_ARCHETYPES = Object.keys(STORY_PACK_B) as CharacterStory['archetypeId'][]
