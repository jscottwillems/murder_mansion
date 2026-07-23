// Pack A personal asides — Society Columnist, Retired Surgeon, Greenhouse Curator.
// Lightweight "get to know them" topics that keep the interview menu full and
// fresh once evidence threads appear. A seed-shuffled subset surfaces per case,
// so the personal filler differs every run. Asides only nudge trust/pressure —
// they never touch the evidence graph or personal-ending scoring, and they obey
// the same knowledge-state guard as every other line.
import type { ArchetypeId } from '../types'
import { pa, rep, type PersonalAside } from './types'

export const ASIDES_A: Record<Extract<ArchetypeId, 'columnist' | 'surgeon' | 'curator'>, PersonalAside[]> = {
  columnist: [
    pa('columnist-aside-pen', 'connection', 'That pen of yours—does it ever leave your hand?',
      'Rarely, darling. A columnist without her pen is a duchess without her jewels—technically still herself, but why gamble on it?', 'thoughtful', [
        rep('It suits you. What was your first byline?', 'A wedding notice I made scandalous entirely by accident. They never forgave me, and I have never once looked back.', 'thoughtful', 1),
        rep('A tool of the trade, then.', 'A weapon of the trade, sweetheart. Tools mend things; I do the opposite for a living.', 'neutral'),
        rep('Vanity, more like.', 'Call it vanity if it comforts you. It still writes rather faster than you ask questions.', 'suspicious', 0, 1),
      ]),
    pa('columnist-aside-storm', 'survival', 'How are you finding the storm shutting us all in together?',
      'Marvellous, professionally speaking. Nothing loosens a tongue quite like a locked door and a low fire.', 'neutral', [
        rep('You seem calmer than most of them.', 'I have sat through worse rooms than this one, darling. A storm is only weather with ambition.', 'thoughtful', 1),
        rep('Being shut in with strangers doesn\u2019t trouble you?', 'Strangers are merely sources I have not gotten round to interviewing yet.', 'neutral'),
        rep('You are enjoying this far too much.', 'Guilty. Discomfort is where all the good sentences come to live.', 'neutral'),
      ]),
    pa('columnist-aside-friend', 'social', 'Is there anyone under this roof you\u2019d call a real friend?',
      'Friendship is a luxury my profession discourages, though I confess a weakness for the singer.', 'thoughtful', [
        rep('Why the singer, of all people?', 'She performs honesty better than most people manage the genuine article. I do respect a fine performance.', 'thoughtful', 1),
        rep('And everyone else here?', 'Acquaintances, sources, and one or two who suddenly need the far side of the room when I arrive.', 'neutral'),
        rep('So you trust no one at all.', 'I trust everyone to be precisely as self-interested as I am. It has never once let me down.', 'suspicious'),
      ]),
    pa('columnist-aside-ambition', 'intel', 'What would you write, if you could write absolutely anything?',
      'One true page about the people who buy silence by the yard. I have the names; I have simply never had the nerve for all of them at once.', 'worried', [
        rep('Maybe tonight is the night for nerve.', 'Perhaps. Kindness is a dangerous thing to show a columnist, darling—I may well hold you to it.', 'thoughtful', 1),
        rep('Names are cheap without any proof.', 'Which is precisely why I collect both, and spend neither one carelessly.', 'neutral'),
        rep('Talk is cheap. Prove any of it.', 'In time. I do not open the good drawer for a raised voice, sweetheart.', 'angry', 0, 1),
      ]),
  ],

  surgeon: [
    pa('surgeon-aside-hands', 'connection', 'You favour your hands very carefully. An old injury?',
      'Habit, not injury. A surgeon\u2019s hands are his instruments; I keep them still the way you keep your pistol dry.', 'neutral', [
        rep('Decades of steadiness. Impressive.', 'Thirty-eight years, precisely. Precision is the one vanity I still permit myself.', 'thoughtful', 1),
        rep('Just professional habit, then.', 'Just habit. Read nothing further into it, detective.', 'neutral'),
        rep('Or you are hiding a tremor.', 'I am not. But you are welcome to watch for one—you will be waiting a very long while.', 'suspicious', 0, 1),
      ]),
    pa('surgeon-aside-cold', 'survival', 'This house is bitterly cold. Does it trouble you at all?',
      'Cold is clarifying. It slows the pulse and sharpens the attention—useful, if thoroughly unpleasant.', 'neutral', [
        rep('A clinician even beside the fire.', 'One does not retire the eye simply because one has retired the scalpel.', 'thoughtful', 1),
        rep('You take the discomfort stoically.', 'Complaint mends nothing. I gave up complaining about the weather decades ago.', 'neutral'),
        rep('Nothing rattles you in the slightest.', 'Little that a raised voice can produce, detective.', 'neutral'),
      ]),
    pa('surgeon-aside-case', 'intel', 'Why keep that instrument case within arm\u2019s reach all evening?',
      'Reflex. A man spends a career being the one they send for; the habit rather outlives the calling.', 'worried', [
        rep('Old duty is hard to set down.', 'It is. There is a strange comfort in being ready for a need that may never come.', 'thoughtful', 1),
        rep('Just an old habit, then.', 'Old habit, and nothing inside you have not already inventoried.', 'neutral'),
        rep('Or you expect to need it.', 'I expect nothing. I merely prefer not to be caught unready.', 'suspicious', 0, 1),
      ]),
    pa('surgeon-aside-temperance', 'social', 'You\u2019ve refused every glass tonight. Temperance?',
      'Discipline. I learned young that a clear head is the very last thing a man can afford to pour away.', 'neutral', [
        rep('A rare restraint in this company.', 'This company would benefit from rather more of it, though I would never dream of saying so aloud.', 'thoughtful', 1),
        rep('Each to their own, I suppose.', 'Precisely. I judge no one\u2019s glass but my own.', 'neutral'),
        rep('Afraid of what you might say?', 'Afraid of nothing I would say. Only of saying it imprecisely.', 'neutral'),
      ]),
  ],

  curator: [
    pa('curator-aside-hands', 'connection', 'There\u2019s soil worked deep into your hands. It won\u2019t scrub out?',
      'I stopped trying years ago. Loam under the nails is a gardener\u2019s wedding ring—you wear it, or you were never truly married to the work.', 'thoughtful', [
        rep('That is rather lovely, honestly.', 'Plants are honest company. They thrive or they fail, and they never once pretend otherwise.', 'thoughtful', 1),
        rep('An occupational stain, then.', 'An occupational loyalty. There is a difference, if you care to see it.', 'neutral'),
        rep('Convenient camouflage for other stains.', 'Everything on my hands grew from a pot. Believe that, or turn over the pots yourself.', 'suspicious', 0, 1),
      ]),
    pa('curator-aside-storm', 'survival', 'Does a storm like this worry you, shut in here with us?',
      'The house, no. My glasshouse, terribly—a night this cold can undo a decade of patience in the tender beds.', 'worried', [
        rep('You\u2019d rather be out there tending them.', 'Always. Living things do not keep office hours, and neither, once, did I.', 'thoughtful', 1),
        rep('Plants before people, then.', 'Plants ask less and forgive far more. Draw your own conclusions.', 'neutral'),
        rep('A convenient excuse to slip away.', 'I have slipped nowhere the frost did not send me. Chase the cold, detective, not me.', 'neutral'),
      ]),
    pa('curator-aside-quiet', 'social', 'You keep to the edges of every room. Are you shy?',
      'Watchful. A greenhouse teaches you that the quietest corner shows you the most about what is growing—or quietly rotting.', 'neutral', [
        rep('And what\u2019s growing here tonight?', 'Nerves, mostly. Transplant shock. Everyone here has been moved somewhere they did not choose.', 'thoughtful', 1),
        rep('Just an observer, then.', 'An observer with dirt under her nails. Harmless enough.', 'neutral'),
        rep('Lurking, some would call it.', 'Some would. Some also over-water a fern and then wonder aloud why it drowned.', 'suspicious'),
      ]),
    pa('curator-aside-specimen', 'intel', 'Is there one plant you\u2019d save above all the others?',
      'A night-blooming cereus I have kept alive against every sensible odds. It flowers once, briefly, and asks nothing of anyone.', 'thoughtful', [
        rep('You speak of it like family.', 'It is the most loyal thing I own. I would do a great deal to keep it out of careless hands.', 'thoughtful', 1),
        rep('A rare specimen, then.', 'Rare, and rather better left unnamed in the present company.', 'neutral'),
        rep('Rare enough to be worth smuggling?', 'Careful, detective. A grower\u2019s love is not a confession, whatever your notebook is hoping.', 'angry', 0, 1),
      ]),
  ],
}
