'use client'
import { createClient } from '@/lib/supabase/client'

export async function getBlockTruth(): Promise<{zip:string,city:string,lat:number,lng:number}> {
  // 1. localStorage instant
  if (typeof window !== 'undefined') {
    const z = localStorage.getItem('user_zip')
    if (z) return { zip: z, city: localStorage.getItem('user_city') || '', lat: 0, lng: 0 }
  }
  // 2. profile — global — forced at signup
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p1 } = await supabase.from('profiles').select('zip_code,city').eq('user_id', user.id).maybeSingle()
      let p = p1
      if (!p?.zip_code) {
        const { data: p2 } = await supabase.from('profiles').select('zip_code,city').eq('id', user.id).maybeSingle()
        p = p2
      }
      if (p?.zip_code) return { zip: p.zip_code, city: p.city || '', lat: 0, lng: 0 }
    }
  } catch {}
  // 3. IP global
  try {
    const r = await fetch('/api/geocode', { cache: 'no-store' })
    const d = await r.json()
    const g = d?.zip || d?.postcode || d?.postal_code
    if (g) return { zip: g, city: d.city || '', lat: d.lat || 0, lng: d.lng || 0 }
  } catch {}
  return { zip: '', city: '', lat: 0, lng: 0 }
}
