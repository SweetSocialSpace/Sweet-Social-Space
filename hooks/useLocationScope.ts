'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { LocationFilter, ScopeKind } from '@/lib/location-scope'
import { useLocation as useGlobalLoc } from '@/lib/location-context'

const STORAGE_KEY = 'sss.location-scope.v1'
type Stored = {
  scope: ScopeKind
  latitude: number | null
  longitude: number | null
  location_label: string | null
}
const DEFAULT: Stored = {
  scope: '5mi', // KISS - inviting - close - not state
  latitude: null, longitude: null,
  location_label: null,
}

function loadFromStorage(): Stored {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw)
    // KISS - migrate old 'state'/'nationwide' to 5mi
    if (parsed.scope === 'state' || parsed.scope === 'nationwide' || parsed.scope === '50mi') {
      parsed.scope = '5mi'
    }
    return {...DEFAULT,...parsed }
  } catch { return DEFAULT }
}
function saveToStorage(s: Stored) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
    if (!r.ok) return { label: null as string | null }
    const j: any = await r.json()
    const city = j.city || j.locality || j.principalSubdivision || ''
    const country = (j.countryCode || '').toUpperCase() || ''
    const label = [city, country].filter(Boolean).join(', ') || null
    return { label }
  } catch { return { label: null } }
}

export function useLocationScope() {
  const { user } = useAuth()
  const { zip } = useGlobalLoc() // use profile zip for label
  const [state, setState] = useState<Stored>(() => loadFromStorage())
  const [ready, setReady] = useState(false)
  const [prompting, setPrompting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setReady(true); return }
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data } = await (supabase as any).rpc('get_my_private_profile')
        if (cancelled) return
        const row = (Array.isArray(data)? data[0] : data)?? {}
        setState((prev) => {
          const merged: Stored = {
          ...prev,
            latitude: row.latitude?? prev.latitude,
            longitude: row.longitude?? prev.longitude,
            location_label: row.location_label?? prev.location_label,
          }
          saveToStorage(merged)
          return merged
        })
      } catch {} finally { if (!cancelled) setReady(true) }
    })()
    return () => { cancelled = true }
  }, [user])

  const setScope = useCallback((scope: ScopeKind) => {
    setState((prev) => { const next = {...prev, scope }; saveToStorage(next); return next })
  }, [])

  const setManualLocation = useCallback(async (loc: { latitude: number | null; longitude: number | null; location_label: string | null }) => {
    setState((prev) => { const next = {...prev,...loc }; saveToStorage(next); return next })
    if (user) {
      try {
        const supabase = createClient()
        await (supabase as any).from('profiles').update({
          latitude: loc.latitude, longitude: loc.longitude,
          location_label: loc.location_label,
        }).eq('user_id', user.id)
      } catch {}
    }
  }, [user])

  const requestGeolocation = useCallback(async () => {
    if (typeof window === 'undefined' ||!navigator.geolocation) {
      setError("Your browser doesn't support location.")
      return
    }
    setError(null); setPrompting(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }),
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const geo = await reverseGeocode(lat, lng)
      await setManualLocation({ latitude: lat, longitude: lng, location_label: geo.label || zip || null })
    } catch (e: any) {
      setError(e?.message || "Couldn't get your location.")
    } finally { setPrompting(false) }
  }, [setManualLocation, zip])

    useEffect(() => {
    // DISABLED - No automatic GPS detection per user request
    // Platform should only use zip codes, not automatic GPS detection
    console.log('Automatic GPS detection disabled - using zip codes only')
  }, [])

  const filter: LocationFilter = {
    scope: state.scope, lat: state.latitude, lng: state.longitude,
  }

  return {
    filter, scope: state.scope, location_label: state.location_label || zip,
    hasCoords: state.latitude!= null && state.longitude!= null,
    ready, prompting, error, setScope, setManualLocation, requestGeolocation,
  }
}
