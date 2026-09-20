'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const logo = '/sweet-social-logo.png'

export function LoginPromptDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('login_prompt_dismissed')) return
    } catch {}
    const timer = setTimeout(() => { try { setOpen(true) } catch {} }, 1200)
    return () => { try { clearTimeout(timer) } catch {} }
  }, [])

  const dismiss = () => { try { if (typeof window !== 'undefined') sessionStorage.setItem('login_prompt_dismissed','1'); setOpen(false) } catch { setOpen(false) } }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={dismiss}>
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title" onClick={(e)=>e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Sweet Social Space" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" onError={(e)=>{ try { (e.target as any).style.display='none' } catch {} }} />
          <h2 id="login-prompt-title" className="mt-4 font-display text-xl font-semibold">Welcome to Sweet Social Space</h2>
          <p className="mt-2 text-sm text-muted-foreground">Log in or create an account to see what's happening on your block.</p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <Link href="/auth?mode=signin" onClick={dismiss} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-100" style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' } as any}>Log in</Link>
            <Link href="/auth?mode=signup" onClick={dismiss} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold transition hover:bg-secondary">Create account</Link>
            <button onClick={dismiss} className="mt-1 text-xs text-muted-foreground hover:underline">Continue browsing</button>
          </div>
        </div>
      </div>
    </div>
  )
}
