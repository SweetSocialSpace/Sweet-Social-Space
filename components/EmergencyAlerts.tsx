'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

// TODO: Replace with Next.js Server Action later
// Stub for now so it compiles
async function fetchEmergencyAlerts({ lat, lng }: { lat: number; lng: number }) {
  // We'll create app/api/emergency/route.ts later
  return { alerts: [] as EmergencyAlertDTO[] }
}

type EmergencyAlertDTO = {
  id: string
  event: string
  description: string
  sender_name: string
}

type Status = "idle" | "locating" | "loading" | "ready" | "denied" | "unsupported" | "error"

export function EmergencyAlerts({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle")
  const [alerts, setAlerts] = useState<EmergencyAlertDTO[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported")
      return
    }
    setStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        setStatus("loading")
        fetchEmergencyAlerts({ lat, lng })
          .then((r) => {
            setAlerts(r.alerts)
            setStatus("ready")
          })
          .catch(() => setStatus("error"))
      },
      () => setStatus("denied"),
      { maximumAge: 5 * 60 * 1000, timeout: 10_000 },
    )
  }, [])

  return (
    <section aria-label="Emergency alerts" className={compact ? "" : "mt-16"}>
      <div className={compact ? "mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2" : "mb-4 flex items-baseline justify-between"}>
        <h2 className={compact ? "font-display text-sm font-semibold leading-tight" : "font-display text-2xl font-semibold"}>Emergency alerts</h2>
        <span className="text-xs text-muted-foreground">Live · within 110 mi</span>
      </div>

      {(status === "locating" || status === "loading") && (
        <ul className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"} aria-hidden>
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </ul>
      )}

      {status === "denied" && (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          Enable location to see emergency alerts near you.
        </p>
      )}

      {status === "unsupported" && (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          Your browser doesn't support location.
        </p>
      )}

      {status === "error" && (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          Couldn't load alerts. We'll retry shortly.
        </p>
      )}

      {status === "ready" && alerts.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          All clear — no active emergency alerts in your area.
        </p>
      )}

      {status === "ready" && alerts.length > 0 && coords && (
        <ul className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
          {alerts.map((a) => (
            <li key={a.id}>
              <Link
                href={`/emergency/${a.id}?lat=${coords.lat}&lng=${coords.lng}`}
                className="block rounded-xl border border-destructive/40 bg-card p-4 shadow-sm transition hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-destructive px-2 py-0.5 text- font-medium uppercase tracking-wide text-destructive-foreground">
                    Emergency
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{a.sender_name}</span>
                </div>
                <h3 className="mt-2 line-clamp-1 font-semibold">{a.event}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
