// The debt page and the dashboard's debt card
import { defineStore } from 'pinia'
import debtService, { type Debt, type DebtPlan, type DebtStrategy } from '@/services/debt.service'

const message = (text: string | undefined, fallback: string) => text?.replace(/^[A-Za-z.]+: /, '') || fallback

export const useDebtStore = defineStore('debt', {
  state: () => ({
    data: null as DebtPlan | null,
    /** What-if extra per month (not saved) */
    extra: 0,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    /** The latest month of plan vs. actual, for the headline status */
    latest: (state) => state.data?.history.at(-1) ?? null,
  },
  actions: {
    async fetch () {
      this.loading = true
      const response = await debtService.getPlan(this.extra)
      this.loading = false
      if (!response.success || !Array.isArray(response.data?.debts)) {
        this.error = 'The debt plan couldn’t be loaded. Try again in a moment.'
        return
      }
      this.error = null
      this.data = response.data
    },

    async saveDebt (debt: Partial<Debt>): Promise<string | null> {
      const response = await debtService.saveDebt(debt)
      if (!response.success) return message(response.errorMessage, 'That debt couldn’t be saved.')
      await this.fetch()
      return null
    },

    async removeDebt (id: number) {
      await debtService.removeDebt(id)
      await this.fetch()
    },

    async savePlan (monthlyAmount: number, strategy: DebtStrategy, customOrder: number[] | null): Promise<string | null> {
      const response = await debtService.savePlan(monthlyAmount, strategy, customOrder)
      if (!response.success) return message(response.errorMessage, 'The plan couldn’t be saved.')
      await this.fetch()
      return null
    },
  },
})
