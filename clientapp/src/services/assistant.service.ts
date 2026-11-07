// The budget assistant drawer (docs/assistant-plan.md)
import elysianClient from '@/api/elysianClient'
import { localToday } from '@/services/budget.service'

export type AssistantStatus = 'answered' | 'needs_clarification' | 'no_data' | 'out_of_scope' | 'fallback' | 'unavailable'

export type AssistantHighlight = { label: string, value: string }
export type AssistantLink = { label: string, to: string }

/** Chart data comes from a tool result on the server, never from the model */
export type AssistantChart = {
  kind: 'bar' | 'line'
  title: string
  labels: string[]
  values: number[]
  lastIsPartial: boolean
  average: number | null
}

export type AssistantUsage = {
  enabled: boolean
  dailyLimit: number
  usedToday: number
  remainingToday: number
  resetsOn: string
}

/** A transaction a proposal would change */
export type AssistantActionRow = { date: string, merchant: string, amount: number, from: string, to: string }

export type AssistantActionStatus = 'proposed' | 'confirmed' | 'cancelled' | 'expired' | 'undone' | 'failed'

/**
 * A change the assistant proposed (docs/assistant-actions-plan.md §5). Everything on it comes from the server; nothing
 * changes until the person taps Confirm.
 */
export type AssistantAction = {
  id: string
  kind: 'Recategorize' | 'SetTreatment' | 'Rule' | 'Target' | 'Category'
  status: AssistantActionStatus
  title: string
  subtitle: string | null
  rows: AssistantActionRow[]
  moreRows: number
  changes: { label: string, before: string, after: string }[]
  facts: AssistantHighlight[]
  warnings: string[]
  ruleOffer: { label: string, ticked: boolean } | null
  confirmLabel: string
  destructive: boolean
  canUndo: boolean
  canConfirm: boolean
  expiresAt: string
  undoUntil: string | null
  result: string | null
  link: AssistantLink | null
  /** Pages whose data changed: transactions, budget, categories, rules */
  refresh: string[]
}

/** done, stale (changed since it was proposed: confirm the fresh one), cancelled or undone */
export type AssistantActionResult = { outcome: 'done' | 'stale' | 'cancelled' | 'undone', message: string, action: AssistantAction }

export type AssistantReply = {
  status: AssistantStatus
  answer: string
  highlights: AssistantHighlight[]
  chart: AssistantChart | null
  links: AssistantLink[]
  followUps: string[]
  steps: string[]
  usage: AssistantUsage
  action: AssistantAction | null
}

export type AssistantTurn = { role: 'user' | 'assistant', text: string }

export type AssistantAsk = {
  question: string
  history: AssistantTurn[]
  page: string | null
  pageMonth: string | null
}

export default {
  ask: (ask: AssistantAsk) => elysianClient.postData('/api/AskAssistant', { ...ask, today: localToday() }),
  usage: () => elysianClient.getData(`/api/GetAssistantUsage?today=${localToday()}`),
  // Only the card's buttons call these; the assistant itself can't
  confirm: (actionId: string, includeRule: boolean | null) => elysianClient.postData('/api/ConfirmAssistantAction', { actionId, includeRule }),
  cancel: (actionId: string) => elysianClient.postData('/api/CancelAssistantAction', { actionId }),
  undo: (actionId: string) => elysianClient.postData('/api/UndoAssistantAction', { actionId }),
}
