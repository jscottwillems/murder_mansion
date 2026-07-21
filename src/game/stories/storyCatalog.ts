import type { ConversationEmotion, QuestionTopic } from '../types'
import { STORY_PACK_A } from './storyPackA'
import { STORY_PACK_B } from './storyPackB'
import { STORY_PACK_C } from './storyPackC'

export interface StoryRuntimeState {
  nodeId: string | null
  trust: number
  pressure: number
  flags: string[]
  evidence: string[]
  endingId: string | null
  offered: RuntimeStoryChoice[]
  usedChoices: string[]
}

export interface RuntimeStoryChoice {
  id: string
  label: string
}

export interface RuntimeStoryBeat {
  text: string
  emotion: ConversationEmotion
  choices: RuntimeStoryChoice[]
  endingId?: string
  endingTitle?: string
  unlockedEvidence: string[]
}

export interface RuntimeCharacterStory {
  archetypeId: string
  title: string
  premise: string
  rootQuestions(state: StoryRuntimeState): { id: string; topic: QuestionTopic; label: string }[]
  choose(state: StoryRuntimeState, choiceId: string): RuntimeStoryBeat | null
}

const flagsOf = (state: StoryRuntimeState) => new Set(state.flags)
const addUnique = (items: string[], additions: string[] = []) => [...new Set([...items, ...additions])]
const endingText = (title: string, text: string, epilogue?: string) => epilogue ? `${title} — ${text} ${epilogue}` : `${title} — ${text}`

// First-contact questions must be things the detective can reasonably notice
// before a character has disclosed any part of their private storyline.
const FIRST_CONTACT_OPENERS: Record<string, string[]> = {
  columnist: [
    'You have not let go of that notebook since dinner. What are you protecting?',
    'There is a page missing from your notebook. Did you tear it out?',
    'You keep watching the gallery door. What happened there?',
  ],
  surgeon: [
    'That sharp antiseptic smell is coming from your cuff. What happened?',
    'You have washed your hands three times since I arrived. Why?',
    'There is a fresh chemical mark on your sleeve. May I ask how it got there?',
  ],
  curator: [
    'You keep checking the orchid by the window. What is wrong with it?',
    'That orchid has two different kinds of soil around its roots. Why?',
    'You looked alarmed when someone moved that flowerpot. What did you notice?',
  ],
  antiquarian: [
    'You apologized to that cabinet after touching it. What did you find?',
    'You have been studying that cabinet hinge for several minutes. What is unusual about it?',
    'There is pale dust on your sleeve and beneath that cabinet. Where did it come from?',
  ],
  chauffeur: [
    'Your cuffs smell of petrol, but the drive is flooded. Have you been working on the car?',
    'You keep checking the rain through the front window. Were you expecting to drive tonight?',
    'I heard an engine turn over before midnight. Was that you?',
  ],
  vocalist: [
    'You stopped halfway through your last song. Why?',
    'That request card unsettled you. What did it ask you to sing?',
    'You changed the words in the final verse. Was that deliberate?',
  ],
  debutante: [
    'You watched the other players more closely than your cards. What did you see?',
    'You seemed almost pleased to lose every hand. Were you distracting them?',
    'When the brass key changed hands, you were the only person watching. Who took it?',
  ],
}

const firstContactRoots = (archetypeId: string, nodeId: string, topic: QuestionTopic) =>
  (FIRST_CONTACT_OPENERS[archetypeId] ?? []).map((label, index) => ({ id: `story-root:${nodeId}|${index}`, topic, label }))

const rootNodeId = (choiceId: string) => choiceId.slice('story-root:'.length).split('|')[0]

