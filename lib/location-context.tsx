'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; lat: number; lng: number }

const LocationContext = createContext<Loc>({ zip: '', city: '', lat: 0, lng: 0 })

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '', city: '', lat: 0, lng: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      try {
        // 1. Check saved location in localStorage — instant, works anywhere
        const savedZip = typeof window !== 'undefined' ? localStorage.getItem('user_zip') : null
        const savedCity = typeof window !== 'undefined' ? localStorage.getItem('user_city') : null
        if (savedZip) {
          setLoc({ zip: savedZip, city: savedCity || '', lat: 0, lng: 0 })
        }

        // 2. Profile zip — if user saved one anywhere in world
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('user_id', user.id)
            .maybeSingle()
          let prof = profile
          if (!prof) {
            const { data: p2 } = await supabase.from('profiles').select('zip_code').eq('id', user.id).maybeSingle()
            prof = p2
          }
          if (prof?.zip_code) {
            setLoc({ zip: prof.zip_code, city: '', lat: 0, lng: 0 })
            if (typeof window !== 'undefined') localStorage.setItem('user_zip', prof.zip_code)
            return
          }
        }

        // 3. GLOBAL AUTOMATIC: IP geocode — no permission needed, works anywhere in world
        // Your /api/geocode returns {zip, city} for ANY country via IP
        try {
          const r = await fetch('/api/geocode', { cache: 'no-store' })
          if (r.ok) {
            const d = await r.json()
            const globalZip = d?.zip || d?.postal_code || d?.postcode
            if (globalZip) {
              setLoc({ zip: globalZip, city: d.city || '', lat: 0, lng: 0 })
              if (typeof window !== 'undefined') {
                localStorage.setItem('user_zip', globalZip)
                if (d.city) localStorage.setItem('user_city', d.city)
              }
            }
          }
        } catch {}

        // 4. GPS for more accurate block — automatic, global
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, { cache: 'no-store' })
                if (r.ok) {
                  const d = await r.json()
                  const globalZip = d?.zip || d?.postal_code || d?.postcode
                  if (globalZip) {
                    setLoc({ zip: globalZip, city: d.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('user_zip', globalZip)
                      if (d.city) localStorage.setItem('user_city', d.city)
                    }
                  }
                }
              } catch {}
            },
            () => {},
            { timeout: 5000, maximumAge: 600000, enableHighAccuracy: false }
          )
        }
      } catch {}
    }
    init()
  }, [])

  return <LocationContext.Provider value={loc}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
