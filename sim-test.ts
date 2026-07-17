// Headless smoke test for the simulation (run with node after esbuild bundling)
import { Simulation } from './src/game/sim'
import { ARCHETYPES, EVIDENCE_BY_ARCHETYPE, SCENE_EVIDENCE, NIGHT_LENGTH_MIN } from './src/game/data'
import type { QuestionTopic } from './src/game/types'

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

// evidence matrix: exactly three traces per archetype, and no unique trace that
// could reveal a murderer from one examination.
for (const a of ARCHETYPES) {
  console.assert(EVIDENCE_BY_ARCHETYPE[a.id].length === 3, `${a.id} should leave exactly 3 evidence types`)
}
for (const evidence of SCENE_EVIDENCE) {
  console.assert(evidence.archetypeIds.length > 1, `${evidence.id} must implicate multiple archetypes`)
}

const evidenceSim = new Simulation(54321, {
  log: () => {}, lead: () => {}, guestDied: () => {}, bodyDiscovered: () => {}, overheard: () => {},
})
const evidenceKiller = evidenceSim.byId(evidenceSim.killerId)!
const evidenceVictim = evidenceSim.guests.find(g => g.id !== evidenceKiller.id)!
evidenceSim['commitMurder'](evidenceKiller, evidenceVictim)
console.assert(
  evidenceKiller.killCooldownUntilMin >= evidenceSim.clockMin + 30 &&
  evidenceKiller.killCooldownUntilMin < evidenceSim.clockMin + 45,
  'repeat murder cooldown should be randomized between 30 and 45 game minutes',
)
console.assert(
  EVIDENCE_BY_ARCHETYPE[evidenceKiller.archetypeId].some(e => e.id === evidenceVictim.evidenceId),
  'murder evidence must come from the killer archetype evidence pool',
)

// The killer must immediately use a legal opportunity (one victim and at
// most one witness), while respecting detective presence and crowd limits.
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
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer should kill immediately with at most one witness')

hunter.killCooldownUntilMin = huntSim.clockMin
hunter.room = prey[2].room = 'ballroom'
huntSim.playerRoom = 'ballroom'
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer must not kill in the detective room')

huntSim.playerRoom = 'library'
prey[3].room = prey[4].room = 'ballroom'
huntSim.decide(hunter)
console.assert(huntSim.aliveCount() === 9, 'killer must not kill with more than one witness')

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
