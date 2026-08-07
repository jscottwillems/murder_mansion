import { strict as assert } from 'node:assert'
import { calculateRunScore } from '../../src/game/scoring'
import type { Guest } from '../../src/game/types'
import type { NarrativeCaseState } from '../../src/game/narrative/types'

const guest = (id: string, alive: boolean, evidenceIds: Guest['evidenceIds'], revealed: Guest['revealedEvidenceIds']): Guest => ({
  id, name: id, archetypeId: 'columnist', color: '#fff', colorNum: 0xffffff,
  room: 'study', x: 0, z: 0, tx: 0, tz: 0, state: alive ? 'idle' : 'dead', alive,
  isKiller: id === 'killer', knowledge: [], talkedWith: [], interviewed: false, lastSeenMin: 0,
  talkPartnerId: null, talkUntilMin: 0, nextDecisionMin: 0, killCooldownUntilMin: 0,
  bodyFound: !alive, evidenceId: null, evidenceInvestigated: false, evidenceIds,
  revealedEvidenceIds: revealed, diedAtMin: alive ? -1 : 10, deathRoom: alive ? null : 'study',
})

const guests = [
  guest('killer', true, ['ink-fiber', 'fine-earth'], ['ink-fiber']),
  guest('survivor', true, ['antiseptic'], ['antiseptic']),
  guest('victim', false, ['black-wool'], []),
]
const narrative = {
  characters: {
    killer: { threadStatuses: { a: 'resolved', b: 'open', c: 'latent' } },
    survivor: { threadStatuses: { d: 'spent', e: 'active' } },
    victim: { threadStatuses: { f: 'rerouted' } },
  },
} as unknown as NarrativeCaseState

const standard = calculateRunScore({
  guests, killerId: 'killer', collectedEvidenceIds: ['ink-fiber', 'ink-fiber', 'antiseptic'],
  gameMode: 'standard', guestEvidenceSelections: {}, narrative, correctAccusation: true,
  eliminatedGuestIds: ['survivor', 'killer', 'survivor'],
})
assert.deepEqual(standard.npcAlive, { count: 1, points: 100 })
assert.deepEqual(standard.evidenceFound, { count: 2, points: 300 })
assert.deepEqual(standard.correctAssociations, { count: 2, points: 150 })
assert.deepEqual(standard.correctlyMarkedInnocent, { count: 1, points: 25 })
assert.deepEqual(standard.conversations, { completed: 2, available: 4, percent: 50, points: 50 })
assert.equal(standard.correctAccusation.points, 1000)
assert.equal(standard.total, 1625)

const professional = calculateRunScore({
  guests, killerId: 'killer', collectedEvidenceIds: [], gameMode: 'professional',
  guestEvidenceSelections: { killer: ['ink-fiber', 'antiseptic'], survivor: ['antiseptic'] },
  narrative, correctAccusation: false,
  eliminatedGuestIds: ['victim', 'unknown'],
})
assert.equal(professional.correctAssociations.count, 2)
assert.deepEqual(professional.correctlyMarkedInnocent, { count: 1, points: 25 })
assert.equal(professional.correctAccusation.points, 0)

console.log('run score test passed')
