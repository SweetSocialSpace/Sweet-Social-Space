'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { useTranslations, tFormat } from '@/lib/translations'

type Item = { id: string; title: string; source?: string; sale_date?: string }

export function MarketplacePreview(){
  const t = useTranslations() as any
  const { zip, city } = useLocation()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const translateTitle = (title: string): string => {
    if (!title) return title
    const cityName = city || zip || ''

    if (title.includes('Weekend Garage Sales')) {
      return tFormat(t.marketplace.weekendGarageSales, { city: cityName })
    }
    if (title.includes('Estate Sales') && title.includes('area')) {
      return tFormat(t.marketplace.estateSalesArea, { city: cityName })
    }
    if (title.includes('Estate Sales')) {
      return tFormat(t.marketplace.estateSales, { city: cityName })
    }
    if (title.includes('Thrift Stores near')) {
      return tFormat(t.marketplace.thriftStoresNear, { city: cityName })
    }
    if (title.includes('Flea Markets') && title.includes('region')) {
      return tFormat(t.marketplace.fleaMarketsRegion, { city: cityName })
    }
    if (title.includes('Flea Markets')) {
      return tFormat(t.marketplace.fleaMarkets, { city: cityName })
    }
    if (title.includes('Local Deals in')) {
      return tFormat(t.marketplace.localDealsIn, { city: cityName })
    }
    return title
  }

  const translateSource = (source: string | undefined): string => {
    if (!source) return ''
    return source
  }

  useEffect(()=>{
    if (!zip) return
    let mounted = true

    const load = async()=>{
      try {
        setLoading(true)
        const res = await fetch(`/api/marketplace?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}`)
        if (res.ok) {
          const data = await res.json()
          if(mounted) {
            const translated = (data.items || []).map((i: Item) => ({
              ...i,
              title: translateTitle(i.title),
              source: translateSource(i.source),
              sale_date: translateSource(i.sale_date)
            }))
            setItems(translated)
            setLoading(false)
          }
        }
      } catch (e) {
        if(mounted) {
          setItems([
            { id: 'fallback-1', title: tFormat(t.marketplace.localDealsIn, { city: city || zip }), source: t?.marketplace?.local, sale_date: t?.marketplace?.available },
          ])
          setLoading(false)
        }
      }
    }

    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 10*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, t])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🛒 {t?.marketplace?.title} • {t?.common?.loading}</p></div>)

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 {t?.marketplace?.title} • {tFormat(t.marketplace.near, { zip })} • {t?.marketplace?.live}</p>
      <p className="text-xs text-white/50 mt-1">{t?.marketplace?.infoHighway}</p>
      {loading? <p className="text-sm mt-3 text-white/60">{t?.marketplace?.scanning}</p> :
      items.length===0? <p className="text-sm mt-3 text-white/60">{t?.marketplace?.scanningDeals}</p> :
      (<div className="mt-3 space-y-3">{items.map(i=>(<div key={i.id} className="bg-white/5 rounded-xl p-3"><div className="font-semibold truncate pr-2 text-xs">{i.title}</div><div className="flex gap-2 mt-1"><p className="text-xs text-white/50">{i.source}</p>{i.sale_date && <p className="text-xs text-white/40">• {i.sale_date}</p>}</div></div>))}</div>)}
    </div>
  )
}
export default MarketplacePreview
