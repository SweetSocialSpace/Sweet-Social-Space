'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll port these files later from Lovable
// import { listVerifiedUpdates, type VerifiedUpdateWithSource } from '@/lib/verified.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { AutomatedBadge } from '@/components/AutomatedBadge'

// Stub types until we port the real files
type VerifiedUpdateWithSource = {
  id: string
  title: string
  location_label: string | null
  city: string | null
  state_code: string | null
  is_automated: boolean
  source?: {
    name: string
    slug: string | null
    logo_emoji: string | null
  } | null
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return {
    filter: { scope: 'nationwide' as const, lat: null, lng: null, state_code: null },
    location_label: 'San Jose, CA',
    scope: 'nationwide' as const
  }
}

// Stub badge component
function AutomatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
      🤖 AUTO
    </span>
  )
}

export default function VerifiedSources({ compact = false }: { compact?: boolean }) {
  const supabase = createClient()
  const { filter, location_label, scope } = useLocationScope()
  const [updates, setUpdates] = useState<VerifiedUpdateWithSource[] | null>(null)

  useEffect(() => {
    let cancelled = false
    setUpdates(null)

    const load = async () => {
      try {
        // TODO: Replace with listVerifiedUpdates when we port it
        const { data, error } = await supabase
          .from('verified_updates')
          .select(`
            *,
            source:verified_sources(name, slug, logo_emoji)
          `)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        if (cancelled) return
        setUpdates(data as VerifiedUpdateWithSource[])
      } catch {
        if (!cancelled) setUpdates([])
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code, supabase])

  const loading = updates === null
  const empty = !loading && updates.length === 0

  return (
    <section className={compact ? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]'}>
      <div className={compact ? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h3 className={compact ? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>
            ✅ Verified community sources
          </h3>
          <p className={compact ? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>
            Updates from local government, police, fire, schools, and newspapers near{' '}
            <span className="text-foreground">{location_label ?? 'your area'}</span>.
          </p>
        </div>
      </div>

      {!empty && (
        <ul className={compact ? 'mt-3 grid gap-2' : 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
          {(updates ?? Array.from({ length: 6 })).map((u, i) => {
            if (!u) {
              return <li key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-background/60" aria-hidden />
            }
            const item = u as VerifiedUpdateWithSource
            return (
              <li key={item.id}>
                <div className="block h-full rounded-2xl border border-border bg-background/60 p-4 transition hover:bg-secondary">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span aria-hidden>{item.source?.logo_emoji ?? '✅'}</span>
                    {item.source?.slug ? (
                      <Link
                        href={`/verified/source/${item.source.slug}`}
                        className="line-clamp-1 hover:underline"
                      >
                        {item.source?.name ?? 'Verified'}
                      </Link>
                    ) : (
                      <span className="line-clamp-1">{item.source?.name ?? 'Verified'}</span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      ✓ Verified
                    </span>
                  </div>
                  {item.is_automated && <div className="mt-1"><AutomatedBadge /></div>}
                  <Link
                    href={`/verified/${item.id}`}
                    className="mt-2 block"
                  >
                    <p className="line-clamp-2 text-sm text-foreground">{item.title}</p>
                    {(item.location_label || item.city) && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        📍 {item.location_label ?? `${item.city}${item.state_code ? ', ' + item.state_code : ''}`}
                      </p>
                    )}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {empty && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center">
          <p className="font-semibold">
            No verified organizations in your area yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {scope === 'nationwide' ? (
              'Local sources will appear here as soon as they\'re verified.'
            ) : (
              'Try expanding your radius to statewide or nationwide, or invite a local organization to apply for verification.'
            )}
          </p>
          <Link
            href="/apply-verification"
            className="mt-4 inline-flex items-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
          >
            Apply for verification
          </Link>
        </div>
      )}

      {!empty && (
        <p className="mt-4 text-xs text-muted-foreground">
          Local agency or organization?{' '}
          <Link href="/apply-verification" className="font-semibold text-primary hover:underline">
            Apply for a verified badge
          </Link>
        </p>
      )}
    </section>
  )
}
