'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; lat: number; lng: number }

type CtxType = Loc & { 
  setLoc: (l: Loc) => void
  loading: boolean 
}

const LocationContext = createContext<CtxType>({ 
  zip: '', city: '', lat: 0, lng: 0, 
  setLoc: () => {}, 
  loading: true 
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '', city: '', lat: 0, lng: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const setLocState = (l: Loc) => {
    setLoc(l)
    if (typeof window !== 'undefined') {
      if (l.zip) localStorage.setItem('user_zip', l.zip)
      if (l.city) localStorage.setItem('user_city', l.city)
    }
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // 1. PROFILE IS TRUTH — GLOBAL — forced at signup
        const { data: { user } } = await supabase.auth.getUser()
        if (user && mounted) {
          // Try user_id (new schema)
          const { data: p1 } = await supabase.from('profiles').select('zip_code, city').eq('user_id', user.id).maybeSingle()
          let profile = p1
          // Fallback to id (old schema — your bug)
          if (!profile?.zip_code) {
            const { data: p2 } = await supabase.from('profiles').select('zip_code, city').eq('id', user.id).maybeSingle()
            profile = p2
          }
          if (profile?.zip_code && mounted) {
            setLoc({ zip: profile.zip_code, city: profile.city || '', lat: 0, lng: 0 })
            localStorage.setItem('user_zip', profile.zip_code)
            if (profile.city) localStorage.setItem('user_city', profile.city)
            setLoading(false)
            return // legit — profile wins, global
          }
        }

        // 2. SAVED — second truth
        if (typeof window !== 'undefined') {
          const savedZip = localStorage.getItem('user_zip')
          const savedCity = localStorage.getItem('user_city')
          if (savedZip && mounted) {
            setLoc({ zip: savedZip, city: savedCity || '', lat: 0, lng: 0 })
            setLoading(false)
            return
          }
        }

        // 3. IP GEO — GLOBAL AUTOMATED — works UK, India, Japan, anywhere
        try {
          const r = await fetch('/api/geocode', { cache: 'no-store' })
          if (r.ok && mounted) {
            const d = await r.json()
            const globalZip = d?.zip || d?.postal_code || d?.postcode || d?.zip_code
            if (globalZip) {
              setLoc({ zip: globalZip, city: d.city || d.locality || '', lat: d.lat || 0, lng: d.lng || 0 })
              if (typeof window !== 'undefined') {
                localStorage.setItem('user_zip', globalZip)
                if (d.city) localStorage.setItem('user_city', d.city)
              }
              setLoading(false)
              return
            }
          }
        } catch {}

        // 4. BROWSER GEO — last resort global
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, { cache: 'no-store' })
                if (r.ok && mounted) {
                  const d = await r.json()
                  const globalZip = d?.zip || d?.postal_code || d?.postcode
                  if (globalZip) {
                    setLoc({ zip: globalZip, city: d.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                    localStorage.setItem('user_zip', globalZip)
                  }
                }
              } catch {}
              if (mounted) setLoading(false)
            },
            () => { if (mounted) setLoading(false) },
            { timeout: 8000, maximumAge: 600000, enableHighAccuracy: false }
          )
          return
        }

        if (mounted) setLoading(false)
      } catch {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => { mounted = false }
  }, [])

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
