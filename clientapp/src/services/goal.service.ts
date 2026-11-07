// Savings goals (docs/budget-plan.md Phase 5)
import elysianClient from '@/api/elysianClient'
import { localToday } from '@/services/budget.service'

export type GoalCycle = 'OneTime' | 'Annual' | 'Semiannual' | 'Quarterly'
export type GoalCycleEnd = 'Reset' | 'RollOverSurplus'
export type GoalFundingMode = 'Shared' | 'Dedicated'
export type GoalStatus = 'OnTrack' | 'Ahead' | 'Behind' | 'Funded' | 'Overdue'

export type GoalContribution = {
  goalContributionId: number
  date: string
  amount: number
  source: 'Manual' | 'Transfer'
  note: string | null
  bankTransactionId: number | null
}

export type Goal = {
  savingsGoalId: number
  name: string
  icon: string | null
  targetAmount: number
  dueDate: string
  cycleStart: string
  cycle: GoalCycle
  cycleEnd: GoalCycleEnd
  fundingMode: GoalFundingMode
  linkedAccountId: number | null
  linkedAccountName: string | null
  startingBalance: number
  isArchived: boolean
  saved: number
  savedAtMonthStart: number
  expectedByNow: number
  requiredMonthly: number
  monthsLeft: number
  contributedThisMonth: number
  status: GoalStatus
  difference: number
  contributions: GoalContribution[]
  pastCycles: { start: string, due: string, target: number, saved: number }[]
}

export type GoalAccount = { financialAccountId: number, name: string, balance: number, allocated: number, unallocated: number }
export type GoalTransfer = { bankTransactionId: number, date: string, amount: number, accountName: string, name: string }

export type Goals = {
  goals: Goal[]
  neededThisMonth: number
  totalSaved: number
  onTrack: number
  accounts: GoalAccount[]
  transfers: GoalTransfer[]
}

export type AddContribution = { savingsGoalId: number, amount?: number | null, date?: string | null, bankTransactionId?: number | null, note?: string | null }

export const goalService = {
  getGoals: () => elysianClient.getData(`/api/GetGoals?today=${localToday()}`),
  saveGoal: (goal: Partial<Goal>) => elysianClient.postData(`/api/SaveGoal?today=${localToday()}`, goal),
  archiveGoal: (savingsGoalId: number) => elysianClient.postData('/api/ArchiveGoal', { savingsGoalId }),
  addContribution: (c: AddContribution) => elysianClient.postData(`/api/AddGoalContribution?today=${localToday()}`, c),
  removeContribution: (goalContributionId: number) => elysianClient.postData('/api/RemoveGoalContribution', { goalContributionId }),
}

export default goalService
