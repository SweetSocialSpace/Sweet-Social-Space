'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { LocationFilter, ScopeKind } from '@/lib/location-scope'

const STORAGE_KEY = 'sss.location-scope.v1'
type Stored = {
  scope: ScopeKind
  latitude: number | null
  longitude: number | null
  state_code: string | null
  country_code: string | null
  location_label: string | null
}
const DEFAULT: Stored = {
  scope: 'state',
  latitude: null, longitude: null,
  state_code: null, country_code: null,
  location_label: null,
}

function loadFromStorage(): Stored {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    return {...DEFAULT,...JSON.parse(raw) }
  } catch { return DEFAULT }
}
function saveToStorage(s: Stored) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
    if (!r.ok) return { state_code: null as string | null, country_code: null as string | null, label: null as string | null }
    const j: any = await r.json()
    const country = (j.countryCode || '').toUpperCase() || null
    const sub: string = j.principalSubdivisionCode || ''
    const state_code = sub.includes('-')? sub.split('-')[1] : (j.principalSubdivision || null)
    const city = j.city || j.locality || j.principalSubdivision || ''
    const label = [city, state_code, country].filter(Boolean).join(', ') || null
    return { state_code: state_code || null, country_code: country, label }
  } catch { return { state_code: null, country_code: null, label: null } }
}

export function useLocationScope() {
  const { user } = useAuth()
  const [state, setState] = useState<Stored>(() => loadFromStorage())
  const [ready, setReady] = useState(false)
  const [prompting, setPrompting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { try { setReady(true) } catch {}; return }
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data } = await (supabase as any).rpc('get_my_private_profile')
        if (cancelled) return
        const row = (Array.isArray(data)? data[0] : data)?? {}
        setState((prev) => {
          try {
            const merged: Stored = {
             ...prev,
              latitude: row.latitude?? prev.latitude,
              longitude: row.longitude?? prev.longitude,
              state_code: row.state_code?? prev.state_code,
              country_code: row.country_code?? prev.country_code,
              location_label: row.location_label?? prev.location_label,
            }
            saveToStorage(merged)
            return merged
          } catch { return prev }
        })
      } catch {} finally { if (!cancelled) try { setReady(true) } catch {} }
    })()
    return () => { cancelled = true }
  }, [user])

  const setScope = useCallback((scope: ScopeKind) => {
    try { setState((prev) => { const next = {...prev, scope }; saveToStorage(next); return next }) } catch {}
  }, [])

  const setManualLocation = useCallback(async (loc: { latitude: number | null; longitude: number | null; state_code: string | null; country_code: string | null; location_label: string | null }) => {
    try {
      setState((prev) => { const next = {...prev,...loc }; saveToStorage(next); return next })
      if (user) {
        try {
          const supabase = createClient()
          await (supabase as any).from('profiles').update({
            latitude: loc.latitude, longitude: loc.longitude,
            state_code: loc.state_code, country_code: loc.country_code, location_label: loc.location_label,
          }).eq('user_id', user.id)
        } catch {}
      }
    } catch {}
  }, [user])

  const requestGeolocation = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || typeof navigator === 'undefined' ||!navigator.geolocation) {
        try { setError("Your browser doesn't support location.") } catch {}; return
      }
      try { setError(null); setPrompting(true) } catch {}
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }),
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const geo = await reverseGeocode(lat, lng)
      await setManualLocation({ latitude: lat, longitude: lng, state_code: geo.state_code, country_code: geo.country_code, location_label: geo.label })
    } catch (e: any) { try { setError(e?.message || "Couldn't get your location.") } catch {} } finally { try { setPrompting(false) } catch {} }
  }, [setManualLocation])

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      if (state.latitude!= null && state.longitude!= null) return
      const askedKey = 'sss.geo-auto-asked.v1'
      let already = null
      try { already = window.localStorage.getItem(askedKey) } catch {}
      if (already) return
      try { window.localStorage.setItem(askedKey, '1') } catch {}
      try {
        setState((prev) => {
          try {
            const next = {...prev, scope: '20mi' as ScopeKind }
            saveToStorage(next)
            return next
          } catch { return prev }
        })
      } catch {}
      requestGeolocation()
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filter: LocationFilter = {
    scope: state.scope, lat: state.latitude, lng: state.longitude,
    state_code: state.state_code, country_code: state.country_code,
  }

  return {
    filter, scope: state.scope, location_label: state.location_label,
    hasCoords: state.latitude!= null && state.longitude!= null,
    hasState:!!state.state_code,
    ready, prompting, error, setScope, setManualLocation, requestGeolocation,
  }
}
