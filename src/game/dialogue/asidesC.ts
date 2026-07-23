// Pack C personal asides — Jazz Vocalist, Antiquarian, Chauffeur, Debutante.
// See asidesA.ts for the format and authoring rules. A seed-shuffled subset of
// each archetype's pool surfaces per case so personal filler differs every run.
import type { ArchetypeId } from '../types'
import { pa, rep, type PersonalAside } from './types'

export const ASIDES_C: Record<Extract<ArchetypeId, 'vocalist' | 'antiquarian' | 'chauffeur' | 'debutante'>, PersonalAside[]> = {
  vocalist: [
    pa('vocalist-aside-bluenote', 'connection', 'Where did a voice like yours first learn to carry a room?',
      'In a back-room joint with a piano missing three keys, sugar. You learn to bend around what\u2019s gone \u2014 that\u2019s the whole trick of it.', 'thoughtful', [
        rep('That sounds like a hard, lovely school.', 'Hard and lovely, honey, like most things worth the aching. I wouldn\u2019t trade a single splintered night of it.', 'thoughtful', 1),
        rep('And it carried you all the way here.', 'All the way to marble floors and cold company. Funny where a bent note will take a girl.', 'neutral'),
        rep('A rehearsed answer if I ever heard one.', 'Everything I say has a little rehearsal in it, detective \u2014 doesn\u2019t make it a lie, just makes it sing.', 'suspicious', 0, 1),
      ]),
    pa('vocalist-aside-mood', 'room', 'You keep glancing round the parlor \u2014 what is the room telling you tonight?',
      'It\u2019s humming in a minor key, sugar. Too many folks holding a smile a beat past comfortable.', 'worried', [
        rep('You read a crowd like sheet music.', 'Every room\u2019s got a tempo, honey, and this one keeps rushing itself. I just listen for who\u2019s dragging behind.', 'thoughtful', 1),
        rep('Anyone in particular off the beat?', 'A few. I don\u2019t point mid-song, detective \u2014 I wait to hear if they find the rhythm again.', 'neutral'),
        rep('Or you\u2019re just nervous yourself.', 'Maybe I am. A girl hums to steady her own hands sometimes \u2014 you caught me at it, sugar.', 'suspicious', 0, 1),
      ]),
    pa('vocalist-aside-thunder', 'survival', 'Does a night this loud with thunder rattle a performer like you?',
      'Thunder\u2019s just percussion with no manners, honey. I\u2019ve sung over worse racket than a storm.', 'neutral', [
        rep('You make even weather sound like a set.', 'Everything\u2019s a set if you let it be, sugar. Keeps the fear from ever getting a solo.', 'thoughtful', 1),
        rep('So the storm doesn\u2019t trouble you.', 'The storm, no. The quiet after each crack \u2014 that\u2019s the part I fill with a little humming.', 'neutral'),
        rep('You perform calm awfully well.', 'It\u2019s the one number I never flub, sugar. Doesn\u2019t mean the calm is empty \u2014 means I practiced it.', 'suspicious', 0, 1),
      ]),
    pa('vocalist-aside-company', 'social', 'Is there a soul in this house you\u2019d share a late drink with?',
      'A couple, maybe, if the piano were warmer. Mostly I keep my own company and let it hum, honey.', 'thoughtful', [
        rep('Solitude suits some singers.', 'It does, sugar \u2014 a voice needs somewhere quiet to come home to. I built mine out of long nights alone.', 'thoughtful', 1),
        rep('No one here you\u2019d call close, then?', 'Close is a strong word under a stranger\u2019s roof, detective. I\u2019m friendly with a few and careful with the rest.', 'neutral'),
        rep('Careful, or you trust no one at all?', 'Careful is how a girl keeps singing, honey. Trust I hand out one verse at a time.', 'suspicious', 0, 1),
      ]),
  ],
  antiquarian: [
    pa('antiquarian-aside-house', 'room', 'This hall must be centuries old \u2014 what is its story?',
      'Jacobean at the core, Georgian vanities layered atop \u2014 forgive me, I do go on. This paneling alone has outlived four families and two fires.', 'thoughtful', [
        rep('Please, go on \u2014 it\u2019s fascinating.', 'Ah, a kindred ear! Then mind the linenfold carving \u2014 hand-cut, pre-industrial, and I do apologize to it for the dreadful varnish some later brute slapped on.', 'thoughtful', 1),
        rep('You know the place better than its owner.', 'Owners merely possess a house; scholars understand it. The distinction is everything, and it is rarely appreciated.', 'neutral'),
        rep('A great many dates to hide behind.', 'Dates are not a hiding place, detective; they are the one honest thing in any room. People fib \u2014 provenance does not.', 'suspicious', 0, 1),
      ]),
    pa('antiquarian-aside-hands', 'connection', 'You touch every object you pass \u2014 why can\u2019t you keep your hands still?',
      'A dreadful habit, I confess, and half a method. One reads an object through the fingertips \u2014 the weight, the temperature, the honesty of its joinery.', 'neutral', [
        rep('You handle them like old friends.', 'They are the friends who never disappoint, my dear \u2014 forgive me, I oughtn\u2019t confide such things. That bronze has kept better company than most people.', 'thoughtful', 1),
        rep('Just an appraiser\u2019s reflex, then.', 'Precisely so. The eye is fooled by a clever fake; the hand almost never is.', 'neutral'),
        rep('Touching everything leaves prints everywhere.', 'It leaves the prints of a man who reveres these things \u2014 and I do beg this poor candlestick\u2019s pardon for being handled as an exhibit.', 'suspicious', 0, 1),
      ]),
    pa('antiquarian-aside-treasure', 'intel', 'Of everything under this roof, which piece would you spirit away first?',
      'The little ivory triptych in the west passage \u2014 fifteenth century, absurdly underinsured, and quite unaware of its own worth. A scandal, really.', 'thoughtful', [
        rep('You speak of it so tenderly.', 'How could one not? It has survived reformations and neglect and one truly criminal cleaning. I should like to see it into gentler hands than these.', 'thoughtful', 1),
        rep('Underinsured, you say \u2014 you\u2019ve checked?', 'A scholar notices such things the way you notice an unlatched window. Occupational, nothing more.', 'neutral'),
        rep('That sounds like a man planning a pocket.', 'It sounds like a man who catalogues, detective. I covet with a notebook, never a sack.', 'angry', 0, 1),
      ]),
    pa('antiquarian-aside-vocation', 'motive', 'What first drew you to spend a life among relics and ruins?',
      'A grandfather\u2019s watch that stopped the year he was born \u2014 wound backward, I later learned, by a swindler. I have chased honest objects ever since.', 'worried', [
        rep('So it began with a wound.', 'Most vocations do, my dear \u2014 forgive the sentiment. I mend the past\u2019s little dishonesties because no one ever mended that one.', 'worried', 1),
        rep('A tidy origin story.', 'Tidy because it is true, detective. I have had decades to file it correctly.', 'thoughtful'),
        rep('Or a convenient excuse to handle riches.', 'Riches bore me; authenticity does not. Confuse the two again and you insult a lifetime\u2019s discipline.', 'angry', 0, 1),
      ]),
  ],
  chauffeur: [
    pa('chauffeur-aside-cap', 'connection', 'That cap never leaves your hands \u2014 why keep polishing it?',
      'Keeps them busy, sir. A driver with idle hands starts talking. I\u2019d rather not.', 'neutral', [
        rep('Pride in the uniform. I respect that.', 'It\u2019s the one thing that\u2019s mine, sir. Bought it myself. That counts for something.', 'thoughtful', 1),
        rep('Habit, then.', 'Habit. Fifteen years of it. The hands know the motion better than I do.', 'neutral'),
        rep('Or nerves you\u2019d rather I didn\u2019t see.', 'Think what you like, sir. The cap\u2019s still cleaner than most consciences in this house.', 'suspicious', 0, 1),
      ]),
    pa('chauffeur-aside-seat', 'intel', 'You must see a great deal from behind that wheel \u2014 what stays with you?',
      'Everything, sir. People forget the driver\u2019s got ears. Then they talk.', 'neutral', [
        rep('And you keep it all to yourself.', 'Mostly, sir. A man who repeats what he hears don\u2019t drive long. But I remember. All of it.', 'thoughtful', 1),
        rep('Anything from tonight?', 'Some. A door that opened too quiet. A step where there shouldn\u2019t be one. Still sorting it.', 'neutral'),
        rep('Convenient, hearing so much and saying nothing.', 'Convenient\u2019s not the word, sir. Careful is. Different thing, when you\u2019re the help.', 'suspicious', 0, 1),
      ]),
    pa('chauffeur-aside-marooned', 'survival', 'The road\u2019s washed out and we\u2019re all stuck \u2014 how are you taking it?',
      'Fine, sir. Been stranded worse places than a warm house. I wait. That\u2019s half the job.', 'neutral', [
        rep('A patient man.', 'You learn it, sir. Engine floods, you don\u2019t curse it. You wait for it to dry. Same with people.', 'thoughtful', 1),
        rep('The storm doesn\u2019t worry you?', 'Storm\u2019s honest, sir. Does exactly what it says. Can\u2019t say that for the company inside.', 'neutral'),
        rep('Or you like being cut off from the law.', 'The law and me get on fine, sir. It\u2019s the gentry that put me on edge. Leave it there.', 'suspicious', 0, 1),
      ]),
    pa('chauffeur-aside-standing', 'social', 'How do the folk in this house treat a man in your position?',
      'Like furniture, sir. Useful, silent, shoved aside when I\u2019m underfoot. Suits me most nights.', 'neutral', [
        rep('That\u2019s not how I mean to treat you.', 'Noticed that, sir. It\u2019s rare. A working man remembers who looked him in the eye.', 'thoughtful', 1),
        rep('Furniture hears the room, though.', 'That it does, sir. No one guards their mouth in front of a coat rack.', 'neutral'),
        rep('Bitter about your betters, are you?', 'No bitterness, sir. Just arithmetic. I know exactly what I\u2019m worth to them, and it\u2019s not much.', 'angry', 0, 1),
      ]),
  ],
  debutante: [
    pa('debutante-aside-season', 'social', 'Is a season of parties as dizzying as it sounds, or does it tire you?',
      'Oh, it\u2019s heaven, detective \u2014 all the dancing and the lovely dresses! Though one does learn to smile while one\u2019s feet quietly beg for mercy.', 'neutral', [
        rep('You wear it beautifully, all the same.', 'How sweet of you! The trick is to look as though you\u2019re enjoying it a great deal more than you are. Everyone does it \u2014 I\u2019m simply better practiced.', 'thoughtful', 1),
        rep('It sounds exhausting, honestly.', 'It is, rather. But a girl smiles, sips her punch, and waits for the music to change. One learns to endure prettily.', 'neutral'),
        rep('All that fluttering can\u2019t be sincere.', 'Can\u2019t it? How disappointing for you, detective, to find the silly girl means it and notices you all the same.', 'suspicious', 0, 1),
      ]),
    pa('debutante-aside-pearls', 'connection', 'You keep turning those pearls \u2014 are they a comfort to you?',
      'They were my grandmother\u2019s, detective. When I\u2019m frightened I twist them, and no one ever asks why \u2014 they simply think me fidgety.', 'worried', [
        rep('She must have meant a great deal to you.', 'Everything. She was the only one who spoke to me as though I\u2019d something behind my eyes. I wear her when I need reminding of it.', 'worried', 1),
        rep('A nervous habit, then.', 'A useful one. People say the most careless things in front of a girl fussing with her beads. I do recommend it.', 'neutral'),
        rep('Or a performance of innocence.', 'What a clever, unkind thought. If it were a performance, detective, you\u2019d never have been meant to notice \u2014 would you?', 'suspicious', 0, 1),
      ]),
    pa('debutante-aside-watch', 'room', 'You take everyone in so quietly \u2014 what have you noticed about this party?',
      'Oh, heaps of things, detective \u2014 who watches the door, who drinks too fast, who laughs before the joke is finished. People forget I\u2019m listening.', 'neutral', [
        rep('You see more than you let on.', 'Everyone lets me, you see \u2014 a pretty face is marvelous cover. I\u2019ve learned a whole house by being thought empty.', 'thoughtful', 1),
        rep('Anyone stand out especially?', 'One or two are holding themselves a touch too still for a party. I shan\u2019t say who \u2014 not until I\u2019m certain of you.', 'neutral'),
        rep('Little girls shouldn\u2019t play at spying.', 'Little girls, spying \u2014 how you do underestimate the furniture, detective. It\u2019s precisely why I hear everything.', 'suspicious', 0, 1),
      ]),
    pa('debutante-aside-tempest', 'survival', 'Does being shut in by the storm frighten a young lady like you?',
      'A little thrilling, honestly, detective \u2014 like the last act of a play where no one may leave! Though the thunder does keep startling the candles.', 'surprised', [
        rep('You\u2019re braver than you pretend.', 'Braver than they credit, at least. One is rarely frightened while one is busy watching everyone else be frightened.', 'thoughtful', 1),
        rep('Most here seem rather on edge.', 'Deliciously so. Fear makes people honest, detective \u2014 they quite forget to arrange their faces.', 'neutral'),
        rep('Enjoying the fear rather too much, aren\u2019t you?', 'Am I? Perhaps. A girl takes her entertainment where the evening offers it \u2014 and tonight it offers rather a lot.', 'suspicious', 0, 1),
      ]),
  ],
}
