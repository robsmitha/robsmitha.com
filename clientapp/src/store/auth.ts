// Utilities
import { defineStore } from 'pinia'
import { ClaimsIdentity } from './types'

type State = {
  userDetails: string | undefined,
  hasGitHubAccessToken: boolean | undefined
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    userDetails: undefined,
    hasGitHubAccessToken: undefined
  }),
  getters: {
    // auth
    signedIn: (state: State) => state.userDetails !== undefined,
    hasValidAccessToken: (state: State) => Boolean(state.hasGitHubAccessToken)
  },
  actions: {
    async fetchAuth(): Promise<void> {
      const response = await fetch('/.auth/me');
      if (!response.ok){
        console.error("Failed to get auth me.")
        return
      }

      const identity: ClaimsIdentity = await response.json()
      if (identity?.clientPrincipal) {
        this.userDetails = identity.clientPrincipal.userDetails
        
        const tokenResponse = await fetch('/api/GitHubAuthMe', {
            method: 'get',
            headers: {
                '___tenant___': 'robsmitha'
            }
        })
        if (tokenResponse.ok){
          const tokenData = await tokenResponse.json()
          this.hasGitHubAccessToken = tokenData.HasGitHubOAuthToken;
        } else{
          console.error("Failed to check GitHub OAuth token.")
        }
      }
    },
    async requestGitHubAccessToken(code: string, state: string | undefined): Promise<void> {
      const response = await fetch('/api/GitHubOAuthCallback', {
          method: 'post',
          headers: {
              'Content-Type': 'application/json',
              '___tenant___': 'robsmitha'
          },
          body: JSON.stringify({ code, state })
      })

      if(!response.ok){
        // TODO: deserialize json response for 400 errors
        throw new Error("Could not get github access token")
      }

      const data = await response.json()
      this.hasGitHubAccessToken = data.HasGitHubOAuthToken
    }
  }
})