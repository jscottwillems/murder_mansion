import type { ConversationEmotion, QuestionTopic } from '../types'

export type StoryArchetype = 'antiquarian' | 'chauffeur' | 'vocalist' | 'debutante'
export type StoryEndingTone = 'alliance' | 'confession' | 'rupture' | 'misdirection'

export interface StoryCondition {
  flag?: string
  notFlag?: string
  minTrust?: number
  maxTrust?: number
}

export interface StoryChoice {
  id: string
  label: string
  response: string
  emotion: ConversationEmotion
  next: string
  trust?: number
  setFlags?: string[]
  requires?: StoryCondition[]
}

export interface StoryNode {
  id: string
  topic: QuestionTopic
  prompt: string
  opening: string
  emotion: ConversationEmotion
  choices: StoryChoice[]
}

export interface StoryEvidenceUnlock {
  evidenceId: string
  atNode: string
  requires: StoryCondition[]
  journalText: string
}

export interface StoryEnding {
  id: string
  tone: StoryEndingTone
  title: string
  text: string
  requires: StoryCondition[]
}

export interface CharacterStory {
  archetypeId: StoryArchetype
  title: string
  premise: string
  startNode: string
  nodes: StoryNode[]
  evidenceUnlocks: StoryEvidenceUnlock[]
  endings: StoryEnding[]
}

