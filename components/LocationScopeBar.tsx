'use client'

import { useEffect, useState } from 'react'

// TODO: We'll port these files later from Lovable
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { SCOPE_LABELS, type ScopeKind } from '@/lib/location-scope'

type ScopeKind = '5mi' | '20mi' | '50mi' | 'state' | 'nationwide'

const SCOPE_LABELS: Record<ScopeKind, string> = {
  '5mi': '5 miles',
  '20mi': '20 miles',
  '50mi': '50 miles',
  'state': 'Statewide',
  'nationwide': 'Nationwide'
}

// Stub hook - replace with real one when we port hooks/useLocationScope.ts
function useLocationScope() {
  const [scope, setScope] = useState<ScopeKind>('nationwide')
  const [hasCoords, setHasCoords] = useState(false)
  const [prompting, setPrompting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stub location label - will come from profile/localStorage later
  const location_label = 'San Jose, CA'

  const requestGeolocation = () => {
    setPrompting(true)
    setError(null)
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setPrompting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setHasCoords(true)
        setPrompting(false)
        // TODO: Save to localStorage/profile when we port the real hook
      },
      (err) => {
        setError(err.message)
        setPrompting(false)
      },
      { timeout: 10000 }
    )
  }

  return { scope, setScope, location_label, hasCoords, prompting, requestGeolocation, error }
}

const SCOPES: ScopeKind[] = ['5mi', '20mi', '50mi', 'state', 'nationwide']

export function LocationScopeBar({ compact = false }: { compact?: boolean }) {
  const { scope, setScope, location_label, hasCoords, prompting, requestGeolocation, error } = useLocationScope()

  // Avoid SSR hydration mismatch: location_label is sourced from localStorage/profile and
  // can differ between server render and first client render. Render the fallback until mounted.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const shownLabel = mounted? (location_label?? 'your area') : 'your area'

  return (
    <section
      aria-label="Choose your area"
      className={compact? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-12 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]'}
    >
      <div className={compact? 'flex min-w-0 flex-col gap-2' : 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}>
        <div className="min-w-0">
          <h3 className={compact? 'font-display text-sm font-semibold leading-snug' : 'font-display text-lg font-semibold'}>
            Showing things near{' '}
            <span className="text-primary">{shownLabel}</span>
          </h3>
          <p className={compact? 'mt-1 text-xs leading-snug text-muted-foreground' : 'text-xs text-muted-foreground'}>
            Pick how wide to listen.
          </p>
        </div>
        <button
          onClick={requestGeolocation}
          disabled={prompting}
          className={`${compact? 'w-full' : 'self-start'} rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background disabled:opacity-50`}
        >
          {prompting? 'Locating…' : hasCoords? 'Update location' : 'Use my location'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SCOPES.map((s) => {
          const active = scope === s
          return (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                active
               ? 'border-transparent text-primary-foreground shadow-[var(--shadow-sweet)]'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
              style={active? { background: 'var(--gradient-warm)' } : undefined}
            >
              {SCOPE_LABELS[s]}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  )
}
