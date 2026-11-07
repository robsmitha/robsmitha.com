// Linked banks for the accounts page, read from what the server stored at the last sync.
import { defineStore } from 'pinia'
import connectionService, {
  type BudgetRole,
  type Connection,
  type LinkedAccountInput,
  type SyncActivity,
} from '@/services/connection.service'

type State = {
  connections: Connection[] | undefined
  recentSyncs: SyncActivity[]
  loading: boolean
  /** A message for the page after something failed */
  error: string | null
  /** Banks with a "Sync now" (or reconnect) in flight, watched until their sync lands */
  syncing: number[]
}

// After queuing a sync, check back a few times (seconds) until it shows up
const POLL_AFTER = [3, 6, 10, 15, 25]

export const useConnectionsStore = defineStore('connections', {
  state: (): State => ({
    connections: undefined,
    recentSyncs: [],
    loading: false,
    error: null,
    syncing: [],
  }),
  actions: {
    async fetch () {
      this.loading = true
      const response = await connectionService.getConnections()
      this.loading = false
      if (!response.success || !response.data) {
        this.connections ??= []
        this.error = 'Your banks couldn’t be loaded. Try again in a moment.'
        return
      }
      this.connections = response.data.connections ?? []
      this.recentSyncs = response.data.recentSyncs ?? []
    },

    clearError () {
      this.error = null
    },

    fail (message: string) {
      this.error = message
    },

    async syncNow (id: number) {
      this.clearError()
      const response = await connectionService.syncNow(id)
      if (!response.success) {
        this.error = response.errors?.get('RATE_LIMIT')?.[0]
          ?? response.errors?.get('CONFLICT')?.[0]
          ?? 'The sync couldn’t be started. Try again in a moment.'
        await this.fetch()
        return
      }
      await this.watchSync(id)
    },

    async exchange (publicToken: string, institutionId: string | null, accounts: LinkedAccountInput[]) {
      this.clearError()
      const response = await connectionService.exchangePublicToken(publicToken, institutionId, accounts)
      if (!response.success) {
        this.error = response.errors?.get('CONFLICT')?.[0] ?? 'The bank couldn’t be linked. Try again.'
        return
      }
      // Keep checking in the background; the caller can move on
      void this.watchSync(response.data.institutionAccessItemId)
    },

    async completeReconnect (id: number) {
      this.clearError()
      const response = await connectionService.completeReconnect(id)
      if (!response.success) {
        this.error = 'The bank was reconnected, but refreshing it failed. It will catch up tonight.'
      }
      void this.watchSync(id)
    },

    async remove (id: number, keepHistory: boolean) {
      this.clearError()
      const response = await connectionService.remove(id, keepHistory)
      if (!response.success) {
        this.error = 'The bank couldn’t be removed. Try again in a moment.'
      }
      await this.fetch()
      return response.success
    },

    async updateAccountRole (financialAccountId: number, role: BudgetRole) {
      const response = await connectionService.updateAccountRole(financialAccountId, role)
      if (!response.success) {
        this.error = 'That change couldn’t be saved.'
        await this.fetch()
      }
    },

    /** Refreshes until the bank's last sync time changes (or gives up after ~1 minute). */
    async watchSync (id: number) {
      const before = this.connections?.find(c => c.institutionAccessItemId === id)?.lastSyncedAt ?? null
      this.syncing = [...new Set([...this.syncing, id])]
      await this.fetch()
      for (const seconds of POLL_AFTER) {
        await new Promise(resolve => setTimeout(resolve, seconds * 1000))
        await this.fetch()
        const after = this.connections?.find(c => c.institutionAccessItemId === id)?.lastSyncedAt ?? null
        if (after && after !== before) break
      }
      this.syncing = this.syncing.filter(s => s !== id)
    },
  },
})
