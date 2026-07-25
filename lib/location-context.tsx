'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Loc = { zip: string; city: string; country: string; lat: number; lng: number }
type CtxType = Loc & { setLoc: (l: Loc) => void; loading: boolean; radius: number; setRadius: (n:number)=>void; useMyLocation: () => void; }

const LocationContext = createContext<CtxType>({
  zip: '', city: '', country: '', lat: 0, lng: 0, setLoc: () => {}, loading: true, radius: 5, setRadius: ()=>{}, useMyLocation: ()=>{}
})

export function LocationProvider({ children }: any) {
  const [loc, setLoc] = useState<Loc>({ zip: '', city: '', country: '', lat: 0, lng: 0 })
  const [radius, setRadius] = useState(5)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const setLocState = (l: Loc) => {
    if (!l.zip) return
    setLoc(l)
    localStorage.setItem('user_zip', l.zip)
    localStorage.setItem('user_city', l.city || '')
    localStorage.setItem('user_country', l.country || '')
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').update({ zip_code: l.zip, zip: l.zip, city: l.city, country: l.country })
        .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`).then(()=>{})
    })
  }

  const useMyLocation = async () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const r = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
        const d = await r.json()
        if (d.zip) setLocState({ zip: d.zip, city: d.city || '', country: d.country || '', lat: latitude, lng: longitude })
      } catch {}
      setLoading(false)
    }, () => setLoading(false))
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('zip_code, zip, city, country').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle()
        const finalZip = profile?.zip_code || profile?.zip
        if (finalZip) {
          setLoc({ zip: finalZip, city: profile?.city||'', country: profile?.country||'', lat: 0, lng: 0 })
          setLoading(false); return
        }
      }
      const saved = localStorage.getItem('user_zip')
      if (saved) setLoc({ zip: saved, city: localStorage.getItem('user_city')||'', country: localStorage.getItem('user_country')||'', lat: 0, lng: 0 })
      setLoading(false)
    }
    init()
  }, [])

  return <LocationContext.Provider value={{ ...loc, setLoc: setLocState, loading, radius, setRadius, useMyLocation }}>{children}</LocationContext.Provider>
}
export const useLocation = () => useContext(LocationContext)
