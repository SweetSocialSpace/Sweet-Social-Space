'use client'
import { createClient } from '@/lib/supabase/client'

export async function getBlockTruth(): Promise<{zip:string,city:string,lat:number,lng:number}> {
  const safe = { zip: '', city: '', lat: 0, lng: 0 }
  
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      try {
        const { data: p1 } = await supabase.from('profiles').select('zip_code,city').eq('user_id', user.id).maybeSingle()
        let p = p1
        if (!p?.zip_code) {
          const { data: p2 } = await supabase.from('profiles').select('zip_code,city').eq('id', user.id).maybeSingle()
          p = p2 as any
        }
        if ((p as any)?.zip_code) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('user_zip', (p as any).zip_code)
              localStorage.setItem('user_city', (p as any).city || '')
              localStorage.setItem('user_id_for_zip', user.id)
            } catch {}
          }
          return { zip: (p as any).zip_code, city: (p as any).city || '', lat: 0, lng: 0 }
        }
      } catch {}
    }
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      const z = localStorage.getItem('user_zip')
      if (z) {
        const city = localStorage.getItem('user_city') || ''
        return { zip: z, city, lat: 0, lng: 0 }
      }
    }
  } catch {}

  try {
    const r = await fetch('/api/geocode', { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      const g = d?.zip || d?.postcode || d?.postal_code
      if (g) return { zip: String(g).trim(), city: d.city || d.town || '', lat: Number(d.lat) || 0, lng: Number(d.lng) || d.lon || 0 }
    }
  } catch {}
  
  return safe
}
