'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Returns whether the signed-in user has an active Creator subscription. */
/** Phase 1: Always returns false. Will wire up livestream actions in Phase 2. */
export function useIsCreator() {
  const [isCreator, setIsCreator] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!cancelled) {
        // Phase 1 stub: no creator check yet
        setIsCreator(false)
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
