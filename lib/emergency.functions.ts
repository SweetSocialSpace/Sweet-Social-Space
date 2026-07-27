'use server'

export type EmergencyAlertDTO = {
  id: string
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags: string[]
}

type CacheEntry = { at: number; alerts: EmergencyAlertDTO[] }
const CACHE = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

function makeId(a: { sender_name: string; event: string; start: number }) {
  try {
    const raw = `${a.sender_name}|${a.event}|${a.start}`
    return Buffer.from(raw).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  } catch { return `${Date.now()}-${Math.random()}` }
}

function cacheKey(lat: number, lng: number) {
  try { return `${lat.toFixed(1)},${lng.toFixed(1)}` } catch { return 'global' }
}

async function loadAlerts(lat: number, lng: number): Promise<EmergencyAlertDTO[]> {
  try {
    const key = cacheKey(lat, lng)
    const hit = CACHE.get(key)
    if (hit && Date.now() - hit.at < TTL_MS) return hit.alerts

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      console.error("[emergency] OPENWEATHER_API_KEY missing")
      return [] // House never dies - no key = no alerts, not crash
    }

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,daily,current&appid=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      console.error("[emergency] OpenWeather error", res.status)
      return []
    }
    const json: any = await res.json()
    const raw = Array.isArray(json?.alerts)? json.alerts : []
    const alerts: EmergencyAlertDTO[] = raw.map((a: any) => ({
      id: makeId({ sender_name: String(a.sender_name?? "Unknown"), event: String(a.event?? "Alert"), start: Number(a.start?? 0) }),
      sender_name: String(a.sender_name?? "Unknown"),
      event: String(a.event?? "Alert"),
      start: Number(a.start?? 0),
      end: Number(a.end?? 0),
      description: String(a.description?? ""),
      tags: Array.isArray(a.tags)? a.tags.map(String) : [],
    }))
    CACHE.set(key, { at: Date.now(), alerts })
    return alerts
  } catch (e) {
    console.error("[emergency] fetch failed", e)
    return [] // House never dies
  }
}

function validateCoordsSafe(input: unknown): { lat: number; lng: number } | null {
  try {
    const o = input as { lat?: unknown; lng?: unknown }
    const lat = Number(o?.lat)
    const lng = Number(o?.lng)
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null
    // Global - 0,0 is ocean, but valid coords, don't throw, return null to show no alerts
    if (lat === 0 && lng === 0) return null
    return { lat, lng }
  } catch { return null }
}

export async function fetchEmergencyAlerts(input: { lat: number; lng: number }) {
  try {
    const data = validateCoordsSafe(input)
    if (!data) return { alerts: [] } // Global safe - bad coords = no alerts, not crash
    const alerts = await loadAlerts(data.lat, data.lng)
    return { alerts }
  } catch {
    return { alerts: [] }
  }
}

export async function getEmergencyAlert(input: { lat: number; lng: number; alertId: string }) {
  try {
    const o = input as { lat?: unknown; lng?: unknown; alertId?: unknown }
    const coords = validateCoordsSafe(o)
    const alertId = String(o?.alertId?? "")
    if (!coords ||!alertId) return { alert: null }
    const alerts = await loadAlerts(coords.lat, coords.lng)
    const alert = alerts.find((a) => a.id === alertId)?? null
    return { alert }
  } catch {
    return { alert: null }
  }
}
