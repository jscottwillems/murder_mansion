// Headless smoke test for the simulation (run with node after esbuild bundling)
import { Simulation } from './src/game/sim'
import { SCENE_EVIDENCE, NIGHT_LENGTH_MIN } from './src/game/data'
import type { QuestionTopic } from './src/game/types'
import { parseInterviewAnswer } from './src/game/llm'

let deaths = 0
let discoveries = 0
let logs = 0
let leads = 0

const sim = new Simulation(12345, {
  log: () => { logs++ },
  lead: () => { leads++ },
  guestDied: () => { deaths++ },
  bodyDiscovered: () => { discoveries++ },
  overheard: () => {},
})

// sanity: 10 guests, exactly 1 killer
console.assert(sim.guests.length === 10, 'expected 10 guests')
console.assert(sim.guests.filter(g => g.isKiller).length === 1, 'expected 1 killer')

const openingVictim = sim.createOpeningCrime()
console.assert(!openingVictim.alive && openingVictim.bodyFound, 'the case must begin with a discovered murder')
console.assert(openingVictim.id !== sim.killerId, 'the opening victim cannot be the killer')
console.assert(sim.aliveCount() === 9, 'nine suspects should remain after the opening murder')
console.assert(openingVictim.evidenceId !== null, 'the opening scene should carry killer-linked evidence')

// The per-case shuffled evidence matrix remains balanced: three traces per
// guest and three possible owners per trace.
for (const guest of sim.guests) {
  console.assert(guest.evidenceIds.length === 3, `${guest.archetypeId} should leave exactly 3 evidence types`)
  console.assert(guest.revealedEvidenceIds.length === 0, `${guest.archetypeId} evidence should begin hidden`)
}
for (const evidence of SCENE_EVIDENCE) {
  console.assert(sim.guests.filter(g => g.evidenceIds.includes(evidence.id)).length === 3, `${evidence.id} should have exactly three possible owners`)
}
const builtInEvidenceGuest = sim.guests[0]
for (const evidence of SCENE_EVIDENCE) {
  const result = sim.answerQuestion(builtInEvidenceGuest, 'room', 'dining', evidence.id)
  console.assert(result.answer.length > 40, `built-in ${evidence.id} clue should add a substantive indirect detail`)
  console.assert(!result.answer.toLowerCase().includes(evidence.label.toLowerCase()), `built-in ${evidence.id} clue must not state the journal label`)
}

const evidenceTagged = parseInterviewAnswer('I keep a little bottle for cleaning the tools; the odor does linger. [thoughtful] [continue] [evidence]')
console.assert(evidenceTagged.text.includes('little bottle') && !evidenceTagged.text.includes('[evidence]'), 'evidence control tag should be stripped from dialogue')
console.assert(evidenceTagged.evidenceMentioned, 'evidence control tag should confirm an incorporated clue')
const noEvidenceTagged = parseInterviewAnswer('I was in the gallery all evening. [neutral] [closed] [no-evidence]')
console.assert(!noEvidenceTagged.evidenceMentioned && noEvidenceTagged.concluded, 'no-evidence answers should not unlock journal evidence')

const evidenceSim = new Simulation(54321, {
  log: () => {}, lead: () => {}, guestDied: () => {}, bodyDiscovered: () => {}, overheard: () => {},
})
const evidenceKiller = evidenceSim.byId(evidenceSim.killerId)!
const evidenceVictim = evidenceSim.guests.find(g => g.id !== evidenceKiller.id)!
evidenceKiller.room = evidenceVictim.room = 'study'
evidenceSim.playerRoom = 'dining'
evidenceSim['commitMurder'](evidenceKiller, evidenceVictim)
console.assert(
  evidenceKiller.killCooldownUntilMin >= evidenceSim.clockMin + 30 &&
  evidenceKiller.killCooldownUntilMin < evidenceSim.clockMin + 45,
  'repeat murder cooldown should be randomized between 30 and 45 game minutes',
)
console.assert(
  evidenceKiller.evidenceIds.includes(evidenceVictim.evidenceId!),
  'murder evidence must come from the killer evidence pool for this case',
)
console.assert(evidenceKiller.room !== 'study', 'killer must teleport out of the murder room')
console.assert(evidenceKiller.room !== evidenceSim.playerRoom, 'killer must not teleport into the detective room')
console.assert(evidenceKiller.state === 'idle', 'killer must arrive immediately instead of walking from the scene')
console.assert(evidenceSim['paths'][evidenceKiller.id] === undefined, 'killer must not retain a route from the murder scene')

// The killer must share a room with a victim for five uninterrupted real
// seconds, while still respecting detective presence and crowd limits.
const huntSim = new Simulation(24680, {
  log: () => {}, lead: () => {}, guestDied: () => {}, bodyDiscovered: () => {}, overheard: () => {},
})
const hunter = huntSim.byId(huntSim.killerId)!
const prey = huntSim.guests.filter(g => g.id !== hunter.id)
huntSim.clockMin = 30
hunter.killCooldownUntilMin = 25
for (const g of huntSim.guests) g.room = 'study'
hunter.room = prey[0].room = prey[1].room = 'kitchen'
huntSim.playerRoom = 'library'
huntSim['updateMurderColocation'](4.99)
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 10, 'killer must not kill before five shared seconds')
huntSim['updateMurderColocation'](0.01)
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer should kill after five shared seconds with at most one witness')

hunter.killCooldownUntilMin = huntSim.clockMin
hunter.room = prey[2].room = 'ballroom'
huntSim.playerRoom = 'ballroom'
huntSim['updateMurderColocation'](5)
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer must not kill in the detective room')

