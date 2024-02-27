// Utilities
import { defineStore } from 'pinia'
import { ClaimsIdentity, WpPage, WpPost, WpTag } from './types'

type State = {
  pages: WpPage[],
  posts: WpPost[],
  tags: WpTag[],
  userDetails: string | undefined,
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    pages: [],
    posts: [],
    tags: [],
    userDetails: undefined
  }),
  getters: {
    signedIn: (state) => state.userDetails !== undefined,
    homePage: (state) => state.pages.find((page) => page.slug === 'home-page'),
    aboutPage: (state) => state.pages.find((page) => page.slug === 'about-page'),
    summaryPost: (state) => state.posts.find((post) => post.slug === 'summary'),
    summaryPostTags: (state) => {
      const summary = state.posts.find((post) => post.slug === 'summary');
      return state.tags.filter(t => summary?.tags.includes(t.id));
    },
    tagsByPost: (state) : Map<string, WpTag[]> => {
      const languages = state.posts.find((post) => post.slug === 'languages');
      const frontend = state.posts.find((post) => post.slug === 'frontend');
      const backend = state.posts.find((post) => post.slug === 'backend');
      const tools = state.posts.find((post) => post.slug === 'tools');

      const map = new Map<string, WpTag[]>();

      const posts = [languages, frontend, backend, tools]
      posts.forEach((post) => {
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
        throw new Error();
      }
      const identity: ClaimsIdentity = await response.json();
      if (identity?.clientPrincipal) {
        this.userDetails = identity.clientPrincipal.userDetails
      }
    }
  }
})