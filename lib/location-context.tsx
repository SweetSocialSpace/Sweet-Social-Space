'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const LocationContext = createContext({ zip: '', city: '', lat: 0, lng: 0 })

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState({ zip: '', city: '', lat: 0, lng: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function initLocation() {
      try {
        // 1. User profile zip - but NEVER trust profile.city (stale)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('id', user.id)
            .maybeSingle()
          if (profile?.zip_code) {
            // City empty = forces weather API to give real city for this zip
            setLoc({ zip: profile.zip_code, city: '', lat: 0, lng: 0 })
            return
          }
        }

        // 2. Browser geolocation
        navigator.geolocation?.getCurrentPosition(async (pos) => {
          try {
            const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
            if (r.ok) {
              const data = await r.json()
              if (data?.zip) {
                setLoc({ zip: data.zip, city: data.city || '', lat: pos.coords.latitude, lng: pos.coords.longitude })
                return
              }
            }
          } catch {}
          setLoc({ zip: '', city: '', lat: pos.coords.latitude, lng: pos.coords.longitude })
        }, async () => {
          // 3. IP geolocation fallback
          try {
            const r = await fetch('/api/geocode')
            if (r.ok) {
              const data = await r.json()
              if (data?.zip) {
                setLoc({ zip: data.zip, city: data.city || '', lat: 0, lng: 0 })
              }
            }
          } catch {}
        }, { timeout: 3000 })
        
      } catch {}
    }
    initLocation()
  }, [])

  return <LocationContext.Provider value={loc}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
