'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCreatorStatus } from '@/app/actions/livestream'

/** Returns whether the signed-in user has an active Creator subscription. */
export function useIsCreator() {
  const [isCreator, setIsCreator] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { 
        if (!cancelled) setIsCreator(false) 
        return 
      }
      try {
        const r = await getCreatorStatus()
        if (!cancelled) setIsCreator(r.isCreator)
      } catch {
        if (!cancelled) setIsCreator(false)
      }
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') load()
    })
    return () => { 
      cancelled = true 
      sub.subscription.unsubscribe() 
    }
  }, [])

  return isCreator
}
