'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; country: string; lat: number; lng: number }
type CtxType = Loc & { 
  setLoc: (l: Loc) => void; 
  loading: boolean; 
  radius: number; 
  setRadius: (n:number)=>void; 
  useMyLocation: () => void; 
}

const LocationContext = createContext<CtxType>({
  zip: '', city: '', country: '', lat: 0, lng: 0, 
  setLoc: () => {}, loading: true, radius: 20, 
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '', city: '', country: '', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(20) // Global default 20mi, not 5mi - works for sparse areas
  const [loading, setLoading] = useState(true)
  
  // House-safe client - never crashes
  let supabase: any
  try {
    supabase = createClient()
  } catch {
    supabase = null
  }

  const setLocState = (l: Loc) => {
    try {
      if (!l?.zip) return
      setLoc(l)
      if (!supabase) return
      // Automated - save to profile, any zip on earth
      supabase.auth.getUser().then(({ data }: any) => {
        if (!data?.user) return
        supabase.from('profiles').update({ 
          zip_code: l.zip, 
          zip: l.zip, 
          city: l.city || '', 
          country: l.country || '' 
        })
        .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`)
        .then(()=>{})
        .catch(()=>{}) // House never dies
      }).catch(()=>{})
    } catch {}
  }

  const useMyLocation = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return
      setLoading(true)
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const r = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
          const d = await r.json()
          if (d?.zip) {
            setLocState({ 
              zip: d.zip, 
              city: d.city || '', 
              country: d.country || '', 
              lat: latitude, 
              lng: longitude 
            })
          }
        } catch {}
        setLoading(false)
      }, () => {
        setLoading(false)
      })
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        if (!supabase) {
          setLoc({ zip: '', city: '', country: '', lat: 0, lng: 0 })
          setLoading(false)
          return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles')
            .select('zip_code, zip, city, country')
            .or(`id.eq.${user.id},user_id.eq.${user.id}`)
            .maybeSingle()
          const finalZip = profile?.zip_code || profile?.zip
          if (finalZip) {
            setLoc({ 
              zip: finalZip, 
              city: profile?.city||'', 
              country: profile?.country||'', 
              lat: 0, lng: 0 
            })
            setLoading(false)
            return
          }
        }
        // Global fallback - no zip yet, house still alive, shows "YOUR BLOCK"
        setLoc({ zip: '', city: '', country: '', lat: 0, lng: 0 })
      } catch {
        // House never dies - even if Supabase dead, feed loads
        setLoc({ zip: '', city: '', country: '', lat: 0, lng: 0 })
      } finally {
        setLoading(false)
      }
    }
    init()

    try {
      if (!supabase) return
      const { data: sub } = supabase.auth.onAuthStateChange(() => init())
      return () => {
        try { sub.subscription.unsubscribe() } catch {}
      }
    } catch {
      return
    }
  }, [])

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading, radius, setRadius, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  try {
    return useContext(LocationContext)
  } catch {
    // House never dies - if context fails, return global fallback
    return {
      zip: '', city: '', country: '', lat: 0, lng: 0,
      setLoc: () => {}, loading: false, radius: 20,
      setRadius: () => {}, useMyLocation: () => {}
    } as CtxType
  }
}
