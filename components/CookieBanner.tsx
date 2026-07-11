'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: Port lib/legal.ts from Lovable
const COOKIE_VERSION = 'v1.0.0' // Replace with real import when you port legal.ts

const KEY = 'ss-cookie-consent-v1'

type Choice = { necessary: true; functional: boolean; analytics: boolean; ts: string; v: string }

function load(): Choice | null {
  try {
    const raw = typeof localStorage!== 'undefined'? localStorage.getItem(KEY) : null
    return raw? (JSON.parse(raw) as Choice) : null
  } catch {
    return null
  }
}

async function logConsent(choice: Choice) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    await supabase.from('consent_log').insert({
      user_id: data.session?.user?.id?? null,
      session_id: typeof crypto!== 'undefined'? crypto.randomUUID() : null,
      consent_type: `cookies:functional=${choice.functional};analytics=${choice.analytics}`,
      granted: choice.functional || choice.analytics,
      policy_version: COOKIE_VERSION,
    })
  } catch {
    // non-fatal
  }
}

function save(choice: Choice) {
  localStorage.setItem(KEY, JSON.stringify(choice))
  void logConsent(choice)
}

export function CookieBanner() {
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [functional, setFunctional] = useState(true)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = load()
    if (!existing || existing.v!== COOKIE_VERSION) setOpen(true)
    const handler = () => setOpen(true)
    window.addEventListener('open-cookie-settings', handler)
    return () => window.removeEventListener('open-cookie-settings', handler)
  }, [])

  if (!open) return null

  const acceptAll = () => {
    save({ necessary: true, functional: true, analytics: true, ts: new Date().toISOString(), v: COOKIE_VERSION })
    setOpen(false)
  }
  const rejectNonEssential = () => {
    save({ necessary: true, functional: false, analytics: false, ts: new Date().toISOString(), v: COOKIE_VERSION })
    setOpen(false)
  }
  const saveChoice = () => {
    save({ necessary: true, functional, analytics, ts: new Date().toISOString(), v: COOKIE_VERSION })
    setOpen(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <p className="text-sm text-foreground">
          We use strictly-necessary cookies to keep you signed in. With your permission, we also use functional and
          anonymized analytics cookies to improve Sweet Social Space. No ads. No tracking across sites.{' '}
          <Link href="/cookies" className="underline">Learn more</Link>.
        </p>

        {showDetails && (
          <div className="mt-3 space-y-2 rounded-xl border border-border bg-background p-3 text-sm">
            <label className="flex items-start gap-2 opacity-60">
              <input type="checkbox" checked disabled className="mt-1" />
              <span><strong>Strictly necessary</strong> — sign-in & security. Always on.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={functional} onChange={(e) => setFunctional(e.target.checked)} className="mt-1" />
              <span><strong>Functional</strong> — remembers your language and preferences.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
              <span><strong>Analytics</strong> — anonymized usage stats.</span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {!showDetails? (
            <button onClick={() => setShowDetails(true)} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
              Customize
            </button>
          ) : (
            <button onClick={saveChoice} className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary">
              Save choices
            </button>
          )}
          <button onClick={rejectNonEssential} className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary">
            Reject non-essential
          </button>
          <button onClick={acceptAll} className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
