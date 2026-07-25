'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type LocationState = {
  zip: string
  city: string
  country: string
  lat: number | null
  lng: number | null
  radius: number
  loading: boolean
  setRadius: (n: number) => void
  setLocation: (zip: string, city: string, country: string) => void
  useMyLocation: () => void
}

const LocationContext = createContext<LocationState | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)

  // Load from profile + localStorage on boot
  useEffect(() => {
    const boot = async () => {
      const saved = localStorage.getItem('sss_location')
      if (saved) {
        const p = JSON.parse(saved)
        setZip(p.zip || ''); setCity(p.city || ''); setCountry(p.country || '')
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('zip_code,city,country').eq('id', user.id).single()
        if (data?.zip_code) {
          setZip(data.zip_code); setCity(data.city || ''); setCountry(data.country || '')
          localStorage.setItem('sss_location', JSON.stringify(data))
        }
      }
      setLoading(false)
    }
    boot()
  }, [])

  const setLocation = (newZip: string, newCity: string, newCountry: string) => {
    setZip(newZip); setCity(newCity); setCountry(newCountry)
    localStorage.setItem('sss_location', JSON.stringify({ zip: newZip, city: newCity, country: newCountry }))
    // Also save to profile for automation
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from('profiles').update({ zip_code: newZip, city: newCity, country: newCountry }).eq('id', data.user.id).then(()=>{})
    })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      setLat(latitude); setLng(longitude)
      try {
        // GLOBAL reverse geocode - works for ANY country
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        const data = await res.json()
        const newZip = data.postcode || data.postalCode || ''
        const newCity = data.city || data.locality || ''
        const newCountry = data.countryName || ''
        if (newZip || newCity) setLocation(newZip, newCity, newCountry)
      } catch {}
      setLoading(false)
    }, () => setLoading(false), { timeout: 8000 })
  }

  return (
    <LocationContext.Provider value={{ zip, city, country, lat, lng, radius, loading, setRadius, setLocation, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be inside LocationProvider')
  return ctx
}
