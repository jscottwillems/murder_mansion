// Static game data: rooms, archetypes, names, dialogue voices
import type { RoomId } from './types'

export interface RoomDef {
  id: RoomId
  name: string
  brief: string
  col: number
  row: number
  floor: number
  wall: number
  accent: number
  lightColor: number
  lightIntensity: number
}

export const ROOMS: RoomDef[] = [
  { id: 'study', name: 'Study', brief: 'Pipe smoke lingers beneath the amber light.', col: 0, row: 0, floor: 0x4a3527, wall: 0x2c2018, accent: 0x8a6a3a, lightColor: 0xffb45e, lightIntensity: 1.15 },
  { id: 'gallery', name: 'Gallery', brief: 'Cold light washes across the formal walls.', col: 1, row: 0, floor: 0x3a3f4a, wall: 0x23262e, accent: 0xb08d3e, lightColor: 0xcfd8ff, lightIntensity: 0.95 },
  { id: 'conservatory', name: 'Conservatory', brief: 'Rain hammers the glass through the green gloom.', col: 2, row: 0, floor: 0x2e4432, wall: 0x1c2a20, accent: 0x5e8a4a, lightColor: 0x9fe8b0, lightIntensity: 0.9 },
  { id: 'kitchen', name: 'Kitchen', brief: 'Warm light catches on worn quarry tile.', col: 0, row: 1, floor: 0x55504a, wall: 0x33302c, accent: 0xb5723a, lightColor: 0xffc98a, lightIntensity: 1.05 },
  { id: 'dining', name: 'Dining Hall', brief: 'The herringbone floor waits beneath a tense hush.', col: 1, row: 1, floor: 0x4c2f33, wall: 0x2e1d20, accent: 0xc9a227, lightColor: 0xffd27a, lightIntensity: 1.25 },
  { id: 'ballroom', name: 'Ballroom', brief: 'An empty dance floor gleams in violet light.', col: 2, row: 1, floor: 0x54486a, wall: 0x322b42, accent: 0xd6c9f0, lightColor: 0xe8dcff, lightIntensity: 1.2 },
  { id: 'cellar', name: 'Cellar', brief: 'Mildew hangs in the air with sounds that might be rats.', col: 0, row: 2, floor: 0x3d3a35, wall: 0x242220, accent: 0x6a5a40, lightColor: 0xff9a4a, lightIntensity: 0.6 },
  { id: 'library', name: 'Library', brief: 'Amber pools of light break the surrounding dark.', col: 1, row: 2, floor: 0x43302a, wall: 0x291d19, accent: 0x9a7a4a, lightColor: 0xffc06a, lightIntensity: 1.0 },
  { id: 'suite', name: 'Master Suite', brief: 'Perfume lingers against velvet-dark walls.', col: 2, row: 2, floor: 0x5a2f3d, wall: 0x381e28, accent: 0xd98a9a, lightColor: 0xffb0a0, lightIntensity: 1.0 },
]

export const ROOM_BY_ID: Record<RoomId, RoomDef> = Object.fromEntries(ROOMS.map(r => [r.id, r])) as Record<RoomId, RoomDef>

export function roomAt(col: number, row: number): RoomDef | null {
  return ROOMS.find(r => r.col === col && r.row === row) ?? null
}

// World geometry constants
export const ROOM_HALF = 5          // room interior half-size
export const ROOM_STEP = 13         // distance between room centers
export const PASS_HALF = 1.5        // passage half-width

export function roomCenter(id: RoomId): { x: number; z: number } {
  const r = ROOM_BY_ID[id]
  return { x: (r.col - 1) * ROOM_STEP, z: (r.row - 1) * ROOM_STEP }
}

export function roomOfPoint(x: number, z: number): RoomId | null {
  for (const r of ROOMS) {
    const cx = (r.col - 1) * ROOM_STEP
    const cz = (r.row - 1) * ROOM_STEP
    if (Math.abs(x - cx) <= ROOM_HALF && Math.abs(z - cz) <= ROOM_HALF) return r.id
  }
  return null
}

