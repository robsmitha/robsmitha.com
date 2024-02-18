// Utilities
import { defineStore } from 'pinia'
import { WpPage } from './types'

type State = {
  pages: WpPage[]
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    pages: [],
  }),
  getters: {
    homePage: (state) => state.pages.find((page) => page.slug === 'home-page'),
  },
  actions: {
    async fetchPages(): Promise<void> {
      const response = await fetch('https://robsmitha-cms.azurewebsites.net/wp-json/wp/v2/pages');
      this.pages = await response.json();
    },
  }
})