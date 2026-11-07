// The budget assistant drawer. The conversation lives only here, in memory: nothing about it is stored on the server,
// and a refresh or signing out starts over (docs/assistant-plan.md §0, A4).
import { defineStore } from 'pinia'
import assistantService, {
  type AssistantAction,
  type AssistantActionResult,
  type AssistantReply,
  type AssistantTurn,
  type AssistantUsage,
} from '@/services/assistant.service'
import { useTransactionsStore } from '@/store/transactions'
import { useBudgetStore } from '@/store/budget'

export type AssistantMessage =
  | { id: number, role: 'user', text: string }
  | { id: number, role: 'assistant', reply: AssistantReply }
  /** Couldn't ask at all: over a limit, offline, or a server error */
  | { id: number, role: 'notice', kind: 'limit' | 'error', text: string }

/** A line under a proposal card: it changed since, it expired, or the button didn't work */
export type ActionNote = { kind: 'info' | 'error', text: string }

type State = {
  open: boolean
  messages: AssistantMessage[]
  sending: boolean
  usage: AssistantUsage | null
  /** Set once the usage check has answered; false when the person can't use the assistant or it's switched off */
  available: boolean
  /** The card whose Confirm, Cancel or Undo is running */
  busyActionId: string | null
  notes: Record<string, ActionNote>
  /** What a confirm or undo did, for the snackbar */
  snack: string | null
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
    busyActionId: null,
    notes: {},
    snack: null,
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
      if (this.sending || this.busyActionId) return
      this.messages = []
      this.notes = {}
    },

    /** Swaps in the card's new state wherever it's shown */
    replaceAction (action: AssistantAction) {
      for (const m of this.messages) {
        if (m.role === 'assistant' && m.reply.action?.id === action.id) m.reply.action = action
      }
    },

    /** Confirm, Cancel or Undo on a card. Only the person's tap gets here; the assistant can't call these. */
    async act (action: AssistantAction, verb: 'confirm' | 'cancel' | 'undo', includeRule: boolean | null = null) {
      if (this.busyActionId) return
      this.busyActionId = action.id
      delete this.notes[action.id]
      const response = verb === 'confirm'
        ? await assistantService.confirm(action.id, includeRule)
        : verb === 'cancel' ? await assistantService.cancel(action.id) : await assistantService.undo(action.id)
      this.busyActionId = null

      if (response.success && response.data?.action?.id) {
        const result = response.data as AssistantActionResult
        this.replaceAction(result.action)
        if (result.outcome === 'stale') {
          this.notes[action.id] = { kind: 'info', text: result.message }
        } else if (result.outcome === 'done' || result.outcome === 'undone') {
          this.snack = result.message
          await this.refreshPages(result.action.refresh)
        }
        return
      }
      const text = message(response.errorMessage, '')
      if (response.statusCode === 409) {
        // Expired, cancelled elsewhere, or the undo window passed: the card stops offering the button
        if (/expired|any more/i.test(text)) this.replaceAction({ ...action, status: 'expired' })
        this.notes[action.id] = { kind: 'error', text: text || 'That can’t be done now. Ask again to see it fresh.' }
      } else if (response.statusCode === 429) {
        this.notes[action.id] = { kind: 'error', text: text || 'That’s enough changes for today. You can still make them on the pages.' }
      } else if (response.statusCode === 403) {
        this.replaceAction({ ...action, canConfirm: false })
        this.notes[action.id] = { kind: 'error', text: 'You can view this but not change it. Ask the account owner.' }
      } else if (response.statusCode === 404) {
        this.notes[action.id] = { kind: 'error', text: 'That change wasn’t found. Ask again to see it fresh.' }
      } else {
        this.notes[action.id] = { kind: 'error', text: 'That didn’t go through. Nothing was changed; try again in a moment.' }
      }
    },

    /** Reloads whatever the open pages show that the change touched */
    async refreshPages (refresh: string[]) {
      const transactions = useTransactionsStore()
      const budget = useBudgetStore()
      const work: Promise<unknown>[] = []
      if (refresh.includes('transactions') && transactions.result) work.push(transactions.search())
      if (refresh.includes('categories') && transactions.categories.length) work.push(transactions.fetchCategories())
      if (refresh.includes('rules') && transactions.rules.length) work.push(transactions.fetchRules())
      if (refresh.includes('budget') && budget.data) work.push(budget.fetchMonth())
      await Promise.all(work)
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
      // Switched off (Assistant__Enabled): say so, and check again so the button reflects it
      if (response.statusCode === 404) {
        this.messages.push({ id: nextId++, role: 'notice', kind: 'error', text: 'The assistant is switched off right now. Try again later.' })
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
