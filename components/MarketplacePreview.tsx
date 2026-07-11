'use client'
import { createClient } from '@/lib/supabase/client'

export default function BusinessDirectory() {
  const supabase = createClient()
  // ... rest of your code uses `supabase`
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// TODO: We'll port these files later from Lovable
// import { listMarketplace, formatPrice, CATEGORY_EMOJI, CATEGORY_LABELS, type MarketplaceListingDTO } from '@/lib/marketplace.functions'
// import { useLocationScope } from '@/hooks/useLocationScope'

// Stub types until we port the real files
type MarketplaceListingDTO = {
  id: string
  title: string
  price_cents: number
  currency: string
  category: string
  city: string | null
  state_code: string | null
  image_url: string | null
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

const CATEGORY_EMOJI: Record<string, string> = {
  furniture: '🛋️',
  tools: '🔨',
  cars: '🚗',
  electronics: '💻',
  clothing: '👕',
  'home-goods': '🏠',
  toys: '🧸',
  other: '📦',
}

const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  tools: 'Tools',
  cars: 'Cars',
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-goods': 'Home Goods',
  toys: 'Toys',
  other: 'Other',
}

// Stub hook - returns default scope for now
function useLocationScope() {
  return { filter: { scope: 'nationwide' as const, lat: null, lng: null, state_code: null } }
}

export function MarketplacePreview({ compact = false }: { compact?: boolean }) {
  const { filter } = useLocationScope()
  const [items, setItems] = useState<MarketplaceListingDTO[] | null>(null)

  useEffect(() => {
    let cancelled = false
    setItems(null)

    const load = async () => {
      try {
        // TODO: Replace with listMarketplace when we port it
        const { data, error } = await supabase
       .from('marketplace_listings')
       .select('*')
       .eq('status', 'active')
       .order('created_at', { ascending: false })
       .limit(4)

        if (error) throw error
        if (cancelled) return
        setItems(data as MarketplaceListingDTO[])
      } catch {
        if (!cancelled) setItems([])
      }
    }

    load()
    return () => { cancelled = true }
  }, [filter.scope, filter.lat, filter.lng, filter.state_code])

  return (
    <section className={compact? '' : 'mt-8'}>
      <div className={compact? 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2' : 'flex items-end justify-between gap-4'}>
        <div>
          <h3 className={compact? 'font-display text-sm font-semibold leading-tight' : 'font-display text-2xl font-bold md:text-3xl'}>
            🛒 Community marketplace
          </h3>
          <p className={compact? 'mt-1 line-clamp-2 text-xs text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>
            Buy, sell, and trade within your chosen radius. Furniture, tools, cars, electronics — keep it local.
          </p>
        </div>
        <Link href="/marketplace" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
          Browse marketplace →
        </Link>
      </div>
      <div className={compact? 'mt-3 grid gap-2' : 'mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
        {(items?? Array.from({ length: 4 })).map((m, i) => {
          if (!m) {
            return <div key={i} className="h-40 animate-pulse rounded-3xl border border-border bg-card" aria-hidden />
          }
          const item = m as MarketplaceListingDTO
          const place = [item.city, item.state_code].filter(Boolean).join(', ')
          return (
            <Link
              key={item.id}
              href={`/marketplace/${item.id}`}
              className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition hover:bg-secondary"
            >
              {item.image_url? (
                <img src={item.image_url} alt={item.title} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-3xl">
                  {CATEGORY_EMOJI[item.category]?? '📦'}
                </div>
              )}
              <div className="mt-3 line-clamp-1 font-display text-base font-semibold">{item.title}</div>
              <div className="mt-1 text-sm font-semibold text-primary">{formatPrice(item.price_cents, item.currency)}</div>
              <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {CATEGORY_LABELS[item.category]?? item.category}{place? ` · ${place}` : ''}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
