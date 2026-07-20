import type { QuestionTopic } from './types'

export type AuthoredEmotion = 'neutral' | 'suspicious' | 'worried' | 'angry' | 'thoughtful' | 'surprised'
export type AuthoredEffect = 'advance' | 'stall' | 'close'

export interface AuthoredDialogueChoice {
  label: string
  response: string
  emotion: AuthoredEmotion
}

export interface AuthoredDialogueStage {
  advance: AuthoredDialogueChoice
  stall: AuthoredDialogueChoice
  close: AuthoredDialogueChoice
}

export interface AuthoredDialogueRoute {
  id: string
  topic: QuestionTopic
  evidenceId?: string
  rootQuestion: string
  openingResponse: string
  openingEmotion: AuthoredEmotion
  stages: [AuthoredDialogueStage, AuthoredDialogueStage]
}

const c = (label: string, response: string, emotion: AuthoredEmotion): AuthoredDialogueChoice => ({ label, response, emotion })
const s = (advance: AuthoredDialogueChoice, stall: AuthoredDialogueChoice, close: AuthoredDialogueChoice): AuthoredDialogueStage => ({ advance, stall, close })
const r = (
  id: string, topic: QuestionTopic, evidenceId: string | undefined,
  rootQuestion: string, openingResponse: string, openingEmotion: AuthoredEmotion,
  first: AuthoredDialogueStage, second: AuthoredDialogueStage,
): AuthoredDialogueRoute => ({ id, topic, evidenceId, rootQuestion, openingResponse, openingEmotion, stages: [first, second] })

