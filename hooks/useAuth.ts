'use client'

import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let subscription: any = null
    ;(async () => {
      try {
        const supabase = createClient() as any
        try {
          const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_e: any, s: any) => {
            try {
              if (cancelled) return
              setSession(s)
              setUser(s?.user?? null)
            } catch {}
          })
          subscription = sub
        } catch {}
        try {
          const { data } = await supabase.auth.getSession()
          if (cancelled) return
          setSession(data.session)
          setUser(data.session?.user?? null)
        } catch {} finally {
          if (!cancelled) try { setLoading(false) } catch {}
        }
      } catch {
        if (!cancelled) try { setLoading(false) } catch {}
      }
    })()
    return () => { cancelled = true; try { subscription?.unsubscribe() } catch {} }
  }, [])

  return { session, user, loading }
}
