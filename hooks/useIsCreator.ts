'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useIsCreator() {
  const [isCreator, setIsCreator] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    let sub: any = null
    ;(async () => {
      try {
        const supabase = createClient() as any
        const load = async () => {
          try {
            if (!cancelled) setIsCreator(false) // Phase 1 stub
          } catch { if (!cancelled) setIsCreator(false) }
        }
        await load()
        try {
          const { data } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') load()
          })
          sub = data
        } catch {}
      } catch { if (!cancelled) setIsCreator(false) }
    })()
    return () => { cancelled = true; try { sub?.subscription?.unsubscribe() } catch {} }
  }, [])

  return isCreator
}
