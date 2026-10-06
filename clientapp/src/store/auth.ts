// Utilities
import { defineStore } from 'pinia'
import { ClaimsIdentity } from './types'
import apiClient from '@/api/elysianClient'

type State = {
  userDetails: string | undefined,
  identityProvider: string | undefined,
  hasGitHubAccessToken: boolean | undefined,
  // True once /.auth/me has answered, so pages can tell signed out from not checked yet.
  checked: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    userDetails: undefined,
    identityProvider: undefined,
    hasGitHubAccessToken: undefined,
    checked: false
  }),
  getters: {
    // auth
    signedIn: (state: State) => state.userDetails !== undefined,
    hasValidAccessToken: (state: State) => Boolean(state.hasGitHubAccessToken)
  },
  actions: {
    async fetchAuth(): Promise<void> {
      const response = await apiClient?.getData('/.auth/me')

      if (!response?.success){
        console.error("Failed to get auth me.")
        this.checked = true
        return
      }

      const identity: ClaimsIdentity = response.data
      if (identity?.clientPrincipal) {
        this.userDetails = identity.clientPrincipal.userDetails
        this.identityProvider = identity.clientPrincipal.identityProvider
      }
      // Set before the GitHub check below, which pages don't need to wait for.
      this.checked = true

      if (identity?.clientPrincipal) {
        
        const tokenResponse = await apiClient?.getData('/api/GitHubAuthMe')
        if (tokenResponse?.success){
          this.hasGitHubAccessToken = tokenResponse.data.HasGitHubOAuthToken
        } else{
          console.error("Failed to check GitHub OAuth token.")
        }
      }
    },
    async requestGitHubAccessToken(code: string, state: string | undefined): Promise<void> {
      const response = await apiClient?.postData('/api/GitHubOAuthCallback', { code, state })

      if (!response?.success){
        console.error("Could not get github access token")
        this.hasGitHubAccessToken = undefined
      }

      this.hasGitHubAccessToken = response?.data.HasGitHubOAuthToken
    }
  }
})