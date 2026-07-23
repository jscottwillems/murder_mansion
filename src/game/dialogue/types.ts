import type { EvidenceId, QuestionTopic } from '../types'

export type AuthoredEmotion = 'neutral' | 'suspicious' | 'worried' | 'angry' | 'thoughtful' | 'surprised'
export type AuthoredEffect = 'advance' | 'stall' | 'close'

/**
 * How an evidence association is finally established. Lets each of the thirty
 * reveal threads land through a distinct, characterful investigative act rather
 * than the same "keep asking until they explain" beat.
 */
export type RevealMechanism =
  | 'comparison'      // hold two samples/objects side by side
  | 'reconstruction'  // re-enact the physical sequence that left the trace
  | 'contradiction'   // catch a claim that cannot both be true
  | 'corroboration'   // confirm against another witness or artifact
  | 'bait'            // offer a false detail only the knower can react to
  | 'chronology'      // pin the trace to an impossible or telling time
  | 'custody'         // trace who handled the object and when

export interface AuthoredDialogueChoice {
  label: string
  response: string
  emotion: AuthoredEmotion
}

/**
 * A bespoke wrap-up for a thread's terminal beat. The `line` is the guest's
 * final spoken statement; `summary` optionally overrides the detective's-eye
 * conclusion box. Every thread should conclude on its own note rather than a
 * single shared boilerplate line.
 */
export interface AuthoredClosing {
  line: string
  emotion: AuthoredEmotion
  summary?: string
}

/**
 * The distinct ways a thread can end. Evidence threads use `resolve` (the guest
 * is genuinely tied to the trace and the association is recorded), `noReveal`
 * (the guest is not tied this case, so the investigative act clears them and
 * nothing is recorded), `shutdown` (the guest refuses to go further), and
 * `pause` (the detective steps back). Because evidence-to-guest assignment
 * shuffles each case, the *same* route may land on `resolve` in one case and
 * `noReveal` in another; both must read naturally after the identical lead-up.
 * Rapport threads use `warm`, `measured`, and `hostile` for their three closing
 * stances. Any field left undefined falls back to already-authored dialogue,
 * then to a generic engine line, so a thread is always playable even before its
 * closings are written.
 */
export interface AuthoredClosings {
  resolve?: AuthoredClosing
  noReveal?: AuthoredClosing
  shutdown?: AuthoredClosing
  pause?: AuthoredClosing
  warm?: AuthoredClosing
  measured?: AuthoredClosing
  hostile?: AuthoredClosing
}

export interface AuthoredDialogueStage {
  advance: AuthoredDialogueChoice
  stall: AuthoredDialogueChoice
  close: AuthoredDialogueChoice
}

export interface AuthoredDialogueRoute {
  id: string
  topic: QuestionTopic
  evidenceId?: EvidenceId
  rootQuestion: string
  openingResponse: string
  openingEmotion: AuthoredEmotion
  stages: [AuthoredDialogueStage, AuthoredDialogueStage]
  /** Optional: the investigative act that closes an evidence thread. */
  revealMechanism?: RevealMechanism
  /** Optional in-world label for the choice that records the association. */
  revealLabel?: string
  /** Optional rapport-gated response option (surfaced only once trust is real). */
  bargain?: AuthoredDialogueChoice
  /** Optional pressure-gated response option (surfaced only once tension is high). */
  challenge?: AuthoredDialogueChoice
}

/**
 * A single detective follow-up within a personal aside and the guest's terminal
 * reply. Asides are pure "get to know them" colour: they only nudge trust or
 * pressure and never touch the evidence graph or personal-ending scoring.
 */
export interface PersonalAsideReply {
  label: string
  line: string
  emotion: AuthoredEmotion
  trust?: number
  pressure?: number
}

/**
 * A lightweight, single-beat personal topic used to keep the interview menu
 * full and fresh once evidence threads appear. Each archetype authors a pool of
 * these; a seed-shuffled subset surfaces per case so the personal filler topics
 * differ every run.
 */
export interface PersonalAside {
  id: string
  topic: QuestionTopic
  rootQuestion: string
  opening: string
  openingEmotion: AuthoredEmotion
  replies: PersonalAsideReply[]
}

export const c = (label: string, response: string, emotion: AuthoredEmotion): AuthoredDialogueChoice => ({ label, response, emotion })
export const rep = (label: string, line: string, emotion: AuthoredEmotion, trust = 0, pressure = 0): PersonalAsideReply => ({ label, line, emotion, ...(trust ? { trust } : {}), ...(pressure ? { pressure } : {}) })
export const pa = (
  id: string, topic: QuestionTopic, rootQuestion: string,
  opening: string, openingEmotion: AuthoredEmotion, replies: PersonalAsideReply[],
): PersonalAside => ({ id, topic, rootQuestion, opening, openingEmotion, replies })
export const s = (advance: AuthoredDialogueChoice, stall: AuthoredDialogueChoice, close: AuthoredDialogueChoice): AuthoredDialogueStage => ({ advance, stall, close })
export const r = (
  id: string, topic: QuestionTopic, evidenceId: EvidenceId | undefined,
  rootQuestion: string, openingResponse: string, openingEmotion: AuthoredEmotion,
  first: AuthoredDialogueStage, second: AuthoredDialogueStage,
  extras: Partial<Pick<AuthoredDialogueRoute, 'revealMechanism' | 'revealLabel' | 'bargain' | 'challenge'>> = {},
): AuthoredDialogueRoute => ({ id, topic, evidenceId, rootQuestion, openingResponse, openingEmotion, stages: [first, second], ...extras })
