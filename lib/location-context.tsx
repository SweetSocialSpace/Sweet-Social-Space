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

// RULE 1 GLOBAL - Default is GLOBAL detection, never empty
const LocationContext = createContext<CtxType>({
  zip: 'GLOBAL', city: 'Detecting Location...', country: 'US', lat: 0, lng: 0, 
  setLoc: () => {}, loading: true, radius: 20, 
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: 'GLOBAL', city: 'Detecting Location...', country: 'US', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(20)
  const [loading, setLoading] = useState(true)
  
  let supabase: any
  try { supabase = createClient() } catch { supabase = null }

  const setLocState = (l: Loc) => {
    try {
      if (!l?.zip || l.zip.toUpperCase()==='YOUR BLOCK' || l.zip==='') return
      setLoc(l)
      if (!supabase) return
      supabase.auth.getUser().then(({ data }: any) => {
        if (!data?.user) return
        supabase.from('profiles').update({ zip_code: l.zip, zip: l.zip, city: l.city||'', country: l.country||'' })
        .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`).then(()=>{}).catch(()=>{})
      }).catch(()=>{})
    } catch {}
  }

  const useMyLocation = async () => {
    try {
      setLoading(true)
      // RULE 1 - IP FIRST - GLOBAL for any user anywhere
      try {
        const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
        if (ip?.postal) {
          setLocState({ zip: ip.postal, city: ip.city||'', country: ip.country||'US', lat: ip.latitude||0, lng: ip.longitude||0 })
          setLoading(false)
          return
        }
      } catch {}

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const r = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
            if (r?.zip) setLocState({ zip: r.zip, city: r.city||'', country: r.country||'US', lat: latitude, lng: longitude })
          } catch {}
          setLoading(false)
        }, async () => {
          // GPS denied - IP fallback - GLOBAL
          try {
            const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
            if (ip?.postal) setLocState({ zip: ip.postal, city: ip.city||'', country: ip.country||'US', lat: ip.latitude||0, lng: ip.longitude||0 })
          } catch {}
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    } catch { setLoading(false) }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        
        // VERTEBRAE RULE - INDEPENDENT - IP FIRST, GLOBAL
        try {
          const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
          if (ip?.postal && ip.postal.toUpperCase()!=='YOUR BLOCK') {
            setLoc({ zip: ip.postal, city: ip.city||'', country: ip.country||'US', lat: ip.latitude||0, lng: ip.longitude||0 })
            setLoading(false)
            return
          }
        } catch {}

        // Profile SECOND, not first
        if (supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle()
              const finalZip = profile?.zip_code || profile?.zip
              if (finalZip && finalZip.trim()!=='' && finalZip.toUpperCase()!=='YOUR BLOCK') {
                setLoc({ zip: finalZip, city: profile?.city||'', country: profile?.country||'US', lat: 0, lng: 0 })
                setLoading(false)
                return
              }
            }
          } catch {}
        }

        // RULE 2 FAILSAFE - NEVER empty, NEVER YOUR BLOCK
        setLoc({ zip: '95122', city: 'San Jose', country: 'US', lat: 37.3352, lng: -121.8328 })
      } catch {
        setLoc({ zip: '95122', city: 'San Jose', country: 'US', lat: 37.3352, lng: -121.8328 })
      } finally { setLoading(false) }
    }
    init()
  }, [])

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading, radius, setRadius, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  try { return useContext(LocationContext) } catch {
    return { zip: 'GLOBAL', city: 'Detecting Location...', country: 'US', lat: 0, lng: 0, setLoc: () => {}, loading: false, radius: 20, setRadius: () => {}, useMyLocation: () => {} } as CtxType
  }
}
