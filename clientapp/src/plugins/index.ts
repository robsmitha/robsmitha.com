/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import gtm from './gtm'

import 'highlight.js/styles/night-owl.css'
import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin'
import { useThemeStore } from '../store/theme'
import { useAuthStore } from '../store/auth'
import { isProtected, onUnauthorized, sessionExpiredPath } from '../services/auth'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(hljsVuePlugin)
    .use(gtm)

  // Site-wide light/dark mode: apply the saved choice and follow the device when it's set to System
  useThemeStore(pinia).init()

  // The API answered 401 to someone the app believed was signed in: their session ran out while the page
  // was open. Show them as signed out, and take them off a page that is only for signed-in people.
  onUnauthorized(() => {
    const auth = useAuthStore(pinia)
    if (!auth.signedIn) {
      return
    }
    auth.expire()

    const route = router.currentRoute.value
    if (isProtected(route.path)) {
      router.replace(sessionExpiredPath(route.fullPath))
    }
  })
}
