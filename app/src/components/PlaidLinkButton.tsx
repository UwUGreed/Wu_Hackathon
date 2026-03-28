import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PlaidLinkError,
  PlaidLinkOnEventMetadata,
  PlaidLinkStableEvent,
  usePlaidLink,
} from 'react-plaid-link'
import { motion } from 'framer-motion'
import { Building2, Loader2, ShieldCheck } from 'lucide-react'
import { api } from '../api'
import { useAppStore } from '../store'

interface PlaidLinkButtonProps {
  onLinked?: () => Promise<void> | void
}

const PLAID_LOAD_TIMEOUT_MS = 12_000

export default function PlaidLinkButton({ onLinked }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isCreatingToken, setIsCreatingToken] = useState(true)
  const [isExchanging, setIsExchanging] = useState(false)
  const [hasPlaidLoaded, setHasPlaidLoaded] = useState(false)
  const [hasPendingOpen, setHasPendingOpen] = useState(false)
  const [plaidLoadTimedOut, setPlaidLoadTimedOut] = useState(false)
  const hasRequestedToken = useRef(false)
  const setHomeData = useAppStore((s) => s.setHomeData)
  const setError = useAppStore((s) => s.setError)

  const resetPlaidLoadState = useCallback(() => {
    setHasPlaidLoaded(false)
    setPlaidLoadTimedOut(false)
  }, [])

  const createLinkToken = useCallback(async () => {
    setIsCreatingToken(true)
    setError(null)
    resetPlaidLoadState()
    try {
      const { link_token } = await api.createLinkToken()
      setLinkToken(link_token)
    } catch (err) {
      console.error('Failed to create link token:', err)
      setError('Failed to prepare the bank-link flow. Is the backend running?')
    } finally {
      setIsCreatingToken(false)
    }
  }, [resetPlaidLoadState, setError])

  useEffect(() => {
    if (hasRequestedToken.current) return

    hasRequestedToken.current = true
    void createLinkToken()
  }, [createLinkToken])

  const onSuccess = useCallback(async (publicToken: string) => {
    let exchangeSucceeded = false
    setHasPendingOpen(false)
    setIsExchanging(true)
    try {
      const data = await api.exchangePublicToken(publicToken)
      setHomeData(data)
      setError(null)
      exchangeSucceeded = true
      await onLinked?.()
    } catch (err) {
      console.error('Exchange failed:', err)
      setError('Failed to link your bank account. Please try again.')
    } finally {
      setIsExchanging(false)
      if (!exchangeSucceeded) {
        setLinkToken(null)
        hasRequestedToken.current = false
        void createLinkToken()
      }
    }
  }, [createLinkToken, onLinked, setError, setHomeData])

  const onExit = useCallback((plaidError: PlaidLinkError | null) => {
    setHasPendingOpen(false)

    if (!plaidError) {
      setError(null)
      return
    }

    console.error('Plaid Link exited with an error:', plaidError)
    setError(
      plaidError.display_message ||
      plaidError.error_message ||
      'Plaid could not finish the bank connection. Please try again.'
    )
  }, [setError])

  const onEvent = useCallback((eventName: PlaidLinkStableEvent | string, metadata: PlaidLinkOnEventMetadata) => {
    if (eventName !== PlaidLinkStableEvent.ERROR) return

    console.error('Plaid Link reported an error event:', metadata)
  }, [])

  const { open, ready, error } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => onSuccess(public_token),
    onExit,
    onEvent,
    onLoad: () => setHasPlaidLoaded(true),
  })

  useEffect(() => {
    if (!linkToken || ready || hasPlaidLoaded) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setPlaidLoadTimedOut(true)
      setHasPendingOpen(false)
      setError('Plaid is taking longer than expected to load. Try again, disable ad blockers, or use another browser.')
    }, PLAID_LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [hasPlaidLoaded, linkToken, ready, setError])

  useEffect(() => {
    if (!error) return

    console.error('Plaid Link failed to load:', error)
    setPlaidLoadTimedOut(true)
    setHasPendingOpen(false)
    setError('Plaid Link could not load. Please refresh, disable ad blockers, and try again.')
  }, [error, setError])

  useEffect(() => {
    if (!ready || !hasPendingOpen) return

    setHasPendingOpen(false)
    open()
  }, [hasPendingOpen, open, ready])

  const handleClick = useCallback(async () => {
    setError(null)

    if (ready) {
      setHasPendingOpen(false)
      open()
      return
    }

    if (isCreatingToken) {
      setHasPendingOpen(true)
      return
    }

    if (linkToken) {
      setHasPendingOpen(true)

      if (plaidLoadTimedOut) {
        hasRequestedToken.current = false
        await createLinkToken()
      }

      return
    }

    if (!isCreatingToken) {
      setHasPendingOpen(true)
      hasRequestedToken.current = false
      await createLinkToken()
    }
  }, [createLinkToken, isCreatingToken, linkToken, open, plaidLoadTimedOut, ready, setError])

  const isLoadingExistingSession = Boolean(linkToken) && !ready && !plaidLoadTimedOut
  const isPreparingLink = isCreatingToken || isLoadingExistingSession
  const isWorking = isPreparingLink || isExchanging
  const isButtonDisabled = isExchanging || (hasPendingOpen && !ready)

  let title = 'Link your bank'
  let subtitle = 'Securely connect your account with Plaid'

  if (isCreatingToken) {
    title = 'Preparing secure link'
    subtitle = 'Creating your Plaid session'
  } else if (hasPendingOpen && !ready) {
    title = 'Opening bank connector'
    subtitle = 'Plaid will open automatically as soon as it is ready'
  } else if (plaidLoadTimedOut) {
    title = 'Retry bank connector'
    subtitle = 'Plaid took too long to load. Tap to try again'
  } else if (!linkToken) {
    title = 'Link your bank'
    subtitle = 'Tap to retry secure connection'
  } else if (!hasPlaidLoaded && !ready) {
    title = 'Loading bank connector'
    subtitle = 'Getting Plaid ready'
  } else if (isExchanging) {
    title = 'Syncing your accounts'
    subtitle = 'Pulling balances and transactions'
  }

  return (
    <motion.button
      whileHover={{ scale: isWorking ? 1 : 1.03 }}
      whileTap={{ scale: isWorking ? 1 : 0.97 }}
      onClick={() => { void handleClick() }}
      disabled={isButtonDisabled}
      className="group w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)] disabled:cursor-wait disabled:opacity-70"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          {isWorking ? <Loader2 size={20} className="animate-spin" /> : <Building2 size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-700 tracking-tight text-slate-900">
              {title}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Secure
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
          <ShieldCheck size={14} />
          Plaid
        </div>
      </div>
    </motion.button>
  )
}