export function adjacentRooms(id: RoomId): RoomId[] {
  const r = ROOM_BY_ID[id]
  const out: RoomId[] = []
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (const [dc, dr] of dirs) {
    const n = roomAt(r.col + dc, r.row + dr)
    if (n) out.push(n.id)
  }
  return out
}

// Walkable test: inside a room (shrunk for walls) or inside a passage strip
export function isWalkable(x: number, z: number): boolean {
  const lim = ROOM_HALF - 0.55
  for (const r of ROOMS) {
    const cx = (r.col - 1) * ROOM_STEP
    const cz = (r.row - 1) * ROOM_STEP
    if (Math.abs(x - cx) <= lim && Math.abs(z - cz) <= lim) return true
  }
  // passages: between horizontally / vertically adjacent rooms
  for (const r of ROOMS) {
    const cx = (r.col - 1) * ROOM_STEP
    const cz = (r.row - 1) * ROOM_STEP
    if (r.col < 2) {
      const mid = cx + ROOM_STEP / 2
      if (Math.abs(x - mid) <= ROOM_STEP / 2 - ROOM_HALF + 0.8 && Math.abs(z - cz) <= PASS_HALF - 0.25) return true
    }
    if (r.row < 2) {
      const mid = cz + ROOM_STEP / 2
      if (Math.abs(z - mid) <= ROOM_STEP / 2 - ROOM_HALF + 0.8 && Math.abs(x - cx) <= PASS_HALF - 0.25) return true
    }
  }
  return false
}

export function canOccupy(x: number, z: number, radius: number): boolean {
  void radius
  return isWalkable(x, z)
}

// ---------------------------------------------------------------- archetypes

