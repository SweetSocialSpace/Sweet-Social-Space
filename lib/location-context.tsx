'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const LocationContext = createContext({ zip: '95122', city: 'San Jose', lat: 37.335, lng: -121.885 })

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState({ zip: '95122', city: 'San Jose', lat: 37.335, lng: -121.885 })

  useEffect(() => {
    // 1. Try browser location -> reverse geocode to zip
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const r = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      if (r.ok) {
        const data = await r.json()
        setLoc({ zip: data.zip, city: data.city, lat: pos.coords.latitude, lng: pos.coords.longitude })
      }
    })
    // 2. Fallback - IP geolocation from Vercel headers
    // 3. Fallback - user profile zip
  }, [])

  return <LocationContext.Provider value={loc}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