const antiquarian: CharacterStory = {
  archetypeId: 'antiquarian',
  title: 'The Saint with Two Birthdays',
  premise: 'A reliquary in the house is a forgery, but exposing it may ruin the woman who paid the antiquarian to authenticate the lie.',
  startNode: 'antiquarian-seal',
  nodes: [
    {
      id: 'antiquarian-seal', topic: 'room',
      prompt: 'You apologized to that cabinet after touching it. What did you find?',
      opening: 'A saint with two birthdays. The box is seventeenth century; the brass hinge was born last Thursday.', emotion: 'thoughtful',
      choices: [
        { id: 'respect', label: 'Show me how you know?', response: 'With clean hands. The dust under the false bottom is pumice, not age, and someone packed it in a hurry.', emotion: 'thoughtful', next: 'antiquarian-patron', trust: 1, setFlags: ['handled_with_care'] },
        { id: 'accuse', label: 'You planted the new hinge, didn’t you?', response: 'If I forged relics, detective, they would not squeak. Your accusation has less workmanship than this box.', emotion: 'angry', next: 'antiquarian-workbench', trust: -1, setFlags: ['accused_antiquarian'] },
        { id: 'bait', label: 'The owner says it is genuine.', response: 'The owner says what solvency requires. Ah. You did not know there was a debt behind the glass.', emotion: 'surprised', next: 'antiquarian-patron', setFlags: ['heard_debt'] },
      ],
    },
    {
      id: 'antiquarian-patron', topic: 'motive',
      prompt: 'Whose solvency depends on the forgery?',
      opening: 'You ask for a name as if a name were not the most breakable object in the room.', emotion: 'worried',
      choices: [
        { id: 'protect', label: 'Give me the method. Keep the name for now.', response: 'Sensibly catalogued. Warm resin lifted the veneer; wax polish disguised the new brass. Two hands did the work, only one of them mine.', emotion: 'thoughtful', next: 'antiquarian-workbench', trust: 2, setFlags: ['protected_patron', 'resin_admitted'] },
        { id: 'press', label: 'A hidden name protects a dangerous person.', response: 'It also protects a frightened one. Lady Vale commissioned the deception. She did not commission what followed.', emotion: 'angry', next: 'antiquarian-ledger', trust: -1, setFlags: ['patron_named'] },
        { id: 'offer', label: 'Help me separate the forgery from the violence.', response: 'Then we proceed as conservators: remove one lie at a time, and never pull against the grain.', emotion: 'neutral', next: 'antiquarian-workbench', trust: 1, setFlags: ['offered_partnership'] },
      ],
    },
    {
      id: 'antiquarian-workbench', topic: 'timeline',
      prompt: 'Walk me through the repair you made tonight.',
      opening: 'The veneer lifted at eleven. I warmed resin, tested the hinge, and found pale packing dust where no dust belonged.', emotion: 'neutral',
      choices: [
        { id: 'catalog', label: 'Where is your catalog card?', response: 'Missing. It bears the cabinet number and a thumb-shaped streak of brass polish. Someone feared paper more than saints.', emotion: 'worried', next: 'antiquarian-ledger', setFlags: ['catalog_missing', 'polish_handled'] },
        { id: 'crumbs', label: 'What did the resin leave behind?', response: 'Amber crumbs on my sleeve and under the reliquary lip. Mine will match the cake in my case; the older flecks in the passage will not.', emotion: 'thoughtful', next: 'antiquarian-passage', setFlags: ['resin_admitted'] },
        { id: 'dust', label: 'Who else carried the pale dust?', response: 'Someone knelt at the cabinet, then crossed the west passage. The grit records the journey more faithfully than any guest.', emotion: 'suspicious', next: 'antiquarian-passage', setFlags: ['dust_path'] },
      ],
    },
    {
      id: 'antiquarian-ledger', topic: 'pressure',
      prompt: 'Was the catalog card stolen to hide your patron or frame you?',
      opening: 'Both uses fit. Like a palimpsest, the freshest lie is written over an older shame.', emotion: 'worried',
      choices: [
        { id: 'return', label: 'If I recover it, will you authenticate it publicly?', response: 'Yes. I will trade my reputation for the truth, which is how I should have priced it at the start.', emotion: 'thoughtful', next: 'ending-antiquarian-testimony', trust: 1, setFlags: ['public_testimony'] },
        { id: 'deal', label: 'Name who took it and I will keep the forgery quiet.', response: 'A bargain that preserves the case and poisons the record. Very well: watch the guest with fresh scratches on the left cuff.', emotion: 'suspicious', next: 'ending-antiquarian-bargain', setFlags: ['accepted_bargain'] },
        { id: 'condemn', label: 'You made this possible. I’m putting that in my report.', response: 'Correct. Do spell my name properly; disgrace is unbearable when badly catalogued.', emotion: 'angry', next: 'ending-antiquarian-rupture', trust: -2, setFlags: ['condemned_antiquarian'] },
      ],
    },
    {
      id: 'antiquarian-passage', topic: 'intel',
      prompt: 'Where does the trail through the west passage end?',
      opening: 'At a landscape hung crooked to hide a servant panel. The catch is old. The gouges around it are tonight’s work.', emotion: 'suspicious',
      choices: [
        { id: 'open', label: 'Open it with me?', response: 'Gladly. History has been made to keep enough secrets.', emotion: 'surprised', next: 'ending-antiquarian-testimony', trust: 1, setFlags: ['passage_opened', 'public_testimony'] },
        { id: 'describe', label: 'Tell me how to open it; stay here.', response: 'Press the painted shepherd’s crook. I appreciate caution, though not what it implies about me.', emotion: 'neutral', next: 'ending-antiquarian-bargain', setFlags: ['passage_opened'] },
        { id: 'dismiss', label: 'A secret door is too convenient a story.', response: 'Then leave it closed and enjoy the convenience of ignorance.', emotion: 'angry', next: 'ending-antiquarian-rupture', trust: -1 },
      ],
    },
  ],
  evidenceUnlocks: [
    { evidenceId: 'fine-earth', atNode: 'antiquarian-passage', requires: [{ flag: 'dust_path' }], journalText: 'Pumice-like packing dust traces a route from the false-bottomed reliquary to the west passage.' },
    { evidenceId: 'metal-polish', atNode: 'antiquarian-ledger', requires: [{ flag: 'polish_handled' }], journalText: 'The missing catalog card carried the same waxy brass polish used during the antiquarian’s hinge test.' },
    { evidenceId: 'wax-resin', atNode: 'antiquarian-passage', requires: [{ flag: 'resin_admitted' }], journalText: 'Fresh restoration resin on the antiquarian can be compared with older amber flecks inside the hidden passage.' },
  ],
  endings: [
    { id: 'ending-antiquarian-testimony', tone: 'confession', title: 'Entered into the Record', text: 'He admits the fraudulent authentication and opens the passage, giving you a verifiable route and accepting the ruin of his reputation.', requires: [{ flag: 'public_testimony' }] },
    { id: 'ending-antiquarian-bargain', tone: 'alliance', title: 'Private Provenance', text: 'He identifies the scratched cuff and the passage, but the patron’s fraud remains your shared secret.', requires: [{ minTrust: 0 }] },
    { id: 'ending-antiquarian-rupture', tone: 'rupture', title: 'Deaccessioned', text: 'He withdraws cooperation. You keep fragments of the material trail, but lose the expert who could authenticate them.', requires: [{ maxTrust: -1 }] },
  ],
}

