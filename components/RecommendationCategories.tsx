'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// TODO: We'll port these files later from Lovable
// import { useLocationScope } from '@/hooks/useLocationScope'
// import { listRecommendationCategoryCounts, type RecommendationCategoryCount } from '@/lib/recommendations.functions'

// Stub types until we port the real files
type RecommendationCategoryCount = {
  category: string
  count: number
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return { filter: { scope: 'nationwide' as const, lat: null, lng: null, state_code: null } }
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  plumbers: { emoji: '🔧', label: 'Best plumber' },
  restaurants: { emoji: '🍕', label: 'Best restaurants' },
  mechanics: { emoji: '🚗', label: 'Best mechanic' },
  daycares: { emoji: '👶', label: 'Best daycare' },
  'home-services': { emoji: '🛠', label: 'Home services' },
  'vets-pet-care': { emoji: '🐾', label: 'Vets & pet care' },
  tutors: { emoji: '📚', label: 'Tutors' },
  'hair-barber': { emoji: '💇', label: 'Hair & barber' },
}

export function RecommendationCategories({ compact = false }: { compact?: boolean }) {
  const { filter } = useLocationScope()
  const [cats, setCats] = useState<RecommendationCategoryCount[] | null>(null)

  useEffect(() => {
    let cancelled = false
    setCats(null)

    const load = async () => {
      try {
        // TODO: Replace with listRecommendationCategoryCounts when we port it
        // For now, aggregate from recommendations table
        const { data, error } = await supabase
        .from('recommendations')
        .select('category')
        .eq('status', 'active')

        if (error) throw error
        if (cancelled) return

        // Count by category client-side until we have a proper RPC
        const counts: Record<string, number> = {}
        data?.forEach((r) => {
          counts[r.category] = (counts[r.category] || 0) + 1
        })
        
        const rows = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)

        setCats(rows)
      } catch {
        if (!cancelled) setCats([])
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code])

  return (
    <section className={compact? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]'}>
      <div className={compact? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h3 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>
            ⭐ Local recommendations
          </h3>
          <p className={compact? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>
            Ask neighbors who they trust — plumber, pizza, mechanic, daycare. Real answers from real people on your block.
          </p>
        </div>
        <Link href="/recommendations" className="text-sm font-medium text-primary hover:underline">
          Browse recommendations →
        </Link>
      </div>
      <ul className={compact? 'mt-3 grid gap-2' : 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        {(cats?? Array.from({ length: 4 })).map((c, i) => {
          if (!c) return <li key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-background/60" aria-hidden />
          const meta = CATEGORY_LABELS[c.category]?? { emoji: '⭐', label: c.category }
          return (
            <li key={c.category}>
              <Link
                href={`/recommendations/${c.category}`}
                className="block h-full rounded-2xl border border-border bg-background/60 p-4 transition hover:bg-secondary"
              >
                <div className="text-2xl">{meta.emoji}</div>
                <div className="mt-2 text-sm font-semibold">{meta.label}</div>
                <div className="text-xs text-muted-foreground">
                  {c.count} {c.count === 1? 'neighbor recommends' : 'neighbors recommend'}
                </div>
              </Link>
            </li>
          )
        })}
        {cats && cats.length === 0 && (
          <li className="col-span-full text-center text-xs text-muted-foreground py-6">
            No recommendations in this area yet.
          </li>
        )}
      </ul>
    </section>
  )
}
