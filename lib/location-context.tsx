'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; lat: number; lng: number }

type CtxType = Loc & { setLoc: (l: Loc) => void; loading: boolean }

const LocationContext = createContext<CtxType>({
  zip: '', city: '', lat: 0, lng: 0,
  setLoc: () => {},
  loading: true,
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
        // SAVED FIRST — instant
        if (typeof window !== 'undefined') {
          const savedZip = localStorage.getItem('user_zip')
          const savedCity = localStorage.getItem('user_city')
          if (savedZip && mounted) {
            setLoc({ zip: savedZip, city: savedCity || '', lat: 0, lng: 0 })
          }
        }

        // PROFILE — TRUTH — GLOBAL — forced at signup
        const { data: { user } } = await supabase.auth.getUser()
        if (user && mounted) {
          const { data: p1 } = await supabase.from('profiles').select('zip_code, city').eq('user_id', user.id).maybeSingle()
          let profile = p1
          if (!profile?.zip_code) {
            const { data: p2 } = await supabase.from('profiles').select('zip_code, city').eq('id', user.id).maybeSingle()
            profile = p2
          }
          if (profile?.zip_code) {
            setLoc({ zip: profile.zip_code, city: profile.city || '', lat: 0, lng: 0 })
            localStorage.setItem('user_zip', profile.zip_code)
            if (profile.city) localStorage.setItem('user_city', profile.city)
            setLoading(false)
            return
          }
        }

        // IP — GLOBAL AUTOMATED — no lat/lng needed
        try {
          const r = await fetch('/api/geocode', { cache: 'no-store' })
          if (r.ok && mounted) {
            const d = await r.json()
            const gZip = d?.zip || d?.postal_code || d?.postcode || d?.zip_code
            if (gZip) {
              setLoc({ zip: gZip, city: d.city || d.locality || '', lat: d.lat || 0, lng: d.lng || 0 })
              localStorage.setItem('user_zip', gZip)
              if (d.city) localStorage.setItem('user_city', d.city)
              setLoading(false)
              return
            }
          }
        } catch {}

        // BROWSER GPS — last resort
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, { cache: 'no-store' })
                if (r.ok && mounted) {
                  const d = await r.json()
                  const gZip = d?.zip || d?.postal_code || d?.postcode
                  if (gZip) {
                    setLoc({ zip: gZip, city: d.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                    localStorage.setItem('user_zip', gZip)
                  }
                }
              } catch {}
              if (mounted) setLoading(false)
            },
            () => { if (mounted) setLoading(false) },
            { timeout: 8000, maximumAge: 600000 }
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

  return <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading }}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
