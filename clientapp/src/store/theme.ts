// The site-wide light/dark setting. One place sets it (the app bar menu); Vuetify's theme does the rest.
import { defineStore } from 'pinia'
import vuetify from '@/plugins/vuetify'
import {
  THEMES,
  type ThemePreference,
  onSystemThemeChange,
  readPreference,
  savePreference,
  themeNameFor,
} from '@/plugins/theme'

let stopListening: (() => void) | null = null

export const useThemeStore = defineStore('theme', {
  state: () => ({
    preference: readPreference() as ThemePreference,
  }),
  getters: {
    isDark: () => vuetify.theme.global.name.value === THEMES.dark,
  },
  actions: {
    /** Applies the saved preference and follows device changes while it's "system". Call once at startup. */
    init () {
      this.apply()
      stopListening?.()
      stopListening = onSystemThemeChange(() => {
        if (this.preference === 'system') this.apply()
      })
    },
    setPreference (preference: ThemePreference) {
      this.preference = preference
      savePreference(preference)
      this.apply()
    },
    apply () {
      vuetify.theme.global.name.value = themeNameFor(this.preference)
    },
  },
})
