'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// GLOBAL FIX: No hardcoded 95122. Empty default = forces real lookup
const LocationContext = createContext({ zip: '', city: '', lat: 0, lng: 0 })

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState({ zip: '', city: '', lat: 0, lng: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function initLocation() {
      try {
        // 1. Try user profile zip first - most accurate for logged-in user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zip_code, city')
            .eq('id', user.id)
            .maybeSingle()
          if (profile?.zip_code) {
            setLoc({ zip: profile.zip_code, city: profile.city || '', lat: 0, lng: 0 })
            return
          }
        }

        // 2. Try browser location -> reverse geocode to zip
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
          // Browser denied but we have coords
          setLoc({ zip: '', city: '', lat: pos.coords.latitude, lng: pos.coords.longitude })
        }, async () => {
          // 3. Fallback - IP geolocation via your geocode API without lat/lng
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
