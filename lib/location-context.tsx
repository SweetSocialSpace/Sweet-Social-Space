'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; country: string; lat: number; lng: number }
type CtxType = Loc & { setLoc: (l: Loc) => void; loading: boolean; radius: number; setRadius: (n:number)=>void; useMyLocation: () => void }

const LocationContext = createContext<CtxType>({
  zip: 'LOCAL', city: 'your area', country: '', lat: 0, lng: 0,
  setLoc: () => {}, loading: true, radius: 5,
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

function cleanCity(rawCity: string) {
  if (!rawCity || rawCity.trim()==='') return 'your area'
  return rawCity
}

async function resolveCity(zip: string, fallbackCity: string, fallbackCountry: string) {
  if (!zip || zip === 'LOCAL') return { city: 'your area', country: fallbackCountry || '', lat: 0, lng: 0 }
  try {
    const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`)
    if (res.ok) {
      const data = await res.json()
      return { city: data.city || fallbackCity || zip, country: data.country || fallbackCountry || '', lat: Number(data.lat)||0, lng: Number(data.lon)||0 }
    }
  } catch {}
  return { city: fallbackCity || zip, country: fallbackCountry || '', lat: 0, lng: 0 }
}

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: 'LOCAL', city: 'your area', country: '', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)
  let supabase: any
  try { supabase = createClient() } catch { supabase = null }

  const setLocState = async (l: Loc) => {
    if (!l?.zip) return
    const cleaned = cleanCity(l.city)
    const resolved = await resolveCity(l.zip, cleaned, l.country)
    const final = { zip: l.zip, city: cleanCity(resolved.city) || cleaned, country: resolved.country || l.country, lat: resolved.lat || l.lat, lng: resolved.lng || l.lng }
    setLoc(final)
    if (l.zip !== 'LOCAL') localStorage.setItem('feed_near_zip', l.zip)
  }

    const useMyLocation = async () => {
    // DISABLED - No GPS/IP location detection per user request
    // Platform should only use zip codes, not automatic GPS detection
    console.log('GPS location detection disabled - using zip codes only')
    setLoading(false)
  }

  const loadLocationForUser = async (userId: string) => {
    setLoading(true)
    try {
      // First try to get from profiles table
      const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${userId},user_id.eq.${userId}`).maybeSingle()
      const finalZip = profile?.zip_code || profile?.zip
      if (finalZip && finalZip.trim() !== '' && finalZip !== 'LOCAL') {
        const cleaned = cleanCity(profile?.city || '')
        const resolved = await resolveCity(finalZip, cleaned, profile?.country || '')
        setLoc({ zip: finalZip, city: cleanCity(resolved.city) || cleaned, country: resolved.country || profile?.country || '', lat: resolved.lat, lng: resolved.lng })
        setLoading(false)
        return
      }
      
      // Fallback: Try to get from auth metadata (signup data)
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.zip_code) {
        const metaZip = user.user_metadata.zip_code
        const metaCity = user.user_metadata.city || ''
        const metaCountry = user.user_metadata.country || ''
        const cleaned = cleanCity(metaCity)
        const resolved = await resolveCity(metaZip, cleaned, metaCountry)
        setLoc({ zip: metaZip, city: cleanCity(resolved.city) || cleaned, country: resolved.country || metaCountry, lat: resolved.lat, lng: resolved.lng })
        setLoading(false)
        return
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await loadLocationForUser(user.id)
            return
          }
        } catch {}
      }
      try {
        const saved = localStorage.getItem('feed_near_zip')
        if (saved && saved !== 'LOCAL') {
          const resolved = await resolveCity(saved, '', '')
          setLoc({ zip: saved, city: cleanCity(resolved.city), country: resolved.country, lat: resolved.lat, lng: resolved.lng })
          setLoading(false)
          return
        }
      } catch {}
      setLoc({ zip: 'LOCAL', city: 'your area', country: '', lat: 0, lng: 0 })
      setLoading(false)
    }
    
    init()

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadLocationForUser(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setLoc({ zip: 'LOCAL', city: 'your area', country: '', lat: 0, lng: 0 })
          setLoading(false)
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [])

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState as any, loading, radius, setRadius, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  try { return useContext(LocationContext) } catch {
    return { zip: 'LOCAL', city: 'your area', country: '', lat: 0, lng: 0, setLoc: () => {}, loading: false, radius: 5, setRadius: () => {}, useMyLocation: () => {} } as CtxType
  }
}
