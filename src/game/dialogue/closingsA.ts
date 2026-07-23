// Pack A closings — Society Columnist, Retired Surgeon, Greenhouse Curator.
// Bespoke thread wrap-ups keyed by route id. Each evidence route defines a
// `resolve` closing (the guest's final word as the association is recorded);
// each rapport route defines `warm`/`measured`/`hostile` closings, one per
// stance. Anything omitted falls back to already-authored dialogue, then a
// generic engine line, so a thread is always playable.
//
// Voice: plain conversation. Short sentences. No purple metaphor, no
// "write it down / enter it precisely / by my doing." Resolve never
// concedes guilt. No murder/death/body language.
import type { AuthoredClosings } from './types'

export const CLOSINGS_A: Record<string, AuthoredClosings> = {
  // ── Society Columnist ──────────────────────────────────────────────
  'columnist-ink': {
    resolve: { line: 'Yes — same ink on my hand and on that torn corner. I was taking notes during the row. That’s all it means.', emotion: 'thoughtful' },
    noReveal: { line: 'Hold them together and they won’t match. My ink stays on my own cuffs. Look at someone else.', emotion: 'neutral' },
  },
  'columnist-perfume': {
    resolve: { line: 'The scent sat heavier on the glove than on my wrist. I walked the house with it; I never pretended otherwise.', emotion: 'neutral' },
    noReveal: { line: 'That wasn’t my bottle. My gardenia stayed on my wrist. Someone else left that trail.', emotion: 'neutral' },
  },
  'columnist-shorthand': {
    resolve: { line: 'Twelve-ten, half a name, part of a room — that’s what’s on the scrap. Be careful what you do with it.', emotion: 'worried' },
    noReveal: { line: 'That time isn’t mine. My notes kept their own hours tonight. Try another clock.', emotion: 'neutral' },
  },
  'columnist-antiseptic': {
    resolve: { line: 'Ask whoever handed me the bottle — they watched me clean the cut. It means I bleed. Nothing worse.', emotion: 'neutral' },
    noReveal: { line: 'Nobody lent me a bottle tonight, so nobody will say they did. Try a guest who actually smells of medicine.', emotion: 'suspicious' },
  },
  'columnist-earth': {
    resolve: { line: 'Pot, then hem, then hand, then the bench. I knelt in the conservatory. That trail stops there.', emotion: 'thoughtful' },
    noReveal: { line: 'That grit never touched my hem. I stayed on the carpets. Someone else did the kneeling.', emotion: 'neutral' },
  },
  'columnist-wool': {
    resolve: { line: 'My wrap is silk. That coarse strand came off the coat he put round my shoulders. That’s the whole of it.', emotion: 'neutral' },
    noReveal: { line: 'Compare it to my wrap — silk doesn’t shed coarse wool. No coat sat on these shoulders tonight.', emotion: 'neutral' },
  },
  'columnist-polish': {
    resolve: { line: 'I touched the lid to read the engraving, not the base. Curiosity leaves a smear. It isn’t a confession.', emotion: 'thoughtful' },
    noReveal: { line: 'I didn’t handle anyone’s silver tonight. There’s nothing of mine on that clasp.', emotion: 'neutral' },
  },
  'columnist-powder': {
    resolve: { line: 'Mine’s the lighter shade. Hers is the heavier cloud that landed on my sleeve. Match them and you’ll see.', emotion: 'neutral' },
    noReveal: { line: 'That shade isn’t mine. My compact stayed shut. Dust someone else’s sleeve.', emotion: 'neutral' },
  },
  'columnist-oil': {
    resolve: { line: 'The lighter jammed when the clock struck. I oiled it then. A bad habit with good timing — nothing more.', emotion: 'neutral' },
    noReveal: { line: 'My lighter didn’t jam tonight, and I didn’t oil anything at your hour. Try another mechanism.', emotion: 'suspicious' },
  },
  'columnist-wax': {
    resolve: { line: 'You saw it — I press, the stick snaps, a fleck lands on my cuff. I seal my notes. That’s the habit.', emotion: 'thoughtful' },
    noReveal: { line: 'I sealed nothing that matches your amber. That fleck came off someone else’s stick.', emotion: 'neutral' },
  },
  'columnist-society': {
    warm: { line: 'Since you asked kindly — watch the quiet man near the hall. He went pale when that door slammed, and he’s been eyeing the exits ever since.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you this much: the nervous looks started after the row by the hall. Names I keep.', emotion: 'neutral' },
    hostile: { line: 'Bully me and you’ll get the society page and nothing under it. We’re finished.', emotion: 'angry' },
  },
  'columnist-origins': {
    warm: { line: 'Honestly? I stay because the right sentence, printed at the right hour, can protect someone who can’t protect themselves. I’ve spiked more stories than I’ve run.', emotion: 'thoughtful' },
    measured: { line: 'An eye I inherited, a mercy I didn’t, and a lot of secrets kept for people who couldn’t afford to lose them.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for my life story. Ask me something useful.', emotion: 'neutral' },
  },
  'columnist-guests': {
    warm: { line: 'Off the record: the composed ones worry me more than the ones who cry. Grief has manners. A rehearsed calm has a reason.', emotion: 'thoughtful' },
    measured: { line: 'One never forgave me a paragraph. Two go quiet when I walk in. Make of that what you can.', emotion: 'neutral' },
    hostile: { line: 'Mistake my smile for stupidity again and the guest list closes. I protect the powerless — learn the difference.', emotion: 'angry' },
  },

  // ── Retired Surgeon ────────────────────────────────────────────────
  'surgeon-antiseptic': {
    resolve: { line: 'Carbolic, one splash, matched to the dressing in the library. I bound a cut. That’s all it proves.', emotion: 'neutral' },
    noReveal: { line: 'My cuff won’t match that dressing. I bound no cut in the library tonight. The smell is an old habit on cloth.', emotion: 'neutral' },
  },
  'surgeon-oil': {
    resolve: { line: 'One drop from my vial — hand, hinge, sleeve. The case is mine. That doesn’t make me anything worse.', emotion: 'thoughtful' },
    noReveal: { line: 'My case stayed shut. Whatever oiled your mechanism, it wasn’t my hand.', emotion: 'neutral' },
  },
  'surgeon-wax': {
    resolve: { line: 'My lapel and their half of the seal match. I posted a letter. What it said stays private.', emotion: 'neutral' },
    noReveal: { line: 'That seal isn’t mine. I posted no such letter tonight. You’re chasing someone else’s correspondence.', emotion: 'neutral' },
  },
  'surgeon-ink': {
    resolve: { line: 'The page is dated to the hour I wrote it. Precision is my habit — not an admission of anything.', emotion: 'neutral' },
    noReveal: { line: 'That hour isn’t mine. I wrote nothing that touches your scene. Precision clears me here.', emotion: 'neutral' },
  },
  'surgeon-earth': {
    resolve: { line: 'Under a lens the grains are even — settling powder from my case, not garden soil. A careless look puts me in the conservatory. A careful one doesn’t.', emotion: 'thoughtful' },
    noReveal: { line: 'Put them side by side and the grains don’t match. I wasn’t in the conservatory. That dust came off someone else.', emotion: 'thoughtful' },
  },
  'surgeon-wool': {
    resolve: { line: 'Hold the strand against my cuff. Different weave. Same colour isn’t the same coat.', emotion: 'neutral' },
    noReveal: { line: 'That thread isn’t from my coat. Set it down and look elsewhere.', emotion: 'neutral' },
  },
  'surgeon-polish': {
    resolve: { line: 'Handle, then thumb, then cloth — one blade I couldn’t leave dull. The trail stops there. It doesn’t reach any plate.', emotion: 'thoughtful' },
    noReveal: { line: 'I didn’t touch the silver. Follow that smear and it never passes through my hands.', emotion: 'neutral' },
  },
  'surgeon-perfume': {
    resolve: { line: 'Ask the woman I steadied — she’ll tell you the same. Her scent stayed on my coat. I kept her from falling. That’s all.', emotion: 'neutral' },
    noReveal: { line: 'I didn’t steady anyone tonight, and no perfume landed on this lapel. You’re thinking of someone else.', emotion: 'neutral' },
  },
  'surgeon-powder': {
    resolve: { line: 'She tipped, the compact burst, the puff hit my sleeve. You saw how it happens. Faulty clasp — not me.', emotion: 'neutral' },
    noReveal: { line: 'I was nowhere near a spilling compact. That powder landed on another shoulder.', emotion: 'neutral' },
  },
  'surgeon-note': {
    resolve: { line: 'Read it again — that’s a dose, not an admission. Clinical notes. Copy them carefully if you must.', emotion: 'thoughtful' },
    noReveal: { line: 'That mark isn’t my shorthand. Mine stayed in my case. Someone else tore that scrap.', emotion: 'neutral' },
  },
  'surgeon-observation': {
    warm: { line: 'Since you ask carefully: watch the guest who went still after the corridor quieted. Stillness that costs effort is worth more than a tremor. Watch — don’t accuse.', emotion: 'thoughtful' },
    measured: { line: 'One guest’s hands started shaking the moment the row ended. That’s the observation. Draw your own conclusion.', emotion: 'neutral' },
    hostile: { line: 'I won’t name someone from a symptom. This consultation is over.', emotion: 'angry' },
  },
  'surgeon-retirement': {
    warm: { line: 'There’s one note I revised years ago, when I was too tired to be honest. I’ve wanted to write one true line ever since. Perhaps tonight I will.', emotion: 'worried' },
    measured: { line: 'I stopped before the errors outnumbered the cures. A tired hand is an honest one’s worst enemy.', emotion: 'thoughtful' },
    hostile: { line: 'I didn’t offer my memoirs. We’re finished.', emotion: 'neutral' },
  },
  'surgeon-diagnosis': {
    warm: { line: 'Plainly: it’s the one who doesn’t flinch who troubles me. Practised calm is a symptom. I’ll name a condition, never a culprit.', emotion: 'thoughtful' },
    measured: { line: 'Fear has a look tonight, and one guest wears it too evenly. That’s all I’ll say.', emotion: 'neutral' },
    hostile: { line: 'I won’t turn bedside observation into an accusation. Good night.', emotion: 'angry' },
  },

  // ── Greenhouse Curator ─────────────────────────────────────────────
  'curator-antiseptic': {
    resolve: { line: 'Sulphur wash from the plant sprayer — not medicine, not motor oil. I treated an orchid. That’s the work.', emotion: 'thoughtful' },
    noReveal: { line: 'I mixed no wash tonight. Whatever sharp smell you’ve got, it isn’t from me.', emotion: 'neutral' },
  },
  'curator-earth': {
    resolve: { line: 'The grit runs from my hem toward the study vent, where someone swapped a root ball. It leads to a searched pot — not to me as the culprit.', emotion: 'neutral' },
    noReveal: { line: 'That trail doesn’t reach me. I swapped no root ball. The dust settled on other hems.', emotion: 'neutral' },
  },
  'curator-note': {
    resolve: { line: 'A date, some initials, and 12:10 — and the cable copy agrees. It’s a payment noted down, not a plot.', emotion: 'worried' },
    noReveal: { line: 'My shorthand doesn’t match that cable. I recorded no payment tonight. Those marks are someone else’s.', emotion: 'neutral' },
  },
  'curator-ink': {
    resolve: { line: 'The plant label is dated to the hour I wrote it. Careful record-keeping. Nothing that should follow me further.', emotion: 'neutral' },
    noReveal: { line: 'That hour isn’t on any label of mine. The ink kept someone else’s time.', emotion: 'neutral' },
  },
  'curator-wool': {
    resolve: { line: 'Cabinet nail, then my shoulder, then the pot I carried. My wrap brushed past. Passing a cabinet isn’t a plot.', emotion: 'thoughtful' },
    noReveal: { line: 'My wrap snagged on nothing tonight. That thread walked a path I never did.', emotion: 'neutral' },
  },
  'curator-polish': {
    resolve: { line: 'I brightened the grips on the brass — name-plates and sprayers — never the silver. Whoever handled the plate was less careful than I.', emotion: 'neutral' },
    noReveal: { line: 'I polished no silver tonight. There’s no smear of mine on that plate.', emotion: 'neutral' },
  },
  'curator-perfume': {
    resolve: { line: 'Smell my hands — soil and sap under it. The gardenia came off the woman who hugged me at the door. Not my bottle.', emotion: 'thoughtful' },
    noReveal: { line: 'My hands smell of soil, not gardenia. That perfume never rode on me. Follow it to whoever wears it.', emotion: 'thoughtful' },
  },
  'curator-powder': {
    resolve: { line: 'I don’t wear ivory. Match the shade to her compact — she brushed past me in the doorway.', emotion: 'neutral' },
    noReveal: { line: 'I’ve never carried ivory powder. No one dusted this shoulder tonight. That cloud landed elsewhere.', emotion: 'neutral' },
  },
  'curator-oil': {
    resolve: { line: 'I freed the vent — turn the gear, the ratchet springs, oil on my thumb. Garden work. That’s where it landed.', emotion: 'thoughtful' },
    noReveal: { line: 'I didn’t oil any vent tonight. My thumb’s clean of it. Someone else’s hand left that mark.', emotion: 'neutral' },
  },
  'curator-wax': {
    resolve: { line: 'The sealed cutting’s right there, and the under-gardener held the graft. Garden wax on a rose join — nothing hidden.', emotion: 'neutral' },
    noReveal: { line: 'Ask the under-gardener — I grafted nothing tonight. No wax on my sleeve matches yours.', emotion: 'neutral' },
  },
  'curator-growth': {
    warm: { line: 'One figure crossed on a wet sole just as the clock chimed. The stride wasn’t a servant’s. I can’t give you a name — only the moment.', emotion: 'thoughtful' },
    measured: { line: 'A wet sole squeaked twice, timed to the chime. What grew from that is yours to trace.', emotion: 'neutral' },
    hostile: { line: 'I won’t name someone I never saw clearly. We’re done.', emotion: 'angry' },
  },
  'curator-calling': {
    warm: { line: 'What I’m afraid of: someone lets the rarest plants wither to make a point. Protect the living things and you have my help.', emotion: 'worried' },
    measured: { line: 'One sick fern I refused to give up on. It lived. I’ve been outnumbered by green things ever since.', emotion: 'thoughtful' },
    hostile: { line: 'Don’t confuse care for plants with guilt. Mind the roots on your way out.', emotion: 'angry' },
  },
  'curator-company': {
    warm: { line: 'The one who asked what my orchid would fetch frightens me. People who only see price are capable of a great deal.', emotion: 'thoughtful' },
    measured: { line: 'One leans away from the light instead of toward it. In a plant that means rot. In a person, secrets.', emotion: 'neutral' },
    hostile: { line: 'I protect living things, not the guilty. Don’t confuse the two. We’re finished.', emotion: 'neutral' },
  },
}
