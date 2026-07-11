'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll create these files later from Lovable
// import { listUpcomingEvents, type UpcomingEventDTO } from '@/lib/events.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { AutomatedBadge } from '@/components/AutomatedBadge'

// Stub types until we port the real files
type UpcomingEventDTO = {
  id: string
  title: string
  description: string | null
  starts_at: string | null
  venue_name: string | null
  city: string | null
  organizer: string | null
  is_automated: boolean
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return { filter: { scope: 'nationwide' as const, lat: null, lng: null, state_code: null } }
}

// Stub badge component
function AutomatedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground ${className}`}>
      🤖 AUTO
    </span>
  )
}

function formatWhen(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: 'TBA', time: '' }
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function UpcomingEvents({ compact = false }: { compact?: boolean }) {
  const supabase = createClient()
  const { filter } = useLocationScope()
  const [events, setEvents] = useState<UpcomingEventDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setEvents(null)
    
    const load = async () => {
      try {
        // TODO: Replace with listUpcomingEvents when we port it
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(6)

        if (error) throw error
        if (cancelled) return
        setEvents(data as UpcomingEventDTO[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load events')
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code])

  if (error) return null
  if (events && events.length === 0) return null

  return (
    <section aria-label="Upcoming events" className={compact ? '' : 'mt-16'}>
      <div className={compact ? 'mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2' : 'mb-4 flex items-baseline justify-between'}>
        <h2 className={compact ? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-semibold'}>
          Upcoming events
        </h2>
        <Link href="/news-events" className="text-xs text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>
      <ul className={compact ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        {(events ?? Array.from({ length: 6 })).map((row, i) => {
          if (!row) {
            return (
              <li
                key={i}
                className="h-36 animate-pulse rounded-xl border border-border bg-card"
                aria-hidden
              />
            )
          }
          const e = row as UpcomingEventDTO
          const when = formatWhen(e.starts_at)
          const place = [e.venue_name, e.city].filter(Boolean).join(' · ')
          return (
            <li key={e.id}>
              <Link
                href={`/news-events/${e.id}`}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition hover:bg-secondary"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium uppercase tracking-wide text-primary">
                    {when.date}
                  </span>
                  {when.time && <span className="text-muted-foreground">{when.time}</span>}
                  {e.is_automated && <AutomatedBadge className="ml-auto" />}
                </div>
                <h3 className="mt-2 line-clamp-2 font-semibold">{e.title}</h3>
                {place && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{place}</p>
                )}
                {e.organizer && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    by {e.organizer}
                  </p>
                )}
                {e.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {e.description}
                  </p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