huntSim.playerRoom = 'library'
prey[3].room = prey[4].room = 'ballroom'
huntSim['updateMurderColocation'](5)
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer must not kill with more than one witness')

// Leaving the shared room resets the uninterrupted five-second requirement.
for (const g of huntSim.aliveGuests()) if (g.id !== hunter.id) g.room = 'study'
hunter.room = prey[5].room = 'kitchen'
huntSim['updateMurderColocation'](4)
prey[5].room = 'study'
huntSim['updateMurderColocation'](1)
prey[5].room = 'kitchen'
huntSim['updateMurderColocation'](1)
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'leaving and returning must restart the shared-room timer')

// Progressive interview topics must be fully supported by the built-in AI,
// independent of the optional LLM provider. Exercise every archetype against
// a four-victim case, including both branches of the last-seen answer.
const interviewSim = new Simulation(97531, {
  log: () => {}, lead: () => {}, guestDied: () => {}, bodyDiscovered: () => {}, overheard: () => {},
})
const interviewKiller = interviewSim.byId(interviewSim.killerId)!
for (const victim of interviewSim.guests.filter(g => g.id !== interviewKiller.id).slice(0, 4)) {
  interviewSim['commitMurder'](interviewKiller, victim)
  victim.bodyFound = true
}
const latestInterviewVictim = interviewSim.victims().at(-1)!
const progressiveTopics: QuestionTopic[] = ['last_seen', 'connection', 'motive', 'survival', 'next_victim']
for (const guest of interviewSim.guests) {
  for (const topic of progressiveTopics) {
    const result = interviewSim.answerQuestion(guest, topic, 'dining')
    console.assert(result.answer.trim().length > 0, `${guest.archetypeId} returned an empty ${topic} answer`)
    console.assert(!result.answer.includes('undefined'), `${guest.archetypeId} leaked undefined in ${topic}`)
  }
}
const noContactGuest = interviewSim.guests.find(g => g.id !== latestInterviewVictim.id)!
noContactGuest.talkedWith = noContactGuest.talkedWith.filter(name => name !== latestInterviewVictim.name)
const passingAnswer = interviewSim.answerQuestion(noContactGuest, 'last_seen', 'dining')
console.assert(passingAnswer.answer.includes(latestInterviewVictim.name), 'last-seen answer should name the latest victim')
console.assert(passingAnswer.leads.length === 1, 'last-seen answer should create a lead')
noContactGuest.talkedWith.push(latestInterviewVictim.name)
const contactAnswer = interviewSim.answerQuestion(noContactGuest, 'last_seen', 'dining')
console.assert(contactAnswer.answer.includes('spoke with'), 'last-seen answer should acknowledge prior contact')
console.assert(contactAnswer.leads.length === 1, 'prior-contact answer should create a lead')

// With only the killer left, late-game questions must still return cleanly
// instead of trying to select a nonexistent guest.
const endgameSim = new Simulation(86420, {
  log: () => {}, lead: () => {}, guestDied: () => {}, bodyDiscovered: () => {}, overheard: () => {},
})
const endgameKiller = endgameSim.byId(endgameSim.killerId)!
for (const victim of endgameSim.guests.filter(g => g.id !== endgameKiller.id)) {
  endgameSim['commitMurder'](endgameKiller, victim)
  victim.bodyFound = true
}
for (const topic of progressiveTopics) {
  const result = endgameSim.answerQuestion(endgameKiller, topic, 'dining')
  console.assert(result.answer.trim().length > 0 && !result.answer.includes('undefined'), `single-survivor ${topic} answer failed`)
}

// simulate a full night: 0.25 real-second steps at 1 min/s => 360*4 steps
sim.playerRoom = 'library'
const topics: QuestionTopic[] = [
  'timeline', 'suspicion', 'intel', 'alibi', 'room', 'pressure', 'social', 'victim',
  ...progressiveTopics,
]
for (let i = 0; i < NIGHT_LENGTH_MIN * 4; i++) {
  sim.advance(0.25, 1)
  // periodically interview someone to exercise answer generation
  if (i % 120 === 0) {
    const g = sim.aliveGuests()[0]
    if (g) {
      for (const t of topics) {
        const r = sim.answerQuestion(g, t, 'library')
        console.assert(typeof r.answer === 'string' && r.answer.length > 0, `empty answer for ${t}`)
      }
    }
  }
  // player wanders to discover bodies
  if (i % 200 === 0) {
    const rooms = ['study', 'gallery', 'conservatory', 'kitchen', 'dining', 'ballroom', 'cellar', 'library', 'suite'] as const
    for (const r of rooms) {
      sim.playerRoom = r
      const found = sim.playerDiscovers(r)
      discoveries += found.length
    }
    sim.playerRoom = 'library'
  }
}

// positions must stay finite and inside the mansion bounds
for (const g of sim.guests) {
  console.assert(Number.isFinite(g.x) && Number.isFinite(g.z), `bad position for ${g.name}`)
  console.assert(Math.abs(g.x) < 20 && Math.abs(g.z) < 20, `out of bounds: ${g.name} ${g.x},${g.z}`)
}

console.log(`night complete: clock=${sim.clockMin} deaths=${deaths} discoveries=${discoveries} logs=${logs} leads=${leads}`)
console.log(`alive=${sim.aliveCount()} killer=${sim.byId(sim.killerId)?.name}`)
console.assert(deaths > 0, 'killer should eliminate at least one NPC during a full night')
console.log('SIM SMOKE TEST PASSED')
