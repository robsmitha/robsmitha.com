// The dashboard and monthly budget pages: one month at a time, plus trends, recurring charges and paychecks.
import { defineStore } from 'pinia'
import budgetService, {
  type BudgetMonth,
  type IncomeStream,
  type Recurring,
  type SpendingTrend,
  type TargetSave,
} from '@/services/budget.service'

type State = {
  year: number
  month: number
  data: BudgetMonth | null
  loading: boolean
  error: string | null
  trends: SpendingTrend[]
  recurring: Recurring[]
  streams: IncomeStream[]
  proposals: IncomeStream[]
}

const now = new Date()

/** Server validation messages come back as "Field: message"; people only need the message */
const message = (text: string | undefined, fallback: string) => text?.replace(/^[A-Za-z.]+: /, '') || fallback

export const useBudgetStore = defineStore('budget', {
  state: (): State => ({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    data: null,
    loading: false,
    error: null,
    trends: [],
    recurring: [],
    streams: [],
    proposals: [],
  }),
  getters: {
    /** The month before the one shown, for "Copy October" */
    previous: (state) => state.month === 1 ? { year: state.year - 1, month: 12 } : { year: state.year, month: state.month - 1 },
  },
  actions: {
    async fetchMonth () {
      this.loading = true
      const response = await budgetService.getMonth(this.year, this.month)
      this.loading = false
      // Anything that isn't a month's numbers (an error page, a proxy's HTML) is a failed load
      if (!response.success || !Array.isArray(response.data?.lines)) {
        this.error = 'The budget couldn’t be loaded. Try again in a moment.'
        return
      }
      this.error = null
      this.data = response.data
    },

    async go (year: number, month: number) {
      this.year = year
      this.month = month
      await this.fetchMonth()
    },

    async step (by: number) {
      const d = new Date(this.year, this.month - 1 + by, 1)
      await this.go(d.getFullYear(), d.getMonth() + 1)
    },

    /** Saves every target for the month; returns an error message or null */
    async saveTargets (targets: TargetSave[]): Promise<string | null> {
      const response = await budgetService.saveTargets(this.year, this.month, targets)
      if (!response.success) return message(response.errorMessage, 'The targets couldn’t be saved.')
      await this.fetchMonth()
      return null
    },

    async copyPrevious (): Promise<string | null> {
      const p = this.previous
      const response = await budgetService.copyFrom(this.year, this.month, p.year, p.month)
      if (!response.success) return message(response.errorMessage, 'That month couldn’t be copied.')
      await this.fetchMonth()
      return null
    },

    async useAverage (): Promise<string | null> {
      const response = await budgetService.useAverage(this.year, this.month)
      if (!response.success) return message(response.errorMessage, 'The averages couldn’t be worked out.')
      await this.fetchMonth()
      return null
    },

    async setIncomeOverride (amount: number | null): Promise<string | null> {
      const response = await budgetService.setIncomeOverride(this.year, this.month, amount)
      if (!response.success) return message(response.errorMessage, 'Income couldn’t be saved.')
      await this.fetchMonth()
      return null
    },

    async fetchTrends (months = 6) {
      const response = await budgetService.getTrends(months)
      if (response.success && Array.isArray(response.data)) this.trends = response.data
    },

    async fetchRecurring () {
      const response = await budgetService.getRecurring()
      if (response.success && Array.isArray(response.data)) this.recurring = response.data
    },

    async fetchStreams () {
      const response = await budgetService.getIncomeStreams()
      if (response.success && Array.isArray(response.data?.streams)) {
        this.streams = response.data.streams
        this.proposals = response.data.proposals ?? []
      }
    },

    async saveStream (stream: Partial<IncomeStream>): Promise<string | null> {
      const response = await budgetService.saveIncomeStream(stream)
      if (!response.success) return message(response.errorMessage, 'The paycheck couldn’t be saved.')
      await Promise.all([this.fetchStreams(), this.fetchMonth()])
      return null
    },

    async removeStream (id: number) {
      await budgetService.removeIncomeStream(id)
      await Promise.all([this.fetchStreams(), this.fetchMonth()])
    },
  },
})