export interface Archetype {
  id: string
  name: string
  trait: string
  quirk: string
  voice: string          // description used in LLM prompts
  greet: string[]
  timeline: string[]     // "{room}" and "{time}" placeholders
  suspicion: string[]    // "{name}" placeholder
  alibi: string[]        // "{name}" witness placeholder
  roomTake: string[]     // "{room}" placeholder
  pressure: string[]
  victim: string[]       // "{name}" victim placeholder
  rumorPhrase: string[]  // "{name}" "{room}" "{time}"
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'columnist', name: 'Society Columnist', trait: 'Knows everyone’s business', quirk: 'Collects secrets like cufflinks',
    voice: 'Catty, epigrammatic, always hinting she knows more than she says.',
    greet: ['Darling, you simply must tell me what you’ve seen.', 'I write about people, detective. Tonight is… material.'],
    timeline: ['At {time}? Holding court in the {room}, naturally.', 'I was in the {room} around {time}, being fascinating.'],
    suspicion: ['If you want my professional opinion — and you do — watch {name}.', '{name} has been performing innocence all evening. Badly.'],
    alibi: ['{name} can vouch for me. Everyone always can.', 'Ask {name}. I was mid-anecdote; I never murder mid-anecdote.'],
    roomTake: ['The {room}? Terribly lit for secrets, which is why people tell them there.', 'I’ve heard three confessions in the {room} in my career.'],
    pressure: ['Careful, detective. I put people in columns, not coffins.', 'You’re pressing the wrong cufflink, sweetheart.'],
    victim: ['Poor {name}. I’d already written their obituary once — as a joke.', '{name} owed me a secret. Now it keeps.'],
    rumorPhrase: ['A little bird — all right, a large bird — saw {name} in the {room} near {time}.', 'Don’t quote me, but {name} was skulking in the {room} around {time}.'],
  },
  {
    id: 'surgeon', name: 'Retired Surgeon', trait: 'Reads bodies like charts', quirk: 'Still washes his hands constantly',
    voice: 'Precise, clinical, quietly arrogant; describes everything anatomically.',
    greet: ['Mind where you step, detective. Evidence bruises easily.', 'I retired to stop seeing death. It followed me here.'],
    timeline: ['At {time} I was in the {room}. I keep exacting track of time. Habit.', 'I believe I was in the {room} at {time}. I don’t guess; I recall.'],
    suspicion: ['I dislike speculating. But {name}’s hands are… restless.', '{name} asked me earlier which artery is quickest. Make of that what you will.'],
    alibi: ['{name} was with me. I noted the time reflexively.', 'I was discussing my memoirs with {name}. Riveting for one of us.'],
    roomTake: ['The {room} offers poor light and worse exits. Chosen deliberately, I’d say.', 'Medically speaking, the {room} is where I’d least want to be surprised.'],
    pressure: ['I have opened chests with steadier hands than yours, detective.', 'Pressure? I administered it for forty years. You may stop.'],
    victim: ['{name} was dead before they fell. I could tell from across the room.', 'I examined no one tonight. I am retired. But {name}… died quickly.'],
    rumorPhrase: ['I noted {name} entering the {room} at approximately {time}. I note everything.', '{name} passed through the {room} near {time}. Their gait was agitated.'],
  },
  {
    id: 'curator', name: 'Greenhouse Curator', trait: 'Calm, observant, patient', quirk: 'Talks to plants when nervous',
    voice: 'Soft-spoken, botanical metaphors, unhurried, notices small details.',
    greet: ['The storm is good for the ferns, at least.', 'You look like a man who hasn’t watered anything in years, detective.'],
    timeline: ['Around {time} I was in the {room}. The night jasmine was just opening.', 'At {time}? In the {room}, I believe. Plants keep me punctual.'],
    suspicion: ['People wilt before they lie. {name} is wilting.', 'I’d keep an eye on {name}. Something’s growing in them that shouldn’t be.'],
    alibi: ['{name} helped me carry a pot. Heavy thing. Ask them.', 'I was with {name}, admiring the orchids. They pretended to care.'],
    roomTake: ['The {room} needs pruning, metaphorically speaking.', 'Everything in the {room} grows toward the light. People included.'],
    pressure: ['I’ve been patient with worse things than you. Aphids, mostly.', 'Pressing a gardener is like pressing a flower. You only flatten it.'],
    victim: ['{name} once asked me which plants kill. I thought it was small talk.', 'Poor {name}. Cut down mid-season.'],
    rumorPhrase: ['I saw {name} in the {room} around {time}, moving like a weed at night.', '{name}? The {room}, near {time}. I remember because the door slammed.'],
  },
  {
    id: 'magician', name: 'Stage Magician', trait: 'Misdirection is a lifestyle', quirk: 'Never stops palming coins',
    voice: 'Theatrical, playful, answers questions with flourishes and half-answers.',
    greet: ['Detective! For my next trick, I’ll make your suspects disappear.', 'Nothing up my sleeve. Anymore.'],
    timeline: ['At {time} I was in the {room}, astonishing absolutely no one.', 'The {room}, at {time}. Or was it an illusion? It was not.'],
    suspicion: ['Watch {name}’s left hand. Always the left hand.', '{name} does a vanishing act every time the lights flicker. Curious!'],
    alibi: ['{name} saw me produce a dove from the candelabra. A real one! Mostly.', 'I was entertaining {name}. My alibi has applause.'],
    roomTake: ['Ah, the {room}. Excellent sightlines for misdirection.', 'The {room} has at least three ways to vanish. I counted. Professionally.'],
    pressure: ['You can’t saw the truth in half, detective. I’ve tried. Ticket sales were poor.', 'A magician never reveals. Anything. Ever. Including dinner plans.'],
    victim: ['{name} knew how my best trick worked. Now the secret is safe forever. How convenient… for me, I suppose. Oh dear.', 'Death is the one illusion I never mastered. Poor {name}.'],
    rumorPhrase: ['I glimpsed {name} in the {room} at {time} — then again, I glimpse many things.', '{name} was in the {room} around {time}. Presto! A clue.'],
  },
  {
    id: 'correspondent', name: 'War Correspondent', trait: 'Fearless, blunt, sleepless', quirk: 'Counts exits in every room',
    voice: 'Clipped, sardonic, cables-style sentences. Dark humor.',
    greet: ['One mansion. Ten suspects. Worse odds than the front.', 'File this under: terrible weekend.'],
    timeline: ['{time} — {room}. Logged it. I log everything.', 'I was in the {room} at {time}. Two exits, one window. Noted.'],
    suspicion: ['My money’s on {name}. Nerves like that don’t come from bridge.', '{name} flinched at the thunder before it struck. Think about that.'],
    alibi: ['{name} and I were arguing about the news. Ask about the headlines.', 'I was with {name}. We watched the storm. Riveting copy.'],
    roomTake: ['The {room} is a kill box with wallpaper.', 'If it happens in the {room}, it happens quietly. Bad angles.'],
    pressure: ['I’ve been pressed by generals with artillery. Try again.', 'Print this: I didn’t do it.'],
    victim: ['{name} deserved a better headline than this.', 'I’ve seen a hundred {name}s. Never gets easier. It gets faster.'],
    rumorPhrase: ['Source — reliable-ish — puts {name} in the {room} at {time}.', 'Eyes on: {name}, {room}, around {time}. Unverified. As always.'],
  },
  {
    id: 'accountant', name: 'Estate Accountant', trait: 'Follows the money', quirk: 'Recounts the silverware',
    voice: 'Dry, precise, mildly resentful; everything is an entry in a ledger.',
    greet: ['This estate’s books don’t balance, detective. People rarely do either.', 'I count things when I’m nervous. I am up to four hundred.'],
    timeline: ['At {time} I was in the {room}. I have it itemized.', 'The {room}, {time}. Debit: one hour of my life.'],
    suspicion: ['{name}’s finances are a swamp. Swamps hide bodies.', 'If motive were money — it usually is — audit {name}.'],
    alibi: ['{name} watched me reconcile the cellar ledger. A thrilling evening.', 'I was with {name}. Two witnesses if you count the ledger.'],
    roomTake: ['The {room} contains items worth more than my retirement. Tempting, objectively.', 'Someone moved the silver in the {room}. I noticed. I always notice.'],
    pressure: ['Embezzlement is a paperwork crime. Murder is so… analog.', 'I assure you, my only vice is double-entry bookkeeping.'],
    victim: ['{name} died owing the estate a considerable sum. Awkward for everyone.', 'With {name} gone, line forty-one of the will becomes very interesting.'],
    rumorPhrase: ['My records — mental ones — show {name} in the {room} at {time}.', '{name} entered the {room} near {time}. I noted the floorboard creak.'],
  },
  {
    id: 'vocalist', name: 'Jazz Vocalist', trait: 'Reads the room’s mood', quirk: 'Hums when lying — or is it when nervous?',
    voice: 'Lyrical, smoky, speaks in rhythm; half-sighs her sentences.',
    greet: ['This house has a blue note in it tonight, sugar.', 'You got a heartbeat like a brush on a snare, detective.'],
    timeline: ['’Round {time} I was in the {room}, hummin’ to the rain.', 'At {time}? The {room}. The acoustics there forgive everything.'],
    suspicion: ['{name}’s song changed key tonight. You hear it too, don’t you?', 'I don’t accuse, honey. But {name} is hummin’ a guilty tune.'],
    alibi: ['{name} requested a song. I sang it. That’s my alibi — it has a melody.', 'I was with {name}. We talked about nothin’, which is somethin’.'],
    roomTake: ['The {room} sounds like a held breath.', 'Sing in the {room} and the walls sing back. Try it sometime.'],
    pressure: ['Press me and I just go quiet, sugar. Quiet’s my instrument.', 'I sing heartbreak. I don’t arrange it.'],
    victim: ['{name} couldn’t carry a tune, but they didn’t deserve the final note.', 'They’ll be singin’ about {name} for years. A blues, naturally.'],
    rumorPhrase: ['Word drifted through the {room} — {name} was there ’round {time}.', 'I heard {name} pass the {room} at {time}. Heavy steps for a light soul.'],
  },
  {
    id: 'antiquarian', name: 'Antiquarian', trait: 'Knows the mansion’s history', quirk: 'Touches everything, apologizes to objects',
    voice: 'Fussy, erudite, digressive; every answer comes with provenance.',
    greet: ['This house predates the storm by two centuries. It will outlast us all. Possibly tonight.', 'Careful with the Ming. And the Georgian. And me.'],
    timeline: ['At {time} I was cataloguing — mentally — the {room}.', 'The {room} at {time}. The provenance of my whereabouts is impeccable.'],
    suspicion: ['{name} asked the price of the Etruscan dagger. Odd small talk.', 'In my considered opinion, {name} handles history too carelessly.'],
    alibi: ['{name} endured my lecture on Sevres porcelain. Martyrdom has witnesses.', 'I was with {name}, authenticating a portrait. It was fake. The portrait.'],
    roomTake: ['The {room} holds pieces older than sin. And, I suspect, fresher guilt.', 'Mind the {room}. Its last owner also died indoors.'],
    pressure: ['I am three hundred years of expertise in a cardigan. Do not squeeze me.', 'I acquire relics, detective. Not corpses.'],
    victim: ['{name} had a first-edition I covet— coveted. Had. Coveted. Tenses are hard tonight.', 'The last person to die in this house was also named {name}. Coincidence is a young science.'],
    rumorPhrase: ['Records — mine, just now — place {name} in the {room} at {time}.', '{name} was examining the {room}’s collection around {time}. Without gloves.'],
  },
  {
    id: 'chauffeur', name: 'Off-Duty Chauffeur', trait: 'Sees everything, says little', quirk: 'Keeps polishing his cap',
    voice: 'Terse, dry, streetwise; long pauses, short sentences.',
    greet: ['Detective.', 'Rain’s bad. Roads are worse. Nobody’s leaving.'],
    timeline: ['{time}. {room}. That’s all.', 'Was in the {room} at {time}. Keepin’ warm.'],
    suspicion: ['{name} tips badly. Guilty people tip badly.', 'Watch {name}. That’s all I’ll say.'],
    alibi: ['{name} was there. We talked cars.', 'Ask {name}. They saw me.'],
    roomTake: ['The {room}? Drafty.', 'Lot of blind corners in the {room}.'],
    pressure: ['I drive. I don’t kill. Simpler that way.', 'You done?'],
    victim: ['{name} rode in my car once. Talked the whole way. Quiet now.', 'Shame about {name}.'],
    rumorPhrase: ['Saw {name} in the {room}. ’Bout {time}.', '{name}. {room}. {time}. Make of it what you want.'],
  },
  {
    id: 'debutante', name: 'Debutante', trait: 'Underestimated by everyone', quirk: 'Twirls her pearls while thinking',
    voice: 'Breathy, seemingly naive, unexpectedly sharp observations slip out.',
    greet: ['Isn’t this all just ghastly and thrilling?', 'Daddy says I talk too much. Do you think I talk too much, detective?'],
    timeline: ['At {time} I was in the {room}, just dying of boredom. Figuratively! Figuratively.', 'Let me think… {time}… oh! The {room}. Definitely.'],
    suspicion: ['This is probably silly, but {name} keeps smiling at nothing.', 'I shouldn’t say… but {name} asked where the telephones were. There aren’t any!'],
    alibi: ['{name} was teaching me cards. I lost terribly. On purpose. Or not!', 'I was with {name}. They’ll remember. I made an impression.'],
    roomTake: ['The {room} is where people go when they think no one’s looking. I’m always looking.', 'Oh, the {room} gives me shivers. Fun shivers. Mostly.'],
    pressure: ['You’re making me twist my pearls, detective. See? Twisting.', 'Me? I can barely decide on a hat.'],
    victim: ['{name} promised to teach me backgammon. Promises, promises.', 'Poor {name}. They had such lovely cufflinks. Had.'],
    rumorPhrase: ['I absolutely wasn’t eavesdropping, but {name} was in the {room} at {time}.', 'Guess who I saw in the {room} around {time}? {name}! Do something with that.'],
  },
]

