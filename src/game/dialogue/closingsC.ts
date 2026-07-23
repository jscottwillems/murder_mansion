// Pack C closings — Jazz Vocalist, Antiquarian, Off-Duty Chauffeur, Debutante.
// Bespoke thread wrap-ups keyed by route id. Each evidence route defines a
// `resolve` closing (the guest's final word as the association is recorded);
// each rapport route defines `warm`/`measured`/`hostile` closings, one per
// stance. Anything omitted falls back to already-authored dialogue, then a
// generic engine line, so a thread is always playable.
//
// Voice discipline follows docs/NARRATIVE_BIBLE.md §8. Resolve lines never
// concede guilt — a trace establishes association only — and never use
// murder/death/body language (the knowledge-state guard applies throughout).
import type { AuthoredClosings } from './types'

export const CLOSINGS_C: Record<string, AuthoredClosings> = {
  // ── Jazz Vocalist ──────────────────────────────────────────────────
  'vocalist-perfume': {
    resolve: { line: 'There — the gardenia hangs in a hall I never walked, while my scarf sat folded in its case the whole set. Write it as scent on the loose, detective. It travels where a girl’s feet never did, and that places me nowhere worse.', emotion: 'thoughtful' },
    noReveal: { line: 'Set that scented corridor against my scarf and the two won\u2019t sing together — my gardenia stayed folded in its case the whole set. Whoever left that trail of blossom in the hall, it wasn\u2019t this girl. Follow the perfume to another wrist.', emotion: 'neutral' },
  },
  'vocalist-powder': {
    resolve: { line: 'Lay the seam in that door’s powder beside the card carrier’s edge — they answer each other, and neither wears my hand. Note it plain: my ivory spilled, someone else pressed it. It puts my powder on the door, not me at the keyhole.', emotion: 'neutral' },
    noReveal: { line: 'Hold that door\u2019s ivory up to my compact and the shades refuse to rhyme — what cracked across my dressing table never once dusted that keyhole. My powder kept to my own collar all night. The hand that pressed the door wore some other girl\u2019s shade.', emotion: 'neutral' },
  },
  'vocalist-wax': {
    resolve: { line: 'You’ve pressed it yourself now — teeth-down, the brass sits back into the cake just as it did while I wasn’t looking. Set the little scene in your book. The wax took that key’s shape; it doesn’t follow that I did.', emotion: 'worried' },
    noReveal: { line: 'Press that brass key into my grip wax all evening — it won\u2019t seat the way you want it to. My amber cake is for a stubborn clasp and slippery hands, never a keyhole. The impression you\u2019re chasing was pressed into somebody else\u2019s tin.', emotion: 'neutral' },
  },
  'vocalist-ink': {
    resolve: { line: 'There it is — the margin inked to the very chime I marked it by, hour and stain holding the same note. Write down the minute if you must. Keeping good time makes me punctual, detective, not guilty of anything under it.', emotion: 'neutral' },
    noReveal: { line: 'Fix my inked margin to your chime and the hours fall on different beats. My blue-black stayed on my own charts, marking my own tempo. That stain you\u2019re following kept a stranger\u2019s appointment, not mine.', emotion: 'neutral' },
  },
  'vocalist-antiseptic': {
    resolve: { line: 'Test the scarf and you have your answer — throat wash and menthol, a sting that only borrows the surgeon’s tune. Record it as a singer’s vanity. It shares a bite with carbolic and shares nothing else, and it ties me to a warm-up, no worse.', emotion: 'thoughtful' },
    noReveal: { line: 'Test the scarf and the note won\u2019t hold — my throat wash only borrows the surgeon\u2019s sting; underneath it\u2019s menthol and honey. No carbolic ever touched me tonight. That medicinal trace clings to a steadier hand than a singer\u2019s.', emotion: 'neutral' },
  },
  'vocalist-earth': {
    resolve: { line: 'Set my palm beside the grip tin and then beside your garden — the chalk is milled even, the soil never is. They won’t harmonize, and now your own notes say so. It marks the tin in my case, not my knees in the conservatory.', emotion: 'neutral' },
    noReveal: { line: 'Lay my grip chalk beside your garden grit, and they won\u2019t harmonize — mine\u2019s milled even, the soil\u2019s a mess. My palms only ever met the microphone stand. That pale conservatory dirt came off somebody else\u2019s knees.', emotion: 'neutral' },
  },
  'vocalist-wool': {
    resolve: { line: 'Follow it the whole soft way — splintered doorframe to my shoulder to the chair I draped it on. That’s the journey of my stole, start to rest. Trace it right and it carries me past a door, no further than that.', emotion: 'thoughtful' },
    noReveal: { line: 'Trace that coarse strand from the splintered doorframe, and the trail never once reaches my stole — my black wool kept to my own shoulders all set. Follow it back and it starts on a coat that was never mine. Some other frayed hem brushed that hall.', emotion: 'neutral' },
  },
  'vocalist-polish': {
    resolve: { line: 'No — the neck of the stand and the front of the locket, never its back; you’ve got that part wrong. Mind you write the correction. Whoever handled the silver upstairs was far less careful than I, and my smear only reaches my own two things.', emotion: 'neutral' },
    noReveal: { line: 'Tell me I buffed the back of that silver too, and I\u2019ll only shrug — there\u2019s nothing of mine on it to correct. My polish reaches my stand and my locket and stops cold. The bright smear you\u2019re tracing came off a different hand entirely.', emotion: 'neutral' },
  },
  'vocalist-oil': {
    resolve: { line: 'Watch it once more — I free the latch here, it springs there, the oil catches my thumb, plain as a downbeat. Put the little fix in your record. It lands exactly where an honest hand would leave it and points nowhere past my case.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me work that latch a hundred times — no oil of mine springs where you\u2019re pointing. My thumb\u2019s only slick from a stuck music case, plain as a rest between verses. Whatever mechanism you\u2019re tracing, my hand never freed it.', emotion: 'neutral' },
  },
  'vocalist-note': {
    resolve: { line: 'Ask the guest who wanted the tune and they’ll hum back the same hour my shorthand keeps — the note and the wish, one melody. Set it down as a request answered. It ties me to a song a guest asked for, detective, and to nothing darker.', emotion: 'neutral' },
    noReveal: { line: 'Ask the guest who\u2019s meant to have wanted that tune, and they\u2019ll hum back nothing — no such request was ever mine. My shorthand keeps its own little melodies, tucked in my own glove. That torn scrap was scribbled by another hand.', emotion: 'neutral' },
  },
  'vocalist-ear': {
    warm: { line: 'Since you’ve been gentle with me, I’ll give you the true bar: the humming moved from the side hall toward the stairs and cut off the moment another guest turned the corner. Someone was covering their nerves with my own tune. I’ll trust you with the sound — be gentle with wherever it leads.', emotion: 'thoughtful' },
    measured: { line: 'I’ll lend you the rhythm and keep the rest, detective. A door on the offbeat, hurried shoes, a borrowed melody sung a shade too fast — that much is true and that much you may have. The name I think it was stays behind my teeth.', emotion: 'neutral' },
    hostile: { line: 'If you’d rather corner me than listen, you’ll get silence and a tuned-up band, nothing more. I hear things, detective. I don’t hand them to a man swinging at me. We’re through.', emotion: 'angry' },
  },
  'vocalist-road': {
    warm: { line: 'The honest verse, since you’ve earned it: I keep singing so the friend who once kept me singing never has to go quiet again. I’ve lost rooms and wages before I’d lose her, and I’d lose them twice over without missing a beat.', emotion: 'worried' },
    measured: { line: 'Call it following the work, detective — the work follows the money, and the money leads to colder rooms than I came up in. There’s a friend I look after and a tune I won’t lose. Beyond that, my past is my own set list.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for my life story and I’m done offering it. Push me like that again and the only thing you’ll hear from me is the downbeat. This number’s over.', emotion: 'angry' },
  },
  'vocalist-room': {
    warm: { line: 'Quietly, because you’ve listened kindly — trust the breath before a lie; it catches every time, like a singer missing a cue. The one who worries me holds a false calm too long, and real calm has to breathe. Watch that one, but watch, don’t swing.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you the sound and keep the sentence, detective. One guest laughs a half-beat late, like they’re listening for something under the music. Make of the pitch what your evidence allows; I only sing you what I hear.', emotion: 'neutral' },
    hostile: { line: 'Mistake my ear for cheap gossip again and the set ends here. I read a room to keep people safe, not to hand you a name to bruise. Good night, detective.', emotion: 'angry' },
  },

  // ── Antiquarian ────────────────────────────────────────────────────
  'antiquarian-earth': {
    resolve: { line: 'Then enter it precisely: the pumice packing fell from the reliquary’s false base, marked my fingertips, and tracked along the hem to the west panel. That is a chain of custody, not a confession. Where such dust settles is where I walked, no more — and I do apologize to the piece for the handling.', emotion: 'worried' },
    noReveal: { line: 'Trace that pumice packing from the false base and the chain breaks well before my hem — I handled no such reliquary tonight, and even a medieval one sheds only on the hand that lifts it. The pale dust marks another\u2019s route to the panel entirely. Follow it there, and mind the wood as you go.', emotion: 'neutral' },
  },
  'antiquarian-polish': {
    resolve: { line: 'Compare them and be done — the streak on the catalog card and the tin by the passage share one formula exactly. Record the match. It attests that I tested an impertinently modern hinge; it does not attest to anything graver.', emotion: 'neutral' },
    noReveal: { line: 'Compare the streak on that card with the tin by the passage and the formulas simply refuse each other — my authentication wax follows a conservator\u2019s old recipe, quite distinct from any common brightener. Whatever polished the fitting you\u2019re chasing came from a different pot. The provenance is not mine.', emotion: 'neutral' },
  },
  'antiquarian-resin': {
    resolve: { line: 'Note the two ages side by side: my resin is hours old and still tacky, while the flecks in the passage are generations cured. Time itself parts our hands. It dates me to a veneer I mended tonight, and to no older mischief.', emotion: 'thoughtful' },
    noReveal: { line: 'Date any resin of mine against those flecks in the passage and the years part us at once — I mended no veneer tonight, while that amber cured a generation before my hand was near it. Time is the honestest appraiser there is. The old fleck answers to an older hand than mine.', emotion: 'thoughtful' },
  },
  'antiquarian-ink': {
    resolve: { line: 'Fix the card to the chime, then — the ink and the hour concur to the minute, for I date every entry as I make it. Set the correspondence in your record. Meticulous scholarship places me at my catalogue, detective, and pedantry is not an indictment.', emotion: 'neutral' },
    noReveal: { line: 'Fix my dated card to your chime and the minutes decline to meet — I inscribe every entry to the hour, and my hour is plainly not the one you want. Meticulous record-keeping cuts both ways. Here the ink acquits me and directs you elsewhere.', emotion: 'neutral' },
  },
  'antiquarian-antiseptic': {
    resolve: { line: 'Analyse the fluid and the confusion resolves: mine dissolves old varnish, the surgeon’s cleans a wound — a shared reek is the poorest provenance there is. Enter it as a conservator’s spirit. It places me at a clouded lacquer, nothing nearer to harm.', emotion: 'thoughtful' },
    noReveal: { line: 'Analyse the spirit on my cuff and it will confess to lifting varnish, never to dressing a wound — a shared reek is the poorest provenance there is. My conservator\u2019s solvent borrows carbolic\u2019s bite and nothing else. The medicinal trace you want belongs to a surgeon\u2019s hand, not a scholar\u2019s.', emotion: 'neutral' },
  },
  'antiquarian-wool': {
    resolve: { line: 'Trace the whole scholarly little journey — the display case corner to my elbow to the ledge I steadied a piece upon. That is provenance for a thread, and I grant it freely. It sets me leaning over glass to admire, which is no charge at all.', emotion: 'neutral' },
    noReveal: { line: 'Trace that coarse strand from the display case and the little journey never arrives at my elbow — my scholar\u2019s coat is a finer, better-documented weave, and it snagged on nothing tonight. Some other dark coat leaned where you\u2019re looking. The thread\u2019s provenance ends far from me.', emotion: 'neutral' },
  },
  'antiquarian-perfume': {
    resolve: { line: 'Ask the two who watched, and they will place her at my shoulder, her sleeve against my coat. Record their account beside the scent. It documents an admirer’s enthusiasm transferred to my collar — proximity, which authenticates nothing against me.', emotion: 'neutral' },
    noReveal: { line: 'Ask your onlookers whether any admirer pressed close to me tonight, and they will place no one at my shoulder — for no one leaned there. A gardenia never settled on this collar by my doing. The scent you follow rode in on another\u2019s sleeve entirely.', emotion: 'neutral' },
  },
  'antiquarian-powder': {
    resolve: { line: 'Match the shade to her compact, then against my own whiting, which is chalk-white and never ivory — the distinction is decisive. Note the comparison carefully. Her powder settled on my sleeve in a narrow passage; that is where it places me and no further.', emotion: 'thoughtful' },
    noReveal: { line: 'Match the ivory you found against my sleeve and the shades will not answer each other — I carry only chalk-white whiting for restoration, never a lady\u2019s powder. No compact brushed this coat tonight in any passage. That cloud settled on some other shoulder.', emotion: 'neutral' },
  },
  'antiquarian-oil': {
    resolve: { line: 'Observe it again: I ease the ward here, the bolt springs there, and the oil catches my thumb — a scholar reading a two-century mechanism. Enter the reconstruction. It marks a lock I could not leave frozen; it does not mark me otherwise.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me ease that seized lock again and no oil of mine springs where you expect — my case stayed shut and my hands dry the whole evening. A two-century mechanism found some other curious scholar tonight, if it found one at all. The slick you\u2019re tracing is not off my thumb.', emotion: 'neutral' },
  },
  'antiquarian-note': {
    resolve: { line: 'No — your accession number is transposed; restore the final digits and the “plot” resolves into a plain condition report. I do beg the object’s pardon for the correction, but accuracy is owed it. It records an examination, detective, and nothing worse of me.', emotion: 'neutral' },
    noReveal: { line: 'Read that accession code back to me however you please — I have nothing to restore, for the slip is none of mine. My catalogue shorthand stays in my own folio, and this scrap answers to a stranger\u2019s ledger. You are misreading another hand, detective, not mine.', emotion: 'neutral' },
  },
  'antiquarian-history': {
    warm: { line: 'Since you ask with patience — there is a servants’ route behind the paneling, and one panel wears fresh scratches around an ancient catch, beside the landscape that hangs crooked in the west passage. Old wood freshly marked earns attention. I give you the moment gladly; be as careful with it as I would be with the wood.', emotion: 'thoughtful' },
    measured: { line: 'I will offer the history and withhold the speculation: the house kept a concealed passage, and one catch shows recent use it has no business showing. Where it leads is yours to trace. I catalogue the damage; I do not invent the hand behind it.', emotion: 'neutral' },
    hostile: { line: 'You would have me name a hand I never saw upon that panel. I will not. History is accustomed to being rushed by people who do not understand it — the tour is over, detective.', emotion: 'angry' },
  },
  'antiquarian-vocation': {
    warm: { line: 'The honest answer, since you have listened: objects keep their promises, and I once signed my name to one that did not keep its. I have wanted to correct that single line ever since. Perhaps, handled gently, tonight is when I finally do.', emotion: 'worried' },
    measured: { line: 'Call it a temperament, detective. A genuine piece is honest about its age; only people and their forgeries lie, and I have spent a life mending the past’s neglect. What weighs on me beyond that stays in its case for now.', emotion: 'thoughtful' },
    hostile: { line: 'I did not offer my memoirs and you plainly do not want them, only a lever. Erudition withdrawn. Ask me of an object, or ask me nothing at all.', emotion: 'neutral' },
  },
  'antiquarian-guests': {
    warm: { line: 'Off the record, since you have earned the courtesy: the one who asked the reliquary’s price before its history frightens me most. Value without reverence is a kind of vandalism, and vandals are capable of a great deal. Watch that one the way I watch for a forged hinge.', emotion: 'thoughtful' },
    measured: { line: 'Impressions I have catalogued in abundance; names I withhold. One guest handles everything — and everyone — a shade too casually. Careless hands, careless conscience. Read the wear pattern as you like.', emotion: 'neutral' },
    hostile: { line: 'I appraise objects, detective, not suspects for your convenience, and I shield a pressured patron, not a wrongdoer. Confuse the two again and the gallery closes. We may return the topic to its case.', emotion: 'angry' },
  },

  // ── Off-Duty Chauffeur ─────────────────────────────────────────────
  'chauffeur-solvent': {
    resolve: { line: 'There’s the tin on the bench, sir — same label as my cuff, none of it off the doctor’s shelf. Set the two side by side and write what you see. It puts battery solvent on my sleeve, not a surgeon’s work, and that’s the whole of what it puts on me.', emotion: 'neutral' },
    noReveal: { line: 'Hold my cuff to the motor tin, sir, then to the doctor\u2019s shelf. It answers the garage, not the surgery. That sharp bite is battery solvent, nothing off a medical bottle. Whoever left the antiseptic you\u2019re after, it wasn\u2019t this hand.', emotion: 'neutral' },
  },
  'chauffeur-wool': {
    resolve: { line: 'Look and you can’t miss it, sir — mine frayed at the wrist on a seat spring; that passage thread’s elbow-high and a coarser weave. Two coats, two weaves. It can’t be mine, and it can’t put me at that latch.', emotion: 'thoughtful' },
    noReveal: { line: 'Set my wrist tear against that latch thread, sir. Mine\u2019s a finer weave, frayed low; that one\u2019s coarse and elbow-high. They can\u2019t be the same coat. Look to another man\u2019s sleeve.', emotion: 'neutral' },
  },
  'chauffeur-polish': {
    resolve: { line: 'Follow it straight, sir — tin, glove, garage latch, cuff. One trail, all garage, nowhere near the dining room. Log it that way. It places my hand on the badge, not on the silver upstairs.', emotion: 'neutral' },
    noReveal: { line: 'Follow that polish, sir — tin, glove, garage latch — and the trail ends flat at the garage door. It never once climbs to the dining room. The smear on the silver upstairs came off a hand that isn\u2019t mine.', emotion: 'neutral' },
  },
  'chauffeur-ink': {
    resolve: { line: 'The entry’s dated to the chime I wrote by, sir — ink and hour say the same thing to the minute. Put the time down. A driver who keeps a careful log keeps himself honest; it doesn’t make him guilty of aught.', emotion: 'neutral' },
    noReveal: { line: 'Line my log entry up against your chime, sir, and the hours don\u2019t meet. My ink marked my own runs, at my own time. That stain you\u2019re chasing was set down by another man\u2019s pen.', emotion: 'neutral' },
  },
  'chauffeur-earth': {
    resolve: { line: 'Set my knee-grit against the drive gravel, sir, then against the garden — mine’s coarse and sandy, theirs isn’t. They won’t match. It puts me under the motor on the drive, not on my knees in the conservatory.', emotion: 'thoughtful' },
    noReveal: { line: 'Set my knee-grit by the drive gravel, sir, then by the garden. It matches the drive and not the garden — mine\u2019s coarse and sandy; that conservatory dust isn\u2019t. Two different grounds. I was never down on my knees indoors.', emotion: 'neutral' },
  },
  'chauffeur-perfume': {
    resolve: { line: 'Smell the back seat, sir — same gardenia as my collar. It came off my fare, not out of my pocket. A man in oil and wool don’t buy French scent. It places a passenger in my cab, and nothing worse on me.', emotion: 'neutral' },
    noReveal: { line: 'Smell my collar against that corridor, sir, and they won\u2019t line up. No gardenia rode with me tonight; the back seat carried no such fare. A man in oil and wool doesn\u2019t leave French scent where you\u2019re pointing. That perfume clings to somebody else.', emotion: 'neutral' },
  },
  'chauffeur-powder': {
    resolve: { line: 'Ask the footman, sir — he watched her powder her face and step down from my cab. His word and my shoulder agree. It marks me the driver who held her door, not a hand at anything else.', emotion: 'neutral' },
    noReveal: { line: 'Ask the footman, sir — he\u2019ll swear no powdered lady rode in my cab tonight, because none did. There\u2019s no ivory on my shoulder to account for. That face powder settled off some other man\u2019s fare.', emotion: 'neutral' },
  },
  'chauffeur-oil': {
    resolve: { line: 'One trail, sir — can to thumb to the rag in my pocket to the linkage. All garage, none of it near the house. Trace it and log it. It ties me to my own motor, and that’s the whole of what it ties me to.', emotion: 'thoughtful' },
    noReveal: { line: 'Trace that oil, sir — can, thumb, rag — and it never leaves the garage. My hands stayed on my own motor tonight. The delicate thing you\u2019re chasing was oiled by somebody else\u2019s fingers.', emotion: 'neutral' },
  },
  'chauffeur-wax': {
    resolve: { line: 'Watch me seal another, sir — I press the knot here, the stick cracks there, the fleck lands on my cuff. Same every time. It marks me a man paid to carry a sealed parcel, not a hand in whatever you’re chasing.', emotion: 'neutral' },
    noReveal: { line: 'Have me seal a parcel over and over, sir — no fleck of mine matches that amber. I pressed no wax tonight; my cuff\u2019s clean of it. The seal you\u2019re tracing broke off another man\u2019s stick.', emotion: 'neutral' },
  },
  'chauffeur-note': {
    resolve: { line: 'Your hour’s wrong, sir — it’s a quarter later; fix it and the “getaway” reads as a fare waiting on a car. Write down the right time. It logs a pickup I was booked for, and booked isn’t guilty, whatever my station.', emotion: 'thoughtful' },
    noReveal: { line: 'Read that pickup hour back wrong all you like, sir — I\u2019ve nothing to fix, because the scrap isn\u2019t mine. My fares stay in my own shorthand. That torn note was scratched down by another driver\u2019s hand, not this one.', emotion: 'neutral' },
  },
  'chauffeur-traffic': {
    warm: { line: 'Since you’re asking me straight, sir, I’ll tell it straight: one guest used the service door twice and played it like they’d never seen the thing. Same step both times — heel drags on the left when they hurry. Second trip came after the hall clock chimed, before the next thunder. That’s a witness talking, not the help guessing.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you what I heard and keep what I guess, sir. A step through the service door twice, a left heel dragging when it hurried, the second run after the chime. The face I won’t swear to. Vague’s better than wrong.', emotion: 'neutral' },
    hostile: { line: 'You want me to point at a gentleman on my say-so, then pin it on the driver if it turns sour. I’ve been that tidy answer once, sir. Not again. We’re done.', emotion: 'angry' },
  },
  'chauffeur-standing': {
    warm: { line: 'Cap off, then, sir — what I want is to be counted. Believe a working man when he tells you what he saw, and I’ll give you every road I drove tonight, every stop, every hour of it.', emotion: 'thoughtful' },
    measured: { line: 'It’s restful work, being furniture, sir — people talk in front of a driver like he’s upholstery, so I hear plenty. I keep my own counsel and I keep it clean. What I saw, I’ll tell a man who’ll credit it.', emotion: 'neutral' },
    hostile: { line: 'If I’m only the help to you, sir, then the help’s got nothing to say. I’ll not be the tidy neck the gentry pin it on. Engine off. We’re through.', emotion: 'angry' },
  },
  'chauffeur-fares': {
    warm: { line: 'Quiet between us, sir — watch the one who kept eyeing the road behind us the whole way up, then overpaid at the door. Fear and money together, that’s a story worth reading. I give you what I saw, not the verdict.', emotion: 'thoughtful' },
    measured: { line: 'You learn a person from the back seat, sir — where they’re soft, where they lie, what they tip when they’re scared. One rode looking backward the whole way. Make of it what you can; I’ll not name him for you.', emotion: 'neutral' },
    hostile: { line: 'I’ll not sell you a fare’s secrets to save myself the trouble, sir. A man who paid for my quiet on a trip hasn’t bought me for worse. Pull rank all you like — we’re parked.', emotion: 'angry' },
  },

  // ── Debutante ──────────────────────────────────────────────────────
  'debutante-earth': {
    resolve: { line: 'Retrace it and you’ll see, detective — the grit spilled here, the repaired heel clicked oddly there, and both end at that crooked panel. Write it down properly. The dust puts me behind someone else’s odd little heel; I followed the mess, I didn’t make it.', emotion: 'thoughtful' },
    noReveal: { line: 'Retrace that repaired heel from the spilled grit however you like, detective — the path simply never crosses mine. My slippers kept to the card room all evening. The pale conservatory dust followed some other, cleverer pair of shoes.', emotion: 'neutral' },
  },
  'debutante-perfume': {
    resolve: { line: 'Set my perfume’s little stroll down the corridor against the card table where three players will swear I sat. I was losing at cards in plain view. Note it exactly. My scent wandered off without me — it places the gardenia in that hall, not me.', emotion: 'neutral' },
    noReveal: { line: 'Set that scented corridor against the card table, detective, and the two won\u2019t meet — three players will swear I never rose, and no gardenia of mine ever strayed. My little bottle stayed capped on the vanity. Some other woman perfumed that hall.', emotion: 'neutral' },
  },
  'debutante-powder': {
    resolve: { line: 'Match the glove seams in that latch powder to the ones pressed into my vanity lining — the same stranger’s hand made both, and neither is mine. Do look closely. My powder is on the brass; the hand that spread it there belongs to someone else entirely.', emotion: 'thoughtful' },
    noReveal: { line: 'Match the glove seams in that latch powder to my vanity lining, detective, and they refuse each other entirely — the ivory isn\u2019t even my shade. My compact spilled across my own collar, nowhere near the brass. A stranger\u2019s powder dressed that latch.', emotion: 'neutral' },
  },
  'debutante-ink': {
    resolve: { line: 'The page is dated to the very chime, detective — the ink and the hour agree, because I do date my pages. Write the minute down. A girl who can read a clock isn’t a girl with a plot; it only places me at my little book.', emotion: 'neutral' },
    noReveal: { line: 'Fix my dated page against your clock, detective, and the hours won\u2019t agree — my ink marked a minute all its own. A girl who dates her diary isn\u2019t a girl in your chronology. That blue-black stain kept somebody else\u2019s hour.', emotion: 'neutral' },
  },
  'debutante-antiseptic': {
    resolve: { line: 'Sniff it properly and it’s pear-drops, not medicine — acetone from my vanity case, the surgeon’s carbolic only borrowing the sting. Set that down. It places me at a chipped manicure, detective, and a shared reek isn’t a shared hand.', emotion: 'thoughtful' },
    noReveal: { line: 'Sniff my cuff properly, detective — it\u2019s pear-drops and acetone, not a surgeon\u2019s carbolic. The two only borrow the same sting. My vanity case never held a drop of medicine. That antiseptic clings to steadier hands than mine.', emotion: 'neutral' },
  },
  'debutante-wool': {
    resolve: { line: 'Follow the whole gallant little journey — the borrowed coat to my bracelet clasp to my shoulder, where the collar sat. That’s the road the thread took. Borrowing a man’s coat on a cold terrace puts his wool on me, detective, not me anywhere I shouldn’t be.', emotion: 'neutral' },
    noReveal: { line: 'Trace that coarse thread wherever it leads, detective — it never once arrives at my bracelet or my shoulder. I borrowed no gentleman\u2019s coat tonight, and my wrap is silk clean through. The wool belongs to another cold guest entirely.', emotion: 'neutral' },
  },
  'debutante-polish': {
    resolve: { line: 'No — the back and the clasp, never the handle; do get it right. Whoever handled the big silver was far less tidy than I. Note the correction. My smear reaches my own hand-mirror and stops there.', emotion: 'neutral' },
    noReveal: { line: 'Tell me I buffed the mirror\u2019s handle too, detective — I shan\u2019t correct you, because none of it is mine to correct. I polished no silver tonight, not a clasp nor a plate. Your careful smear belongs to some other tidy hand.', emotion: 'neutral' },
  },
  'debutante-oil': {
    resolve: { line: 'Watch me free it again — I oil the comb here, the cylinder springs there, the oil catches my thumb. There’s your mechanism, detective. It ties me to a stubborn waltz I mended myself, and to nothing cleverer than that.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me free that music box a dozen times, detective — no oil of mine springs where you\u2019re pointing. My thumb is quite clean tonight; the little movement never jammed at all. Whatever mechanism you\u2019re tracing, a cleverer hand than mine oiled it.', emotion: 'neutral' },
  },
  'debutante-wax': {
    resolve: { line: 'Ask my friend — she holds the letter, and her seal is twin to the fleck on my glove. Their halves agree. Set it down as a sealed letter, detective. A girl’s guarded secret isn’t a girl’s guilt; it only places the wax on my glove.', emotion: 'neutral' },
    noReveal: { line: 'Ask my friend for the matching half, detective, and she\u2019ll produce nothing — because I sealed no letter tonight. There\u2019s no amber fleck on my glove to twin. That wax hardened on someone else\u2019s secret entirely.', emotion: 'neutral' },
  },
  'debutante-note': {
    resolve: { line: 'Lay my marks beside the table’s score sheet, detective — same hand, same night, hand for hand. They match exactly. Write it down. A tally isn’t a scheme; it places me at the card table, keeping better books than they credited me for.', emotion: 'thoughtful' },
    noReveal: { line: 'Lay my shorthand beside the table\u2019s score sheet, detective, and the hands won\u2019t match — the scrawl simply isn\u2019t mine. My tally stayed tucked in my own little bag all night. Some other cramped hand scratched out that torn note.', emotion: 'neutral' },
  },
  'debutante-glance': {
    warm: { line: 'Since you’ve treated me as though I can count — and I can — I’ll tell you plainly: two guests swapped a key beneath the card table while explaining the rules to me. One long brass key, into a left coat pocket, just before its new owner left the room alone. I saw the whole of it.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you the shape of it and keep the names, detective. A key changed hands under the table during cards — the brass one, not the silver. Where it went after, I’ll tell you when I’m sure you’ll use it kindly.', emotion: 'neutral' },
    hostile: { line: 'How lovely, being cornered by a man who thinks a smile means empty. I fold. If you’d rather bully than believe me, you’ll get nothing but pretty nothing. We’re quite finished.', emotion: 'angry' },
  },
  'debutante-underestimated': {
    warm: { line: 'The true answer, since you asked the real me: I’m fighting for my own money and the right to say what I saw without a guardian deciding it for me. Give me that — my accounts, my accusation, my future — and I’ll give you the truth I’ve been counting all night.', emotion: 'worried' },
    measured: { line: 'Call it useful, detective. People say anything in front of a girl they think can’t count, and I count beautifully. I’m after what’s mine and the say-so over it. Beyond that, my papers stay sewn where they are for now.', emotion: 'neutral' },
    hostile: { line: '“Drop the act,” you say — how you all love ending things for me. Smile, nod, be filed away like a debut portrait. Not tonight. If that’s your tone, we’re done.', emotion: 'suspicious' },
  },
  'debutante-watchers': {
    warm: { line: 'Quietly, since you’ve listened: watch the one who counted the exits every time the thunder covered it. Nervous people fidget; that one was mapping a way out. People only count the doors when they mean to use one. I’d swear to it.', emotion: 'thoughtful' },
    measured: { line: 'I observe, detective — spying sounds so grubby. One guest mapped the exits under the thunder; a figure changed hands under the card table where I was dealt in. I give you what I saw, not what it means.', emotion: 'neutral' },
    hostile: { line: 'What a disappointing girl I must be, refusing to perform for you. I keep my names and my papers to myself. Press me like that and you’ll get the decorative version and nothing else.', emotion: 'suspicious' },
  },
}