const chauffeur: CharacterStory = {
  archetypeId: 'chauffeur', title: 'The Fare That Never Arrived',
  premise: 'The chauffeur was paid to prepare a midnight escape, then discovered the passenger intended to leave someone else holding the blame.', startNode: 'chauffeur-engine',
  nodes: [
    { id: 'chauffeur-engine', topic: 'timeline', prompt: 'Why was the Bentley warm when the drive was flooded?', opening: 'Because somebody paid for a road that wasn’t open. Engine at eleven-forty. Luggage at eleven-fifty. Passenger never came.', emotion: 'neutral', choices: [
      { id: 'fare', label: 'Who paid the fare?', response: 'Envelope under my cap. No name. New notes, gardenia on the paper, and enough money to make questions expensive.', emotion: 'suspicious', next: 'chauffeur-envelope', trust: 1, setFlags: ['fare_admitted'] },
      { id: 'mechanical', label: 'What did you do to the engine?', response: 'Cleaned the battery bite with solvent, checked the bonnet, kept her breathing. That sharp smell is work, not mystery.', emotion: 'neutral', next: 'chauffeur-garage', setFlags: ['solvent_used'] },
      { id: 'threat', label: 'You were helping someone flee.', response: 'I was hired to drive. You want the rest, stop making the uniform do the confessing.', emotion: 'angry', next: 'chauffeur-envelope', trust: -1, setFlags: ['treated_as_servant'] },
    ] },
    { id: 'chauffeur-envelope', topic: 'motive', prompt: 'What was inside the envelope besides money?', opening: 'A route in somebody else’s handwriting and one line: “If I am late, take the blue case.” No blue case reached the car.', emotion: 'worried', choices: [
      { id: 'trust', label: 'You kept the route. May I see it?', response: 'Ask like that, yes. Service stairs to side door. Writer knew the blind turns better than the staff map does.', emotion: 'thoughtful', next: 'chauffeur-cuff', trust: 2, setFlags: ['route_shared'] },
      { id: 'leverage', label: 'Keeping it makes you an accomplice.', response: 'Burning it would. I kept it because paper remembers who gives orders.', emotion: 'angry', next: 'chauffeur-cuff', trust: -1, setFlags: ['route_shared', 'threatened_driver'] },
      { id: 'perfume', label: 'Did the scent identify your passenger?', response: 'No. It identified who wanted me thinking of a woman. Drivers learn the difference between a trail and bait.', emotion: 'suspicious', next: 'chauffeur-decoy', trust: 1, setFlags: ['saw_decoy'] },
    ] },
    { id: 'chauffeur-garage', topic: 'room', prompt: 'Could anyone else have used your motor kit?', opening: 'Tin was moved. Polish on the latch, solvent bottle on its side. Somebody borrowed the garage and left it untidy.', emotion: 'suspicious', choices: [
      { id: 'inventory', label: 'What exactly was missing?', response: 'Black wiping cloth and a length of ignition wire. Cloth came back snagged. Wire didn’t.', emotion: 'thoughtful', next: 'chauffeur-cuff', setFlags: ['garage_inventory', 'solvent_used'] },
      { id: 'polish', label: 'Why was there polish on the latch?', response: 'Same wax I used on the radiator badge. My split glove smeared it there—or somebody wearing it did.', emotion: 'worried', next: 'chauffeur-cuff', setFlags: ['polish_used'] },
      { id: 'blame', label: 'Convenient that your kit was “borrowed.”', response: 'Convenient for you. Saves listening to the hired man.', emotion: 'angry', next: 'chauffeur-decoy', trust: -2, setFlags: ['treated_as_servant'] },
    ] },
    { id: 'chauffeur-cuff', topic: 'pressure', prompt: 'Whose cuff was scratched on the service route?', opening: 'Saw only the arm. Dark wool, torn at the elbow. They shoved past like I was furniture.', emotion: 'angry', choices: [
      { id: 'compare', label: 'Let me compare the tear with your coat.', response: 'Do it. Mine split at the wrist on the Bentley seat. Different tear, different weave. Facts don’t care who pours the drinks.', emotion: 'neutral', next: 'chauffeur-decoy', trust: 1, setFlags: ['coat_compared'] },
      { id: 'name', label: 'You know more than an arm. Give me the name.', response: 'I know the step: left heel drags until nobody watches. I can point out the walker; I won’t invent a face.', emotion: 'suspicious', next: 'chauffeur-decoy', setFlags: ['gait_shared'] },
      { id: 'buy', label: 'Was silence part of your fare?', response: 'It was. Here’s your answer anyway: I’m done being purchased by people who forget I can hear them.', emotion: 'angry', next: 'ending-chauffeur-witness', trust: 1, setFlags: ['driver_testifies', 'gait_shared'] },
    ] },
    { id: 'chauffeur-decoy', topic: 'intel', prompt: 'Was the midnight escape real or staged?', opening: 'Staged. Car pointed at the gate so everyone would picture flight. The useful road was the service corridor behind us.', emotion: 'thoughtful', choices: [
      { id: 'testify', label: 'Say that before the whole room?', response: 'Give me a chair at the table, not a place by the door. Then yes.', emotion: 'neutral', next: 'ending-chauffeur-witness', trust: 1, setFlags: ['driver_testifies'] },
      { id: 'quiet', label: 'Help me set a trap and keep your name out of it?', response: 'Park the Bentley under the porte-cochère. Whoever comes for the blue case will find us waiting.', emotion: 'thoughtful', next: 'ending-chauffeur-trap', setFlags: ['set_car_trap'] },
      { id: 'reject', label: 'Or you invented a passenger to cover yourself.', response: 'Then solve it without my eyes. Plenty have tried living that way.', emotion: 'angry', next: 'ending-chauffeur-silence', trust: -2, setFlags: ['driver_silenced'] },
    ] },
  ],
  evidenceUnlocks: [
    { evidenceId: 'antiseptic', atNode: 'chauffeur-garage', requires: [{ flag: 'solvent_used' }], journalText: 'The chauffeur’s battery solvent leaves the same sharp, clean family of residue as the scene trace.' },
    { evidenceId: 'black-wool', atNode: 'chauffeur-decoy', requires: [{ flag: 'coat_compared' }], journalText: 'His uniform tear is at the wrist; the service-route fiber came from a different dark-wool tear at the elbow.' },
    { evidenceId: 'metal-polish', atNode: 'chauffeur-cuff', requires: [{ flag: 'polish_used' }], journalText: 'Radiator polish transferred from the chauffeur’s split glove to the garage latch and cuff.' },
  ],
  endings: [
    { id: 'ending-chauffeur-witness', tone: 'alliance', title: 'A Seat at the Table', text: 'Treated as a witness rather than furniture, he gives the room, route, and distinctive false limp on the record.', requires: [{ flag: 'driver_testifies' }] },
    { id: 'ending-chauffeur-trap', tone: 'misdirection', title: 'The Blue Case', text: 'You turn the staged escape around and wait beside the Bentley for whoever believes the decoy still works.', requires: [{ flag: 'set_car_trap' }] },
    { id: 'ending-chauffeur-silence', tone: 'rupture', title: 'Meter Stopped', text: 'He decides you hear rank before facts. The engine, envelope, and missing wire remain disconnected pieces.', requires: [{ flag: 'driver_silenced' }, { maxTrust: -1 }] },
  ],
}

