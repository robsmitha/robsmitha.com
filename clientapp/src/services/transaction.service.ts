import elysianClient from '@/api/elysianClient'

export type Treatment = 'Spending' | 'Income' | 'Refund' | 'Transfer' | 'CardPayment' | 'Hidden'
export type Source = 'Auto' | 'Rule' | 'User'
export type TransactionView = 'all' | 'spending' | 'notCounted' | 'review' | 'pending'
export type RuleField = 'Merchant' | 'Description' | 'PlaidCategory'
export type CategoryGroup = 'Fixed' | 'Flexible' | 'NonMonthly'

export type Category = {
  financialCategoryId: number
  name: string
  systemKey: string | null
  icon: string | null
  group: CategoryGroup
  isArchived: boolean
}

export type Split = { categoryId: number | null, categoryName?: string | null, amount: number, notes?: string | null }

export type Transaction = {
  id: number
  transaction_id: string
  date: string
  authorized_date: string | null
  name: string
  merchant_name: string | null
  amount: number
  pending: boolean
  category: Category | null
  account: { account_id: string, name: string, mask: string | null, type: string, subtype: string | null }
  treatment: Treatment
  treatmentSource: Source
  categorySource: Source
  notes: string | null
  splits: Split[]
  accountRole: 'Spending' | 'IncomeOnly' | 'Savings' | 'Ignore'
  plaidCategory: string | null
  isCounted: boolean
}

export type ViewCounts = { all: number, spending: number, notCounted: number, review: number, pending: number }

export type SearchResult = { items: Transaction[], total: number, counts: ViewCounts, countedTotal: number }

export type Search = {
  from?: string
  to?: string
  q?: string
  accountId?: number | null
  categoryId?: number | null
  view?: TransactionView
  page?: number
  pageSize?: number
}

export type TransactionUpdate = {
  id: number
  categoryId?: number | null
  clearCategory?: boolean
  treatment?: Treatment | null
  resetTreatment?: boolean
  resetCategory?: boolean
  notes?: string | null
  splits?: { categoryId: number | null, amount: number, notes?: string | null }[] | null
  createRule?: { field: RuleField, value: string, applyToPast: boolean } | null
}

export type Rule = {
  categoryRuleId: number
  field: RuleField
  match: 'Equals' | 'Contains'
  value: string
  direction: 'Any' | 'Out' | 'In'
  setCategoryId: number | null
  setCategoryName: string | null
  setTreatment: Treatment | null
  priority: number
}

export const transactionService = {
  search (s: Search) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(s)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
    }
    return elysianClient.getData(`/api/SearchTransactions?${params}`)
  },
  update: (u: TransactionUpdate) => elysianClient.postData('/api/UpdateTransaction', u),
  bulkUpdate: (ids: number[], categoryId: number | null, treatment: Treatment | null) =>
    elysianClient.postData('/api/BulkUpdateTransactions', { ids, categoryId, treatment }),

  getCategories: (includeArchived = false) => elysianClient.getData(`/api/FinancialCategories${includeArchived ? '?includeArchived=true' : ''}`),
  saveCategory: (c: Partial<Category> & { name: string }) =>
    elysianClient.postData('/api/SaveFinancialCategory', { ...c, budgetId: 0 }),
  archiveCategory: (categoryId: number, mergeIntoCategoryId: number | null) =>
    elysianClient.postData('/api/ArchiveCategory', { categoryId, mergeIntoCategoryId }),

  getRules: () => elysianClient.getData('/api/GetCategoryRules'),
  deleteRule: (categoryRuleId: number) => elysianClient.postData('/api/DeleteCategoryRule', { categoryRuleId }),
  previewRule: (rule: Partial<Rule>) => elysianClient.postData('/api/PreviewCategoryRule', rule),
}

export default transactionService
