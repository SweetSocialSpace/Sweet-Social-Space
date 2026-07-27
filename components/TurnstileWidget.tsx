'use client'

import { useEffect, useId, useRef } from 'react'

type Props = {
  siteKey: string
  onToken: (token: string) => void
  onExpire?: () => void
}

export function TurnstileWidget({ siteKey, onToken, onExpire }: Props) {
  const elId = useId().replace(/:/g, '')
  const containerId = `ts-${elId}`
  const renderedRef = useRef(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      if (!siteKey) return
      try {
        if (!document.querySelector('script[data-turnstile]')) {
          const s = document.createElement('script')
          s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
          s.async = true
          s.defer = true
          s.setAttribute('data-turnstile', '1')
          document.head.appendChild(s)
        }
      } catch {}
      const w = window as Window & { turnstile?: { render: (sel: string, cfg: Record<string, unknown>) => void } }
      const tryRender = () => {
        try {
          const el = document.getElementById(containerId)
          if (!el || renderedRef.current) return false
          if (!w.turnstile) return false
          renderedRef.current = true
          w.turnstile.render(`#${containerId}`, {
            sitekey: siteKey,
            callback: (tok: string) => { try { onToken(tok) } catch {} },
            'expired-callback': () => { try { onExpire?.() } catch {} },
            'error-callback': () => { try { onExpire?.() } catch {} },
          })
          return true
        } catch { return false }
      }
      if (!tryRender()) {
        const interval = setInterval(() => { try { if (tryRender()) clearInterval(interval) } catch {} }, 250)
        const timeout = setTimeout(() => { try { clearInterval(interval) } catch {} }, 8000)
        return () => { try { clearInterval(interval) } catch {}; try { clearTimeout(timeout) } catch {} }
      }
    } catch {}
  }, [containerId, siteKey, onToken, onExpire])

  return <div id={containerId} className="mt-3 flex justify-center" />
}
