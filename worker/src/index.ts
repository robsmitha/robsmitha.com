import { createSiteWorker, serveAppShell } from '@robsmitha/site-edge'

// This Worker serves one tenant, and says so itself. The browser never chooses.
const site = createSiteWorker({ tenant: 'robsmitha' })

type Env = Parameters<typeof site.fetch>[1]

// Files that exist are answered by static assets and never reach this code. What does: /api/*, and any path
// with no file behind it.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // One address for the site: www goes to the bare domain, as it always has
    if (url.hostname === 'www.robsmitha.com') {
      url.hostname = 'robsmitha.com'
      return Response.redirect(url.toString(), 301)
    }

    // The API, Plaid's webhook included (/api/PlaidWebhook): forwarded with the body and headers untouched,
    // because Plaid's signature is over the exact bytes it sent
    if (url.pathname.startsWith('/api/')) {
      return site.fetch(request, env)
    }

    // An app route (the dashboard, a bill, the sign-in callback): serve the app and let it route.
    // A missing file under /assets/ is a 404, never the app's page.
    return serveAppShell(request, env.ASSETS)
  },
}
