// The budget assistant drawer. The conversation lives only here, in memory: nothing about it is stored on the server,
// and a refresh or signing out starts over (docs/assistant-plan.md §0, A4).
import { defineStore } from 'pinia'
import assistantService, { type AssistantReply, type AssistantTurn, type AssistantUsage } from '@/services/assistant.service'

export type AssistantMessage =
  | { id: number, role: 'user', text: string }
  | { id: number, role: 'assistant', reply: AssistantReply }
  /** Couldn't ask at all: over a limit, offline, or a server error */
  | { id: number, role: 'notice', kind: 'limit' | 'error', text: string }

type State = {
  open: boolean
  messages: AssistantMessage[]
  sending: boolean
  usage: AssistantUsage | null
  /** Set once the usage check has answered; false when the person can't use the assistant or it's switched off */
  available: boolean
}

/** Earlier exchanges sent with each question: enough for "and last month?", small enough to stay cheap */
const HistoryExchanges = 6

let nextId = 1

/** Server messages come back as "KEY: message"; people only need the message */
const message = (text: string | undefined, fallback: string) => text?.replace(/^[A-Za-z_.]+: /, '') || fallback

export const useAssistantStore = defineStore('assistant', {
  state: (): State => ({
    open: false,
    messages: [],
    sending: false,
    usage: null,
    available: false,
  }),
  getters: {
    remaining: (state) => state.usage?.remainingToday ?? null,
    outOfQuestions: (state) => state.usage != null && state.usage.remainingToday <= 0,
  },
  actions: {
    async fetchUsage () {
      const response = await assistantService.usage()
      if (response.success && typeof response.data?.enabled === 'boolean') {
        this.usage = response.data
        this.available = response.data.enabled
      } else {
        this.available = false
      }
    },

    toggle (open?: boolean) {
      this.open = open ?? !this.open
    },

    newConversation () {
      if (this.sending) return
      this.messages = []
    },

    /** Plain text of the last few exchanges, oldest first: each question and the answer it got */
    history (): AssistantTurn[] {
      const turns: AssistantTurn[] = []
      for (let i = 0; i < this.messages.length - 1; i++) {
        const q = this.messages[i]
        const a = this.messages[i + 1]
        if (q.role === 'user' && a.role === 'assistant') {
          turns.push({ role: 'user', text: q.text }, { role: 'assistant', text: a.reply.answer })
        }
      }
      return turns.slice(-HistoryExchanges * 2)
    },

    async ask (question: string, page: string | null, pageMonth: string | null) {
      const text = question.trim()
      if (!text || this.sending) return
      const history = this.history()
      this.messages.push({ id: nextId++, role: 'user', text })
      this.sending = true
      const response = await assistantService.ask({ question: text, history, page, pageMonth })
      this.sending = false

      if (response.success && typeof response.data?.answer === 'string') {
        const reply = response.data as AssistantReply
        this.messages.push({ id: nextId++, role: 'assistant', reply })
        this.usage = reply.usage
        return
      }
      if (response.statusCode === 429) {
        this.messages.push({ id: nextId++, role: 'notice', kind: 'limit', text: message(response.errorMessage, 'You’ve reached the limit for now.') })
        await this.fetchUsage()
        return
      }
      this.messages.push({
        id: nextId++,
        role: 'notice',
        kind: 'error',
        text: response.statusCode === 400
          ? message(response.errorMessage, 'That question couldn’t be sent.')
          : 'Something went wrong asking that. Try again in a moment.',
      })
    },
  },
})
