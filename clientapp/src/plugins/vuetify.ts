/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { THEMES, initialThemeName } from './theme'

// The site has one light and one dark theme with the same color keys, so every component that uses theme colors
// (`color="primary"`, `bg-surface`, `text-muted`, `rgb(var(--v-theme-border))`) works in both. Components never
// hard-code colors; change the look here. The light/dark choice lives in store/theme.ts.
//
// The look is "Swiss": near-black ink on white, hairline rules, square corners (src/styles/settings.scss) and one
// signal-orange accent. Dark is the same idea inverted. Text colors clear 4.5:1 on background and surface.
//
// Keys:
// - Semantic keys for new code: background, surface, surface-raised (the grey bands), border (hairlines), rule (the
//   strong ink-colored rules), muted (secondary text), subtle (captions, axis labels), primary, success / warning /
//   error / info, chart-1..3 (chart series, checked for colorblind-safe separation in both themes), inverse /
//   inverse-ink / inverse-muted / inverse-accent (the solid black blocks: footer, call-to-action panels), hero-ink
//   (text and controls in the PageHero header: the page's ink in both themes). Main text uses Vuetify's own
//   `text-high-emphasis` (on-background).
// - Vuetify makes only a bare class (`.on-surface`) for keys that start with "on-", never `text-on-*` or `bg-on-*`,
//   so new text colors get plain names like `muted`.
// - Older keys named after literal colors (navy, slate, ...) are kept so existing pages keep working. They map to the
//   semantic keys: navy = background, light-navy = surface, lightest-navy = border, slate = subtle,
//   light-slate = muted, lightest-slate = text-high-emphasis. Prefer the semantic names in new code.
const portfolioDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0a0a0a',
    surface: '#141414',
    'surface-bright': '#262626',
    'surface-light': '#1c1c1c',
    'surface-variant': '#262626',
    'surface-raised': '#1c1c1c',
    border: '#2e2e2e',
    rule: '#f5f5f4',
    muted: '#d4d4d4',
    subtle: '#a3a3a3',
    primary: '#fb923c',
    secondary: '#a3a3a3',
    accent: '#fb923c',
    error: '#f87171',
    info: '#60a5fa',
    success: '#4ade80',
    warning: '#facc15',
    'chart-1': '#3F8FDB',
    'chart-2': '#CC7340',
    'chart-3': '#A86BC4',
    inverse: '#1c1c1c',
    'inverse-ink': '#f5f5f4',
    'inverse-muted': '#a3a3a3',
    'inverse-accent': '#fb923c',
    // Text and controls in the PageHero header, which sits on the page background
    'hero-ink': '#f5f5f4',

    'on-background': '#f5f5f4',
    'on-surface': '#f5f5f4',
    'on-primary': '#111111',
    'on-secondary': '#111111',
    // Tooltips use surface-variant; without this, Vuetify's dark default (#424242) puts dark grey text on it.
    'on-surface-variant': '#f5f5f4',

    navy: '#0a0a0a',
    'light-navy': '#141414',
    'lightest-navy': '#2e2e2e',
    slate: '#a3a3a3',
    'light-slate': '#d4d4d4',
    'lightest-slate': '#f5f5f4',
    green: '#4ade80',
    violet: '#c4b5fd',
    amber: '#facc15',
    orange: '#fb923c',
  },
  variables: {
    'border-color': '#2e2e2e',
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.85,
    'disabled-opacity': 0.4,
  },
}

// Same keys, light values. Accents are darker than the dark theme's so text and marks keep 4.5:1 on white.
const portfolioLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    'surface-bright': '#ffffff',
    'surface-light': '#f2f2f0',
    // Tooltips stay dark in both themes
    'surface-variant': '#262626',
    'surface-raised': '#f2f2f0',
    border: '#d4d4d4',
    rule: '#111111',
    muted: '#404040',
    subtle: '#525252',
    primary: '#c2410c',
    secondary: '#525252',
    accent: '#c2410c',
    error: '#b91c1c',
    info: '#1d4ed8',
    success: '#15803d',
    warning: '#a16207',
    'chart-1': '#2F6FB8',
    'chart-2': '#B0663F',
    'chart-3': '#8C4A9E',
    inverse: '#111111',
    'inverse-ink': '#ffffff',
    'inverse-muted': '#a3a3a3',
    'inverse-accent': '#fb923c',
    // Text and controls in the PageHero header, which sits on the page background
    'hero-ink': '#111111',

    'on-background': '#111111',
    'on-surface': '#111111',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-surface-variant': '#f5f5f4',

    navy: '#ffffff',
    'light-navy': '#ffffff',
    'lightest-navy': '#d4d4d4',
    slate: '#525252',
    'light-slate': '#404040',
    'lightest-slate': '#111111',
    green: '#15803d',
    violet: '#6d28d9',
    amber: '#a16207',
    orange: '#c2410c',
  },
  variables: {
    'border-color': '#d4d4d4',
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.85,
    'disabled-opacity': 0.4,
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    // Read before the first paint so the page never flashes the wrong theme
    defaultTheme: initialThemeName(),
    themes: { [THEMES.dark]: portfolioDark, [THEMES.light]: portfolioLight },
  },
  // Corners are square everywhere through $rounded in src/styles/settings.scss. Buttons are flat and keep their
  // label's case, like the Swiss mockups.
  defaults: {
    VBtn: {
      class: 'text-none',
      elevation: 0,
    },
    VCard: {
      flat: true,
    },
  },
})