// Every archetype can leave exactly three scene traces. Each trace deliberately
// overlaps three professions, so an examination narrows the field without
// identifying the murderer on its own.
export interface SceneEvidence {
  id: string
  label: string
  description: string
  archetypeIds: string[]
}

export const SCENE_EVIDENCE: SceneEvidence[] = [
  { id: 'ink-fiber', label: 'Ink-stained paper fiber', description: 'A torn paper fiber carries dense blue-black ink of the sort used for notes, copy, or ledgers.', archetypeIds: ['columnist', 'correspondent', 'accountant'] },
  { id: 'antiseptic', label: 'Sharp chemical trace', description: 'A clean, medicinal-smelling residue could be antiseptic, plant treatment, or automotive solvent.', archetypeIds: ['surgeon', 'curator', 'chauffeur'] },
  { id: 'fine-earth', label: 'Fine mineral dust', description: 'Pale grit at the scene resembles potting medium, dust from an old collection, or powder from formal shoes.', archetypeIds: ['curator', 'antiquarian', 'debutante'] },
  { id: 'black-wool', label: 'Black wool thread', description: 'A short black thread could have come from stagewear, a heavy field coat, or a driver’s uniform.', archetypeIds: ['magician', 'correspondent', 'chauffeur'] },
  { id: 'metal-polish', label: 'Metal-polish residue', description: 'A waxy metallic smear is consistent with polished silver, antique brass, or automobile fittings.', archetypeIds: ['accountant', 'antiquarian', 'chauffeur'] },
  { id: 'floral-perfume', label: 'Floral perfume trace', description: 'A lingering floral scent suits fashionable society, the stage, or a formal debut.', archetypeIds: ['columnist', 'vocalist', 'debutante'] },
  { id: 'face-powder', label: 'Ivory face powder', description: 'Fine cosmetic powder could come from theatrical makeup, a vocalist’s dressing kit, or a debutante’s compact.', archetypeIds: ['magician', 'vocalist', 'debutante'] },
  { id: 'blade-oil', label: 'Precision oil', description: 'A drop of light machine oil is used on surgical instruments, stage mechanisms, and calculating machines.', archetypeIds: ['surgeon', 'magician', 'accountant'] },
  { id: 'wax-resin', label: 'Amber wax residue', description: 'A brittle amber fleck resembles medical sealing wax, restoration resin, or a musician’s performance wax.', archetypeIds: ['surgeon', 'antiquarian', 'vocalist'] },
  { id: 'torn-note', label: 'Torn shorthand note', description: 'The fragment uses hurried marks associated with gossip notes, greenhouse records, or field reporting.', archetypeIds: ['columnist', 'curator', 'correspondent'] },
]

