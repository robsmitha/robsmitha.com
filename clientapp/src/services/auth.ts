import { createAuth } from '@robsmitha/elysian-ui/auth'

/**
 * Who is signed in. The same sign-in the platform's admin app uses (Microsoft Entra External ID), with the
 * token sent to the API on every call. The sign-in library is only downloaded by someone who has signed in.
 */
export const auth = createAuth({
  authority: import.meta.env.VITE_AUTH_AUTHORITY,
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
  scope: import.meta.env.VITE_AUTH_SCOPE,
})

/** Where to send someone to sign in, coming back to the page they are on */
export const signInPath = (returnTo: string) => `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`

/**
 * Pages only a signed-in person may open. The API protects the data whoever asks; this only decides whether
 * the app shows the page or sends the person to sign in first.
 */
export const PROTECTED_PATHS = ['/saved-bills', '/dashboard', '/budget', '/debt', '/goals', '/accounts', '/transactions', '/users', '/products', '/plaid-oauth']

export const isProtected = (path: string) => PROTECTED_PATHS.some(p => path === p || path.startsWith(`${p}/`))
