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

export type AssistantReply = {
  status: AssistantStatus
  answer: string
  highlights: AssistantHighlight[]
  chart: AssistantChart | null
  links: AssistantLink[]
  followUps: string[]
  steps: string[]
  usage: AssistantUsage
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
}
