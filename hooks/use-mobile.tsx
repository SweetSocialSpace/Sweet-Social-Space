'use client'

import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.matchMedia) { setIsMobile(false); return }
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => { try { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) } catch {} }
      try { mql.addEventListener('change', onChange) } catch { try { (mql as any).addListener(onChange) } catch {} }
      try { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) } catch {}
      return () => { try { mql.removeEventListener('change', onChange) } catch { try { (mql as any).removeListener(onChange) } catch {} } }
    } catch { try { setIsMobile(false) } catch {} }
  }, [])

  return !!isMobile
}
