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
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('id', user.id)
            .maybeSingle()
          if (profile?.zip_code) {
            setLoc({ zip: profile.zip_code, city: '', lat: 0, lng: 0 })
            return
          }
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`, { cache: 'no-store' })
                if (r.ok) {
                  const d = await r.json()
                  if (d?.zip) {
                    setLoc({ zip: d.zip, city: d.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                    return
                  }
                }
              } catch {}
            },
            async () => {
              try {
                const r = await fetch('/api/geocode', { cache: 'no-store' })
                if (r.ok) {
                  const d = await r.json()
                  if (d?.zip) setLoc({ zip: d.zip, city: d.city || '', lat: 0, lng: 0 })
                }
              } catch {}
            },
            { timeout: 3000 }
          )
        }
      } catch {}
    }
    init()
  }, [])

  return <LocationContext.Provider value={loc}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
