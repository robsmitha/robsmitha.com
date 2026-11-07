// The Transactions page: filters, the current page of results, the person's categories and rules.
import { defineStore } from 'pinia'
import transactionService, {
  type Category,
  type Rule,
  type Search,
  type SearchResult,
  type Transaction,
  type TransactionUpdate,
  type TransactionView,
  type Treatment,
} from '@/services/transaction.service'

/** yyyy-mm for the month filter; '' means all time */
function thisMonth () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthRange (month: string): { from?: string, to?: string } {
  if (!month) return {}
  const [y, m] = month.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` }
}

let searchTicket = 0

type State = {
  month: string
  q: string
  accountId: number | null
  categoryId: number | null
  view: TransactionView
  page: number
  pageSize: number
  result: SearchResult | null
  loading: boolean
  error: string | null
  categories: Category[]
  rules: Rule[]
  selectedId: number | null
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): State => ({
    month: thisMonth(),
    q: '',
    accountId: null,
    categoryId: null,
    view: 'all',
    page: 1,
    pageSize: 50,
    result: null,
    loading: false,
    error: null,
    categories: [],
    rules: [],
    selectedId: null,
  }),
  getters: {
    selected: (state): Transaction | null => state.result?.items.find(t => t.id === state.selectedId) ?? null,
    pageCount: (state) => Math.max(1, Math.ceil((state.result?.total ?? 0) / state.pageSize)),
  },
  actions: {
    async search () {
      this.loading = true
      const s: Search = {
        ...monthRange(this.month),
        q: this.q.trim() || undefined,
        accountId: this.accountId,
        categoryId: this.categoryId,
        view: this.view,
        page: this.page,
        pageSize: this.pageSize,
      }
      // When searches overlap (typing, quick filter changes) only the latest one's results count
      const ticket = ++searchTicket
      const response = await transactionService.search(s)
      if (ticket !== searchTicket) return
      this.loading = false
      // Anything that isn't a page of results (an error page, a proxy's HTML) is treated as a failed load
      if (!response.success || !Array.isArray(response.data?.items) || !response.data?.counts) {
        this.error = 'Transactions couldn’t be loaded. Try again in a moment.'
        return
      }
      this.error = null
      this.result = response.data
    },

    /** Any filter change starts again at page 1 */
    async setFilters (changes: Partial<Pick<State, 'month' | 'q' | 'accountId' | 'categoryId' | 'view'>>) {
      Object.assign(this, changes)
      this.page = 1
      await this.search()
    },

    async fetchCategories () {
      const response = await transactionService.getCategories()
      if (response.success && Array.isArray(response.data)) this.categories = response.data
    },

    async fetchRules () {
      const response = await transactionService.getRules()
      if (response.success && Array.isArray(response.data)) this.rules = response.data
    },

    /** Saves a change; returns an error message, or null when it worked. */
    async update (update: TransactionUpdate): Promise<string | null> {
      const response = await transactionService.update(update)
      if (!response.success) {
        return response.errorMessage?.replace(/^[A-Za-z.]+: /, '') ?? 'That change couldn’t be saved.'
      }
      // A rule or a treatment change can move other rows and the counts, so reload the page of results
      await this.search()
      if (update.createRule) await this.fetchRules()
      return null
    },

    /** True when the changes were saved */
    async bulkUpdate (ids: number[], categoryId: number | null, treatment: Treatment | null) {
      const response = await transactionService.bulkUpdate(ids, categoryId, treatment)
      if (!response.success) this.error = 'Those changes couldn’t be saved.'
      await this.search()
      return response.success
    },

    async deleteRule (id: number) {
      await transactionService.deleteRule(id)
      await Promise.all([this.fetchRules(), this.search()])
    },
  },
})
