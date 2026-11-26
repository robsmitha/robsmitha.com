import { createAuth } from '@robsmitha/elysian-ui/auth'

/**
 * Who is signed in. The same sign-in the platform's admin app uses (Microsoft Entra External ID), with the
 * token sent to the API on every call. The sign-in library is only downloaded by someone who has signed in.
 */
// Where the sign-in helper remembers that this browser has signed in. Named here so sessionHasEnded can
// read it.
const HINT_KEY = 'signed-in'

export const auth = createAuth({
  authority: import.meta.env.VITE_AUTH_AUTHORITY,
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
  scope: import.meta.env.VITE_AUTH_SCOPE,
  hintKey: HINT_KEY,
})

/** Where to send someone to sign in, coming back to the page they are on */
export const signInPath = (returnTo: string) => `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`

/** The sign-in page, saying first that the session ran out. It waits for a click instead of leaving at once. */
export const sessionExpiredPath = (returnTo: string) => `/auth/sign-in?expired=1&returnTo=${encodeURIComponent(returnTo)}`

/**
 * True when this browser is signed in as far as it remembers, but the sign-in can no longer be renewed
 * without the person signing in again. A session lasts about a day; after that the API answers 401.
 *
 * False when a token simply couldn't be fetched (offline): the helper drops its "signed in" flag only when
 * the sign-in service itself says the person must sign in again.
 */
export async function sessionHasEnded(): Promise<boolean> {
  if (!(await auth.currentUser()) || await auth.accessToken()) {
    return false
  }
  try {
    return localStorage.getItem(HINT_KEY) !== '1'
  } catch {
    return false
  }
}

// The API client reports a 401 here and the app decides what to do about it (plugins/index.ts). Kept as a
// hook so the client needs neither the router nor the store.
let unauthorizedListener: (() => void) | undefined
export const onUnauthorized = (listener: () => void) => { unauthorizedListener = listener }
export const reportUnauthorized = () => unauthorizedListener?.()

/**
 * Pages only a signed-in person may open. The API protects the data whoever asks; this only decides whether
 * the app shows the page or sends the person to sign in first.
 */
export const PROTECTED_PATHS = ['/saved-bills', '/dashboard', '/budget', '/debt', '/goals', '/accounts', '/transactions', '/users', '/products', '/plaid-oauth']

export const isProtected = (path: string) => PROTECTED_PATHS.some(p => path === p || path.startsWith(`${p}/`))
