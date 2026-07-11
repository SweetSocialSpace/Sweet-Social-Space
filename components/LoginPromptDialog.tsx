'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// TODO: Replace with real logo from /public or port assets system
const logo = '/sweet-social-logo.png' // Put your logo in public/sweet-social-logo.png

export function LoginPromptDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Sweet Social Space"
            className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
          />
          <h2 id="login-prompt-title" className="mt-4 font-display text-xl font-semibold">
            Welcome to Sweet Social Space
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in or create an account to see what's happening on your block.
          </p>

          <div className="mt-6 flex w-full flex-col gap-3">
            <Link
              href="/auth?mode=signin"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-100"
              style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' }}
            >
              Log in
            </Link>
            <Link
              href="/auth?mode=signup"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold transition hover:bg-secondary"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
