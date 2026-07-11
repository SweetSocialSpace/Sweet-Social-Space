'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll create these files later
// import { listAlerts, CATEGORY_LABELS, type AlertDTO } from '@/lib/alerts.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { AutomatedBadge } from '@/components/AutomatedBadge'

// Stub types until we port the real files
type AlertDTO = {
  id: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  category: string
  location_label: string | null
  created_at: string
  is_automated: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  weather: 'Weather',
  traffic: 'Traffic',
  crime: 'Crime',
  fire: 'Fire',
  health: 'Health',
  missing: 'Missing Person',
  other: 'Other'
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return { filter: { scope: 'nationwide' as const } }
}

// Stub badge component
function AutomatedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground ${className}`}>
      🤖 AUTO
    </span>
  )
}

const SEVERITY_STYLE: Record<string, string> = {
  info: 'bg-secondary text-secondary-foreground',
  warning: 'bg-accent text-accent-foreground',
  critical: 'bg-destructive text-destructive-foreground',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.max(1, Math.floor(diff / 1000))
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString()
}

export default function LatestAlerts({ compact = false }: { compact?: boolean }) {
  const supabase = createClient()
  const { filter } = useLocationScope()
  const [alerts, setAlerts] = useState<AlertDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false

    const reload = async () => {
      try {
        // TODO: Replace with real listAlerts when we port it
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        if (cancelled) return
        setAlerts(data as AlertDTO[])
        setCheckedAt(new Date())
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load alerts')
      }
    }

    setAlerts(null)
    reload()

    const channel = supabase
      .channel('latest-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => reload())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  if (error) return null

  const empty = alerts !== null && alerts.length === 0

  return (
    <section aria-label="Latest alerts" className={compact ? '' : 'mt-16'}>
      <div className={compact ? 'mb-2 flex min-w-0 items-baseline justify-between gap-2' : 'mb-4 flex items-baseline justify-between'}>
        <h2 className={compact ? 'truncate font-display text-sm font-semibold' : 'font-display text-2xl font-semibold'}>
          Latest alerts
        </h2>
        {!compact && <span className="text-xs text-muted-foreground">Tap an alert for details</span>}
      </div>

      {empty ? (
        <div className={`rounded-xl border border-border bg-card ${compact ? 'p-3' : 'p-4'}`}>
          <p className="text-sm font-medium">✅ All clear — no active alerts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Checked {checkedAt ? timeAgo(checkedAt.toISOString()) : 'just now'}
          </p>
        </div>
      ) : (
        <ul className={compact ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-2'}>
          {(alerts ?? Array.from({ length: 3 })).map((a, i) => {
            if (!a) {
              return <li key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" aria-hidden />
            }
            const alert = a as AlertDTO
            return (
              <li key={alert.id}>
                <Link
                  href={`/alerts/${alert.id}`}
                  className={`block rounded-xl border border-border bg-card shadow-sm transition hover:bg-secondary ${compact ? 'p-3' : 'p-4'}`}
                >
                  <div className={`flex min-w-0 items-center gap-1.5 ${compact ? 'flex-wrap' : ''}`}>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.info}`}>
                      {alert.severity}
                    </span>
                    {!compact && (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {CATEGORY_LABELS[alert.category] ?? alert.category}
                      </span>
                    )}
                    {alert.location_label && (
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{alert.location_label}</span>
                    )}
                    {alert.is_automated && <AutomatedBadge className="ml-auto shrink-0" />}
                  </div>
                  <h3 className={`mt-2 font-semibold leading-snug ${compact ? 'line-clamp-2 text-sm' : 'line-clamp-1'}`}>
                    {alert.title}
                  </h3>
                  {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{alert.body}</p>}
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    🕒 {timeAgo(alert.created_at)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
