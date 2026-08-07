import type { EvidenceId, Guest, Settings } from './types'
import type { NarrativeCaseState, ThreadStatus } from './narrative/types'

export const SCORE_VALUES = {
  npcAlive: 100,
  evidenceFound: 150,
  correctAssociation: 75,
  correctlyMarkedInnocent: 25,
  conversationPercent: 1,
  correctAccusation: 1000,
} as const

export interface RunScore {
  total: number
  npcAlive: { count: number; points: number }
  evidenceFound: { count: number; points: number }
  correctAssociations: { count: number; points: number }
  correctlyMarkedInnocent: { count: number; points: number }
  conversations: { completed: number; available: number; percent: number; points: number }
  correctAccusation: { correct: boolean; points: number }
}

const COMPLETED: ReadonlySet<ThreadStatus> = new Set(['resolved', 'spent'])
const AVAILABLE: ReadonlySet<ThreadStatus> = new Set(['open', 'active', 'paused', 'resolved', 'spent'])

export function calculateRunScore(args: {
  guests: Guest[]
  killerId: string
  collectedEvidenceIds: EvidenceId[]
  gameMode: Settings['gameMode']
  guestEvidenceSelections: Record<string, Array<EvidenceId | null>>
  eliminatedGuestIds: string[]
  narrative: NarrativeCaseState
  correctAccusation: boolean
}): RunScore {
  const innocentSurvivors = args.guests.filter(guest => guest.id !== args.killerId && guest.alive).length
  const evidenceFound = new Set(args.collectedEvidenceIds).size
  const guestIds = new Set(args.guests.map(guest => guest.id))
  const correctlyMarkedInnocent = new Set(args.eliminatedGuestIds.filter(id => id !== args.killerId && guestIds.has(id))).size

  let correctAssociations = 0
  for (const guest of args.guests) {
    if (args.gameMode === 'professional') {
      const selected = args.guestEvidenceSelections[guest.id] ?? []
      correctAssociations += selected.filter((id, slot) => id !== null && id === guest.evidenceIds[slot]).length
    } else {
      correctAssociations += new Set(guest.revealedEvidenceIds).size
    }
  }

  const statuses = Object.values(args.narrative.characters).flatMap(character => Object.values(character.threadStatuses))
  const available = statuses.filter(status => AVAILABLE.has(status)).length
  const completed = statuses.filter(status => AVAILABLE.has(status) && COMPLETED.has(status)).length
  const percent = available > 0 ? Math.round((completed / available) * 100) : 0

  const score: RunScore = {
    total: 0,
    npcAlive: { count: innocentSurvivors, points: innocentSurvivors * SCORE_VALUES.npcAlive },
    evidenceFound: { count: evidenceFound, points: evidenceFound * SCORE_VALUES.evidenceFound },
    correctAssociations: { count: correctAssociations, points: correctAssociations * SCORE_VALUES.correctAssociation },
    correctlyMarkedInnocent: {
      count: correctlyMarkedInnocent,
      points: correctlyMarkedInnocent * SCORE_VALUES.correctlyMarkedInnocent,
    },
    conversations: { completed, available, percent, points: percent * SCORE_VALUES.conversationPercent },
    correctAccusation: { correct: args.correctAccusation, points: args.correctAccusation ? SCORE_VALUES.correctAccusation : 0 },
  }
  score.total = score.npcAlive.points
    + score.evidenceFound.points
    + score.correctAssociations.points
    + score.correctlyMarkedInnocent.points
    + score.conversations.points
    + score.correctAccusation.points
  return score
}
