'use client'
import { createClient } from '@/lib/supabase/client'

export async function getBlockTruth(): Promise<{zip:string,city:string,lat:number,lng:number}> {
  // 1. PROFILE FIRST — truth — global — forced at signup — NOT localStorage
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
      if (p?.zip_code) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_zip', p.zip_code)
          localStorage.setItem('user_city', p.city || '')
          localStorage.setItem('user_id_for_zip', user.id)
        }
        return { zip: p.zip_code, city: p.city || '', lat: 0, lng: 0 }
      }
    }
  } catch {}

  // 2. localStorage only if same user — prevents 95122 bleeding into 12828
  if (typeof window !== 'undefined') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const savedId = localStorage.getItem('user_id_for_zip')
    if (!user || savedId === user.id) {
      const z = localStorage.getItem('user_zip')
      if (z) return { zip: z, city: localStorage.getItem('user_city') || '', lat: 0, lng: 0 }
    }
  }

  // 3. IP global fallback
  try {
    const r = await fetch('/api/geocode', { cache: 'no-store' })
    const d = await r.json()
    const g = d?.zip || d?.postcode || d?.postal_code
    if (g) return { zip: g, city: d.city || '', lat: d.lat || 0, lng: d.lng || 0 }
  } catch {}
  return { zip: '', city: '', lat: 0, lng: 0 }
}
