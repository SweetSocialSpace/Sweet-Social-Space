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
  zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0, 
  setLoc: () => {}, loading: true, radius: 5, 
  setRadius: ()=>{}, useMyLocation: ()=>{}
})

function cleanCity(rawCity: string, zip: string, country: string) {
  if (!rawCity) return ''
  const low = rawCity.toLowerCase()
  // FIX: US zip 95122 collides with ID 95122 Manado - if US zip + Manado, force San Jose
  if (zip === '95122' && (low.includes('manado') || low.includes('sulawesi'))) {
    return 'San Jose, CA'
  }
  // Global: shorten Indonesia spam - "Manado, North Sulawesi, Indonesia" -> "Manado"
  if (low.includes('sulawesi')) {
    return 'Manado'
  }
  return rawCity
}

async function resolveCity(zip: string, fallbackCity: string, fallbackCountry: string) {
  if (!zip || zip === 'GLOBAL') return { city: fallbackCity, country: fallbackCountry, lat: 0, lng: 0 }
  try {
    const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zip)}`)
    if (res.ok) {
      const data = await res.json()
      return { city: data.city || fallbackCity, country: data.country || fallbackCountry, lat: Number(data.lat)||0, lng: Number(data.lon)||0 }
    }
  } catch {}
  return { city: fallbackCity, country: fallbackCountry, lat: 0, lng: 0 }
}

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)
  
  let supabase: any
  try { supabase = createClient() } catch { supabase = null }

  const setLocState = async (l: Loc) => {
    if (!l?.zip) return
    // GLOBAL allowed now - house is global
    const cleaned = cleanCity(l.city, l.zip, l.country)
    const resolved = await resolveCity(l.zip, cleaned, l.country)
    const final = { zip: l.zip, city: cleanCity(resolved.city, l.zip, resolved.country) || cleaned, country: resolved.country || l.country, lat: resolved.lat || l.lat, lng: resolved.lng || l.lng }
    setLoc(final)
    if (l.zip !== 'GLOBAL') localStorage.setItem('feed_near_zip', l.zip)
  }

  const useMyLocation = async () => {
    setLoading(true)
    try {
      const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
      if (ip?.postal) {
        const cleaned = cleanCity(ip.city || '', ip.postal, ip.country || 'US')
        const resolved = await resolveCity(ip.postal, cleaned, ip.country || 'US')
        setLoc({ 
          zip: ip.postal, 
          city: cleanCity(resolved.city, ip.postal, resolved.country) || cleaned, 
          country: resolved.country || ip.country || 'US', 
          lat: resolved.lat || ip.latitude || 0, 
          lng: resolved.lng || ip.longitude || 0 
        })
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      // 1. Profile zip - what they typed at signup - THIS WINS
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle()
            const finalZip = profile?.zip_code || profile?.zip
            if (finalZip && finalZip.trim() !== '' && finalZip !== 'GLOBAL') {
              const cleaned = cleanCity(profile?.city || '', finalZip, profile?.country || 'US')
              const resolved = await resolveCity(finalZip, cleaned, profile?.country || 'US')
              setLoc({ 
                zip: finalZip, 
                city: cleanCity(resolved.city, finalZip, resolved.country) || cleaned, 
                country: resolved.country || profile?.country || 'US', 
                lat: resolved.lat, 
                lng: resolved.lng 
              })
              setLoading(false)
              return
            }
          }
        } catch {}
      }

      // 2. localStorage - last block they visited - global
      try {
        const saved = localStorage.getItem('feed_near_zip')
        if (saved && saved !== 'GLOBAL') {
          const resolved = await resolveCity(saved, '', 'US')
          setLoc({ zip: saved, city: cleanCity(resolved.city, saved, resolved.country), country: resolved.country, lat: resolved.lat, lng: resolved.lng })
          setLoading(false)
          return
        }
      } catch {}

      // 3. IP - works anywhere in world - GLOBAL
      try {
        const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
        if (ip?.postal) {
          const cleaned = cleanCity(ip.city || '', ip.postal, ip.country || 'US')
          const resolved = await resolveCity(ip.postal, cleaned, ip.country || 'US')
          setLoc({ 
            zip: ip.postal, 
            city: cleanCity(resolved.city, ip.postal, resolved.country) || cleaned, 
            country: resolved.country || ip.country || 'US', 
            lat: resolved.lat || ip.latitude || 0, 
            lng: resolved.lng || ip.longitude || 0 
          })
          setLoading(false)
          return
        }
      } catch {}

      // 4. Failsafe GLOBAL
      setLoc({ zip: '95122', city: 'San Jose, CA', country: 'US', lat: 37.3387, lng: -121.8853 })
      setLoading(false)
    }
    init()
  }, [])

  return (
    <LocationContext.Provider value={{ ...loc, setLoc: setLocState as any, loading, radius, setRadius, useMyLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  try { return useContext(LocationContext) } catch {
    return { zip: 'GLOBAL', city: '', country: 'US', lat: 0, lng: 0, setLoc: () => {}, loading: false, radius: 5, setRadius: () => {}, useMyLocation: () => {} } as CtxType
  }
}
