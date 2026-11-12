/**
 * plugins/gtm.ts
 *
 * Google Tag Manager. Loads the GTM container and pushes a page view to the
 * dataLayer on every client-side route change, so GA4 (configured inside GTM)
 * sees SPA navigation instead of only the first page load.
 */

import { createGtm } from '@gtm-support/vue-gtm'
import router from '../router'

export default createGtm({
  id: 'GTM-K373RSGP',
  // Only send data from production builds so local dev doesn't skew analytics.
  enabled: import.meta.env.PROD,
  debug: import.meta.env.DEV,
  vueRouter: router,
})
