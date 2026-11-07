// Monthly budget, paychecks, recurring charges and trends (docs/budget-plan.md Phase 3)
import elysianClient from '@/api/elysianClient'
import type { Treatment } from '@/services/transaction.service'

export type CategoryGroup = 'Fixed' | 'Flexible' | 'NonMonthly'
export type PaceStatus = 'OnTrack' | 'OverPace' | 'OverBudget' | 'Paid' | 'Unbudgeted'
export type PayFrequency = 'Weekly' | 'Biweekly' | 'Semimonthly' | 'Monthly'

export type Paycheck = {
  payday: string
  receivedOn: string | null
  name: string
  amount: number
  status: 'Received' | 'Expected' | 'Late'
  accountName: string | null
  incomeStreamId: number | null
}

export type Income = {
  total: number
  received: number
  expected: number
  override: number | null
  paychecks: Paycheck[]
  paydays: number
  /** yyyy-MM */
  nextExtraPaycheckMonth: string | null
  streams: number
}

export type UpcomingCharge = {
  date: string
  name: string
  amount: number
  isEstimate: boolean
  categoryId: number | null
  categoryName: string | null
  counted: boolean
  treatment: Treatment
}

export type BudgetLine = {
  categoryId: number
  name: string
  icon: string | null
  group: CategoryGroup
  target: number
  carry: number
  available: number
  rollover: boolean
  spent: number
  pending: number
  left: number
  expectedByNow: number | null
  status: PaceStatus
  projectedOver: number | null
  nextCharge: UpcomingCharge | null
}

export type BudgetAlert = { kind: string, severity: 'error' | 'warning' | 'info', categoryId: number | null, message: string }

export type BudgetMonth = {
  year: number
  month: number
  isCurrent: boolean
  dayOfMonth: number
  daysInMonth: number
  daysLeft: number
  hasBudget: boolean
  income: Income
  committedDebt: number
  committedGoals: number
  committed: number
  spent: number
  pendingSpent: number
  assigned: number
  leftInBudget: number
  safeToSpend: number
  safePerDay: number | null
  unassigned: number
  lines: BudgetLine[]
  groups: { group: CategoryGroup, spent: number, available: number }[]
  uncategorized: { count: number, amount: number, example: string | null, exampleAmount: number | null }
  notCounted: { cardPayments: number, cardPaymentsTotal: number, transfers: number, transfersTotal: number, refunds: number, refundsTotal: number, hidden: number }
  upcoming: UpcomingCharge[]
  alerts: BudgetAlert[]
}

export type TargetSave = { categoryId: number, amount: number, rollover: boolean }

export type Recurring = {
  merchantKey: string
  name: string
  cadence: 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  amount: number
  isVariable: boolean
  priceChange: number | null
  lastDate: string
  nextDate: string
  categoryId: number | null
  categoryName: string | null
  counted: boolean
  treatment: Treatment
  occurrences: number
}

export type SpendingTrend = { year: number, month: number, total: number, isPartial: boolean, categories: { categoryId: number, name: string, amount: number }[] }

export type IncomeStream = {
  incomeStreamId: number
  name: string
  merchantKey: string
  frequency: PayFrequency
  anchorDate: string
  expectedAmount: number
  isActive: boolean
  nextPayday: string | null
  deposits: number | null
}

export type NotificationSettings = { emailEnabled: boolean, bankAlerts: boolean, budgetAlerts: boolean, goalAlerts: boolean }

/** The browser's date, so "today" matches the person's time zone */
export function localToday () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const budgetService = {
  getMonth: (year: number, month: number) =>
    elysianClient.getData(`/api/GetBudgetMonth?year=${year}&month=${month}&today=${localToday()}`),
  saveTargets: (year: number, month: number, targets: TargetSave[]) =>
    elysianClient.postData('/api/SaveBudgetTargets', { year, month, targets }),
  copyFrom: (year: number, month: number, fromYear: number, fromMonth: number) =>
    elysianClient.postData('/api/CopyBudgetTargets', { year, month, fromYear, fromMonth, averageOfLast3: false }),
  useAverage: (year: number, month: number) =>
    elysianClient.postData('/api/CopyBudgetTargets', { year, month, averageOfLast3: true }),
  setIncomeOverride: (year: number, month: number, amount: number | null) =>
    elysianClient.postData('/api/SetIncomeOverride', { year, month, amount }),
  getTrends: (months = 6) => elysianClient.getData(`/api/GetSpendingTrends?months=${months}&today=${localToday()}`),
  getRecurring: () => elysianClient.getData(`/api/GetRecurring?today=${localToday()}`),
  getIncomeStreams: () => elysianClient.getData('/api/GetIncomeStreams'),
  saveIncomeStream: (stream: Partial<IncomeStream>) => elysianClient.postData('/api/SaveIncomeStream', stream),
  removeIncomeStream: (incomeStreamId: number) => elysianClient.postData('/api/RemoveIncomeStream', { incomeStreamId }),
  getNotificationSettings: () => elysianClient.getData('/api/GetNotificationSettings'),
  saveNotificationSettings: (settings: NotificationSettings) => elysianClient.postData('/api/SaveNotificationSettings', settings),
}

export default budgetService
