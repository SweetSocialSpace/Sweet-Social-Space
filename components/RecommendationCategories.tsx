'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import { applyScope, bboxForRadius } from '@/lib/location-scope'
import { useTranslations } from '@/lib/translations'

type RecommendationCategoryCount = { category: string; count: number }

export default function RecommendationCategories({ compact = false }: { compact?: boolean }) {
  const { zip } = useLocation()
  const { filter } = useLocationScope()
  const t = useTranslations() as any
  const [cats, setCats] = useState<RecommendationCategoryCount[] | null>(null)

  const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
    plumbers: { emoji: '🔧', label: t?.recommendations?.bestPlumber },
    restaurants: { emoji: '🍕', label: t?.recommendations?.bestRestaurants },
    mechanics: { emoji: '🚗', label: t?.recommendations?.bestMechanic },
    daycares: { emoji: '👶', label: t?.recommendations?.bestDaycare },
    'home-services': { emoji: '🛠', label: t?.recommendations?.homeServices },
    'vets-pet-care': { emoji: '🐾', label: t?.recommendations?.vetsPetCare },
    tutors: { emoji: '📚', label: t?.recommendations?.tutors },
    'hair-barber': { emoji: '💇', label: t?.recommendations?.hairBarber },
  }

  useEffect(() => {
    if (!zip) return
    let cancelled = false
    setCats(null)
    const load = async () => {
      try {
        const supabase = createClient() as any
        let data: any[] = []

        if (filter.lat!= null && filter.lng!= null) {
          const radiusMiles = { '5mi': 5, '10mi': 10, '15mi': 15, '20mi': 20 }[filter.scope] || 10
          const bbox = bboxForRadius(filter.lat, filter.lng, radiusMiles)

          const { data: recData } = await supabase
            .from('recommendations')
            .select('category,latitude,longitude')
            .eq('status', 'active')
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .limit(100)

          if (recData) {
            data = applyScope(recData, filter)
          }
        } else {
          const { data: recData, error } = await supabase.from('recommendations').select('category').eq('status', 'active').eq('zip_code', zip).limit(100)
          if (error) throw error
          data = recData || []
        }

        if (cancelled) return
        const counts: Record<string, number> = {}
        data?.forEach((r:any) => { counts[r.category] = (counts[r.category] || 0) + 1 })
        const rows = Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 4)
        if (!cancelled) setCats(rows)
      } catch { if (!cancelled) try { setCats([]) } catch {} }
    }
    load()
    return () => { cancelled = true }
  }, [zip, filter])

  return (
    <section className={compact? 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]' : 'mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]'}>
      <div className={compact? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h3 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>⭐ {t?.recommendations?.localRecommendations}</h3>
          <p className={compact? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>{t?.recommendations?.desc} {zip? `• ${zip}`:''}.</p>
        </div>
        <Link href="/recommendations" className="text-sm font-medium text-primary hover:underline">{t?.recommendations?.browse} →</Link>
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
                <div className="text-xs text-muted-foreground">{c.count} {c.count=== 1? t?.recommendations?.neighborRecommends : t?.recommendations?.neighborsRecommend}</div>
              </Link>
            </li>
          )
        })}
        {cats && cats.length=== 0 && (<li className="col-span-full text-center text-xs text-muted-foreground py-6">{t?.recommendations?.noRecommendationsIn} {zip|| t?.common?.thisArea} {t?.recommendations?.yet}.</li>)}
      </ul>
    </section>
  )
}
