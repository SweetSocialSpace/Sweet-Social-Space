'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; resolved: 'light' | 'dark' }
const ThemeCtx = createContext<Ctx | null>(null)
const STORAGE_KEY = 'sss-theme'

function getSystem(): 'light' | 'dark' {
  try { if (typeof window === 'undefined' || !window.matchMedia) return 'light'; return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark' : 'light' } catch { return 'light' }
}
function apply(t: Theme) {
  try { if (typeof document === 'undefined') return; const resolved = t === 'system'? getSystem() : t; document.documentElement.classList.toggle('dark', resolved === 'dark'); document.documentElement.style.colorScheme = resolved } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    try {
      let stored: Theme | null = null
      try { stored = (typeof window !== 'undefined'? window.localStorage.getItem(STORAGE_KEY) : null) as Theme | null } catch {}
      const initial: Theme = stored === 'light' || stored === 'dark' || stored === 'system'? stored : 'system'
      try { setThemeState(initial) } catch {}
      apply(initial)
      try { setResolved(initial === 'system'? getSystem() : initial) } catch {}
      let mql: MediaQueryList | null = null
      try { mql = window.matchMedia('(prefers-color-scheme: dark)') } catch {}
      const onChange = () => { try { let cur = null; try { cur = window.localStorage.getItem(STORAGE_KEY) } catch {}; if (cur === 'system' ||!cur) { apply('system'); setResolved(getSystem()) } } catch {} }
      try { mql?.addEventListener('change', onChange) } catch { try { (mql as any)?.addListener(onChange) } catch {} }
      return () => { try { mql?.removeEventListener('change', onChange) } catch { try { (mql as any)?.removeListener(onChange) } catch {} } }
    } catch {}
  }, [])

  const setTheme = (t: Theme) => {
    try { setThemeState(t) } catch {}
    try { window.localStorage.setItem(STORAGE_KEY, t) } catch {}
    apply(t)
    try { setResolved(t === 'system'? getSystem() : t) } catch {}
  }

  return <ThemeCtx.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  try {
    const ctx = useContext(ThemeCtx)
    if (!ctx) return { theme: 'system' as Theme, setTheme: ()=>{}, resolved: 'light' as const }
    return ctx
  } catch { return { theme: 'system' as Theme, setTheme: ()=>{}, resolved: 'light' as const } }
}

export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme()
  const opts: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'Auto', icon: '🖥' },
  ]
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted-foreground">Theme</span>
      <div className="inline-flex rounded-full border border-border bg-secondary p-0.5">
        {opts.map((o) => (
          <button key={o.value} type="button" onClick={() => { try { setTheme(o.value) } catch {} }} aria-pressed={theme === o.value} title={o.label}
            className={`rounded-full px-2 py-1 text-xs font-semibold transition ${theme === o.value? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <span aria-hidden>{o.icon}</span> {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
