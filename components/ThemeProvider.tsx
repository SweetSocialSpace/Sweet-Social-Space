'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  es: { theme:"Tema", light:"Claro", dark:"Oscuro", auto:"Auto" },
  fr: { theme:"Theme", light:"Clair", dark:"Sombre", auto:"Auto" },
  de: { theme:"Thema", light:"Hell", dark:"Dunkel", auto:"Auto" },
  zh: { theme:"主题", light:"浅色", dark:"深色", auto:"自动" },
  ja: { theme:"テーマ", light:"ライト", dark:"ダーク", auto:"自動" },
  ko: { theme:"테마", light:"라이트", dark:"다크", auto:"자동" },
  pt: { theme:"Tema", light:"Claro", dark:"Escuro", auto:"Auto" },
  ru: { theme:"Tema", light:"Svetlaya", dark:"Temnaya", auto:"Avto" },
  ar: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  hi: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  it: { theme:"Tema", light:"Chiaro", dark:"Scuro", auto:"Auto" },
  nl: { theme:"Thema", light:"Licht", dark:"Donker", auto:"Auto" },
  tl: { theme:"Tema", light:"Liwanag", dark:"Madilim", auto:"Auto" },
  bn: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  id: { theme:"Tema", light:"Terang", dark:"Gelap", auto:"Otomatis" },
  vi: { theme:"Chu de", light:"Sang", dark:"Toi", auto:"Tu dong" },
  th: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  sv: { theme:"Tema", light:"Ljust", dark:"Morkt", auto:"Auto" },
  pl: { theme:"Motyw", light:"Jasny", dark:"Ciemny", auto:"Auto" },
  tr: { theme:"Tema", light:"Acik", dark:"Koyu", auto:"Oto" },
  uk: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  el: { theme:"Thema", light:"Fos", dark:"Skotadi", auto:"Auto" },
  he: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  ur: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  fa: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  ms: { theme:"Tema", light:"Cerah", dark:"Gelap", auto:"Auto" },
  ro: { theme:"Tema", light:"Deschis", dark:"Intunecat", auto:"Auto" },
  cs: { theme:"Tema", light:"Svetle", dark:"Tmave", auto:"Auto" },
  hu: { theme:"Tema", light:"Vilagos", dark:"Sotet", auto:"Auto" },
  fi: { theme:"Teema", light:"Vaalea", dark:"Tumma", auto:"Auto" },
  no: { theme:"Tema", light:"Lyst", dark:"Morkt", auto:"Auto" },
  da: { theme:"Tema", light:"Lyst", dark:"Morkt", auto:"Auto" },
  bg: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  hr: { theme:"Tema", light:"Svijetlo", dark:"Tamno", auto:"Auto" },
  sr: { theme:"Tema", light:"Svetlo", dark:"Tamno", auto:"Auto" },
  sk: { theme:"Tema", light:"Svetle", dark:"Tmave", auto:"Auto" },
  sl: { theme:"Tema", light:"Svetlo", dark:"Temno", auto:"Samodejno" },
  et: { theme:"Teema", light:"Hele", dark:"Tume", auto:"Auto" },
  lv: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  lt: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  be: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  ka: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  hy: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  az: { theme:"Mövzu", light:"Aciq", dark:"Tünd", auto:"Avto" },
  kk: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  ky: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  uz: { theme:"Mavzu", light:"Yorug", dark:"Qorongi", auto:"Avto" },
  tg: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  mn: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  km: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  lo: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
  my: { theme:"Theme", light:"Light", dark:"Dark", auto:"Auto" },
}

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
  const { language } = useLanguage()
  const d = D[language] || D.en
  const opts: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: d.light, icon: '☀' },
    { value: 'dark', label: d.dark, icon: '🌙' },
    { value: 'system', label: d.auto, icon: '🖥' },
  ]
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted-foreground">{d.theme}</span>
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
