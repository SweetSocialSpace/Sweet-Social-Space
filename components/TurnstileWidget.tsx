'use client'

import { useEffect, useId, useRef } from 'react'

type Props = {
  siteKey: string
  onToken: (token: string) => void
  /** Called when the token expires so the parent can clear it. */
  onExpire?: () => void
}

/**
 * Minimal Cloudflare Turnstile loader. Renders an invisible/visible challenge
 * and calls `onToken` once a token is captured.
 */
export function TurnstileWidget({ siteKey, onToken, onExpire }: Props) {
  const elId = useId().replace(/:/g, '')
  const containerId = `ts-${elId}`
  const renderedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!document.querySelector('script[data-turnstile]')) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.setAttribute('data-turnstile', '1')
      document.head.appendChild(s)
    }
    const w = window as Window & {
      turnstile?: {
        render: (sel: string, cfg: Record<string, unknown>) => void
      }
    }
    const tryRender = () => {
      const el = document.getElementById(containerId)
      if (!el || renderedRef.current) return false
      if (!w.turnstile) return false
      renderedRef.current = true
      w.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        callback: (tok: string) => onToken(tok),
        'expired-callback': () => onExpire?.(),
        'error-callback': () => onExpire?.(),
      })
      return true
    }
    if (!tryRender()) {
      const interval = setInterval(() => {
        if (tryRender()) clearInterval(interval)
      }, 250)
      const timeout = setTimeout(() => clearInterval(interval), 8000)
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [containerId, siteKey, onToken, onExpire])

  return <div id={containerId} className="mt-3 flex justify-center" />
}
