'use server'

export type EmergencyAlertDTO = {
  id: string
  sender_name: string
  event: string
  start: number // unix seconds
  end: number
  description: string
  tags: string[]
}

type CacheEntry = { at: number; alerts: EmergencyAlertDTO[] }
const CACHE = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

function makeId(a: { sender_name: string; event: string; start: number }) {
  const raw = `${a.sender_name}|${a.event}|${a.start}`
  return Buffer.from(raw).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(1)},${lng.toFixed(1)}`
}

async function loadAlerts(lat: number, lng: number): Promise<EmergencyAlertDTO[]> {
  const key = cacheKey(lat, lng)
  const hit = CACHE.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.alerts

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    console.error("[emergency] OPENWEATHER_API_KEY missing")
    return []
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,daily,current&appid=${apiKey}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("[emergency] OpenWeather error", res.status, await res.text().catch(() => ""))
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
    return []
  }
}

function validateCoords(input: unknown): { lat: number; lng: number } {
  const o = input as { lat?: unknown; lng?: unknown }
  const lat = Number(o?.lat)
  const lng = Number(o?.lng)
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Invalid lat")
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Invalid lng")
  return { lat, lng }
}

export async function fetchEmergencyAlerts(input: { lat: number; lng: number }) {
  const data = validateCoords(input)
  const alerts = await loadAlerts(data.lat, data.lng)
  return { alerts }
}

export async function getEmergencyAlert(input: { lat: number; lng: number; alertId: string }) {
  const o = input as { lat?: unknown; lng?: unknown; alertId?: unknown }
  const { lat, lng } = validateCoords(o)
  const alertId = String(o?.alertId?? "")
  if (!alertId) throw new Error("Missing alertId")
  const alerts = await loadAlerts(lat, lng)
  const alert = alerts.find((a) => a.id === alertId)?? null
  return { alert }
}
