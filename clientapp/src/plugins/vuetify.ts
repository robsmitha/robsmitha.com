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

// Dark, navy developer-portfolio theme inspired by brittanychiang.com.
// Custom keys (navy / slate / mono-ink etc.) render as Vuetify utility
// classes at runtime, e.g. `bg-light-navy`, `text-slate`, `border-lightest-navy`.
const portfolio: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0a192f',
    surface: '#112240',
    'surface-bright': '#233554',
    'surface-light': '#1d2d50',
    'surface-variant': '#233554',
    primary: '#64ffda',
    secondary: '#8892b0',
    accent: '#64ffda',
    error: '#ff6b6b',
    info: '#57cbff',
    success: '#64ffda',
    warning: '#f6c177',

    'on-background': '#ccd6f6',
    'on-surface': '#ccd6f6',
    'on-primary': '#0a192f',
    'on-secondary': '#0a192f',

    navy: '#0a192f',
    'light-navy': '#112240',
    'lightest-navy': '#233554',
    slate: '#8892b0',
    'light-slate': '#a8b2d1',
    'lightest-slate': '#ccd6f6',
    green: '#64ffda',
    violet: '#c792ea',
    amber: '#f6c177',
    orange: '#f78c6c',
  },
  variables: {
    'border-color': '#233554',
    'border-opacity': 1,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.85,
    'disabled-opacity': 0.4,
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'portfolio',
    themes: { portfolio },
  },
  defaults: {
    VBtn: {
      rounded: 'sm',
    },
  },
})