function packAStory(story: (typeof STORY_PACK_A)[keyof typeof STORY_PACK_A]): RuntimeCharacterStory {
  const available = (state: StoryRuntimeState, choice: (typeof story.nodes)[string]['choices'][number]) => {
    if (state.usedChoices.includes(choice.id)) return false
    const c = choice.condition
    const flags = flagsOf(state)
    if (!c) return true
    if (c.flag && !flags.has(c.flag)) return false
    if (c.notFlag && flags.has(c.notFlag)) return false
    if (c.minTrust !== undefined && state.trust < c.minTrust) return false
    if (c.maxTrust !== undefined && state.trust > c.maxTrust) return false
    if (c.hasEvidence && !state.evidence.includes(c.hasEvidence)) return false
    if (c.lacksEvidence && state.evidence.includes(c.lacksEvidence)) return false
    return true
  }
  return {
    archetypeId: story.archetypeId, title: story.title, premise: story.premise,
    rootQuestions: state => state.endingId ? [] : firstContactRoots(story.archetypeId, story.startNodeId, story.nodes[story.startNodeId].topic),
    choose(state, choiceId) {
      if (choiceId.startsWith('story-root:')) {
        const node = story.nodes[rootNodeId(choiceId)]
        if (!node) return null
        state.nodeId = node.id
        return { text: node.speakerText, emotion: node.emotion, choices: node.choices.filter(c => available(state, c)).map(c => ({ id: c.id, label: c.label })), unlockedEvidence: [] }
      }
      const node = state.nodeId ? story.nodes[state.nodeId] : undefined
      const selected = node?.choices.find(c => c.id === choiceId && available(state, c))
      if (!selected) return null
      state.usedChoices = addUnique(state.usedChoices, [selected.id])
      state.trust += selected.effects?.trust ?? 0
      state.flags = addUnique(state.flags.filter(f => !selected.effects?.clearFlags?.includes(f)), selected.effects?.setFlags)
      const unlockedEvidence = (selected.effects?.unlockEvidence ?? []).filter(id => !state.evidence.includes(id))
      state.evidence = addUnique(state.evidence, unlockedEvidence)
      if (selected.next.startsWith('ending:')) {
        const ending = story.endings[selected.next.slice(7)]
        if (!ending) return null
        state.endingId = ending.id
        return { text: endingText(ending.title, ending.text, ending.epilogue), emotion: ending.tone === 'failure' ? 'angry' : 'thoughtful', choices: [], endingId: ending.id, endingTitle: ending.title, unlockedEvidence }
      }
      const next = story.nodes[selected.next]
      if (!next) return null
      state.nodeId = next.id
      return { text: next.speakerText, emotion: next.emotion, choices: next.choices.filter(c => available(state, c)).map(c => ({ id: c.id, label: c.label })), unlockedEvidence }
    },
  }
}

function packBStory(story: (typeof STORY_PACK_B)[keyof typeof STORY_PACK_B]): RuntimeCharacterStory {
  const eligible = (state: StoryRuntimeState, when?: { all?: string[]; any?: string[]; none?: string[]; trustAtLeast?: number; pressureAtLeast?: number }) => {
    if (!when) return true
    const flags = flagsOf(state)
    return !(when.all?.some(f => !flags.has(f)) || (when.any?.length && !when.any.some(f => flags.has(f))) || when.none?.some(f => flags.has(f)) || (when.trustAtLeast !== undefined && state.trust < when.trustAtLeast) || (when.pressureAtLeast !== undefined && state.pressure < when.pressureAtLeast))
  }
  const nodeBeat = (state: StoryRuntimeState, nodeId: string, unlockedEvidence: string[] = []): RuntimeStoryBeat | null => {
    const node = story.nodes[nodeId]
    if (!node) return null
    state.nodeId = node.id
    const response = node.responses.find(r => eligible(state, r.when)) ?? node.responses[node.responses.length - 1]
    return { text: response.text, emotion: response.emotion, choices: node.choices.filter(c => !state.usedChoices.includes(c.id) && eligible(state, c.when)).map(c => ({ id: c.id, label: c.label })), unlockedEvidence }
  }
  return {
    archetypeId: story.archetypeId, title: story.title, premise: story.premise,
    rootQuestions: state => state.endingId ? [] : story.entryNodeIds.map(id => ({ id: `story-root:${id}`, topic: story.nodes[id].topic, label: story.nodes[id].prompt })),
    choose(state, choiceId) {
      if (choiceId.startsWith('story-root:')) return nodeBeat(state, choiceId.slice(11))
      const node = state.nodeId ? story.nodes[state.nodeId] : undefined
      const selected = node?.choices.find(c => c.id === choiceId && eligible(state, c.when))
      if (!selected) return null
      state.usedChoices = addUnique(state.usedChoices, [selected.id])
      state.trust += selected.effects?.trust ?? 0
      state.pressure += selected.effects?.pressure ?? 0
      state.flags = addUnique(state.flags, selected.effects?.setFlags)
      const evidenceId = selected.effects?.unlockEvidence
      const unlockedEvidence = evidenceId && !state.evidence.includes(evidenceId) ? [evidenceId] : []
      state.evidence = addUnique(state.evidence, unlockedEvidence)
      if (selected.next.startsWith('ending:')) {
        const ending = story.endings[selected.next.slice(7)]
        if (!ending) return null
        state.endingId = ending.id
        return { text: endingText(ending.title, ending.text), emotion: ending.emotion, choices: [], endingId: ending.id, endingTitle: ending.title, unlockedEvidence }
      }
      return nodeBeat(state, selected.next, unlockedEvidence)
    },
  }
}

