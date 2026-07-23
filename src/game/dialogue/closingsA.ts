// Pack A closings — Society Columnist, Retired Surgeon, Greenhouse Curator.
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

export const CLOSINGS_A: Record<string, AuthoredClosings> = {
  // ── Society Columnist ──────────────────────────────────────────────
  'columnist-ink': {
    resolve: { line: 'Fine — the ink on my hand and the ink on that torn corner are the same. Write it down. It puts my pen at the row, not my hand at anything worse.', emotion: 'thoughtful' },
    noReveal: { line: 'Hold the ink on my hand against that torn corner and they won’t match. Mine stains my own cuffs, never someone else’s scene. Look elsewhere for your pair.', emotion: 'neutral' },
  },
  'columnist-perfume': {
    resolve: { line: 'So the gardenia sat heavier on the glove than on my wrist. Note it, then. A trail of scent means I walked the house, which I’ve never denied.', emotion: 'neutral' },
    noReveal: { line: 'Piece it together however you like — no bottle of mine sprayed that glove. My gardenia stayed on my own wrist tonight. Some other woman trailed her scent through there.', emotion: 'neutral' },
  },
  'columnist-shorthand': {
    resolve: { line: 'There — twelve-ten, half a name, part of a room. Write it down, and mind what you do with it. A time and a torn scrap have ruined better people than tonight deserves.', emotion: 'worried' },
    noReveal: { line: 'Set my scrap against any hour you like; the times won’t meet. My shorthand kept its own appointments this evening, none of them yours. Chase a different clock.', emotion: 'neutral' },
  },
  'columnist-antiseptic': {
    resolve: { line: 'Ask the guest who pressed the bottle on me; they watched me use it. Put it in your notes — it says I bleed, not that I’m dangerous.', emotion: 'neutral' },
    noReveal: { line: 'Ask whoever you like about lending me a tonic; no one will confirm it, because no one did. My hands are only my own tonight. Try a more medicinal guest.', emotion: 'suspicious' },
  },
  'columnist-earth': {
    resolve: { line: 'Pot to hem, hem to hand, hand to bench — there’s your grubby little chain. It carries me into the conservatory and no further, so leave it there.', emotion: 'thoughtful' },
    noReveal: { line: 'Follow that grit from the pot to my hem all you like — it never crosses your trail. I kept to the carpets and ruined no gown for it. Someone else did the kneeling.', emotion: 'neutral' },
  },
  'columnist-wool': {
    resolve: { line: 'Silk against coarse wool — the strand came off a borrowed coat, and now your own notes say so. That closes the paragraph, I trust.', emotion: 'neutral' },
    noReveal: { line: 'Compare the weaves — coarse wool against my silk, and mine sheds nothing to your scene. No borrowed coat sat on these shoulders tonight. That strand belongs to another draught.', emotion: 'neutral' },
  },
  'columnist-polish': {
    resolve: { line: 'The lid, never the base — write it exactly, since you insist. I read an engraving. Curiosity leaves fingerprints; it doesn’t leave a confession.', emotion: 'thoughtful' },
    noReveal: { line: 'Tell me I smudged some engraving and I’ll only shrug — I read no one’s silver tonight. There’s nothing of mine on that clasp to correct. Your polished thief is another guest.', emotion: 'neutral' },
  },
  'columnist-powder': {
    resolve: { line: 'Match the shades and be done: mine’s the lighter, hers the cloud that settled on me. An accurate line at last — do try to print the rest as carefully.', emotion: 'neutral' },
    noReveal: { line: 'Match the shades and watch them refuse each other — that ivory cloud was never mine. My compact stayed shut all evening. Dust some other sleeve for your powder.', emotion: 'neutral' },
  },
  'columnist-oil': {
    resolve: { line: 'The lighter jammed on the stroke of the clock; oil and hour agree, and neither accuses me. Write it down and let a punctual vice be just that.', emotion: 'neutral' },
    noReveal: { line: 'Pin your oiled hour to the clock and you’ll find me absent from it. My lighter behaved tonight; not a drop went astray. Some other mechanism kept your appointment.', emotion: 'suspicious' },
  },
  'columnist-wax': {
    resolve: { line: 'You watched it break yourself — press, snap, a warm fleck on the cuff. Write down the little performance. A woman who seals her secrets is careful, not sinister.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me press a seal a hundred times — no fleck of mine will match your amber. I sealed nothing dangerous this evening. That brittle crumb fell from someone else’s secret.', emotion: 'neutral' },
  },
  'columnist-society': {
    warm: { line: 'Since you ask kindly — watch the quiet man near the hall. He went grey when that door slammed, and he’s been counting the exits ever since. That’s the one I’d chase, if I still trusted a paragraph to be gentle.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you this much and no more: the nervous glances all started after the row by the hall. Names I keep; the timing I’ll lend you.', emotion: 'neutral' },
    hostile: { line: 'If you’d rather bully than listen, you’ll get the society page and nothing under it. We’re finished, detective.', emotion: 'angry' },
  },
  'columnist-origins': {
    warm: { line: 'The honest answer, then: I stay because the right sentence, printed at the right hour, can stand between someone small and someone cruel. I’ve spiked more stories than I’ve run, and I’ve never once been sorry for it.', emotion: 'thoughtful' },
    measured: { line: 'Call it a trade like any other — an eye I inherited, a mercy I didn’t, and a great many secrets kept for people who couldn’t afford to lose them.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for my memoir and I certainly didn’t offer it. Charm withdrawn. Ask me something you can actually print.', emotion: 'neutral' },
  },
  'columnist-guests': {
    warm: { line: 'Off the record, since you’ve earned it: the composed ones frighten me more than the weeping ones. Grief has manners; a rehearsed calm has a motive. Watch whoever hasn’t dropped the mask all night.', emotion: 'thoughtful' },
    measured: { line: 'Impressions, not names. One never forgave me a paragraph; two go quiet when I enter a room. Make of that what your evidence allows.', emotion: 'neutral' },
    hostile: { line: 'Mistake my smile for stupidity again and the guest list closes for good. I shield the powerless, detective — learn the difference before you press me.', emotion: 'angry' },
  },

  // ── Retired Surgeon ────────────────────────────────────────────────
  'surgeon-antiseptic': {
    resolve: { line: 'Then record it plainly: carbolic, one splash, matched to a dressing in the library. It puts me at a cut I bound. That’s the limit of what it proves.', emotion: 'neutral' },
    noReveal: { line: 'Compare my cuff with that library dressing and they won’t agree. I bound no cut in that room tonight; the carbolic is an old habit clinging to cloth, not a trace of your scene.', emotion: 'neutral' },
  },
  'surgeon-oil': {
    resolve: { line: 'One vial, one drop short, my hand throughout — there’s your chain of custody. It marks the instrument as mine. It doesn’t mark me as anything worse.', emotion: 'thoughtful' },
    noReveal: { line: 'Trace the vial as far as you like; the chain doesn’t reach me. My case stayed shut this evening and my instruments dry. Whatever hand oiled your mechanism, it wasn’t this one.', emotion: 'neutral' },
  },
  'surgeon-wax': {
    resolve: { line: 'Set my lapel against their half of the seal; the amber agrees. It confirms a letter posted, no more. What the letter said stays sealed.', emotion: 'neutral' },
    noReveal: { line: 'Lay my lapel against that broken seal and the amber won’t match. I posted no such letter tonight. The correspondence you’re chasing belongs to another hand entirely.', emotion: 'neutral' },
  },
  'surgeon-ink': {
    resolve: { line: 'The page carries the hour I wrote it, and the ink agrees with the page. Note the minute if you must — precision is my habit, not my admission.', emotion: 'neutral' },
    noReveal: { line: 'Set the hour on that page against mine and the minutes won’t line up. I wrote nothing that touched your scene tonight. Precision cuts both ways, detective; here it clears me.', emotion: 'neutral' },
  },
  'surgeon-earth': {
    resolve: { line: 'Under the lens the grain is even — a settling powder, not garden soil. Enter that carefully. A careless eye would put me on my knees in the conservatory; the correct one won’t.', emotion: 'thoughtful' },
    noReveal: { line: 'Put the grit under the lens beside mine and the grains diverge. I knelt in no conservatory this evening. The pale dust you carry came off someone else’s knees, not my cuff.', emotion: 'thoughtful' },
  },
  'surgeon-wool': {
    resolve: { line: 'Lay the strand against my frayed cuff and the weaves diverge. Record it as an exclusion, then. A shared colour was never a shared coat.', emotion: 'neutral' },
    noReveal: { line: 'Hold that strand to my sleeve and the weaves refuse each other. No coat of mine shed it. Set it down plainly: the coarse thread isn’t mine to account for.', emotion: 'neutral' },
  },
  'surgeon-polish': {
    resolve: { line: 'Handle to thumb to cloth — one blade, one clean chain. Follow it exactly and it ends at an edge I couldn’t leave untended. It doesn’t reach the plate you hoped for.', emotion: 'thoughtful' },
    noReveal: { line: 'Follow the smear from plate to cloth and the chain never passes through my hand. I tended no silver tonight. The bright thing you’re tracing ends well short of my instruments.', emotion: 'neutral' },
  },
  'surgeon-perfume': {
    resolve: { line: 'Ask the woman I steadied; her account and my lapel will agree. Write it as proximity. Forty years of not letting people fall isn’t a motive.', emotion: 'neutral' },
    noReveal: { line: 'Ask any woman here whether I steadied her tonight; none will say so, because I didn’t. No scent settled on this lapel by my doing. The proximity you want is with someone else.', emotion: 'neutral' },
  },
  'surgeon-powder': {
    resolve: { line: 'You watched the catch rebuilt — she tips, the compact bursts, the puff lands on my sleeve. Record the sequence. It blames a faulty clasp, not a surgeon.', emotion: 'neutral' },
    noReveal: { line: 'Rebuild the catch and you’ll find no sleeve of mine beneath it. I stood nowhere near a bursting compact tonight. The ivory dust took a different shoulder.', emotion: 'neutral' },
  },
  'surgeon-note': {
    resolve: { line: 'Read correctly, the symbol is a dosage, not an admission. Enter it as a clinical note. I only ask that you copy it as carefully as I recorded it.', emotion: 'thoughtful' },
    noReveal: { line: 'Read the symbol however you like; it matches nothing I set down tonight. My shorthand is clinical and it stayed in my case. That torn mark was another man’s hurry, not mine.', emotion: 'neutral' },
  },
  'surgeon-observation': {
    warm: { line: 'Since you ask as one careful observer to another: the guest who went still after the corridor quieted. Stillness that costs visible effort is worth more than any tremor. Watch that one — but watch, don’t accuse.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you the observation and keep the diagnosis: one guest’s hands began to shake the instant the row ended. Draw the inference yourself; I’ve reached the edge of my data.', emotion: 'neutral' },
    hostile: { line: 'If you want a name pressed out of a symptom, you’ve mistaken your clinician. This consultation is concluded, detective.', emotion: 'angry' },
  },
  'surgeon-retirement': {
    warm: { line: 'The truth, since you’ll have it gently: there’s one note I revised, years ago, when my hand was too tired to be honest. I’ve wanted to write a single true line ever since. Perhaps tonight I finally will.', emotion: 'worried' },
    measured: { line: 'Call it arithmetic. I stopped before the errors outnumbered the cures. A tired hand is an honest one’s worst enemy, and I’d grown very tired.', emotion: 'thoughtful' },
    hostile: { line: 'I didn’t offer my memoirs and you plainly don’t want them. The consultation is closed.', emotion: 'neutral' },
  },
  'surgeon-diagnosis': {
    warm: { line: 'Plainly, then, since you’ve listened: it’s the one who doesn’t flinch who troubles me. Practised calm is a symptom of its own. But I’ll name a condition, never a culprit — that much discipline I’ve kept.', emotion: 'thoughtful' },
    measured: { line: 'I said a look, not a diagnosis, and I hold to the distinction. Fear has a particular shade tonight, and one guest wears it too evenly. That’s the whole of my testimony.', emotion: 'neutral' },
    hostile: { line: 'You want bedside theory turned into an accusation. I decline. I won’t condemn a soul on a tremor, detective.', emotion: 'angry' },
  },

  // ── Greenhouse Curator ─────────────────────────────────────────────
  'curator-antiseptic': {
    resolve: { line: 'There — boric wash, kicked back from the crate sprayer. Set it beside medicine or motor solvent and it matches neither. Record it as a gardener’s work, because that’s all it is.', emotion: 'thoughtful' },
    noReveal: { line: 'Hold that sharp trace beside my work and the two won’t agree — I mixed no wash tonight and sprayed no crate. Whatever clean, medicinal thing you smell, it took root on someone other than me.', emotion: 'neutral' },
  },
  'curator-earth': {
    resolve: { line: 'Follow the grit, then: hem to rug to the study vent, where a root ball was swapped. It leads to a searched pot and away from me. Note where it ends as carefully as where it began.', emotion: 'neutral' },
    noReveal: { line: 'Follow the grit where it leads; the trail turns off well before it reaches me. I swapped no root ball at any vent tonight. That pale dust settled on other hems, never mine.', emotion: 'neutral' },
  },
  'curator-note': {
    resolve: { line: 'Read plainly, it gives a date, some initials, and 12:10 — and the cable copy agrees. Enter it gently. It records a payment, not a plot, and there are living things it could still uproot.', emotion: 'worried' },
    noReveal: { line: 'Set my shorthand against any cable copy you like and nothing of mine answers to it. I recorded no payment tonight. Those cramped little marks belong to another’s ledger.', emotion: 'neutral' },
  },
  'curator-ink': {
    resolve: { line: 'The label carries the hour I wrote it, and the ink keeps the same time. Set it down. A cutting stamped with its date is careful record-keeping, nothing that should follow me.', emotion: 'neutral' },
    noReveal: { line: 'Set the hour on that label against mine and it won’t meet. I stamped no cutting at your time tonight. The ink kept someone else’s appointment, patiently and elsewhere.', emotion: 'neutral' },
  },
  'curator-wool': {
    resolve: { line: 'Nail to shoulder to pot — there’s the whole quiet journey of my wrap. It carries me past a cabinet, no further. Trace it to its end and let it rest there.', emotion: 'thoughtful' },
    noReveal: { line: 'Trace the wool from nail to pot and the journey never crosses yours. My wrap snagged on nothing tonight. That coarse strand travelled a path I never walked.', emotion: 'neutral' },
  },
  'curator-polish': {
    resolve: { line: 'The grips, never the faces — I brightened brass for the patrons, not silver for anyone. Record it precisely; whoever handled the plate was far less careful than I.', emotion: 'neutral' },
    noReveal: { line: 'Tell me I brightened someone’s silver and I’ll let it pass — I polished nothing tonight but leaves. There’s no smear of mine on that plate to correct. Your careful hand was another’s.', emotion: 'neutral' },
  },
  'curator-perfume': {
    resolve: { line: 'Smell my hands — soil and green sap, under all that bottled gardenia. Enter it as hers, caught on me at the door. A grower wears the garden, not the chemist’s copy of it.', emotion: 'thoughtful' },
    noReveal: { line: 'Smell these hands — soil and sap, and no bottled gardenia under it. That perfume never rode in on me tonight. It clings to whoever truly wears it, and that isn’t the gardener.', emotion: 'thoughtful' },
  },
  'curator-powder': {
    resolve: { line: 'Match the shade and be done: mine has never held ivory, hers sheds it on strangers in a doorway. There — an honest line. It settles on my shoulder and settles nothing else.', emotion: 'neutral' },
    noReveal: { line: 'Match the shade and it’ll refuse my shoulder — I’ve never carried ivory in my life. No powdered doorway caught me tonight. That cloud drifted onto someone else entirely.', emotion: 'neutral' },
  },
  'curator-oil': {
    resolve: { line: 'You’ve seen the vent freed — I turn the gear, the ratchet springs, the oil catches my thumb. Record it. Honest work leaves its mark exactly where honest work would put it.', emotion: 'thoughtful' },
    noReveal: { line: 'Work the vent yourself and watch: no gear of mine sprang oil tonight, and my thumb is clean of it. The honest mark you want was left by another hand, not mine.', emotion: 'neutral' },
  },
  'curator-wax': {
    resolve: { line: 'The sealed cutting is right there, its wax twin to my sleeve, and the under-gardener will vouch for the graft. Note it as garden work. Two cuttings joined isn’t a hidden thing.', emotion: 'neutral' },
    noReveal: { line: 'Ask the under-gardener and he’ll place me nowhere near a sealed cutting tonight. No wax twin sits on my sleeve. The amber you found hardened on a different hand.', emotion: 'neutral' },
  },
  'curator-growth': {
    warm: { line: 'Since you ask patiently — one figure crossed on a wet sole, twice, just as the hall clock chimed the hour. The stride was wrong for a servant. I can’t give you a name, but I can give you the moment, and the moment is true.', emotion: 'thoughtful' },
    measured: { line: 'I’ll offer the detail and keep the guesswork: a wet sole squeaked twice, a crossing timed to the chime. What grew from it is yours to trace, not mine to invent.', emotion: 'neutral' },
    hostile: { line: 'You’d rather I named someone I never saw clearly. I won’t. Some shoots aren’t worth training, detective. We’re done here.', emotion: 'angry' },
  },
  'curator-calling': {
    warm: { line: 'The honest fear, since you’ve been kind to it: that someone seizes the glasshouse and lets the rarest of them wither to make a point. Protect the living things and you have my whole cooperation. Threaten them and you lose it.', emotion: 'worried' },
    measured: { line: 'A single sick fern I refused to give up on — it lived, and I’ve been outnumbered by green things ever since. That’s the whole of my calling, plainly told.', emotion: 'thoughtful' },
    hostile: { line: 'A gardener who tends contraband is still a gardener. Confuse my care for guilt again and you can see yourself out. Mind the roots.', emotion: 'angry' },
  },
  'curator-company': {
    warm: { line: 'Since you’ll hear it kindly: the one who priced my orchid instead of seeing it frightens me most. People who value only what a thing will fetch are capable of a great deal. Watch them the way I watch for rot.', emotion: 'thoughtful' },
    measured: { line: 'Impressions I have plenty of, names not at all. One leans away from the light instead of toward it — in a plant that means rot, in a person, secrets. Read it as you like.', emotion: 'neutral' },
    hostile: { line: 'I shield living things, detective, not the guilty — don’t confuse the two again. The bed’s turned. We can stop.', emotion: 'neutral' },
  },
}
