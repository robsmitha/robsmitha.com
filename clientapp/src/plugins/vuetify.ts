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
// Dark is the original near-black developer-portfolio theme. Accents come from JetBrains' Darcula syntax colors
// (keyword orange, function blue, field purple, string green), all clearing 4.5:1 on the near-black background.
//
// Keys:
// - Semantic keys for new code: background, surface, surface-raised, border, muted (secondary text), subtle (captions,
//   axis labels), primary, success / warning / error / info, chart-1..3 (chart series, checked for colorblind-safe
//   separation in both themes), hero-ink / hero-shade (on the PageHero band, which stays dark in both themes).
//   Main text uses Vuetify's own `text-high-emphasis` (on-background).
// - Vuetify makes only a bare class (`.on-surface`) for keys that start with "on-", never `text-on-*` or `bg-on-*`,
//   so new text colors get plain names like `muted`.
// - Older keys named after literal colors (navy, slate, ...) are kept so existing pages keep working. They map to the
//   semantic keys: navy = background, light-navy = surface, lightest-navy = border, slate = subtle,
//   light-slate = muted, lightest-slate = text-high-emphasis. Prefer the semantic names in new code.
const portfolioDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0a0a0c',
    surface: '#151517',
    'surface-bright': '#2a2a2e',
    'surface-light': '#1c1c1f',
    'surface-variant': '#2a2a2e',
    'surface-raised': '#1c1c1f',
    border: '#2a2a2e',
    muted: '#aeaeb6',
    subtle: '#8a8a93',
    primary: '#CF8E6D',
    secondary: '#8a8a93',
    accent: '#CF8E6D',
    error: '#ff6b6b',
    info: '#56A8F5',
    success: '#64ffda',
    warning: '#f6c177',
    'chart-1': '#3F8FDB',
    'chart-2': '#CC7340',
    'chart-3': '#A86BC4',
    // The PageHero band is dark in both themes: hero-ink is its text, hero-shade darkens controls on it
    'hero-ink': '#ffffff',
    'hero-shade': '#07090c',

    'on-background': '#eaeaef',
    'on-surface': '#eaeaef',
    'on-primary': '#0a0a0c',
    'on-secondary': '#0a0a0c',
    // Tooltips use surface-variant; without this, Vuetify's dark default (#424242) puts dark grey text on it.
    'on-surface-variant': '#eaeaef',

    navy: '#0a0a0c',
    'light-navy': '#151517',
    'lightest-navy': '#2a2a2e',
    slate: '#8a8a93',
    'light-slate': '#aeaeb6',
    'lightest-slate': '#eaeaef',
    green: '#6AAB73',
    violet: '#C77DBB',
    amber: '#f6c177',
    orange: '#f78c6c',
  },
  variables: {
    'border-color': '#2a2a2e',
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.85,
    'disabled-opacity': 0.4,
  },
}

// Same keys, light values. Accents are darkened versions of the dark theme's so text and marks keep 4.5:1 on white.
const portfolioLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#f6f6f8',
    surface: '#ffffff',
    'surface-bright': '#ffffff',
    'surface-light': '#f1f1f4',
    // Tooltips stay dark in both themes
    'surface-variant': '#2a2a2e',
    'surface-raised': '#f1f1f4',
    border: '#e2e2e7',
    muted: '#3f3f46',
    subtle: '#62626c',
    primary: '#A65A34',
    secondary: '#62626c',
    accent: '#A65A34',
    error: '#C42626',
    info: '#1F67B8',
    success: '#0F7A65',
    warning: '#966200',
    'chart-1': '#2F6FB8',
    'chart-2': '#B0663F',
    'chart-3': '#8C4A9E',
    // The PageHero band is dark in both themes: hero-ink is its text, hero-shade darkens controls on it
    'hero-ink': '#ffffff',
    'hero-shade': '#07090c',

    'on-background': '#18181b',
    'on-surface': '#18181b',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-surface-variant': '#eaeaef',

    navy: '#f6f6f8',
    'light-navy': '#ffffff',
    'lightest-navy': '#e2e2e7',
    slate: '#62626c',
    'light-slate': '#3f3f46',
    'lightest-slate': '#18181b',
    green: '#28783A',
    violet: '#8C3C80',
    amber: '#966200',
    orange: '#B4532A',
  },
  variables: {
    'border-color': '#e2e2e7',
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
  defaults: {
    VBtn: {
      rounded: 'sm',
    },
  },
})