export const EVIDENCE_BY_ID = Object.fromEntries(SCENE_EVIDENCE.map(e => [e.id, e])) as Record<string, SceneEvidence>

// Built-in interview lines imply an association without naming the journal
// evidence or explaining why it matters. One may be appended on a reveal roll.
export const BUILTIN_EVIDENCE_HINTS: Record<string, string[]> = {
  'ink-fiber': [
    'I had to blot my fingers earlier; that blue-black ink gets everywhere.',
    'There is probably still a dark smudge on my cuff from my writing.',
  ],
  antiseptic: [
    'You may notice a sharp, clean smell on my cuffs; it tends to linger.',
    'I used a rather pungent cleaning solution earlier, if that is what you smell.',
  ],
  'fine-earth': [
    'I brushed some pale grit from my shoes, though clearly not all of it.',
    'The hems of my trousers have picked up a fine, dusty grit tonight.',
  ],
  'black-wool': [
    'This dark coat sheds little threads whenever it catches on old furniture.',
    'I snagged my black sleeve earlier; the weave has been fraying ever since.',
  ],
  'metal-polish': [
    'I spent part of the evening buffing some fittings; the waxy stuff clings to the hands.',
    'There is still a metallic polish on my fingertips from tending to something tarnished.',
  ],
  'floral-perfume': [
    'The floral scent is mine, yes; one needs something pleasant against all this damp.',
    'My perfume does linger in a room longer than I do, I am afraid.',
  ],
  'face-powder': [
    'A little pale powder from my compact has found its way onto everything tonight.',
    'I touched up my face earlier; the powder catches on one’s collar terribly.',
  ],
  'blade-oil': [
    'I oiled a delicate mechanism earlier; one drop goes a surprisingly long way.',
    'My fingers may still be slick from keeping a precision tool moving cleanly.',
  ],
  'wax-resin': [
    'A brittle amber fleck from my work was stuck to my sleeve a moment ago.',
    'I have been handling a warm, resinous material; it hardens into little golden crumbs.',
  ],
  'torn-note': [
    'I have been jotting hurried little marks all evening and tearing off each finished scrap.',
    'My shorthand becomes nearly illegible when I am rushed, but it saves paper and time.',
  ],
}

