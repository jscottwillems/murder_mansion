// Pack C closings — Jazz Vocalist, Antiquarian, Off-Duty Chauffeur, Debutante.
// Plain spoken wrap-ups. Short sentences. No purple metaphor.
// Resolve never concedes guilt. No murder/death/body language.
import type { AuthoredClosings } from './types'

export const CLOSINGS_C: Record<string, AuthoredClosings> = {
  // ── Jazz Vocalist ──────────────────────────────────────────────────
  'vocalist-perfume': {
    resolve: { line: 'My scarf sat folded in its case the whole set. The gardenia turned up in a hall I never walked. Scent travels — I didn’t.', emotion: 'thoughtful' },
    noReveal: { line: 'My gardenia stayed in its case. Whoever left that trail in the hall, it wasn’t me.', emotion: 'neutral' },
  },
  'vocalist-powder': {
    resolve: { line: 'My ivory spilled on the dressing table. Someone else pressed a card edge into it on that door. My powder — not my hand at the keyhole.', emotion: 'neutral' },
    noReveal: { line: 'That door’s powder isn’t my shade. Mine stayed on my own collar. Someone else pressed that door.', emotion: 'neutral' },
  },
  'vocalist-wax': {
    resolve: { line: 'Something with teeth sat on my grip wax while I wasn’t looking — a brass key, from the shape. The wax took the impression. That doesn’t mean I did.', emotion: 'worried' },
    noReveal: { line: 'My wax is for a stubborn clasp, not a key. Whatever impression you’re chasing, it isn’t in my tin.', emotion: 'neutral' },
  },
  'vocalist-ink': {
    resolve: { line: 'I inked the score margin when the clock chimed. Same hour, same stain. Keeping time isn’t a crime.', emotion: 'neutral' },
    noReveal: { line: 'That hour isn’t on my charts. My ink marked my own tempo. Try another pen.', emotion: 'neutral' },
  },
  'vocalist-antiseptic': {
    resolve: { line: 'Throat wash — menthol and honey. It stings like carbolic and isn’t. I warmed up my voice. That’s all.', emotion: 'thoughtful' },
    noReveal: { line: 'No carbolic touched this scarf. Mine’s for a sore throat. That medicinal smell belongs to steadier hands.', emotion: 'neutral' },
  },
  'vocalist-earth': {
    resolve: { line: 'Palm matches my grip tin. Garden soil doesn’t. I dust my hands for the mic stand — I wasn’t in the conservatory.', emotion: 'neutral' },
    noReveal: { line: 'My chalk and that garden grit won’t match. The pale dirt came off someone else’s knees.', emotion: 'neutral' },
  },
  'vocalist-wool': {
    resolve: { line: 'Doorframe to my shoulder to the chair I draped the stole on. It brushed a splintered frame. Passing a door isn’t a plot.', emotion: 'thoughtful' },
    noReveal: { line: 'That strand never reaches my stole. Some other frayed coat brushed that hall.', emotion: 'neutral' },
  },
  'vocalist-polish': {
    resolve: { line: 'I shined the mic stand and the front of my locket — not the silver upstairs. Whoever handled the plate was messier than me.', emotion: 'neutral' },
    noReveal: { line: 'There’s nothing of mine on that silver. My polish stops at my stand and my locket.', emotion: 'neutral' },
  },
  'vocalist-oil': {
    resolve: { line: 'Stuck music-case latch — oil here, spring there, slick on my thumb. An honest fix. Nowhere past my case.', emotion: 'thoughtful' },
    noReveal: { line: 'I didn’t free whatever you’re pointing at. My thumb’s only slick from my own case lid.', emotion: 'neutral' },
  },
  'vocalist-note': {
    resolve: { line: 'Ask the guest who requested the tune — same hour my shorthand keeps. A song request. Nothing darker.', emotion: 'neutral' },
    noReveal: { line: 'No one asked me for that tune. That scrap isn’t my hand.', emotion: 'neutral' },
  },
  'vocalist-ear': {
    warm: { line: 'The humming moved from the side hall toward the stairs and cut off when another guest turned the corner. Someone was covering their nerves with my tune. Be careful where that leads.', emotion: 'thoughtful' },
    measured: { line: 'A door on the offbeat, hurried shoes, a melody sung too fast. That much is true. The name I think stays with me.', emotion: 'neutral' },
    hostile: { line: 'Corner me and you’ll get silence. I hear things — I don’t hand them to a man swinging at me.', emotion: 'angry' },
  },
  'vocalist-road': {
    warm: { line: 'I keep singing so a friend who once kept me singing never has to go quiet. I’ve lost rooms before I’d lose her.', emotion: 'worried' },
    measured: { line: 'The work follows the money, and the money leads to colder rooms than I came up in. There’s a friend I look after. Beyond that, my past is mine.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for my life story. Push again and this number’s over.', emotion: 'angry' },
  },
  'vocalist-room': {
    warm: { line: 'Trust the breath before a lie — it catches every time. The one who worries me holds a false calm too long. Watch that one. Don’t swing.', emotion: 'thoughtful' },
    measured: { line: 'One guest laughs a half-beat late, like they’re listening for something under the music. Make of that what you can.', emotion: 'neutral' },
    hostile: { line: 'I read a room to keep people safe, not to hand you a name to bruise. Good night.', emotion: 'angry' },
  },

  // ── Antiquarian ────────────────────────────────────────────────────
  'antiquarian-earth': {
    resolve: { line: 'Pale packing dust under the reliquary’s false base — on my fingertips, then along my hem toward the west panel. I handled the piece. That’s where I walked. Nothing more.', emotion: 'worried' },
    noReveal: { line: 'I handled no such reliquary tonight. That dust marks someone else’s path to the panel.', emotion: 'neutral' },
  },
  'antiquarian-polish': {
    resolve: { line: 'The streak on my catalog card matches the tin by the passage. I tested a hinge that looked too new. Noticing a forgery isn’t a crime.', emotion: 'neutral' },
    noReveal: { line: 'My authentication wax doesn’t match that tin. Whatever polished your fitting came from a different pot.', emotion: 'neutral' },
  },
  'antiquarian-resin': {
    resolve: { line: 'My resin is hours old and still tacky. Those passage flecks are years cured. I mended a veneer tonight — not old mischief.', emotion: 'thoughtful' },
    noReveal: { line: 'I mended no veneer tonight. That old amber answers to an older hand than mine.', emotion: 'thoughtful' },
  },
  'antiquarian-ink': {
    resolve: { line: 'I date every catalog card as I write it. Ink and hour match. Careful scholarship — not an indictment.', emotion: 'neutral' },
    noReveal: { line: 'That hour isn’t on my cards. The ink points elsewhere.', emotion: 'neutral' },
  },
  'antiquarian-antiseptic': {
    resolve: { line: 'Mine lifts old varnish. His cleans a wound. Same sting, different job. I was clearing clouded lacquer.', emotion: 'thoughtful' },
    noReveal: { line: 'My solvent strips lacquer, not infection. The medicinal trace you want is a surgeon’s, not a scholar’s.', emotion: 'neutral' },
  },
  'antiquarian-wool': {
    resolve: { line: 'Display case corner, then my elbow, then the ledge I steadied a piece on. I leaned over glass to look. That isn’t a charge.', emotion: 'neutral' },
    noReveal: { line: 'My coat snagged on nothing tonight. Some other dark sleeve leaned where you’re looking.', emotion: 'neutral' },
  },
  'antiquarian-perfume': {
    resolve: { line: 'Two people saw her lean over my shoulder to look at the piece. The scent came off her sleeve, not mine. Standing close proves nothing against me.', emotion: 'neutral' },
    noReveal: { line: 'Nobody leaned on my shoulder tonight, and I don’t wear gardenia. Whatever scent you’re chasing isn’t from me.', emotion: 'neutral' },
  },
  'antiquarian-powder': {
    resolve: { line: 'Match it to her compact — mine is chalk-white whiting, never ivory. She brushed past in a narrow passage. That’s as far as it goes.', emotion: 'thoughtful' },
    noReveal: { line: 'I don’t carry ivory powder. No compact brushed this coat. That cloud settled on another shoulder.', emotion: 'neutral' },
  },
  'antiquarian-oil': {
    resolve: { line: 'I oiled a seized lock — ward, bolt, oil on my thumb. Curiosity about an old mechanism. Nothing else.', emotion: 'thoughtful' },
    noReveal: { line: 'My case stayed shut. Whatever lock you’re tracing, my hand never freed it.', emotion: 'neutral' },
  },
  'antiquarian-note': {
    resolve: { line: 'You’ve got the accession number wrong — fix the last digits and it’s a condition report, not a plot. An examination. Nothing worse.', emotion: 'neutral' },
    noReveal: { line: 'That scrap isn’t mine. My catalogue notes stayed in my folio. You’re reading another hand.', emotion: 'neutral' },
  },
  'antiquarian-history': {
    warm: { line: 'There’s a servants’ route behind the paneling. One panel has fresh scratches around an old catch, beside the crooked landscape. Old wood freshly marked — that deserves attention.', emotion: 'thoughtful' },
    measured: { line: 'The house kept a concealed passage, and one catch shows recent use it shouldn’t. I note the damage. I don’t invent the hand behind it.', emotion: 'neutral' },
    hostile: { line: 'I won’t name a hand I never saw on that panel. The tour is over.', emotion: 'angry' },
  },
  'antiquarian-vocation': {
    warm: { line: 'I once signed my name to a piece that wasn’t what I claimed. I’ve wanted to correct that line ever since. Perhaps tonight I finally can.', emotion: 'worried' },
    measured: { line: 'A genuine piece is honest about its age. People and forgeries lie. I’ve spent a life mending neglect. What weighs on me beyond that stays put for now.', emotion: 'thoughtful' },
    hostile: { line: 'I didn’t offer my memoirs. Ask me about an object, or ask me nothing.', emotion: 'neutral' },
  },
  'antiquarian-guests': {
    warm: { line: 'The one who asked the reliquary’s price before its history frightens me. People who only see cost are capable of a great deal.', emotion: 'thoughtful' },
    measured: { line: 'One guest handles everything — and everyone — a shade too casually. Careless hands. Read that as you like.', emotion: 'neutral' },
    hostile: { line: 'I appraise objects, not suspects. I shield a pressured patron, not a wrongdoer. Don’t confuse them again.', emotion: 'angry' },
  },

  // ── Off-Duty Chauffeur ─────────────────────────────────────────────
  'chauffeur-solvent': {
    resolve: { line: 'Same label as the tin on the bench, sir. Battery solvent, not the doctor’s shelf. Working hands — that’s all.', emotion: 'neutral' },
    noReveal: { line: 'My cuff answers the garage tin, not the surgery. Whoever left that antiseptic, it wasn’t me.', emotion: 'neutral' },
  },
  'chauffeur-wool': {
    resolve: { line: 'Mine frayed at the wrist on a seat spring. If your thread’s elbow-high and coarser, it can’t be my coat.', emotion: 'thoughtful' },
    noReveal: { line: 'Wrist tear, finer weave — that latch thread’s a different coat. Look to another man’s sleeve.', emotion: 'neutral' },
  },
  'chauffeur-polish': {
    resolve: { line: 'Tin, glove, garage latch, cuff. One trail, all garage. My hand on the badge — not the silver upstairs.', emotion: 'neutral' },
    noReveal: { line: 'That polish trail ends at the garage door. The smear upstairs came off someone else.', emotion: 'neutral' },
  },
  'chauffeur-ink': {
    resolve: { line: 'Log entry dated to the chime I wrote by. A careful driver’s record. That doesn’t make me guilty of anything.', emotion: 'neutral' },
    noReveal: { line: 'My log doesn’t match your hour. That stain was another man’s pen.', emotion: 'neutral' },
  },
  'chauffeur-earth': {
    resolve: { line: 'Knee grit matches the drive gravel, not the garden. I was under the motor. Not in the conservatory.', emotion: 'thoughtful' },
    noReveal: { line: 'Drive grit is coarse and sandy. That garden dust isn’t. I wasn’t on my knees indoors.', emotion: 'neutral' },
  },
  'chauffeur-perfume': {
    resolve: { line: 'Smell the back seat — same gardenia as my collar. Came off my fare when I shut her door. A man in oil and wool doesn’t buy French scent.', emotion: 'neutral' },
    noReveal: { line: 'No gardenia rode with me tonight. That perfume isn’t off my collar.', emotion: 'neutral' },
  },
  'chauffeur-powder': {
    resolve: { line: 'Ask the footman — he watched her powder her face and step out of my cab. I held the door. That’s the job.', emotion: 'neutral' },
    noReveal: { line: 'No powdered lady rode in my cab tonight. That face powder came off someone else’s fare.', emotion: 'neutral' },
  },
  'chauffeur-oil': {
    resolve: { line: 'Can, thumb, rag, throttle linkage. All garage. Ties me to my own motor — that’s the whole of it.', emotion: 'thoughtful' },
    noReveal: { line: 'That oil never left the garage with me. Whatever you’re chasing, someone else oiled it.', emotion: 'neutral' },
  },
  'chauffeur-wax': {
    resolve: { line: 'Press the knot, stick cracks, fleck on the cuff. Same every time. I was paid to carry a sealed parcel. That’s the job.', emotion: 'neutral' },
    noReveal: { line: 'I pressed no wax tonight. That fleck broke off another man’s stick.', emotion: 'neutral' },
  },
  'chauffeur-note': {
    resolve: { line: 'Your hour’s wrong — it’s a quarter later. Fix it and it’s a fare waiting on a car, not a getaway. Booked isn’t guilty.', emotion: 'thoughtful' },
    noReveal: { line: 'That scrap isn’t mine. My fares stay in my own shorthand.', emotion: 'neutral' },
  },
  'chauffeur-traffic': {
    warm: { line: 'One guest used the service door twice and played dumb about it. Same step both times — left heel drags when they hurry. Second trip after the hall clock, before the next thunder. That’s what I heard.', emotion: 'thoughtful' },
    measured: { line: 'Service door twice, left heel dragging, second run after the chime. The face I won’t swear to. Vague’s better than wrong.', emotion: 'neutral' },
    hostile: { line: 'I won’t point at a gentleman so the driver becomes the tidy answer later. I’ve been that once. Not again.', emotion: 'angry' },
  },
  'chauffeur-standing': {
    warm: { line: 'What I want is to be believed. Give a working man that, and I’ll tell you every road I drove tonight.', emotion: 'thoughtful' },
    measured: { line: 'People talk in front of a driver like he’s furniture. I hear plenty. I’ll tell a man who’ll credit it.', emotion: 'neutral' },
    hostile: { line: 'If I’m only the help to you, the help’s got nothing to say. Engine off.', emotion: 'angry' },
  },
  'chauffeur-fares': {
    warm: { line: 'Watch the one who eyed the road behind us the whole way up, then overpaid at the door. Fear and money together — that’s worth reading.', emotion: 'thoughtful' },
    measured: { line: 'You learn a person from the back seat. One rode looking backward the whole way. I won’t name him for you.', emotion: 'neutral' },
    hostile: { line: 'A man who paid for my quiet on a trip hasn’t bought me for worse. We’re parked.', emotion: 'angry' },
  },

  // ── Debutante ──────────────────────────────────────────────────────
  'debutante-earth': {
    resolve: { line: 'Grit spilled here, an odd repaired heel clicked there, both end at that crooked panel. I followed the mess. I didn’t make it.', emotion: 'thoughtful' },
    noReveal: { line: 'That path never crosses mine. My slippers stayed in the card room. Someone else’s shoes tracked the conservatory.', emotion: 'neutral' },
  },
  'debutante-perfume': {
    resolve: { line: 'Three players will swear I never left the card table. My scent wandered the hall without me. The gardenia went — I didn’t.', emotion: 'neutral' },
    noReveal: { line: 'I never rose from the table, and my bottle stayed capped. Some other woman perfumed that hall.', emotion: 'neutral' },
  },
  'debutante-powder': {
    resolve: { line: 'Glove seams in the latch powder match the ones pressed into my vanity lining — same stranger’s hand, not mine. My powder’s on the brass. Their hand spread it.', emotion: 'thoughtful' },
    noReveal: { line: 'That isn’t even my shade. My compact spilled on my collar, nowhere near the latch.', emotion: 'neutral' },
  },
  'debutante-ink': {
    resolve: { line: 'I dated the page to the chime. Ink and hour agree. A girl who keeps time isn’t a girl with a plot.', emotion: 'neutral' },
    noReveal: { line: 'My diary marked a different minute. That stain kept someone else’s hour.', emotion: 'neutral' },
  },
  'debutante-antiseptic': {
    resolve: { line: 'It’s acetone — pear-drops, not medicine. I redid a chipped nail. Same sting as carbolic, different bottle.', emotion: 'thoughtful' },
    noReveal: { line: 'Vanity acetone, not a surgeon’s bottle. That antiseptic clings to steadier hands than mine.', emotion: 'neutral' },
  },
  'debutante-wool': {
    resolve: { line: 'He lent me his coat on the terrace. It snagged on my bracelet and shed all over my shoulders. His wool on me — not me somewhere I shouldn’t be.', emotion: 'neutral' },
    noReveal: { line: 'I borrowed no coat tonight. My wrap is silk. That wool belongs to someone else.', emotion: 'neutral' },
  },
  'debutante-polish': {
    resolve: { line: 'Back and clasp of my hand-mirror — never the handle, never the big silver. Get that right.', emotion: 'neutral' },
    noReveal: { line: 'I polished nothing tonight. Your smear belongs to some other tidy hand.', emotion: 'neutral' },
  },
  'debutante-oil': {
    resolve: { line: 'Stubborn music-box comb — oil here, cylinder springs, slick on my thumb. A waltz I mended. Nothing cleverer.', emotion: 'thoughtful' },
    noReveal: { line: 'My music box never jammed. Whatever you’re tracing, a cleverer hand oiled it.', emotion: 'neutral' },
  },
  'debutante-wax': {
    resolve: { line: 'Ask my friend — she has the letter, and her seal matches the fleck on my glove. A sealed letter. A girl’s secret isn’t a girl’s guilt.', emotion: 'neutral' },
    noReveal: { line: 'I sealed no letter tonight. There’s no fleck on my glove to match. That wax hardened on someone else’s secret.', emotion: 'neutral' },
  },
  'debutante-note': {
    resolve: { line: 'My marks match the card table’s score sheet — same hand, same night. A tally. Not a scheme.', emotion: 'thoughtful' },
    noReveal: { line: 'That scrawl isn’t mine. My tally stayed in my bag. Someone else scratched that note.', emotion: 'neutral' },
  },
  'debutante-glance': {
    warm: { line: 'Two guests swapped a key under the card table while explaining the rules to me. Long brass one, into a left coat pocket, just before its new owner left alone. I saw the whole of it.', emotion: 'thoughtful' },
    measured: { line: 'A brass key changed hands under the table during cards. Where it went after, I’ll say when I’m sure you’ll use it kindly.', emotion: 'neutral' },
    hostile: { line: 'Bully a girl who can count and you’ll get pretty nothing. We’re finished.', emotion: 'angry' },
  },
  'debutante-underestimated': {
    warm: { line: 'I’m fighting for my own money and the right to say what I saw. Give me that, and I’ll give you the truth I’ve been counting all night.', emotion: 'worried' },
    measured: { line: 'People say anything in front of a girl they think can’t count. I count beautifully. I’m after what’s mine.', emotion: 'neutral' },
    hostile: { line: 'Smile, nod, be filed away — not tonight. If that’s your tone, we’re done.', emotion: 'suspicious' },
  },
  'debutante-watchers': {
    warm: { line: 'Watch the one who counted the exits every time the thunder covered it. People only count the doors when they mean to use one.', emotion: 'thoughtful' },
    measured: { line: 'One guest mapped the exits under the thunder. A figure changed hands under the card table. I give you what I saw, not what it means.', emotion: 'neutral' },
    hostile: { line: 'Press me like that and you’ll get the decorative version and nothing else.', emotion: 'suspicious' },
  },
}
