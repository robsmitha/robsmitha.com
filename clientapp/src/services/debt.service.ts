// Debt payoff plan (docs/budget-plan.md Phase 4)
import elysianClient from '@/api/elysianClient'
import { localToday } from '@/services/budget.service'

export type DebtStrategy = 'Avalanche' | 'Snowball' | 'Custom'

export type Debt = {
  debtId: number
  name: string
  detail: string | null
  financialAccountId: number | null
  source: 'Linked' | 'Manual'
  balance: number
  balanceAsOf: string | null
  isStale: boolean
  apr: number
  minimumPayment: number
  dueDay: number | null
  promoApr: number | null
  promoEndsOn: string | null
  isDeferredInterest: boolean
  detailsConfirmed: boolean
  isActive: boolean
  paidOffMonth: string | null
}

export type PayoffSummary = {
  strategy: DebtStrategy
  monthlyAmount: number
  months: number
  debtFreeMonth: string | null
  totalInterest: number
  neverPaysOff: boolean
}

export type DebtMonth = {
  month: string
  start: number
  interest: number
  paid: number
  end: number
  debts: { debtId: number, start: number, interest: number, payment: number, end: number }[]
}

export type PlanVsActual = {
  month: string
  planned: number
  actual: number | null
  paymentsFound: number
  status: 'Baseline' | 'OnTrack' | 'Ahead' | 'Behind'
  difference: number
  paymentShortfall: number | null
}

export type DebtPlan = {
  debts: Debt[]
  plan: { monthlyAmount: number, strategy: DebtStrategy, customOrder: number[], startDate: string } | null
  monthlyAmount: number
  totalBalance: number
  totalMinimums: number
  strategies: PayoffSummary[]
  selected: { summary: PayoffSummary, paidOff: Record<string, string | null>, schedule: DebtMonth[], warnings: string[] }
  whatIf: PayoffSummary | null
  history: PlanVsActual[]
}

export const debtService = {
  getPlan: (extra = 0) => elysianClient.getData(`/api/GetDebtPlan?extra=${extra}&today=${localToday()}`),
  saveDebt: (debt: Partial<Debt>) => elysianClient.postData('/api/SaveDebt', debt),
  removeDebt: (debtId: number) => elysianClient.postData('/api/RemoveDebt', { debtId }),
  savePlan: (monthlyAmount: number, strategy: DebtStrategy, customOrder: number[] | null) =>
    elysianClient.postData(`/api/SaveDebtPlan?today=${localToday()}`, { monthlyAmount, strategy, customOrder }),
}

export default debtService