export const AUTHORED_DIALOGUE_BY_ARCHETYPE: Record<string, AuthoredDialogueRoute[]> = {
  columnist: [
    r('columnist-ink', 'social', 'ink-fiber', 'You keep taking notes. What have you written about tonight?', 'Names, entrances, little social catastrophes—the usual blue-black immortality.', 'thoughtful',
      s(c('Which entry made you blot the page in such a hurry?', 'A quarrel in the gallery. My pen caught on the paper and left my fingers filthy.', 'suspicious'), c('Are all your notes merely gossip?', 'Gossip is fact wearing evening clothes. That distinction is not tonight’s useful secret.', 'angry'), c('Never mind the notes—who here dresses worst?', 'At last, an inquiry with standards. We are finished with my notebook.', 'neutral')),
      s(c('What happened to the spoiled page?', 'I tore off the ink-heavy corner and tucked the scrap into my cuff until I found a bin.', 'worried'), c('Could someone else have used your pen?', 'Half the room borrows pens. Mine is the one that leaks; that proves nothing further.', 'suspicious'), c('Just name the people who argued.', 'No. Chase their names if you like; the paper is no longer your concern.', 'angry'))),
    r('columnist-perfume', 'room', 'floral-perfume', 'Your perfume seems unusually strong tonight. Why?', 'The atomizer overfilled before dinner. Gardenia is preferable to damp wool, darling.', 'neutral',
      s(c('Where were you when it spilled?', 'At the drawing-room mirror. The bulb stuck and sprayed my glove instead of my wrist.', 'thoughtful'), c('Is that scent fashionable this season?', 'Fashionable enough that three women will claim it and none will wear it properly.', 'neutral'), c('Let us discuss someone else’s habits.', 'With pleasure. My fragrance needs no further cross-examination.', 'neutral')),
      s(c('What did you do with the soaked glove?', 'I carried it from room to room, leaving gardenia behind long after I had gone.', 'worried'), c('Could the conservatory flowers explain it?', 'Only to a nose without education. I cannot improve yours tonight.', 'angry'), c('The perfume tells me nothing.', 'Then stop sniffing around it, sweetheart.', 'suspicious'))),
    r('columnist-shorthand', 'timeline', 'torn-note', 'What was so important that you wrote through dinner?', 'A delicious exchange, recorded in shorthand before either speaker could revise history.', 'thoughtful',
      s(c('What made that note different from the others?', 'I compressed names, a room, and a time into hurried marks along the page edge.', 'suspicious'), c('Will you tell me the gossip instead?', 'Certainly not. A secret given freely has no resale value.', 'angry'), c('Keep your little secret.', 'I intended to. We are done with that page.', 'neutral')),
      s(c('Where is that page edge now?', 'I tore it away when one name became too dangerous to carry; the ragged scrap slipped from my folio.', 'worried'), c('Could anyone read your shorthand?', 'A competent reporter might. Most guests here struggle with menus.', 'neutral'), c('I will ask the speakers directly.', 'Do. They will lie more beautifully than my notes.', 'suspicious'))),
    r('columnist-society', 'intel', undefined, 'Who is pretending hardest to enjoy this gathering?', 'Nearly everyone. The interesting question is who keeps checking the doors between smiles.', 'suspicious',
      s(c('Who keeps watching the doors?', 'The person changes, but the anxious glance began after a private argument near the hall.', 'thoughtful'), c('Is nervousness always meaningful to you?', 'Only when it ruins otherwise excellent posture.', 'neutral'), c('Save it for your column.', 'Gladly. This item is closed.', 'neutral')),
      s(c('What can I verify about that argument?', 'Two voices, one slammed door, and a witness in the corridor who arrived as it ended.', 'thoughtful'), c('Are you protecting the names?', 'I am protecting my standards; overheard fragments are not yet printable.', 'suspicious'), c('That is enough society news.', 'Then we have exhausted the social page.', 'neutral'))),
  ],

  surgeon: [
    r('surgeon-antiseptic', 'room', 'antiseptic', 'You keep washing your hands. What are you trying to remove?', 'Nothing sinister. The conservatory shears nicked my thumb; I cleaned it properly.', 'neutral',
      s(c('What did you use to clean the cut?', 'A sharp antiseptic from my traveling case. Effective, pungent, persistent.', 'thoughtful'), c('Was the cut serious?', 'Superficial. Your interest in its depth is misplaced.', 'angry'), c('Assess the other guests instead.', 'I no longer diagnose strangers socially or otherwise.', 'neutral')),
      s(c('Where did the antiseptic touch your clothing?', 'The stopper slipped. It soaked my cuff before I wiped the bottle clean.', 'worried'), c('Could the smell be plant treatment?', 'Chemically possible. I cannot distinguish it for you at this distance.', 'suspicious'), c('Then your hands tell me nothing.', 'On that, detective, we agree.', 'neutral'))),
    r('surgeon-oil', 'social', 'blade-oil', 'Why bring an instrument case to a house party?', 'Old habit. One hinge seized when I opened it to fetch a bandage.', 'suspicious',
      s(c('How did you free the hinge?', 'One measured drop of light oil and a probe. Forcing precision tools is barbaric.', 'thoughtful'), c('What instruments are inside?', 'Retired ones. Their inventory is irrelevant and private.', 'angry'), c('Put the case away.', 'Already done. Let the subject follow it.', 'neutral')),
      s(c('Did the oil stay on the hinge?', 'No. It ran across my fingertip and marked the edge of my sleeve before I noticed.', 'worried'), c('Could it have come from a clock?', 'The viscosity might match. I serviced no clocks.', 'suspicious'), c('The mechanism is unimportant.', 'Then there is no clinical reason to continue.', 'neutral'))),
    r('surgeon-wax', 'timeline', 'wax-resin', 'What correspondence were you sealing earlier?', 'A private medical letter. Even retirement does not cure people of seeking opinions.', 'thoughtful',
      s(c('What did you use to seal it?', 'An amber sealing stick warmed over a candle, as discretion once required.', 'neutral'), c('Whose condition did it concern?', 'Confidentiality survives social invitations.', 'angry'), c('Keep the letter private.', 'I shall. That closes the matter.', 'neutral')),
      s(c('Did the sealing material leave your desk?', 'It snapped while cooling; brittle golden crumbs clung to my lapel when I brushed them aside.', 'worried'), c('Could it be restoration resin?', 'Visually, perhaps. A chemical test would settle it, not speculation.', 'suspicious'), c('I do not need an analysis.', 'A rare display of restraint. We are finished.', 'neutral'))),
    r('surgeon-observation', 'intel', undefined, 'What have you noticed about the other guests?', 'Elevated pulses, shallow breathing, compulsive gestures. Anxiety has a broad differential.', 'thoughtful',
      s(c('Whose behavior changed most abruptly?', 'One guest became markedly still after voices rose in the corridor.', 'suspicious'), c('Are you diagnosing nerves from across a room?', 'Observing, not diagnosing. Do respect the distinction.', 'angry'), c('Spare me the medical lecture.', 'Then this consultation is concluded.', 'neutral')),
      s(c('What exactly could a witness confirm?', 'The argument ended, a door opened, and that guest’s hands began trembling immediately afterward.', 'thoughtful'), c('Could thunder explain the reaction?', 'Possible, but the tremor preceded it.', 'suspicious'), c('That is enough observation.', 'Agreed. Further inference would exceed the data.', 'neutral'))),
  ],

  curator: [
    r('curator-antiseptic', 'room', 'antiseptic', 'What were you spraying in the conservatory?', 'An orchid showed rot. I treated it before the sickness could spread.', 'worried',
      s(c('What was in the sprayer?', 'A sharp-smelling plant wash, diluted carefully but impossible to disguise.', 'thoughtful'), c('Was the orchid valuable?', 'Alive is value enough. Price is a poor measure for growing things.', 'neutral'), c('Leave the orchid to recover.', 'Yes. This line of inquiry can rest with it.', 'neutral')),
      s(c('How did the wash get on you?', 'The nozzle spat backward. A clean, pungent streak dried across my cuff.', 'worried'), c('Could it be ordinary perfume?', 'Only if someone has very strange taste in perfume.', 'surprised'), c('The plant wash is irrelevant.', 'Then let us stop disturbing the roots.', 'neutral'))),
    r('curator-earth', 'timeline', 'fine-earth', 'What were you repotting so late?', 'Night jasmine. Its roots had cramped, and plants do not honor dinner schedules.', 'neutral',
      s(c('What soil did you use?', 'A pale mineral mixture, finer than garden earth and dry as chalk.', 'thoughtful'), c('Why should I care about a flowerpot?', 'You need not. The jasmine certainly does not care about you.', 'neutral'), c('Return to your plants.', 'Gladly. We are done digging here.', 'neutral')),
      s(c('Where did the pale mixture go afterward?', 'Across my shoes and hem. I tracked the fine grit out before I noticed.', 'worried'), c('Could old plaster look the same?', 'To an impatient eye, yes. Texture would tell them apart.', 'thoughtful'), c('Enough gardening.', 'Then this bed is exhausted.', 'neutral'))),
    r('curator-note', 'social', 'torn-note', 'Why keep notes beside the flower beds?', 'Propagation records: dates, cuttings, small failures. I write quickly before details wilt.', 'thoughtful',
      s(c('What did you record tonight?', 'A time, a slammed door, and initials in my cramped greenhouse shorthand.', 'suspicious'), c('Do plants require initials?', 'People do. Plants are usually more honest.', 'neutral'), c('Keep tending your records.', 'I will. We can prune this subject.', 'neutral')),
      s(c('What became of that entry?', 'I tore off the narrow margin to mark a pot; later the hurried scrap was gone.', 'worried'), c('Could anyone interpret the marks?', 'Another grower might. To others they resemble nervous scratches.', 'thoughtful'), c('I will inspect the greenhouse myself.', 'Mind the roots. Our conversation ends here.', 'neutral'))),
    r('curator-growth', 'intel', undefined, 'Has anything in the house seemed out of place?', 'A door kept opening though the air was still. People moved through it more often than they admit.', 'thoughtful',
      s(c('Which movement struck you as deliberate?', 'Someone waited for the corridor to empty, then crossed without looking at the plants once.', 'suspicious'), c('Could they simply dislike plants?', 'Many do. Indifference alone proves very little.', 'neutral'), c('Let the observation go.', 'As you wish. Some shoots are not worth training.', 'neutral')),
      s(c('What detail could identify the crossing?', 'Their wet sole squeaked twice, and the hall clock had just chimed.', 'thoughtful'), c('Could it have been a servant?', 'The stride was wrong, though I cannot give you a name.', 'suspicious'), c('Nothing more on this subject.', 'Then we have pruned it cleanly.', 'neutral'))),
  ],

  magician: [
    r('magician-wool', 'room', 'black-wool', 'Is that your performance coat?', 'The very one. It survived trapdoors, doves, and tonight’s hostile furniture.', 'neutral',
      s(c('What happened to it tonight?', 'A hidden pocket caught on a cabinet latch and the black weave began to fray.', 'worried'), c('What do you hide in the pocket?', 'A magician’s pocket contains only disappointment and contractual secrets.', 'suspicious'), c('Keep your costume secrets.', 'With a flourish. Curtain on the coat.', 'neutral')),
      s(c('Where did the sleeve finally tear?', 'I pulled free in the passage; a short dark thread stayed hooked behind me.', 'thoughtful'), c('Could it belong to a field coat?', 'Certainly. Black wool is less exclusive than my billing.', 'neutral'), c('The coat proves nothing.', 'Bravo. The trick is concluded.', 'neutral'))),
    r('magician-powder', 'social', 'face-powder', 'Why were you using the mirror before dinner?', 'Testing an illusion. A pale face floats splendidly when the room goes dark.', 'surprised',
      s(c('How did you prepare the effect?', 'Ivory stage powder, a puff, and an unfortunately cracked compact.', 'thoughtful'), c('Did anyone applaud?', 'A brutal question. Rehearsals are sacred.', 'angry'), c('Save the trick for later.', 'Presto—the subject vanishes.', 'neutral')),
      s(c('What did the cracked compact do?', 'Spilled powder over my lapel and the table edge; every touch raised another pale cloud.', 'worried'), c('Could it be ordinary cosmetics?', 'The powder could. The artistry could not.', 'neutral'), c('I have seen enough makeup.', 'Then the mirror goes dark.', 'neutral'))),
    r('magician-oil', 'timeline', 'blade-oil', 'What mechanism were you repairing?', 'A card knife that should spring open dramatically and instead sulked.', 'suspicious',
      s(c('How did you make it move?', 'A pin, patience, and one drop of precision oil along the tiny joint.', 'thoughtful'), c('Is the knife dangerous?', 'Only to dignity when it refuses its cue.', 'neutral'), c('Put the prop away.', 'Already vanished. So has this topic.', 'neutral')),
      s(c('Where did the excess oil go?', 'Onto my thumb, then my cuff when I reset the spring behind my back.', 'worried'), c('Could a sewing machine use the same oil?', 'And clocks, calculators, instruments—a crowded little alibi.', 'suspicious'), c('The mechanism does not interest me.', 'A terrible audience. We are finished.', 'angry'))),
    r('magician-sightline', 'intel', undefined, 'What did everyone else miss tonight?', 'They watched the loud hand. The quiet hand opened a side door while heads were turned.', 'suspicious',
      s(c('What caused the distraction?', 'A dropped tray and three simultaneous glances toward the noise.', 'thoughtful'), c('Is every accident misdirection to you?', 'No. Only the useful ones.', 'neutral'), c('Keep the magician’s theory.', 'And now it disappears.', 'neutral')),
      s(c('What can place the quiet hand?', 'A polished ring caught the lamp for an instant beside the doorframe.', 'surprised'), c('Could the flash have been glass?', 'Possible, but glass does not curl fingers around a handle.', 'suspicious'), c('That glimpse is too uncertain.', 'Then let the curtain fall.', 'neutral'))),
  ],

  correspondent: [
    r('correspondent-ink', 'timeline', 'ink-fiber', 'Were you filing a story tonight?', 'Drafting one. Storm. Stranded guests. Bad tempers. Blue-black ink, worse ending pending.', 'neutral',
      s(c('What interrupted the draft?', 'Raised voices. My fountain pen tore through the page when the door slammed.', 'suspicious'), c('Who is the story about?', 'Everyone. Names wait until facts arrive.', 'neutral'), c('Drop the story.', 'Copy spiked. Topic closed.', 'neutral')),
      s(c('What did you do with the torn copy?', 'Blotted it, ripped away the soaked fiber, shoved the scrap into my coat.', 'thoughtful'), c('Could another writer use that ink?', 'Columnists. Accountants. Anyone with obsolete habits.', 'neutral'), c('The draft is irrelevant.', 'Agreed. No more copy.', 'neutral'))),
    r('correspondent-wool', 'room', 'black-wool', 'Why wear that heavy coat indoors?', 'Field habit. Pockets where I expect them. Black wool built for worse weather.', 'neutral',
      s(c('Has it been damaged tonight?', 'Left sleeve caught a brass latch. Old seam opened another inch.', 'worried'), c('Are you expecting a battlefield?', 'I expect exits. Battlefields are optional.', 'suspicious'), c('Take off the coat and forget it.', 'No. But I will forget the question.', 'neutral')),
      s(c('Where did the seam catch?', 'Narrow passage by the side door. A thread stayed on the latch when I pulled free.', 'thoughtful'), c('Could it be a driver’s uniform thread?', 'Same color. Similar weave. Test it.', 'neutral'), c('The coat leads nowhere.', 'Then stop following it.', 'neutral'))),
    r('correspondent-note', 'social', 'torn-note', 'Who were you interviewing in the corridor?', 'A source. Nervous. Gave me a time and room in compressed shorthand.', 'suspicious',
      s(c('What made the source nervous?', 'They heard an argument and feared their initials would identify them.', 'thoughtful'), c('Will you name your source?', 'No. Source protection outlives dinner invitations.', 'angry'), c('Keep the interview off record.', 'It stays buried. We are done.', 'neutral')),
      s(c('What happened to your shorthand page?', 'I tore away the identifying lines; the hurried fragment escaped my pocket.', 'worried'), c('Could your marks be mistaken for gossip notes?', 'Easily. Meaning depends on who taught the hand.', 'neutral'), c('I will find another witness.', 'Do that. This source is closed.', 'neutral'))),
    r('correspondent-exits', 'intel', undefined, 'You count exits. Who used them?', 'Most drifted. One waited, checked both corridors, then moved with purpose.', 'suspicious',
      s(c('When did that happen?', 'Just after the clock struck; rain masked the first few steps.', 'thoughtful'), c('Could they simply want privacy?', 'Could. Privacy usually walks slower.', 'neutral'), c('Drop the field report.', 'Filed and closed.', 'neutral')),
      s(c('What detail distinguishes the person?', 'A limp for three steps, then none once they thought the corridor empty.', 'surprised'), c('Could bad shoes explain it?', 'Yes. So could performance. Verify it yourself.', 'suspicious'), c('That is too little to pursue.', 'Then this dispatch ends.', 'neutral'))),
  ],

  accountant: [
    r('accountant-ink', 'timeline', 'ink-fiber', 'What were you correcting in the estate ledger?', 'An entry that refused to balance. Blue-black posting ink makes errors look permanent.', 'angry',
      s(c('Why did the correction become messy?', 'Someone startled me; the nib split the paper and ink flooded the margin.', 'suspicious'), c('How much money was missing?', 'An immaterial sum for this inquiry and a material one for the estate.', 'neutral'), c('Close the ledger.', 'Gladly. Account settled.', 'neutral')),
      s(c('What became of the damaged margin?', 'I tore off the saturated strip and used it as a blotter until the fibers came apart.', 'worried'), c('Could a reporter use identical ink?', 'Yes. Ink is not loyal to a profession.', 'neutral'), c('The books can wait.', 'Then this entry is closed.', 'neutral'))),
    r('accountant-polish', 'room', 'metal-polish', 'Why were you handling the silver?', 'Inventory. One candlestick looked newly moved and badly tarnished.', 'suspicious',
      s(c('How did you test the tarnish?', 'A dab of waxy metal polish on the base. It lifted the oxide immediately.', 'thoughtful'), c('Was the candlestick valuable?', 'Everything has a value. That answer has none.', 'angry'), c('Leave the silver alone.', 'With pleasure. Item removed from discussion.', 'neutral')),
      s(c('Did the polish remain on the candlestick?', 'No rag was provided. The metallic smear stayed on my fingertips and ledger cuff.', 'worried'), c('Could it be polish from a motorcar?', 'Substantially similar. Brand records might distinguish it.', 'thoughtful'), c('The inventory is irrelevant.', 'Then strike it from your inquiry.', 'neutral'))),
    r('accountant-oil', 'social', 'blade-oil', 'Why were you repairing the adding machine?', 'The carriage stuck halfway through a column. I dislike interrupted totals.', 'angry',
      s(c('What freed the carriage?', 'A minute drop of machine oil placed along the precision rail.', 'thoughtful'), c('Could you not add by hand?', 'I could. I could also walk home in the storm. Neither is sensible.', 'neutral'), c('Forget the machine.', 'Transaction canceled.', 'neutral')),
      s(c('Where did the oil go afterward?', 'The key snapped back, flicking a clear drop onto my hand and sleeve.', 'worried'), c('Would instrument oil look the same?', 'Likely. Composition, not appearance, would answer that.', 'thoughtful'), c('Your total tells me nothing.', 'Then the account is closed.', 'neutral'))),
    r('accountant-ledger', 'intel', undefined, 'What in the household accounts looks unusual?', 'A late charge posted twice, then one copy removed without proper initials.', 'suspicious',
      s(c('Who could alter that entry?', 'Anyone with access to the study, but only a few knew which book to open.', 'thoughtful'), c('Could it be a clerical mistake?', 'Mistakes add ink. They do not remove pages.', 'angry'), c('Leave the audit for morning.', 'Very well. This account closes tonight.', 'neutral')),
      s(c('What fact can narrow access?', 'The cabinet was locked before dinner and open after a particular guest left the study.', 'suspicious'), c('Are you accusing that guest?', 'I report access. Accusation is your unbalanced column.', 'neutral'), c('That is enough bookkeeping.', 'Finally, a reconciled decision.', 'neutral'))),
  ],

  vocalist: [
    r('vocalist-perfume', 'room', 'floral-perfume', 'That floral scent follows you. What happened?', 'My atomizer leaked before the first song. Gardenia got the encore instead.', 'neutral',
      s(c('What did the perfume soak?', 'My scarf and glove, sugar. One little bulb made the whole room bloom.', 'thoughtful'), c('Is gardenia your signature scent?', 'A singer keeps some signatures off the program.', 'neutral'), c('Change the tune.', 'All right. That song is over.', 'neutral')),
      s(c('Where did you carry the scented things?', 'Down the hall and through two rooms before I tucked them away; the perfume lingered behind.', 'worried'), c('Could the flowers smell the same?', 'Close enough to fool a hurried heart, not a patient nose.', 'thoughtful'), c('The scent leads nowhere.', 'Then let it fade.', 'neutral'))),
    r('vocalist-powder', 'social', 'face-powder', 'Were you dressing for a performance tonight?', 'Just a touch-up. Lamps turn every tired face into a confession.', 'neutral',
      s(c('What went wrong with the touch-up?', 'My ivory compact cracked. Powder jumped like cymbal dust across my collar.', 'surprised'), c('Who were you hoping to impress?', 'The room, honey. Never one person when an audience is available.', 'neutral'), c('Enough about appearances.', 'Then the mirror goes quiet.', 'neutral')),
      s(c('Did you clean up the spill?', 'Tried. Every brush sent pale dust onto the dressing table and my sleeve.', 'worried'), c('Could stage makeup belong to anyone?', 'Anybody can own powder. Wearing it well is rarer.', 'neutral'), c('Put the compact away.', 'Closed tight, like this subject.', 'neutral'))),
    r('vocalist-wax', 'timeline', 'wax-resin', 'What were you rubbing onto your music case?', 'A little amber performance wax. Keeps a stubborn clasp and my grip from slipping.', 'thoughtful',
      s(c('Why warm it by the lamp?', 'Cold wax skips. Warm it, and it moves smooth as a low note.', 'neutral'), c('Does wax improve your singing?', 'No, but this conversation may need several coats.', 'suspicious'), c('Leave the case shut.', 'Fine by me. End of the number.', 'neutral')),
      s(c('What happened when the wax cooled?', 'The cake chipped. Brittle golden crumbs caught in the music wrap and on my sleeve.', 'worried'), c('Could it be sealing wax?', 'Same family of shine, different rhythm. A test could tell.', 'thoughtful'), c('The wax is no concern.', 'Then let that note resolve.', 'neutral'))),
    r('vocalist-ear', 'intel', undefined, 'What did you hear while everyone else was talking?', 'A door on the offbeat, hurried shoes, then somebody humming to cover their nerves.', 'thoughtful',
      s(c('What tune were they humming?', 'Mine from earlier, but the last phrase repeated too fast.', 'suspicious'), c('Do nervous people always hum?', 'Some pray. Some lie. Some borrow a melody.', 'neutral'), c('Let the sound fade.', 'The room goes quiet now.', 'neutral')),
      s(c('Where did the humming move?', 'From the side hall toward the stairs, stopping when another guest appeared.', 'thoughtful'), c('Could it have been you?', 'I know when I sing, sugar—even badly.', 'angry'), c('That is not enough to follow.', 'Then the song ends there.', 'neutral'))),
  ],

  antiquarian: [
    r('antiquarian-earth', 'room', 'fine-earth', 'What object were you examining on the floor?', 'A small ceramic figure with a regrettably undocumented base.', 'thoughtful',
      s(c('What was packed beneath its base?', 'Pale mineral dust, very fine—perhaps old display packing rather than common soil.', 'thoughtful'), c('How old was the figure?', 'Late Han in aspiration, last Tuesday in execution.', 'angry'), c('Put the trinket back.', 'Object returned; inquiry concluded.', 'neutral')),
      s(c('Where did the mineral dust go?', 'Across my fingertips, shoes, and hem when the false base gave way.', 'worried'), c('Could it be plaster?', 'Possibly to an untrained eye. The grain deserves magnification.', 'suspicious'), c('The dust is not important.', 'Philistinism noted. We are done.', 'angry'))),
    r('antiquarian-polish', 'timeline', 'metal-polish', 'Why were you polishing the brass cabinet?', 'Authentication. Old brass accepts wax differently from modern plate.', 'neutral',
      s(c('What did you apply?', 'A pinhead of waxy metal polish to an inconspicuous corner.', 'thoughtful'), c('Did you have permission?', 'History outranks temporary ownership, within reason.', 'suspicious'), c('Stop handling the collection.', 'I have stopped discussing it, at least.', 'neutral')),
      s(c('How did the polish get onto you?', 'My glove split at the thumb; the metallic smear crossed skin, cuff, and catalog card.', 'worried'), c('Could silver polish match it?', 'Closely. Residue analysis would settle provenance.', 'thoughtful'), c('No more conservation details.', 'A merciful end to your education.', 'neutral'))),
    r('antiquarian-resin', 'social', 'wax-resin', 'What were you repairing before dinner?', 'A loose veneer on a small reliquary. Neglect is history’s dullest vandal.', 'angry',
      s(c('What held the veneer?', 'Warm amber restoration resin, sparingly applied beneath the lifted edge.', 'thoughtful'), c('Was the reliquary valuable?', 'Culturally, immensely. Financially, ask the ledger worshipper.', 'neutral'), c('Leave the relic alone.', 'The relic and topic are now sealed.', 'neutral')),
      s(c('Did the resin stay on the object?', 'A brittle fleck snapped free and crumbled against my sleeve when I closed the case.', 'worried'), c('Could sealing wax look identical?', 'Superficially. Age and composition would expose the impostor.', 'suspicious'), c('I need no provenance lesson.', 'Your loss. The lecture is concluded.', 'angry'))),
    r('antiquarian-history', 'intel', undefined, 'Does this house’s history suggest anything useful?', 'Its servants once used a narrow route between public rooms, now hidden behind paneling.', 'thoughtful',
      s(c('Is the hidden route still usable?', 'One panel bears fresh scratches around an otherwise ancient catch.', 'suspicious'), c('Is every scratch historically important?', 'No. Fresh damage on old wood earns attention.', 'angry'), c('Save the house tour.', 'The tour and topic end here.', 'neutral')),
      s(c('Where is the scratched panel?', 'Beside the landscape whose frame hangs slightly crooked in the west passage.', 'thoughtful'), c('Could movers have damaged it?', 'Possible, though no inventory records a recent move.', 'suspicious'), c('I will ignore the passage.', 'History is accustomed to being ignored.', 'neutral'))),
  ],

  chauffeur: [
    r('chauffeur-solvent', 'room', 'antiseptic', 'What is that sharp smell on your hands?', 'Cleaning solvent. Battery terminal furred up before the rain.', 'neutral',
      s(c('What sort of cleaner did you use?', 'Clear stuff from the motor kit. Sharp, clean, bites the nose.', 'thoughtful'), c('Will the car start now?', 'Road’s flooded. Starting isn’t leaving.', 'neutral'), c('Forget the garage.', 'Fine. Garage is closed.', 'neutral')),
      s(c('How did it reach your clothes?', 'Bottle kicked when I set it down. Splashed my cuff before I capped it.', 'worried'), c('Could it be medical antiseptic?', 'Smells close. I’m no chemist.', 'suspicious'), c('The solvent tells me nothing.', 'Then we’re done with it.', 'neutral'))),
    r('chauffeur-wool', 'timeline', 'black-wool', 'Is that your driving uniform coat?', 'Yeah. Black wool. Warm, tough, mostly.', 'neutral',
      s(c('Why only mostly tough?', 'Sleeve caught on a seat spring. Seam’s been shedding since.', 'worried'), c('Do you always dress for work off duty?', 'Car trouble doesn’t check the invitation.', 'neutral'), c('Forget the uniform.', 'Done.', 'neutral')),
      s(c('Where else did the torn sleeve catch?', 'Side-door latch. Pulled away and left a short dark thread on it.', 'thoughtful'), c('Could it be another black coat?', 'Sure. Plenty of black wool in this house.', 'neutral'), c('The thread is useless.', 'Then stop pulling it.', 'neutral'))),
    r('chauffeur-polish', 'social', 'metal-polish', 'Besides your cap, what have you been polishing?', 'Bentley’s radiator badge. Butler wanted it bright before the weather turned.', 'neutral',
      s(c('What polish did you use?', 'Tin by the garage door. Waxy stuff. Smells like pennies and paraffin.', 'thoughtful'), c('Why polish a car in this storm?', 'Job came before rain. Weather doesn’t cancel chores.', 'neutral'), c('Tell me who has been drinking instead.', 'Ask the glasses. I’m done with the motor.', 'neutral')),
      s(c('How did the polish get onto you?', 'No rag. Wiped two fingers inside my glove; seam split and smeared my cuff.', 'worried'), c('Could the smear come from silver?', 'Could. Same sort of compound. I didn’t polish silver.', 'suspicious'), c('The badge is irrelevant.', 'Then nothing else to say about it.', 'neutral'))),
    r('chauffeur-traffic', 'intel', undefined, 'Who has been moving through the halls?', 'Lots of trips. One guest used the service door twice and pretended not to know it existed.', 'suspicious',
      s(c('What makes you sure it was the same person?', 'Same step. Heel drags on the left when they hurry.', 'thoughtful'), c('You identify people by footsteps?', 'Drive long enough, you hear bad bearings.', 'neutral'), c('Leave the traffic report.', 'All right. Road closed.', 'neutral')),
      s(c('When was the second trip?', 'After the hall clock chimed, before the next thunderclap.', 'thoughtful'), c('Could a servant walk the same way?', 'Could. Didn’t look like staff shoes.', 'suspicious'), c('That timing is too vague.', 'Then we’re done.', 'neutral'))),
  ],

  debutante: [
    r('debutante-earth', 'room', 'fine-earth', 'Why were you taking the conservatory shortcut?', 'The corridor was crowded, and jasmine is much nicer company.', 'neutral',
      s(c('What happened to your shoes in there?', 'A pot had spilled pale, powdery grit. It poured straight into my slipper.', 'surprised'), c('Were you hiding from someone?', 'I prefer “avoiding a tedious conversation.” Much prettier.', 'suspicious'), c('Forget the shortcut.', 'Oh, good. My shoes are suffered enough.', 'neutral')),
      s(c('What did you do with the grit?', 'Shook it out by the hall bench, though plenty stayed along my hem.', 'worried'), c('Could it be dust from an old vase?', 'Perhaps. This house sheds nearly as much as its guests.', 'neutral'), c('The dirt is unhelpful.', 'Then let us not dig any deeper.', 'neutral'))),
    r('debutante-perfume', 'social', 'floral-perfume', 'Whose perfume atomizer were you borrowing?', 'Mine, mostly. A friend’s gardenia refill made it far stronger than expected.', 'neutral',
      s(c('Why did it smell so strong?', 'I squeezed twice when the bulb stuck. It drenched my glove and vanity scarf.', 'surprised'), c('Was it expensive?', 'Expensive enough to pretend the spill was intentional.', 'neutral'), c('Put the perfume away.', 'Already hidden. Topic too.', 'neutral')),
      s(c('Where did you carry the wet glove?', 'Everywhere until dinner. The scent arrived before me and stayed after.', 'worried'), c('Could another guest wear gardenia?', 'Of course. Taste is not exclusive, sadly.', 'neutral'), c('The scent proves nothing.', 'Then we can stop talking about it.', 'neutral'))),
    r('debutante-powder', 'timeline', 'face-powder', 'What happened to your compact?', 'It slipped while I was fixing my face. Ivory powder simply exploded.', 'surprised',
      s(c('Where did it spill?', 'Across my collar, handbag, and the little table beside the mirror.', 'worried'), c('Why fix your face so often?', 'Because people ask questions like that.', 'angry'), c('Close the compact.', 'Snapped shut. So is the subject.', 'neutral')),
      s(c('Did cleaning it spread the powder?', 'Terribly. Every pat lifted a pale cloud and left more on my sleeve.', 'worried'), c('Could it be theatrical makeup?', 'It could. Mine has a nicer case.', 'neutral'), c('I have heard enough about cosmetics.', 'Thank heavens. Nothing more there.', 'neutral'))),
    r('debutante-glance', 'intel', undefined, 'What have people assumed you failed to notice?', 'That two guests exchanged keys beneath the card table while explaining the rules to me.', 'suspicious',
      s(c('What did the keys look like?', 'One long and brass, one small and silver; only the brass one changed hands.', 'thoughtful'), c('Were you cheating at cards?', 'Only at being underestimated.', 'neutral'), c('Let the card game go.', 'If you insist. I fold.', 'neutral')),
      s(c('Where did the brass key go?', 'Into a left coat pocket just before its new owner left the room alone.', 'thoughtful'), c('Could it have been a coin?', 'Coins do not have teeth, detective. Even I know that.', 'angry'), c('That exchange is none of my concern.', 'Then we have nothing else to discuss about it.', 'neutral'))),
  ],
}