const vocalist: CharacterStory = {
  archetypeId: 'vocalist', title: 'Four Bars Missing',
  premise: 'The vocalist heard a coded exchange hidden inside a requested song, but admitting it exposes the singer who taught her the code.', startNode: 'vocalist-request',
  nodes: [
    { id: 'vocalist-request', topic: 'social', prompt: 'Why did you stop halfway through your last song?', opening: 'Because someone requested verse three. There is no verse three—not on any record sold in this country.', emotion: 'suspicious', choices: [
      { id: 'listen', label: 'What did they want you to hear?', response: 'Four wrong words: window, midnight, blue, alone. Not lyrics. Instructions wearing a melody.', emotion: 'thoughtful', next: 'vocalist-code', trust: 1, setFlags: ['code_heard'] },
      { id: 'performer', label: 'You forgot the words and covered it well.', response: 'Honey, I have forgotten better rooms than this one, but never a lyric that could get somebody hurt.', emotion: 'angry', next: 'vocalist-dressing', trust: -1 },
      { id: 'requester', label: 'Who made the request?', response: 'A folded card came through three hands. The last hand wore ivory powder and shook on the downbeat.', emotion: 'worried', next: 'vocalist-dressing', setFlags: ['powder_hand'] },
    ] },
    { id: 'vocalist-code', topic: 'connection', prompt: 'Who taught you that songs could carry instructions?', opening: 'A woman named June Bell, when club owners listened at keyholes. She vanished after crossing one man in this house.', emotion: 'worried', choices: [
      { id: 'gentle', label: 'I need the code, not her history.', response: 'Then count rests, not notes. The pauses spell a route: ballroom, west hall, stairs. June always left herself an exit.', emotion: 'thoughtful', next: 'vocalist-dressing', trust: 2, setFlags: ['route_decoded', 'june_protected'] },
      { id: 'identity', label: 'Is June here under another name?', response: 'You push like a bad accompanist. Yes—and if I name her too soon, you turn a witness into bait.', emotion: 'angry', next: 'vocalist-bargain', trust: -1, setFlags: ['june_present'] },
      { id: 'hum', label: 'Sing the rests back to me.', response: 'Clever. Hear that gap after “blue”? Somebody in the side hall answered it with two knocks.', emotion: 'surprised', next: 'vocalist-bargain', setFlags: ['route_decoded', 'knocks_heard'] },
    ] },
    { id: 'vocalist-dressing', topic: 'room', prompt: 'What happened in the dressing room before the request?', opening: 'My compact broke, my perfume leaked, and somebody searched my music case. A complete little disaster in three scents.', emotion: 'neutral', choices: [
      { id: 'compact', label: 'Who touched the broken compact?', response: 'The card carrier. Pressed a thumb into the ivory spill, then left the same print on my door.', emotion: 'suspicious', next: 'vocalist-bargain', setFlags: ['powder_hand'] },
      { id: 'perfume', label: 'Was the leaking atomizer an accident?', response: 'No. Gardenia was poured onto my scarf to make a trail that sang my name without using it.', emotion: 'angry', next: 'vocalist-bargain', setFlags: ['perfume_frame'] },
      { id: 'case', label: 'What did they take from the music case?', response: 'Nothing. They left something: a chip of my grip wax wrapped around a brass key impression.', emotion: 'surprised', next: 'vocalist-bargain', setFlags: ['wax_key'] },
    ] },
    { id: 'vocalist-bargain', topic: 'pressure', prompt: 'Give me the final name, and I can protect June.', opening: 'Protection is a tune everyone claims to know until the bill arrives.', emotion: 'worried', choices: [
      { id: 'proof', label: 'Then give me a test, not a name.', response: 'Play the opening chord in the ballroom. The card writer will answer with two knocks, expecting the west door unlocked.', emotion: 'thoughtful', next: 'ending-vocalist-sting', trust: 1, setFlags: ['musical_sting'] },
      { id: 'promise', label: 'June chooses when she speaks. You have my word.', response: 'Then you have mine. I’ll sing the coded verse again and watch who moves before “midnight.”', emotion: 'neutral', next: 'ending-vocalist-duet', trust: 2, setFlags: ['june_protected', 'singer_testifies'] },
      { id: 'force', label: 'Name her now, or I expose the code myself.', response: 'Then you can conduct your own funeral march. This set is over.', emotion: 'angry', next: 'ending-vocalist-walkout', trust: -2, setFlags: ['singer_walks'] },
    ] },
  ],
  evidenceUnlocks: [
    { evidenceId: 'floral-perfume', atNode: 'vocalist-bargain', requires: [{ flag: 'perfume_frame' }], journalText: 'Gardenia was deliberately poured on the vocalist’s scarf to lay a false route through the house.' },
    { evidenceId: 'face-powder', atNode: 'vocalist-bargain', requires: [{ flag: 'powder_hand' }], journalText: 'A powder-set thumbprint links the request card carrier to the vocalist’s dressing-room door.' },
    { evidenceId: 'wax-resin', atNode: 'vocalist-bargain', requires: [{ flag: 'wax_key' }], journalText: 'Performance wax from the music case holds a usable impression of a brass key.' },
  ],
  endings: [
    { id: 'ending-vocalist-sting', tone: 'misdirection', title: 'The Answering Knock', text: 'You use the coded chord to draw the conspirator to the west door without forcing June into the open.', requires: [{ flag: 'musical_sting' }] },
    { id: 'ending-vocalist-duet', tone: 'alliance', title: 'Second Voice', text: 'The vocalist repeats the false verse while you watch the room; the person who moves early identifies themself.', requires: [{ flag: 'singer_testifies' }, { flag: 'june_protected' }] },
    { id: 'ending-vocalist-walkout', tone: 'rupture', title: 'No Encore', text: 'She protects June by ending the interview. The coded route survives in your notes, but its living witness is gone.', requires: [{ flag: 'singer_walks' }] },
  ],
}

