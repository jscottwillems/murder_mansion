// Pack B personal asides — Magician, War Correspondent, Estate Accountant.
// See asidesA.ts for the format and authoring rules. A seed-shuffled subset of
// each archetype's pool surfaces per case so personal filler differs every run.
import type { ArchetypeId } from '../types'
import { pa, rep, type PersonalAside } from './types'

export const ASIDES_B: Record<Extract<ArchetypeId, 'magician' | 'correspondent' | 'accountant'>, PersonalAside[]> = {
  magician: [
    pa('magician-aside-coins', 'connection', 'Those coins never stop moving across your knuckles—why is that?',
      'Idle hands frighten me, detective. A coin in motion is a coin no one can lift from me, and a mind in motion is much the same.', 'thoughtful', [
        rep('There\u2019s real artistry in it.', 'Kind of you to call it art. My father called it fidgeting and docked my supper for it—so you may imagine which verdict I chose to keep.', 'thoughtful', 1),
        rep('A nervous habit, then.', 'A rehearsed one. The only difference between nerves and craft is how many years you have practised the tremble.', 'neutral'),
        rep('Or it keeps my eyes off your other hand.', 'Now you are learning the trade. But do keep watching this hand, detective—it flatters me enormously.', 'suspicious', 0, 1),
      ]),
    pa('magician-aside-applause', 'social', 'Do you ever tire of playing to a crowd?',
      'Never the crowd—only the ones who fold their arms and dare me to fail. Those I adore, secretly. A hostile room is the one honest review a man ever gets.', 'neutral', [
        rep('You perform for the doubters, then.', 'Always. Win over the skeptic in the third row and the rest clap out of sheer relief.', 'thoughtful', 1),
        rep('Applause must wear thin eventually.', 'It does. Which is why I collect the gasp instead—far rarer, and it cannot be faked by good manners.', 'neutral'),
        rep('Some would call that vanity.', 'Some would. Those same people gasp loudest when the lady floats, so I forgive them their little sermons.', 'suspicious', 0, 1),
      ]),
    pa('magician-aside-secret', 'intel', 'Would you ever teach a soul how the tricks are truly done?',
      'Teach the method and you hand away the only thing you own. A conjurer with no secrets is simply a man dropping scarves in public.', 'thoughtful', [
        rep('Surely you\u2019d trust an apprentice.', 'One, perhaps, in thirty years—and I would still keep the last trick from even them. A locked drawer is how affection stays affection.', 'thoughtful', 1),
        rep('So the secrets go with you.', 'To the very finish, and rather cheerfully. The world keeps its wonder only because a few of us refuse to explain.', 'neutral'),
        rep('Convenient, keeping so much hidden.', 'Everyone hides their working, detective. I am merely honest enough to charge admission for the privilege.', 'suspicious', 0, 1),
      ]),
    pa('magician-aside-stage', 'room', 'You keep glancing at the doorways and the lamps. Sizing up the room?',
      'Force of habit. I read a room the way you read a witness—where the light falls, where a curtain might hang, which corner would hide a table nicely.', 'neutral', [
        rep('What does this room tell you?', 'That it was built to impress and not to be lived in. All these grand sightlines, and not one cosy place to properly vanish.', 'thoughtful', 1),
        rep('Every room is a stage to you.', 'Every room already is one, detective. I simply admit that I have noticed the ropes.', 'neutral'),
        rep('Or you\u2019re mapping your way out.', 'A conjurer always knows where the trapdoor would go—call it professionalism, not guilt. Do try to keep the two apart.', 'suspicious', 0, 1),
      ]),
  ],

  correspondent: [
    pa('correspondent-aside-sleep', 'survival', 'When did you last manage a full night\u2019s sleep?',
      'Couldn\u2019t tell you. Somewhere behind a border, three cities back. Sleep is a luxury for people who trust the room they\u2019re in.', 'neutral', [
        rep('That sounds exhausting, honestly.', 'You get used to the ceiling. After a while the quiet is what keeps you up—too much of it means something\u2019s gone wrong.', 'thoughtful', 1),
        rep('You stay alert on nerve alone.', 'Nerve and bad coffee. Tired is a decision you make in the morning; I keep declining it.', 'neutral'),
        rep('Or you don\u2019t sleep because you can\u2019t.', 'Can\u2019t, won\u2019t—same file. A shut eye in the wrong house is how a reporter stops filing. I intend to keep filing.', 'suspicious', 0, 1),
      ]),
    pa('correspondent-aside-source', 'intel', 'How far would you go to protect a source?',
      'All the way. A source is a promise with a pulse. Break it once and you never get another honest word from anyone, anywhere.', 'thoughtful', [
        rep('That loyalty says a lot about you.', 'Learned it the hard way. Costs you scoops, sometimes friends. Cheaper than the alternative, though.', 'thoughtful', 1),
        rep('Even under real pressure?', 'Especially then. Pressure is when the promise actually means something. Any coward keeps a secret when it\u2019s easy.', 'neutral'),
        rep('Or you\u2019re just shielding who talks to you.', 'Sure. Call discretion a hiding place if it fits your headline. I\u2019ve been called worse by better.', 'suspicious', 0, 1),
      ]),
    pa('correspondent-aside-company', 'social', 'Do you make friends easily on the road?',
      'I make contacts. Friends want you at the wedding; contacts want you at the front. Guess which ones return your cables.', 'neutral', [
        rep('That sounds a lonely way to live.', 'It is. But a lonely reporter files clean copy—no one to soften the truth for at breakfast.', 'thoughtful', 1),
        rep('You prefer it that way.', 'Prefer\u2019s a strong word. I\u2019ve arranged it that way. Fewer people to disappoint when the wire\u2019s due.', 'neutral'),
        rep('So you trust no one in this house.', 'I trust the exits and the clock. People I verify twice, then trust the paperwork.', 'suspicious', 0, 1),
      ]),
    pa('correspondent-aside-doors', 'room', 'You counted the doors the moment you walked in. Old reflex?',
      'Two doors, one window, a service passage behind the drapes. Counted before I shook a single hand. You stop doing that, you stop coming home.', 'neutral', [
        rep('That must be hard to switch off.', 'Never switches off. But it means I\u2019m the calmest one in the room when the lamps flicker. Small mercy, earned.', 'thoughtful', 1),
        rep('A useful habit in your line.', 'Kept me breathing across four borders. A room is just a map with people standing on it.', 'neutral'),
        rep('Or you\u2019re already planning your exit.', 'Always am. Planning a way out isn\u2019t the same as needing one—write that down carefully, detective.', 'suspicious', 0, 1),
      ]),
  ],

  accountant: [
    pa('accountant-aside-ledger', 'connection', 'That ledger never leaves your side. Is it truly all figures?',
      'Figures, and the truth that hides between them. A column cannot flatter you or lie to your face—which makes it better company than most of this household.', 'neutral', [
        rep('You speak of it fondly.', 'It is the one thing here that balances. Give a ledger an honest entry and it gives you an honest answer, every single time.', 'thoughtful', 1),
        rep('Just the books, then.', 'Just the books. But read closely, a man\u2019s books are his confession, whether or not he ever meant to write one.', 'neutral'),
        rep('Or you keep it close to hide something.', 'Everything I hide is a decimal, detective. Audit me at your leisure—you will only bore yourself.', 'suspicious', 0, 1),
      ]),
    pa('accountant-aside-silver', 'social', 'I noticed you counting the silver at dinner. A professional tic?',
      'Forty-one pieces, and there should be forty-two. A fish fork has been wandering since spring, and no one in this house seems remotely troubled by it but me.', 'suspicious', [
        rep('That eye for detail is a gift.', 'A burden dressed as a gift. Once you can count, you cannot stop, and the world turns out to be short rather more than a single fork.', 'thoughtful', 1),
        rep('One fork hardly matters, surely.', 'One fork is how a fortune leaves a house, detective—not in a night, but a piece at a time, politely, while everyone admires the wallpaper.', 'neutral'),
        rep('You sound almost accusatory.', 'I sound accurate. If accuracy offends the company, the company should keep better accounts.', 'suspicious', 0, 1),
      ]),
    pa('accountant-aside-money', 'motive', 'In your experience, what makes people behave badly?',
      'Money, or the want of it. Every quarrel I have ever audited reduced, in the end, to a sum someone felt was owed them and never received.', 'neutral', [
        rep('That\u2019s a rather bleak arithmetic.', 'Bleak, but it balances. People will forgive an insult far sooner than they forgive a debt. I have the columns to prove it.', 'thoughtful', 1),
        rep('Surely not everything is about money.', 'Nearly everything wears money underneath, if you undo enough buttons. Even love keeps a running total, though it hates to admit the fact.', 'neutral'),
        rep('Following the money to anyone in particular?', 'I follow it wherever the entries lead, detective. Whether it stops at a door in this house is not mine to say tonight.', 'thoughtful', 0, 1),
      ]),
    pa('accountant-aside-house', 'room', 'What do you make of a grand house like this one?',
      'A liability in fancy dress. Every chandelier is a repair bill awaiting its turn, and every acre of it is quietly costing the family more than they will ever confess aloud.', 'thoughtful', [
        rep('You see the numbers behind the grandeur.', 'I cannot help it. Where you see a ballroom, I see the coal, the wages, and the roof that leaks above the east wing. Someone must.', 'thoughtful', 1),
        rep('It must be worth a fortune, though.', 'On paper. But paper fortunes and real ones rarely occupy the same room, and this house has been living on the difference for years.', 'neutral'),
        rep('You resent all this splendour, don\u2019t you?', 'I resent being asked to make the sums pretend it can last. Admire the marble all you like, detective; I am the one who reconciles it.', 'suspicious', 0, 1),
      ]),
  ],
}
