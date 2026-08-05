'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; country: string; lat: number; lng: number }
type CtxType = Loc & { setLoc: (l: Loc) => void; loading: boolean; radius: number; setRadius: (n:number)=>void; useMyLocation: () => void }

const LocationContext = createContext<CtxType>({
  zip: 'GLOBAL', city: 'your area', country: 'US', lat: 0, lng: 0,
  setLoc: () => {}, loading: true, radius: 5,
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

function cleanCity(rawCity: string) {
  if (!rawCity || rawCity.trim()==='') return 'your area'
  return rawCity
}

async function resolveCity(zip: string, fallbackCity: string, fallbackCountry: string) {
  if (!zip || zip === 'GLOBAL') return { city: 'your area', country: fallbackCountry, lat: 0, lng: 0 }
  try {
    const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`)
    if (res.ok) {
      const data = await res.json()
      return { city: data.city || fallbackCity || zip, country: data.country || fallbackCountry, lat: Number(data.lat)||0, lng: Number(data.lon)||0 }
    }
  } catch {}
  return { city: fallbackCity || zip, country: fallbackCountry, lat: 0, lng: 0 }
}

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: 'GLOBAL', city: 'your area', country: 'US', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  let supabase: any
  try { supabase = createClient() } catch { supabase = null }

  const setLocState = async (l: Loc) => {
    if (!l?.zip) return
    const cleaned = cleanCity(l.city)
    const resolved = await resolveCity(l.zip, cleaned, l.country)
    const final = { zip: l.zip, city: cleanCity(resolved.city) || cleaned, country: resolved.country || l.country, lat: resolved.lat || l.lat, lng: resolved.lng || l.lng }
    setLoc(final)
    if (l.zip !== 'GLOBAL') localStorage.setItem('feed_near_zip', l.zip)
  }

  const useMyLocation = async () => {
    setLoading(true)
    try {
      const pos = await new Promise<GeolocationPosition>((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:8000}))
      const { latitude, longitude } = pos.coords
      const r = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`).then(x=>x.json()).catch(()=>null)
      if(r?.zip){
        setLoc({ zip: r.zip, city: cleanCity(r.city), country: r.country||'US', lat: latitude, lng: longitude })
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    setMounted(true)
    async function init() {
      setLoading(true)
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle()
            const finalZip = profile?.zip_code || profile?.zip
            if (finalZip && finalZip.trim() !== '' && finalZip !== 'GLOBAL') {
              const cleaned = cleanCity(profile?.city || '')
              const resolved = await resolveCity(finalZip, cleaned, profile?.country || 'US')
              setLoc({ zip: finalZip, city: cleanCity(resolved.city) || cleaned, country: resolved.country || profile?.country || 'US', lat: resolved.lat, lng: resolved.lng })
              setLoading(false)
              return
            }
          }
        } catch {}
      }
      try {
        const saved = localStorage.getItem('feed_near_zip')
        if (saved && saved !== 'GLOBAL') {
          const resolved = await resolveCity(saved, '', 'US')
          setLoc({ zip: saved, city: cleanCity(resolved.city), country: resolved.country, lat: resolved.lat, lng: resolved.lng })
          setLoading(false)
          return
        }
      } catch {}
      setLoc({ zip: 'GLOBAL', city: 'your area', country: 'US', lat: 0, lng: 0 })
      setLoading(false)
    }
    
    // Delay initialization to prevent conflicts with middleware redirects
    const timeoutId = setTimeout(init, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  // Don't render children until mounted to prevent flash
  if (!mounted) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  }

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState as any, loading, radius, setRadius, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  try { return useContext(LocationContext) } catch {
    return { zip: 'GLOBAL', city: 'your area', country: 'US', lat: 0, lng: 0, setLoc: () => {}, loading: false, radius: 5, setRadius: () => {}, useMyLocation: () => {} } as CtxType
  }
}
