// Tone escalation layer for the built-in director.
//
// The night gets worse. As the detective discovers more bodies, every guest's
// composure erodes on its own curve: social masks in the first hour give way to
// unease, then paranoia, then raw survival. The killer moves along a parallel
// but subtly *wrong* curve — too composed, or performing fear a half-beat late —
// which colors tone without ever leaking guilty knowledge.
//
// This data is intentionally separate from the evidence/reveal graph in
// `authoredDialogue.ts`: it never emits a fact or unlocks anything. It only
// selects the atmospheric opening line for an interview based on case state.

import type { ArchetypeId } from '../types'
import type { RoleMode } from './types'

/** 0 = composed shock (opening victim only) … 3 = survival desperation. */
export type EscalationTier = 0 | 1 | 2 | 3

export const ESCALATION_TIER_LABELS: Record<EscalationTier, string> = {
  0: 'composed',
  1: 'uneasy',
  2: 'frightened',
  3: 'desperate',
}

/**
 * Derive the tone tier from discovered bodies. The opening victim (one body)
 * is the baseline shock the house is still performing composure over; each
 * further discovery pushes the whole ensemble a tier darker.
 */
export function escalationTier(bodiesFound: number): EscalationTier {
  if (bodiesFound <= 1) return 0
  if (bodiesFound === 2) return 1
  if (bodiesFound === 3) return 2
  return 3
}

interface MoodTier {
  /** Opening lines for an innocent (or killer, if no killerGreet is supplied). */
  greet: string[]
  /** Killer-only tonal variants. Never reveal guilt; only sound subtly off. */
  killerGreet?: string[]
}

interface ArchetypeMood {
  /** One entry per EscalationTier, indices 0..3. */
  tiers: [MoodTier, MoodTier, MoodTier, MoodTier]
}

// ---------------------------------------------------------------------------
// Per-archetype tonal progression. Voices follow docs/NARRATIVE_BIBLE.md.
// Pre-discovery death language is never used here because escalation only ever
// applies after at least one body is known.
// ---------------------------------------------------------------------------

