'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserLocation = {
  latitude: number | null
  longitude: number | null
  state_code: string | null
  country_code: string | null
  location_label: string | null
}

const EMPTY: UserLocation = {
  latitude: null,
  longitude: null,
  state_code: null,
  country_code: null,
  location_label: null,
}

// Reverse geocode via BigDataCloud (free, no key, CORS-friendly)
async function reverseGeocode(lat: number, lng: number): Promise<{
  state_code: string | null
  country_code: string | null
  label: string | null
}> {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    )
    if (!r.ok) return { state_code: null, country_code: null, label: null }
    const j: any = await r.json()
    const country = (j.countryCode || '').toUpperCase() || null
    // principalSubdivisionCode looks like "US-NY"
    const sub: string = j.principalSubdivisionCode || ''
    const state_code = sub.includes('-')? sub.split('-')[1] : (j.principalSubdivision || null)
    const city = j.city || j.locality || j.principalSubdivision || ''
    const label = [city, state_code, country].filter(Boolean).join(', ') || null
    return { state_code: state_code || null, country_code: country, label }
  } catch {
    return { state_code: null, country_code: null, label: null }
  }
}

export function useUserLocation(userId: string | undefined) {
  const [loc, setLoc] = useState<UserLocation>(EMPTY)
  const [ready, setReady] = useState(false)
  const [prompting, setPrompting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved profile location
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false
    ;(async () => {
      const { data } = await (supabase as any).rpc('get_my_private_profile')
      if (cancelled) return
      const row = (Array.isArray(data)? data[0] : data)?? {}
      setLoc({
        latitude: row.latitude?? null,
        longitude: row.longitude?? null,
        state_code: row.state_code?? null,
        country_code: row.country_code?? null,
        location_label: row.location_label?? null,
      })
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const saveLocation = useCallback(
    async (next: UserLocation) => {
      setLoc(next)
      if (!userId) return
      const supabase = createClient()
      await supabase
     .from('profiles')
     .update({
          latitude: next.latitude,
          longitude: next.longitude,
          state_code: next.state_code,
          country_code: next.country_code,
          location_label: next.location_label,
        })
     .eq('user_id', userId)
    },
    [userId],
  )

  const requestGeolocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError("Your browser doesn't support location.")
      return
    }
    setError(null)
    setPrompting(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }),
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const geo = await reverseGeocode(lat, lng)
      await saveLocation({
        latitude: lat,
        longitude: lng,
        state_code: geo.state_code,
        country_code: geo.country_code,
        location_label: geo.label,
      })
    } catch (e: any) {
      setError(e?.message || "Couldn't get your location.")
    } finally {
      setPrompting(false)
    }
  }, [saveLocation])

  return { loc, ready, prompting, error, requestGeolocation, saveLocation }
}

// Haversine distance in miles
export function milesBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.7613 // Earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
