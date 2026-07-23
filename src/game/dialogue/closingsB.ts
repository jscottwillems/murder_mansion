// Pack B closings — Stage Magician, War Correspondent, Estate Accountant.
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

export const CLOSINGS_B: Record<string, AuthoredClosings> = {
  // ── Stage Magician ─────────────────────────────────────────────────
  'magician-wool': {
    resolve: { line: 'Fine — follow the strand from the brass tooth to my seam to the tailor’s ticket. It walks my coat to that cabinet door and no further. I went for a contract, not for anything worse.', emotion: 'thoughtful' },
    noReveal: { line: 'Walk that strand to any tailor’s ticket you like; it won’t reach my coat. My weave shed nothing on your latch tonight. Some other dark sleeve left that thread.', emotion: 'neutral' },
  },
  'magician-powder': {
    resolve: { line: 'Hold the print on the switch against my cracked compact — same ivory, same broken clasp. There’s your match. It puts me at a lamp I dimmed for effect, nothing worse.', emotion: 'neutral' },
    noReveal: { line: 'Hold that print against my compact and they won’t agree — different ivory, different clasp. My stage powder dusted no lamp of yours. Match the cloud to another hand.', emotion: 'neutral' },
  },
  'magician-oil': {
    resolve: { line: 'You watched the false back lift yourself — pin, one drop of oil, the spring gives. Write it down. The hands are mine; the invention wasn’t, and that’s all the oil admits.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me lift that false back a hundred times and not a drop matches yours. My spring took its one bead and kept it. Whoever oiled your mechanism worked a different trick.', emotion: 'neutral' },
  },
  'magician-ink': {
    resolve: { line: 'Pin it to the chime, then — card inked on the stroke, hour and stain in step. Set it down. A punctual flourish puts me at my own trick, not at anything you can hang on me.', emotion: 'neutral' },
    noReveal: { line: 'Pin my card to that chime and the hours won’t meet — the stain kept its own appointment, nowhere near your clock. Blue-black is a common prop. Time a different pen.', emotion: 'neutral' },
  },
  'magician-antiseptic': {
    resolve: { line: 'Test it and the point settles itself — spirit gum on my cuff, never a surgeon’s carbolic. Note the difference. It marks a disguise I peeled, and a shared reek isn’t a shared crime.', emotion: 'neutral' },
    noReveal: { line: 'Test the fluid and it clears me — spirit-gum solvent, never carbolic. The sharp smell is pure stagecraft. Go sniff out a more medicinal guest.', emotion: 'suspicious' },
  },
  'magician-earth': {
    resolve: { line: 'Set the three side by side — my palm, my grip tin, the garden grit. The chalk matches; the soil doesn’t. There’s your comparison. It keeps me at my own coins, out of any flowerbed.', emotion: 'thoughtful' },
    noReveal: { line: 'Set my grip chalk beside the tin and the conservatory grit and they part at once — mine finer, milled for a clean vanish. No flowerbed clung to my palms. That soil knelt on someone else.', emotion: 'thoughtful' },
  },
  'magician-polish': {
    resolve: { line: 'No — only the inner curve, where I grip; the outer face catches the lamp. See how fast I correct you. Write it: I shine my rings, and whoever handled that plate was clumsier than I am.', emotion: 'suspicious' },
    noReveal: { line: 'Tell me I buffed the ring’s outer face and I’ll just smile — there’s nothing to correct, because I touched no plate. My polish stays on the curve I grip. Your clumsy hand was someone else’s.', emotion: 'neutral' },
  },
  'magician-perfume': {
    resolve: { line: 'Ask the room, as I keep telling you to — the volunteer took the bouquet with a dozen eyes on it. Their word and my sleeve agree. A witnessed trick isn’t a secret meeting.', emotion: 'neutral' },
    noReveal: { line: 'Ask the whole room; not one of them will put a bouquet in my hands, because none passed. That gardenia never rode in on my sleeve. Chase the scent to whoever really wears it.', emotion: 'neutral' },
  },
  'magician-wax': {
    resolve: { line: 'There — you watched me seal another, the stick crack, the fleck jump to my cuff exactly as before. Write down the demonstration. It ties me to a sealed envelope, and the words inside stay mine.', emotion: 'thoughtful' },
    noReveal: { line: 'Have me seal envelope after envelope; not one fleck matches your amber. I pressed no such seal tonight, and my cuff is clean of it. That crumb came off another conjuror’s secret.', emotion: 'thoughtful' },
  },
  'magician-note': {
    resolve: { line: 'Follow the clumsy route, then — palm to pocket to the floor. There’s your chain, and there’s the curtain. It drops a running order at my feet, not a plot.', emotion: 'neutral' },
    noReveal: { line: 'Trace the scrap from palm to pocket to floor all you like — the little journey was never mine. I dropped no cue card near your scene. Those marks slipped from another performer’s hand.', emotion: 'neutral' },
  },
  'magician-sightline': {
    warm: { line: 'Since you haven’t once laughed at the act — watch the quiet hand, not the loud one. A ring caught the lamp by that side door while every head turned to a dropped tray. I can’t give you the face, but the misdirection was real, and so was the hand that used it.', emotion: 'thoughtful' },
    measured: { line: 'I’ll lend you the method and keep the name. The noise by the door was staged, and someone walked through it while you were meant to look elsewhere. Whose hand it was stays behind the curtain.', emotion: 'neutral' },
    hostile: { line: 'You want me to point a finger from a flash of lamplight. I deal in illusions, not accusations. The house lights are up. We’re finished.', emotion: 'angry' },
  },
  'magician-craft': {
    warm: { line: 'The honest answer, patter aside: I do this because a good illusion is kinder than the truth — and once, that excuse let me skip paying a debt. There’s a name that belongs on my finest trick and isn’t there. I mean to fix that before morning.', emotion: 'worried' },
    measured: { line: 'Call it a trade like any other — faster hands, a borrowed idea, and a lot of applause I never quite earned. That’s as much of the method as I give away for free.', emotion: 'neutral' },
    hostile: { line: 'You didn’t come for a conjuror’s memoirs, and I won’t perform them. Ask me something with a lock on it, or the curtain drops.', emotion: 'neutral' },
  },
  'magician-audience': {
    warm: { line: 'Quietly, since you’ve earned it: watch the one whose hands are too still. Real calm breathes; that stillness is rehearsed, and rehearsed calm is guarding something. I’ve played to enough rooms to know the difference.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you the reading and keep the verdict. One guest checks a pocket the way an amateur checks a palmed card. Guilt has terrible technique. Whose pocket it is, you catch for yourself.', emotion: 'neutral' },
    hostile: { line: 'Mistake my eye for an oracle again and you’ll get fake applause and nothing else. I read methods, not people. This performance is over.', emotion: 'angry' },
  },

  // ── War Correspondent ──────────────────────────────────────────────
  'correspondent-ink': {
    resolve: { line: 'Pin it to the slam, then — nib buried in the crease the instant the gallery door went, hour on the page to match. It puts my pen there. Hearing a thing through a door isn’t doing it.', emotion: 'thoughtful' },
    noReveal: { line: 'Pin my torn crease to that slam and the hours won’t line up. My nib was buried in a different minute. Blue-black is common ink — clock a different pen to your door.', emotion: 'neutral' },
  },
  'correspondent-wool': {
    resolve: { line: 'Lay them together — my sleeve seam, the fibre on the third latch. Same weave. That’s your match. It marks my coat in the west passage, following a limp that quit. Watching a man isn’t touching him.', emotion: 'neutral' },
    noReveal: { line: 'Lay my seam against the fibre on that latch. They won’t meet — different weave, different sleeve. My coat caught nothing in the west passage. Count the strand to another dark coat.', emotion: 'neutral' },
  },
  'correspondent-note': {
    resolve: { line: 'Set my shorthand beside her coded answer; they line up — time, gallery, the envelope. That much I’ll stand behind. It’s a source’s warning in my notebook, and the initials stay torn away.', emotion: 'worried' },
    noReveal: { line: 'Set my shorthand against any coded reply you’ve got; nothing answers. No source cabled me that warning. Those torn marks belong in another notebook, not mine.', emotion: 'neutral' },
  },
  'correspondent-antiseptic': {
    resolve: { line: 'Test the bottle and it holds — field kit on my cuff, not the surgeon’s carbolic. Two things stink alike and share nothing else. It says I cleaned a cut. That’s the whole item.', emotion: 'neutral' },
    noReveal: { line: 'Test the bottle and it falls my way — field kit, never carbolic, and it never touched your scene. A shared reek proves nothing. Trace the medicinal smell to a different sleeve.', emotion: 'neutral' },
  },
  'correspondent-earth': {
    resolve: { line: 'You saw me take the post again — low by the glass, braced on the sill, grit straight onto the knees. That’s the reconstruction. It puts me watching the drive, not digging in it. File it that way.', emotion: 'thoughtful' },
    noReveal: { line: 'Put me back at that watch-post and the grit won’t match yours. My knees took their dust from a different sill. The grains you’re tracing knelt somewhere I never did.', emotion: 'neutral' },
  },
  'correspondent-polish': {
    resolve: { line: 'Follow it: flask cap to lighter to thumb to the rag in my pocket. One chain, all mine. It never reaches the dining-room plate. Trace it to my kit and let it stop there.', emotion: 'neutral' },
    noReveal: { line: 'Trace the polish — cap, lighter, thumb, rag — and the chain runs out in my pocket, well short of your plate. I cleaned my own kit, none of the house silver. Follow the smear elsewhere.', emotion: 'neutral' },
  },
  'correspondent-perfume': {
    resolve: { line: 'Ask the two who passed — they’ll put me in that corridor with a frightened source holding on too long. Their word and the scent on my collar agree. Proximity, nothing more. Her name stays out of your notebook.', emotion: 'worried' },
    noReveal: { line: 'Ask the two who passed; none will put a source against my collar, because none did. No gardenia reached this coat by any doing of mine. That scent belongs to a corridor I never stood in.', emotion: 'neutral' },
  },
  'correspondent-powder': {
    resolve: { line: 'Match it — the shade on my shoulder to her compact, not to my face. I’ve never owned the stuff. It marks a collision in a doorway, someone moving fast. That’s all the powder files.', emotion: 'neutral' },
    noReveal: { line: 'Match the shade on my shoulder to any compact you like; it won’t answer. No one clipped me in a doorway. I’ve never carried ivory powder — dust a different sleeve.', emotion: 'neutral' },
  },
  'correspondent-oil': {
    resolve: { line: 'Fix it to the clock, then — rail oiled on the stroke, the hour I was cursing the carriage. Oil and time agree. It puts me at a jammed machine. Punctual repair isn’t a motive.', emotion: 'thoughtful' },
    noReveal: { line: 'Fix my oiled rail to the clock and the times won’t agree — my carriage jammed at another hour. A dozen machines take that oil. Clock a different mechanism.', emotion: 'neutral' },
  },
  'correspondent-wax': {
    resolve: { line: 'Amber, not black — mind your note. See how fast I correct the colour. It’s off a sealing stick, over a dispatch flap. Ties me to a sealed envelope and nothing worse.', emotion: 'suspicious' },
    noReveal: { line: 'Call the wax black or amber — I won’t correct either, because no seal of mine cracked tonight. Nothing off my stick reached your cuff. Bait a different reporter.', emotion: 'neutral' },
  },
  'correspondent-exits': {
    warm: { line: 'Straight, since you’ve dealt straight with me: one guest waited, checked both corridors, then moved on the clock’s strike — limp for three steps, none after, once they judged the hall empty. That’s not a stroll. I can’t give you the face. I’ll swear to the movement.', emotion: 'thoughtful' },
    measured: { line: 'I’ll give you the count and keep the rest. Most drifted; one moved with purpose after the chime. I verified that much myself. The name isn’t mine to file yet.', emotion: 'neutral' },
    hostile: { line: 'You want a name squeezed out of a headcount. I don’t work that way. I filed a man’s name too fast once — never again. This dispatch is closed.', emotion: 'angry' },
  },
  'correspondent-beat': {
    warm: { line: 'The plain version, since you’ve earned it: I named a source once to make the copy sing, and they paid for my byline. I’ve been making up for it ever since. There’s someone under this roof who trusted me after that. I don’t get to fail twice.', emotion: 'worried' },
    measured: { line: 'Call it stubbornness with a purpose — the idea that a thing written down straight can outlast the lie. It’s kept me on the road longer than sense would. That’s as much philosophy as I file.', emotion: 'neutral' },
    hostile: { line: 'I didn’t offer you the war stories, and you don’t want them. Ask me something with a fact in it, or we’re done.', emotion: 'neutral' },
  },
  'correspondent-map': {
    warm: { line: 'Since you’ll hear it straight: half the alibis in here are load-bearing lies. The rehearsed one worries me most — truth fumbles the order, a memorised story doesn’t. Watch whoever tells it too smoothly. That’s the map I’d follow.', emotion: 'thoughtful' },
    measured: { line: 'Too many exits, too few honest ones — that’s the house. I flag what’s verified and what isn’t. One movement’s still in the unverified column. I’ll leave you to work the rest.', emotion: 'neutral' },
    hostile: { line: 'You’d have me turn a floor plan into an accusation. No. I count movements, not culprits. The map’s filed. We’re finished.', emotion: 'angry' },
  },

  // ── Estate Accountant ──────────────────────────────────────────────
  'accountant-ink': {
    resolve: { line: 'Set the altered zero against the carbon; they won’t reconcile, and there’s your contradiction. Post it plainly. It records a figure I was made to change — a forced hand, not a free one.', emotion: 'worried' },
    noReveal: { line: 'Set the altered zero against my carbon and the columns balance clean — no discrepancy posts to my hand. I flooded no margin at your figure. That entry balances against another clerk.', emotion: 'neutral' },
  },
  'accountant-polish': {
    resolve: { line: 'No — only the grip, never the base; you’ve posted that wrong. Note the correction: I cleaned where a hand grips, and whoever moved the piece left the base alone. It puts me at an inventory, nothing dearer.', emotion: 'suspicious' },
    noReveal: { line: 'Tell me I cleaned the base too and you’ll draw no correction — there’s no entry to amend, because I polished no silver. My hands kept to the ledgers. Post that smear to another account.', emotion: 'neutral' },
  },
  'accountant-oil': {
    resolve: { line: 'Trace the one drop — rail to key to clasp, the same bead the whole way. There’s your custody. It carries me to an adding machine and its ledger, and posts no larger sum against me.', emotion: 'neutral' },
    noReveal: { line: 'Trace the drop — rail, key, clasp — and the custody never posts to my ledger. My machine kept its oil to itself. Follow the bead to a different mechanism.', emotion: 'neutral' },
  },
  'accountant-antiseptic': {
    resolve: { line: 'Test it and it won’t agree with the surgeon’s — mine dissolves a figure, his cleans a wound. That’s the contradiction. It marks an erased error on my cuff, and a shared stink balances nothing.', emotion: 'neutral' },
    noReveal: { line: 'Test the cuff and it clears me — my fluid dissolves a figure, never a wound, and it never touched your scene. A shared stink balances no column. Charge the carbolic to a more surgical guest.', emotion: 'neutral' },
  },
  'accountant-earth': {
    resolve: { line: 'Set my cuff beside the pounce-pot and the flowerbed grit; my desk grains match, the garden’s don’t. There’s your comparison — milled against chance. It keeps me over a drying page, out of any conservatory.', emotion: 'thoughtful' },
    noReveal: { line: 'Hold my cuff to the pounce-pot and the garden grit; my grains answer only to the desk. No flowerbed soil reconciled with me. That coarser dust settled on someone else’s knees.', emotion: 'thoughtful' },
  },
  'accountant-wool': {
    resolve: { line: 'Follow the thread — cabinet edge to worn elbow to the ledger I carried up. One itemised chain, all of it bookkeeping. It reaches the cellar cabinet where the accounts live, and nothing beyond.', emotion: 'neutral' },
    noReveal: { line: 'Follow the thread from the cellar cabinet to my elbow and it never itemises out to me. My suit snagged on nothing down there. Coarse black wool is common as debt — book it to another coat.', emotion: 'neutral' },
  },
  'accountant-perfume': {
    resolve: { line: 'Ask the two who watched her lean over my figures; their account and the scent on my collar reconcile. Enter it as an interruption, nothing warmer. Proximity balances no column of guilt, and I don’t wear gardenia.', emotion: 'neutral' },
    noReveal: { line: 'Ask the two who watched; none will put that scent over my figures, because none did. No gardenia settled on my collar by any doing of mine. I don’t wear it — reconcile the perfume elsewhere.', emotion: 'neutral' },
  },
  'accountant-powder': {
    resolve: { line: 'You watched the sequence rebuilt — set down, snatched back, the lid springs, the puff scatters across my page. Post it as her clasp. It dusts my ledger and my cuff, and charges nothing to my hand.', emotion: 'thoughtful' },
    noReveal: { line: 'Rebuild the snatched compact all you like — no lid bursts across my ledger in the reconstruction. No ivory dusted my page or cuff. That powder scattered over someone else’s account.', emotion: 'neutral' },
  },
  'accountant-wax': {
    resolve: { line: 'Fix the seal to the stroke, then — stamped and dated on the hour, wax and clock in agreement. Record the time as I did. It ties me to a sealed account; a punctual stamp posts no confession.', emotion: 'neutral' },
    noReveal: { line: 'Fix my dated seal against the clock and the hours won’t reconcile — I stamped no envelope at your stroke. No fleck posts to my cuff. Date a different seal to that minute.', emotion: 'neutral' },
  },
  'accountant-note': {
    resolve: { line: 'No — move the decimal; your total’s off, and you’ve just watched me correct it. Set it down properly: a private tally, a running balance, initials I was chasing. Read right, a subtotal isn’t a threat.', emotion: 'suspicious' },
    noReveal: { line: 'Read the total back as wrong as you like; I won’t correct a tally that was never mine. No torn strip fell from my folio at your scene. Those figures balance in another hand.', emotion: 'neutral' },
  },
  'accountant-ledger': {
    warm: { line: 'Since you’ve listened without sneering at the arithmetic: a late charge was posted twice, then one copy lifted without proper initials. The cabinet was locked before dinner and open after a guest left the study. I won’t name them. I’ll give you the entry, and the entry is true.', emotion: 'thoughtful' },
    measured: { line: 'I’ll hand you the discrepancy and keep the inference: one charge posted twice, one copy quietly removed. Slips add ink; they don’t remove pages. Draw the conclusion yourself — that column’s yours to balance, not mine.', emotion: 'neutral' },
    hostile: { line: 'You’d have me turn an irregular entry into a name. I report access, not guilt. The book’s closed. We’re finished.', emotion: 'angry' },
  },
  'accountant-ledgerlife': {
    warm: { line: 'Plainly, since you’ve been decent about it: a family that promised much and posted nothing taught me a column never lies. But I signed one account that balanced only on paper, and it’s cost me sleep for years. Some totals demand to be paid. I mean to pay this one.', emotion: 'worried' },
    measured: { line: 'Call it arithmetic. People revise their stories; a figure doesn’t. I learned young which to rely on, and I’ve kept the books ever since. That’s the whole of it.', emotion: 'neutral' },
    hostile: { line: 'I didn’t open the ledger of my life for you, and I won’t now. Ask me something that appears in a book, or the meeting adjourns.', emotion: 'neutral' },
  },
  'accountant-audit': {
    warm: { line: 'Since you haven’t sneered at the arithmetic: watch the one who spends against a windfall he hasn’t earned. Anticipated income makes people reckless, and the reckless tidy records that never needed tidying. I’ll give you the discrepancy; what it means, you earn.', emotion: 'thoughtful' },
    measured: { line: 'I’ll hand you the pattern and keep the name: someone reversed a charge that balanced perfectly well on its own. Names follow figures — that’s the correct order of operations. Work the figures and I needn’t point.', emotion: 'neutral' },
    hostile: { line: 'You want the names without the numbers that earn them. That’s arithmetic done backwards. The audit’s suspended, and so are we.', emotion: 'angry' },
  },
}
