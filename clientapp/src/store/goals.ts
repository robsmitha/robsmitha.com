// The goals page and the dashboard's goals card
import { defineStore } from 'pinia'
import goalService, { type AddContribution, type Goal, type Goals } from '@/services/goal.service'

const message = (text: string | undefined, fallback: string) => text?.replace(/^[A-Za-z.]+: /, '') || fallback

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    data: null as Goals | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetch () {
      this.loading = true
      const response = await goalService.getGoals()
      this.loading = false
      if (!response.success || !Array.isArray(response.data?.goals)) {
        this.error = 'Goals couldn’t be loaded. Try again in a moment.'
        return
      }
      this.error = null
      this.data = response.data
    },

    async saveGoal (goal: Partial<Goal>): Promise<string | null> {
      const response = await goalService.saveGoal(goal)
      if (!response.success) return message(response.errorMessage, 'The goal couldn’t be saved.')
      await this.fetch()
      return null
    },

    async archiveGoal (id: number) {
      await goalService.archiveGoal(id)
      await this.fetch()
    },

    async addContribution (c: AddContribution): Promise<string | null> {
      const response = await goalService.addContribution(c)
      if (!response.success) return message(response.errorMessage, 'That couldn’t be added.')
      await this.fetch()
      return null
    },

    async removeContribution (id: number) {
      await goalService.removeContribution(id)
      await this.fetch()
    },
  },
})
