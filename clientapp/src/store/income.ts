// Utilities
import { defineStore } from 'pinia'

import incomeService from "@/services/income.service"
import { IncomeSourceSummary, TransactionsResponse } from './types'

type State = {
  incomeSources: IncomeSourceSummary[],
  loadingIncome: boolean,
  transactionsResponse: TransactionsResponse | null,
  loadingTransactions: boolean,
}

export const useIncomeStore = defineStore('income', {
  state: (): State => ({
    incomeSources: [],
    loadingIncome: false,
    transactionsResponse: null,
    loadingTransactions: false,
  }),
  getters: {
    transactions: (state) => {
      const transactions = state.transactionsResponse?.transactions;
      return transactions?.filter(t => t.amount > 0) || [];
    },
  },
  actions: {
    async fetchIncomeSources(institutionAccessItemId: number){
        this.loadingIncome = true
        const response = await incomeService.getIncomeSources(institutionAccessItemId)
        this.incomeSources = response.data
        this.loadingIncome = false
    },
    async fetchTransactions(institutionAccessItemId: number){
        this.loadingTransactions = true
        const response = await incomeService.getTransactions(institutionAccessItemId)
        this.transactionsResponse = response.data
        this.loadingTransactions = false
    },
  }
})