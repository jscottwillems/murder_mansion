// Shared source of truth for interview response "intent" colors, so the border
// swatch on each dialogue choice matches the key shown in How to Play.

export const INTENT_COLORS: Record<string, string> = {
  rapport: '#9fc4ae',
  analyze: '#aeb8d3',
  test: '#8ac0c4',
  bargain: '#c9a227',
  challenge: '#d3b98a',
  pressure: '#e2a08a',
  withdraw: '#8a8478',
}

/** Neutral border used when a choice carries no intent. */
export const INTENT_DEFAULT_COLOR = '#3a352a'

export interface IntentLegendEntry {
  intent: string
  label: string
  hint: string
}

/** Ordered legend, rendered as a color key in How to Play. */
export const INTENT_LEGEND: IntentLegendEntry[] = [
  { intent: 'rapport', label: 'Rapport', hint: 'Build trust and warmth' },
  { intent: 'analyze', label: 'Analyze', hint: 'Probe a detail, neutrally' },
  { intent: 'test', label: 'Test', hint: 'Push for the concrete proof' },
  { intent: 'bargain', label: 'Bargain', hint: 'Offer a deal — needs trust' },
  { intent: 'challenge', label: 'Challenge', hint: 'Confront — needs pressure' },
  { intent: 'pressure', label: 'Pressure', hint: 'Push hard; may shut them down' },
  { intent: 'withdraw', label: 'Withdraw', hint: 'Step back; revisit later' },
]
