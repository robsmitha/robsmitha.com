// Utilities
import { defineStore } from 'pinia'
import { WpPage } from './types'

type State = {
  pages: WpPage[],
  userDetails: string | undefined,
}

export interface ClaimsIdentity {
  clientPrincipal: ClientPrincipal;
}

export interface ClientPrincipal {
  userId:           string;
  userRoles:        string[];
  claims:           any[];
  identityProvider: string;
  userDetails:      string;
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    pages: [],
    userDetails: undefined
  }),
  getters: {
    signedIn: (state) => state.userDetails !== undefined,
    homePage: (state) => state.pages.find((page) => page.slug === 'home-page'),
    aboutPage: (state) => state.pages.find((page) => page.slug === 'about-page'),
  },
  actions: {
    async fetchPages(): Promise<void> {
      const response = await fetch('https://robsmitha-cms.azurewebsites.net/wp-json/wp/v2/pages');
      this.pages = await response.json();
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
      console.log("fetchAuth", identity)
    }
  }
})