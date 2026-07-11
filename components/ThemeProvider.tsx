'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; resolved: 'light' | 'dark' }
const ThemeCtx = createContext<Ctx | null>(null)

const STORAGE_KEY = 'sss-theme'

function getSystem(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark' : 'light'
}

function apply(t: Theme) {
  if (typeof document === 'undefined') return
  const resolved = t === 'system'? getSystem() : t
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = (typeof localStorage!== 'undefined'? localStorage.getItem(STORAGE_KEY) : null) as Theme | null
    const initial: Theme = stored === 'light' || stored === 'dark' || stored === 'system'? stored : 'system'
    setThemeState(initial)
    apply(initial)
    setResolved(initial === 'system'? getSystem() : initial)

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) as Theme | null) === 'system' ||!localStorage.getItem(STORAGE_KEY)) {
        apply('system')
        setResolved(getSystem())
      }
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem(STORAGE_KEY, t) } catch {}
    apply(t)
    setResolved(t === 'system'? getSystem() : t)
  }

  return <ThemeCtx.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
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
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={theme === o.value}
            title={o.label}
            className={`rounded-full px-2 py-1 text- font-semibold transition ${
              theme === o.value
? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span aria-hidden>{o.icon}</span> {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
