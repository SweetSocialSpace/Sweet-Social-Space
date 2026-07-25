'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; country: string; lat: number; lng: number }
type CtxType = Loc & { 
  setLoc: (l: Loc) => void; 
  loading: boolean;
  radius: number;
  setRadius: (n:number)=>void;
  useMyLocation: () => void;
}

const LocationContext = createContext<CtxType>({
  zip: '', city: '', country: '', lat: 0, lng: 0, 
  setLoc: () => {}, loading: true,
  radius: 5, setRadius: ()=>{},
  useMyLocation: ()=>{}
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '', city: '', country: '', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const setLocState = (l: Loc) => {
    setLoc(l)
    if (typeof window !== 'undefined') {
      if (l.zip) localStorage.setItem('user_zip', l.zip)
      if (l.city) localStorage.setItem('user_city', l.city)
      if (l.country) localStorage.setItem('user_country', l.country)
    }
    // Save to profile for ALL automated components
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').update({ 
        zip_code: l.zip, city: l.city, country: l.country, zip: l.zip 
      }).or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`).then(()=>{})
    })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        // GLOBAL - works for any country, no backend needed
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        const d = await res.json()
        const newLoc = {
          zip: d.postcode || d.postalCode || loc.zip,
          city: d.city || d.locality || loc.city,
          country: d.countryName || loc.country,
          lat: latitude, lng: longitude
        }
        setLocState(newLoc)
      } catch {}
      setLoading(false)
    }, () => setLoading(false), { timeout: 8000 })
  }

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        // 1. Check localStorage first (fast)
        const savedZip = localStorage.getItem('user_zip')
        const savedCity = localStorage.getItem('user_city')
        const savedCountry = localStorage.getItem('user_country')
        if (savedZip && mounted) {
          setLoc({ zip: savedZip, city: savedCity || '', country: savedCountry || '', lat: 0, lng: 0 })
        }

        // 2. Check profile (authoritative)
        const { data: { user } } = await supabase.auth.getUser()
        if (user && mounted) {
          const { data: profile } = await supabase.from('profiles')
            .select('zip_code, zip, city, country')
            .or(`id.eq.${user.id},user_id.eq.${user.id}`)
            .maybeSingle()
          
          const finalZip = profile?.zip_code || profile?.zip || savedZip
          if (finalZip) {
            setLoc({ 
              zip: finalZip, 
              city: profile?.city || savedCity || '', 
              country: profile?.country || savedCountry || '',
              lat: 0, lng: 0 
            })
            if (mounted) { setLoading(false); return }
          }
        }

        // 3. No backend /api/geocode needed - we removed that dependency
      } catch {}
      if (mounted) setLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [])

  return <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading, radius, setRadius, useMyLocation }}>{children}</LocationContext.Provider>
}
export const useLocation = () => useContext(LocationContext)
