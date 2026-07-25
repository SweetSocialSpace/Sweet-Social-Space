'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; lat: number; lng: number }

const LocationContext = createContext<Loc>({ zip: '95122', city: 'San Jose', lat: 37.3352, lng: -121.8811 })

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '95122', city: 'San Jose', lat: 37.3352, lng: -121.8811 })
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      try {
        // 1. Check saved zip in localStorage first — instant automatic
        const savedZip = typeof window !== 'undefined' ? localStorage.getItem('user_zip') : null
        if (savedZip) {
          setLoc(prev => ({ ...prev, zip: savedZip }))
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('user_id', user.id)
            .maybeSingle()
          // fallback to id column if user_id fails
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

        // 2. Try IP geocode first — fast, no permission needed — automatic
        try {
          const r = await fetch('/api/geocode', { cache: 'no-store' })
          if (r.ok) {
            const d = await r.json()
            if (d?.zip) {
              setLoc({ zip: d.zip, city: d.city || '', lat: 0, lng: 0 })
              if (typeof window !== 'undefined') localStorage.setItem('user_zip', d.zip)
              // still try to get more accurate GPS after
            }
          }
        } catch {}

        // 3. Try GPS for more accurate — automatic, no manual click
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, { cache: 'no-store' })
                if (r.ok) {
                  const d = await r.json()
                  if (d?.zip) {
                    setLoc({ zip: d.zip, city: d.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                    if (typeof window !== 'undefined') localStorage.setItem('user_zip', d.zip)
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