export const ARCHETYPE_MOODS: Record<ArchetypeId, ArchetypeMood> = {
  columnist: {
    tiers: [
      {
        greet: [
          'Sit, detective. I collect the evening in shorthand, and tonight has become frightfully collectible.',
          'One tragedy is a headline, darling. Do let us keep it at one.',
        ],
      },
      {
        greet: [
          'Two, now. I no longer feel like the cleverest person in the room, and I loathe that feeling.',
          'My wit is a poor umbrella in this weather. Ask quickly.',
        ],
      },
      {
        greet: [
          'I have stopped taking notes. That should tell you precisely how afraid I am.',
          'I keep counting who is left at the table. It is a very short column now.',
        ],
        killerGreet: [
          'Everyone is unravelling. I am simply the one still choosing my adjectives.',
          'Grief is so untidy. I prefer to observe it than to perform it.',
        ],
      },
      {
        greet: [
          'No column, no cleverness, no darlings. Just tell me you have a name.',
          'I would trade every secret I own for a locked door and a dawn train.',
        ],
        killerGreet: [
          'The others are screaming into cushions. I have decided screaming wastes breath.',
          'You want fear from me? I have rationed mine. It lasts longer that way.',
        ],
      },
    ],
  },
  surgeon: {
    tiers: [
      {
        greet: [
          'I have seen death do its work before. I would rather it not make a habit of the evening.',
          'Keep your questions clinical, detective. Sentiment contaminates the record.',
        ],
      },
      {
        greet: [
          'A second one. This is no longer misfortune; it is a pattern, and patterns can be read.',
          'I am cataloguing exits and pulses. Old habit, freshly useful.',
        ],
      },
      {
        greet: [
          'Three. I have washed my hands raw and it changes nothing. Ask what you must.',
          'I treated men under fire more calmly than I sit here now. That should alarm us both.',
        ],
        killerGreet: [
          'The others panic because they do not understand the mechanism. I understand it perfectly.',
          'Fear is a symptom. I am attending to mine the way I would any other.',
        ],
      },
      {
        greet: [
          'We are being reduced, one by one, and I cannot operate on a whole house. Give me something to act on.',
          'I have run out of professional detachment. What is left is merely a frightened old man.',
        ],
        killerGreet: [
          'A steady hand is a virtue tonight. Notice how few of us still have one.',
          'I do not tremble, detective. Read whatever you like into that.',
        ],
      },
    ],
  },
  curator: {
    tiers: [
      {
        greet: [
          'The glasshouse is calmer than the drawing room tonight. I stayed with the plants as long as I could.',
          'Something has been uprooted in this house. I felt it before I understood it.',
        ],
      },
      {
        greet: [
          'Two gone now. Things that are pruned twice in a season rarely recover.',
          'I keep my hands in the soil to stop them shaking. It only half works.',
        ],
      },
      {
        greet: [
          'I have started speaking to the ferns again. Do not judge me; they are better listeners than the living tonight.',
          'Three. The whole house has gone to rot from the inside, and I cannot cut it out.',
        ],
        killerGreet: [
          'Everything dies in its season. The others find that unbearable. I find it quiet.',
          'I tend what I can and let the rest wither. It is the only mercy I have left.',
        ],
      },
      {
        greet: [
          'There is nothing left to tend but the survivors. Tell me how to keep them alive.',
          'I would burn the whole collection to see morning. Ask me anything, quickly.',
        ],
        killerGreet: [
          'A garden does not mourn its cuttings. I am trying to remember how to.',
          'I am very still now. Stillness is how frightened things survive.',
        ],
      },
    ],
  },
  magician: {
    tiers: [
      {
        greet: [
          'The best trick tonight is looking unbothered. I am performing it now, badly.',
          'Misdirection, detective — I built a career on where people are not looking. Tonight I cannot look away.',
        ],
      },
      {
        greet: [
          'Two vanishings, and neither was mine. I do not care for a rival act.',
          'The patter is thinner now. I have run short of things to hide behind.',
        ],
      },
      {
        greet: [
          'No flourish. No applause. Three empty chairs is a silence I cannot fill.',
          'I keep my hands where you can see them now. I want no misunderstanding tonight.',
        ],
        killerGreet: [
          'The audience is terrified. A good performer never breaks — even when the theatre is burning.',
          'Everyone is watching the wrong hand. Tonight, so am I.',
        ],
      },
      {
        greet: [
          'The trick is over. I only want the curtain and the exit, in that order.',
          'I have made men gasp for thirty years and never heard a sound like this house tonight.',
        ],
        killerGreet: [
          'Panic is just poor stagecraft. I have decided to keep my composure to the end.',
          'You are looking for a tell. I have spent my life making sure there isn\u2019t one.',
        ],
      },
    ],
  },
  correspondent: {
    tiers: [
      {
        greet: [
          'One down. I\u2019ve filed worse from worse places. Ask.',
          'Storm outside, storm in here. I\u2019m counting exits. Two in this room.',
        ],
      },
      {
        greet: [
          'Two. That\u2019s a trend, not an accident. Trends kill more than bullets.',
          'I don\u2019t spook. But I\u2019ve stopped sleeping, and I wasn\u2019t doing much of that anyway.',
        ],
      },
      {
        greet: [
          'Three. I\u2019ve covered massacres with better odds than this dinner party.',
          'Keep it short. Every minute in a room is a minute someone knows where I am.',
        ],
        killerGreet: [
          'Everyone\u2019s rattled. I run cold under fire. Always have. Read it how you want.',
          'Panic gets people killed. I\u2019m not going to be a casualty of my own nerves.',
        ],
      },
      {
        greet: [
          'The story doesn\u2019t matter if nobody files it. Help me see morning and I\u2019ll owe you.',
          'No byline is worth this. Just point me at a door that locks.',
        ],
        killerGreet: [
          'I\u2019ve watched braver men come apart. I don\u2019t intend to give the house that headline.',
          'Steady hands, steady voice. Front-line habit. Don\u2019t make it evidence.',
        ],
      },
    ],
  },
  accountant: {
    tiers: [
      {
        greet: [
          'One death. A grim entry, but a single line. I would prefer the ledger close there.',
          'I count when I am nervous, detective. I have reached rather a large number.',
        ],
      },
      {
        greet: [
          'Two. That is no longer an anomaly; it is a running total, and totals frighten me more than most things.',
          'I have balanced worse books than this night. None with such a cost column.',
        ],
      },
      {
        greet: [
          'Three. I keep the silver counted and the door watched. It is all the control I have left.',
          'Every figure in this house is now a liability, myself included. Ask carefully.',
        ],
        killerGreet: [
          'The others treat fear as a debt to be paid loudly. I service mine quietly.',
          'Panic is an unposted liability. I do not carry those. I reconcile them.',
        ],
      },
      {
        greet: [
          'The accounts do not matter if there is no one left to audit them. Tell me what to do.',
          'I have stopped counting silver and started counting the living. The figure keeps falling.',
        ],
        killerGreet: [
          'I remain solvent, so to speak, where others are bankrupt with terror.',
          'You will not find my hands shaking over the ledger. Draw no conclusion from steadiness.',
        ],
      },
    ],
  },
  vocalist: {
    tiers: [
      {
        greet: [
          'This house has a blue note in it tonight, sugar. I heard it before the lights got low.',
          'I sing about heartbreak. I never learned the tune for this.',
        ],
      },
      {
        greet: [
          'Two, now. The room\u2019s gone flat, and I can\u2019t sing us back up to key.',
          'My hands don\u2019t shake when I hold the mic. They\u2019re shaking now, honey.',
        ],
      },
      {
        greet: [
          'Three empty seats. I keep humming just to prove I still can. It isn\u2019t working.',
          'The quiet in here is the loudest thing I ever heard. Ask me quick.',
        ],
        killerGreet: [
          'Everybody\u2019s off-key with fear. I hold my note. It\u2019s the only thing I trust myself to do.',
          'You want me to fall apart, sugar? I\u2019ve got better breath control than that.',
        ],
      },
      {
        greet: [
          'No more songs. Just get me to dawn and I\u2019ll never sing this key again.',
          'I\u2019ve gone quiet, detective. Quiet\u2019s all I\u2019ve got left to give.',
        ],
        killerGreet: [
          'A singer learns to stay steady when the room comes apart. Don\u2019t make my calm a confession.',
          'Everyone\u2019s screaming the melody. I\u2019m just keeping time.',
        ],
      },
    ],
  },
  antiquarian: {
    tiers: [
      {
        greet: [
          'This house has outlived plagues and creditors. I confess I expected it to outlive the guests as well.',
          'Handle the evening gently, detective. Like everything else here, it is older and more fragile than it looks.',
        ],
      },
      {
        greet: [
          'A second loss. Provenance, you understand, is the record of what survives. Ours is thinning.',
          'I apologize to the objects when I pass them now. They, at least, are not in danger.',
        ],
      },
      {
        greet: [
          'Three. I have catalogued a great many deaths in this collection. I never expected to witness the entries made.',
          'I have become quite pedantic with fear. Forgive me; precision is my only handhold.',
        ],
        killerGreet: [
          'Objects endure because they do not panic. I have chosen to learn from them.',
          'The others handle their terror so carelessly. I prefer to keep mine under glass.',
        ],
      },
      {
        greet: [
          'A collection means nothing without someone to inherit it. Help me ensure there is someone.',
          'I would deaccession every treasure in this house for a safe road out. Ask what you need.',
        ],
        killerGreet: [
          'Age teaches composure. Notice how little of it remains in this room but mine.',
          'I do not flinch, detective. History has trained that out of me. Infer nothing.',
        ],
      },
    ],
  },
  chauffeur: {
    tiers: [
      {
        greet: [
          'One dead. Roads flooded. Nobody\u2019s leaving. That\u2019s the situation.',
          'I see more than folks think from behind a wheel. Ask.',
        ],
      },
      {
        greet: [
          'Two. I\u2019ve kept the engine warm. Not that there\u2019s anywhere to drive.',
          'Quiet type, me. But I don\u2019t like how quiet the halls got.',
        ],
      },
      {
        greet: [
          'Three now. I keep my back to a wall and my eyes on the doors. You should too.',
          'Nobody looks at the driver. Tonight that\u2019s the safest place to be.',
        ],
        killerGreet: [
          'Everyone\u2019s losing their nerve. I keep mine. Comes with the job.',
          'Panicking passengers crash cars. I don\u2019t panic. Make of it what you want.',
        ],
      },
      {
        greet: [
          'No fare\u2019s worth this. I\u2019ll help however I can. Just get us to daylight.',
          'I\u2019ve got the Bentley ready and nowhere to run it. Tell me what you need.',
        ],
        killerGreet: [
          'Steady hands on the wheel, steady hands here. Don\u2019t read a story into it.',
          'I\u2019ve seen frightened men do stupid things. I\u2019m not going to be one.',
        ],
      },
    ],
  },
  debutante: {
    tiers: [
      {
        greet: [
          'Everyone keeps telling me not to worry my pretty head. My pretty head has noticed rather a lot.',
          'Isn\u2019t it ghastly? Though I find I\u2019m watching more than I\u2019m fainting.',
        ],
      },
      {
        greet: [
          'Two, now. People stopped pretending I\u2019m too silly to be frightened. I rather wish they hadn\u2019t.',
          'I\u2019ve stopped twisting my pearls. I\u2019m twisting something harder to see.',
        ],
      },
      {
        greet: [
          'Three. Nobody is treating me like a child anymore, which is how I know it is truly bad.',
          'I counted the living at supper. I am rather good with numbers, and I do not like this one.',
        ],
        killerGreet: [
          'Everyone expects me to weep. I have decided that weeping is a luxury I can\u2019t afford tonight.',
          'They still underestimate how calm I can be. I intend to keep it that way.',
        ],
      },
      {
        greet: [
          'I am done being underestimated and done being frightened. Tell me how we survive this.',
          'Daddy\u2019s money can\u2019t buy a way out of a flooded road. So I\u2019ll help you instead.',
        ],
        killerGreet: [
          'The others are hysterical. I have found being underestimated is safest when one stays composed.',
          'You want to see me crack, detective. I was raised never to, in company.',
        ],
      },
    ],
  },
}

/** Pick an opening line for the given archetype, tier, and role. */
export function pickMoodGreeting(
  archetypeId: ArchetypeId,
  tier: EscalationTier,
  role: RoleMode,
  rnd: () => number,
): string {
  const mood = ARCHETYPE_MOODS[archetypeId].tiers[tier]
  const pool = role === 'killer' && mood.killerGreet?.length ? mood.killerGreet : mood.greet
  return pool[Math.floor(rnd() * pool.length)]
}
