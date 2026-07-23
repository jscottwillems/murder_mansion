// src/game/dialogue/types.ts
var c = (label, response, emotion) => ({ label, response, emotion });
var rep = (label, line, emotion, trust = 0, pressure = 0) => ({ label, line, emotion, ...trust ? { trust } : {}, ...pressure ? { pressure } : {} });
var pa = (id, topic, rootQuestion, opening, openingEmotion, replies) => ({ id, topic, rootQuestion, opening, openingEmotion, replies });
var s = (advance, stall, close) => ({ advance, stall, close });
var r = (id, topic, evidenceId, rootQuestion, openingResponse, openingEmotion, first, second, extras = {}) => ({ id, topic, evidenceId, rootQuestion, openingResponse, openingEmotion, stages: [first, second], ...extras });

// src/game/dialogue/packA.ts
var PACK_A = {
  columnist: [
    r(
      "columnist-ink",
      "social",
      "ink-fiber",
      "Your hand\u2019s smudged with ink. Where did that come from?",
      "My pen skidded during a row in the gallery and left ink all over my hand. I tore the ruined page clean out.",
      "thoughtful",
      s(
        c("What was the row you were writing down?", "Two guests going at each other. I got a name down before the ink ran everywhere.", "suspicious"),
        c("Aren\u2019t these just gossip notes?", "Gossip pays my rent. But no, that isn\u2019t tonight\u2019s useful part.", "angry"),
        c("Enough. What\u2019s really in that notebook?", "Now you\u2019re asking properly. And now we\u2019re done with my notebook.", "neutral")
      ),
      s(
        c("What happened to the page you tore out?", "It was soaked with ink, so I ripped it away and tucked the scrap in my cuff to bin later.", "worried"),
        c("Could someone else have used your pen?", "Half the room borrows pens. Mine just leaks. That proves nothing.", "suspicious"),
        c("Just tell me who was arguing.", "No. Go find their names yourself \u2014 the page is mine.", "angry")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare the ink on her hand to the torn page.",
        bargain: c("Help me quietly and I keep your source out of it?", "Kind, for a hired man. The ink\u2019s mine, yes \u2014 but a leaky pen isn\u2019t a crime.", "thoughtful"),
        challenge: c("That ink matches the torn page. Explain yourself.", "So compare them. A pen that leaks makes a mess, not a monster.", "angry")
      }
    ),
    r(
      "columnist-perfume",
      "room",
      "floral-perfume",
      "Your perfume is awfully strong tonight. Why?",
      "The atomizer overfilled at the drawing-room mirror. The bulb jammed and soaked my glove instead of my wrist \u2014 gardenia beats damp wool, believe me.",
      "neutral",
      s(
        c("How did it catch the glove and miss your skin?", "I was holding it up to the light when the bulb stuck. The cloth took the whole spray.", "thoughtful"),
        c("Is that scent in fashion this year?", "Fashionable enough that three women will claim it tonight.", "neutral"),
        c("That\u2019s a lot of perfume for one evening. Why?", "Nonsense. My perfume doesn\u2019t need cross-examining.", "neutral")
      ),
      s(
        c("What did you do with the soaked glove?", "Carried it around a while. It left gardenia in every room I passed.", "worried"),
        c("Could the conservatory flowers explain it?", "Only to someone who can\u2019t tell real gardenia from a bottle.", "angry"),
        c("That\u2019s enough about the perfume.", "Then stop sniffing around it.", "suspicious")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have her show how the atomizer soaked the glove.",
        bargain: c("Tell me who else used that atomizer \u2014 I won\u2019t print it.", "You do listen. Someone used it after me; that\u2019s why the scent sits heavier on the glove than on me.", "thoughtful"),
        challenge: c("You soaked that glove on purpose. Why leave a trail?", "So a bulb sprayed cloth harder than wrist. That\u2019s a spill, not a plot.", "angry")
      }
    ),
    r(
      "columnist-shorthand",
      "timeline",
      "torn-note",
      "What was so important you kept writing through dinner?",
      "A conversation worth keeping. I got it down in shorthand, then tore the margin free when one name on it turned dangerous. A time, a lone letter, half a room \u2014 that\u2019s all it holds.",
      "thoughtful",
      s(
        c("Which conversation was worth tearing a page for?", "A meeting two people wanted buried. I keep those; I don\u2019t sell them.", "suspicious"),
        c("Will you just tell me the gossip?", "No. Gossip given away for free isn\u2019t worth having.", "angry"),
        c("Hand over the page.", "I meant to. We\u2019re done with that page.", "neutral")
      ),
      s(
        c("Where\u2019s that torn margin now?", "It fell out of my folio somewhere after I tore it free.", "worried"),
        c("Can anyone else read your shorthand?", "A good reporter could. Most people here struggle with the menu.", "neutral"),
        c("I\u2019ll just ask the two who argued.", "Do. They lie better than my notes.", "suspicious")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Check the time on her scrap against the gallery row.",
        bargain: c("Just give me the time \u2014 I\u2019ll leave the rest alone.", "All right. It reads 12:10, a lone C, and part of a room. A meeting, not an accusation.", "thoughtful"),
        challenge: c("You\u2019re hiding a name on that scrap. Whose?", "You read torn paper boldly. A time and half a letter accuse no one.", "angry")
      }
    ),
    r(
      "columnist-society",
      "intel",
      void 0,
      "Who here looks the most nervous?",
      "Half of them, darling \u2014 but one keeps checking the doors between smiles.",
      "suspicious",
      s(
        c("Who\u2019s watching the doors?", "It changes. The nervous looks started after a row near the hall.", "thoughtful"),
        c("A row about what?", "I only caught raised voices and a slammed door. Names I haven\u2019t earned yet.", "neutral"),
        c("Just tell me who looked afraid.", "Gladly. And now we\u2019re done with this one.", "neutral")
      ),
      s(
        c("What exactly did you hear?", "Two voices, a slammed door, and someone who reached the corridor just as it ended.", "thoughtful"),
        c("Why won\u2019t you give me the names?", "Half-heard scraps aren\u2019t fit to print. I won\u2019t hand you gossip I can\u2019t stand behind.", "suspicious"),
        c("That\u2019s enough for now.", "Then we\u2019ve finished.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 who looked scared?", "Off the record, then. A quiet man went pale when the hall door slammed.", "thoughtful"),
        challenge: c("Names. Now.", "Threaten me and you\u2019ll get nothing. We\u2019re finished.", "angry")
      }
    ),
    r(
      "columnist-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands smell so sharply of medicine?",
      "I cut my thumb on a broken glass and borrowed a little bottle from someone\u2019s kit to clean it. It stung like a bad review.",
      "worried",
      s(
        c("What was in the bottle you borrowed?", "Clear stuff, very sharp \u2014 carbolic, at a guess. Not mine to keep.", "thoughtful"),
        c("Is one small cut worth all this?", "I write by hand. A ruined thumb is a professional disaster.", "neutral"),
        c("That\u2019s a strong smell for one small cut.", "Believe what you like. The bottle wasn\u2019t mine to keep. We\u2019re done.", "neutral")
      ),
      s(
        c("Whose kit did the bottle come from?", "Someone pressed it on me in the powder room and watched me dab it on.", "worried"),
        c("Could that smell come from cleaning something else?", "Half the house reeks of the sickroom tonight. Mine just closed a cut.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then stop breathing in my bad luck.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask whoever lent her the bottle.",
        bargain: c("Name who lent the bottle and I keep your cut out of it.", "Generous. Ask them \u2014 they watched me clean the cut, and the smell explains itself.", "thoughtful"),
        challenge: c("That smell isn\u2019t from a cut. What did you really clean?", "Ask. A borrowed bottle and a witness prove I bleed, not that I\u2019m dangerous.", "angry")
      }
    ),
    r(
      "columnist-earth",
      "timeline",
      "fine-earth",
      "How did pale grit get on your hem?",
      "I followed a promising row into the conservatory and knelt where a pot had been knocked over.",
      "suspicious",
      s(
        c("Why did you kneel in the spilled grit?", "There was a folded note under the bench. You pick those up gracefully or not at all.", "thoughtful"),
        c("Do you always ruin a gown for gossip?", "For the right gossip, I\u2019d ruin a lot more.", "neutral"),
        c("You didn\u2019t kneel for nothing. What were you after?", "My knees are my own business. That\u2019s closed.", "neutral")
      ),
      s(
        c("Where did that grit go after you stood up?", "From my hem to my hand to the bench I steadied myself on. It gets everywhere.", "worried"),
        c("Could the grit just be from the garden?", "Too pale and too fine for garden soil. Someone tracked it in.", "thoughtful"),
        c("The grit isn\u2019t helping.", "Then stop following my hemline.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the grit from the pot to her hem and the bench.",
        bargain: c("Walk me through the grit and I stay discreet.", "Kind of you. Pot to hem, hem to hand, hand to bench. That\u2019s the whole trip.", "thoughtful"),
        challenge: c("That grit puts you at the spilled pot. What were you really after?", "So it does. Kneeling by a spill makes me nosy, not dangerous.", "angry")
      }
    ),
    r(
      "columnist-wool",
      "social",
      "black-wool",
      "Where did those black threads on your shoulders come from?",
      "A man draped his coat over me against the draught in the gallery. It shed all over me.",
      "neutral",
      s(
        c("Which man lent you the coat?", "One too dull to name and too warm to refuse. The wool caught on my clasp straight away.", "thoughtful"),
        c("Do you make a habit of borrowing men\u2019s coats?", "Only when the house is cold and the company\u2019s colder.", "neutral"),
        c("That thread\u2019s too coarse for a dinner jacket.", "Explain it yourself. The coat went back to its owner.", "neutral")
      ),
      s(
        c("Where exactly did the wool snag?", "On my shoulder clasp, the moment he settled it round me.", "worried"),
        c("Could the thread be from your own wrap?", "My wrap is silk. That coarse black strand is his, not mine.", "suspicious"),
        c("The thread isn\u2019t enough.", "Then stop picking at it.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Compare the coarse thread to her silk wrap.",
        bargain: c("Point me to the coat and I keep the man\u2019s name out of it.", "Decent of you. My wrap\u2019s silk; that strand is coarse wool, so it came off his coat, not me.", "thoughtful"),
        challenge: c("That thread is yours. Prove it isn\u2019t.", "Compare them. Silk against wool. Even you can tell those apart.", "angry")
      }
    ),
    r(
      "columnist-polish",
      "room",
      "metal-polish",
      "Why is there a waxy metal smear on your fingers?",
      "I picked up a silver cigarette case to read the engraving. Someone had just polished it.",
      "neutral",
      s(
        c("Whose case were you reading?", "One with initials worth a paragraph, if they\u2019re who I think.", "suspicious"),
        c("Do you handle everything that isn\u2019t yours?", "Only the shiny, secretive things. They make the best columns.", "neutral"),
        c("What else did you handle?", "A lady doesn\u2019t list her own fingerprints. That\u2019s closed.", "neutral")
      ),
      s(
        c("Where did the polish end up?", "On my fingers and the clasp \u2014 right where a thumb opens it.", "worried"),
        c("Could that smear be from your own compact?", "My compact holds powder, not polish. That\u2019s someone\u2019s freshly shined silver.", "thoughtful"),
        c("The smear isn\u2019t enough.", "Then let go of my hand.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell her she smudged the engraving \u2014 see if she corrects you.",
        bargain: c("Help me and the engraving stays out of print.", "You bargain well. I only touched the lid to read it \u2014 whoever polished the base is your man.", "thoughtful"),
        challenge: c("You wiped more than polish off that case. What else?", "I read an engraving. Curiosity smudges silver; it isn\u2019t a confession.", "angry")
      }
    ),
    r(
      "columnist-powder",
      "social",
      "face-powder",
      "Why is there ivory powder on your sleeve?",
      "The powder room was a scrum of women all patting at once. A cloud like that doesn\u2019t pick favourites.",
      "neutral",
      s(
        c("Who were you crowded next to?", "Two women sharing one mirror and, it seems, one compact\u2019s worth of dust.", "thoughtful"),
        c("Isn\u2019t that just your own powder?", "Mine stays on my face, not thrown across a sleeve like confetti.", "neutral"),
        c("That powder looks pressed on, not dusted.", "My makeup isn\u2019t evidence. We\u2019re finished.", "neutral")
      ),
      s(
        c("Where did the stray powder settle?", "My sleeve and cuff, where another woman brushed me reaching for the glass.", "worried"),
        c("Couldn\u2019t every woman here wear that shade?", "Several claim to. Only one wears it as heavily as this.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then stop dusting me for it.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the powder on her sleeve to the compact.",
        bargain: c("Help me match the compact \u2014 I won\u2019t name her in print.", "Kind. The shade on my sleeve is heavier than mine \u2014 match it to her compact.", "thoughtful"),
        challenge: c("That powder was pressed onto you, not brushed. Who did it?", "Compare the shades. Mine\u2019s lighter. Someone else\u2019s cloud landed on me.", "angry")
      }
    ),
    r(
      "columnist-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with machine oil?",
      "My lighter jammed at the worst moment. A drop of oil and some bad language sorted it out.",
      "suspicious",
      s(
        c("When did the lighter jam?", "Just as the hall clock struck. I remember because I swore along with the chimes.", "thoughtful"),
        c("Why not just ask someone for a light?", "And owe them a favour? I\u2019d rather oil a hinge than a debt.", "neutral"),
        c("That\u2019s more oil than one lighter needs.", "My vices are my own. That\u2019s closed.", "neutral")
      ),
      s(
        c("Where did the extra oil go?", "Across my thumb and the lighter\u2019s wheel, right as the chimes finished.", "worried"),
        c("Could that oil be from a clock or a lock?", "It could be from a dozen things. Mine was a stubborn flame.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then stop sniffing my fingers.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the oiled lighter to the clock stroke she named.",
        bargain: c("Give me the time the lighter jammed \u2014 I\u2019ll leave the rest.", "Fair. The lighter jammed on the clock\u2019s stroke \u2014 the oil and the time agree, and neither accuses me.", "thoughtful"),
        challenge: c("That\u2019s more oil than a lighter needs. What else did you oil?", "So test it. A stubborn flame makes a mess, not a plot.", "angry")
      }
    ),
    r(
      "columnist-wax",
      "social",
      "wax-resin",
      "Why is there a brittle amber fleck on your cuff?",
      "I seal my riskier notes with wax. A slammed drawer knocked the stick before it cooled.",
      "thoughtful",
      s(
        c("What did you need to seal?", "A note too costly to leave loose in a folio.", "suspicious"),
        c("Do columnists still bother with sealing wax?", "The careful ones do. A licked flap protects nothing worth protecting.", "neutral"),
        c("That\u2019s not ordinary letter wax.", "A sealed secret stays sealed. We\u2019re finished with it.", "neutral")
      ),
      s(
        c("How did the wax get on your cuff?", "It snapped as I pressed the seal \u2014 a warm fleck flicked onto my cuff before it set.", "worried"),
        c("Could that fleck be restoration resin?", "To a careless eye. Mine came off a sealing stick, not an antique.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then stop scraping at my cuff.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have her seal another note and show how the fleck lands.",
        bargain: c("Show me how the wax broke and I leave the sealed note alone.", "All right. I press here, the stick snaps there, the fleck lands on my cuff. No mystery.", "thoughtful"),
        challenge: c("You sealed something you won\u2019t admit. What was it?", "So I seal my letters. Watch me do it \u2014 the wax breaks, nothing worse.", "angry")
      }
    ),
    r(
      "columnist-origins",
      "connection",
      void 0,
      "How did you end up writing about people for a living?",
      "I worked out young that the truth pays better than a diploma \u2014 and it\u2019s better company too.",
      "thoughtful",
      s(
        c("Who taught you to watch people?", "My mother. She could read a room in a glance. I got the eye, not the mercy.", "thoughtful"),
        c("Do you ever get tired of other people\u2019s secrets?", "The dull ones, yes. The dangerous ones keep me interested.", "neutral"),
        c("I have other questions.", "As you like. I didn\u2019t expect you to care anyway.", "neutral")
      ),
      s(
        c("Who do you look out for?", "The ones who can\u2019t outrun a headline. I\u2019ve spiked more stories than I\u2019ve run.", "worried"),
        c("What won\u2019t you forgive?", "Cruelty wearing a smile. I keep a whole drawer for it.", "suspicious"),
        c("We\u2019re done here.", "Pity. I was almost being honest.", "neutral")
      ),
      {
        bargain: c("Honestly \u2014 why stay in this work?", "Because the right sentence, printed at the right moment, can still protect someone. Foolish, I know.", "thoughtful"),
        challenge: c("What are you hiding behind all that charm?", "Everyone here is hiding something. Mine just has better grammar.", "angry")
      }
    ),
    r(
      "columnist-guests",
      "intel",
      void 0,
      "Which of these guests do you actually know?",
      "Half of them, professionally. The other half wish I didn\u2019t \u2014 which tells you plenty.",
      "suspicious",
      s(
        c("Who have you written about before?", "A few. One never forgave me the paragraph; another begged me for the next one.", "thoughtful"),
        c("Anyone make you uneasy?", "Two go quiet when I walk in. Quiet is interesting.", "neutral"),
        c("I need something I can use.", "Then I\u2019ll be poor company tonight.", "neutral")
      ),
      s(
        c("Who do you actually like here?", "The singer. She lies beautifully, and never about anything that matters.", "thoughtful"),
        c("Who do you avoid?", "The ones who mistake my smile for stupidity. There are always a few.", "suspicious"),
        c("That\u2019s enough.", "As you wish. Guest list\u2019s closed.", "neutral")
      ),
      {
        bargain: c("Between us \u2014 who shouldn\u2019t I turn my back on?", "Watch the ones who are too composed. Grief has manners. Guilt has a practised face.", "thoughtful"),
        challenge: c("Who are you protecting?", "The powerless, not the guilty. Learn the difference before you accuse me.", "angry")
      }
    )
  ],
  surgeon: [
    r(
      "surgeon-antiseptic",
      "room",
      "antiseptic",
      "You keep washing your hands. What are you trying to get off them?",
      "Nothing sinister. The conservatory shears nicked my thumb and I dressed it with carbolic from my case. The smell lingers, I know.",
      "neutral",
      s(
        c("Where did you dress it?", "In the library. The stopper slipped and soaked my cuff before I wiped the bottle.", "worried"),
        c("Was the cut serious?", "Shallow. Your interest in it is misplaced.", "angry"),
        c("You\u2019ve scrubbed your hands raw. What else came off?", "I don\u2019t diagnose strangers, and I don\u2019t explain myself to them either.", "neutral")
      ),
      s(
        c("Could that carbolic be plant treatment instead?", "Possibly. I can\u2019t tell the two apart from here.", "suspicious"),
        c("Was one nicked thumb worth all that carbolic?", "A surgeon dresses even a scratch properly. Habit outlives the practice.", "neutral"),
        c("Then your hands tell me nothing.", "On that, we agree.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the carbolic on his cuff to the library dressing.",
        bargain: c("Tell me what you cleaned \u2014 I won\u2019t make a scene of it.", "Decent of you. I bound the cut in the library; the carbolic caught my cuff there, no more.", "thoughtful"),
        challenge: c("That smell is stronger than one dressed thumb. What else took carbolic?", "A man who dresses a cut smells of carbolic. Nothing in that undoes me.", "angry")
      }
    ),
    r(
      "surgeon-oil",
      "social",
      "blade-oil",
      "Why are your fingertips slick with fine oil?",
      "A hinge on my instrument case stuck when I opened it for a bandage. One drop of oil freed it, and it marked my hand.",
      "suspicious",
      s(
        c("How did you free the hinge?", "One drop of light oil and a probe. Forcing precision tools is barbaric.", "thoughtful"),
        c("What\u2019s inside the case?", "Retired instruments. Their inventory is private and irrelevant.", "angry"),
        c("Open the case. Show me what\u2019s inside.", "It\u2019s already done. Let the subject drop with it.", "neutral")
      ),
      s(
        c("Did the oil stay on the hinge?", "No. It ran onto my finger and marked my sleeve before I noticed.", "worried"),
        c("Could it have come from a clock?", "The weight of it might match. I serviced no clocks.", "suspicious"),
        c("The mechanism doesn\u2019t matter.", "Then there\u2019s no reason to continue.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the oil from his vial to the hinge and sleeve.",
        bargain: c("Account for the case and I\u2019ll leave you alone.", "Fair. The vial\u2019s down one drop \u2014 my hand, my hinge, my sleeve.", "thoughtful"),
        challenge: c("Only your hand touched that oil tonight. Prove it stayed on the case.", "Confirm it. A man oiling his own case gets oil on himself. Hardly damning.", "angry")
      }
    ),
    r(
      "surgeon-wax",
      "timeline",
      "wax-resin",
      "Where did that brittle amber fleck on your lapel come from?",
      "I sealed a private medical letter with an amber stick; a fleck of the wax caught my lapel as it cooled. Retirement doesn\u2019t stop people asking for an opinion.",
      "thoughtful",
      s(
        c("Who was the letter for?", "Confidentiality survives a dinner invitation \u2014 the recipient keeps their own half of the seal.", "angry"),
        c("Do people still seal letters by hand?", "The careful ones do. A licked flap protects nothing worth protecting.", "neutral"),
        c("Confidentiality won\u2019t cover you tonight.", "It will. That closes the matter.", "neutral")
      ),
      s(
        c("Could that amber be restoration resin instead?", "It might look it. A test would settle that, not guesswork.", "suspicious"),
        c("Did any more of that wax leave your desk?", "Only the fleck on my lapel. I brushed at it and missed.", "worried"),
        c("I don\u2019t need an analysis.", "A rare bit of restraint. We\u2019re finished.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Compare the amber on his lapel to the other half of the seal.",
        bargain: c("Name who received the letter \u2014 I keep it off the record.", "You keep confidences well. The amber on my lapel is twin to their half.", "thoughtful"),
        challenge: c("You sealed something tonight you won\u2019t name. What was it?", "So I sealed a letter. Amber on a lapel proves a careful hand, not a crime.", "angry")
      }
    ),
    r(
      "surgeon-observation",
      "intel",
      void 0,
      "What have you noticed about the other guests?",
      "Restless hands. Shallow breathing. Nerves, mostly \u2014 but nerves have a lot of causes.",
      "thoughtful",
      s(
        c("Who changed the most suddenly?", "One guest went very still after voices rose in the corridor.", "suspicious"),
        c("Nerves from what?", "I can see the signs. I can\u2019t name the cause from across a room.", "angry"),
        c("Who do you suspect?", "Then this conversation\u2019s over.", "neutral")
      ),
      s(
        c("What did you see, exactly?", "The row ended, a door opened, and that guest\u2019s hands started shaking at once.", "thoughtful"),
        c("Could it just have been the storm?", "Possibly. But the shaking came first.", "suspicious"),
        c("That\u2019s enough.", "Agreed. Any more would be guessing.", "neutral")
      ),
      {
        bargain: c("Between us \u2014 who worried you most?", "The still one. Stillness after a scare is rarely calm.", "thoughtful"),
        challenge: c("You saw who flinched. Name them.", "I\u2019ll give you what I saw, not a name. Draw your own conclusion.", "angry")
      }
    ),
    r(
      "surgeon-ink",
      "timeline",
      "ink-fiber",
      "Why are your fingers marked with blue-black ink?",
      "I was writing up a private note. A steady hand still uses a fountain pen \u2014 the ink comes with it.",
      "neutral",
      s(
        c("When exactly were you writing?", "Just before the corridor got loud. I noted the hour, as I always do.", "thoughtful"),
        c("What note needs ink at a party?", "A clinical opinion. Retirement hasn\u2019t stopped people asking.", "neutral"),
        c("That\u2019s a lot of ink for a short note.", "The nib split. That\u2019s all of it. I won\u2019t say more.", "angry")
      ),
      s(
        c("Where else did that ink reach?", "My finger and cuff both, the moment I set the pen down.", "worried"),
        c("Could another writer share that ink?", "Any number could. Ink isn\u2019t a diagnosis.", "suspicious"),
        c("That\u2019s enough about the ink.", "On that we agree.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin his dated page to when the corridor got loud.",
        bargain: c("Give me the hour \u2014 keep the patient unnamed.", "Acceptable. The page carries the time I wrote it; ink and clock agree, and no name need leave my lips.", "thoughtful"),
        challenge: c("You timed that page to cover a minute you can\u2019t account for.", "So I recorded something precisely. Precision is my habit, not my guilt.", "angry")
      }
    ),
    r(
      "surgeon-earth",
      "room",
      "fine-earth",
      "What is that pale grit on your cuff?",
      "A dusting powder from my case \u2014 bismuth, near enough. It spilled when I steadied the lid.",
      "neutral",
      s(
        c("What\u2019s the powder for?", "Settling a stomach. Harmless, chalk-fine, easily mistaken for ordinary dust.", "thoughtful"),
        c("Why open a medical case at dinner?", "Because someone always feels faint before the soup. I came prepared.", "neutral"),
        c("That doesn\u2019t look like powder from a case. Where did you kneel?", "Your guess is ahead of your evidence. I won\u2019t follow it.", "angry")
      ),
      s(
        c("Where did the spilled powder land?", "My cuff and glove. Under a lens the grains are far too even for garden soil.", "thoughtful"),
        c("Could it match the conservatory grit?", "On the surface. A look under magnification would part them at once.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then let\u2019s not magnify it.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare the grit on his cuff to the powder in his case.",
        bargain: c("Show me the case and I won\u2019t chase the flowerbeds.", "Reasonable. Set my cuff beside the tin \u2014 the grain matches the powder, not the flowerbeds.", "thoughtful"),
        challenge: c("That grit came from the conservatory. You\u2019re lying about the powder.", "Then examine it properly. My powder is even; garden grit isn\u2019t. The lens will correct you.", "angry")
      }
    ),
    r(
      "surgeon-wool",
      "social",
      "black-wool",
      "Where did that black wool thread on your sleeve come from?",
      "My travelling coat. Good wool, old cut. It\u2019s caught on furniture in better houses than this.",
      "neutral",
      s(
        c("What did the coat catch on tonight?", "A rough edge on the library shelving, about where a reaching arm would meet it.", "thoughtful"),
        c("Why wear a heavy coat indoors?", "The house is cold and my circulation isn\u2019t what it was. Dull, but true.", "neutral"),
        c("That thread\u2019s coarser than your coat.", "You haven\u2019t examined my coat, so you can\u2019t say that. I won\u2019t indulge the guess.", "angry")
      ),
      s(
        c("Where did the thread pull loose from?", "The left cuff, where the weave\u2019s frayed for years. That\u2019s the only weak point.", "worried"),
        c("Could the thread be from another dark coat?", "It could. Which is exactly why it names no one on its own.", "suspicious"),
        c("The thread isn\u2019t enough.", "A rare and welcome conclusion.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Compare his frayed cuff to the coarser thread.",
        bargain: c("Let me check the coat against the thread \u2014 quietly.", "Sensible. Lay the strand against my cuff; if the weave differs, it isn\u2019t mine.", "thoughtful"),
        challenge: c("That thread ties you to a place you deny. Own it.", "Then compare the weaves first. A shared colour isn\u2019t a shared coat.", "angry")
      }
    ),
    r(
      "surgeon-polish",
      "room",
      "metal-polish",
      "Why is there polish residue on your fingertips?",
      "I picked up a steel instrument to check its edge and found someone had waxed it like a trophy.",
      "suspicious",
      s(
        c("Which instrument had been polished?", "A blade from the case by the sideboard. Freshly buffed \u2014 an amateur\u2019s idea of care.", "thoughtful"),
        c("Why handle blades at a dinner party?", "Old reflex. I can\u2019t leave a badly kept edge alone.", "neutral"),
        c("What else did you handle?", "I won\u2019t inventory my own hands for you. That\u2019s enough.", "angry")
      ),
      s(
        c("Where did the polish transfer?", "From the handle to my thumb, then to the cloth I wiped it on. A clear little chain.", "worried"),
        c("Could that residue be from the silver?", "The compound\u2019s much the same. Only its history tells you which object it\u2019s from.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then we can set it down.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the polish from the blade to his thumb and cloth.",
        bargain: c("Tell me what you handled and I leave the silver alone.", "Fair. Handle to thumb, thumb to cloth \u2014 one blade, one chain, nothing past it.", "thoughtful"),
        challenge: c("That polish came off the dining silver. You handled more than a blade.", "Then follow it from the blade I named, not the plate. It doesn\u2019t reach where you hope.", "angry")
      }
    ),
    r(
      "surgeon-perfume",
      "social",
      "floral-perfume",
      "Why does an expensive perfume cling to your lapel?",
      "A woman felt faint and I steadied her. Her scent stayed on my coat longer than my sympathy did.",
      "neutral",
      s(
        c("Who was it you steadied?", "A guest near the drawing room. I took her weight on my shoulder for a moment, no more.", "thoughtful"),
        c("Do you make a habit of catching fainting women?", "I make a habit of not letting people fall. Forty years is hard to unlearn.", "neutral"),
        c("That scent looks worn, not brushed on.", "Your nose is wrong, and I\u2019m not obliged to correct it.", "angry")
      ),
      s(
        c("Where did her perfume settle?", "My lapel and sleeve, where she leaned. She can tell you so herself.", "thoughtful"),
        c("Couldn\u2019t you just be wearing it yourself?", "A retired surgeon in gardenia? Ask anyone who knows me.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then let it evaporate out of your inquiry.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the woman he steadied.",
        bargain: c("Name her and I keep it quiet.", "Decent. The woman I steadied will confirm it \u2014 her scent came to my lapel, not from me.", "thoughtful"),
        challenge: c("That perfume puts you alone with someone. Who?", "Close enough to keep her upright. Ask her. Proximity isn\u2019t proof.", "angry")
      }
    ),
    r(
      "surgeon-powder",
      "timeline",
      "face-powder",
      "How did ivory face powder get onto your cuff?",
      "When the woman I steadied swayed, her compact sprang open and dusted us both.",
      "surprised",
      s(
        c("What happened to the compact?", "It flew from her hand. I caught her first and the powder second, all over my cuff.", "thoughtful"),
        c("Why should I believe it was hers?", "Because I\u2019ve no use for ivory powder, and she plainly did.", "neutral"),
        c("That powder looks deliberate.", "You\u2019re building a scandal out of a spilled compact. I won\u2019t help.", "angry")
      ),
      s(
        c("Show me how the compact sprang open?", "She tipped, her hand opened, the lid snapped back, and the puff burst against my sleeve.", "worried"),
        c("Could the powder be your own?", "Only in a very different life. My case holds instruments, not cosmetics.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then we needn\u2019t dust it further.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him show how the compact spilled.",
        bargain: c("Show me how it fell \u2014 I\u2019ll leave her name out.", "Gladly. She tips here, I catch there, the compact bursts \u2014 the powder does the rest.", "thoughtful"),
        challenge: c("That powder didn\u2019t get there by accident. You pressed it on.", "Then let me show you how it spilled. The sequence blames the clasp, not the surgeon.", "angry")
      }
    ),
    r(
      "surgeon-note",
      "suspicion",
      "torn-note",
      "You keep filling a page with cramped shorthand. What is it?",
      "Clinical notes. My own shorthand \u2014 times, symptoms, a dose. I tore off the used strip out of habit.",
      "thoughtful",
      s(
        c("What did the notes record?", "Observations on a guest who looked unwell. I write things down before memory tidies them.", "suspicious"),
        c("Can anyone else read your shorthand?", "A trained eye, maybe. To most people it\u2019s a hedge of scratches.", "neutral"),
        c("Those don\u2019t look like medical notes. Hand them over.", "A clinician\u2019s notes are confidential. That\u2019s the end of it.", "angry")
      ),
      s(
        c("What happened to the torn strip?", "It left my folio when I stood. I assumed it went in a bin, but perhaps not.", "worried"),
        c("Could the marks pass for something else?", "To an untrained reader, they could read as anything.", "thoughtful"),
        c("I\u2019ll ask the guest directly.", "Do. They remember the evening less clearly than my notes.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Misread one symbol and let him correct you.",
        bargain: c("Read me the note plainly \u2014 patient stays unnamed.", "Very well \u2014 but you have the dose wrong. Read it correctly and it\u2019s only a chart.", "thoughtful"),
        challenge: c("This note reads like something you don\u2019t want me to understand.", "You\u2019ve misread the symbol. Correct it and the \u201Cadmission\u201D becomes a dosage.", "angry")
      }
    ),
    r(
      "surgeon-retirement",
      "connection",
      void 0,
      "Why did you retire, if you still love the work?",
      "Because practising too long starts to cost more than it heals. I stopped before that happened.",
      "thoughtful",
      s(
        c("What wore you down?", "The hours, and one mistake I couldn\u2019t undo. A tired hand is dangerous.", "worried"),
        c("Do you miss it?", "Every day. You don\u2019t stop being a surgeon. You just stop being allowed.", "neutral"),
        c("I have other questions.", "Few people ask until they need one of us.", "neutral")
      ),
      s(
        c("What still matters to you?", "An honest record. I\u2019ve signed enough that weren\u2019t.", "worried"),
        c("What do you regret?", "That I learned discretion before courage. The order matters.", "thoughtful"),
        c("We\u2019re finished here.", "As you wish.", "neutral")
      ),
      {
        bargain: c("Between us \u2014 what keeps you awake?", "A note I revised once, years ago. I\u2019ve wanted to write one true line ever since.", "worried"),
        challenge: c("What are you hiding?", "A mistake, not a motive. Every man conceals something.", "angry")
      }
    ),
    r(
      "surgeon-diagnosis",
      "social",
      void 0,
      "Looking at this room \u2014 what do you see?",
      "Most of them are sicker with nerves than with anything I could treat. Fear has a look.",
      "thoughtful",
      s(
        c("Who worries you most?", "One guest holds a stillness that clearly costs effort. That kind of calm is worth watching.", "suspicious"),
        c("Do you see everyone as a patient?", "I notice things. Habit. I\u2019m not treating anyone tonight.", "neutral"),
        c("I need something useful, not impressions.", "Then you\u2019ll find me tedious. So be it.", "neutral")
      ),
      s(
        c("What would you trust as a real sign?", "A tremor that comes before the thunder, not after. Nerves confess before the mouth does.", "thoughtful"),
        c("Could you be reading too much into it?", "Certainly. I said a look, not a diagnosis.", "suspicious"),
        c("That\u2019s enough.", "Agreed. Any more would be guessing.", "neutral")
      ),
      {
        bargain: c("Plainly \u2014 who worries you, and why?", "The one who doesn\u2019t flinch. Practised calm is a warning of its own.", "thoughtful"),
        challenge: c("What are you watching for?", "The sign I missed once before. I won\u2019t condemn anyone on a look.", "angry")
      }
    )
  ],
  curator: [
    r(
      "curator-antiseptic",
      "room",
      "antiseptic",
      "Why does a sharp, medicinal smell cling to your sleeve?",
      "An orchid was going rotten, so I treated it with a sulphur wash. The smell soaked into my sleeve.",
      "worried",
      s(
        c("What did you treat it with?", "A sharp sulphur wash, watered down. You can\u2019t mask that smell.", "thoughtful"),
        c("Was the orchid valuable?", "It\u2019s alive. That\u2019s value enough. Price is a poor way to judge a plant.", "neutral"),
        c("What did that wash really clean?", "Nothing but a plant. This can rest there.", "neutral")
      ),
      s(
        c("How did the wash get on your cuff?", "The nozzle spat back at me. A sharp streak dried across my sleeve.", "worried"),
        c("Could it be ordinary perfume?", "Only if someone has very strange taste in perfume.", "surprised"),
        c("That\u2019s enough about the wash.", "Then let\u2019s stop disturbing the roots.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the wash is plant sulphur, not medicine.",
        bargain: c("Tell me what you sprayed \u2014 I won\u2019t call it medicine.", "Gently, then. The sprayer kicked back; that sulphur streak is its doing, not medicine.", "thoughtful"),
        challenge: c("That\u2019s a doctor\u2019s bottle on a gardener. What did you really treat?", "You\u2019ve done your reading. It\u2019s plant wash, yes \u2014 because I treat plants.", "angry")
      }
    ),
    r(
      "curator-earth",
      "timeline",
      "fine-earth",
      "Where did that pale grit on your hem come from?",
      "I repotted a cramped night jasmine \u2014 its roots couldn\u2019t wait for dinner to end. The pale mix got all over my hem.",
      "neutral",
      s(
        c("What soil did you use?", "A pale mineral mix, finer than garden earth and dry as chalk.", "thoughtful"),
        c("Why should I care about a flowerpot?", "You needn\u2019t. The jasmine doesn\u2019t care about you either.", "neutral"),
        c("Repotting at this hour? I don\u2019t believe it.", "Believe what you like. We\u2019re done digging here.", "neutral")
      ),
      s(
        c("Where did the pale mix end up?", "On my shoes and hem. I tracked the grit out before I noticed.", "worried"),
        c("Could old plaster look the same?", "To an impatient eye, yes. The texture would tell them apart.", "thoughtful"),
        c("Enough gardening.", "Then this bed\u2019s exhausted.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Follow the grit from her hem toward the study vent.",
        bargain: c("Show me the trail and I won\u2019t accuse the plants.", "If you must. Someone swapped a root ball; the grit runs from the gallery rug toward the study vent.", "thoughtful"),
        challenge: c("That grit didn\u2019t come from a flowerpot alone. You\u2019re covering a path.", "So mineral mix travels on a hem. Follow it \u2014 it leads to a searched pot, not to me.", "angry")
      }
    ),
    r(
      "curator-note",
      "social",
      "torn-note",
      "You keep jotting shorthand tonight. What are you recording?",
      "Growing records \u2014 dates, cuttings, a time or two \u2014 in my own shorthand. I tore the margin off one to label a pot.",
      "thoughtful",
      s(
        c("What did you write down tonight?", "A time, a slammed door, and some initials, in my own shorthand.", "suspicious"),
        c("Do plants need initials?", "People do. Plants are usually more honest.", "neutral"),
        c("Those aren\u2019t garden notes. Hand them over.", "I will. We can prune this subject.", "neutral")
      ),
      s(
        c("What happened to that torn margin?", "I tore it off to label a pot. Later the scrap was gone.", "worried"),
        c("Could anyone read your shorthand?", "Another grower might. To others it looks like nervous scratches.", "thoughtful"),
        c("I\u2019ll inspect the greenhouse myself.", "Mind the roots. We\u2019re done here.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Match the time in her shorthand to the cable copy.",
        bargain: c("Read me the shorthand \u2014 I leave the names alone.", "Kindly meant. Read plainly, it gives a date, some initials, and 12:10.", "thoughtful"),
        challenge: c("Those aren\u2019t garden notes. You\u2019re hiding a meeting.", "So a growing record keeps a time. That\u2019s a payment noted down, not a plot.", "angry")
      }
    ),
    r(
      "curator-growth",
      "intel",
      void 0,
      "Has anything in the house seemed out of place?",
      "A door that kept opening when the air was still. People used it more than they\u2019ll admit.",
      "thoughtful",
      s(
        c("Who used it?", "Someone waited for the corridor to empty, then crossed without a glance at the plants.", "suspicious"),
        c("Maybe they just don\u2019t like plants?", "Plenty don\u2019t. That alone proves very little.", "neutral"),
        c("Just tell me who it was.", "As you wish. I don\u2019t have a name for you.", "neutral")
      ),
      s(
        c("What did you notice about them?", "A wet sole squeaked twice, right after the hall clock chimed.", "thoughtful"),
        c("Could it have been a servant?", "The stride was wrong. Though I can\u2019t give you a name.", "suspicious"),
        c("Nothing more on this.", "Then we\u2019re done.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who moved when they thought no one was looking?", "One figure crossed on a wet sole just as the clock chimed. That\u2019s all I can swear to.", "thoughtful"),
        challenge: c("You saw them cross. Why won\u2019t you name them?", "I don\u2019t have a name. The stride was wrong for a servant \u2014 that\u2019s all.", "angry")
      }
    ),
    r(
      "curator-ink",
      "timeline",
      "ink-fiber",
      "How did blue-black ink get on your fingers?",
      "I ink my plant labels by hand. A written label outlasts a pencil, and a garden forgets everything else.",
      "neutral",
      s(
        c("When were you writing labels tonight?", "Just before the corridor stirred. I mark the hour on each cutting, so the time\u2019s in my hand too.", "thoughtful"),
        c("Why label plants during a party?", "A cutting doesn\u2019t wait for the guests to leave.", "neutral"),
        c("That\u2019s more ink than labels need.", "The nib caught the card and flooded. That\u2019s all. I\u2019ll say no more.", "angry")
      ),
      s(
        c("Where else did that ink reach?", "Across my finger and the label\u2019s edge, at the hour I\u2019d just written.", "worried"),
        c("Could another hand share that ink?", "Many could. Ink keeps no loyalty to a gardener.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then let it dry, unremarked.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin her dated label to when the corridor stirred.",
        bargain: c("Give me the hour on the label \u2014 I won\u2019t ask for more.", "Gently, then. The label carries the time I wrote it; ink and hour agree, and neither condemns me.", "thoughtful"),
        challenge: c("That\u2019s too much ink for plant labels. What were you really dating?", "So a cutting is time-stamped. Careful record-keeping isn\u2019t a crime.", "angry")
      }
    ),
    r(
      "curator-wool",
      "social",
      "black-wool",
      "Where did that frayed black wool come from?",
      "My work wrap \u2014 dark, coarse, older than most of my ferns. It snags on anything with a splinter.",
      "neutral",
      s(
        c("What did the wrap catch on tonight?", "An old cabinet by the passage. There\u2019s a raised nail that took a thread as I passed.", "thoughtful"),
        c("Why wear something so rough to a party?", "Because a curator\u2019s always a moment from lifting a heavy pot. Silk\u2019s no help for that.", "neutral"),
        c("That wrap took you somewhere you won\u2019t name.", "A snagged thread is a poor map. I won\u2019t follow it for you.", "angry")
      ),
      s(
        c("Where did the thread travel after?", "From the cabinet nail to my shoulder to the pot I carried past it. A plain trail.", "worried"),
        c("Could the thread be someone else\u2019s coat?", "It could. Coarse black wool is common enough to accuse half the house.", "suspicious"),
        c("The thread isn\u2019t enough.", "Then let it lie where it fell.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the cabinet nail to her wrap.",
        bargain: c("Show me where the wrap snagged and I keep it quiet.", "If you must. Nail to shoulder to pot \u2014 the whole quiet trip, nothing sinister on it.", "thoughtful"),
        challenge: c("That thread puts you at more than a cabinet. Where else did you go?", "So my wrap brushed something in passing. That\u2019s not a plot.", "angry")
      }
    ),
    r(
      "curator-polish",
      "room",
      "metal-polish",
      "Why is there metal polish on your hands?",
      "I keep the brass sprayers and name-plates bright. Tarnish looks like neglect, and neglect frightens the patrons.",
      "neutral",
      s(
        c("Which fittings did you polish?", "The name-plates on the rarer plants, and the long brass sprayer I use each evening.", "thoughtful"),
        c("Why does shiny brass matter to a plant?", "It doesn\u2019t. It matters to the patrons who pay for the plant.", "neutral"),
        c("What else did you polish?", "I don\u2019t keep a record of my own fingerprints. That\u2019s enough.", "angry")
      ),
      s(
        c("Where did the polish transfer?", "Only to the parts a hand grips \u2014 the sprayer\u2019s neck, the plate\u2019s edge.", "worried"),
        c("Could that smear come from the silver?", "The compound\u2019s much alike. Its history, not its shine, tells you which.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then we can let it dull.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell her she polished the plate\u2019s face \u2014 see if she corrects you.",
        bargain: c("Help me quietly and the patrons stay unnamed.", "Kindly. I brightened only the grips, never the faces \u2014 whoever handled the silver was less careful than I.", "thoughtful"),
        challenge: c("That polish came off the dining silver, not your brass.", "I polished brass. If the smear troubles you, follow it to the sprayers, not the plate.", "angry")
      }
    ),
    r(
      "curator-perfume",
      "social",
      "floral-perfume",
      "That heavy perfume \u2014 surely a gardener\u2019s vanity?",
      "A gardener smells of soil and sap, not a bottled garden. That perfume is someone else\u2019s, caught on me.",
      "suspicious",
      s(
        c("Then how did it get on you?", "A guest hugged me by the conservatory door and left half her bottle on my collar.", "thoughtful"),
        c("You really wear no scent at all?", "Only what the plants lend me. Bottled gardenia insults the real thing.", "neutral"),
        c("That scent looks worn, not borrowed.", "Insist all you like. I know my flowers from her chemist\u2019s.", "angry")
      ),
      s(
        c("Where did the perfume transfer?", "My collar and shoulder, where she leaned. My hands still smell of soil under it.", "worried"),
        c("Could you have just brushed the blooms?", "My blooms don\u2019t smell that loud. This is a bottled scent, and not mine.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then stop breathing it in for me.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Compare the bottled scent to the soil on her hands.",
        bargain: c("Name who hugged you \u2014 I won\u2019t print it.", "Gently. Smell my hands \u2014 soil, not gardenia. The perfume came off her, not out of any bottle of mine.", "thoughtful"),
        challenge: c("That perfume puts you somewhere you deny. Own the meeting.", "Compare the scents. Mine\u2019s green and low; hers is loud and bottled. Not the same.", "angry")
      }
    ),
    r(
      "curator-powder",
      "room",
      "face-powder",
      "How did ivory powder get onto your shoulder?",
      "Someone squeezed past me in a narrow doorway and left half her compact on my sleeve.",
      "neutral",
      s(
        c("Who pressed past you?", "A woman in a hurry toward the hall. I felt her more than saw her face.", "thoughtful"),
        c("Isn\u2019t that just your own powder?", "I dust plants with sulphur, not my face with ivory. It\u2019s not mine.", "neutral"),
        c("That powder looks applied, not brushed.", "You can build a fantasy out of a smudge. I won\u2019t help.", "angry")
      ),
      s(
        c("Where did the powder settle?", "My shoulder and upper sleeve \u2014 right where a passing arm would meet me.", "worried"),
        c("Could several women wear that shade?", "Several might. Only one wears it thick enough to shed it on strangers.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then let it settle out of your inquiry.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the powder on her shoulder to the compact.",
        bargain: c("Help me find whose compact it is \u2014 quietly.", "Kindly meant. Match the shade to her compact, not my face \u2014 mine has never held ivory.", "thoughtful"),
        challenge: c("That powder puts you near someone you won\u2019t name. Who?", "Near a careless shoulder in a doorway. Compare the shade; it\u2019s hers, not mine.", "angry")
      }
    ),
    r(
      "curator-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine oil?",
      "The conservatory vent seized in the damp. One drop of oil on the ratchet and it opened again.",
      "neutral",
      s(
        c("What exactly did you oil?", "The vent\u2019s winding gear, and my shears while the tin was open. Both had gone stiff.", "thoughtful"),
        c("Why fuss with a vent tonight?", "A closed vent in this wet would rot my orchids by morning. It couldn\u2019t wait.", "neutral"),
        c("That oil went somewhere it shouldn\u2019t.", "You suppose a lot from a slick thumb. I won\u2019t indulge it.", "angry")
      ),
      s(
        c("Where did the oil end up?", "On my thumb and cuff when the ratchet sprang back. It marks whatever I touch after.", "worried"),
        c("Could that oil come from a clock or a lock?", "The same light oil serves them all. Only its use tells you which.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then let the matter rust.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have her free the vent again and show where the oil went.",
        bargain: c("Show me how you freed the vent and I leave the oil alone.", "Gladly. I turn the gear here, the ratchet springs there, and the oil catches my thumb. No mystery.", "thoughtful"),
        challenge: c("That oil touched more than a garden vent. What else did you free?", "A garden vent. Watch me free it; the oil lands exactly where honest work would put it.", "angry")
      }
    ),
    r(
      "curator-wax",
      "social",
      "wax-resin",
      "What\u2019s that amber fleck on your sleeve?",
      "Grafting wax. I seal the join where two cuttings meet, so the graft doesn\u2019t weep sap and fail.",
      "thoughtful",
      s(
        c("What were you grafting tonight?", "A rose stock onto hardier root. The wax goes on warm, and warm wax flicks where it likes.", "suspicious"),
        c("Is grafting really a job for a party?", "A graft takes when it takes, not when the invitations allow.", "neutral"),
        c("That\u2019s sealing wax, not garden wax.", "You mistake my work for a clerk\u2019s. I won\u2019t argue over a guess.", "neutral")
      ),
      s(
        c("How did the wax reach your sleeve?", "It snapped off the warming stick and caught my cuff. The under-gardener held the graft; ask him.", "worried"),
        c("Could that fleck be an antique dealer\u2019s resin?", "Similar to look at. A grower could tell my grafting wax from his relic-resin at a glance.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then let the graft heal in peace.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Check the wax against the graft she sealed.",
        bargain: c("Show me the graft and I won\u2019t call it sealing wax.", "Kindly. The sealed cutting\u2019s right there; its wax is twin to my sleeve, and both are honest garden work.", "thoughtful"),
        challenge: c("That wax came from something you sealed and hid. What?", "To a rose graft. Look at the cutting \u2014 the wax matches it, not any hidden thing.", "angry")
      }
    ),
    r(
      "curator-calling",
      "connection",
      void 0,
      "Why spend a life among plants?",
      "They ask nothing and forgive everything, if you\u2019re patient. People rarely manage either.",
      "thoughtful",
      s(
        c("How did you get started?", "One sick fern I refused to give up on. It lived. I\u2019ve been outnumbered by green things ever since.", "thoughtful"),
        c("Do you prefer plants to people?", "Plants don\u2019t lie about where they\u2019ve been. That recommends them.", "neutral"),
        c("I have other questions.", "Few people ask until something they love starts to wilt.", "neutral")
      ),
      s(
        c("What would you protect?", "The living collection. Some of those plants exist nowhere else.", "worried"),
        c("What would you never do?", "Trade a living thing for my own comfort. I\u2019ve been asked. I refused.", "suspicious"),
        c("We\u2019re finished here.", "Mind the roots on your way out.", "neutral")
      ),
      {
        bargain: c("What are you afraid of tonight?", "That someone lets the rarest plants wither to make a point. That would be the real crime.", "worried"),
        challenge: c("What is all this care covering?", "Not guilt. Looking after plants isn\u2019t the same as hiding something.", "angry")
      }
    ),
    r(
      "curator-company",
      "intel",
      void 0,
      "What do you make of the other guests?",
      "They crowd toward whoever shines brightest. It tells you who needs watching.",
      "thoughtful",
      s(
        c("Who needs watching?", "One turns away from attention instead of toward it. That usually means secrets.", "suspicious"),
        c("Anyone in particular?", "I notice habits. I don\u2019t always get names.", "neutral"),
        c("I need a name, not impressions.", "Names I don\u2019t have. Impressions I have plenty of.", "neutral")
      ),
      s(
        c("Who do you like here?", "The surgeon. He listens slowly \u2014 to the quiet parts.", "thoughtful"),
        c("Who bothers you?", "The one who admired my rarest plant and only asked what it would fetch.", "suspicious"),
        c("That\u2019s enough.", "Then we can stop.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 who worries you most?", "The one who priced my orchid instead of seeing it. People who only see price frighten me.", "thoughtful"),
        challenge: c("Who are you protecting?", "Living things, not the guilty. Don\u2019t confuse the two.", "angry")
      }
    )
  ]
};

// src/game/dialogue/packB.ts
var PACK_B = {
  magician: [
    r(
      "magician-wool",
      "room",
      "black-wool",
      "Where did that black wool thread on your sleeve come from?",
      "My coat \u2014 black stage wool, old and much-abused. It caught on something tonight and gave up a thread or two.",
      "neutral",
      s(
        c("What did it catch on?", "A brass tooth in the west passage. The hidden pocket snagged and the weave started to give.", "worried"),
        c("What do you carry in a coat like that?", "A magician\u2019s pocket holds disappointment and a contract or two.", "suspicious"),
        c("What did that snag really cost you?", "A thread and a good exit. We\u2019ll leave the coat closed.", "neutral")
      ),
      s(
        c("Where exactly did the thread pull free?", "As I stepped clear, a short dark strand stayed hooked on the tooth behind me.", "thoughtful"),
        c("Could another black coat leave that thread?", "Certainly. Black wool is far less exclusive than my billing.", "neutral"),
        c("The coat alone isn\u2019t enough.", "No \u2014 and that\u2019s where we\u2019ll stop.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the latch to his coat seam.",
        bargain: c("Tell me what you reached for \u2014 I\u2019ll keep the name out of it.", "Between us: a paper that ought to bear another man\u2019s name. The coat caught as I reached for it.", "worried"),
        challenge: c("You tore that coat doing something you won\u2019t admit.", "You have me at a door, not at any crime. I went for a contract, not for a soul.", "angry")
      }
    ),
    r(
      "magician-powder",
      "social",
      "face-powder",
      "Where did that pale powder on your hands come from?",
      "Stage powder. A pale face floats beautifully once the room goes dark \u2014 I dust it on for the effect, and my compact chose tonight to crack.",
      "surprised",
      s(
        c("How did you prepare the effect?", "Ivory stage powder, a puff, and a compact that spilled more than it should have.", "thoughtful"),
        c("Did anyone watch you set it up?", "Rehearsals are private. Nobody watches the seams being sewn.", "angry"),
        c("Why is your powder somewhere you say you weren\u2019t?", "Now that\u2019s the real question. And that\u2019s where I stop.", "neutral")
      ),
      s(
        c("Where did the spilled powder settle?", "My lapel, a lamp I\u2019d hidden, and the little case I palm cards from.", "worried"),
        c("Couldn\u2019t that be ordinary face powder?", "The powder could pass. The skill behind it couldn\u2019t.", "neutral"),
        c("A cracked compact is hardly proof.", "Then the mirror goes dark, and so does this.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the powder on the switch to his cracked compact.",
        bargain: c("Show me the effect and I leave your method out of it.", "Watch the lamp, not my hands \u2014 that\u2019s exactly where the powder gives the method away.", "thoughtful"),
        challenge: c("That powder marks more than a stage trick. Where else did it land?", "A lamp, a switch \u2014 stage props, not proof. Ivory dust signs no confession.", "suspicious")
      }
    ),
    r(
      "magician-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine oil?",
      "A prop with a sulky spring \u2014 the Mercy Box, if you want its stage name. One drop of oil along the false back and it behaved.",
      "suspicious",
      s(
        c("How did you free the spring?", "A pin, some patience, and one drop of precision oil along the false back.", "thoughtful"),
        c("What does the Mercy Box actually do?", "It performs mercy. The workings are older than my name on the poster.", "neutral"),
        c("Open the box. Show me what you oiled.", "Not tonight. That subject closes with the lid.", "neutral")
      ),
      s(
        c("Where did the extra oil end up?", "On my thumb, then my cuff, when I reset the mechanism behind my back.", "worried"),
        c("Wouldn\u2019t a sewing machine use that oil?", "And clocks, and adding machines. A crowded little alibi, detective.", "suspicious"),
        c("The oil\u2019s too common to matter.", "A poor audience indeed. We\u2019re finished.", "angry")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him open the false back the same way again.",
        bargain: c("Show me how you freed it and I won\u2019t pry into the contracts.", "Then watch: oil here, the back lifts here. The hands are mine; the invention wasn\u2019t.", "thoughtful"),
        challenge: c("That oil went somewhere it shouldn\u2019t. What are you hiding in there?", "I oiled a spring. What it hides is a matter of contracts, not of guilt.", "angry")
      }
    ),
    r(
      "magician-sightline",
      "intel",
      void 0,
      "What did everyone else miss tonight?",
      "They watched the loud hand. The quiet one opened a side door while every head turned.",
      "suspicious",
      s(
        c("What made them look away?", "A dropped tray. Everyone glanced at the noise.", "thoughtful"),
        c("So someone used the distraction?", "Only the useful accidents get used.", "neutral"),
        c("Who opened the door?", "That\u2019s where I stop.", "neutral")
      ),
      s(
        c("Did you see anything that could identify them?", "A polished ring caught the lamp for a second beside the doorframe.", "surprised"),
        c("Could that just have been glass?", "Glass doesn\u2019t curl its fingers around a handle.", "suspicious"),
        c("That\u2019s too thin to chase.", "Then we\u2019re done.", "neutral")
      )
    ),
    r(
      "magician-ink",
      "timeline",
      "ink-fiber",
      "Why is there blue-black ink on your fingers?",
      "A prediction trick. The volunteer names a word, I write it, and the ink\u2019s meant to vanish. Tonight it sulked.",
      "surprised",
      s(
        c("When did you perform the effect?", "Just as the clock struck. I like to time a reveal to a chime; it steals the applause.", "thoughtful"),
        c("What\u2019s the trick, exactly?", "A magician who explains it is just a man with a wet pen. Watch, don\u2019t audit.", "neutral"),
        c("That\u2019s far too much ink for a card.", "The vanishing part failed and the pen wept. That\u2019s the whole of it.", "neutral")
      ),
      s(
        c("Where did the stubborn ink settle?", "My fingers and the card\u2019s edge, at the exact stroke I performed against.", "worried"),
        c("Could another writer own that ink?", "Half the house scribbles. The ink\u2019s a common prop, not a signed confession.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then the curtain falls on it.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the inked card to the clock stroke he named.",
        bargain: c("Give me the time of the trick \u2014 I\u2019ll leave the flourish alone.", "Generous. The card\u2019s inked to the chime I played to; the hour and the stain agree, nothing more.", "thoughtful"),
        challenge: c("That\u2019s a lot of ink for one card. You timed more than a trick.", "So my timing\u2019s theatrical. A punctual flourish isn\u2019t a plot.", "angry")
      }
    ),
    r(
      "magician-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands smell so sharply of medicine?",
      "Spirit-gum solvent. It lifts a false moustache and reeks like a sickroom, but it\u2019s pure stagecraft.",
      "neutral",
      s(
        c("What were you gumming and un-gumming?", "A quick-change disguise for the second act. The solvent bites worse than the glue.", "thoughtful"),
        c("Why should I believe it isn\u2019t the real thing?", "Because a surgeon\u2019s carbolic and my solvent only share a smell, not a purpose.", "neutral"),
        c("That smell\u2019s a doctor\u2019s, not a conjuror\u2019s.", "You trust your nose over my craft. The trick, and this, are closed.", "neutral")
      ),
      s(
        c("Where did the solvent touch you?", "My fingertips and cuff, where I peeled the disguise. It dries fast and smells loud.", "worried"),
        c("Could it be surgical antiseptic instead?", "Only to a nose in a hurry. Test the fluid and it\u2019ll admit it\u2019s theatre, not medicine.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then stop breathing in my props.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the smell is stage solvent, not carbolic.",
        bargain: c("Let me test the fluid \u2014 I\u2019ll keep the disguise quiet.", "Fair trade. Test it \u2014 spirit gum, not carbolic. The smell\u2019s the only thing they share.", "thoughtful"),
        challenge: c("That smells like a surgeon\u2019s antiseptic. You\u2019re covering a wound.", "Analyse it. My solvent lifts glue; it never touched a wound. A shared reek isn\u2019t a shared crime.", "angry")
      }
    ),
    r(
      "magician-earth",
      "social",
      "fine-earth",
      "What\u2019s that pale grit ground into your palms?",
      "Grip chalk, near enough \u2014 a fine powder I dust on for a clean palm and a cleaner vanish.",
      "neutral",
      s(
        c("What do you use the powder for?", "To keep a coin from betraying me with sweat. A slick palm ruins the best sleight.", "thoughtful"),
        c("Isn\u2019t that just garden dust?", "It\u2019s far finer than any flowerbed, and it\u2019s from my own tin, not your conservatory.", "neutral"),
        c("That grit came off a floor, not a tin.", "You\u2019d rewrite my act into a crawl through the dirt. I decline.", "neutral")
      ),
      s(
        c("Where did the powder end up?", "My palms, my cuffs, and the little case I load coins from. It clings to everything.", "worried"),
        c("Could it match the conservatory grit?", "At a glance, maybe. Side by side, my chalk\u2019s finer and paler than any soil.", "suspicious"),
        c("The grit isn\u2019t helping.", "Then let the dust settle where it likes.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare the powder on his palms to his grip tin.",
        bargain: c("Show me your tin and I won\u2019t chase the conservatory.", "Kindly done. Set my palm beside the tin; the grip chalk matches, the garden grit doesn\u2019t.", "thoughtful"),
        challenge: c("That grit came from the conservatory. Your chalk story won\u2019t hold.", "Compare it properly. My chalk\u2019s even; soil isn\u2019t. The samples will part ways.", "angry")
      }
    ),
    r(
      "magician-polish",
      "room",
      "metal-polish",
      "Why are your hands filmed with metal polish?",
      "The linking rings have to catch the light or the illusion dies. I buff them till they almost wink at the crowd.",
      "thoughtful",
      s(
        c("Which props did you polish?", "The rings and a steel cup or two. A dull prop shows its seams; a bright one keeps my secrets.", "suspicious"),
        c("Do you polish everything you touch?", "Only the things that have to lie convincingly under a lamp.", "neutral"),
        c("What else did you buff tonight?", "A magician doesn\u2019t catalogue his own hands. Let it go.", "neutral")
      ),
      s(
        c("Where did the polish transfer?", "To my fingers and the ring\u2019s inner curve \u2014 right where a grip would sit.", "worried"),
        c("Could that film be from the silver?", "It\u2019s a cousin to it. Only its history tells you which object it left.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then let it lose its shine.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell him he polished the outer face \u2014 see if he corrects you.",
        bargain: c("Help me quietly and I leave the method alone.", "Obliging. I brighten only the inner curve I grip; whoever handled the silver was less tidy than I.", "thoughtful"),
        challenge: c("That polish matches the silver. You handled more than a prop.", "I shine props. Follow the film to my rings, not to a plate I never lifted.", "angry")
      }
    ),
    r(
      "magician-perfume",
      "social",
      "floral-perfume",
      "Why does a lady\u2019s perfume cling to your sleeve?",
      "The vanishing bouquet. I produce flowers, a lady takes them, and her scent stays on me after the blooms are gone.",
      "neutral",
      s(
        c("Who took the bouquet from you?", "A guest near the ballroom who played my volunteer. The whole room watched.", "thoughtful"),
        c("Are the flowers real or an illusion?", "Real enough to smell, false enough to vanish. The perfume, sadly, won\u2019t obey me.", "neutral"),
        c("That scent looks worn, not brushed on.", "You mistake stagecraft for vanity. The act\u2019s over and so is this.", "neutral")
      ),
      s(
        c("Where did the perfume settle?", "My cuff and lapel, where she pressed the bouquet back into my hands. Witnesses aplenty.", "thoughtful"),
        c("Couldn\u2019t you just be wearing the scent?", "A conjuror in gardenia? Ask the room; they saw the lady, not a bottle in my pocket.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then let it fade with the applause.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the guests who watched the bouquet trick.",
        bargain: c("Name the volunteer and I keep it off the record.", "Fair. The volunteer and the room will confirm it \u2014 her scent came to my sleeve in full view.", "thoughtful"),
        challenge: c("That perfume puts you alone with someone. Who was it really?", "To a volunteer, in front of an audience. Ask them. A witnessed trick isn\u2019t a secret meeting.", "angry")
      }
    ),
    r(
      "magician-wax",
      "timeline",
      "wax-resin",
      "Why is there an amber fleck of wax on your cuff?",
      "A sealed prediction. I write the outcome, seal it in wax before witnesses, and open it at the finish. The stick snapped as I pressed it.",
      "thoughtful",
      s(
        c("What did the prediction say?", "That would spoil the ending. The seal matters more than the words \u2014 a broken one ruins the wonder.", "suspicious"),
        c("Do conjurors still use sealing wax?", "The honest ones do. A licked flap can be steamed; hot wax can\u2019t be faked mid-trick.", "neutral"),
        c("That\u2019s no stage prop. Explain the wax.", "A sealed prediction stays sealed until the reveal. The subject seals with it.", "neutral")
      ),
      s(
        c("How did the wax reach your cuff?", "It snapped off the warming stick as I pressed the envelope; a warm fleck flicked to my cuff.", "worried"),
        c("Could that fleck be an antique dealer\u2019s resin?", "To a hasty eye. Mine came off a sealing stick, not a relic.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then let the envelope keep its secret.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him seal another envelope and show how the fleck lands.",
        bargain: c("Show me how you seal it and I leave the prediction unread.", "Watch: I press here, the stick cracks there, the fleck lands on my cuff. No mystery, only method.", "thoughtful"),
        challenge: c("That wax sealed something you won\u2019t show me. What?", "To a prediction envelope. Have me seal another; the wax breaks the same, and proves nothing worse.", "angry")
      }
    ),
    r(
      "magician-note",
      "social",
      "torn-note",
      "What\u2019s that torn scrap of shorthand you keep palming?",
      "A cue card. My own cramped marks \u2014 running order, a gag, the beat to drop a coin. I tore the used corner off between effects.",
      "suspicious",
      s(
        c("What was written on the card?", "The order of the act and a private note or two. Meaningless to anyone who can\u2019t read a conjuror\u2019s hand.", "thoughtful"),
        c("Can anyone else read your marks?", "A fellow performer, perhaps. To the rest it\u2019s a hedge of scribbles.", "neutral"),
        c("That\u2019s no cue card. Hand it over.", "A magician\u2019s notes stay in a magician\u2019s palm.", "neutral")
      ),
      s(
        c("What happened to the torn corner?", "It slipped from my palm mid-flourish. From my hand to my pocket to the floor \u2014 I couldn\u2019t swear which.", "worried"),
        c("Could the marks pass for something sinister?", "To a suspicious reader, anything can. That\u2019s the trouble with reading over a shoulder.", "thoughtful"),
        c("I\u2019ll read it myself.", "Then mind you don\u2019t mistake the running order for a plot.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the torn cue card from his palm to where it fell.",
        bargain: c("Tell me where the card went \u2014 I won\u2019t dig into the running order.", "Fair. Palm to pocket to floor \u2014 the whole clumsy trip, and nothing but a running order on it.", "thoughtful"),
        challenge: c("That scrap puts you somewhere you deny. Own the path.", "A dropped cue card. Follow it from my palm; it leads to a stage, not a scheme.", "angry")
      }
    ),
    r(
      "magician-craft",
      "connection",
      void 0,
      "How did you end up doing this for a living?",
      "I learned young that the truth disappoints and a good trick never does. I chose the kinder one.",
      "thoughtful",
      s(
        c("Who taught you?", "A woman with faster hands than mine. The posters never named her. I owe her more than a flourish.", "worried"),
        c("Is it lonely work?", "A little. The audience loves the trick, never the man working it.", "neutral"),
        c("I have other questions.", "Of course. Everyone skips to the ending.", "neutral")
      ),
      s(
        c("What would you fix if you could?", "A name. Someone\u2019s invention wears my billing, and that\u2019s weighed on me a long time.", "worried"),
        c("What will you never tell?", "How the trick\u2019s done \u2014 and what it cost the person who first dreamed it.", "suspicious"),
        c("We\u2019re finished here.", "Pity.", "neutral")
      ),
      {
        bargain: c("Honestly \u2014 what do you want tonight?", "To hand back a credit I borrowed too long.", "thoughtful"),
        challenge: c("What are you steering me away from?", "The method, not a crime. Guarding secrets is my job \u2014 not my guilt.", "angry")
      }
    ),
    r(
      "magician-audience",
      "intel",
      void 0,
      "Looking at this room \u2014 what do you see?",
      "Everyone here is running an act, and most of them are under-rehearsed. I can see the wires.",
      "suspicious",
      s(
        c("Who\u2019s slipping?", "One guest keeps checking a pocket the way an amateur checks a hidden card.", "thoughtful"),
        c("You think everyone\u2019s performing?", "Everyone in evening dress. Question is who practised their story and who made it up.", "neutral"),
        c("I need a name.", "Then you\u2019ll be a hard house tonight.", "neutral")
      ),
      s(
        c("What would you trust as a real sign?", "The pause before an answer. A prepared lie comes too smoothly.", "thoughtful"),
        c("Could you just be reading nerves?", "Every showman can. I\u2019m offering what I see, not a verdict.", "suspicious"),
        c("That\u2019s enough.", "Then we\u2019re done.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who\u2019s trying too hard to look calm?", "The one whose hands are too still. That stillness is a performance, and a poor one up close.", "thoughtful"),
        challenge: c("Who are you covering for?", "No one. I guard methods, not culprits.", "angry")
      }
    )
  ],
  correspondent: [
    r(
      "correspondent-ink",
      "timeline",
      "ink-fiber",
      "Why is there blue-black ink on your fingers?",
      "Drafting a story \u2014 storm, stranded guests, short tempers. Blue-black ink, and a page I tore straight through when something startled me mid-line.",
      "neutral",
      s(
        c("What startled you?", "The gallery door slammed and my pen went straight through the page.", "suspicious"),
        c("Who\u2019s the story about?", "Everyone. Names wait until the facts show up.", "neutral"),
        c("Show me the draft. What time did you write down?", "Copy\u2019s spiked. Topic\u2019s closed.", "neutral")
      ),
      s(
        c("When exactly did the pen tear it?", "On the slam. I\u2019d just written the hour, and the nib buried in the crease.", "thoughtful"),
        c("Couldn\u2019t another writer use that ink?", "Columnists. Accountants. Anyone with old habits.", "neutral"),
        c("The draft isn\u2019t helping.", "Agreed. No more copy.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the torn page to the gallery door slam.",
        bargain: c("Give me the hour \u2014 keep your source out of it.", "Fair trade. The hour on that page is the one thing I\u2019ll stand behind \u2014 the name stays mine.", "thoughtful"),
        challenge: c("You wrote a time you shouldn\u2019t have known yet. How?", "I wrote what I heard through a door. Hearing a thing isn\u2019t doing it.", "angry")
      }
    ),
    r(
      "correspondent-wool",
      "room",
      "black-wool",
      "Where did that black wool thread on your sleeve come from?",
      "Field habit \u2014 heavy wool, pockets where I expect them. A seam of it caught on something tonight and opened another inch.",
      "neutral",
      s(
        c("What did the seam catch on?", "A brass latch in the west passage \u2014 while I followed a figure whose limp quit the moment it felt unwatched.", "worried"),
        c("Expecting a battlefield in here?", "I expect exits. Battlefields are optional.", "suspicious"),
        c("You didn\u2019t tear that coat sitting still. Where were you?", "No. But I\u2019ll forget you asked.", "neutral")
      ),
      s(
        c("Where exactly did the seam give?", "On the left sleeve, where the latch bit as I passed it.", "thoughtful"),
        c("Couldn\u2019t a driver\u2019s uniform shed the same wool?", "Same colour, similar weave. Test it.", "neutral"),
        c("The coat isn\u2019t helping.", "Then stop pulling the thread.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare his coat seam to the fibre on the latch.",
        bargain: c("Tell me what you saw in that passage \u2014 off the record.", "Off the record: someone crossed that passage faking a limp. My coat paid the toll following them.", "worried"),
        challenge: c("You didn\u2019t tear that coat just watching. What did your hands do?", "The latch marked my sleeve, not my hands. Watching a man isn\u2019t the same as touching him.", "angry")
      }
    ),
    r(
      "correspondent-note",
      "social",
      "torn-note",
      "What\u2019s that torn scrap of shorthand you keep on you?",
      "Notes from a source. Nervous type \u2014 gave me a time, a room, and an envelope, all in tight shorthand.",
      "suspicious",
      s(
        c("What made the source so nervous?", "They heard the exchange and feared their initials would put them in it.", "thoughtful"),
        c("Will you give me the source\u2019s name?", "No. Source protection outlives a dinner invitation.", "angry"),
        c("Protecting a source won\u2019t cover you. Read me the page.", "It stays buried. We\u2019re done.", "neutral")
      ),
      s(
        c("What survives on that shorthand page?", "A time, \u201Cgallery,\u201D an envelope \u2014 and a false limp. The initials I tore away.", "worried"),
        c("Could your marks pass for gossip notes?", "Easily. Meaning depends on who taught the hand.", "neutral"),
        c("I\u2019ll find another witness.", "Do. This source is closed.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Match his shorthand to the singer\u2019s coded reply.",
        bargain: c("Confirm the time and room \u2014 keep the initials out.", "That I can do. The hour and the gallery are solid; the name stays out of your notebook.", "thoughtful"),
        challenge: c("You\u2019re hiding those initials to protect yourself.", "Believe that if you like. I burned a source once. Never again.", "angry")
      }
    ),
    r(
      "correspondent-exits",
      "intel",
      void 0,
      "Who\u2019s been using the exits tonight?",
      "Most drifted. One waited, checked both corridors, then moved with purpose.",
      "suspicious",
      s(
        c("When?", "Just after the clock struck. The rain covered the first few steps.", "thoughtful"),
        c("Couldn\u2019t they just want privacy?", "Could. Privacy usually walks slower.", "neutral"),
        c("Who was it?", "Filed and closed.", "neutral")
      ),
      s(
        c("Anything that would identify them?", "A limp for three steps, then none once they judged the corridor empty.", "surprised"),
        c("Couldn\u2019t that just be bad shoes?", "Could. So could an act. Check it yourself.", "suspicious"),
        c("That\u2019s too thin.", "Then we\u2019re done.", "neutral")
      )
    ),
    r(
      "correspondent-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands reek of something medicinal?",
      "Field kit. Cleaned a cut the way I learned in worse places than this. Sharp stuff. Not the surgeon\u2019s shelf.",
      "neutral",
      s(
        c("What did you cut yourself on?", "A splintered window frame while I watched the drive. Old habit \u2014 check the exits, bleed a little.", "thoughtful"),
        c("Why carry field antiseptic to a dinner?", "Because I\u2019ve needed it at dinners before. Bad weekends leave marks.", "neutral"),
        c("That\u2019s a doctor\u2019s antiseptic.", "It isn\u2019t. Same smell, different bottle. Believe your nose if you like; I\u2019m done.", "neutral")
      ),
      s(
        c("Where did the antiseptic touch your clothes?", "Cuff and knuckle. It dries loud and lingers, same as the surgeon\u2019s \u2014 but it isn\u2019t his.", "worried"),
        c("Could it be surgical carbolic instead?", "Test it. Mine\u2019s a soldier\u2019s bottle. The two only share a reek.", "suspicious"),
        c("That\u2019s enough about the smell.", "Agreed. Spike the thread.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the fluid is field antiseptic, not carbolic.",
        bargain: c("Let me test the bottle \u2014 I won\u2019t call it a surgeon\u2019s.", "Fine. Test it \u2014 field kit, not carbolic. Two things can stink alike and share nothing else.", "thoughtful"),
        challenge: c("That\u2019s the surgeon\u2019s antiseptic on your sleeve. Explain it.", "Analyse it. Mine came from a kit, not an operating tray. A shared smell isn\u2019t a shared hand.", "angry")
      }
    ),
    r(
      "correspondent-earth",
      "timeline",
      "fine-earth",
      "How did pale grit get onto your knees and cuffs?",
      "Went low by the conservatory glass to watch the drive without being seen. Old reflex. The floor was gritty.",
      "neutral",
      s(
        c("What were you watching for?", "Whoever came and went in the storm. You learn to read a doorway from the floor up.", "thoughtful"),
        c("Do you always crawl around a party?", "When the story\u2019s outside and the crowd\u2019s inside, yes. Beats asking politely.", "neutral"),
        c("That grit looks like digging, not watching.", "Think what you like. I knelt, I watched, I left. That\u2019s the whole dispatch.", "neutral")
      ),
      s(
        c("Where did the grit end up?", "Knees, cuffs, the sill I braced on. Pale stuff, finer than dirt. It travelled with me.", "worried"),
        c("Could it match the conservatory soil?", "Close, not the same. Someone tracked this in before I ever knelt in it.", "suspicious"),
        c("The grit isn\u2019t helping.", "Then strike it.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him take the same watch-post and show how the grit transferred.",
        bargain: c("Show me where you knelt and I leave your watch-post alone.", "Fair. I go low here, brace on the sill there \u2014 the grit lands on my knees. A watcher\u2019s mess, nothing worse.", "thoughtful"),
        challenge: c("That grit puts you in the conservatory for more than watching.", "To a watch-post. Have me show you the crouch; it explains every grain.", "angry")
      }
    ),
    r(
      "correspondent-polish",
      "room",
      "metal-polish",
      "Why is there metal polish on your fingers?",
      "Cleaned my lighter and flask. Bad habit in a storm \u2014 a man tends his small machines when the big story stalls.",
      "neutral",
      s(
        c("What exactly did you polish?", "The lighter\u2019s case and the flask\u2019s cap. Both had gone dull in my pocket. Idle hands.", "thoughtful"),
        c("Why bother with that tonight?", "Nerves. I clean brass when I can\u2019t file copy. Everyone waits differently.", "neutral"),
        c("What else did you polish?", "I don\u2019t itemise my hands for anyone. Leave it.", "neutral")
      ),
      s(
        c("Where did the polish transfer?", "From the flask cap to my thumb to the rag in my pocket. One clean little chain.", "worried"),
        c("Could that smear be from the silver?", "Same compound, near enough. Only where it\u2019s been tells you which.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then drop it.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the polish from his flask to his thumb and rag.",
        bargain: c("Show me what\u2019s in your kit and I leave the silver alone.", "Fine. Cap to thumb to rag \u2014 my flask, my lighter, my chain. It doesn\u2019t reach the plate.", "thoughtful"),
        challenge: c("That polish matches the dining silver. You handled more than a flask.", "Follow it from my flask, not the dining room. The chain starts in my pocket.", "angry")
      }
    ),
    r(
      "correspondent-perfume",
      "social",
      "floral-perfume",
      "Why does a woman\u2019s perfume cling to your coat?",
      "A source got frightened and held on a second too long before she talked. Her scent stayed. Her name won\u2019t.",
      "neutral",
      s(
        c("Who was the source?", "Not a chance. But others saw us in the corridor. Ask them where I stood, not who I stood with.", "thoughtful"),
        c("Do sources usually embrace you?", "When they\u2019re scared enough, yes. Fear makes people grab the nearest steady thing.", "neutral"),
        c("That scent looks worn, not caught.", "It\u2019s hers, transferred. I don\u2019t bottle gardenia. That part of the record stays shut.", "neutral")
      ),
      s(
        c("Where did the perfume settle?", "Lapel and collar, where she leaned in. Two guests passed and saw the whole thing.", "thoughtful"),
        c("Couldn\u2019t you just wear it yourself?", "A war correspondent in gardenia. Ask anyone who\u2019s shared a foxhole with me.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then let it evaporate.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the guests who passed in the corridor.",
        bargain: c("Confirm the spot \u2014 keep the source unnamed.", "Deal. The passers-by will place me in that corridor; the scent came off her, and her name stays mine.", "thoughtful"),
        challenge: c("That perfume puts you alone with someone. Who?", "Close to a frightened source, in front of witnesses. Proximity isn\u2019t a confession.", "angry")
      }
    ),
    r(
      "correspondent-powder",
      "room",
      "face-powder",
      "How did ivory powder get onto your shoulder?",
      "Someone brushed past me in a doorway, hurrying. Left half her compact on my coat. Doorways are where people collide.",
      "neutral",
      s(
        c("Who brushed past you?", "A woman moving fast toward the hall. I felt the shove more than I saw the face.", "thoughtful"),
        c("Isn\u2019t that your own powder?", "A field man in ivory powder? No. It came off someone in a hurry.", "neutral"),
        c("That powder looks pressed on.", "It was a collision, not a cosmetic. Read it how you want; I\u2019m finished.", "neutral")
      ),
      s(
        c("Where did the powder land?", "Shoulder and upper sleeve \u2014 right where a passing arm clips you.", "worried"),
        c("Could several women wear that shade?", "Sure. Only one wore enough to leave it on a stranger.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then cut it.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the powder on his shoulder to the compact.",
        bargain: c("Name whose compact it was \u2014 I won\u2019t print it.", "Fair. Match the shade to her compact, not my face. I\u2019ve never owned the stuff.", "thoughtful"),
        challenge: c("That powder puts you near someone you won\u2019t name. Who?", "Near a shoulder in a doorway. Compare the shade; it\u2019s hers, not mine.", "angry")
      }
    ),
    r(
      "correspondent-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine machine oil?",
      "Typewriter jammed mid-sentence. One drop on the carriage rail and it ran again. Can\u2019t file with a stuck key.",
      "neutral",
      s(
        c("When did the machine jam?", "On the hour \u2014 I heard the clock while I was cursing the carriage. Easy time to remember.", "thoughtful"),
        c("Why type during a storm like this?", "Copy waits for no weather. The story was half-written and going cold.", "neutral"),
        c("That\u2019s more oil than a typewriter needs.", "The bottle slipped. That\u2019s the whole item. Move on.", "neutral")
      ),
      s(
        c("Where did the oil end up?", "Fingers and cuff, right as the clock finished striking. The rail\u2019s still slick.", "worried"),
        c("Could that oil be from a lock or a blade?", "Same light oil, different job. A dozen machines take it.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then spike it.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the oiled typewriter to the clock stroke.",
        bargain: c("Give me the time it jammed \u2014 I\u2019ll leave the rest.", "Fair trade. The rail was oiled on the clock\u2019s stroke; oil and hour agree, and neither writes me guilty.", "thoughtful"),
        challenge: c("You oiled something at a minute you\u2019re hiding. What was it?", "So I mend machines on the hour. Punctual maintenance isn\u2019t a motive.", "angry")
      }
    ),
    r(
      "correspondent-wax",
      "social",
      "wax-resin",
      "Why is there an amber fleck of wax on your cuff?",
      "Sealed a dispatch the old way \u2014 hot wax over the flap so I\u2019d know if anyone steamed it open. Habit from censored posts.",
      "suspicious",
      s(
        c("What was in the dispatch?", "Notes I don\u2019t want read before I file them. The seal\u2019s the point; the words are mine.", "thoughtful"),
        c("Do reporters still seal with wax?", "The ones who\u2019ve been read over do. A wax seal can\u2019t be faked without leaving a scar.", "neutral"),
        c("That\u2019s no press habit.", "Believe it or don\u2019t. The dispatch stays sealed and so does this.", "neutral")
      ),
      s(
        c("How did the wax reach your cuff?", "Snapped off the stick as I pressed it. Warm fleck, straight to the cuff. Careless.", "worried"),
        c("Could that fleck be an antique dealer\u2019s resin?", "Looks close. Mine\u2019s off a sealing stick, not a relic. Test it.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then leave it.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell him he used black wax \u2014 see if he corrects the colour.",
        bargain: c("Show me the seal and I leave the dispatch unread.", "Fair \u2014 and it\u2019s amber, not black. The colour\u2019s wrong in your note; the seal itself is plain enough.", "thoughtful"),
        challenge: c("You sealed something with that wax you won\u2019t show me.", "Amber, not black. If you\u2019ve got the colour wrong, mind what else you\u2019ve assumed.", "angry")
      }
    ),
    r(
      "correspondent-beat",
      "connection",
      void 0,
      "Why keep taking the hard jobs?",
      "If someone writes it down straight, the lie can\u2019t stand. Naive, maybe. It\u2019s kept me moving.",
      "thoughtful",
      s(
        c("What story changed you?", "One where I named a source to make the copy sing. They paid for my byline. I don\u2019t do that anymore.", "worried"),
        c("Do you ever want to stop?", "Every filing day. Then something needs saying and my feet start walking.", "neutral"),
        c("I have other questions.", "Course you do. Everyone skips to the last line.", "neutral")
      ),
      s(
        c("What won\u2019t you do now?", "Burn a source. Once was enough.", "worried"),
        c("What are you still after?", "The version nobody wants written down. Usually the true one.", "suspicious"),
        c("We\u2019re done here.", "Fine.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 what are you protecting tonight?", "Someone who trusted me after the last time I failed one. I don\u2019t get to fail twice.", "worried"),
        challenge: c("What are you hiding behind all that principle?", "A source, not a crime. Guarding a name is my job.", "angry")
      }
    ),
    r(
      "correspondent-map",
      "intel",
      void 0,
      "What does this house tell you?",
      "Too many exits, too few honest ones. Half the alibis here are lies holding other lies up.",
      "suspicious",
      s(
        c("Whose story sounds weakest?", "The one that\u2019s too smooth. Honest people fumble the order; liars have it memorised.", "thoughtful"),
        c("Do you distrust everyone?", "I check everyone. Trust is a luxury.", "neutral"),
        c("I need a name.", "Names come after facts.", "neutral")
      ),
      s(
        c("What about the exits?", "Someone used a door twice they claim not to know. Movement leaves a trail.", "thoughtful"),
        c("Could you be reading too much into it?", "Always possible. This one\u2019s not verified yet.", "suspicious"),
        c("That\u2019s enough.", "Then we\u2019re done.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who moved when they shouldn\u2019t have?", "One guest crossed after the clock struck, checked both corridors first. That\u2019s not a stroll.", "thoughtful"),
        challenge: c("Whose trail are you hiding?", "None. I hide a source\u2019s name, never a movement.", "angry")
      }
    )
  ],
  accountant: [
    r(
      "accountant-ink",
      "timeline",
      "ink-fiber",
      "Why is there blue-black ink across your fingers?",
      "An entry that wouldn\u2019t balance. Posting ink makes an error look permanent \u2014 and mine flooded the margin when something startled me.",
      "angry",
      s(
        c("What startled you into the mess?", "Someone came in behind me; the nib split and the blue-black went everywhere.", "suspicious"),
        c("What entry wouldn\u2019t balance?", "A figure that\u2019s immaterial to you and very material to the estate.", "neutral"),
        c("That was no slip of the pen. What were you really doing to the books?", "Gladly. Account settled.", "neutral")
      ),
      s(
        c("What happened to the flooded margin?", "I tore the soaked strip away. The altered zero underneath is still legible.", "worried"),
        c("Couldn\u2019t a reporter use the same ink?", "Yes. Ink keeps no loyalty to a profession.", "neutral"),
        c("The books can wait for morning.", "Then this entry is closed.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Compare the altered figure to the carbon copy.",
        bargain: c("Show me the entry \u2014 I\u2019ll note you were under pressure.", "That I can do. If the record shows the pressure I was under, I\u2019ll sign the true figure.", "worried"),
        challenge: c("You didn\u2019t just spill that ink \u2014 something in that entry changed.", "I posted a figure I was ordered to post. A forced hand isn\u2019t a free one.", "angry")
      }
    ),
    r(
      "accountant-polish",
      "room",
      "metal-polish",
      "Why is there metal polish filmed on your hands?",
      "Inventory. One candlestick had been moved and left badly tarnished, so I saw to it.",
      "suspicious",
      s(
        c("How did you test the tarnish?", "A dab of waxy polish on the base \u2014 it lifted the oxide at once.", "thoughtful"),
        c("Was the candlestick valuable?", "Everything carries a value. That answer carries none.", "angry"),
        c("You didn\u2019t polish silver just for inventory. What were you wiping?", "With pleasure. Item struck from discussion.", "neutral")
      ),
      s(
        c("Where did you polish it, exactly?", "Only where a hand would grip \u2014 the very places prints would sit.", "worried"),
        c("Couldn\u2019t that be motor-badge polish?", "Substantially similar. The brand records might part them.", "thoughtful"),
        c("That\u2019s enough about the inventory.", "Then strike it from your inquiry.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell him he polished the base too \u2014 see if he corrects you.",
        bargain: c("Help me quietly and your name stays off it.", "Then note this: I polished only the grip. Whoever moved it left the base untouched.", "thoughtful"),
        challenge: c("You cleaned that candlestick to wipe a grip, not tarnish.", "I cleaned where hands go. If that troubles you, it troubles whoever\u2019s hands were there.", "angry")
      }
    ),
    r(
      "accountant-oil",
      "social",
      "blade-oil",
      "Why are your fingers slick with fine machine oil?",
      "The adding machine\u2019s carriage stuck mid-column. I dislike an interrupted total, so a drop of oil put it right.",
      "angry",
      s(
        c("What freed the carriage?", "A tiny drop of machine oil along the precision rail.", "thoughtful"),
        c("Couldn\u2019t you add by hand?", "I could also walk home through the flood. Neither\u2019s sensible.", "neutral"),
        c("Open the machine. Show me what you oiled.", "Transaction cancelled.", "neutral")
      ),
      s(
        c("Where did the oil travel after?", "The key snapped back and flicked a clear drop onto my hand and the ledger clasp.", "worried"),
        c("Wouldn\u2019t instrument oil look the same?", "Likely. Composition, not appearance, answers that.", "thoughtful"),
        c("That total isn\u2019t helping.", "Then the account is closed.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the oil from the machine rail to the ledger clasp.",
        bargain: c("Show me what you oiled and I leave the ledgers alone.", "Gladly \u2014 rail, key, clasp. The same drop touched all three, and nothing else of mine.", "thoughtful"),
        challenge: c("That oil touched more than an adding machine. What else?", "The clasp, not the crime. A careless drop isn\u2019t a damning one.", "angry")
      }
    ),
    r(
      "accountant-ledger",
      "intel",
      void 0,
      "Anything odd in the household accounts?",
      "A late charge posted twice, then one copy removed without proper initials.",
      "suspicious",
      s(
        c("Who could have changed that entry?", "Anyone with study access \u2014 but only a few knew which book to open.", "thoughtful"),
        c("Couldn\u2019t it be a simple mistake?", "Mistakes add ink. They don\u2019t remove pages.", "angry"),
        c("Who pulled that page?", "Very well. We\u2019re done with this account.", "neutral")
      ),
      s(
        c("What narrows who had access?", "The cabinet was locked before dinner and open after one guest left the study.", "suspicious"),
        c("Are you accusing that guest?", "I\u2019m telling you who had access. Accusation is your job.", "neutral"),
        c("That\u2019s enough.", "Fine.", "neutral")
      )
    ),
    r(
      "accountant-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands smell sharply of chemicals?",
      "Ink eradicator. When a figure\u2019s posted wrong, you bleach it out. It reeks like a sickroom and costs a fortune.",
      "neutral",
      s(
        c("What figure were you correcting?", "A transposed sum. The fluid lifts the error so a clean one can replace it. Tedious, necessary.", "thoughtful"),
        c("Why keep such a chemical on you?", "An accountant without eradicator lives with his mistakes. I prefer to erase mine.", "neutral"),
        c("That\u2019s a doctor\u2019s chemical.", "It\u2019s a clerk\u2019s bleach. The smell\u2019s shared; the purpose isn\u2019t. We\u2019re finished.", "neutral")
      ),
      s(
        c("Where did the eradicator touch you?", "Fingertip and cuff, where the dropper slipped over the ledger. It dries loud, like carbolic \u2014 but it isn\u2019t.", "worried"),
        c("Could it be surgical carbolic instead?", "Test the bottle. Mine dissolves ink, not infection. The two only agree on their stink.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then strike it from the account.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the fluid dissolves ink, not wounds.",
        bargain: c("Let me test what\u2019s on your cuff \u2014 quietly.", "Reasonable. Test it \u2014 eradicator, not carbolic. A shared reek is a poor ledger entry.", "thoughtful"),
        challenge: c("That\u2019s a surgeon\u2019s antiseptic on your sleeve. Explain it.", "Analyse it. Mine erases figures; his cleans wounds. You\u2019ve posted the wrong column.", "angry")
      }
    ),
    r(
      "accountant-earth",
      "timeline",
      "fine-earth",
      "What is that pale grit dusted over your ledger and cuffs?",
      "Pounce \u2014 fine sand a clerk shakes over wet ink so a figure dries without smearing. Older than blotting paper, and cleaner.",
      "neutral",
      s(
        c("When did you pounce the page?", "After each correction tonight. The grit tells you a fresh entry was just made and dried in a hurry.", "thoughtful"),
        c("Why use sand instead of a blotter?", "A blotter lifts ink and can be read in a mirror. Pounce leaves no ghost of the figure. Discretion.", "neutral"),
        c("That doesn\u2019t look like desk powder.", "It\u2019s from a pounce-pot on my desk. Your theory needs auditing.", "neutral")
      ),
      s(
        c("Where did the pounce end up?", "My cuff, the page, the desk edge. Far finer than garden grit \u2014 a lens shows even grains.", "thoughtful"),
        c("Could it match the conservatory soil?", "Only to a careless eye. Side by side, pounce is uniform; soil isn\u2019t.", "suspicious"),
        c("The grit isn\u2019t helping.", "Then let it settle.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare the dust on his cuff to the desk pot and the garden grit.",
        bargain: c("Show me the pot on your desk and I won\u2019t chase the garden.", "Efficient. Set my cuff beside the pot; the grain matches the pounce, not the flowerbeds.", "thoughtful"),
        challenge: c("That grit came from the conservatory. Your desk story won\u2019t hold.", "Compare the grains properly. Pounce is milled; soil is chance. They won\u2019t reconcile.", "angry")
      }
    ),
    r(
      "accountant-wool",
      "social",
      "black-wool",
      "Where did that frayed black wool come from?",
      "My suit. Dark, serviceable, worn at the elbow from leaning over ledgers. It catches on rough cabinetry.",
      "neutral",
      s(
        c("What did the suit catch on?", "The cellar cabinet where the estate books are kept. A splintered edge took a thread as I reached in.", "thoughtful"),
        c("Why wear a working suit to a dinner?", "Because a man doesn\u2019t audit from an armchair. The accounts don\u2019t keep party hours.", "neutral"),
        c("That thread came from somewhere you deny.", "You haven\u2019t examined my suit, so you can\u2019t say. I decline the assumption.", "neutral")
      ),
      s(
        c("Where did the thread travel after?", "Cabinet edge to elbow to the ledger I carried out. A plain, itemised trail.", "worried"),
        c("Could the thread be another dark coat?", "It could. Coarse black wool is common enough to implicate half the staff.", "suspicious"),
        c("The thread isn\u2019t enough.", "A rare balanced conclusion.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the cellar cabinet to his elbow.",
        bargain: c("Show me where the suit snagged and I keep it quiet.", "Fair. Cabinet to elbow to ledger \u2014 the whole chain, and nothing on it but bookkeeping.", "thoughtful"),
        challenge: c("That thread puts you in the cellar for more than books.", "Where the accounts are kept. Reaching for a ledger isn\u2019t a plot.", "angry")
      }
    ),
    r(
      "accountant-perfume",
      "social",
      "floral-perfume",
      "Why does a woman\u2019s perfume cling to your sleeve?",
      "A guest leaned over my shoulder to argue about a figure and left her scent on my coat. Interruptions have a smell now, apparently.",
      "suspicious",
      s(
        c("Who leaned over you?", "A woman disputing an entry in the study. Two others were there; ask them where I sat.", "thoughtful"),
        c("Do people often read over your shoulder?", "When money\u2019s involved, constantly. Everyone\u2019s an auditor of their own account.", "neutral"),
        c("That scent looks worn, not caught.", "It transferred from her sleeve to mine. I don\u2019t wear gardenia. The matter closes.", "neutral")
      ),
      s(
        c("Where did the perfume settle?", "Shoulder and collar, where she bent over the page. The others saw the whole quarrel.", "thoughtful"),
        c("Could you wear the scent yourself?", "An estate accountant in perfume. Ask anyone who\u2019s shared an office with me.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then write it off.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the guests who saw her lean over the books.",
        bargain: c("Name who leaned over your figures \u2014 off the record.", "Acceptable. The witnesses place me at the desk; her scent came over my shoulder, not from any bottle of mine.", "thoughtful"),
        challenge: c("That perfume puts you alone with someone. Who?", "Close enough to be scolded over a figure, in front of witnesses. Standing near someone isn\u2019t guilt.", "angry")
      }
    ),
    r(
      "accountant-powder",
      "timeline",
      "face-powder",
      "How did ivory face powder get onto your ledger and cuff?",
      "The same woman who quarrelled over the figure set her compact on my desk. When she snatched it back, it burst.",
      "surprised",
      s(
        c("What happened to the compact?", "She slapped it down to make a point, then grabbed it too fast. The lid sprang and dusted the page and my cuff.", "thoughtful"),
        c("Why should I believe it was hers?", "Because I keep pounce and ink on that desk, not cosmetics. The powder\u2019s plainly a lady\u2019s.", "neutral"),
        c("That powder looks deliberate.", "You\u2019re building a fiction from a smear. I won\u2019t endorse it.", "neutral")
      ),
      s(
        c("Show me how the compact burst?", "She sets it here, snatches there, the lid snaps back, and the puff scatters across the ledger. Simple mechanics.", "worried"),
        c("Could the powder be your own?", "I balance books, not my complexion. It isn\u2019t mine.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then keep it out of your figures.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him show how the compact dusted the ledger.",
        bargain: c("Show me how the powder got on the page \u2014 discreetly.", "Gladly. Set here, snatched there, the lid bursts \u2014 the powder writes the whole quarrel across my page.", "thoughtful"),
        challenge: c("That powder didn\u2019t land by accident. You pressed it into the page.", "Then have me show you the spill. The sequence posts the blame to her clasp, not my hand.", "angry")
      }
    ),
    r(
      "accountant-wax",
      "room",
      "wax-resin",
      "Why is there an amber fleck of wax on your cuff?",
      "I sealed an envelope of accounts. Wax over the flap, dated and pressed, so any tampering shows. The stick cracked as I stamped it.",
      "thoughtful",
      s(
        c("When did you seal the envelope?", "On the hour \u2014 I stamp the seal and note the time together, so the record and the wax agree.", "thoughtful"),
        c("Why seal accounts at a party?", "Because figures don\u2019t keep office hours, and neither, apparently, do the people they implicate.", "suspicious"),
        c("That\u2019s no ordinary account seal.", "A sealed account stays sealed until it\u2019s called for. So does this subject.", "neutral")
      ),
      s(
        c("How did the wax reach your cuff?", "It snapped off the stick as I pressed the stamp, right as the clock struck. A fleck caught my cuff.", "worried"),
        c("Could that fleck be an antique dealer\u2019s resin?", "To an untrained eye. Mine came off a sealing stick and carries the hour I used it.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then let the seal keep its date.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the dated seal to the clock stroke.",
        bargain: c("Give me the time you stamped it \u2014 I leave the contents alone.", "Fair. The seal carries the time I stamped it; wax and clock agree, and neither posts me guilty.", "thoughtful"),
        challenge: c("That wax sealed something you won\u2019t open for me.", "So I date my seals precisely. A punctual stamp isn\u2019t a confession.", "angry")
      }
    ),
    r(
      "accountant-note",
      "suspicion",
      "torn-note",
      "What\u2019s that scrap of cramped shorthand about?",
      "Running figures. A private tally in my own marks \u2014 sums, initials, a running balance. I tore the finished strip off out of habit.",
      "thoughtful",
      s(
        c("What did the tally record?", "A discrepancy I was chasing across two books. Numbers, not names \u2014 though the numbers point somewhere.", "suspicious"),
        c("Can anyone else read your marks?", "A trained bookkeeper, perhaps. To most it reads as a fence of scratches.", "neutral"),
        c("That\u2019s no ledger note. Hand it over.", "A private tally stays private. The strip\u2019s torn and the topic with it.", "neutral")
      ),
      s(
        c("What happened to the torn strip?", "It left my folio when I stood; desk to floor, I didn\u2019t track it. Careless of me.", "worried"),
        c("Could the marks pass for something else?", "To a suspicious reader, any figure looks like a motive.", "thoughtful"),
        c("I\u2019ll read it myself.", "Then mind you don\u2019t misread a subtotal for a threat.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Read the total back wrong and let him correct it.",
        bargain: c("Read me the tally \u2014 names stay out.", "Very well \u2014 but your total\u2019s off by a decimal. Correct it and you\u2019ll see it\u2019s only a balance.", "thoughtful"),
        challenge: c("This note reads like a threat. Whose names are you hiding?", "You\u2019ve misread the figure. Move the decimal and your \u201Cthreat\u201D becomes a subtotal.", "angry")
      }
    ),
    r(
      "accountant-ledgerlife",
      "connection",
      void 0,
      "Why trust numbers more than people?",
      "People revise their stories. A column of figures doesn\u2019t. I learned young which one to rely on.",
      "thoughtful",
      s(
        c("What taught you that?", "A family that promised much and delivered nothing. Numbers never promised. They just added up.", "worried"),
        c("Do you care about the people behind the sums?", "I feel plenty. I just won\u2019t let that corrupt the arithmetic.", "neutral"),
        c("I have other questions.", "As you like.", "neutral")
      ),
      s(
        c("What would you fix if you could?", "One account I signed that only balanced on paper. It\u2019s cost me sleep, not money.", "worried"),
        c("What will you never do again?", "Sign my name to a figure I know is false. Once was a lesson.", "suspicious"),
        c("We\u2019re finished here.", "Fine.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 what\u2019s weighing on you?", "A set of books I can no longer pretend I didn\u2019t read correctly. Some totals have to be paid.", "worried"),
        challenge: c("What are you hiding behind all that precision?", "A false entry, not a false alibi.", "angry")
      }
    ),
    r(
      "accountant-audit",
      "intel",
      void 0,
      "Looking at these guests \u2014 whose money doesn\u2019t add up?",
      "Several. Money leaves a trail even when a person doesn\u2019t. Three of them are running a deficit they won\u2019t admit.",
      "suspicious",
      s(
        c("Whose?", "One who spends like a man expecting money he hasn\u2019t earned yet. That\u2019s dangerous.", "thoughtful"),
        c("Do you judge everyone by their finances?", "Only the ones whose finances explain their manners.", "neutral"),
        c("I need a name.", "Names follow figures. That\u2019s the order.", "neutral")
      ),
      s(
        c("What have you actually seen?", "A household charge posted, then quietly reversed. Someone tidied a record that didn\u2019t need tidying.", "suspicious"),
        c("Could that be a clerical error?", "Errors add entries. They don\u2019t remove them. This was deliberate.", "angry"),
        c("That\u2019s enough.", "Fine.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 whose money should I follow?", "Follow the one who reversed the charge. People only erase what they can\u2019t afford to have read.", "thoughtful"),
        challenge: c("Whose books are you protecting?", "No one\u2019s. I hold back conclusions, not entries. Draw your own.", "angry")
      }
    )
  ]
};

// src/game/dialogue/packC.ts
var PACK_C = {
  vocalist: [
    r(
      "vocalist-perfume",
      "room",
      "floral-perfume",
      "That floral scent follows you everywhere. Where does it come from?",
      "My atomizer leaked over my scarf before the first set. Gardenia got the encore instead of me.",
      "neutral",
      s(
        c("How much of it spilled?", "One little bulb, and the scarf drank the lot. I reeked of the flower shop all night.", "thoughtful"),
        c("Is gardenia your signature?", "A singer keeps some signatures off the program, sugar.", "neutral"),
        c("That scent turned up somewhere you weren\u2019t. How?", "All right. That song is over.", "neutral")
      ),
      s(
        c("Where was that scarf while you sang?", "That\u2019s the thing \u2014 nowhere near the trouble. It sat folded in my case while the scent turned up in a hall I never walked.", "worried"),
        c("Could the conservatory flowers smell the same?", "Close enough to fool a hurried nose, not a patient one.", "thoughtful"),
        c("That\u2019s enough about the scent.", "Then let it fade.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Set the scented hall against the scarf that stayed in her case.",
        bargain: c("Help me show someone used your perfume against you \u2014 quietly.", "Gladly. That trail is gardenia I never spilled, on a route I never took.", "thoughtful"),
        challenge: c("Your perfume turned up somewhere you claim you never walked.", "It puts my scent there. Scent travels where my feet never did.", "angry")
      }
    ),
    r(
      "vocalist-powder",
      "social",
      "face-powder",
      "There\u2019s ivory powder dusted across your collar. Where\u2019s that from?",
      "Just my compact. The ivory cracked and jumped clean across the dressing table before the first set.",
      "neutral",
      s(
        c("What set the compact off?", "It slipped when the lamps flickered and cracked wide open. Ivory everywhere.", "surprised"),
        c("Who were you hoping to impress?", "The whole room. Never one soul when an audience is going spare.", "neutral"),
        c("That powder was pressed into a door. How?", "Then the mirror goes quiet.", "neutral")
      ),
      s(
        c("Where did all that powder end up?", "On my collar \u2014 and pressed into the dressing-room door, where somebody leaned in to listen.", "worried"),
        c("Couldn\u2019t anyone own stage powder?", "Anybody can own it. Wearing it well is rarer.", "neutral"),
        c("A cracked compact isn\u2019t enough.", "Then close it, and this too.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the print in the door powder to a card edge.",
        bargain: c("Help me show someone else pressed that powder \u2014 I keep your dressing room out of it.", "Whoever leaned on my dressing-room door pressed a card carrier into it. The seams match, detective.", "thoughtful"),
        challenge: c("That powder puts you where you shouldn\u2019t be. Own it.", "It puts my powder there, not me. The print pressed in it wears seams that aren\u2019t mine.", "suspicious")
      }
    ),
    r(
      "vocalist-wax",
      "timeline",
      "wax-resin",
      "There\u2019s a smear of amber wax on your hands. What is that?",
      "Grip wax. A little amber cake I warm to keep a stubborn clasp moving and my hands from slipping.",
      "thoughtful",
      s(
        c("Why warm the wax?", "Cold wax skips. Warm it and it goes on smooth as a low note.", "neutral"),
        c("Does wax improve the singing?", "No, but this conversation may need several coats.", "suspicious"),
        c("That wax has taken some odd shape. What pressed into it?", "Fine by me. End of the number.", "neutral")
      ),
      s(
        c("What pressed into that soft wax?", "Something with teeth. A brass key left its shape when it sat against the cake.", "worried"),
        c("Couldn\u2019t that be sealing wax?", "Same family of shine, different rhythm. A test would tell.", "thoughtful"),
        c("The wax is no concern of mine.", "Then let that note resolve.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Press the key shape back into the wax.",
        bargain: c("Show me what leaned on that wax and I leave the key alone.", "Watch \u2014 something sat on it while I wasn\u2019t looking. Teeth-down, brass. The wax remembers what I didn\u2019t see.", "thoughtful"),
        challenge: c("Something left its shape in that wax. You\u2019re hiding what used it.", "A brass key, teeth-down \u2014 the wax took the impression, not me. A cake can\u2019t choose what leans on it.", "angry")
      }
    ),
    r(
      "vocalist-ear",
      "intel",
      void 0,
      "What did you hear while everyone else was talking?",
      "A door at an odd moment, hurried shoes, then somebody humming to cover their nerves.",
      "thoughtful",
      s(
        c("What were they humming?", "One of my songs from earlier \u2014 but the last phrase came too fast.", "suspicious"),
        c("Why hum at all?", "Some people pray. Some lie. Some borrow a tune.", "neutral"),
        c("Who was humming?", "That\u2019s where I stop.", "neutral")
      ),
      s(
        c("Where did they go?", "From the side hall toward the stairs, and they stopped the moment another guest appeared.", "thoughtful"),
        c("Could that have been you?", "I know when I\u2019m singing \u2014 even badly.", "angry"),
        c("That\u2019s not enough to follow.", "Then we\u2019re done.", "neutral")
      )
    ),
    r(
      "vocalist-ink",
      "timeline",
      "ink-fiber",
      "Why are your fingers stained blue-black with ink?",
      "I mark my charts in ink before each set \u2014 a key change here, a rest there \u2014 and I date the margin by the chime. Tonight the pen bled worse than a torch song.",
      "neutral",
      s(
        c("What were you marking tonight?", "A late key change, right as the clock chimed. I keep time even off the stage.", "thoughtful"),
        c("Why ink and not pencil?", "Pencil fades under the lamps. Ink stays, same as a good lyric.", "neutral"),
        c("That\u2019s more ink than a chart needs.", "The nib caught and wept. That\u2019s the whole verse. We can let it end there.", "neutral")
      ),
      s(
        c("Where did the ink end up?", "My fingers and the margin, right at the hour I\u2019d just inked into the score.", "worried"),
        c("Could another writer share that ink?", "Half this house scribbles. Ink doesn\u2019t sign a name.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then let that note fade.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the inked margin to the clock stroke she marked.",
        bargain: c("Give me the hour on the score \u2014 I leave the rest unread.", "Sweet of you. The margin\u2019s inked to the chime I marked it by; the hour and the stain sing the same note, nothing more.", "thoughtful"),
        challenge: c("You inked that score at a minute you\u2019re covering. Which?", "So I keep good time. A singer on the beat isn\u2019t a singer with a motive.", "angry")
      }
    ),
    r(
      "vocalist-antiseptic",
      "room",
      "antiseptic",
      "Your hands and scarf reek of something medicinal. Why?",
      "Throat wash and a menthol chest rub before a set. It bites like a sickroom, but it\u2019s all a singer\u2019s vanity.",
      "neutral",
      s(
        c("What exactly do you use it for?", "To open the pipes. Damp weather closes a voice like a bad review; the rub keeps the low notes low.", "thoughtful"),
        c("Why should I believe it isn\u2019t the real thing?", "Because a surgeon\u2019s carbolic and my gargle just happen to share a sting. Different bottles entirely.", "neutral"),
        c("That smell\u2019s a doctor\u2019s.", "Trust your nose over my dressing table if you like. That song\u2019s over.", "neutral")
      ),
      s(
        c("Where did the wash touch you?", "My scarf and fingers, where I dabbed the rub. It clings all night, same as the surgeon\u2019s \u2014 but it isn\u2019t.", "worried"),
        c("Could it be surgical antiseptic instead?", "Only to a nose in a rush. Taste it and it\u2019s menthol and honey, not medicine.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then quit breathing in my vanity.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the scarf smells of throat wash, not carbolic.",
        bargain: c("Let me test the bottle \u2014 I won\u2019t call it a surgeon\u2019s.", "Sweet. Test it \u2014 throat wash, menthol, honey. It shares a sting with carbolic and nothing else.", "thoughtful"),
        challenge: c("That\u2019s a surgeon\u2019s antiseptic on your scarf. Explain it.", "Sniff again, detective. Mine soothes a voice; his cleans a wound. A shared sting isn\u2019t a shared crime.", "angry")
      }
    ),
    r(
      "vocalist-earth",
      "social",
      "fine-earth",
      "What is that pale grit on your hands and hem?",
      "Grip chalk, near enough \u2014 I keep a tin of it and chalk my palms so the microphone stand doesn\u2019t slide when the room gets warm.",
      "neutral",
      s(
        c("What do you use the powder for?", "A slick grip drops a mic mid-song. A little chalk and the stand stays put.", "thoughtful"),
        c("Isn\u2019t that just floor dust?", "Finer than any floor. It comes from my own tin, not your garden.", "neutral"),
        c("That grit looks like floor dust, not chalk.", "You want to write me crawling in the dirt. That\u2019s not my number.", "neutral")
      ),
      s(
        c("Where did the powder settle?", "My palms, my hem, the stand I gripped. It\u2019s paler and finer than soil, if you look close.", "worried"),
        c("Could it match the conservatory grit?", "At a glance, maybe. Side by side, my chalk\u2019s milled even; garden grit never is.", "suspicious"),
        c("The grit isn\u2019t helping.", "Then let the dust settle.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare her palm chalk to the grip tin and the garden grit.",
        bargain: c("Show me your tin and I won\u2019t chase the conservatory.", "Kindly. Set my palm by the tin; the grip chalk matches, the garden grit doesn\u2019t.", "thoughtful"),
        challenge: c("That grit came from the conservatory. Your chalk story won\u2019t hold.", "Compare them. My chalk\u2019s even; soil isn\u2019t. They won\u2019t match.", "angry")
      }
    ),
    r(
      "vocalist-wool",
      "timeline",
      "black-wool",
      "Where did that frayed black wool come from?",
      "My performance stole. Black, warm, a little worn \u2014 it caught on a splintered doorframe by the side hall and shed threads down my shoulder.",
      "neutral",
      s(
        c("What made it fray like that?", "The splinter took a thread the moment I brushed past. Old weave gives easily.", "thoughtful"),
        c("Why wear a heavy stole indoors?", "A cold room steals a voice. I keep my shoulders warm the way a horn player keeps his reed.", "neutral"),
        c("That stole took you somewhere you deny.", "You haven\u2019t touched my stole, so you can\u2019t say. I won\u2019t sing to your guess.", "neutral")
      ),
      s(
        c("Where did the thread travel after that?", "Doorframe to shoulder to the chair I draped it on. Follow it and it plays straight through.", "worried"),
        c("Could the thread be another dark coat?", "Could be. Coarse black wool\u2019s common enough to accuse half the room.", "suspicious"),
        c("The thread isn\u2019t enough.", "Then let it hang loose.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the doorframe to her stole.",
        bargain: c("Show me where the stole snagged and I keep it quiet.", "Sweet. Doorframe to shoulder to chair \u2014 the whole soft little journey, and nothing sharp on it.", "thoughtful"),
        challenge: c("That thread puts you in the side hall for more than a song.", "So my stole brushed a door, detective. Passing through a hall isn\u2019t a plot.", "angry")
      }
    ),
    r(
      "vocalist-polish",
      "room",
      "metal-polish",
      "Why is there metal polish on your fingers?",
      "I keep my microphone stand and my locket bright. A dull stand under the lights looks like a dull act.",
      "thoughtful",
      s(
        c("What exactly did you polish?", "The stand\u2019s neck and my little silver locket. Both had gone grey in the damp.", "suspicious"),
        c("Do you shine everything you own?", "Only the things the audience sees. The rest can tarnish in peace.", "neutral"),
        c("What else did you polish?", "A lady doesn\u2019t catalogue her fingerprints. That number\u2019s finished.", "neutral")
      ),
      s(
        c("Where did the polish transfer?", "To my fingers and the stand\u2019s neck \u2014 right where a hand grips to sing.", "worried"),
        c("Could that smear be from the silver?", "Same waxy stuff, near enough. Only where it\u2019s been tells you which.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then let it go dull.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell her she polished the locket\u2019s back \u2014 see if she corrects you.",
        bargain: c("Help me quietly and I keep your name clean.", "Obliging of you. I shined only the front and the neck; whoever handled the silver was messier than me.", "thoughtful"),
        challenge: c("That polish matches the silver upstairs. You handled more than a mic stand.", "I shine a mic stand, detective. Follow the smear to my locket, not to a plate I never lifted.", "angry")
      }
    ),
    r(
      "vocalist-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine oil?",
      "My music case latch seized in the damp. One drop of light oil and it snapped open again, smooth as a slow number.",
      "neutral",
      s(
        c("What exactly did you oil?", "The latch and the little hinge on the lid. Both had rusted stiff in this weather.", "thoughtful"),
        c("Why fuss with a case tonight?", "Because my charts live in it, and a stuck latch means no set. Couldn\u2019t wait.", "neutral"),
        c("That oil went where it shouldn\u2019t.", "You suppose a lot from a slick thumb, detective. I won\u2019t sing to it.", "neutral")
      ),
      s(
        c("Where did the oil end up?", "My thumb and cuff when the latch sprang back. It marks whatever I touch after.", "worried"),
        c("Could that oil be from a lock or a blade?", "Same light oil, different job. A dozen little machines take it.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then let it dry.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have her free the case latch again and show where the oil went.",
        bargain: c("Show me how the case opened and I leave the latch alone.", "Watch \u2014 I oil the latch here, it springs there, the oil catches my thumb. No mystery, just a stuck lid.", "thoughtful"),
        challenge: c("That oil touched more than a music case. What else did you free?", "A music case, detective. Watch me free it; the oil lands right where an honest fix would put it.", "angry")
      }
    ),
    r(
      "vocalist-note",
      "social",
      "torn-note",
      "What are those cramped little marks you keep tucking away?",
      "Song requests \u2014 a shorthand of my own for who wants what and when. I tear off each one as I sing it.",
      "suspicious",
      s(
        c("What was on the marks tonight?", "A title, a table, a time. Somebody wanted a particular tune at a particular hour.", "thoughtful"),
        c("Can anyone else read your shorthand?", "Another band singer, maybe. To the rest it\u2019s just scratches and hope.", "neutral"),
        c("Those aren\u2019t song requests. Hand them over.", "A singer\u2019s notes stay in a singer\u2019s glove. That verse is done.", "neutral")
      ),
      s(
        c("What became of the torn scrap?", "It slipped from my glove between numbers. From my hand to the floor, I couldn\u2019t swear where.", "worried"),
        c("Could the marks pass for something else?", "To a suspicious eye, a shopping list looks like a scheme.", "thoughtful"),
        c("I\u2019ll ask whoever made the request.", "Do. They\u2019ll hum it back the same as my note.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the guest who requested the tune.",
        bargain: c("Name who asked for the song \u2014 I won\u2019t put it in print.", "Sweet. The guest who asked will confirm the tune and the hour; my note just sings back what they wanted.", "thoughtful"),
        challenge: c("That scrap looks like more than a song request. What are you hiding?", "To a song request, detective. Ask the guest; my marks and their wish are the same tune.", "angry")
      }
    ),
    r(
      "vocalist-road",
      "connection",
      void 0,
      "How did you end up singing in a house like this?",
      "You follow the work, and the work follows the money \u2014 into colder rooms than the clubs I came up in.",
      "thoughtful",
      s(
        c("Where did you learn to sing?", "Rooms full of smoke and second chances. I learned the blues before I learned my letters.", "thoughtful"),
        c("Is it lonely?", "A little. The room loves the song, never quite the girl singing it.", "neutral"),
        c("I have other questions.", "Course you do.", "neutral")
      ),
      s(
        c("Who are you looking out for?", "A friend who kept me singing when a powerful man tried to take my voice for himself.", "worried"),
        c("What won\u2019t you do?", "Sing someone else\u2019s lie because the pay is good. I did it once. Never again.", "suspicious"),
        c("We\u2019re done here.", "Pity.", "neutral")
      ),
      {
        bargain: c("Honestly \u2014 what are you carrying tonight?", "A tune that isn\u2019t mine to lose, and a friend I won\u2019t let anyone silence.", "thoughtful"),
        challenge: c("What are you hiding?", "A friend\u2019s name, not a crime. Keeping someone safe isn\u2019t guilt.", "angry")
      }
    ),
    r(
      "vocalist-room",
      "intel",
      void 0,
      "Looking at this room \u2014 what do you notice?",
      "Everybody\u2019s a little off tonight. Fear pulls a voice wrong, and I hear it all over this house.",
      "suspicious",
      s(
        c("Who sounds off?", "One guest laughs a half-beat late \u2014 like they\u2019re listening for something under the music.", "thoughtful"),
        c("You judge people by how they sound?", "It\u2019s truer than words sometimes. A voice can\u2019t hide the way a face can.", "neutral"),
        c("I need a name.", "Then I\u2019m poor company tonight.", "neutral")
      ),
      s(
        c("What would you trust as a real sign?", "The breath before a lie. It catches every time.", "thoughtful"),
        c("Could you be hearing it wrong?", "Sure. I give you what I hear, not a verdict.", "suspicious"),
        c("That\u2019s enough.", "Then we\u2019re done.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who\u2019s trying too hard to sound calm?", "The one who\u2019s too smooth. Real calm breathes. A fake one holds too long.", "thoughtful"),
        challenge: c("Who are you covering for?", "A friend\u2019s name \u2014 not a culprit\u2019s.", "angry")
      }
    )
  ],
  antiquarian: [
    r(
      "antiquarian-earth",
      "room",
      "fine-earth",
      "There\u2019s pale dust on your fingertips and hem. Where did it come from?",
      "A reliquary I was studying \u2014 modern hinge, undocumented base. Pale packing dust sits beneath that false base, finer than any garden soil.",
      "thoughtful",
      s(
        c("What was packed beneath the base?", "Display packing \u2014 pumice-like and pale. Certainly not the flowerbeds.", "thoughtful"),
        c("How old is the piece, truly?", "Late medieval in aspiration. Rather more recent in execution.", "angry"),
        c("What was under that false base?", "Object returned; inquiry concluded.", "neutral")
      ),
      s(
        c("Where did that dust travel?", "From the false base to my fingertips, then along the hem to the west panel.", "worried"),
        c("Couldn\u2019t it just be plaster?", "To an untrained eye. The grain deserves magnification.", "suspicious"),
        c("The dust is not important.", "Philistinism noted. We are done.", "angry")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the packing dust from the false base toward the panel.",
        bargain: c("Tell me what was under the false base \u2014 discreetly.", "Hear it gently: the base opened to a compartment, and its dust marks the road I walked to the panel.", "worried"),
        challenge: c("That dust marks a path you\u2019re not owning. Where did it really lead?", "I followed dust, not a plan. Where packing falls is not where guilt lies.", "angry")
      }
    ),
    r(
      "antiquarian-polish",
      "timeline",
      "metal-polish",
      "Why is there waxy polish streaked on your glove and cuff?",
      "Authentication. I test old brass with a pinhead of waxy polish \u2014 it takes the wax differently from a modern plate.",
      "neutral",
      s(
        c("What exactly did you treat?", "A pinhead of polish to one inconspicuous corner of a fitting. No more.", "thoughtful"),
        c("Did you have permission?", "History outranks temporary ownership, within reason.", "suspicious"),
        c("What else did you handle?", "I have stopped discussing it, at least.", "neutral")
      ),
      s(
        c("How did the polish reach you?", "My glove split at the thumb; the streak crossed skin, cuff, and a catalog card.", "worried"),
        c("Couldn\u2019t silver polish match it?", "Close enough to fool a glance. The mix would tell them apart.", "thoughtful"),
        c("No more conservation lessons.", "A merciful end to your education.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare the streak on his card to the polish tin.",
        bargain: c("Let me match your polish to its source \u2014 quietly.", "By all means \u2014 the streak on my card and the tin by the passage share a formula. Nothing to hide there.", "thoughtful"),
        challenge: c("That polish touched more than authentication. What did you wipe?", "I noticed a new hinge on an old saint, detective. Noticing a forgery is not committing a crime.", "angry")
      }
    ),
    r(
      "antiquarian-resin",
      "social",
      "wax-resin",
      "There\u2019s fresh amber resin on your fingers. What\u2019s it from?",
      "A lifted veneer on the reliquary. I bedded it with warm amber restoration resin \u2014 neglect is history\u2019s dullest vandal.",
      "angry",
      s(
        c("How did you set the veneer?", "Warm amber resin, sparingly, beneath the lifted edge. It goes on tacky and holds.", "thoughtful"),
        c("Was the reliquary valuable?", "Culturally, immensely. Financially, ask the ledger worshipper.", "neutral"),
        c("That resin is fresh \u2014 and not just on the relic. Where else?", "The relic and this topic are now sealed.", "neutral")
      ),
      s(
        c("How fresh is that resin?", "Mine went on tonight \u2014 still tacky. The flecks in the old passage are decades cured.", "worried"),
        c("Couldn\u2019t sealing wax look identical?", "Superficially. Age would expose the impostor.", "suspicious"),
        c("I need no provenance lecture.", "Your loss. The lecture concludes.", "angry")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Compare his fresh resin to the old flecks in the passage.",
        bargain: c("Help me date the resin \u2014 I leave the patron unnamed.", "Then note the ages: my resin is hours old, the passage flecks are generations. Time itself parts them.", "thoughtful"),
        challenge: c("That fresh resin isn\u2019t only on the relic. You\u2019re covering a second use.", "My resin is on the relic, hours old. Any flecks in that old passage wear a far older hand than mine.", "angry")
      }
    ),
    r(
      "antiquarian-history",
      "intel",
      void 0,
      "Does this house have any hidden history I should know about?",
      "Its servants once used a narrow route between the public rooms, now hidden behind the paneling.",
      "thoughtful",
      s(
        c("Is that route still usable?", "One panel has fresh scratches around an otherwise old catch.", "suspicious"),
        c("Why does that matter?", "Fresh damage on old wood earns attention.", "angry"),
        c("Which panel?", "That\u2019s as far as I go for now.", "neutral")
      ),
      s(
        c("Where is the scratched panel?", "Beside the landscape whose frame hangs slightly crooked in the west passage.", "thoughtful"),
        c("Couldn\u2019t movers have marked it?", "Possible, though nothing was moved recently that I know of.", "suspicious"),
        c("I\u2019ll ignore the passage.", "As you like.", "neutral")
      )
    ),
    r(
      "antiquarian-ink",
      "timeline",
      "ink-fiber",
      "Why is there blue-black ink staining your fingers?",
      "I catalogue in ink, as one should, and I date every entry to the hour I make it. Pencil is for schoolboys and forgers.",
      "neutral",
      s(
        c("When were you cataloguing tonight?", "On the hour precisely \u2014 the ink and the clock keep each other honest.", "thoughtful"),
        c("Why catalogue during a party?", "Because a piece unrecorded is a piece half-lost. History does not adjourn for canap\xE9s, detective.", "neutral"),
        c("That\u2019s far more ink than an entry needs.", "The nib split across the card and flooded. That is the whole of it; I shall say no more.", "neutral")
      ),
      s(
        c("Where did the flooded ink settle?", "My forefinger and the card\u2019s edge, at the very hour I had inscribed upon it.", "worried"),
        c("Could another writer share that ink?", "Any scribbler could. Ink respects no discipline, sadly, not even mine.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then let it dry, unremarked.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the dated catalog card to the clock stroke.",
        bargain: c("Give me the hour on the card \u2014 I won\u2019t ask for the rest.", "Civilised of you. The card is dated to the chime I wrote it by; ink and hour concur, and neither indicts me.", "thoughtful"),
        challenge: c("You dated that card to cover a minute you can\u2019t account for.", "So I record time meticulously, detective. Scholarship is a habit, not a crime.", "angry")
      }
    ),
    r(
      "antiquarian-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands smell so sharply medicinal?",
      "Conservation solvent \u2014 a spirit I use to lift old varnish. It reeks of the sickroom, but it has never touched a patient, detective.",
      "neutral",
      s(
        c("What were you treating with it?", "A clouded lacquer on a reliquary hinge. The spirit cuts the grime where water would ruin the piece.", "thoughtful"),
        c("Why should I believe it isn\u2019t surgical?", "Because a surgeon\u2019s carbolic and a restorer\u2019s spirit merely share a bite. Their purposes could not differ more.", "neutral"),
        c("That\u2019s a doctor\u2019s antiseptic.", "It is a conservator\u2019s spirit. Trust your nose if you must; the topic is closed.", "neutral")
      ),
      s(
        c("Where did the solvent touch you?", "Fingertip and cuff, where the swab slipped. It lingers loud, the same as carbolic \u2014 yet it is not.", "worried"),
        c("Could it be surgical carbolic instead?", "Test the fluid. Mine dissolves varnish; his cleans wounds. Chemistry will part them at once.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then cease inhaling my materials.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the spirit lifts varnish, not infection.",
        bargain: c("Let me test the bottle \u2014 I won\u2019t call it a surgeon\u2019s.", "Reasonable. Test it \u2014 a restorer\u2019s spirit, not carbolic. Same smell, different job.", "thoughtful"),
        challenge: c("That\u2019s a surgeon\u2019s antiseptic on your sleeve. Explain it.", "Analyse it. Mine strips lacquer; his strips infection. You have mis-attributed the fluid entirely.", "angry")
      }
    ),
    r(
      "antiquarian-wool",
      "social",
      "black-wool",
      "Where did that frayed black wool come from?",
      "My scholar\u2019s coat \u2014 dark, decades old. It caught on a display case in the west passage, where the glass meets a rough brass edge, and shed threads down my sleeve.",
      "neutral",
      s(
        c("What exactly snagged it?", "That rough brass corner where the glass meets the frame. Old weave surrenders a thread at once.", "thoughtful"),
        c("Why wear such an old coat here?", "Sentiment and warmth, detective. A garment, like an antique, improves with documented age.", "neutral"),
        c("That thread is coarser than your coat.", "You haven\u2019t examined my coat, so you can\u2019t say that. I won\u2019t argue a guess.", "neutral")
      ),
      s(
        c("Where did the thread travel after that?", "From the case corner to my elbow to the ledge I steadied a piece upon. A traceable little chain.", "worried"),
        c("Could the thread be another dark coat?", "Entirely possible. Coarse black wool is a poor witness; it accuses everyone and no one.", "suspicious"),
        c("The thread isn\u2019t enough.", "A conclusion of rare good sense.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the display case to his elbow.",
        bargain: c("Show me where the coat snagged and I keep it quiet.", "Very well. Case to elbow to ledge \u2014 the whole short trip, and nothing wrong in it.", "thoughtful"),
        challenge: c("That thread puts you at the west passage case for more than looking.", "Admiring a case, detective. Leaning near glass is not a plot.", "angry")
      }
    ),
    r(
      "antiquarian-perfume",
      "social",
      "floral-perfume",
      "Why does a woman\u2019s perfume cling to your coat?",
      "A guest leaned over my shoulder to look at a piece and left her scent on my coat. Two other people saw her do it.",
      "neutral",
      s(
        c("Who leaned over you?", "A woman looking at the reliquary. She pressed close for a better look.", "thoughtful"),
        c("Do people often crowd you like that?", "When the piece is fine enough, yes. They forget themselves.", "neutral"),
        c("That scent looks worn, not caught.", "It came off her sleeve onto mine. I don\u2019t wear gardenia. We\u2019re done.", "neutral")
      ),
      s(
        c("Where did the perfume settle?", "My shoulder and collar, where she bent to see. Ask the two who watched \u2014 they\u2019ll say the same.", "thoughtful"),
        c("Could you wear the scent yourself?", "Gardenia? Ask anyone who\u2019s sat through one of my lectures.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then stop following it.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the two people who watched her lean over.",
        bargain: c("Name who admired the piece \u2014 I keep it off the record.", "Fair. The two who watched will place her at my shoulder \u2014 her scent, not mine.", "thoughtful"),
        challenge: c("That perfume puts you alone with someone. Who?", "Close to someone looking at a piece, with witnesses. Standing near a person isn\u2019t proof of anything.", "angry")
      }
    ),
    r(
      "antiquarian-powder",
      "room",
      "face-powder",
      "How did ivory powder come to be on your sleeve?",
      "A lady brushed past me at the display and left half her compact on my coat. The passage is narrow; collisions are inevitable.",
      "neutral",
      s(
        c("Who brushed past you?", "A woman hurrying from the gallery. I registered the brush of her more than the face, I confess.", "thoughtful"),
        c("Is that not simply your own powder?", "I use chalk-white whiting for restoration, not ivory on my face. It\u2019s a lady\u2019s powder.", "neutral"),
        c("That powder looks applied, not brushed.", "You reconstruct a fiction from a smudge. I shall not authenticate it.", "neutral")
      ),
      s(
        c("Where did the powder settle?", "My upper sleeve and shoulder \u2014 precisely where a passing arm would meet me.", "worried"),
        c("Could several women wear that shade?", "Several might. Only one wears it heavily enough to bequeath it to strangers.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then let it settle out of the catalogue.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the powder on his sleeve to the compact.",
        bargain: c("Help me find whose compact it is \u2014 quietly.", "Obliging. Match the shade to her compact, not my sleeve; my whiting is chalk-white, not ivory.", "thoughtful"),
        challenge: c("That powder puts you near someone you won\u2019t name. Who?", "Near a careless shoulder, detective. Compare the shade; it is hers, and demonstrably not mine.", "angry")
      }
    ),
    r(
      "antiquarian-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine oil?",
      "I eased a seized antique lock to examine its wards. One drop of light oil and a mechanism two centuries old turned sweetly again.",
      "neutral",
      s(
        c("What lock were you examining?", "A period escutcheon on a cabinet. The wards tell you the maker; a frozen lock tells you nothing.", "thoughtful"),
        c("Why oil someone else\u2019s cabinet?", "To read it, detective. A conservator cannot resist a mechanism begging to be understood.", "neutral"),
        c("That oil went where it shouldn\u2019t.", "You infer a great deal from a slick thumb. I decline to indulge it.", "neutral")
      ),
      s(
        c("Where did the oil end up?", "My thumb and cuff when the bolt sprang. It marks whatever I handle thereafter.", "worried"),
        c("Could that oil be from a blade or a clock?", "The same light oil serves them all. Only its use distinguishes them.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then permit the matter to rust.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him free the lock again and show where the oil went.",
        bargain: c("Show me how the lock freed and I leave the ward alone.", "Gladly. I oil the ward here, the bolt springs there, and the oil catches my thumb \u2014 a scholar\u2019s fix, nothing worse.", "thoughtful"),
        challenge: c("That oil touched more than an old lock. What else did you open?", "An antique lock, detective. Watch me ease it; the oil falls exactly where honest curiosity would leave it.", "angry")
      }
    ),
    r(
      "antiquarian-note",
      "social",
      "torn-note",
      "What are those cramped marks you keep noting down?",
      "Catalogue shorthand \u2014 accession codes, condition notes, a date of examination. I tear off each completed slip as I file it.",
      "suspicious",
      s(
        c("What did the notes record?", "The condition of a piece and the hour I examined it. Dull to you; indispensable to posterity.", "thoughtful"),
        c("Can anyone else read your shorthand?", "A fellow curator, perhaps. To the layman it is a thicket of abbreviations.", "neutral"),
        c("Those are no catalogue notes. Hand them over.", "A scholar\u2019s notes remain a scholar\u2019s. The slip is torn and the topic with it.", "neutral")
      ),
      s(
        c("What became of the torn slip?", "It parted from my folio as I rose; from desk to floor, I did not follow it. Careless of me.", "worried"),
        c("Could the marks pass for something else?", "To a suspicious reader, an accession code resembles a conspiracy.", "thoughtful"),
        c("I will read it myself.", "Then mind you do not mistake a condition note for a confession.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Read one number wrong and let him correct it.",
        bargain: c("Read me the slip plainly \u2014 patron stays unnamed.", "Very well \u2014 but your accession number is transposed. Correct it and you will see it is merely a condition report.", "thoughtful"),
        challenge: c("This note reads like a plot. What are you coding?", "You have misread the code, detective. Restore the digits and your \u201Cplot\u201D becomes a catalogue entry.", "angry")
      }
    ),
    r(
      "antiquarian-vocation",
      "connection",
      void 0,
      "Why give your life to old objects?",
      "They keep their promises. A genuine piece is honest about its age. People and forgeries lie.",
      "thoughtful",
      s(
        c("How did you get started?", "A cracked Roman lamp my grandfather refused to throw away. I\u2019ve been mending neglect ever since.", "thoughtful"),
        c("Do you prefer objects to people?", "Objects don\u2019t disappoint you twice. That recommends them.", "neutral"),
        c("I have other questions.", "Very well. Ask.", "neutral")
      ),
      s(
        c("What would you fix if you could?", "One authentication I signed that I now doubt. A false attribution weighs on me.", "worried"),
        c("What would you never do?", "Knowingly certify a forgery for money. Once would be a mistake. Twice would unmake me.", "suspicious"),
        c("We\u2019re finished here.", "A pity.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 what troubles you tonight?", "A piece I called genuine that I now suspect is not. Correcting that may cost me a great deal.", "worried"),
        challenge: c("What is all this learning hiding?", "A mistaken attribution \u2014 not a motive.", "angry")
      }
    ),
    r(
      "antiquarian-guests",
      "intel",
      void 0,
      "What do you make of the other guests?",
      "A mixed lot. A few are exactly what they seem. Several are clever fakes in good frames.",
      "suspicious",
      s(
        c("Who seems fake?", "One guest handles everything \u2014 and everyone \u2014 a shade too casually.", "thoughtful"),
        c("Do you judge people like objects?", "Wear patterns don\u2019t flatter, whether on silver or on a smile.", "neutral"),
        c("I need a name.", "Names I withhold. Impressions I have plenty of.", "neutral")
      ),
      s(
        c("Who do you like here?", "The curator. She cares for living things the way I care for made ones.", "thoughtful"),
        c("Who bothers you?", "The one who asked the reliquary\u2019s price before its history.", "suspicious"),
        c("That\u2019s enough.", "Then we can stop.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 who worries you most?", "The one who priced a sacred object like a paperweight. People who only see cost frighten me.", "thoughtful"),
        challenge: c("Who are you protecting?", "A pressured patron \u2014 not a culprit.", "angry")
      }
    )
  ],
  chauffeur: [
    r(
      "chauffeur-solvent",
      "room",
      "antiseptic",
      "What\u2019s that sharp smell on your hands?",
      "Motor solvent, sir \u2014 from the tin in my kit. Battery terminal furred up before the rain came in.",
      "neutral",
      s(
        c("What sort of solvent?", "Clear stuff from the motor kit. Bites the nose. Not the doctor\u2019s sort.", "thoughtful"),
        c("Will the car start now?", "Road\u2019s flooded. Starting isn\u2019t leaving.", "neutral"),
        c("That smell is not just the garage. What did it touch?", "Fine. Garage is closed.", "neutral")
      ),
      s(
        c("How did it reach your cuff?", "Bottle kicked when I set it down. Splashed me before I capped it.", "worried"),
        c("Couldn\u2019t that be medical antiseptic?", "Smells close. I\u2019m no chemist, but mine came from a motor tin.", "suspicious"),
        c("That\u2019s enough about the solvent.", "Then we\u2019re done with it.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match his cuff to the motor tin, not the doctor\u2019s shelf.",
        bargain: c("Point me to the tin and I won\u2019t call it a doctor\u2019s.", "Right there on the bench, sir. Same label as my cuff. Nothing off the doctor\u2019s shelf about it.", "thoughtful"),
        challenge: c("That\u2019s a surgeon\u2019s antiseptic on your sleeve. Explain it.", "It\u2019s battery solvent, sir. You smell a workingman and write \u201Cguilt\u201D. Match the tin first.", "angry")
      }
    ),
    r(
      "chauffeur-wool",
      "timeline",
      "black-wool",
      "Where did that black wool thread come from?",
      "My coat, most likely, sir. Black wool, warm and tough \u2014 but the sleeve caught a seat spring and the seam\u2019s been shedding at the wrist ever since.",
      "neutral",
      s(
        c("How bad is that wrist seam?", "Frays a little more every time I reach across the seat. Been trailing threads all evening.", "worried"),
        c("Why dress for work off duty?", "Car trouble doesn\u2019t check the invitation.", "neutral"),
        c("A wrist tear won\u2019t account for all of it.", "Done.", "neutral")
      ),
      s(
        c("Where exactly does your coat shed?", "At the wrist, sir, only the wrist \u2014 where the seat spring caught it. Nowhere near the elbow.", "thoughtful"),
        c("Couldn\u2019t it be another black coat?", "That\u2019s my point. Two coats, two weaves.", "suspicious"),
        c("The thread\u2019s useless.", "Then stop pulling it.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Compare his wrist tear to the coarser elbow thread.",
        bargain: c("Help me clear your coat \u2014 quietly.", "Appreciated, sir. Mine frayed at the wrist on a seat spring; if your thread\u2019s elbow-high and coarser, it can\u2019t be the same coat.", "thoughtful"),
        challenge: c("Your coat left that thread where it shouldn\u2019t be. Own the path.", "Can\u2019t have, sir. Mine sheds at the wrist; if that one\u2019s at the elbow and coarser, look again before you decide.", "angry")
      }
    ),
    r(
      "chauffeur-polish",
      "social",
      "metal-polish",
      "Why is there waxy metal polish on your cuff and glove?",
      "The Bentley\u2019s radiator badge, sir. Butler wanted it bright before the weather turned, so I saw to it out in the garage.",
      "neutral",
      s(
        c("What polish did you use?", "Tin by the garage door. Waxy stuff, smells of pennies and paraffin.", "thoughtful"),
        c("Why polish a car in this storm?", "Job came before the rain. Weather doesn\u2019t cancel chores.", "neutral"),
        c("What else did that polish touch?", "Ask the glasses. I\u2019m done with the motor.", "neutral")
      ),
      s(
        c("How did that polish get onto you?", "No rag, sir. I wiped two fingers in my glove; the split smeared the garage latch and my cuff.", "worried"),
        c("Couldn\u2019t that smear come from silver?", "Could. Same sort of compound. I didn\u2019t touch silver.", "suspicious"),
        c("That\u2019s enough about the badge.", "Then nothing more to say on it.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the polish from the garage tin to the latch.",
        bargain: c("Show me the garage trail and I leave the silver alone.", "This way, sir \u2014 tin, glove, latch, cuff. One trail, all garage. Nothing near the silver.", "thoughtful"),
        challenge: c("That polish matches the silver upstairs. You handled more than a latch.", "Same compound, different job, sir. Follow it from my tin, not from the dining room.", "angry")
      }
    ),
    r(
      "chauffeur-traffic",
      "intel",
      void 0,
      "Who\u2019s been moving through the halls?",
      "Plenty of trips. One guest used the service door twice and pretended not to know it existed.",
      "suspicious",
      s(
        c("How do you know it was the same person?", "Same step. Heel drags on the left when they hurry.", "thoughtful"),
        c("You can tell people by their footsteps?", "Drive long enough, you hear bad bearings.", "neutral"),
        c("Did you see their face?", "I\u2019m not saying. Road closed.", "neutral")
      ),
      s(
        c("When was the second trip?", "After the hall clock chimed, before the next thunderclap.", "thoughtful"),
        c("Couldn\u2019t a servant walk that way?", "Could. Didn\u2019t look like staff shoes.", "suspicious"),
        c("That timing\u2019s too vague.", "Then we\u2019re done.", "neutral")
      )
    ),
    r(
      "chauffeur-ink",
      "timeline",
      "ink-fiber",
      "Why\u2019s there blue-black ink on your fingers?",
      "Route log, sir. I write down every run \u2014 where, when, who \u2014 and mark the hour to the minute. Pen leaked when I logged the last one.",
      "neutral",
      s(
        c("When did you make the last entry?", "On the hour, sir. Clock chimed while I was writing. I log the time to the minute; always have.", "thoughtful"),
        c("Why keep a log off duty?", "Habit. A driver with no record is a driver who takes the blame for other men\u2019s trips.", "neutral"),
        c("That\u2019s more ink than a log needs.", "Nib split. That\u2019s the whole of it. Leave it there.", "neutral")
      ),
      s(
        c("Where did the ink end up?", "Fingers and the page edge, right at the hour I\u2019d just logged. Still wet, sir.", "worried"),
        c("Couldn\u2019t another writer use that ink?", "Plenty could. Ink don\u2019t care whose hand holds the pen.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then we\u2019re done with it, sir.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the log entry to the clock stroke.",
        bargain: c("Give me the hour in the log \u2014 I leave the rest unread.", "Fair, sir. The entry\u2019s dated to the chime I wrote by; ink and hour say the same thing, nothing more.", "thoughtful"),
        challenge: c("You logged that at a minute you\u2019re covering. Which?", "So I keep good time, sir. A careful log\u2019s not a guilty one.", "angry")
      }
    ),
    r(
      "chauffeur-earth",
      "room",
      "fine-earth",
      "Where\u2019d that pale grit on your knees come from?",
      "Under the motor, sir. Something rattled on the axle before the rain, so I went down on the drive to look.",
      "neutral",
      s(
        c("What were you checking under there?", "A loose plate throwing grit. Fine pale stuff off the gravel, drier than garden dirt.", "thoughtful"),
        c("Why crawl under a car in a storm?", "A rattle at speed\u2019s a broken axle waiting to happen, sir. Rain or not, you check it.", "neutral"),
        c("That grit looks indoors, not from a drive.", "Think what you like. I went under the car, I came out gritty. That\u2019s the run.", "neutral")
      ),
      s(
        c("Where did the grit end up?", "Knees, cuffs, the tin I set down. Paler and finer than soil, if you look close, sir.", "worried"),
        c("Couldn\u2019t it match the conservatory dust?", "Close, not the same. Drive grit\u2019s got sand in it; that garden stuff don\u2019t.", "suspicious"),
        c("The grit isn\u2019t helping.", "Then leave it, sir.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Compare his knee grit to the drive gravel and the garden dust.",
        bargain: c("Show me where you went under the motor \u2014 I won\u2019t chase the garden.", "This way, sir. Set my knee-grit by the drive gravel \u2014 matches. The garden stuff\u2019s a different grain.", "thoughtful"),
        challenge: c("That grit came from the conservatory. Your motor story won\u2019t hold.", "Compare it proper, sir. Drive grit\u2019s coarse and sandy; garden dust ain\u2019t. They won\u2019t match.", "angry")
      }
    ),
    r(
      "chauffeur-perfume",
      "social",
      "floral-perfume",
      "Why\u2019s a woman\u2019s perfume on your uniform?",
      "Off the last fare, sir. A lady rode in the back this evening; her scent soaked the seat and my collar with it.",
      "neutral",
      s(
        c("Who was the passenger?", "A guest I ran up from the station before the roads flooded. Perfume like a greenhouse, sir. It lingers.", "thoughtful"),
        c("Do you always smell of your fares?", "When they wear half a bottle, aye. A back seat holds a scent longer than a memory.", "neutral"),
        c("That scent looks worn, not caught.", "A driver in gardenia? No, sir. It came off the seat, off her, not off me.", "neutral")
      ),
      s(
        c("Where did the perfume settle?", "My collar and shoulder, where I leaned back over the seat to shut her door.", "worried"),
        c("Couldn\u2019t you wear the scent yourself?", "Look at me, sir. A man in oil and wool don\u2019t buy French perfume. It isn\u2019t mine.", "suspicious"),
        c("That\u2019s enough about the perfume.", "Then let it air out, sir.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Smell the back seat against his collar.",
        bargain: c("Name the fare and I keep it quiet.", "Right, sir. Smell the back seat \u2014 same gardenia. It came off my passenger, never out of my pocket.", "thoughtful"),
        challenge: c("That perfume puts you alone with a lady. Who?", "Close enough to shut her door, sir. The scent\u2019s on the seat and my collar, not a thing I\u2019d ever wear.", "angry")
      }
    ),
    r(
      "chauffeur-powder",
      "room",
      "face-powder",
      "How\u2019d ivory face powder get on your shoulder?",
      "Same fare, sir. The lady powdered her face in the back and clouded half the cab \u2014 the footman watched her step out. Some of it landed on me.",
      "neutral",
      s(
        c("Who was she, this fare?", "The guest I drove up from the station. Ask the footman where the powder came from.", "thoughtful"),
        c("Isn\u2019t that just dust off your cap?", "Cap dust\u2019s grey, sir. This is ivory \u2014 a lady\u2019s powder, not a driver\u2019s.", "neutral"),
        c("That powder looks pressed on.", "It settled off her puff in my cab. Read it how you want; that\u2019s the truth of it.", "neutral")
      ),
      s(
        c("Where did the powder land?", "My right shoulder, where I turned to answer her. The footman watched the whole handover.", "worried"),
        c("Couldn\u2019t several women wear that shade?", "Maybe, sir. Only one was powdering her face in my back seat tonight.", "suspicious"),
        c("That\u2019s enough about the powder.", "Then we\u2019re done, sir.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the footman who saw the fare.",
        bargain: c("Confirm the fare and I leave her name out of it.", "Fair, sir. The footman\u2019ll place her in my cab; the powder\u2019s off her puff, not my hand.", "thoughtful"),
        challenge: c("That powder puts you near a lady you won\u2019t name. Who?", "Near a fare in my own cab, sir, with the footman watching. That\u2019s a job, not a crime.", "angry")
      }
    ),
    r(
      "chauffeur-oil",
      "timeline",
      "blade-oil",
      "Why are your hands slick with fine oil?",
      "The motor, sir. Out in the garage I oiled a sticky throttle linkage so she\u2019d turn over if the road ever cleared. Light oil, precision stuff.",
      "neutral",
      s(
        c("What exactly did you oil?", "The linkage and a stiff door hinge while I had the can out. A drop does the throttle, a drop does the hinge.", "thoughtful"),
        c("Why bother if nobody\u2019s leaving?", "A driver keeps his motor ready, sir. That\u2019s the whole job, flood or no flood.", "neutral"),
        c("That oil went where it shouldn\u2019t.", "It went where I put it, sir. I don\u2019t answer for where you think it went.", "neutral")
      ),
      s(
        c("Where did the oil travel?", "Can to my thumb to the rag in my back pocket. One trail, all garage, sir.", "worried"),
        c("Couldn\u2019t that oil come from a clock or blade?", "Same light oil, different machine. Follow where it\u2019s been, not what it looks like.", "suspicious"),
        c("The oil\u2019s meaningless.", "Then drop it, sir.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the oil from the motor can to his rag.",
        bargain: c("Show me the garage trail and I leave the house oil alone.", "This way, sir \u2014 can, thumb, rag, linkage. One trail, all mine, and none of it near the house.", "thoughtful"),
        challenge: c("That oil touched something delicate upstairs. What did you free?", "To my own motor, sir. Follow the trail from the garage can; it don\u2019t reach where you\u2019re pointing.", "angry")
      }
    ),
    r(
      "chauffeur-wax",
      "social",
      "wax-resin",
      "Why\u2019s there an amber fleck of wax on your cuff?",
      "A parcel, sir. I was asked to run it out when the roads clear, sealed with wax so nobody opens it on the way. Stick cracked as I pressed it.",
      "suspicious",
      s(
        c("What\u2019s in the parcel?", "Not my business, sir. A driver carries; he doesn\u2019t unwrap. The seal\u2019s the whole point.", "thoughtful"),
        c("Who asked you to seal it?", "A guest who paid in advance and asked no questions be asked back. Common enough in my line.", "neutral"),
        c("That\u2019s no ordinary delivery seal.", "It\u2019s a parcel seal, sir. Believe it or don\u2019t; the parcel stays shut and so do I.", "neutral")
      ),
      s(
        c("How\u2019d the wax get on your cuff?", "Snapped off the stick when I pressed the knot. Warm fleck, straight onto the cuff, sir.", "worried"),
        c("Couldn\u2019t that be an antiquarian\u2019s resin?", "Looks close. Mine\u2019s off a sealing stick, not some relic. Test it.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then leave it be, sir.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have him seal the parcel again and show how the fleck lands.",
        bargain: c("Show me how you sealed it and I leave the parcel unread.", "Right, sir. I press the knot here, the stick cracks there, the fleck hits my cuff. No mystery, just a job.", "thoughtful"),
        challenge: c("That wax sealed something you won\u2019t show me. What was in the parcel?", "To a parcel I was paid to carry, sir. Watch me seal another; the wax breaks the same, proves nothing worse.", "angry")
      }
    ),
    r(
      "chauffeur-note",
      "timeline",
      "torn-note",
      "What are those cramped little marks you keep folding away?",
      "Fares and addresses, sir. My own shorthand \u2014 pickup, drop, time. I tear off each run once it\u2019s done.",
      "suspicious",
      s(
        c("What was on tonight\u2019s note?", "A time and a spot to wait. Somebody wanted a car ready at an hour, sir. That\u2019s all it says.", "thoughtful"),
        c("Can anyone else read your shorthand?", "Another driver, maybe. To the rest it\u2019s scratches and mud.", "neutral"),
        c("Those aren\u2019t fares. Hand it over.", "A driver\u2019s notes stay with the driver, sir. Torn and done.", "neutral")
      ),
      s(
        c("What happened to the torn scrap?", "Slipped out of my glove getting out of the cab. Hand to ground, I couldn\u2019t tell you where, sir.", "worried"),
        c("Could the marks pass for something else?", "To a suspicious man, sir, a pickup time looks like a plot.", "thoughtful"),
        c("I\u2019ll ask whoever booked the car.", "Do, sir. They\u2019ll say the same hour my note does.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Read the pickup time wrong and let him correct it.",
        bargain: c("Read me the run plainly \u2014 I leave the fare unnamed.", "Fair, sir \u2014 but your hour\u2019s wrong; it\u2019s a quarter later. Fix it and you\u2019ll see it\u2019s just a pickup.", "thoughtful"),
        challenge: c("This note reads like a getaway plan. What are you covering?", "You\u2019ve got the hour wrong, sir. Fix the time and your \u201Cplan\u201D is a fare waiting for a car.", "angry")
      }
    ),
    r(
      "chauffeur-standing",
      "connection",
      void 0,
      "What\u2019s it like, being ignored in a room like this?",
      "Restful, mostly, sir. People say things in front of a driver they\u2019d never say to a guest. I hear a lot by being furniture.",
      "thoughtful",
      s(
        c("How did you end up driving?", "War took the job I trained for. A motor\u2019s honest work, and it don\u2019t ask where a man went to school.", "thoughtful"),
        c("Does it bother you, being looked through?", "Some. A man likes to be counted now and then. But the wage clears.", "neutral"),
        c("I have other questions.", "Course, sir.", "neutral")
      ),
      s(
        c("What do you want tonight?", "To be heard as a witness, sir \u2014 not written off as the help. I saw things worth saying.", "worried"),
        c("What won\u2019t you do?", "Take the fall because it\u2019s tidy for the gentry. Done that once. Not again.", "suspicious"),
        c("We\u2019re done here.", "Right, sir.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 what do you want from me?", "To be believed. Give a working man that, and I\u2019ll tell you every road I drove tonight.", "thoughtful"),
        challenge: c("What are you hiding?", "A fare I was paid to keep quiet \u2014 not a crime.", "angry")
      }
    ),
    r(
      "chauffeur-fares",
      "intel",
      void 0,
      "You\u2019ve driven half these guests \u2014 what do you make of them?",
      "You learn a person quick from the back seat, sir. Where they\u2019re soft, where they lie, what they tip when they\u2019re scared.",
      "suspicious",
      s(
        c("Who rode strangely tonight?", "One guest kept looking behind us the whole way up. People do that when they\u2019re running from something.", "thoughtful"),
        c("You judge people by how they tip?", "It don\u2019t lie, sir. Manners in a cab are manners with nobody watching.", "neutral"),
        c("I need a name.", "Then I\u2019m poor company, sir.", "neutral")
      ),
      s(
        c("What would you trust as a real sign?", "A tip too big, sir. Guilty hands pay heavy.", "thoughtful"),
        c("Couldn\u2019t that just be nerves?", "Could, sir. I give you what I saw, not the verdict.", "suspicious"),
        c("That\u2019s enough.", "Then we\u2019re parked, sir.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who should I watch?", "The one who watched the road behind us and overpaid at the door. Fear and money together.", "thoughtful"),
        challenge: c("Whose secret are you keeping?", "A paid fare\u2019s \u2014 not a culprit\u2019s.", "angry")
      }
    )
  ],
  debutante: [
    r(
      "debutante-earth",
      "room",
      "fine-earth",
      "There\u2019s pale grit caught in your slipper. Where did that come from?",
      "The conservatory, I\u2019m afraid. A spilled pot poured powdery grit straight into my slipper as I passed through.",
      "neutral",
      s(
        c("What did it do to your shoes?", "Ruined them. A whole slipper of pale, powdery grit from that toppled pot.", "surprised"),
        c("Were you hiding from someone?", "I prefer \u201Cavoiding a tedious conversation.\u201D Much prettier.", "suspicious"),
        c("You didn\u2019t go in there just for the flowers. What were you doing?", "Oh good. My shoes have suffered quite enough.", "neutral")
      ),
      s(
        c("What did you notice while you were in there?", "A repaired left heel, clicking oddly, all the way to that crooked panel. I followed the sound.", "thoughtful"),
        c("Couldn\u2019t it be dust from an old vase?", "Perhaps. This house sheds nearly as much as its guests.", "neutral"),
        c("The dirt is unhelpful.", "Then let\u2019s not dig any deeper.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Retrace the odd heel from the grit to the panel.",
        bargain: c("Tell me what you saw in there \u2014 off the record.", "Gladly. The grit fell here, an odd repaired heel clicked there \u2014 and both end at that crooked panel.", "thoughtful"),
        challenge: c("That grit puts you at more than flowers. What were you following?", "It ties me behind someone else\u2019s repaired heel. I followed the mess; I didn\u2019t make it.", "angry")
      }
    ),
    r(
      "debutante-perfume",
      "social",
      "floral-perfume",
      "That gardenia scent is awfully strong on you. Where\u2019s it from?",
      "My own atomizer, mostly \u2014 but a friend\u2019s gardenia refill made it far stronger than I meant, and it drenched my scarf.",
      "neutral",
      s(
        c("Why so overpowering?", "Someone had emptied half the bulb. It soaked my scarf on the vanity.", "surprised"),
        c("Was it expensive?", "Expensive enough to pretend the spill was intentional.", "neutral"),
        c("Your scent walked a hall without you. How?", "Already hidden. This topic too.", "neutral")
      ),
      s(
        c("Where were you while your scent was on the move?", "At the card table, before witnesses \u2014 while my perfume wandered a hall without me.", "worried"),
        c("Couldn\u2019t another guest wear gardenia?", "Of course. Taste is not exclusive, sadly.", "neutral"),
        c("That\u2019s enough about the scent.", "Then we can stop discussing it.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Set the scented hall against the card table that kept her seated.",
        bargain: c("Help me prove where you sat \u2014 I won\u2019t spoil the card table.", "Please do. Three players will swear I never left the table while my perfume took its little stroll.", "thoughtful"),
        challenge: c("Your perfume walked that corridor \u2014 and so did you. Own it.", "My perfume did. I was losing at cards in plain view \u2014 the score sheet says so.", "angry")
      }
    ),
    r(
      "debutante-powder",
      "timeline",
      "face-powder",
      "There\u2019s ivory powder spilled across your collar and bag. What\u2019s that from?",
      "My compact slipped while I fixed my face and simply exploded. Ivory across my collar, my bag, the little table by the mirror.",
      "surprised",
      s(
        c("Where did the worst of it go?", "Across my collar, my bag, and the table by the mirror. It went everywhere.", "worried"),
        c("Why fix your face so often?", "Because people ask questions like that.", "angry"),
        c("Powder doesn\u2019t climb onto brass by itself. What happened next?", "Snapped shut. So is the subject.", "neutral")
      ),
      s(
        c("Did anything press through that spilled powder?", "A gloved hand swept it aside and left its seams printed on the brass latch.", "thoughtful"),
        c("Couldn\u2019t that be theatrical makeup?", "It could. Mine has a nicer case.", "neutral"),
        c("I\u2019ve heard enough about cosmetics.", "Thank heavens. Nothing more there.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match the glove seams in the latch powder to her vanity lining.",
        bargain: c("Show me where that powder was pressed \u2014 quietly.", "Then look closely \u2014 the glove seams in that powder aren\u2019t mine, but they pressed my vanity lining too.", "thoughtful"),
        challenge: c("That powder ended up where a hand went searching. Yours?", "A gloved hand searched, and wore my powder off. The seams in it are a stranger\u2019s.", "suspicious")
      }
    ),
    r(
      "debutante-glance",
      "intel",
      void 0,
      "What have you noticed that other people missed?",
      "That two guests swapped keys under the card table while explaining the rules to me.",
      "suspicious",
      s(
        c("What did the keys look like?", "One long and brass, one small and silver. Only the brass one changed hands.", "thoughtful"),
        c("Were you paying attention to the cards?", "I was paying attention to everything. That\u2019s the point.", "neutral"),
        c("Which two, and which key?", "If you insist. I fold.", "neutral")
      ),
      s(
        c("Where did the brass key go?", "Into a left coat pocket, just before its new owner left the room alone.", "thoughtful"),
        c("Couldn\u2019t it have been a coin?", "Coins don\u2019t have teeth. Even I know that.", "angry"),
        c("That exchange is none of my concern.", "Then we\u2019ve nothing else to discuss.", "neutral")
      )
    ),
    r(
      "debutante-ink",
      "timeline",
      "ink-fiber",
      "How did blue-black ink get on your fingers?",
      "I was writing in my little book by the clock. Everyone thinks I doodle hearts \u2014 I was noting the time, actually.",
      "neutral",
      s(
        c("When exactly were you writing?", "Right as the clock struck, silly \u2014 I remember because I dated the page. I do date my pages.", "thoughtful"),
        c("What could you possibly be noting?", "Oh, this and that. A figure, an hour. A girl\u2019s allowed a diary, isn\u2019t she?", "neutral"),
        c("That\u2019s far more ink than a diary needs.", "My pen simply burst. That\u2019s all it is. Do let\u2019s talk of something prettier.", "neutral")
      ),
      s(
        c("Where did the ink end up?", "My fingers and the page corner, right at the hour I\u2019d written down. It quite ruined my glove.", "worried"),
        c("Couldn\u2019t anyone else use that ink?", "Heaps of people, I should think. Ink isn\u2019t exactly a signature.", "suspicious"),
        c("That\u2019s enough about the ink.", "Then let it dry, and me be.", "neutral")
      ),
      {
        revealMechanism: "chronology",
        revealLabel: "Pin the dated page to the clock stroke.",
        bargain: c("Show me the hour on the page \u2014 I leave the rest unread.", "How kind. The page is dated to the very chime \u2014 the ink and the hour agree, and neither of them accuses poor me.", "thoughtful"),
        challenge: c("You dated that page to cover a minute you can\u2019t account for.", "So I keep careful time, detective. A girl who can read a clock isn\u2019t a girl with a plot.", "suspicious")
      }
    ),
    r(
      "debutante-antiseptic",
      "room",
      "antiseptic",
      "Why do your hands smell so sharply medicinal?",
      "Varnish remover, detective. I redid my nails before dinner. It reeks like a hospital, but it\u2019s pure vanity, I promise.",
      "neutral",
      s(
        c("What were you removing, exactly?", "A chipped polish. One does not appear at dinner with a ruined manicure; there are standards, even in a storm.", "thoughtful"),
        c("Why should I think it isn\u2019t the real thing?", "Because a surgeon\u2019s carbolic and my remover only smell alike, silly. One mends nails; one mends people.", "neutral"),
        c("That\u2019s a doctor\u2019s antiseptic.", "It\u2019s acetone, from my vanity case. Believe your nose if you must; I\u2019m quite finished.", "neutral")
      ),
      s(
        c("Where did the remover touch you?", "My fingertips and a cotton pad \u2014 and my cuff, where I was careless. It clings like the surgeon\u2019s, but it isn\u2019t.", "worried"),
        c("Couldn\u2019t it be surgical antiseptic?", "Only to a hurried nose. Sniff it properly and it\u2019s pear-drops, not medicine.", "suspicious"),
        c("That\u2019s enough about the smell.", "Then do stop sniffing my hands, detective.", "neutral")
      ),
      {
        revealMechanism: "contradiction",
        revealLabel: "Show the fluid is nail remover, not carbolic.",
        bargain: c("Let me test it \u2014 I won\u2019t call it a surgeon\u2019s.", "How gallant. Test it \u2014 acetone, not carbolic. They share a sting and absolutely nothing else.", "thoughtful"),
        challenge: c("That\u2019s a surgeon\u2019s antiseptic on your sleeve. Explain it.", "Smell again, detective. Mine takes off polish; his takes off infection. A shared reek isn\u2019t a shared hand.", "suspicious")
      }
    ),
    r(
      "debutante-wool",
      "social",
      "black-wool",
      "Where did those black threads on your shoulders come from?",
      "A gentleman lent me his coat when I got cold on the terrace. Terribly gallant, terribly scratchy \u2014 it shed everywhere.",
      "neutral",
      s(
        c("Which gentleman lent it?", "One who wanted to seem heroic, I expect. The wool snagged on my bracelet the moment he draped it.", "thoughtful"),
        c("Do you often borrow men\u2019s coats?", "When they insist and the terrace is freezing, why not? It\u2019s practically a public service.", "neutral"),
        c("That thread is coarser than any dinner jacket.", "Then it\u2019s his outdoor coat, not his dinner one \u2014 do keep up. The coat went back; we\u2019re finished.", "neutral")
      ),
      s(
        c("Where did the thread come loose?", "At my bracelet clasp and my shoulder, where the collar sat. It followed me back inside, the beastly thing.", "worried"),
        c("Couldn\u2019t the thread be your own wrap?", "My wrap is silk, detective. That coarse black strand is his gallantry, not mine.", "suspicious"),
        c("The thread isn\u2019t enough.", "Then do let go of it, please.", "neutral")
      ),
      {
        revealMechanism: "custody",
        revealLabel: "Follow the thread from the borrowed coat to her bracelet.",
        bargain: c("Point me to the coat and I keep the man\u2019s name out of it.", "How considerate. Coat to bracelet to shoulder \u2014 the whole gallant little journey, and nothing wicked on it.", "thoughtful"),
        challenge: c("That thread puts a man\u2019s coat on you for more than warmth. Whose?", "On me, detective, not the other way about. Borrowing a coat isn\u2019t a crime, however scratchy.", "suspicious")
      }
    ),
    r(
      "debutante-polish",
      "room",
      "metal-polish",
      "Why is there metal polish on your fingers?",
      "My little silver hand-mirror had gone dreadfully dull, so I buffed it before dinner. Vanity is such hard work.",
      "neutral",
      s(
        c("What exactly did you polish?", "The mirror\u2019s back and my compact\u2019s clasp. Both had tarnished in this dreadful damp house.", "thoughtful"),
        c("Do you polish your own silver?", "When the staff are run off their feet, yes. I\u2019m more capable than I look, detective \u2014 most people are.", "neutral"),
        c("What else did you buff?", "A lady never lists her fingerprints. Do let\u2019s move on.", "neutral")
      ),
      s(
        c("Where did the polish transfer?", "To my fingers and the mirror\u2019s back \u2014 just where one holds it up to the light.", "worried"),
        c("Couldn\u2019t that smear be from the big silver?", "It\u2019s the same waxy stuff, I suppose. Only where it\u2019s been could tell you which.", "thoughtful"),
        c("That\u2019s enough about the polish.", "Then do let it tarnish in peace.", "neutral")
      ),
      {
        revealMechanism: "bait",
        revealLabel: "Tell her she polished the mirror\u2019s handle \u2014 see if she corrects you.",
        bargain: c("Help me quietly and I keep your name out of it.", "How sweet. I only did the back and the clasp, never the handle \u2014 whoever touched the big silver was far less tidy than me.", "thoughtful"),
        challenge: c("That polish matches the dining-room silver. You handled more than a mirror.", "I shined a hand-mirror, detective. Follow the smear to my vanity, not to a platter I never lifted.", "suspicious")
      }
    ),
    r(
      "debutante-oil",
      "timeline",
      "blade-oil",
      "Why are your fingers slick with fine oil?",
      "My music box jammed mid-waltz \u2014 so vexing. A drop of oil on the little movement and it played again. I\u2019m quite the mechanic, really.",
      "surprised",
      s(
        c("What did you oil, exactly?", "The comb and the cylinder, where it had seized. One drop, no more; the movement is dreadfully delicate.", "thoughtful"),
        c("Where would a girl learn to oil a movement?", "From taking things apart when the grown-ups thought I was napping. I was a frightful child, detective.", "neutral"),
        c("That oil went somewhere it shouldn\u2019t.", "It went on my music box, silly. I shan\u2019t apologise for mending my own things.", "neutral")
      ),
      s(
        c("Where did the oil end up?", "My thumb and cuff when the cylinder sprang free. It marks whatever I touch afterward, annoyingly.", "worried"),
        c("Couldn\u2019t that oil be from a lock or a clock?", "The very same little oil, I expect. All the delicate things drink it.", "suspicious"),
        c("That\u2019s enough about the oil.", "Then let it dry, do.", "neutral")
      ),
      {
        revealMechanism: "reconstruction",
        revealLabel: "Have her free the music box again and show where the oil went.",
        bargain: c("Show me how the box freed and I leave the comb alone.", "Watch, then \u2014 I oil the comb here, the cylinder springs there, and the oil catches my thumb. No mystery, just a stubborn waltz.", "thoughtful"),
        challenge: c("That oil touched more than a music box. What else did you free?", "A music box, detective. Watch me mend it; the oil falls exactly where a clever girl would leave it.", "suspicious")
      }
    ),
    r(
      "debutante-wax",
      "social",
      "wax-resin",
      "Why is there an amber fleck of wax on your glove?",
      "I sealed a letter with wax \u2014 a private one. Everyone reads a girl\u2019s post if she lets them, so I don\u2019t let them.",
      "suspicious",
      s(
        c("Who was the letter for?", "A friend who\u2019ll tell you the very same, if you ask nicely. The seal keeps it mine until she opens it.", "thoughtful"),
        c("Do girls still bother with sealing wax?", "The careful ones do. A licked envelope can be steamed; hot wax leaves a scar if anyone tries.", "neutral"),
        c("That\u2019s no ordinary letter wax.", "It\u2019s perfectly ordinary, detective \u2014 I simply have secrets, like everyone. The letter stays sealed.", "neutral")
      ),
      s(
        c("How did the wax reach your glove?", "It snapped off the stick as I pressed the seal; a warm fleck caught my glove. My friend has the matching half.", "worried"),
        c("Couldn\u2019t that fleck be an antiquarian\u2019s resin?", "To a careless eye, perhaps. Mine came off a sealing stick \u2014 ask the friend who holds the letter.", "thoughtful"),
        c("That\u2019s enough about the wax.", "Then do stop peering at my glove.", "neutral")
      ),
      {
        revealMechanism: "corroboration",
        revealLabel: "Ask the friend who holds the matching letter.",
        bargain: c("Name who has the letter \u2014 I keep it quiet.", "How decent. My friend holds it; her seal is twin to the fleck on my glove. Ask her and it all agrees.", "thoughtful"),
        challenge: c("That wax sealed something you won\u2019t show me. What was in the letter?", "To a letter, detective. Ask my friend; her half matches mine. A sealed secret isn\u2019t a sealed guilt.", "suspicious")
      }
    ),
    r(
      "debutante-note",
      "timeline",
      "torn-note",
      "What are those cramped little marks you keep hiding?",
      "Card scores, detective. I keep a running tally \u2014 who owes what, who cheats \u2014 and tear off each sheet once it\u2019s done. My hand\u2019s dreadful, so it looks like scribbles.",
      "suspicious",
      s(
        c("What was on tonight\u2019s tally?", "Names, hands, a running total. Everyone thinks I lose at cards; I keep better books than they know.", "thoughtful"),
        c("Can anyone else read your marks?", "Hardly. I made the shorthand up myself so nosy people can\u2019t. Present company included.", "neutral"),
        c("Those aren\u2019t card scores. Hand them over.", "A girl\u2019s tally is a girl\u2019s business. I tore that sheet ages ago.", "neutral")
      ),
      s(
        c("What happened to the torn sheet?", "It slipped from my little bag between hands. From my lap to the floor, I couldn\u2019t say where it went.", "worried"),
        c("Could the marks pass for something else?", "To a suspicious mind, a card score looks like a conspiracy. Yours seems the suspicious sort.", "thoughtful"),
        c("I\u2019ll compare it to the card table myself.", "Do. You\u2019ll find it matches the score sheet exactly, detective.", "neutral")
      ),
      {
        revealMechanism: "comparison",
        revealLabel: "Match her shorthand to the card table\u2019s score sheet.",
        bargain: c("Let me match it to the scores \u2014 I leave the table alone.", "How gallant. Lay my marks beside the table\u2019s score sheet; they\u2019re the same hand, the same night \u2014 nothing hidden.", "thoughtful"),
        challenge: c("That note reads like a scheme. What are you really tallying?", "Compare it to the card scores, detective. It matches them exactly. A tally isn\u2019t a plot.", "suspicious")
      }
    ),
    r(
      "debutante-underestimated",
      "connection",
      void 0,
      "People underestimate you, don\u2019t they?",
      "Marvellously useful. People say anything in front of a girl they think can\u2019t count. I can count beautifully.",
      "thoughtful",
      s(
        c("When did you learn to use that?", "The first time a grown man discussed money over my head as if I were a lamp. I\u2019ve been listening ever since.", "thoughtful"),
        c("Doesn\u2019t it hurt, being dismissed?", "It did once. Now it\u2019s useful. Let them think me silly \u2014 silly girls hear the most.", "neutral"),
        c("I have real questions.", "Everyone wants the real me eventually.", "neutral")
      ),
      s(
        c("What are you fighting for?", "My own money, and the right to say what I saw without a guardian deciding it for me.", "worried"),
        c("What will you never allow?", "To be handed off, hushed up, and filed away. Not again.", "suspicious"),
        c("We are finished here.", "Are we? How you all love ending things for me.", "neutral")
      ),
      {
        bargain: c("Off the record \u2014 what do you want tonight?", "Control. Of my accounts, my accusation, my future. Give me that and I\u2019ll give you the truth I\u2019ve been counting.", "thoughtful"),
        challenge: c("What are you hiding under all this?", "Papers \u2014 not a crime. Protecting my own evidence isn\u2019t guilt.", "suspicious")
      }
    ),
    r(
      "debutante-watchers",
      "intel",
      void 0,
      "What have you seen tonight?",
      "Almost everything. When people believe you\u2019re decorative, they stop performing. That\u2019s when they get interesting.",
      "suspicious",
      s(
        c("Who forgot you were watching?", "One guest counted the exits every time the thunder hid it. People only map escapes when they mean to use one.", "thoughtful"),
        c("Do you watch everyone?", "I notice things. Spying sounds so grubby.", "neutral"),
        c("I need a name.", "Then you\u2019ll find me disappointing tonight.", "neutral")
      ),
      s(
        c("What would you swear to?", "A whispered figure changing hands under the card table. I was dealt in; I saw the whole trade.", "thoughtful"),
        c("Could you have misread it?", "I might. I give you what I saw, not what it means.", "suspicious"),
        c("That\u2019s enough.", "Pity. I was rather enjoying being asked.", "neutral")
      ),
      {
        bargain: c("Quietly \u2014 who should I watch?", "The one who counts the doors. Nervous people fidget; that one was planning.", "thoughtful"),
        challenge: c("Who are you protecting?", "Myself, and my own papers.", "suspicious")
      }
    )
  ]
};

// src/game/authoredDialogue.ts
var AUTHORED_DIALOGUE_BY_ARCHETYPE = {
  ...PACK_A,
  ...PACK_B,
  ...PACK_C
};

// src/game/dialogue/closingsA.ts
var CLOSINGS_A = {
  // ── Society Columnist ──────────────────────────────────────────────
  "columnist-ink": {
    resolve: { line: "Yes \u2014 same ink on my hand and on that torn corner. I was taking notes during the row. That\u2019s all it means.", emotion: "thoughtful" },
    noReveal: { line: "Hold them together and they won\u2019t match. My ink stays on my own cuffs. Look at someone else.", emotion: "neutral" }
  },
  "columnist-perfume": {
    resolve: { line: "The scent sat heavier on the glove than on my wrist. I walked the house with it; I never pretended otherwise.", emotion: "neutral" },
    noReveal: { line: "That wasn\u2019t my bottle. My gardenia stayed on my wrist. Someone else left that trail.", emotion: "neutral" }
  },
  "columnist-shorthand": {
    resolve: { line: "Twelve-ten, half a name, part of a room \u2014 that\u2019s what\u2019s on the scrap. Be careful what you do with it.", emotion: "worried" },
    noReveal: { line: "That time isn\u2019t mine. My notes kept their own hours tonight. Try another clock.", emotion: "neutral" }
  },
  "columnist-antiseptic": {
    resolve: { line: "Ask whoever handed me the bottle \u2014 they watched me clean the cut. It means I bleed. Nothing worse.", emotion: "neutral" },
    noReveal: { line: "Nobody lent me a bottle tonight, so nobody will say they did. Try a guest who actually smells of medicine.", emotion: "suspicious" }
  },
  "columnist-earth": {
    resolve: { line: "Pot, then hem, then hand, then the bench. I knelt in the conservatory. That trail stops there.", emotion: "thoughtful" },
    noReveal: { line: "That grit never touched my hem. I stayed on the carpets. Someone else did the kneeling.", emotion: "neutral" }
  },
  "columnist-wool": {
    resolve: { line: "My wrap is silk. That coarse strand came off the coat he put round my shoulders. That\u2019s the whole of it.", emotion: "neutral" },
    noReveal: { line: "Compare it to my wrap \u2014 silk doesn\u2019t shed coarse wool. No coat sat on these shoulders tonight.", emotion: "neutral" }
  },
  "columnist-polish": {
    resolve: { line: "I touched the lid to read the engraving, not the base. Curiosity leaves a smear. It isn\u2019t a confession.", emotion: "thoughtful" },
    noReveal: { line: "I didn\u2019t handle anyone\u2019s silver tonight. There\u2019s nothing of mine on that clasp.", emotion: "neutral" }
  },
  "columnist-powder": {
    resolve: { line: "Mine\u2019s the lighter shade. Hers is the heavier cloud that landed on my sleeve. Match them and you\u2019ll see.", emotion: "neutral" },
    noReveal: { line: "That shade isn\u2019t mine. My compact stayed shut. Dust someone else\u2019s sleeve.", emotion: "neutral" }
  },
  "columnist-oil": {
    resolve: { line: "The lighter jammed when the clock struck. I oiled it then. A bad habit with good timing \u2014 nothing more.", emotion: "neutral" },
    noReveal: { line: "My lighter didn\u2019t jam tonight, and I didn\u2019t oil anything at your hour. Try another mechanism.", emotion: "suspicious" }
  },
  "columnist-wax": {
    resolve: { line: "You saw it \u2014 I press, the stick snaps, a fleck lands on my cuff. I seal my notes. That\u2019s the habit.", emotion: "thoughtful" },
    noReveal: { line: "I sealed nothing that matches your amber. That fleck came off someone else\u2019s stick.", emotion: "neutral" }
  },
  "columnist-society": {
    warm: { line: "Since you asked kindly \u2014 watch the quiet man near the hall. He went pale when that door slammed, and he\u2019s been eyeing the exits ever since.", emotion: "thoughtful" },
    measured: { line: "I\u2019ll give you this much: the nervous looks started after the row by the hall. Names I keep.", emotion: "neutral" },
    hostile: { line: "Bully me and you\u2019ll get the society page and nothing under it. We\u2019re finished.", emotion: "angry" }
  },
  "columnist-origins": {
    warm: { line: "Honestly? I stay because the right sentence, printed at the right hour, can protect someone who can\u2019t protect themselves. I\u2019ve spiked more stories than I\u2019ve run.", emotion: "thoughtful" },
    measured: { line: "An eye I inherited, a mercy I didn\u2019t, and a lot of secrets kept for people who couldn\u2019t afford to lose them.", emotion: "neutral" },
    hostile: { line: "You didn\u2019t come for my life story. Ask me something useful.", emotion: "neutral" }
  },
  "columnist-guests": {
    warm: { line: "Off the record: the composed ones worry me more than the ones who cry. Grief has manners. A rehearsed calm has a reason.", emotion: "thoughtful" },
    measured: { line: "One never forgave me a paragraph. Two go quiet when I walk in. Make of that what you can.", emotion: "neutral" },
    hostile: { line: "Mistake my smile for stupidity again and the guest list closes. I protect the powerless \u2014 learn the difference.", emotion: "angry" }
  },
  // ── Retired Surgeon ────────────────────────────────────────────────
  "surgeon-antiseptic": {
    resolve: { line: "Carbolic, one splash, matched to the dressing in the library. I bound a cut. That\u2019s all it proves.", emotion: "neutral" },
    noReveal: { line: "My cuff won\u2019t match that dressing. I bound no cut in the library tonight. The smell is an old habit on cloth.", emotion: "neutral" }
  },
  "surgeon-oil": {
    resolve: { line: "One drop from my vial \u2014 hand, hinge, sleeve. The case is mine. That doesn\u2019t make me anything worse.", emotion: "thoughtful" },
    noReveal: { line: "My case stayed shut. Whatever oiled your mechanism, it wasn\u2019t my hand.", emotion: "neutral" }
  },
  "surgeon-wax": {
    resolve: { line: "My lapel and their half of the seal match. I posted a letter. What it said stays private.", emotion: "neutral" },
    noReveal: { line: "That seal isn\u2019t mine. I posted no such letter tonight. You\u2019re chasing someone else\u2019s correspondence.", emotion: "neutral" }
  },
  "surgeon-ink": {
    resolve: { line: "The page is dated to the hour I wrote it. Precision is my habit \u2014 not an admission of anything.", emotion: "neutral" },
    noReveal: { line: "That hour isn\u2019t mine. I wrote nothing that touches your scene. Precision clears me here.", emotion: "neutral" }
  },
  "surgeon-earth": {
    resolve: { line: "Under a lens the grains are even \u2014 settling powder from my case, not garden soil. A careless look puts me in the conservatory. A careful one doesn\u2019t.", emotion: "thoughtful" },
    noReveal: { line: "Put them side by side and the grains don\u2019t match. I wasn\u2019t in the conservatory. That dust came off someone else.", emotion: "thoughtful" }
  },
  "surgeon-wool": {
    resolve: { line: "Hold the strand against my cuff. Different weave. Same colour isn\u2019t the same coat.", emotion: "neutral" },
    noReveal: { line: "That thread isn\u2019t from my coat. Set it down and look elsewhere.", emotion: "neutral" }
  },
  "surgeon-polish": {
    resolve: { line: "Handle, then thumb, then cloth \u2014 one blade I couldn\u2019t leave dull. The trail stops there. It doesn\u2019t reach any plate.", emotion: "thoughtful" },
    noReveal: { line: "I didn\u2019t touch the silver. Follow that smear and it never passes through my hands.", emotion: "neutral" }
  },
  "surgeon-perfume": {
    resolve: { line: "Ask the woman I steadied \u2014 she\u2019ll tell you the same. Her scent stayed on my coat. I kept her from falling. That\u2019s all.", emotion: "neutral" },
    noReveal: { line: "I didn\u2019t steady anyone tonight, and no perfume landed on this lapel. You\u2019re thinking of someone else.", emotion: "neutral" }
  },
  "surgeon-powder": {
    resolve: { line: "She tipped, the compact burst, the puff hit my sleeve. You saw how it happens. Faulty clasp \u2014 not me.", emotion: "neutral" },
    noReveal: { line: "I was nowhere near a spilling compact. That powder landed on another shoulder.", emotion: "neutral" }
  },
  "surgeon-note": {
    resolve: { line: "Read it again \u2014 that\u2019s a dose, not an admission. Clinical notes. Copy them carefully if you must.", emotion: "thoughtful" },
    noReveal: { line: "That mark isn\u2019t my shorthand. Mine stayed in my case. Someone else tore that scrap.", emotion: "neutral" }
  },
  "surgeon-observation": {
    warm: { line: "Since you ask carefully: watch the guest who went still after the corridor quieted. Stillness that costs effort is worth more than a tremor. Watch \u2014 don\u2019t accuse.", emotion: "thoughtful" },
    measured: { line: "One guest\u2019s hands started shaking the moment the row ended. That\u2019s the observation. Draw your own conclusion.", emotion: "neutral" },
    hostile: { line: "I won\u2019t name someone from a symptom. This consultation is over.", emotion: "angry" }
  },
  "surgeon-retirement": {
    warm: { line: "There\u2019s one note I revised years ago, when I was too tired to be honest. I\u2019ve wanted to write one true line ever since. Perhaps tonight I will.", emotion: "worried" },
    measured: { line: "I stopped before the errors outnumbered the cures. A tired hand is an honest one\u2019s worst enemy.", emotion: "thoughtful" },
    hostile: { line: "I didn\u2019t offer my memoirs. We\u2019re finished.", emotion: "neutral" }
  },
  "surgeon-diagnosis": {
    warm: { line: "Plainly: it\u2019s the one who doesn\u2019t flinch who troubles me. Practised calm is a symptom. I\u2019ll name a condition, never a culprit.", emotion: "thoughtful" },
    measured: { line: "Fear has a look tonight, and one guest wears it too evenly. That\u2019s all I\u2019ll say.", emotion: "neutral" },
    hostile: { line: "I won\u2019t turn bedside observation into an accusation. Good night.", emotion: "angry" }
  },
  // ── Greenhouse Curator ─────────────────────────────────────────────
  "curator-antiseptic": {
    resolve: { line: "Sulphur wash from the plant sprayer \u2014 not medicine, not motor oil. I treated an orchid. That\u2019s the work.", emotion: "thoughtful" },
    noReveal: { line: "I mixed no wash tonight. Whatever sharp smell you\u2019ve got, it isn\u2019t from me.", emotion: "neutral" }
  },
  "curator-earth": {
    resolve: { line: "The grit runs from my hem toward the study vent, where someone swapped a root ball. It leads to a searched pot \u2014 not to me as the culprit.", emotion: "neutral" },
    noReveal: { line: "That trail doesn\u2019t reach me. I swapped no root ball. The dust settled on other hems.", emotion: "neutral" }
  },
  "curator-note": {
    resolve: { line: "A date, some initials, and 12:10 \u2014 and the cable copy agrees. It\u2019s a payment noted down, not a plot.", emotion: "worried" },
    noReveal: { line: "My shorthand doesn\u2019t match that cable. I recorded no payment tonight. Those marks are someone else\u2019s.", emotion: "neutral" }
  },
  "curator-ink": {
    resolve: { line: "The plant label is dated to the hour I wrote it. Careful record-keeping. Nothing that should follow me further.", emotion: "neutral" },
    noReveal: { line: "That hour isn\u2019t on any label of mine. The ink kept someone else\u2019s time.", emotion: "neutral" }
  },
  "curator-wool": {
    resolve: { line: "Cabinet nail, then my shoulder, then the pot I carried. My wrap brushed past. Passing a cabinet isn\u2019t a plot.", emotion: "thoughtful" },
    noReveal: { line: "My wrap snagged on nothing tonight. That thread walked a path I never did.", emotion: "neutral" }
  },
  "curator-polish": {
    resolve: { line: "I brightened the grips on the brass \u2014 name-plates and sprayers \u2014 never the silver. Whoever handled the plate was less careful than I.", emotion: "neutral" },
    noReveal: { line: "I polished no silver tonight. There\u2019s no smear of mine on that plate.", emotion: "neutral" }
  },
  "curator-perfume": {
    resolve: { line: "Smell my hands \u2014 soil and sap under it. The gardenia came off the woman who hugged me at the door. Not my bottle.", emotion: "thoughtful" },
    noReveal: { line: "My hands smell of soil, not gardenia. That perfume never rode on me. Follow it to whoever wears it.", emotion: "thoughtful" }
  },
  "curator-powder": {
    resolve: { line: "I don\u2019t wear ivory. Match the shade to her compact \u2014 she brushed past me in the doorway.", emotion: "neutral" },
    noReveal: { line: "I\u2019ve never carried ivory powder. No one dusted this shoulder tonight. That cloud landed elsewhere.", emotion: "neutral" }
  },
  "curator-oil": {
    resolve: { line: "I freed the vent \u2014 turn the gear, the ratchet springs, oil on my thumb. Garden work. That\u2019s where it landed.", emotion: "thoughtful" },
    noReveal: { line: "I didn\u2019t oil any vent tonight. My thumb\u2019s clean of it. Someone else\u2019s hand left that mark.", emotion: "neutral" }
  },
  "curator-wax": {
    resolve: { line: "The sealed cutting\u2019s right there, and the under-gardener held the graft. Garden wax on a rose join \u2014 nothing hidden.", emotion: "neutral" },
    noReveal: { line: "Ask the under-gardener \u2014 I grafted nothing tonight. No wax on my sleeve matches yours.", emotion: "neutral" }
  },
  "curator-growth": {
    warm: { line: "One figure crossed on a wet sole just as the clock chimed. The stride wasn\u2019t a servant\u2019s. I can\u2019t give you a name \u2014 only the moment.", emotion: "thoughtful" },
    measured: { line: "A wet sole squeaked twice, timed to the chime. What grew from that is yours to trace.", emotion: "neutral" },
    hostile: { line: "I won\u2019t name someone I never saw clearly. We\u2019re done.", emotion: "angry" }
  },
  "curator-calling": {
    warm: { line: "What I\u2019m afraid of: someone lets the rarest plants wither to make a point. Protect the living things and you have my help.", emotion: "worried" },
    measured: { line: "One sick fern I refused to give up on. It lived. I\u2019ve been outnumbered by green things ever since.", emotion: "thoughtful" },
    hostile: { line: "Don\u2019t confuse care for plants with guilt. Mind the roots on your way out.", emotion: "angry" }
  },
  "curator-company": {
    warm: { line: "The one who asked what my orchid would fetch frightens me. People who only see price are capable of a great deal.", emotion: "thoughtful" },
    measured: { line: "One leans away from the light instead of toward it. In a plant that means rot. In a person, secrets.", emotion: "neutral" },
    hostile: { line: "I protect living things, not the guilty. Don\u2019t confuse the two. We\u2019re finished.", emotion: "neutral" }
  }
};

// src/game/dialogue/closingsB.ts
var CLOSINGS_B = {
  // ── Stage Magician ─────────────────────────────────────────────────
  "magician-wool": {
    resolve: { line: "The strand goes from that brass latch to my seam to the tailor\u2019s ticket. My coat caught at the cabinet. I was reaching for a paper \u2014 nothing worse.", emotion: "thoughtful" },
    noReveal: { line: "That thread won\u2019t match my coat. I shed nothing on your latch. Some other dark sleeve left it.", emotion: "neutral" }
  },
  "magician-powder": {
    resolve: { line: "Same ivory, same cracked compact as the print on the switch. I dusted a lamp for the effect. That\u2019s the trick \u2014 not a confession.", emotion: "neutral" },
    noReveal: { line: "Hold that print against my compact \u2014 different powder, different clasp. Mine never touched your switch.", emotion: "neutral" }
  },
  "magician-oil": {
    resolve: { line: "You saw it \u2014 one drop on the false back, the spring gives. I oiled a prop. The hands are mine; that\u2019s all the oil says.", emotion: "thoughtful" },
    noReveal: { line: "My spring took its one drop and kept it. Whoever oiled your mechanism wasn\u2019t me.", emotion: "neutral" }
  },
  "magician-ink": {
    resolve: { line: "The card\u2019s inked to the chime I timed the trick against. Punctual stagecraft. Not a plot.", emotion: "neutral" },
    noReveal: { line: "That hour isn\u2019t on my card. Blue-black is common ink \u2014 time a different pen.", emotion: "neutral" }
  },
  "magician-antiseptic": {
    resolve: { line: "It\u2019s spirit-gum solvent, not carbolic. I peeled a false moustache. Same smell, different job.", emotion: "neutral" },
    noReveal: { line: "Test it \u2014 stage solvent, not medicine. Go find a more medical guest.", emotion: "suspicious" }
  },
  "magician-earth": {
    resolve: { line: "My palm matches the grip tin. The garden grit doesn\u2019t. I dust coins for a clean vanish \u2014 I wasn\u2019t in any flowerbed.", emotion: "thoughtful" },
    noReveal: { line: "My chalk is finer than that soil. No flowerbed clung to my hands. Look at someone else\u2019s knees.", emotion: "thoughtful" }
  },
  "magician-polish": {
    resolve: { line: "I buff the inner curve of the rings, where I grip \u2014 not the plate. Whoever handled the silver was clumsier than I.", emotion: "suspicious" },
    noReveal: { line: "I didn\u2019t touch any plate. My polish stays on my rings. Try another pair of hands.", emotion: "neutral" }
  },
  "magician-perfume": {
    resolve: { line: "Ask the room \u2014 they watched the volunteer take the bouquet. Her scent stayed on my sleeve. A trick in front of witnesses isn\u2019t a secret meeting.", emotion: "neutral" },
    noReveal: { line: "Nobody took a bouquet from me tonight. That gardenia never landed on my sleeve. Follow it to whoever wears it.", emotion: "neutral" }
  },
  "magician-wax": {
    resolve: { line: "Same every time \u2014 press the seal, the stick cracks, a fleck jumps to my cuff. A sealed prediction. The words inside stay mine.", emotion: "thoughtful" },
    noReveal: { line: "I pressed no seal that matches your amber. That fleck came off someone else\u2019s stick.", emotion: "thoughtful" }
  },
  "magician-note": {
    resolve: { line: "Palm, then pocket, then the floor \u2014 that\u2019s where the cue card went. A running order, not a plot.", emotion: "neutral" },
    noReveal: { line: "I dropped no cue card near your scene. Those marks came from another performer\u2019s hand.", emotion: "neutral" }
  },
  "magician-sightline": {
    warm: { line: "Watch the quiet hand, not the loud one. A ring caught the lamp by the side door while everyone turned toward a dropped tray. I can\u2019t give you the face \u2014 but the misdirection was real.", emotion: "thoughtful" },
    measured: { line: "The noise by the door was cover. Someone walked through it while you were meant to look elsewhere. Whose hand stays behind the curtain.", emotion: "neutral" },
    hostile: { line: "I won\u2019t accuse anyone from a flash of lamplight. We\u2019re finished.", emotion: "angry" }
  },
  "magician-craft": {
    warm: { line: "Honestly: there\u2019s a name that belongs on my finest trick and isn\u2019t there. I mean to put it right before morning.", emotion: "worried" },
    measured: { line: "Faster hands, a borrowed idea, and applause I never quite earned. That\u2019s as much method as I give away free.", emotion: "neutral" },
    hostile: { line: "You didn\u2019t come for a conjuror\u2019s memoirs. Ask something with a lock on it, or we\u2019re done.", emotion: "neutral" }
  },
  "magician-audience": {
    warm: { line: "Watch the one whose hands are too still. Real calm breathes. That stillness is rehearsed \u2014 and rehearsed calm is hiding something.", emotion: "thoughtful" },
    measured: { line: "One guest checks a pocket the way an amateur checks a hidden card. Guilt has terrible technique. Whose pocket, you catch yourself.", emotion: "neutral" },
    hostile: { line: "I read methods, not people. This performance is over.", emotion: "angry" }
  },
  // ── War Correspondent ──────────────────────────────────────────────
  "correspondent-ink": {
    resolve: { line: "The nib went through the page when the gallery door slammed. The hour\u2019s on the draft. Hearing something through a door isn\u2019t doing it.", emotion: "thoughtful" },
    noReveal: { line: "My draft doesn\u2019t match that slam. Clock a different pen to your door.", emotion: "neutral" }
  },
  "correspondent-wool": {
    resolve: { line: "My sleeve seam matches the fibre on that latch. I was in the west passage following someone. Watching a man isn\u2019t the same as touching him.", emotion: "neutral" },
    noReveal: { line: "Different weave. My coat caught nothing on that latch. Count the strand to another dark coat.", emotion: "neutral" }
  },
  "correspondent-note": {
    resolve: { line: "My shorthand lines up with her coded reply \u2014 time, gallery, the envelope. That much I\u2019ll stand behind. The initials stay torn away.", emotion: "worried" },
    noReveal: { line: "Nothing of mine answers that coded reply. Those torn marks belong in another notebook.", emotion: "neutral" }
  },
  "correspondent-antiseptic": {
    resolve: { line: "Field kit on my cuff, not the surgeon\u2019s carbolic. I cleaned a cut. Same smell, different bottle.", emotion: "neutral" },
    noReveal: { line: "Mine\u2019s a soldier\u2019s bottle and it never touched your scene. Trace the medicinal smell to another sleeve.", emotion: "neutral" }
  },
  "correspondent-earth": {
    resolve: { line: "I went low by the glass to watch the drive. Grit on the knees from the sill. Watching \u2014 not digging.", emotion: "thoughtful" },
    noReveal: { line: "That grit doesn\u2019t match where I knelt. The grains you\u2019re after came from somewhere I never was.", emotion: "neutral" }
  },
  "correspondent-polish": {
    resolve: { line: "Flask cap, lighter, thumb, rag in my pocket. My kit. It never reaches the dining-room plate.", emotion: "neutral" },
    noReveal: { line: "I cleaned my own flask and lighter, not the house silver. Follow that smear elsewhere.", emotion: "neutral" }
  },
  "correspondent-perfume": {
    resolve: { line: "Two people passed while a frightened source held on too long. Ask them. Her scent stayed; her name won\u2019t.", emotion: "worried" },
    noReveal: { line: "Nobody held onto me in that corridor. No gardenia on this coat. That scent isn\u2019t mine to explain.", emotion: "neutral" }
  },
  "correspondent-powder": {
    resolve: { line: "Match the shade to her compact, not my face. Someone clipped me in a doorway, moving fast. That\u2019s all.", emotion: "neutral" },
    noReveal: { line: "No one brushed me in a doorway. I\u2019ve never carried ivory powder. Dust another sleeve.", emotion: "neutral" }
  },
  "correspondent-oil": {
    resolve: { line: "Typewriter jammed on the hour. One drop on the rail. I fixed a machine \u2014 punctual repair isn\u2019t a motive.", emotion: "thoughtful" },
    noReveal: { line: "My carriage jammed at a different hour. Clock a different machine.", emotion: "neutral" }
  },
  "correspondent-wax": {
    resolve: { line: "Amber, not black \u2014 mind your notes. Sealing wax over a dispatch flap. Tied to an envelope, nothing worse.", emotion: "suspicious" },
    noReveal: { line: "No seal of mine cracked tonight. Bait a different reporter.", emotion: "neutral" }
  },
  "correspondent-exits": {
    warm: { line: "One guest waited, checked both corridors, then moved when the clock struck \u2014 limp for three steps, none after. That\u2019s not a stroll. I can\u2019t give you the face. I\u2019ll swear to the movement.", emotion: "thoughtful" },
    measured: { line: "Most drifted. One moved with purpose after the chime. I verified that much. The name isn\u2019t mine to file yet.", emotion: "neutral" },
    hostile: { line: "I named a man too fast once. Never again. This dispatch is closed.", emotion: "angry" }
  },
  "correspondent-beat": {
    warm: { line: "I burned a source once to make the copy sing. Someone under this roof trusted me after that. I don\u2019t get to fail twice.", emotion: "worried" },
    measured: { line: "If you write a thing down straight, the lie has a harder time standing. That\u2019s kept me on the road longer than sense would.", emotion: "neutral" },
    hostile: { line: "I didn\u2019t offer war stories. Ask me something with a fact in it, or we\u2019re done.", emotion: "neutral" }
  },
  "correspondent-map": {
    warm: { line: "Half the alibis here are load-bearing lies. Watch whoever tells theirs too smoothly \u2014 truth fumbles the order.", emotion: "thoughtful" },
    measured: { line: "Too many exits, too few honest ones. One movement\u2019s still unverified. I\u2019ll leave you the rest.", emotion: "neutral" },
    hostile: { line: "I count movements, not culprits. The map\u2019s filed. We\u2019re finished.", emotion: "angry" }
  },
  // ── Estate Accountant ──────────────────────────────────────────────
  "accountant-ink": {
    resolve: { line: "The altered zero won\u2019t match the carbon copy. I posted a figure I was ordered to post. A forced hand isn\u2019t a free one.", emotion: "worried" },
    noReveal: { line: "My carbon balances clean. I flooded no margin at your figure. That entry belongs to another clerk.", emotion: "neutral" }
  },
  "accountant-polish": {
    resolve: { line: "I polished the grip, never the base. Inventory on a moved candlestick. Whoever handled it left the base alone.", emotion: "suspicious" },
    noReveal: { line: "I polished no silver tonight. My hands kept to the ledgers. Charge that smear to someone else.", emotion: "neutral" }
  },
  "accountant-oil": {
    resolve: { line: "One drop \u2014 rail, key, clasp. I freed a stuck adding machine. That\u2019s the whole sum.", emotion: "neutral" },
    noReveal: { line: "My machine kept its oil. Follow that bead to a different mechanism.", emotion: "neutral" }
  },
  "accountant-antiseptic": {
    resolve: { line: "Mine dissolves a figure on paper. His cleans a wound. Same sting, different work. An erased error on my cuff \u2014 nothing more.", emotion: "neutral" },
    noReveal: { line: "My fluid never touched your scene. Charge the carbolic to a more surgical guest.", emotion: "neutral" }
  },
  "accountant-earth": {
    resolve: { line: "My cuff matches the pounce-pot on my desk, not the flowerbed. I was drying a page. Not kneeling in the conservatory.", emotion: "thoughtful" },
    noReveal: { line: "Desk powder, not garden grit. That coarser dust settled on someone else\u2019s knees.", emotion: "thoughtful" }
  },
  "accountant-wool": {
    resolve: { line: "Cabinet edge, worn elbow, the ledger I carried up. I was in the cellar with the accounts. That\u2019s as far as the thread goes.", emotion: "neutral" },
    noReveal: { line: "My suit snagged on nothing down there. Coarse black wool is common \u2014 book it to another coat.", emotion: "neutral" }
  },
  "accountant-perfume": {
    resolve: { line: "Two people watched her lean over my figures. Ask them. Her scent stayed on my collar. I don\u2019t wear gardenia.", emotion: "neutral" },
    noReveal: { line: "Nobody leaned over my books tonight. No gardenia on this collar. The perfume isn\u2019t mine.", emotion: "neutral" }
  },
  "accountant-powder": {
    resolve: { line: "She set the compact down, snatched it back, the lid sprang, powder across my page. Her clasp. Not my hand.", emotion: "thoughtful" },
    noReveal: { line: "No compact burst over my ledger. That powder scattered on someone else\u2019s account.", emotion: "neutral" }
  },
  "accountant-wax": {
    resolve: { line: "Stamped and dated on the hour \u2014 wax and clock agree. A sealed account. A punctual stamp isn\u2019t a confession.", emotion: "neutral" },
    noReveal: { line: "I stamped no envelope at your hour. Date a different seal to that minute.", emotion: "neutral" }
  },
  "accountant-note": {
    resolve: { line: "Move the decimal \u2014 your total\u2019s off. It\u2019s a private tally, a running balance. Read right, a subtotal isn\u2019t a threat.", emotion: "suspicious" },
    noReveal: { line: "That tally was never mine. No torn strip fell from my folio. Those figures are another hand\u2019s.", emotion: "neutral" }
  },
  "accountant-ledger": {
    warm: { line: "A late charge was posted twice, then one copy lifted without initials. The cabinet was locked before dinner and open after a guest left the study. I won\u2019t name them. The entry is true.", emotion: "thoughtful" },
    measured: { line: "One charge posted twice, one copy quietly removed. Slips add ink; they don\u2019t remove pages. Draw your own conclusion.", emotion: "neutral" },
    hostile: { line: "I report access, not guilt. The book\u2019s closed.", emotion: "angry" }
  },
  "accountant-ledgerlife": {
    warm: { line: "A family that promised much and posted nothing taught me figures don\u2019t lie. But I signed one account that only balanced on paper, and it\u2019s cost me sleep for years. I mean to settle it.", emotion: "worried" },
    measured: { line: "People revise their stories. A column of figures doesn\u2019t. I learned young which to trust.", emotion: "neutral" },
    hostile: { line: "I didn\u2019t open my life for you. Ask something that appears in a book, or we\u2019re done.", emotion: "neutral" }
  },
  "accountant-audit": {
    warm: { line: "Watch whoever spends against a windfall they haven\u2019t earned. Anticipated money makes people reckless \u2014 and reckless people tidy records that never needed tidying.", emotion: "thoughtful" },
    measured: { line: "Someone reversed a charge that already balanced. Names follow figures. Work the figures and I needn\u2019t point.", emotion: "neutral" },
    hostile: { line: "You want names without the numbers that earn them. That\u2019s backwards. We\u2019re finished.", emotion: "angry" }
  }
};

// src/game/dialogue/closingsC.ts
var CLOSINGS_C = {
  // ── Jazz Vocalist ──────────────────────────────────────────────────
  "vocalist-perfume": {
    resolve: { line: "My scarf sat folded in its case the whole set. The gardenia turned up in a hall I never walked. Scent travels \u2014 I didn\u2019t.", emotion: "thoughtful" },
    noReveal: { line: "My gardenia stayed in its case. Whoever left that trail in the hall, it wasn\u2019t me.", emotion: "neutral" }
  },
  "vocalist-powder": {
    resolve: { line: "My ivory spilled on the dressing table. Someone else pressed a card edge into it on that door. My powder \u2014 not my hand at the keyhole.", emotion: "neutral" },
    noReveal: { line: "That door\u2019s powder isn\u2019t my shade. Mine stayed on my own collar. Someone else pressed that door.", emotion: "neutral" }
  },
  "vocalist-wax": {
    resolve: { line: "Something with teeth sat on my grip wax while I wasn\u2019t looking \u2014 a brass key, from the shape. The wax took the impression. That doesn\u2019t mean I did.", emotion: "worried" },
    noReveal: { line: "My wax is for a stubborn clasp, not a key. Whatever impression you\u2019re chasing, it isn\u2019t in my tin.", emotion: "neutral" }
  },
  "vocalist-ink": {
    resolve: { line: "I inked the score margin when the clock chimed. Same hour, same stain. Keeping time isn\u2019t a crime.", emotion: "neutral" },
    noReveal: { line: "That hour isn\u2019t on my charts. My ink marked my own tempo. Try another pen.", emotion: "neutral" }
  },
  "vocalist-antiseptic": {
    resolve: { line: "Throat wash \u2014 menthol and honey. It stings like carbolic and isn\u2019t. I warmed up my voice. That\u2019s all.", emotion: "thoughtful" },
    noReveal: { line: "No carbolic touched this scarf. Mine\u2019s for a sore throat. That medicinal smell belongs to steadier hands.", emotion: "neutral" }
  },
  "vocalist-earth": {
    resolve: { line: "Palm matches my grip tin. Garden soil doesn\u2019t. I dust my hands for the mic stand \u2014 I wasn\u2019t in the conservatory.", emotion: "neutral" },
    noReveal: { line: "My chalk and that garden grit won\u2019t match. The pale dirt came off someone else\u2019s knees.", emotion: "neutral" }
  },
  "vocalist-wool": {
    resolve: { line: "Doorframe to my shoulder to the chair I draped the stole on. It brushed a splintered frame. Passing a door isn\u2019t a plot.", emotion: "thoughtful" },
    noReveal: { line: "That strand never reaches my stole. Some other frayed coat brushed that hall.", emotion: "neutral" }
  },
  "vocalist-polish": {
    resolve: { line: "I shined the mic stand and the front of my locket \u2014 not the silver upstairs. Whoever handled the plate was messier than me.", emotion: "neutral" },
    noReveal: { line: "There\u2019s nothing of mine on that silver. My polish stops at my stand and my locket.", emotion: "neutral" }
  },
  "vocalist-oil": {
    resolve: { line: "Stuck music-case latch \u2014 oil here, spring there, slick on my thumb. An honest fix. Nowhere past my case.", emotion: "thoughtful" },
    noReveal: { line: "I didn\u2019t free whatever you\u2019re pointing at. My thumb\u2019s only slick from my own case lid.", emotion: "neutral" }
  },
  "vocalist-note": {
    resolve: { line: "Ask the guest who requested the tune \u2014 same hour my shorthand keeps. A song request. Nothing darker.", emotion: "neutral" },
    noReveal: { line: "No one asked me for that tune. That scrap isn\u2019t my hand.", emotion: "neutral" }
  },
  "vocalist-ear": {
    warm: { line: "The humming moved from the side hall toward the stairs and cut off when another guest turned the corner. Someone was covering their nerves with my tune. Be careful where that leads.", emotion: "thoughtful" },
    measured: { line: "A door on the offbeat, hurried shoes, a melody sung too fast. That much is true. The name I think stays with me.", emotion: "neutral" },
    hostile: { line: "Corner me and you\u2019ll get silence. I hear things \u2014 I don\u2019t hand them to a man swinging at me.", emotion: "angry" }
  },
  "vocalist-road": {
    warm: { line: "I keep singing so a friend who once kept me singing never has to go quiet. I\u2019ve lost rooms before I\u2019d lose her.", emotion: "worried" },
    measured: { line: "The work follows the money, and the money leads to colder rooms than I came up in. There\u2019s a friend I look after. Beyond that, my past is mine.", emotion: "neutral" },
    hostile: { line: "You didn\u2019t come for my life story. Push again and this number\u2019s over.", emotion: "angry" }
  },
  "vocalist-room": {
    warm: { line: "Trust the breath before a lie \u2014 it catches every time. The one who worries me holds a false calm too long. Watch that one. Don\u2019t swing.", emotion: "thoughtful" },
    measured: { line: "One guest laughs a half-beat late, like they\u2019re listening for something under the music. Make of that what you can.", emotion: "neutral" },
    hostile: { line: "I read a room to keep people safe, not to hand you a name to bruise. Good night.", emotion: "angry" }
  },
  // ── Antiquarian ────────────────────────────────────────────────────
  "antiquarian-earth": {
    resolve: { line: "Pale packing dust under the reliquary\u2019s false base \u2014 on my fingertips, then along my hem toward the west panel. I handled the piece. That\u2019s where I walked. Nothing more.", emotion: "worried" },
    noReveal: { line: "I handled no such reliquary tonight. That dust marks someone else\u2019s path to the panel.", emotion: "neutral" }
  },
  "antiquarian-polish": {
    resolve: { line: "The streak on my catalog card matches the tin by the passage. I tested a hinge that looked too new. Noticing a forgery isn\u2019t a crime.", emotion: "neutral" },
    noReveal: { line: "My authentication wax doesn\u2019t match that tin. Whatever polished your fitting came from a different pot.", emotion: "neutral" }
  },
  "antiquarian-resin": {
    resolve: { line: "My resin is hours old and still tacky. Those passage flecks are years cured. I mended a veneer tonight \u2014 not old mischief.", emotion: "thoughtful" },
    noReveal: { line: "I mended no veneer tonight. That old amber answers to an older hand than mine.", emotion: "thoughtful" }
  },
  "antiquarian-ink": {
    resolve: { line: "I date every catalog card as I write it. Ink and hour match. Careful scholarship \u2014 not an indictment.", emotion: "neutral" },
    noReveal: { line: "That hour isn\u2019t on my cards. The ink points elsewhere.", emotion: "neutral" }
  },
  "antiquarian-antiseptic": {
    resolve: { line: "Mine lifts old varnish. His cleans a wound. Same sting, different job. I was clearing clouded lacquer.", emotion: "thoughtful" },
    noReveal: { line: "My solvent strips lacquer, not infection. The medicinal trace you want is a surgeon\u2019s, not a scholar\u2019s.", emotion: "neutral" }
  },
  "antiquarian-wool": {
    resolve: { line: "Display case corner, then my elbow, then the ledge I steadied a piece on. I leaned over glass to look. That isn\u2019t a charge.", emotion: "neutral" },
    noReveal: { line: "My coat snagged on nothing tonight. Some other dark sleeve leaned where you\u2019re looking.", emotion: "neutral" }
  },
  "antiquarian-perfume": {
    resolve: { line: "Two people saw her lean over my shoulder to look at the piece. The scent came off her sleeve, not mine. Standing close proves nothing against me.", emotion: "neutral" },
    noReveal: { line: "Nobody leaned on my shoulder tonight, and I don\u2019t wear gardenia. Whatever scent you\u2019re chasing isn\u2019t from me.", emotion: "neutral" }
  },
  "antiquarian-powder": {
    resolve: { line: "Match it to her compact \u2014 mine is chalk-white whiting, never ivory. She brushed past in a narrow passage. That\u2019s as far as it goes.", emotion: "thoughtful" },
    noReveal: { line: "I don\u2019t carry ivory powder. No compact brushed this coat. That cloud settled on another shoulder.", emotion: "neutral" }
  },
  "antiquarian-oil": {
    resolve: { line: "I oiled a seized lock \u2014 ward, bolt, oil on my thumb. Curiosity about an old mechanism. Nothing else.", emotion: "thoughtful" },
    noReveal: { line: "My case stayed shut. Whatever lock you\u2019re tracing, my hand never freed it.", emotion: "neutral" }
  },
  "antiquarian-note": {
    resolve: { line: "You\u2019ve got the accession number wrong \u2014 fix the last digits and it\u2019s a condition report, not a plot. An examination. Nothing worse.", emotion: "neutral" },
    noReveal: { line: "That scrap isn\u2019t mine. My catalogue notes stayed in my folio. You\u2019re reading another hand.", emotion: "neutral" }
  },
  "antiquarian-history": {
    warm: { line: "There\u2019s a servants\u2019 route behind the paneling. One panel has fresh scratches around an old catch, beside the crooked landscape. Old wood freshly marked \u2014 that deserves attention.", emotion: "thoughtful" },
    measured: { line: "The house kept a concealed passage, and one catch shows recent use it shouldn\u2019t. I note the damage. I don\u2019t invent the hand behind it.", emotion: "neutral" },
    hostile: { line: "I won\u2019t name a hand I never saw on that panel. The tour is over.", emotion: "angry" }
  },
  "antiquarian-vocation": {
    warm: { line: "I once signed my name to a piece that wasn\u2019t what I claimed. I\u2019ve wanted to correct that line ever since. Perhaps tonight I finally can.", emotion: "worried" },
    measured: { line: "A genuine piece is honest about its age. People and forgeries lie. I\u2019ve spent a life mending neglect. What weighs on me beyond that stays put for now.", emotion: "thoughtful" },
    hostile: { line: "I didn\u2019t offer my memoirs. Ask me about an object, or ask me nothing.", emotion: "neutral" }
  },
  "antiquarian-guests": {
    warm: { line: "The one who asked the reliquary\u2019s price before its history frightens me. People who only see cost are capable of a great deal.", emotion: "thoughtful" },
    measured: { line: "One guest handles everything \u2014 and everyone \u2014 a shade too casually. Careless hands. Read that as you like.", emotion: "neutral" },
    hostile: { line: "I appraise objects, not suspects. I shield a pressured patron, not a wrongdoer. Don\u2019t confuse them again.", emotion: "angry" }
  },
  // ── Off-Duty Chauffeur ─────────────────────────────────────────────
  "chauffeur-solvent": {
    resolve: { line: "Same label as the tin on the bench, sir. Battery solvent, not the doctor\u2019s shelf. Working hands \u2014 that\u2019s all.", emotion: "neutral" },
    noReveal: { line: "My cuff answers the garage tin, not the surgery. Whoever left that antiseptic, it wasn\u2019t me.", emotion: "neutral" }
  },
  "chauffeur-wool": {
    resolve: { line: "Mine frayed at the wrist on a seat spring. If your thread\u2019s elbow-high and coarser, it can\u2019t be my coat.", emotion: "thoughtful" },
    noReveal: { line: "Wrist tear, finer weave \u2014 that latch thread\u2019s a different coat. Look to another man\u2019s sleeve.", emotion: "neutral" }
  },
  "chauffeur-polish": {
    resolve: { line: "Tin, glove, garage latch, cuff. One trail, all garage. My hand on the badge \u2014 not the silver upstairs.", emotion: "neutral" },
    noReveal: { line: "That polish trail ends at the garage door. The smear upstairs came off someone else.", emotion: "neutral" }
  },
  "chauffeur-ink": {
    resolve: { line: "Log entry dated to the chime I wrote by. A careful driver\u2019s record. That doesn\u2019t make me guilty of anything.", emotion: "neutral" },
    noReveal: { line: "My log doesn\u2019t match your hour. That stain was another man\u2019s pen.", emotion: "neutral" }
  },
  "chauffeur-earth": {
    resolve: { line: "Knee grit matches the drive gravel, not the garden. I was under the motor. Not in the conservatory.", emotion: "thoughtful" },
    noReveal: { line: "Drive grit is coarse and sandy. That garden dust isn\u2019t. I wasn\u2019t on my knees indoors.", emotion: "neutral" }
  },
  "chauffeur-perfume": {
    resolve: { line: "Smell the back seat \u2014 same gardenia as my collar. Came off my fare when I shut her door. A man in oil and wool doesn\u2019t buy French scent.", emotion: "neutral" },
    noReveal: { line: "No gardenia rode with me tonight. That perfume isn\u2019t off my collar.", emotion: "neutral" }
  },
  "chauffeur-powder": {
    resolve: { line: "Ask the footman \u2014 he watched her powder her face and step out of my cab. I held the door. That\u2019s the job.", emotion: "neutral" },
    noReveal: { line: "No powdered lady rode in my cab tonight. That face powder came off someone else\u2019s fare.", emotion: "neutral" }
  },
  "chauffeur-oil": {
    resolve: { line: "Can, thumb, rag, throttle linkage. All garage. Ties me to my own motor \u2014 that\u2019s the whole of it.", emotion: "thoughtful" },
    noReveal: { line: "That oil never left the garage with me. Whatever you\u2019re chasing, someone else oiled it.", emotion: "neutral" }
  },
  "chauffeur-wax": {
    resolve: { line: "Press the knot, stick cracks, fleck on the cuff. Same every time. I was paid to carry a sealed parcel. That\u2019s the job.", emotion: "neutral" },
    noReveal: { line: "I pressed no wax tonight. That fleck broke off another man\u2019s stick.", emotion: "neutral" }
  },
  "chauffeur-note": {
    resolve: { line: "Your hour\u2019s wrong \u2014 it\u2019s a quarter later. Fix it and it\u2019s a fare waiting on a car, not a getaway. Booked isn\u2019t guilty.", emotion: "thoughtful" },
    noReveal: { line: "That scrap isn\u2019t mine. My fares stay in my own shorthand.", emotion: "neutral" }
  },
  "chauffeur-traffic": {
    warm: { line: "One guest used the service door twice and played dumb about it. Same step both times \u2014 left heel drags when they hurry. Second trip after the hall clock, before the next thunder. That\u2019s what I heard.", emotion: "thoughtful" },
    measured: { line: "Service door twice, left heel dragging, second run after the chime. The face I won\u2019t swear to. Vague\u2019s better than wrong.", emotion: "neutral" },
    hostile: { line: "I won\u2019t point at a gentleman so the driver becomes the tidy answer later. I\u2019ve been that once. Not again.", emotion: "angry" }
  },
  "chauffeur-standing": {
    warm: { line: "What I want is to be believed. Give a working man that, and I\u2019ll tell you every road I drove tonight.", emotion: "thoughtful" },
    measured: { line: "People talk in front of a driver like he\u2019s furniture. I hear plenty. I\u2019ll tell a man who\u2019ll credit it.", emotion: "neutral" },
    hostile: { line: "If I\u2019m only the help to you, the help\u2019s got nothing to say. Engine off.", emotion: "angry" }
  },
  "chauffeur-fares": {
    warm: { line: "Watch the one who eyed the road behind us the whole way up, then overpaid at the door. Fear and money together \u2014 that\u2019s worth reading.", emotion: "thoughtful" },
    measured: { line: "You learn a person from the back seat. One rode looking backward the whole way. I won\u2019t name him for you.", emotion: "neutral" },
    hostile: { line: "A man who paid for my quiet on a trip hasn\u2019t bought me for worse. We\u2019re parked.", emotion: "angry" }
  },
  // ── Debutante ──────────────────────────────────────────────────────
  "debutante-earth": {
    resolve: { line: "Grit spilled here, an odd repaired heel clicked there, both end at that crooked panel. I followed the mess. I didn\u2019t make it.", emotion: "thoughtful" },
    noReveal: { line: "That path never crosses mine. My slippers stayed in the card room. Someone else\u2019s shoes tracked the conservatory.", emotion: "neutral" }
  },
  "debutante-perfume": {
    resolve: { line: "Three players will swear I never left the card table. My scent wandered the hall without me. The gardenia went \u2014 I didn\u2019t.", emotion: "neutral" },
    noReveal: { line: "I never rose from the table, and my bottle stayed capped. Some other woman perfumed that hall.", emotion: "neutral" }
  },
  "debutante-powder": {
    resolve: { line: "Glove seams in the latch powder match the ones pressed into my vanity lining \u2014 same stranger\u2019s hand, not mine. My powder\u2019s on the brass. Their hand spread it.", emotion: "thoughtful" },
    noReveal: { line: "That isn\u2019t even my shade. My compact spilled on my collar, nowhere near the latch.", emotion: "neutral" }
  },
  "debutante-ink": {
    resolve: { line: "I dated the page to the chime. Ink and hour agree. A girl who keeps time isn\u2019t a girl with a plot.", emotion: "neutral" },
    noReveal: { line: "My diary marked a different minute. That stain kept someone else\u2019s hour.", emotion: "neutral" }
  },
  "debutante-antiseptic": {
    resolve: { line: "It\u2019s acetone \u2014 pear-drops, not medicine. I redid a chipped nail. Same sting as carbolic, different bottle.", emotion: "thoughtful" },
    noReveal: { line: "Vanity acetone, not a surgeon\u2019s bottle. That antiseptic clings to steadier hands than mine.", emotion: "neutral" }
  },
  "debutante-wool": {
    resolve: { line: "He lent me his coat on the terrace. It snagged on my bracelet and shed all over my shoulders. His wool on me \u2014 not me somewhere I shouldn\u2019t be.", emotion: "neutral" },
    noReveal: { line: "I borrowed no coat tonight. My wrap is silk. That wool belongs to someone else.", emotion: "neutral" }
  },
  "debutante-polish": {
    resolve: { line: "Back and clasp of my hand-mirror \u2014 never the handle, never the big silver. Get that right.", emotion: "neutral" },
    noReveal: { line: "I polished nothing tonight. Your smear belongs to some other tidy hand.", emotion: "neutral" }
  },
  "debutante-oil": {
    resolve: { line: "Stubborn music-box comb \u2014 oil here, cylinder springs, slick on my thumb. A waltz I mended. Nothing cleverer.", emotion: "thoughtful" },
    noReveal: { line: "My music box never jammed. Whatever you\u2019re tracing, a cleverer hand oiled it.", emotion: "neutral" }
  },
  "debutante-wax": {
    resolve: { line: "Ask my friend \u2014 she has the letter, and her seal matches the fleck on my glove. A sealed letter. A girl\u2019s secret isn\u2019t a girl\u2019s guilt.", emotion: "neutral" },
    noReveal: { line: "I sealed no letter tonight. There\u2019s no fleck on my glove to match. That wax hardened on someone else\u2019s secret.", emotion: "neutral" }
  },
  "debutante-note": {
    resolve: { line: "My marks match the card table\u2019s score sheet \u2014 same hand, same night. A tally. Not a scheme.", emotion: "thoughtful" },
    noReveal: { line: "That scrawl isn\u2019t mine. My tally stayed in my bag. Someone else scratched that note.", emotion: "neutral" }
  },
  "debutante-glance": {
    warm: { line: "Two guests swapped a key under the card table while explaining the rules to me. Long brass one, into a left coat pocket, just before its new owner left alone. I saw the whole of it.", emotion: "thoughtful" },
    measured: { line: "A brass key changed hands under the table during cards. Where it went after, I\u2019ll say when I\u2019m sure you\u2019ll use it kindly.", emotion: "neutral" },
    hostile: { line: "Bully a girl who can count and you\u2019ll get pretty nothing. We\u2019re finished.", emotion: "angry" }
  },
  "debutante-underestimated": {
    warm: { line: "I\u2019m fighting for my own money and the right to say what I saw. Give me that, and I\u2019ll give you the truth I\u2019ve been counting all night.", emotion: "worried" },
    measured: { line: "People say anything in front of a girl they think can\u2019t count. I count beautifully. I\u2019m after what\u2019s mine.", emotion: "neutral" },
    hostile: { line: "Smile, nod, be filed away \u2014 not tonight. If that\u2019s your tone, we\u2019re done.", emotion: "suspicious" }
  },
  "debutante-watchers": {
    warm: { line: "Watch the one who counted the exits every time the thunder covered it. People only count the doors when they mean to use one.", emotion: "thoughtful" },
    measured: { line: "One guest mapped the exits under the thunder. A figure changed hands under the card table. I give you what I saw, not what it means.", emotion: "neutral" },
    hostile: { line: "Press me like that and you\u2019ll get the decorative version and nothing else.", emotion: "suspicious" }
  }
};

// src/game/dialogue/closings.ts
var CLOSINGS_BY_ROUTE = {
  ...CLOSINGS_A,
  ...CLOSINGS_B,
  ...CLOSINGS_C
};

// src/game/dialogue/asidesA.ts
var ASIDES_A = {
  columnist: [
    pa(
      "columnist-aside-pen",
      "connection",
      "That pen of yours\u2014does it ever leave your hand?",
      "Rarely, darling. A columnist without her pen is a duchess without her jewels\u2014technically still herself, but why gamble on it?",
      "thoughtful",
      [
        rep("It suits you. What was your first byline?", "A wedding notice I made scandalous entirely by accident. They never forgave me, and I have never once looked back.", "thoughtful", 1),
        rep("A tool of the trade, then.", "A weapon of the trade, sweetheart. Tools mend things; I do the opposite for a living.", "neutral"),
        rep("Vanity, more like.", "Call it vanity if it comforts you. It still writes rather faster than you ask questions.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "columnist-aside-storm",
      "survival",
      "How are you finding the storm shutting us all in together?",
      "Marvellous, professionally speaking. Nothing loosens a tongue quite like a locked door and a low fire.",
      "neutral",
      [
        rep("You seem calmer than most of them.", "I have sat through worse rooms than this one, darling. A storm is only weather with ambition.", "thoughtful", 1),
        rep("Being shut in with strangers doesn\u2019t trouble you?", "Strangers are merely sources I have not gotten round to interviewing yet.", "neutral"),
        rep("You are enjoying this far too much.", "Guilty. Discomfort is where all the good sentences come to live.", "neutral")
      ]
    ),
    pa(
      "columnist-aside-friend",
      "social",
      "Is there anyone under this roof you\u2019d call a real friend?",
      "Friendship is a luxury my profession discourages, though I confess a weakness for the singer.",
      "thoughtful",
      [
        rep("Why the singer, of all people?", "She performs honesty better than most people manage the genuine article. I do respect a fine performance.", "thoughtful", 1),
        rep("And everyone else here?", "Acquaintances, sources, and one or two who suddenly need the far side of the room when I arrive.", "neutral"),
        rep("So you trust no one at all.", "I trust everyone to be precisely as self-interested as I am. It has never once let me down.", "suspicious")
      ]
    ),
    pa(
      "columnist-aside-ambition",
      "intel",
      "What would you write, if you could write absolutely anything?",
      "One true page about the people who buy silence by the yard. I have the names; I have simply never had the nerve for all of them at once.",
      "worried",
      [
        rep("Maybe tonight is the night for nerve.", "Perhaps. Kindness is a dangerous thing to show a columnist, darling\u2014I may well hold you to it.", "thoughtful", 1),
        rep("Names are cheap without any proof.", "Which is precisely why I collect both, and spend neither one carelessly.", "neutral"),
        rep("Talk is cheap. Prove any of it.", "In time. I do not open the good drawer for a raised voice, sweetheart.", "angry", 0, 1)
      ]
    )
  ],
  surgeon: [
    pa(
      "surgeon-aside-hands",
      "connection",
      "You favour your hands very carefully. An old injury?",
      "Habit, not injury. A surgeon\u2019s hands are his instruments; I keep them still the way you keep your pistol dry.",
      "neutral",
      [
        rep("Decades of steadiness. Impressive.", "Thirty-eight years, precisely. Precision is the one vanity I still permit myself.", "thoughtful", 1),
        rep("Just professional habit, then.", "Just habit. Read nothing further into it, detective.", "neutral"),
        rep("Or you are hiding a tremor.", "I am not. But you are welcome to watch for one\u2014you will be waiting a very long while.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "surgeon-aside-cold",
      "survival",
      "This house is bitterly cold. Does it trouble you at all?",
      "Cold is clarifying. It slows the pulse and sharpens the attention\u2014useful, if thoroughly unpleasant.",
      "neutral",
      [
        rep("A clinician even beside the fire.", "One does not retire the eye simply because one has retired the scalpel.", "thoughtful", 1),
        rep("You take the discomfort stoically.", "Complaint mends nothing. I gave up complaining about the weather decades ago.", "neutral"),
        rep("Nothing rattles you in the slightest.", "Little that a raised voice can produce, detective.", "neutral")
      ]
    ),
    pa(
      "surgeon-aside-case",
      "intel",
      "Why keep that instrument case within arm\u2019s reach all evening?",
      "Reflex. A man spends a career being the one they send for; the habit rather outlives the calling.",
      "worried",
      [
        rep("Old duty is hard to set down.", "It is. There is a strange comfort in being ready for a need that may never come.", "thoughtful", 1),
        rep("Just an old habit, then.", "Old habit, and nothing inside you have not already inventoried.", "neutral"),
        rep("Or you expect to need it.", "I expect nothing. I merely prefer not to be caught unready.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "surgeon-aside-temperance",
      "social",
      "You\u2019ve refused every glass tonight. Temperance?",
      "Discipline. I learned young that a clear head is the very last thing a man can afford to pour away.",
      "neutral",
      [
        rep("A rare restraint in this company.", "This company would benefit from rather more of it, though I would never dream of saying so aloud.", "thoughtful", 1),
        rep("Each to their own, I suppose.", "Precisely. I judge no one\u2019s glass but my own.", "neutral"),
        rep("Afraid of what you might say?", "Afraid of nothing I would say. Only of saying it imprecisely.", "neutral")
      ]
    )
  ],
  curator: [
    pa(
      "curator-aside-hands",
      "connection",
      "There\u2019s soil worked deep into your hands. It won\u2019t scrub out?",
      "I stopped trying years ago. Loam under the nails is a gardener\u2019s wedding ring\u2014you wear it, or you were never truly married to the work.",
      "thoughtful",
      [
        rep("That is rather lovely, honestly.", "Plants are honest company. They thrive or they fail, and they never once pretend otherwise.", "thoughtful", 1),
        rep("An occupational stain, then.", "An occupational loyalty. There is a difference, if you care to see it.", "neutral"),
        rep("Convenient camouflage for other stains.", "Everything on my hands grew from a pot. Believe that, or turn over the pots yourself.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "curator-aside-storm",
      "survival",
      "Does a storm like this worry you, shut in here with us?",
      "The house, no. My glasshouse, terribly\u2014a night this cold can undo a decade of patience in the tender beds.",
      "worried",
      [
        rep("You\u2019d rather be out there tending them.", "Always. Living things do not keep office hours, and neither, once, did I.", "thoughtful", 1),
        rep("Plants before people, then.", "Plants ask less and forgive far more. Draw your own conclusions.", "neutral"),
        rep("A convenient excuse to slip away.", "I have slipped nowhere the frost did not send me. Chase the cold, detective, not me.", "neutral")
      ]
    ),
    pa(
      "curator-aside-quiet",
      "social",
      "You keep to the edges of every room. Are you shy?",
      "Watchful. A greenhouse teaches you that the quietest corner shows you the most about what is growing\u2014or quietly rotting.",
      "neutral",
      [
        rep("And what\u2019s growing here tonight?", "Nerves, mostly. Transplant shock. Everyone here has been moved somewhere they did not choose.", "thoughtful", 1),
        rep("Just an observer, then.", "An observer with dirt under her nails. Harmless enough.", "neutral"),
        rep("Lurking, some would call it.", "Some would. Some also over-water a fern and then wonder aloud why it drowned.", "suspicious")
      ]
    ),
    pa(
      "curator-aside-specimen",
      "intel",
      "Is there one plant you\u2019d save above all the others?",
      "A night-blooming cereus I have kept alive against every sensible odds. It flowers once, briefly, and asks nothing of anyone.",
      "thoughtful",
      [
        rep("You speak of it like family.", "It is the most loyal thing I own. I would do a great deal to keep it out of careless hands.", "thoughtful", 1),
        rep("A rare specimen, then.", "Rare, and rather better left unnamed in the present company.", "neutral"),
        rep("Rare enough to be worth smuggling?", "Careful, detective. A grower\u2019s love is not a confession, whatever your notebook is hoping.", "angry", 0, 1)
      ]
    )
  ]
};

// src/game/dialogue/asidesB.ts
var ASIDES_B = {
  magician: [
    pa(
      "magician-aside-coins",
      "connection",
      "Those coins never stop moving across your knuckles\u2014why is that?",
      "Idle hands frighten me, detective. A coin in motion is a coin no one can lift from me, and a mind in motion is much the same.",
      "thoughtful",
      [
        rep("There\u2019s real artistry in it.", "Kind of you to call it art. My father called it fidgeting and docked my supper for it\u2014so you may imagine which verdict I chose to keep.", "thoughtful", 1),
        rep("A nervous habit, then.", "A rehearsed one. The only difference between nerves and craft is how many years you have practised the tremble.", "neutral"),
        rep("Or it keeps my eyes off your other hand.", "Now you are learning the trade. But do keep watching this hand, detective\u2014it flatters me enormously.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "magician-aside-applause",
      "social",
      "Do you ever tire of playing to a crowd?",
      "Never the crowd\u2014only the ones who fold their arms and dare me to fail. Those I adore, secretly. A hostile room is the one honest review a man ever gets.",
      "neutral",
      [
        rep("You perform for the doubters, then.", "Always. Win over the skeptic in the third row and the rest clap out of sheer relief.", "thoughtful", 1),
        rep("Applause must wear thin eventually.", "It does. Which is why I collect the gasp instead\u2014far rarer, and it cannot be faked by good manners.", "neutral"),
        rep("Some would call that vanity.", "Some would. Those same people gasp loudest when the lady floats, so I forgive them their little sermons.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "magician-aside-secret",
      "intel",
      "Would you ever teach a soul how the tricks are truly done?",
      "Teach the method and you hand away the only thing you own. A conjurer with no secrets is simply a man dropping scarves in public.",
      "thoughtful",
      [
        rep("Surely you\u2019d trust an apprentice.", "One, perhaps, in thirty years\u2014and I would still keep the last trick from even them. A locked drawer is how affection stays affection.", "thoughtful", 1),
        rep("So the secrets go with you.", "To the very finish, and rather cheerfully. The world keeps its wonder only because a few of us refuse to explain.", "neutral"),
        rep("Convenient, keeping so much hidden.", "Everyone hides their working, detective. I am merely honest enough to charge admission for the privilege.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "magician-aside-stage",
      "room",
      "You keep glancing at the doorways and the lamps. Sizing up the room?",
      "Force of habit. I read a room the way you read a witness\u2014where the light falls, where a curtain might hang, which corner would hide a table nicely.",
      "neutral",
      [
        rep("What does this room tell you?", "That it was built to impress and not to be lived in. All these grand sightlines, and not one cosy place to properly vanish.", "thoughtful", 1),
        rep("Every room is a stage to you.", "Every room already is one, detective. I simply admit that I have noticed the ropes.", "neutral"),
        rep("Or you\u2019re mapping your way out.", "A conjurer always knows where the trapdoor would go\u2014call it professionalism, not guilt. Do try to keep the two apart.", "suspicious", 0, 1)
      ]
    )
  ],
  correspondent: [
    pa(
      "correspondent-aside-sleep",
      "survival",
      "When did you last manage a full night\u2019s sleep?",
      "Couldn\u2019t tell you. Somewhere behind a border, three cities back. Sleep is a luxury for people who trust the room they\u2019re in.",
      "neutral",
      [
        rep("That sounds exhausting, honestly.", "You get used to the ceiling. After a while the quiet is what keeps you up\u2014too much of it means something\u2019s gone wrong.", "thoughtful", 1),
        rep("You stay alert on nerve alone.", "Nerve and bad coffee. Tired is a decision you make in the morning; I keep declining it.", "neutral"),
        rep("Or you don\u2019t sleep because you can\u2019t.", "Can\u2019t, won\u2019t\u2014same file. A shut eye in the wrong house is how a reporter stops filing. I intend to keep filing.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "correspondent-aside-source",
      "intel",
      "How far would you go to protect a source?",
      "All the way. A source is a promise with a pulse. Break it once and you never get another honest word from anyone, anywhere.",
      "thoughtful",
      [
        rep("That loyalty says a lot about you.", "Learned it the hard way. Costs you scoops, sometimes friends. Cheaper than the alternative, though.", "thoughtful", 1),
        rep("Even under real pressure?", "Especially then. Pressure is when the promise actually means something. Any coward keeps a secret when it\u2019s easy.", "neutral"),
        rep("Or you\u2019re just shielding who talks to you.", "Sure. Call discretion a hiding place if it fits your headline. I\u2019ve been called worse by better.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "correspondent-aside-company",
      "social",
      "Do you make friends easily on the road?",
      "I make contacts. Friends want you at the wedding; contacts want you at the front. Guess which ones return your cables.",
      "neutral",
      [
        rep("That sounds a lonely way to live.", "It is. But a lonely reporter files clean copy\u2014no one to soften the truth for at breakfast.", "thoughtful", 1),
        rep("You prefer it that way.", "Prefer\u2019s a strong word. I\u2019ve arranged it that way. Fewer people to disappoint when the wire\u2019s due.", "neutral"),
        rep("So you trust no one in this house.", "I trust the exits and the clock. People I verify twice, then trust the paperwork.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "correspondent-aside-doors",
      "room",
      "You counted the doors the moment you walked in. Old reflex?",
      "Two doors, one window, a service passage behind the drapes. Counted before I shook a single hand. You stop doing that, you stop coming home.",
      "neutral",
      [
        rep("That must be hard to switch off.", "Never switches off. But it means I\u2019m the calmest one in the room when the lamps flicker. Small mercy, earned.", "thoughtful", 1),
        rep("A useful habit in your line.", "Kept me breathing across four borders. A room is just a map with people standing on it.", "neutral"),
        rep("Or you\u2019re already planning your exit.", "Always am. Planning a way out isn\u2019t the same as needing one\u2014write that down carefully, detective.", "suspicious", 0, 1)
      ]
    )
  ],
  accountant: [
    pa(
      "accountant-aside-ledger",
      "connection",
      "That ledger never leaves your side. Is it truly all figures?",
      "Figures, and the truth that hides between them. A column cannot flatter you or lie to your face\u2014which makes it better company than most of this household.",
      "neutral",
      [
        rep("You speak of it fondly.", "It is the one thing here that balances. Give a ledger an honest entry and it gives you an honest answer, every single time.", "thoughtful", 1),
        rep("Just the books, then.", "Just the books. But read closely, a man\u2019s books are his confession, whether or not he ever meant to write one.", "neutral"),
        rep("Or you keep it close to hide something.", "Everything I hide is a decimal, detective. Audit me at your leisure\u2014you will only bore yourself.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "accountant-aside-silver",
      "social",
      "I noticed you counting the silver at dinner. A professional tic?",
      "Forty-one pieces, and there should be forty-two. A fish fork has been wandering since spring, and no one in this house seems remotely troubled by it but me.",
      "suspicious",
      [
        rep("That eye for detail is a gift.", "A burden dressed as a gift. Once you can count, you cannot stop, and the world turns out to be short rather more than a single fork.", "thoughtful", 1),
        rep("One fork hardly matters, surely.", "One fork is how a fortune leaves a house, detective\u2014not in a night, but a piece at a time, politely, while everyone admires the wallpaper.", "neutral"),
        rep("You sound almost accusatory.", "I sound accurate. If accuracy offends the company, the company should keep better accounts.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "accountant-aside-money",
      "motive",
      "In your experience, what makes people behave badly?",
      "Money, or the want of it. Every quarrel I have ever audited reduced, in the end, to a sum someone felt was owed them and never received.",
      "neutral",
      [
        rep("That\u2019s a rather bleak arithmetic.", "Bleak, but it balances. People will forgive an insult far sooner than they forgive a debt. I have the columns to prove it.", "thoughtful", 1),
        rep("Surely not everything is about money.", "Nearly everything wears money underneath, if you undo enough buttons. Even love keeps a running total, though it hates to admit the fact.", "neutral"),
        rep("Following the money to anyone in particular?", "I follow it wherever the entries lead, detective. Whether it stops at a door in this house is not mine to say tonight.", "thoughtful", 0, 1)
      ]
    ),
    pa(
      "accountant-aside-house",
      "room",
      "What do you make of a grand house like this one?",
      "A liability in fancy dress. Every chandelier is a repair bill awaiting its turn, and every acre of it is quietly costing the family more than they will ever confess aloud.",
      "thoughtful",
      [
        rep("You see the numbers behind the grandeur.", "I cannot help it. Where you see a ballroom, I see the coal, the wages, and the roof that leaks above the east wing. Someone must.", "thoughtful", 1),
        rep("It must be worth a fortune, though.", "On paper. But paper fortunes and real ones rarely occupy the same room, and this house has been living on the difference for years.", "neutral"),
        rep("You resent all this splendour, don\u2019t you?", "I resent being asked to make the sums pretend it can last. Admire the marble all you like, detective; I am the one who reconciles it.", "suspicious", 0, 1)
      ]
    )
  ]
};

// src/game/dialogue/asidesC.ts
var ASIDES_C = {
  vocalist: [
    pa(
      "vocalist-aside-bluenote",
      "connection",
      "Where did a voice like yours first learn to carry a room?",
      "In a back-room joint with a piano missing three keys, sugar. You learn to bend around what\u2019s gone \u2014 that\u2019s the whole trick of it.",
      "thoughtful",
      [
        rep("That sounds like a hard, lovely school.", "Hard and lovely, honey, like most things worth the aching. I wouldn\u2019t trade a single splintered night of it.", "thoughtful", 1),
        rep("And it carried you all the way here.", "All the way to marble floors and cold company. Funny where a bent note will take a girl.", "neutral"),
        rep("A rehearsed answer if I ever heard one.", "Everything I say has a little rehearsal in it, detective \u2014 doesn\u2019t make it a lie, just makes it sing.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "vocalist-aside-mood",
      "room",
      "You keep glancing round the parlor \u2014 what is the room telling you tonight?",
      "It\u2019s humming in a minor key, sugar. Too many folks holding a smile a beat past comfortable.",
      "worried",
      [
        rep("You read a crowd like sheet music.", "Every room\u2019s got a tempo, honey, and this one keeps rushing itself. I just listen for who\u2019s dragging behind.", "thoughtful", 1),
        rep("Anyone in particular off the beat?", "A few. I don\u2019t point mid-song, detective \u2014 I wait to hear if they find the rhythm again.", "neutral"),
        rep("Or you\u2019re just nervous yourself.", "Maybe I am. A girl hums to steady her own hands sometimes \u2014 you caught me at it, sugar.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "vocalist-aside-thunder",
      "survival",
      "Does a night this loud with thunder rattle a performer like you?",
      "Thunder\u2019s just percussion with no manners, honey. I\u2019ve sung over worse racket than a storm.",
      "neutral",
      [
        rep("You make even weather sound like a set.", "Everything\u2019s a set if you let it be, sugar. Keeps the fear from ever getting a solo.", "thoughtful", 1),
        rep("So the storm doesn\u2019t trouble you.", "The storm, no. The quiet after each crack \u2014 that\u2019s the part I fill with a little humming.", "neutral"),
        rep("You perform calm awfully well.", "It\u2019s the one number I never flub, sugar. Doesn\u2019t mean the calm is empty \u2014 means I practiced it.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "vocalist-aside-company",
      "social",
      "Is there a soul in this house you\u2019d share a late drink with?",
      "A couple, maybe, if the piano were warmer. Mostly I keep my own company and let it hum, honey.",
      "thoughtful",
      [
        rep("Solitude suits some singers.", "It does, sugar \u2014 a voice needs somewhere quiet to come home to. I built mine out of long nights alone.", "thoughtful", 1),
        rep("No one here you\u2019d call close, then?", "Close is a strong word under a stranger\u2019s roof, detective. I\u2019m friendly with a few and careful with the rest.", "neutral"),
        rep("Careful, or you trust no one at all?", "Careful is how a girl keeps singing, honey. Trust I hand out one verse at a time.", "suspicious", 0, 1)
      ]
    )
  ],
  antiquarian: [
    pa(
      "antiquarian-aside-house",
      "room",
      "This hall must be centuries old \u2014 what is its story?",
      "Jacobean at the core, Georgian vanities layered atop \u2014 forgive me, I do go on. This paneling alone has outlived four families and two fires.",
      "thoughtful",
      [
        rep("Please, go on \u2014 it\u2019s fascinating.", "Ah, a kindred ear! Then mind the linenfold carving \u2014 hand-cut, pre-industrial, and I do apologize to it for the dreadful varnish some later brute slapped on.", "thoughtful", 1),
        rep("You know the place better than its owner.", "Owners merely possess a house; scholars understand it. The distinction is everything, and it is rarely appreciated.", "neutral"),
        rep("A great many dates to hide behind.", "Dates are not a hiding place, detective; they are the one honest thing in any room. People fib \u2014 provenance does not.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "antiquarian-aside-hands",
      "connection",
      "You touch every object you pass \u2014 why can\u2019t you keep your hands still?",
      "A dreadful habit, I confess, and half a method. One reads an object through the fingertips \u2014 the weight, the temperature, the honesty of its joinery.",
      "neutral",
      [
        rep("You handle them like old friends.", "They are the friends who never disappoint, my dear \u2014 forgive me, I oughtn\u2019t confide such things. That bronze has kept better company than most people.", "thoughtful", 1),
        rep("Just an appraiser\u2019s reflex, then.", "Precisely so. The eye is fooled by a clever fake; the hand almost never is.", "neutral"),
        rep("Touching everything leaves prints everywhere.", "It leaves the prints of a man who reveres these things \u2014 and I do beg this poor candlestick\u2019s pardon for being handled as an exhibit.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "antiquarian-aside-treasure",
      "intel",
      "Of everything under this roof, which piece would you spirit away first?",
      "The little ivory triptych in the west passage \u2014 fifteenth century, absurdly underinsured, and quite unaware of its own worth. A scandal, really.",
      "thoughtful",
      [
        rep("You speak of it so tenderly.", "How could one not? It has survived reformations and neglect and one truly criminal cleaning. I should like to see it into gentler hands than these.", "thoughtful", 1),
        rep("Underinsured, you say \u2014 you\u2019ve checked?", "A scholar notices such things the way you notice an unlatched window. Occupational, nothing more.", "neutral"),
        rep("That sounds like a man planning a pocket.", "It sounds like a man who catalogues, detective. I covet with a notebook, never a sack.", "angry", 0, 1)
      ]
    ),
    pa(
      "antiquarian-aside-vocation",
      "motive",
      "What first drew you to spend a life among relics and ruins?",
      "A grandfather\u2019s watch that stopped the year he was born \u2014 wound backward, I later learned, by a swindler. I have chased honest objects ever since.",
      "worried",
      [
        rep("So it began with a wound.", "Most vocations do, my dear \u2014 forgive the sentiment. I mend the past\u2019s little dishonesties because no one ever mended that one.", "worried", 1),
        rep("A tidy origin story.", "Tidy because it is true, detective. I have had decades to file it correctly.", "thoughtful"),
        rep("Or a convenient excuse to handle riches.", "Riches bore me; authenticity does not. Confuse the two again and you insult a lifetime\u2019s discipline.", "angry", 0, 1)
      ]
    )
  ],
  chauffeur: [
    pa(
      "chauffeur-aside-cap",
      "connection",
      "That cap never leaves your hands \u2014 why keep polishing it?",
      "Keeps them busy, sir. A driver with idle hands starts talking. I\u2019d rather not.",
      "neutral",
      [
        rep("Pride in the uniform. I respect that.", "It\u2019s the one thing that\u2019s mine, sir. Bought it myself. That counts for something.", "thoughtful", 1),
        rep("Habit, then.", "Habit. Fifteen years of it. The hands know the motion better than I do.", "neutral"),
        rep("Or nerves you\u2019d rather I didn\u2019t see.", "Think what you like, sir. The cap\u2019s still cleaner than most consciences in this house.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "chauffeur-aside-seat",
      "intel",
      "You must see a great deal from behind that wheel \u2014 what stays with you?",
      "Everything, sir. People forget the driver\u2019s got ears. Then they talk.",
      "neutral",
      [
        rep("And you keep it all to yourself.", "Mostly, sir. A man who repeats what he hears don\u2019t drive long. But I remember. All of it.", "thoughtful", 1),
        rep("Anything from tonight?", "Some. A door that opened too quiet. A step where there shouldn\u2019t be one. Still sorting it.", "neutral"),
        rep("Convenient, hearing so much and saying nothing.", "Convenient\u2019s not the word, sir. Careful is. Different thing, when you\u2019re the help.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "chauffeur-aside-marooned",
      "survival",
      "The road\u2019s washed out and we\u2019re all stuck \u2014 how are you taking it?",
      "Fine, sir. Been stranded worse places than a warm house. I wait. That\u2019s half the job.",
      "neutral",
      [
        rep("A patient man.", "You learn it, sir. Engine floods, you don\u2019t curse it. You wait for it to dry. Same with people.", "thoughtful", 1),
        rep("The storm doesn\u2019t worry you?", "Storm\u2019s honest, sir. Does exactly what it says. Can\u2019t say that for the company inside.", "neutral"),
        rep("Or you like being cut off from the law.", "The law and me get on fine, sir. It\u2019s the gentry that put me on edge. Leave it there.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "chauffeur-aside-standing",
      "social",
      "How do the folk in this house treat a man in your position?",
      "Like furniture, sir. Useful, silent, shoved aside when I\u2019m underfoot. Suits me most nights.",
      "neutral",
      [
        rep("That\u2019s not how I mean to treat you.", "Noticed that, sir. It\u2019s rare. A working man remembers who looked him in the eye.", "thoughtful", 1),
        rep("Furniture hears the room, though.", "That it does, sir. No one guards their mouth in front of a coat rack.", "neutral"),
        rep("Bitter about your betters, are you?", "No bitterness, sir. Just arithmetic. I know exactly what I\u2019m worth to them, and it\u2019s not much.", "angry", 0, 1)
      ]
    )
  ],
  debutante: [
    pa(
      "debutante-aside-season",
      "social",
      "Is a season of parties as dizzying as it sounds, or does it tire you?",
      "Oh, it\u2019s heaven, detective \u2014 all the dancing and the lovely dresses! Though one does learn to smile while one\u2019s feet quietly beg for mercy.",
      "neutral",
      [
        rep("You wear it beautifully, all the same.", "How sweet of you! The trick is to look as though you\u2019re enjoying it a great deal more than you are. Everyone does it \u2014 I\u2019m simply better practiced.", "thoughtful", 1),
        rep("It sounds exhausting, honestly.", "It is, rather. But a girl smiles, sips her punch, and waits for the music to change. One learns to endure prettily.", "neutral"),
        rep("All that fluttering can\u2019t be sincere.", "Can\u2019t it? How disappointing for you, detective, to find the silly girl means it and notices you all the same.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "debutante-aside-pearls",
      "connection",
      "You keep turning those pearls \u2014 are they a comfort to you?",
      "They were my grandmother\u2019s, detective. When I\u2019m frightened I twist them, and no one ever asks why \u2014 they simply think me fidgety.",
      "worried",
      [
        rep("She must have meant a great deal to you.", "Everything. She was the only one who spoke to me as though I\u2019d something behind my eyes. I wear her when I need reminding of it.", "worried", 1),
        rep("A nervous habit, then.", "A useful one. People say the most careless things in front of a girl fussing with her beads. I do recommend it.", "neutral"),
        rep("Or a performance of innocence.", "What a clever, unkind thought. If it were a performance, detective, you\u2019d never have been meant to notice \u2014 would you?", "suspicious", 0, 1)
      ]
    ),
    pa(
      "debutante-aside-watch",
      "room",
      "You take everyone in so quietly \u2014 what have you noticed about this party?",
      "Oh, heaps of things, detective \u2014 who watches the door, who drinks too fast, who laughs before the joke is finished. People forget I\u2019m listening.",
      "neutral",
      [
        rep("You see more than you let on.", "Everyone lets me, you see \u2014 a pretty face is marvelous cover. I\u2019ve learned a whole house by being thought empty.", "thoughtful", 1),
        rep("Anyone stand out especially?", "One or two are holding themselves a touch too still for a party. I shan\u2019t say who \u2014 not until I\u2019m certain of you.", "neutral"),
        rep("Little girls shouldn\u2019t play at spying.", "Little girls, spying \u2014 how you do underestimate the furniture, detective. It\u2019s precisely why I hear everything.", "suspicious", 0, 1)
      ]
    ),
    pa(
      "debutante-aside-tempest",
      "survival",
      "Does being shut in by the storm frighten a young lady like you?",
      "A little thrilling, honestly, detective \u2014 like the last act of a play where no one may leave! Though the thunder does keep startling the candles.",
      "surprised",
      [
        rep("You\u2019re braver than you pretend.", "Braver than they credit, at least. One is rarely frightened while one is busy watching everyone else be frightened.", "thoughtful", 1),
        rep("Most here seem rather on edge.", "Deliciously so. Fear makes people honest, detective \u2014 they quite forget to arrange their faces.", "neutral"),
        rep("Enjoying the fear rather too much, aren\u2019t you?", "Am I? Perhaps. A girl takes her entertainment where the evening offers it \u2014 and tonight it offers rather a lot.", "suspicious", 0, 1)
      ]
    )
  ]
};

// src/game/dialogue/personalAsides.ts
var PERSONAL_ASIDES_BY_ARCHETYPE = {
  ...ASIDES_A,
  ...ASIDES_B,
  ...ASIDES_C
};

// src/game/data.ts
var ROOMS = [
  { id: "study", name: "Study", brief: "Pipe smoke lingers beneath the amber light.", col: 0, row: 0, floor: 4863271, wall: 2891800, accent: 9071162, lightColor: 16757854, lightIntensity: 1.15 },
  { id: "gallery", name: "Gallery", brief: "Cold light washes across the formal walls.", col: 1, row: 0, floor: 3817290, wall: 2303534, accent: 11570494, lightColor: 13621503, lightIntensity: 0.95 },
  { id: "conservatory", name: "Conservatory", brief: "Rain hammers the glass through the green gloom.", col: 2, row: 0, floor: 3032114, wall: 1845792, accent: 6195786, lightColor: 10479792, lightIntensity: 0.9 },
  { id: "kitchen", name: "Kitchen", brief: "Warm light catches on worn quarry tile.", col: 0, row: 1, floor: 5591114, wall: 3354668, accent: 11891258, lightColor: 16763274, lightIntensity: 1.05 },
  { id: "dining", name: "Dining Hall", brief: "The herringbone floor waits beneath a tense hush.", col: 1, row: 1, floor: 4992819, wall: 3022112, accent: 13214247, lightColor: 16765562, lightIntensity: 1.25 },
  { id: "ballroom", name: "Ballroom", brief: "An empty dance floor gleams in violet light.", col: 2, row: 1, floor: 5523562, wall: 3287874, accent: 14076400, lightColor: 15260927, lightIntensity: 1.2 },
  { id: "cellar", name: "Cellar", brief: "Mildew hangs in the air with sounds that might be rats.", col: 0, row: 2, floor: 4012597, wall: 2368032, accent: 6969920, lightColor: 16751178, lightIntensity: 0.6 },
  { id: "library", name: "Library", brief: "Amber pools of light break the surrounding dark.", col: 1, row: 2, floor: 4403242, wall: 2694425, accent: 10123850, lightColor: 16760938, lightIntensity: 1 },
  { id: "suite", name: "Master Suite", brief: "Perfume lingers against velvet-dark walls.", col: 2, row: 2, floor: 5910333, wall: 3677736, accent: 14256794, lightColor: 16756896, lightIntensity: 1 }
];
var ROOM_BY_ID = Object.fromEntries(ROOMS.map((r2) => [r2.id, r2]));
var ARCHETYPES = [
  {
    id: "columnist",
    name: "Society Columnist",
    promptSheet: { trait: "Knows everyone\u2019s business", quirk: "Collects secrets like cufflinks", voice: "Catty, epigrammatic, always hinting she knows more than she says.", reactionStyle: "Become suspicious or angry when challenged; use surprised for genuinely fresh gossip or a revelation." },
    greet: ["Darling, you simply must tell me what you\u2019ve seen.", "I write about people, detective. Tonight is\u2026 material."],
    timeline: ["At {time}? Holding court in the {room}, naturally.", "I was in the {room} around {time}, being fascinating."],
    suspicion: ["If you want my professional opinion \u2014 and you do \u2014 watch {name}.", "{name} has been performing innocence all evening. Badly."],
    alibi: ["{name} can vouch for me. Everyone always can.", "Ask {name}. I was mid-anecdote; I never murder mid-anecdote."],
    roomTake: ["The {room}? Terribly lit for secrets, which is why people tell them there.", "I\u2019ve heard three confessions in the {room} in my career."],
    pressure: ["Careful, detective. I put people in columns, not coffins.", "You\u2019re pressing the wrong cufflink, sweetheart."],
    victim: ["Poor {name}. I\u2019d already written their obituary once \u2014 as a joke.", "{name} owed me a secret. Now it keeps."],
    rumorPhrase: ["A little bird \u2014 all right, a large bird \u2014 saw {name} in the {room} near {time}.", "Don\u2019t quote me, but {name} was skulking in the {room} around {time}."]
  },
  {
    id: "surgeon",
    name: "Retired Surgeon",
    promptSheet: { trait: "Reads bodies like charts", quirk: "Still washes his hands constantly", voice: "Precise, clinical, quietly arrogant; describes everything anatomically.", reactionStyle: "Use thoughtful for precise recall, suspicious for flawed premises, and angry when your expertise or integrity is repeatedly questioned." },
    greet: ["Mind where you step, detective. Evidence bruises easily.", "I retired to stop seeing death. It followed me here."],
    timeline: ["At {time} I was in the {room}. I keep exacting track of time. Habit.", "I believe I was in the {room} at {time}. I don\u2019t guess; I recall."],
    suspicion: ["I dislike speculating. But {name}\u2019s hands are\u2026 restless.", "{name} asked me earlier which artery is quickest. Make of that what you will."],
    alibi: ["{name} was with me. I noted the time reflexively.", "I was discussing my memoirs with {name}. Riveting for one of us."],
    roomTake: ["The {room} offers poor light and worse exits. Chosen deliberately, I\u2019d say.", "Medically speaking, the {room} is where I\u2019d least want to be surprised."],
    pressure: ["I have opened chests with steadier hands than yours, detective.", "Pressure? I administered it for forty years. You may stop."],
    victim: ["{name} was dead before they fell. I could tell from across the room.", "I examined no one tonight. I am retired. But {name}\u2026 died quickly."],
    rumorPhrase: ["I noted {name} entering the {room} at approximately {time}. I note everything.", "{name} passed through the {room} near {time}. Their gait was agitated."]
  },
  {
    id: "curator",
    name: "Greenhouse Curator",
    promptSheet: { trait: "Calm, observant, patient", quirk: "Talks to plants when nervous", voice: "Soft-spoken, botanical metaphors, unhurried, notices small details.", reactionStyle: "Use thoughtful while observing, worried around death or danger, and angry when persistent pressure breaks your patience." },
    greet: ["The storm is good for the ferns, at least.", "You look like a man who hasn\u2019t watered anything in years, detective."],
    timeline: ["Around {time} I was in the {room}. The night jasmine was just opening.", "At {time}? In the {room}, I believe. Plants keep me punctual."],
    suspicion: ["People wilt before they lie. {name} is wilting.", "I\u2019d keep an eye on {name}. Something\u2019s growing in them that shouldn\u2019t be."],
    alibi: ["{name} helped me carry a pot. Heavy thing. Ask them.", "I was with {name}, admiring the orchids. They pretended to care."],
    roomTake: ["The {room} needs pruning, metaphorically speaking.", "Everything in the {room} grows toward the light. People included."],
    pressure: ["I\u2019ve been patient with worse things than you. Aphids, mostly.", "Pressing a gardener is like pressing a flower. You only flatten it."],
    victim: ["{name} once asked me which plants kill. I thought it was small talk.", "Poor {name}. Cut down mid-season."],
    rumorPhrase: ["I saw {name} in the {room} around {time}, moving like a weed at night.", "{name}? The {room}, near {time}. I remember because the door slammed."]
  },
  {
    id: "magician",
    name: "Stage Magician",
    promptSheet: { trait: "Misdirection is a lifestyle", quirk: "Never stops palming coins", voice: "Theatrical, playful, answers questions with flourishes and half-answers.", reactionStyle: "Use suspicious when guarding a secret, surprised for a genuine reveal, and angry when the detective ignores a boundary." },
    greet: ["Detective! For my next trick, I\u2019ll make your suspects disappear.", "Nothing up my sleeve. Anymore."],
    timeline: ["At {time} I was in the {room}, astonishing absolutely no one.", "The {room}, at {time}. Or was it an illusion? It was not."],
    suspicion: ["Watch {name}\u2019s left hand. Always the left hand.", "{name} does a vanishing act every time the lights flicker. Curious!"],
    alibi: ["{name} saw me produce a dove from the candelabra. A real one! Mostly.", "I was entertaining {name}. My alibi has applause."],
    roomTake: ["Ah, the {room}. Excellent sightlines for misdirection.", "The {room} has at least three ways to vanish. I counted. Professionally."],
    pressure: ["You can\u2019t saw the truth in half, detective. I\u2019ve tried. Ticket sales were poor.", "A magician never reveals. Anything. Ever. Including dinner plans."],
    victim: ["{name} knew how my best trick worked. Now the secret is safe forever. How convenient\u2026 for me, I suppose. Oh dear.", "Death is the one illusion I never mastered. Poor {name}."],
    rumorPhrase: ["I glimpsed {name} in the {room} at {time} \u2014 then again, I glimpse many things.", "{name} was in the {room} around {time}. Presto! A clue."]
  },
  {
    id: "correspondent",
    name: "War Correspondent",
    promptSheet: { trait: "Fearless, blunt, sleepless", quirk: "Counts exits in every room", voice: "Clipped, sardonic, cables-style sentences. Dark humor.", reactionStyle: "Use suspicious while evaluating claims, worried for credible danger, and angry under repeated or insulting pressure." },
    greet: ["One mansion. Ten suspects. Worse odds than the front.", "File this under: terrible weekend."],
    timeline: ["{time} \u2014 {room}. Logged it. I log everything.", "I was in the {room} at {time}. Two exits, one window. Noted."],
    suspicion: ["My money\u2019s on {name}. Nerves like that don\u2019t come from bridge.", "{name} flinched at the thunder before it struck. Think about that."],
    alibi: ["{name} and I were arguing about the news. Ask about the headlines.", "I was with {name}. We watched the storm. Riveting copy."],
    roomTake: ["The {room} is a kill box with wallpaper.", "If it happens in the {room}, it happens quietly. Bad angles."],
    pressure: ["I\u2019ve been pressed by generals with artillery. Try again.", "Print this: I didn\u2019t do it."],
    victim: ["{name} deserved a better headline than this.", "I\u2019ve seen a hundred {name}s. Never gets easier. It gets faster."],
    rumorPhrase: ["Source \u2014 reliable-ish \u2014 puts {name} in the {room} at {time}.", "Eyes on: {name}, {room}, around {time}. Unverified. As always."]
  },
  {
    id: "accountant",
    name: "Estate Accountant",
    promptSheet: { trait: "Follows the money", quirk: "Recounts the silverware", voice: "Dry, precise, mildly resentful; everything is an entry in a ledger.", reactionStyle: "Use thoughtful for details, worried when money implicates you, and angry when accused or repeatedly interrogated." },
    greet: ["This estate\u2019s books don\u2019t balance, detective. People rarely do either.", "I count things when I\u2019m nervous. I am up to four hundred."],
    timeline: ["At {time} I was in the {room}. I have it itemized.", "The {room}, {time}. Debit: one hour of my life."],
    suspicion: ["{name}\u2019s finances are a swamp. Swamps hide bodies.", "If motive were money \u2014 it usually is \u2014 audit {name}."],
    alibi: ["{name} watched me reconcile the cellar ledger. A thrilling evening.", "I was with {name}. Two witnesses if you count the ledger."],
    roomTake: ["The {room} contains items worth more than my retirement. Tempting, objectively.", "Someone moved the silver in the {room}. I noticed. I always notice."],
    pressure: ["Embezzlement is a paperwork crime. Murder is so\u2026 analog.", "I assure you, my only vice is double-entry bookkeeping."],
    victim: ["{name} died owing the estate a considerable sum. Awkward for everyone.", "With {name} gone, line forty-one of the will becomes very interesting."],
    rumorPhrase: ["My records \u2014 mental ones \u2014 show {name} in the {room} at {time}.", "{name} entered the {room} near {time}. I noted the floorboard creak."]
  },
  {
    id: "vocalist",
    name: "Jazz Vocalist",
    promptSheet: { trait: "Reads the room\u2019s mood", quirk: "Hums when lying \u2014 or is it when nervous?", voice: "Lyrical, smoky, speaks in rhythm; half-sighs her sentences.", reactionStyle: "Use thoughtful for memories, worried around victims or threats, and angry when intimate subjects are pushed after you resist." },
    greet: ["This house has a blue note in it tonight, sugar.", "You got a heartbeat like a brush on a snare, detective."],
    timeline: ["\u2019Round {time} I was in the {room}, hummin\u2019 to the rain.", "At {time}? The {room}. The acoustics there forgive everything."],
    suspicion: ["{name}\u2019s song changed key tonight. You hear it too, don\u2019t you?", "I don\u2019t accuse, honey. But {name} is hummin\u2019 a guilty tune."],
    alibi: ["{name} requested a song. I sang it. That\u2019s my alibi \u2014 it has a melody.", "I was with {name}. We talked about nothin\u2019, which is somethin\u2019."],
    roomTake: ["The {room} sounds like a held breath.", "Sing in the {room} and the walls sing back. Try it sometime."],
    pressure: ["Press me and I just go quiet, sugar. Quiet\u2019s my instrument.", "I sing heartbreak. I don\u2019t arrange it."],
    victim: ["{name} couldn\u2019t carry a tune, but they didn\u2019t deserve the final note.", "They\u2019ll be singin\u2019 about {name} for years. A blues, naturally."],
    rumorPhrase: ["Word drifted through the {room} \u2014 {name} was there \u2019round {time}.", "I heard {name} pass the {room} at {time}. Heavy steps for a light soul."]
  },
  {
    id: "antiquarian",
    name: "Antiquarian",
    promptSheet: { trait: "Knows the mansion\u2019s history", quirk: "Touches everything, apologizes to objects", voice: "Fussy, erudite, digressive; every answer comes with provenance.", reactionStyle: "Use thoughtful for history, worried when implicated, surprised by new discoveries, and angry when accused or disrespected." },
    greet: ["This house predates the storm by two centuries. It will outlast us all. Possibly tonight.", "Careful with the Ming. And the Georgian. And me."],
    timeline: ["At {time} I was cataloguing \u2014 mentally \u2014 the {room}.", "The {room} at {time}. The provenance of my whereabouts is impeccable."],
    suspicion: ["{name} asked the price of the Etruscan dagger. Odd small talk.", "In my considered opinion, {name} handles history too carelessly."],
    alibi: ["{name} endured my lecture on Sevres porcelain. Martyrdom has witnesses.", "I was with {name}, authenticating a portrait. It was fake. The portrait."],
    roomTake: ["The {room} holds pieces older than sin. And, I suspect, fresher guilt.", "Mind the {room}. Its last owner also died indoors."],
    pressure: ["I am three hundred years of expertise in a cardigan. Do not squeeze me.", "I acquire relics, detective. Not corpses."],
    victim: ["{name} had a first-edition I covet\u2014 coveted. Had. Coveted. Tenses are hard tonight.", "The last person to die in this house was also named {name}. Coincidence is a young science."],
    rumorPhrase: ["Records \u2014 mine, just now \u2014 place {name} in the {room} at {time}.", "{name} was examining the {room}\u2019s collection around {time}. Without gloves."]
  },
  {
    id: "chauffeur",
    name: "Off-Duty Chauffeur",
    promptSheet: { trait: "Sees everything, says little", quirk: "Keeps polishing his cap", voice: "Terse, dry, streetwise; long pauses, short sentences.", reactionStyle: "Use suspicious when withholding information and angry when the detective keeps pushing after a terse refusal." },
    greet: ["Detective.", "Rain\u2019s bad. Roads are worse. Nobody\u2019s leaving."],
    timeline: ["{time}. {room}. That\u2019s all.", "Was in the {room} at {time}. Keepin\u2019 warm."],
    suspicion: ["{name} tips badly. Guilty people tip badly.", "Watch {name}. That\u2019s all I\u2019ll say."],
    alibi: ["{name} was there. We talked cars.", "Ask {name}. They saw me."],
    roomTake: ["The {room}? Drafty.", "Lot of blind corners in the {room}."],
    pressure: ["I drive. I don\u2019t kill. Simpler that way.", "You done?"],
    victim: ["{name} rode in my car once. Talked the whole way. Quiet now.", "Shame about {name}."],
    rumorPhrase: ["Saw {name} in the {room}. \u2019Bout {time}.", "{name}. {room}. {time}. Make of it what you want."]
  },
  {
    id: "debutante",
    name: "Debutante",
    promptSheet: { trait: "Underestimated by everyone", quirk: "Twirls her pearls while thinking", voice: "Breathy, seemingly naive, unexpectedly sharp observations slip out.", reactionStyle: "Use surprised for revelations, worried when frightened or implicated, suspicious when underestimated, and angry when patronized or cornered." },
    greet: ["Isn\u2019t this all just ghastly and thrilling?", "Daddy says I talk too much. Do you think I talk too much, detective?"],
    timeline: ["At {time} I was in the {room}, just dying of boredom. Figuratively! Figuratively.", "Let me think\u2026 {time}\u2026 oh! The {room}. Definitely."],
    suspicion: ["This is probably silly, but {name} keeps smiling at nothing.", "I shouldn\u2019t say\u2026 but {name} asked where the telephones were. There aren\u2019t any!"],
    alibi: ["{name} was teaching me cards. I lost terribly. On purpose. Or not!", "I was with {name}. They\u2019ll remember. I made an impression."],
    roomTake: ["The {room} is where people go when they think no one\u2019s looking. I\u2019m always looking.", "Oh, the {room} gives me shivers. Fun shivers. Mostly."],
    pressure: ["You\u2019re making me twist my pearls, detective. See? Twisting.", "Me? I can barely decide on a hat."],
    victim: ["{name} promised to teach me backgammon. Promises, promises.", "Poor {name}. They had such lovely cufflinks. Had."],
    rumorPhrase: ["I absolutely wasn\u2019t eavesdropping, but {name} was in the {room} at {time}.", "Guess who I saw in the {room} around {time}? {name}! Do something with that."]
  }
];
var ARCHETYPE_BY_ID = Object.fromEntries(
  ARCHETYPES.map((archetype) => [archetype.id, archetype])
);
var SCENE_EVIDENCE = [
  { id: "ink-fiber", label: "Ink-stained paper fiber", description: "A torn paper fiber is soaked with dense blue-black writing ink.", archetypeIds: ["columnist", "correspondent", "accountant"] },
  { id: "antiseptic", label: "Sharp chemical trace", description: "A clean, sharp, medicinal-smelling chemical residue that lingers on cloth.", archetypeIds: ["surgeon", "curator", "chauffeur"] },
  { id: "fine-earth", label: "Fine mineral dust", description: "Pale mineral grit, dry as chalk and far finer than garden soil.", archetypeIds: ["curator", "antiquarian", "debutante"] },
  { id: "black-wool", label: "Black wool thread", description: "A short length of coarse black wool thread, freshly frayed.", archetypeIds: ["magician", "correspondent", "chauffeur"] },
  { id: "metal-polish", label: "Metal-polish residue", description: "A waxy metallic smear of the kind left by freshly polished metal.", archetypeIds: ["accountant", "antiquarian", "chauffeur"] },
  { id: "floral-perfume", label: "Floral perfume trace", description: "A lingering, expensive floral perfume that outlasts the wearer.", archetypeIds: ["columnist", "vocalist", "debutante"] },
  { id: "face-powder", label: "Ivory face powder", description: "Fine ivory cosmetic face powder that clings to collars and cuffs.", archetypeIds: ["magician", "vocalist", "debutante"] },
  { id: "blade-oil", label: "Precision oil", description: "A drop of light, fine machine oil of the sort used on precision mechanisms.", archetypeIds: ["surgeon", "magician", "accountant"] },
  { id: "wax-resin", label: "Amber wax residue", description: "A brittle amber fleck of sealing wax or hardened resin.", archetypeIds: ["surgeon", "antiquarian", "vocalist"] },
  { id: "torn-note", label: "Torn shorthand note", description: "A torn paper fragment covered in hurried, cramped shorthand marks.", archetypeIds: ["columnist", "curator", "correspondent"] }
];
var EVIDENCE_BY_ID = Object.fromEntries(SCENE_EVIDENCE.map((e) => [e.id, e]));
var EVIDENCE_BY_ARCHETYPE = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, SCENE_EVIDENCE.filter((e) => e.archetypeIds.includes(a.id))])
);

// authored-dialogue-test.ts
var EFFECTS = ["advance", "stall", "close"];
var EMOTIONS = ["neutral", "suspicious", "worried", "angry", "thoughtful", "surprised"];
var FORBIDDEN_PRE_DEATH = /\b(victim|murder(?:ed|er)?|kill(?:ed|ing)?|death|dead|corpse|bod(?:y|ies))\b/i;
function check(condition, message) {
  if (!condition) throw new Error(message);
}
function normalized(text) {
  return text.toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
}
var archetypeIds = ARCHETYPES.map((archetype) => archetype.id);
var catalogIds = Object.keys(AUTHORED_DIALOGUE_BY_ARCHETYPE);
check(catalogIds.length === 10, `expected 10 authored archetypes, found ${catalogIds.length}`);
check(new Set(catalogIds).size === catalogIds.length, "authored archetype IDs must be unique");
check(
  archetypeIds.every((id) => catalogIds.includes(id)) && catalogIds.every((id) => archetypeIds.includes(id)),
  `authored archetypes do not exactly match game archetypes: ${catalogIds.join(", ")}`
);
var globalRouteIds = /* @__PURE__ */ new Set();
var routesById = /* @__PURE__ */ new Map();
var evidenceRouteCount = 0;
var informationalRouteCount = 0;
var choiceCount = 0;
for (const archetype of ARCHETYPES) {
  const routes = AUTHORED_DIALOGUE_BY_ARCHETYPE[archetype.id];
  check(Array.isArray(routes), `${archetype.id}: missing route array`);
  const actualEvidence = routes.flatMap((route) => route.evidenceId ? [route.evidenceId] : []);
  check(new Set(actualEvidence).size === actualEvidence.length, `${archetype.id}: evidence routes must map to distinct evidence IDs`);
  check(routes.filter((route) => !route.evidenceId).length >= 1, `${archetype.id}: expected at least one informational route`);
  const routeQuestions = /* @__PURE__ */ new Set();
  for (const route of routes) {
    check(route.id.trim().length > 0, `${archetype.id}: route has an empty ID`);
    check(!globalRouteIds.has(route.id), `${archetype.id}: duplicate global route ID ${route.id}`);
    globalRouteIds.add(route.id);
    routesById.set(route.id, route);
    check(route.topic.trim().length > 0, `${route.id}: missing topic`);
    check(route.rootQuestion.trim().endsWith("?"), `${route.id}: root must be a question`);
    check(route.openingResponse.trim().length > 0, `${route.id}: opening response is empty`);
    const rootFingerprint = normalized(route.rootQuestion);
    check(!routeQuestions.has(rootFingerprint), `${archetype.id}: duplicate root question ${route.rootQuestion}`);
    routeQuestions.add(rootFingerprint);
    if (route.evidenceId) {
      evidenceRouteCount++;
      check(!!EVIDENCE_BY_ID[route.evidenceId], `${route.id}: unknown evidence ID ${route.evidenceId}`);
    } else {
      informationalRouteCount++;
    }
    check(route.stages.length === 2, `${route.id}: expected exactly 2 stages`);
    const allPreDeathText = [
      { location: "root question", text: route.rootQuestion },
      { location: "opening response", text: route.openingResponse }
    ];
    const routeChoiceLabels = /* @__PURE__ */ new Set();
    route.stages.forEach((stage, stageIndex) => {
      check(Object.keys(stage).length === 3, `${route.id} stage ${stageIndex}: expected exactly 3 effects`);
      for (const effect of EFFECTS) {
        const choice = stage[effect];
        check(!!choice, `${route.id} stage ${stageIndex}: missing ${effect} branch`);
        check(choice.label.trim().length > 0, `${route.id} stage ${stageIndex} ${effect}: empty label`);
        check(choice.response.trim().length > 0, `${route.id} stage ${stageIndex} ${effect}: empty response`);
        const fingerprint = normalized(choice.label);
        check(!routeChoiceLabels.has(fingerprint), `${route.id}: duplicate choice label ${choice.label}`);
        routeChoiceLabels.add(fingerprint);
        allPreDeathText.push(
          { location: `stage ${stageIndex} ${effect} label`, text: choice.label },
          { location: `stage ${stageIndex} ${effect} response`, text: choice.response }
        );
        choiceCount++;
      }
    });
    for (const item of allPreDeathText) {
      check(!FORBIDDEN_PRE_DEATH.test(item.text), `${route.id} ${item.location}: forbidden pre-death language in ${JSON.stringify(item.text)}`);
    }
  }
}
check(evidenceRouteCount >= 0, `unexpected evidence route count ${evidenceRouteCount}`);
check(informationalRouteCount >= 10, `expected at least one informational route per archetype, found ${informationalRouteCount}`);
check(choiceCount === (evidenceRouteCount + informationalRouteCount) * 6, `branch choice count ${choiceCount} is inconsistent with route count`);
var CLOSING_KEYS = ["resolve", "noReveal", "shutdown", "pause", "warm", "measured", "hostile"];
var seenClosingLines = /* @__PURE__ */ new Map();
var resolveClosingCount = 0;
var noRevealClosingCount = 0;
var rapportClosingCount = 0;
function validateClosing(routeId, key, closing) {
  const where = `${routeId} closing:${key}`;
  check(closing.line.trim().length > 0, `${where}: empty closing line`);
  check(EMOTIONS.includes(closing.emotion), `${where}: invalid emotion ${closing.emotion}`);
  check(!FORBIDDEN_PRE_DEATH.test(closing.line), `${where}: forbidden knowledge-guard language in ${JSON.stringify(closing.line)}`);
  if (closing.summary !== void 0) {
    check(closing.summary.trim().length > 0, `${where}: empty summary`);
    check(!FORBIDDEN_PRE_DEATH.test(closing.summary), `${where}: forbidden knowledge-guard language in summary`);
  }
  const fingerprint = normalized(closing.line);
  const prior = seenClosingLines.get(fingerprint);
  check(!prior, `${where}: closing line duplicates ${prior}`);
  seenClosingLines.set(fingerprint, where);
}
for (const [routeId, closings] of Object.entries(CLOSINGS_BY_ROUTE)) {
  check(routesById.has(routeId), `closings reference unknown route id ${routeId}`);
  for (const key of Object.keys(closings)) {
    check(CLOSING_KEYS.includes(key), `${routeId}: unknown closing key ${key}`);
  }
  for (const key of CLOSING_KEYS) {
    const closing = closings[key];
    if (closing) validateClosing(routeId, key, closing);
  }
}
for (const route of routesById.values()) {
  const closings = CLOSINGS_BY_ROUTE[route.id];
  if (route.evidenceId) {
    check(!!closings?.resolve, `${route.id}: evidence route is missing a bespoke resolve closing`);
    check(!!closings?.noReveal, `${route.id}: evidence route is missing a bespoke no-reveal closing`);
    resolveClosingCount++;
    noRevealClosingCount++;
  } else {
    check(
      !!closings?.warm && !!closings?.measured && !!closings?.hostile,
      `${route.id}: rapport route must author warm, measured, and hostile closings`
    );
    rapportClosingCount += 3;
  }
}
var PERSONAL_ASIDE_COUNT = 4;
var asideIds = /* @__PURE__ */ new Set();
var asideCount = 0;
var asideReplyCount = 0;
var asideArchetypeIds = Object.keys(PERSONAL_ASIDES_BY_ARCHETYPE);
check(
  archetypeIds.every((id) => asideArchetypeIds.includes(id)) && asideArchetypeIds.every((id) => archetypeIds.includes(id)),
  `personal-aside archetypes do not exactly match game archetypes: ${asideArchetypeIds.join(", ")}`
);
for (const archetype of ARCHETYPES) {
  const asides = PERSONAL_ASIDES_BY_ARCHETYPE[archetype.id];
  check(Array.isArray(asides), `${archetype.id}: missing personal-aside array`);
  check(asides.length === PERSONAL_ASIDE_COUNT, `${archetype.id}: expected ${PERSONAL_ASIDE_COUNT} personal asides, found ${asides.length}`);
  const asideQuestions = /* @__PURE__ */ new Set();
  for (const aside of asides) {
    check(aside.id.trim().length > 0, `${archetype.id}: personal aside has an empty ID`);
    check(!asideIds.has(aside.id), `${archetype.id}: duplicate personal aside ID ${aside.id}`);
    asideIds.add(aside.id);
    asideCount++;
    check(aside.topic.trim().length > 0, `${aside.id}: missing topic`);
    check(aside.rootQuestion.trim().endsWith("?"), `${aside.id}: root must be a question`);
    const rootFingerprint = normalized(aside.rootQuestion);
    check(!asideQuestions.has(rootFingerprint), `${archetype.id}: duplicate aside root question ${aside.rootQuestion}`);
    asideQuestions.add(rootFingerprint);
    check(aside.opening.trim().length > 0, `${aside.id}: empty opening`);
    check(EMOTIONS.includes(aside.openingEmotion), `${aside.id}: invalid opening emotion ${aside.openingEmotion}`);
    check(aside.replies.length >= 2 && aside.replies.length <= 4, `${aside.id}: expected 2\u20134 replies, found ${aside.replies.length}`);
    const guarded = [
      { location: "root question", text: aside.rootQuestion },
      { location: "opening", text: aside.opening }
    ];
    const replyLabels = /* @__PURE__ */ new Set();
    for (const reply of aside.replies) {
      check(reply.label.trim().length > 0, `${aside.id}: empty reply label`);
      check(reply.line.trim().length > 0, `${aside.id}: empty reply line`);
      check(EMOTIONS.includes(reply.emotion), `${aside.id}: invalid reply emotion ${reply.emotion}`);
      const labelFingerprint = normalized(reply.label);
      check(!replyLabels.has(labelFingerprint), `${aside.id}: duplicate reply label ${reply.label}`);
      replyLabels.add(labelFingerprint);
      guarded.push({ location: "reply label", text: reply.label }, { location: "reply line", text: reply.line });
      const lineFingerprint = normalized(reply.line);
      const prior = seenClosingLines.get(lineFingerprint);
      check(!prior, `${aside.id} reply line: duplicates ${prior}`);
      seenClosingLines.set(lineFingerprint, `${aside.id} reply line`);
      asideReplyCount++;
    }
    for (const item of guarded) {
      check(!FORBIDDEN_PRE_DEATH.test(item.text), `${aside.id} ${item.location}: forbidden knowledge-guard language in ${JSON.stringify(item.text)}`);
    }
  }
}
console.log(
  `AUTHORED DIALOGUE VALIDATION PASSED: ${catalogIds.length} archetypes, ${evidenceRouteCount} evidence routes, ${informationalRouteCount} informational routes, ${choiceCount} branch choices, ${resolveClosingCount} resolve closings, ${noRevealClosingCount} no-reveal closings, ${rapportClosingCount} rapport closings, ${asideCount} personal asides, ${asideReplyCount} aside replies`
);
