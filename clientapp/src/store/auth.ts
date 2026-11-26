// Utilities
import { defineStore } from 'pinia'
import apiClient from '@/api/elysianClient'
import { auth, sessionHasEnded } from '@/services/auth'

type State = {
  userDetails: string | undefined,
  identityProvider: string | undefined,
  hasGitHubAccessToken: boolean | undefined,
  // True once sign-in has been checked, so pages can tell signed out from not checked yet.
  checked: boolean,
  // True when the person was signed in and their session ran out. Stays until the next page load, which
  // is what a new sign-in ends with.
  sessionExpired: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    userDetails: undefined,
    identityProvider: undefined,
    hasGitHubAccessToken: undefined,
    checked: false,
    sessionExpired: false
  }),
  getters: {
    // auth
    signedIn: (state: State) => state.userDetails !== undefined,
    hasValidAccessToken: (state: State) => Boolean(state.hasGitHubAccessToken)
  },
  actions: {
    async fetchAuth(): Promise<void> {
      // Their name or email, or null. Nobody who has never signed in downloads the sign-in library for this.
      let user = await auth.currentUser()

      // Remembered as signed in, but the session can't be renewed: they are signed out, and told so,
      // before any call is sent that could only fail
      if (user && (this.sessionExpired || await sessionHasEnded())) {
        this.expire()
        user = null
      }

      this.userDetails = user ?? undefined
      this.identityProvider = user ? 'aad' : undefined
      // Set before the GitHub check below, which pages don't need to wait for.
      this.checked = true

      if (user) {
        
        const tokenResponse = await apiClient?.getData('/api/GitHubAuthMe')
        if (tokenResponse?.success){
          this.hasGitHubAccessToken = tokenResponse.data.HasGitHubOAuthToken
        } else{
          console.error("Failed to check GitHub OAuth token.")
        }
      }
    },
    /** The session ran out: show the person as signed out and remember why */
    expire(): void {
      this.userDetails = undefined
      this.identityProvider = undefined
      this.hasGitHubAccessToken = undefined
      this.sessionExpired = true
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