'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll port these files later from Lovable
// import { listCommunityUpdates, type CommunityUpdateDTO } from '@/lib/community-updates.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { AutomatedBadge } from '@/components/AutomatedBadge'

// Stub types until we port the real files
type CommunityUpdateDTO = {
  id: string
  title: string
  description: string
  category: string
  city: string | null
  state: string | null
  is_automated: boolean
  created_at: string
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

export default function WhatsHappeningNearYou({ compact = false }: { compact?: boolean }) {
  const supabase = createClient()
  const { filter } = useLocationScope()
  const [items, setItems] = useState<CommunityUpdateDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setItems(null)

    const load = async () => {
      try {
        // TODO: Replace with listCommunityUpdates when we port it
        const { data, error } = await supabase
          .from('community_updates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        if (cancelled) return
        setItems(data as CommunityUpdateDTO[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load updates')
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code])

  if (error) return null
  if (items && items.length === 0) return null

  return (
    <section aria-label="What's happening near you" className={compact ? '' : 'mt-16'}>
      <div className={compact ? 'mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2' : 'mb-4 flex items-baseline justify-between'}>
        <h2 className={compact ? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-semibold'}>
          What's happening near you
        </h2>
        <span className="text-xs text-muted-foreground">Tap a card for details</span>
      </div>
      <ul className={compact ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        {(items ?? Array.from({ length: 6 })).map((row, i) => {
          if (!row) {
            return (
              <li
                key={i}
                className="h-32 animate-pulse rounded-xl border border-border bg-card"
                aria-hidden
              />
            )
          }
          const u = row as CommunityUpdateDTO
          const place = [u.city, u.state].filter(Boolean).join(', ')
          return (
            <li key={u.id}>
              <Link
                href={`/updates/${u.id}`}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                    {u.category}
                  </span>
                  {place && (
                    <span className="truncate text-xs text-muted-foreground">{place}</span>
                  )}
                  {u.is_automated && <AutomatedBadge className="ml-auto" />}
                </div>
                <h3 className="mt-2 line-clamp-2 font-semibold">{u.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{u.description}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