const debutante: CharacterStory = {
  archetypeId: 'debutante', title: 'The Girl Who Could Not Count',
  premise: 'The debutante has cultivated an empty-headed reputation to audit a crooked guardian; tonight someone realized she can read every ledger in the house.', startNode: 'debutante-cards',
  nodes: [
    { id: 'debutante-cards', topic: 'intel', prompt: 'You lost every hand at cards. Why watch the key exchange instead?', opening: 'Because losing six pounds made them stop guarding six thousand. Men become wonderfully legible when they feel superior.', emotion: 'neutral', choices: [
      { id: 'admire', label: 'What else did they let you see?', response: 'A brass key changed pockets, and a ledger total was whispered as if I could not add. I can add.', emotion: 'thoughtful', next: 'debutante-ledger', trust: 1, setFlags: ['respected_strategy', 'key_seen'] },
      { id: 'mock', label: 'Or you lost because you cannot play.', response: 'Perfect. Keep believing that, and perhaps I can investigate you too.', emotion: 'angry', next: 'debutante-vanity', trust: -1, setFlags: ['underestimated_again'] },
      { id: 'key', label: 'Describe the person who took the brass key.', response: 'Left coat pocket, careful manicure, dust on one knee. I watched the details while everyone watched me blush.', emotion: 'suspicious', next: 'debutante-conservatory', setFlags: ['key_seen', 'dust_knee'] },
    ] },
    { id: 'debutante-ledger', topic: 'motive', prompt: 'Whose six thousand pounds were they hiding?', opening: 'Mine. My guardian calls it an allowance account. It is actually a siphon with excellent penmanship.', emotion: 'worried', choices: [
      { id: 'copies', label: 'Do you have proof?', response: 'Copies inside my vanity lining. Dates, sums, and the charming little initials that disappear in the real ledger.', emotion: 'thoughtful', next: 'debutante-vanity', trust: 2, setFlags: ['ledger_copies'] },
      { id: 'suspect', label: 'That gives you a strong motive yourself.', response: 'At last, a serious objection. Yes. It also gave someone reason to search my rooms before I could speak.', emotion: 'suspicious', next: 'debutante-vanity', trust: -1, setFlags: ['motive_acknowledged'] },
      { id: 'guardian', label: 'Name your guardian.', response: 'Not until the copies are safe. I will not trade the only leverage I own for your expression of concern.', emotion: 'angry', next: 'debutante-conservatory', setFlags: ['guardian_withheld'] },
    ] },
    { id: 'debutante-vanity', topic: 'room', prompt: 'What did the searcher disturb in your room?', opening: 'Everything they assumed mattered: perfume, pearls, powder. They never found the arithmetic sewn under the mirror.', emotion: 'neutral', choices: [
      { id: 'powder', label: 'How did your compact break?', response: 'A gloved hand swept it aside. Ivory dust caught in the glove seams and printed the brass vanity latch.', emotion: 'suspicious', next: 'debutante-conservatory', setFlags: ['powder_print'] },
      { id: 'perfume', label: 'Why was the atomizer emptied?', response: 'To make my corridor smell occupied while I was at cards. A scented alibi prepared without my permission.', emotion: 'angry', next: 'debutante-conservatory', setFlags: ['scented_alibi'] },
      { id: 'copies', label: 'Let me secure the ledger copies.', response: 'You may secure one page. I keep the rest until I know whether you see a witness or a ward.', emotion: 'thoughtful', next: 'debutante-choice', trust: 1, setFlags: ['ledger_page_shared'] },
    ] },
    { id: 'debutante-conservatory', topic: 'timeline', prompt: 'Why did you cross the conservatory after the card game?', opening: 'I followed the dusty knee. A broken pot had spilled pale grit; their shoes carried it to the west hall, and mine carried it back.', emotion: 'worried', choices: [
      { id: 'follow', label: 'Where did the trail stop?', response: 'At the locked panel. The brass key opened it. I saw a blue case inside before someone turned the lamp out.', emotion: 'surprised', next: 'debutante-choice', setFlags: ['dust_trail', 'blue_case_seen'] },
      { id: 'shoe', label: 'Can you distinguish their grit from yours?', response: 'Mine packed inside a satin slipper. Theirs lodged in a left heel with a crescent-shaped repair nail.', emotion: 'thoughtful', next: 'debutante-choice', setFlags: ['dust_trail', 'heel_mark'] },
      { id: 'reckless', label: 'Following alone was reckless.', response: 'Yes. So is waiting politely for guardians to return stolen futures.', emotion: 'angry', next: 'debutante-choice', trust: -1, setFlags: ['scolded'] },
    ] },
    { id: 'debutante-choice', topic: 'pressure', prompt: 'What do you want in exchange for the copies?', opening: 'Not rescue. Authority. Let me decide whether my guardian is arrested, exposed, or used to catch the hand above his.', emotion: 'thoughtful', choices: [
      { id: 'partner', label: 'You choose the moment. We build the case together.', response: 'Good. I was beginning to fear competence was another thing I would have to pretend not to possess.', emotion: 'neutral', next: 'ending-debutante-partner', trust: 2, setFlags: ['equal_partner', 'ledger_released'] },
      { id: 'trap', label: 'Feed him one false total and watch who comes for it?', response: 'Now you are learning cards. I will lose the page carelessly; you watch who thinks they have won.', emotion: 'surprised', next: 'ending-debutante-trap', setFlags: ['ledger_trap'] },
      { id: 'seize', label: 'This is evidence. Hand over every page.', response: 'There it is—the same voice, merely wearing a badge. You may keep the page I gave you. Nothing else.', emotion: 'angry', next: 'ending-debutante-ward', trust: -2, setFlags: ['treated_as_ward'] },
    ] },
  ],
  evidenceUnlocks: [
    { evidenceId: 'fine-earth', atNode: 'debutante-choice', requires: [{ flag: 'dust_trail' }], journalText: 'Pale conservatory grit marks both the debutante’s return path and a repaired left heel leading to the hidden panel.' },
    { evidenceId: 'floral-perfume', atNode: 'debutante-conservatory', requires: [{ flag: 'scented_alibi' }], journalText: 'Her gardenia atomizer was emptied to fabricate her presence in a corridor while she played cards.' },
    { evidenceId: 'face-powder', atNode: 'debutante-choice', requires: [{ flag: 'powder_print' }], journalText: 'Ivory powder preserves a gloved seam pattern on the vanity latch after the search.' },
  ],
  endings: [
    { id: 'ending-debutante-partner', tone: 'alliance', title: 'Her Own Account', text: 'She releases the copied ledger and joins the investigation on equal terms, retaining control of the accusation.', requires: [{ flag: 'equal_partner' }, { flag: 'ledger_released' }] },
    { id: 'ending-debutante-trap', tone: 'misdirection', title: 'A Deliberate Loss', text: 'A false ledger page becomes bait. The person who steals it reveals the chain above her guardian.', requires: [{ flag: 'ledger_trap' }] },
    { id: 'ending-debutante-ward', tone: 'rupture', title: 'Back Under Glass', text: 'Treated as property once more, she withholds the full ledger. You retain one useful page and lose her strategy.', requires: [{ flag: 'treated_as_ward' }] },
  ],
}

export const STORY_PACK_C: Record<StoryArchetype, CharacterStory> = {
  antiquarian,
  chauffeur,
  vocalist,
  debutante,
}
