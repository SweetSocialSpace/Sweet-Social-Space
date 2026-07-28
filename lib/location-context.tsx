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
  zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0, 
  setLoc: () => {}, loading: true, radius: 5, 
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5) // KISS - start 5, user picks 5/10/15/20
  const [loading, setLoading] = useState(true)
  
  let supabase: any
  try { supabase = createClient() } catch { supabase = null }

  const setLocState = (l: Loc) => {
    if (!l?.zip || l.zip === 'GLOBAL' || l.zip === '') return
    setLoc(l)
    localStorage.setItem('feed_near_zip', l.zip)
    // Only update profile if user explicitly searches new zip - not on IP auto-detect
  }

  const useMyLocation = async () => {
    setLoading(true)
    try {
      const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
      if (ip?.postal) {
        setLocState({ zip: ip.postal, city: ip.city||'', country: ip.country||'US', lat: ip.latitude||0, lng: ip.longitude||0 })
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      // KISS - end user first
      // 1. Profile zip - what they typed at signup - THIS WINS
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle()
            const finalZip = profile?.zip_code || profile?.zip
            if (finalZip && finalZip !== 'GLOBAL' && finalZip.trim() !== '') {
              setLoc({ zip: finalZip, city: profile?.city||'', country: profile?.country||'US', lat: 0, lng: 0 })
              setLoading(false)
              return
            }
          }
        } catch {}
      }

      // 2. No profile zip - use IP - works anywhere in world - GLOBAL
      try {
        const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
        if (ip?.postal) {
          setLoc({ zip: ip.postal, city: ip.city||'', country: ip.country||'US', lat: ip.latitude||0, lng: ip.longitude||0 })
          setLoading(false)
          return
        }
      } catch {}

      // 3. Failsafe
      setLoc({ zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0 })
      setLoading(false)
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
    return { zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0, setLoc: () => {}, loading: false, radius: 5, setRadius: () => {}, useMyLocation: () => {} } as CtxType
  }
}
