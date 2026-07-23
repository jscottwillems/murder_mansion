// Pack B closings — Stage Magician, War Correspondent, Estate Accountant.
// Plain spoken wrap-ups. Short sentences. No purple metaphor.
// Resolve never concedes guilt. No murder/death/body language.
import type { AuthoredClosings } from './types'

export const CLOSINGS_B: Record<string, AuthoredClosings> = {
  // ── Stage Magician ─────────────────────────────────────────────────
  'magician-wool': {
    resolve: { line: 'The strand goes from that brass latch to my seam to the tailor’s ticket. My coat caught at the cabinet. I was reaching for a paper — nothing worse.', emotion: 'thoughtful' },
    noReveal: { line: 'That thread won’t match my coat. I shed nothing on your latch. Some other dark sleeve left it.', emotion: 'neutral' },
  },
  'magician-powder': {
    resolve: { line: 'Same ivory, same cracked compact as the print on the switch. I dusted a lamp for the effect. That’s the trick — not a confession.', emotion: 'neutral' },
    noReveal: { line: 'Hold that print against my compact — different powder, different clasp. Mine never touched your switch.', emotion: 'neutral' },
  },
  'magician-oil': {
    resolve: { line: 'You saw it — one drop on the false back, the spring gives. I oiled a prop. The hands are mine; that’s all the oil says.', emotion: 'thoughtful' },
    noReveal: { line: 'My spring took its one drop and kept it. Whoever oiled your mechanism wasn’t me.', emotion: 'neutral' },
  },
  'magician-ink': {
    resolve: { line: 'The card’s inked to the chime I timed the trick against. Punctual stagecraft. Not a plot.', emotion: 'neutral' },
    noReveal: { line: 'That hour isn’t on my card. Blue-black is common ink — time a different pen.', emotion: 'neutral' },
  },
  'magician-antiseptic': {
    resolve: { line: 'It’s spirit-gum solvent, not carbolic. I peeled a false moustache. Same smell, different job.', emotion: 'neutral' },
    noReveal: { line: 'Test it — stage solvent, not medicine. Go find a more medical guest.', emotion: 'suspicious' },
  },
  'magician-earth': {
    resolve: { line: 'My palm matches the grip tin. The garden grit doesn’t. I dust coins for a clean vanish — I wasn’t in any flowerbed.', emotion: 'thoughtful' },
    noReveal: { line: 'My chalk is finer than that soil. No flowerbed clung to my hands. Look at someone else’s knees.', emotion: 'thoughtful' },
  },
  'magician-polish': {
    resolve: { line: 'I buff the inner curve of the rings, where I grip — not the plate. Whoever handled the silver was clumsier than I.', emotion: 'suspicious' },
    noReveal: { line: 'I didn’t touch any plate. My polish stays on my rings. Try another pair of hands.', emotion: 'neutral' },
  },
  'magician-perfume': {
    resolve: { line: 'Ask the room — they watched the volunteer take the bouquet. Her scent stayed on my sleeve. A trick in front of witnesses isn’t a secret meeting.', emotion: 'neutral' },
    noReveal: { line: 'Nobody took a bouquet from me tonight. That gardenia never landed on my sleeve. Follow it to whoever wears it.', emotion: 'neutral' },
  },
  'magician-wax': {
    resolve: { line: 'Same every time — press the seal, the stick cracks, a fleck jumps to my cuff. A sealed prediction. The words inside stay mine.', emotion: 'thoughtful' },
    noReveal: { line: 'I pressed no seal that matches your amber. That fleck came off someone else’s stick.', emotion: 'thoughtful' },
  },
  'magician-note': {
    resolve: { line: 'Palm, then pocket, then the floor — that’s where the cue card went. A running order, not a plot.', emotion: 'neutral' },
    noReveal: { line: 'I dropped no cue card near your scene. Those marks came from another performer’s hand.', emotion: 'neutral' },
  },
  'magician-sightline': {
    warm: { line: 'Watch the quiet hand, not the loud one. A ring caught the lamp by the side door while everyone turned toward a dropped tray. I can’t give you the face — but the misdirection was real.', emotion: 'thoughtful' },
    measured: { line: 'The noise by the door was cover. Someone walked through it while you were meant to look elsewhere. Whose hand stays behind the curtain.', emotion: 'neutral' },
    hostile: { line: 'I won’t accuse anyone from a flash of lamplight. We’re finished.', emotion: 'angry' },
  },
  'magician-craft': {
    warm: { line: 'Honestly: there’s a name that belongs on my finest trick and isn’t there. I mean to put it right before morning.', emotion: 'worried' },
    measured: { line: 'Faster hands, a borrowed idea, and applause I never quite earned. That’s as much method as I give away free.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for a conjuror’s memoirs. Ask something with a lock on it, or we’re done.', emotion: 'neutral' },
  },
  'magician-audience': {
    warm: { line: 'Watch the one whose hands are too still. Real calm breathes. That stillness is rehearsed — and rehearsed calm is hiding something.', emotion: 'thoughtful' },
    measured: { line: 'One guest checks a pocket the way an amateur checks a hidden card. Guilt has terrible technique. Whose pocket, you catch yourself.', emotion: 'neutral' },
    hostile: { line: 'I read methods, not people. This performance is over.', emotion: 'angry' },
  },

  // ── War Correspondent ──────────────────────────────────────────────
  'correspondent-ink': {
    resolve: { line: 'The nib went through the page when the gallery door slammed. The hour’s on the draft. Hearing something through a door isn’t doing it.', emotion: 'thoughtful' },
    noReveal: { line: 'My draft doesn’t match that slam. Clock a different pen to your door.', emotion: 'neutral' },
  },
  'correspondent-wool': {
    resolve: { line: 'My sleeve seam matches the fibre on that latch. I was in the west passage following someone. Watching a man isn’t the same as touching him.', emotion: 'neutral' },
    noReveal: { line: 'Different weave. My coat caught nothing on that latch. Count the strand to another dark coat.', emotion: 'neutral' },
  },
  'correspondent-note': {
    resolve: { line: 'My shorthand lines up with her coded reply — time, gallery, the envelope. That much I’ll stand behind. The initials stay torn away.', emotion: 'worried' },
    noReveal: { line: 'Nothing of mine answers that coded reply. Those torn marks belong in another notebook.', emotion: 'neutral' },
  },
  'correspondent-antiseptic': {
    resolve: { line: 'Field kit on my cuff, not the surgeon’s carbolic. I cleaned a cut. Same smell, different bottle.', emotion: 'neutral' },
    noReveal: { line: 'Mine’s a soldier’s bottle and it never touched your scene. Trace the medicinal smell to another sleeve.', emotion: 'neutral' },
  },
  'correspondent-earth': {
    resolve: { line: 'I went low by the glass to watch the drive. Grit on the knees from the sill. Watching — not digging.', emotion: 'thoughtful' },
    noReveal: { line: 'That grit doesn’t match where I knelt. The grains you’re after came from somewhere I never was.', emotion: 'neutral' },
  },
  'correspondent-polish': {
    resolve: { line: 'Flask cap, lighter, thumb, rag in my pocket. My kit. It never reaches the dining-room plate.', emotion: 'neutral' },
    noReveal: { line: 'I cleaned my own flask and lighter, not the house silver. Follow that smear elsewhere.', emotion: 'neutral' },
  },
  'correspondent-perfume': {
    resolve: { line: 'Two people passed while a frightened source held on too long. Ask them. Her scent stayed; her name won’t.', emotion: 'worried' },
    noReveal: { line: 'Nobody held onto me in that corridor. No gardenia on this coat. That scent isn’t mine to explain.', emotion: 'neutral' },
  },
  'correspondent-powder': {
    resolve: { line: 'Match the shade to her compact, not my face. Someone clipped me in a doorway, moving fast. That’s all.', emotion: 'neutral' },
    noReveal: { line: 'No one brushed me in a doorway. I’ve never carried ivory powder. Dust another sleeve.', emotion: 'neutral' },
  },
  'correspondent-oil': {
    resolve: { line: 'Typewriter jammed on the hour. One drop on the rail. I fixed a machine — punctual repair isn’t a motive.', emotion: 'thoughtful' },
    noReveal: { line: 'My carriage jammed at a different hour. Clock a different machine.', emotion: 'neutral' },
  },
  'correspondent-wax': {
    resolve: { line: 'Amber, not black — mind your notes. Sealing wax over a dispatch flap. Tied to an envelope, nothing worse.', emotion: 'suspicious' },
    noReveal: { line: 'No seal of mine cracked tonight. Bait a different reporter.', emotion: 'neutral' },
  },
  'correspondent-exits': {
    warm: { line: 'One guest waited, checked both corridors, then moved when the clock struck — limp for three steps, none after. That’s not a stroll. I can’t give you the face. I’ll swear to the movement.', emotion: 'thoughtful' },
    measured: { line: 'Most drifted. One moved with purpose after the chime. I verified that much. The name isn’t mine to file yet.', emotion: 'neutral' },
    hostile: { line: 'I named a man too fast once. Never again. This dispatch is closed.', emotion: 'angry' },
  },
  'correspondent-beat': {
    warm: { line: 'I burned a source once to make the copy sing. Someone under this roof trusted me after that. I don’t get to fail twice.', emotion: 'worried' },
    measured: { line: 'If you write a thing down straight, the lie has a harder time standing. That’s kept me on the road longer than sense would.', emotion: 'neutral' },
    hostile: { line: 'I didn’t offer war stories. Ask me something with a fact in it, or we’re done.', emotion: 'neutral' },
  },
  'correspondent-map': {
    warm: { line: 'Half the alibis here are load-bearing lies. Watch whoever tells theirs too smoothly — truth fumbles the order.', emotion: 'thoughtful' },
    measured: { line: 'Too many exits, too few honest ones. One movement’s still unverified. I’ll leave you the rest.', emotion: 'neutral' },
    hostile: { line: 'I count movements, not culprits. The map’s filed. We’re finished.', emotion: 'angry' },
  },

  // ── Estate Accountant ──────────────────────────────────────────────
  'accountant-ink': {
    resolve: { line: 'The altered zero won’t match the carbon copy. I posted a figure I was ordered to post. A forced hand isn’t a free one.', emotion: 'worried' },
    noReveal: { line: 'My carbon balances clean. I flooded no margin at your figure. That entry belongs to another clerk.', emotion: 'neutral' },
  },
  'accountant-polish': {
    resolve: { line: 'I polished the grip, never the base. Inventory on a moved candlestick. Whoever handled it left the base alone.', emotion: 'suspicious' },
    noReveal: { line: 'I polished no silver tonight. My hands kept to the ledgers. Charge that smear to someone else.', emotion: 'neutral' },
  },
  'accountant-oil': {
    resolve: { line: 'One drop — rail, key, clasp. I freed a stuck adding machine. That’s the whole sum.', emotion: 'neutral' },
    noReveal: { line: 'My machine kept its oil. Follow that bead to a different mechanism.', emotion: 'neutral' },
  },
  'accountant-antiseptic': {
    resolve: { line: 'Mine dissolves a figure on paper. His cleans a wound. Same sting, different work. An erased error on my cuff — nothing more.', emotion: 'neutral' },
    noReveal: { line: 'My fluid never touched your scene. Charge the carbolic to a more surgical guest.', emotion: 'neutral' },
  },
  'accountant-earth': {
    resolve: { line: 'My cuff matches the pounce-pot on my desk, not the flowerbed. I was drying a page. Not kneeling in the conservatory.', emotion: 'thoughtful' },
    noReveal: { line: 'Desk powder, not garden grit. That coarser dust settled on someone else’s knees.', emotion: 'thoughtful' },
  },
  'accountant-wool': {
    resolve: { line: 'Cabinet edge, worn elbow, the ledger I carried up. I was in the cellar with the accounts. That’s as far as the thread goes.', emotion: 'neutral' },
    noReveal: { line: 'My suit snagged on nothing down there. Coarse black wool is common — book it to another coat.', emotion: 'neutral' },
  },
  'accountant-perfume': {
    resolve: { line: 'Two people watched her lean over my figures. Ask them. Her scent stayed on my collar. I don’t wear gardenia.', emotion: 'neutral' },
    noReveal: { line: 'Nobody leaned over my books tonight. No gardenia on this collar. The perfume isn’t mine.', emotion: 'neutral' },
  },
  'accountant-powder': {
    resolve: { line: 'She set the compact down, snatched it back, the lid sprang, powder across my page. Her clasp. Not my hand.', emotion: 'thoughtful' },
    noReveal: { line: 'No compact burst over my ledger. That powder scattered on someone else’s account.', emotion: 'neutral' },
  },
  'accountant-wax': {
    resolve: { line: 'Stamped and dated on the hour — wax and clock agree. A sealed account. A punctual stamp isn’t a confession.', emotion: 'neutral' },
    noReveal: { line: 'I stamped no envelope at your hour. Date a different seal to that minute.', emotion: 'neutral' },
  },
  'accountant-note': {
    resolve: { line: 'Move the decimal — your total’s off. It’s a private tally, a running balance. Read right, a subtotal isn’t a threat.', emotion: 'suspicious' },
    noReveal: { line: 'That tally was never mine. No torn strip fell from my folio. Those figures are another hand’s.', emotion: 'neutral' },
  },
  'accountant-ledger': {
    warm: { line: 'A late charge was posted twice, then one copy lifted without initials. The cabinet was locked before dinner and open after a guest left the study. I won’t name them. The entry is true.', emotion: 'thoughtful' },
    measured: { line: 'One charge posted twice, one copy quietly removed. Slips add ink; they don’t remove pages. Draw your own conclusion.', emotion: 'neutral' },
    hostile: { line: 'I report access, not guilt. The book’s closed.', emotion: 'angry' },
  },
  'accountant-ledgerlife': {
    warm: { line: 'A family that promised much and posted nothing taught me figures don’t lie. But I signed one account that only balanced on paper, and it’s cost me sleep for years. I mean to settle it.', emotion: 'worried' },
    measured: { line: 'People revise their stories. A column of figures doesn’t. I learned young which to trust.', emotion: 'neutral' },
    hostile: { line: 'I didn’t open my life for you. Ask something that appears in a book, or we’re done.', emotion: 'neutral' },
  },
  'accountant-audit': {
    warm: { line: 'Watch whoever spends against a windfall they haven’t earned. Anticipated money makes people reckless — and reckless people tidy records that never needed tidying.', emotion: 'thoughtful' },
    measured: { line: 'Someone reversed a charge that already balanced. Names follow figures. Work the figures and I needn’t point.', emotion: 'neutral' },
    hostile: { line: 'You want names without the numbers that earn them. That’s backwards. We’re finished.', emotion: 'angry' },
  },
}