function packCStory(story: (typeof STORY_PACK_C)[keyof typeof STORY_PACK_C]): RuntimeCharacterStory {
  const nodes = Object.fromEntries(story.nodes.map(n => [n.id, n]))
  const condition = (state: StoryRuntimeState, c: { flag?: string; notFlag?: string; minTrust?: number; maxTrust?: number }) => {
    const flags = flagsOf(state)
    return !(c.flag && !flags.has(c.flag)) && !(c.notFlag && flags.has(c.notFlag)) && !(c.minTrust !== undefined && state.trust < c.minTrust) && !(c.maxTrust !== undefined && state.trust > c.maxTrust)
  }
  const choicesAt = (state: StoryRuntimeState, nodeId: string) => nodes[nodeId].choices.filter(c => !state.usedChoices.includes(c.id) && (!c.requires || c.requires.every(r => condition(state, r)))).map(c => ({ id: c.id, label: c.label }))
  return {
    archetypeId: story.archetypeId, title: story.title, premise: story.premise,
    rootQuestions: state => state.endingId ? [] : firstContactRoots(story.archetypeId, story.startNode, nodes[story.startNode].topic),
    choose(state, choiceId) {
      if (choiceId.startsWith('story-root:')) {
        const node = nodes[rootNodeId(choiceId)]
        if (!node) return null
        state.nodeId = node.id
        return { text: node.opening, emotion: node.emotion, choices: choicesAt(state, node.id), unlockedEvidence: [] }
      }
      const node = state.nodeId ? nodes[state.nodeId] : undefined
      const selected = node?.choices.find(c => c.id === choiceId && (!c.requires || c.requires.every(r => condition(state, r))))
      if (!selected) return null
      state.usedChoices = addUnique(state.usedChoices, [selected.id])
      state.trust += selected.trust ?? 0
      state.flags = addUnique(state.flags, selected.setFlags)
      const destinationNode = nodes[selected.next]
      if (destinationNode) state.nodeId = destinationNode.id
      const unlockedEvidence = story.evidenceUnlocks.filter(e => e.atNode === selected.next && e.requires.every(r => condition(state, r)) && !state.evidence.includes(e.evidenceId)).map(e => e.evidenceId)
      state.evidence = addUnique(state.evidence, unlockedEvidence)
      // A selected ending is always honored. `requires` documents the intended
      // state for writers/tests; it must never turn a visible choice into a dead end.
      const ending = story.endings.find(e => e.id === selected.next)
      if (ending) {
        state.endingId = ending.id
        return { text: `${selected.response} ${endingText(ending.title, ending.text)}`, emotion: selected.emotion, choices: [], endingId: ending.id, endingTitle: ending.title, unlockedEvidence }
      }
      if (!destinationNode) return null
      return { text: `${selected.response} ${destinationNode.opening}`, emotion: destinationNode.emotion, choices: choicesAt(state, destinationNode.id), unlockedEvidence }
    },
  }
}

export const STORY_CATALOG: Record<string, RuntimeCharacterStory> = {
  ...Object.fromEntries(Object.values(STORY_PACK_A).map(story => [story.archetypeId, packAStory(story)])),
  ...Object.fromEntries(Object.values(STORY_PACK_B).map(story => [story.archetypeId, packBStory(story)])),
  ...Object.fromEntries(Object.values(STORY_PACK_C).map(story => [story.archetypeId, packCStory(story)])),
}

export function newStoryState(): StoryRuntimeState {
  return { nodeId: null, trust: 0, pressure: 0, flags: [], evidence: [], endingId: null, offered: [], usedChoices: [] }
}
