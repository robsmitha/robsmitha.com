/**
 * Opens Plaid Link to add a bank, sign in to one again, or change which accounts it shares.
 *
 * - Plaid's script loads once per page and is never removed (re-adding it breaks Link).
 * - The link token is fetched on click, not on mount: tokens expire after 4 hours.
 * - The session is saved before Link opens, so a bank that signs in on its own site (OAuth) can send the person back
 *   to /plaid-oauth, which reopens Link with `resume()` to finish.
 *
 * Pattern from thejourneyfi.com (src/composables/usePlaidLink.ts).
 */
import { onBeforeUnmount, ref } from 'vue'
import connectionService, { type LinkMode } from '@/services/connection.service'
import { useConnectionsStore } from '@/store/connections'

const SCRIPT_URL = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
const PENDING_KEY = 'plaid-pending-link'
// Matches Plaid's guidance for how long an OAuth round trip can reuse a token
const PENDING_MAX_AGE_MS = 30 * 60 * 1000

type PlaidHandler = { open: () => void, destroy: () => void }
type PlaidFactory = { create: (config: Record<string, unknown>) => PlaidHandler }
type PlaidMetadata = {
  institution?: { institution_id?: string | null, name?: string | null } | null
  accounts?: { name: string, mask: string | null, subtype: string | null }[]
}
type PendingLink = { linkToken: string, mode: LinkMode, itemId: number | null, savedAt: number }

let scriptLoad: Promise<PlaidFactory> | null = null

function loadPlaid (): Promise<PlaidFactory> {
  const existing = (window as any).Plaid as PlaidFactory | undefined
  if (existing) return Promise.resolve(existing)
  scriptLoad ??= new Promise<PlaidFactory>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => ((window as any).Plaid ? resolve((window as any).Plaid) : reject(new Error('Plaid Link did not start')))
    script.onerror = () => {
      script.remove()
      scriptLoad = null // a later click can try again
      reject(new Error('Plaid Link could not be loaded'))
    }
    document.head.appendChild(script)
  })
  return scriptLoad
}

function savePending (pending: PendingLink) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending)) } catch { /* storage blocked: OAuth resume won't work */ }
}

function readPending (): PendingLink | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as PendingLink | null
    return value && Date.now() - value.savedAt < PENDING_MAX_AGE_MS ? value : null
  } catch {
    return null
  }
}

function clearPending () {
  try { sessionStorage.removeItem(PENDING_KEY) } catch { /* nothing saved */ }
}

/** Plaid's exit errors in plain words; most exits (closing the window) have no error at all. */
function exitMessage (error: { error_code?: string, display_message?: string | null } | null): string | null {
  if (!error) return null
  if (error.display_message) return error.display_message
  if (error.error_code === 'INSTITUTION_DOWN' || error.error_code === 'INSTITUTION_NOT_RESPONDING') {
    return 'That bank isn’t responding right now. Try again later.'
  }
  return 'Linking didn’t finish. Try again.'
}

export type PlaidLinkOptions = {
  /** Called once Link has finished (after the bank is saved or refreshed) or was closed */
  onDone?: () => void
}

export function usePlaidLink (options: PlaidLinkOptions = {}) {
  const store = useConnectionsStore()
  /** What's opening right now, for button loading states */
  const opening = ref<{ mode: LinkMode, itemId: number | null } | null>(null)
  let handler: PlaidHandler | null = null

  function close () {
    handler?.destroy()
    handler = null
  }

  async function succeeded (pending: PendingLink, publicToken: string, metadata: PlaidMetadata) {
    clearPending()
    close()
    if (pending.mode === 'add') {
      await store.exchange(
        publicToken,
        metadata.institution?.institution_id ?? null,
        (metadata.accounts ?? []).map(a => ({ name: a.name, mask: a.mask, subtype: a.subtype })),
      )
    } else if (pending.itemId) {
      // Update mode has no new token to exchange: the same connection works again (or shares other accounts)
      await store.completeReconnect(pending.itemId)
    }
    options.onDone?.()
  }

  async function start (pending: PendingLink, receivedRedirectUri?: string) {
    const Plaid = await loadPlaid()
    close()
    handler = Plaid.create({
      token: pending.linkToken,
      receivedRedirectUri,
      onSuccess: (publicToken: string, metadata: PlaidMetadata) => { void succeeded(pending, publicToken, metadata) },
      onExit: (error: any) => {
        clearPending()
        close()
        const message = exitMessage(error)
        if (message) store.fail(message)
        options.onDone?.()
      },
    })
    handler.open()
  }

  /** Opens Link. For reconnect and accounts, pass the bank's id. */
  async function open (mode: LinkMode, itemId: number | null = null) {
    store.clearError()
    opening.value = { mode, itemId }
    try {
      const response = await connectionService.createLinkToken(mode, itemId ?? undefined)
      const linkToken = response.success ? response.data?.link_token : undefined
      if (!linkToken) {
        store.fail('Plaid couldn’t be opened. Try again in a moment.')
        return
      }
      const pending: PendingLink = { linkToken, mode, itemId, savedAt: Date.now() }
      savePending(pending)
      try {
        await start(pending)
      } catch {
        clearPending()
        store.fail('Plaid couldn’t be opened. Check your connection and try again.')
      }
    } finally {
      opening.value = null
    }
  }

  /** On /plaid-oauth: reopen Link with the saved session. False when there's no usable saved session. */
  async function resume (receivedRedirectUri: string): Promise<boolean> {
    const pending = readPending()
    if (!pending) return false
    try {
      await start(pending, receivedRedirectUri)
      return true
    } catch {
      clearPending()
      store.fail('Linking couldn’t be finished. Start again from the accounts page.')
      return false
    }
  }

  onBeforeUnmount(close)

  return { open, resume, opening }
}