export const EVIDENCE_BY_ARCHETYPE = Object.fromEntries(
  ARCHETYPES.map(a => [a.id, SCENE_EVIDENCE.filter(e => e.archetypeIds.includes(a.id))]),
) as Record<string, SceneEvidence[]>

export type GuestGender = 'female' | 'male'

// These genders describe the established character sprites/models. Keeping the
// mapping beside the name pools prevents a randomized case from pairing a guest
// with a name that does not match their character design.
export const ARCHETYPE_GENDER: Record<string, GuestGender> = {
  columnist: 'female',
  surgeon: 'male',
  curator: 'female',
  magician: 'male',
  correspondent: 'male',
  accountant: 'male',
  vocalist: 'female',
  antiquarian: 'male',
  chauffeur: 'male',
  debutante: 'female',
}

export const GUEST_NAMES_BY_GENDER: Record<GuestGender, string[]> = {
  female: [
    'Vivienne Ashford', 'Ophelia Crane', 'Ingrid Moreau', 'Beatrix Holloway', 'Celeste Marlowe',
    'Adelaide Blackwood', 'Lenora Vale', 'Margot Sinclair', 'Evelyn Thorne', 'Rosalind Fairfax',
    'Claudia Sterling', 'Genevieve Harcourt', 'Florence Wren', 'Lucille Pembroke', 'Daphne Westcott',
    'Josephine Carrington', 'Sylvia Beaumont', 'Eleanor Graves', 'Camille Laurent', 'Audrey Winslow',
    'Vera Montrose', 'Lillian Hawthorne', 'Constance Blythe', 'Miriam Cross', 'Estelle Davenport',
    'Agatha Redmond', 'Helena Prescott', 'Dorothea Finch', 'Irene Weatherby', 'Maeve Langley',
    'Nora Cavendish', 'Gwendolyn Price', 'Delphine Royce', 'Isadora Mercer', 'Theodora Quinn',
    'Millicent Ward', 'Cordelia Frost', 'Annabelle Sloane', 'Imogen Roth', 'Francesca Wilde',
  ],
  male: [
    'Marcus Bell', 'Silas Draper', 'Theodore Vance', 'Edmund Locke', 'Arthur Penn',
    'Julian Whitlock', 'Alistair Blackwood', 'Benedict Vale', 'Vincent Sinclair', 'Percival Thorne',
    'Reginald Fairfax', 'Clive Sterling', 'Sebastian Harcourt', 'Frederick Wren', 'Laurence Pembroke',
    'Hugo Westcott', 'Nathaniel Carrington', 'Victor Beaumont', 'Montgomery Graves', 'Felix Laurent',
    'Rupert Winslow', 'Dorian Montrose', 'Charles Hawthorne', 'Augustus Blythe', 'Malcolm Cross',
    'Lionel Davenport', 'Gideon Redmond', 'Everett Prescott', 'Ambrose Finch', 'Desmond Weatherby',
    'Tristan Langley', 'Nicholas Cavendish', 'Winston Price', 'Maxwell Royce', 'Leopold Mercer',
    'Quentin Quinn', 'Barnaby Ward', 'Cecil Frost', 'Alexander Sloane', 'Dominic Roth',
  ],
}

export const GUEST_COLORS = [
  '#c9a227', '#8a4a6a', '#4a7a8a', '#7a5ac8', '#c86a3a',
  '#5a8a4a', '#b0b0c0', '#8a2f2f', '#3a6ac8', '#c85a9a',
]

export function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

// ---------------------------------------------------------------- helpers

export function fmtTime(min: number): string {
  const m = Math.max(0, Math.floor(min))
  const h24 = Math.floor(m / 60) % 24
  const mm = m % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const ampm = h24 < 12 ? 'AM' : 'PM'
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)]
}

export function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

// Seeded RNG (mulberry32)
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const NIGHT_LENGTH_MIN = 360 // midnight -> 6 AM
