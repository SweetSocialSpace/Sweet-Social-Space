'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'

type RecommendationCategoryCount = { category: string; count: number }

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

export default function RecommendationCategories({ compact = false }: { compact?: boolean }) {
  const { zip } = useLocation()
  const [cats, setCats] = useState<RecommendationCategoryCount[] | null>(null)

  useEffect(() => {
    if (!zip) return
    let cancelled = false
    setCats(null)
    const load = async () => {
      try {
        const supabase = createClient() as any
        // GLOBAL FIX: filter by real zip - per-block recs
        const { data, error } = await supabase.from('recommendations').select('category').eq('status', 'active').eq('zip_code', zip).limit(100)
        if (error) throw error
        if (cancelled) return
        const counts: Record<string, number> = {}
        data?.forEach((r:any) => { counts[r.category] = (counts[r.category] || 0) + 1 })
        const rows = Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 4)
        if (!cancelled) setCats(rows)
      } catch { if (!cancelled) try { setCats([]) } catch {} }
    }
    load()
    return () => { cancelled = true }
  }, [zip])

  return (
    <section className={compact? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]'}>
      <div className={compact? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h3 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>⭐ Local recommendations</h3>
          <p className={compact? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>Ask neighbors who they trust — plumber, pizza, mechanic, daycare. Real answers from real people on your block {zip? `• ${zip}`:''}.</p>
        </div>
        <Link href="/recommendations" className="text-sm font-medium text-primary hover:underline">Browse recommendations →</Link>
      </div>
      <ul className={compact? 'mt-3 grid gap-2' : 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        {(cats?? Array.from({ length: 4 })).map((c:any, i:number) => {
          if (!c) return <li key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-background/60" aria-hidden />
          const meta = CATEGORY_LABELS[c.category]?? { emoji: '⭐', label: c.category }
          return (
            <li key={c.category}>
              <Link href={`/recommendations/${c.category}`} className="block h-full rounded-2xl border border-border bg-background/60 p-4 transition hover:bg-secondary">
                <div className="text-2xl">{meta.emoji}</div>
                <div className="mt-2 text-sm font-semibold">{meta.label}</div>
                <div className="text-xs text-muted-foreground">{c.count} {c.count === 1? 'neighbor recommends' : 'neighbors recommend'}</div>
              </Link>
            </li>
          )
        })}
        {cats && cats.length === 0 && (<li className="col-span-full text-center text-xs text-muted-foreground py-6">No recommendations in {zip||'this area'} yet.</li>)}
      </ul>
    </section>
  )
}
