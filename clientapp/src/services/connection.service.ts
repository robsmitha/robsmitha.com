import elysianClient from '@/api/elysianClient'

/** How an account counts toward budgets */
export type BudgetRole = 'Spending' | 'IncomeOnly' | 'Savings' | 'Ignore'

/** healthy, syncing (never synced yet), login_required, pending_expiration, disconnected, error */
export type ConnectionStatus = 'healthy' | 'syncing' | 'login_required' | 'pending_expiration' | 'disconnected' | 'error'

export type ConnectionAccount = {
  financialAccountId: number
  name: string
  officialName: string | null
  mask: string | null
  type: string
  subtype: string | null
  currentBalance: number | null
  availableBalance: number | null
  creditLimit: number | null
  isoCurrencyCode: string | null
  budgetRole: BudgetRole
}

export type Connection = {
  institutionAccessItemId: number
  institutionName: string
  institutionLogo: string | null
  institutionColor: string | null
  status: ConnectionStatus
  statusMessage: string | null
  lastSyncedAt: string | null
  consentExpiresAt: string | null
  newAccountsAvailable: boolean
  syncAvailableAt: string | null
  accounts: ConnectionAccount[]
}

export type SyncActivity = {
  startedAt: string
  institutionName: string
  trigger: 'Initial' | 'Webhook' | 'Manual' | 'Nightly' | 'Reconnect'
  added: number
  modified: number
  removed: number
  errorCode: string | null
}

export type ConnectionsResponse = { connections: Connection[], recentSyncs: SyncActivity[] }

/** Plaid Link modes: link a new bank, sign in to one again, or choose which accounts it shares */
export type LinkMode = 'add' | 'reconnect' | 'accounts'

export type LinkedAccountInput = { name: string, mask: string | null, subtype: string | null }

export const connectionService = {
  getConnections: () => elysianClient.getData('/api/GetConnections'),

  createLinkToken (mode: LinkMode, institutionAccessItemId?: number) {
    const params = new URLSearchParams()
    if (mode !== 'add' && institutionAccessItemId) params.set('institutionAccessItemId', String(institutionAccessItemId))
    if (mode === 'accounts') params.set('mode', 'accounts')
    const query = params.toString()
    return elysianClient.postData(`/api/CreateFinancialLinkToken${query ? `?${query}` : ''}`, {})
  },

  exchangePublicToken: (publicToken: string, institutionId: string | null, accounts: LinkedAccountInput[]) =>
    elysianClient.postData('/api/ExchangePlaidPublicToken', { publicToken, institutionId, accounts }),

  syncNow: (institutionAccessItemId: number) =>
    elysianClient.postData('/api/SyncConnection', { institutionAccessItemId }),

  completeReconnect: (institutionAccessItemId: number) =>
    elysianClient.postData('/api/CompleteReconnect', { institutionAccessItemId }),

  remove: (institutionAccessItemId: number, keepHistory: boolean) =>
    elysianClient.postData('/api/RemoveConnection', { institutionAccessItemId, keepHistory }),

  updateAccountRole: (financialAccountId: number, budgetRole: BudgetRole) =>
    elysianClient.postData('/api/UpdateAccountSettings', { financialAccountId, budgetRole }),
}

export default connectionService
