/**
 * plugins/theme.ts
 *
 * The site's light/dark preference: System (follow the device), Light or Dark. Saved in this browser only.
 * Plain functions so plugins/vuetify.ts can pick the starting theme before the app mounts.
 */

export const THEMES = { light: 'portfolioLight', dark: 'portfolioDark' } as const

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'

// Visitors without a saved choice follow their device's light/dark setting.
export const DEFAULT_PREFERENCE: ThemePreference = 'system'

export function readPreference (): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'system' || saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be blocked (private windows, strict settings); fall back to the default
  }
  return DEFAULT_PREFERENCE
}

export function savePreference (preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Not saved; the choice still applies for this visit
  }
}

const darkQuery = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null)

export function systemPrefersDark (): boolean {
  return darkQuery()?.matches ?? true
}

/** Calls back whenever the device switches between light and dark. Returns a function that stops listening. */
export function onSystemThemeChange (callback: () => void): () => void {
  const query = darkQuery()
  if (!query) return () => {}
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

export function themeNameFor (preference: ThemePreference): string {
  const dark = preference === 'system' ? systemPrefersDark() : preference === 'dark'
  return dark ? THEMES.dark : THEMES.light
}

export function initialThemeName (): string {
  return themeNameFor(readPreference())
}
