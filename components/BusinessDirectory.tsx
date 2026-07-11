'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// TODO: We'll port these files later from Lovable
// import { listBusinesses, type BusinessDirectoryDTO } from '@/lib/businesses.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'

// Stub types until we port the real files
type BusinessDirectoryDTO = {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  logo_url: string | null
  verified: boolean
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return { filter: { scope: 'nationwide' as const, lat: null, lng: null, state_code: null } }
}

export function BusinessDirectory({ compact = false }: { compact?: boolean }) {
  const { filter } = useLocationScope()
  const [items, setItems] = useState<BusinessDirectoryDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setItems(null)

    const load = async () => {
      try {
        // TODO: Replace with listBusinesses when we port it
        const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('verified', { ascending: false })
        .order('name', { ascending: true })
        .limit(6)

        if (error) throw error
        if (cancelled) return
        setItems(data as BusinessDirectoryDTO[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message?? 'Failed to load businesses')
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code])

  if (error) return null
  if (items && items.length === 0) return null

  return (
    <section aria-label="Business directory" className={compact? '' : 'mt-16'}>
      <div className={compact? 'mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2' : 'mb-4 flex items-baseline justify-between'}>
        <h2 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-semibold'}>
          Local business directory
        </h2>
        <Link href="/businesses" className="text-xs text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>
      <ul className={compact? 'grid gap-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        {(items?? Array.from({ length: 6 })).map((row, i) => {
          if (!row) {
            return (
              <li
                key={i}
                className="h-36 animate-pulse rounded-xl border border-border bg-card"
                aria-hidden
              />
            )
          }
          const b = row as BusinessDirectoryDTO
          return (
            <li key={b.id}>
              <Link
                href={`/business/${b.slug}`}
                className="flex h-full gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:bg-secondary"
              >
                {b.logo_url? (
                  <img
                    src={b.logo_url}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                    {b.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate font-semibold">{b.name}</h3>
                    {b.verified && (
                      <span className="text-primary" aria-label="Verified">
                        ✓
                      </span>
                    )}
                  </div>
                  {b.category && (
                    <p className="truncate text-xs text-muted-foreground">{b.category}</p>
                  )}
                  {b.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {b.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
