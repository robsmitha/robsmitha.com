// Utilities
import { defineStore } from 'pinia'
import { ClaimsIdentity, WpPage, WpPost, WpTag } from './types'

type State = {
  pages: WpPage[],
  posts: WpPost[],
  tags: WpTag[],
  userDetails: string | undefined,
  hasGitHubAccessToken: boolean | undefined
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    pages: [],
    posts: [],
    tags: [],
    userDetails: undefined,
    hasGitHubAccessToken: undefined
  }),
  getters: {
    // auth
    signedIn: (state: State) => state.userDetails !== undefined,
    hasValidAccessToken: (state: State) => Boolean(state.hasGitHubAccessToken),

    // pages
    homePage: (state: State) => state.pages.find((page) => page.slug === 'home-page'),
    aboutPage: (state: State) => state.pages.find((page) => page.slug === 'about-page'),

    // posts
    summaryPost: (state: State) => state.posts.find((post) => post.slug === 'summary'),
    experiencePost: (state: State) => state.posts.find((post) => post.slug === 'professional-experience-achievements'),
    educationPost: (state: State) => state.posts.find((post) => post.slug === 'education-certification'),

    // tags
    summaryPostTags: (state: State) => {
      const summary = state.posts.find((post) => post.slug === 'summary');
      return state.tags.filter(t => summary?.tags.includes(t.id));
    },
    educationPostTags: (state: State) => {
      const summary = state.posts.find((post) => post.slug === 'education-certification');
      return state.tags.filter(t => summary?.tags.includes(t.id));
    },
    tagsByPost: (state: State) : Map<string, WpTag[]> => {
      const languages = state.posts.find((post) => post.slug === 'languages');
      const frontend = state.posts.find((post) => post.slug === 'frontend');
      const backend = state.posts.find((post) => post.slug === 'backend');
      const tools = state.posts.find((post) => post.slug === 'tools');

      const map = new Map<string, WpTag[]>();
      [languages, frontend, backend, tools].forEach((post) => {
        post && map.set(post.slug, state.tags.filter(t => post.tags.includes(t.id)))
      });
      return map;
    }
  },
  actions: {
    async fetchPages(): Promise<void> {
      const response = await fetch('https://robsmitha-cms.azurewebsites.net/wp-json/wp/v2/pages');
      this.pages = await response.json();
    },
    async fetchPosts(): Promise<void> {
      const response = await fetch('https://robsmitha-cms.azurewebsites.net/wp-json/wp/v2/posts');
      this.posts = await response.json();
    },
    async fetchTags(): Promise<void> {
      const response = await fetch('https://robsmitha-cms.azurewebsites.net/wp-json/wp/v2/tags?per_page=100');
      this.tags = await response.json();
    },
    async fetchAuth(): Promise<void> {
      const response = await fetch('/.auth/me');
      if (!response.ok){
        console.error("Failed to get auth me.")
        return
      }

      const identity: ClaimsIdentity = await response.json()
      if (identity?.clientPrincipal) {
        this.userDetails = identity.clientPrincipal.userDetails
        
        const tokenResponse = await fetch('/api/GitHubAuthMe')
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
              'Content-Type': 'application/json'
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