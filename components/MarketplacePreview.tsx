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
    
    // Map English API titles to Spanish
    if (title.includes('Weekend Garage Sales')) return t?.marketplace?.weekendGarageSales? tFormat(t.marketplace.weekendGarageSales, { city: cityName }) : `Ventas de Garaje de Fin de Semana en ${cityName}`
    if (title.includes('Estate Sales') && title.includes('area')) return t?.marketplace?.estateSalesArea? tFormat(t.marketplace.estateSalesArea, { city: cityName }) : `Ventas de Propiedades en área de ${cityName}`
    if (title.includes('Estate Sales')) return t?.marketplace?.estateSales? tFormat(t.marketplace.estateSales, { city: cityName }) : `Ventas de Propiedades en ${cityName}`
    if (title.includes('Thrift Stores near')) return t?.marketplace?.thriftStoresNear? tFormat(t.marketplace.thriftStoresNear, { city: cityName }) : `Tiendas de Segunda Mano cerca de ${cityName}`
    if (title.includes('Flea Markets') && title.includes('region')) return t?.marketplace?.fleaMarketsRegion? tFormat(t.marketplace.fleaMarketsRegion, { city: cityName }) : `Mercados de Pulgas en región de ${cityName}`
    if (title.includes('Flea Markets')) return t?.marketplace?.fleaMarkets? tFormat(t.marketplace.fleaMarkets, { city: cityName }) : `Mercados de Pulgas en ${cityName}`
    if (title.includes('Local Deals in')) return t?.marketplace?.localDealsIn? tFormat(t.marketplace.localDealsIn, { city: cityName }) : `Ofertas Locales en ${cityName}`
    
    return title
  }

  const translateSource = (source: string | undefined): string => {
    if (!source) return ''
    const map: Record<string, string> = {
      'Local': t?.marketplace?.local || 'Local',
      'This Weekend': t?.marketplace?.thisWeekend || 'Este Fin de Semana',
      'This Week': t?.marketplace?.thisWeek || 'Esta Semana',
      'Daily': t?.marketplace?.daily || 'Diario',
      'Weekends': t?.marketplace?.weekends || 'Fines de Semana',
      'Available': t?.marketplace?.available || 'Disponible',
    }
    // Handle compound like "Local • This Weekend"
    let result = source
    for (const [en, es] of Object.entries(map)) {
      result = result.replaceAll(en, es)
    }
    return result
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
        console.log('Marketplace error:', e)
        if(mounted) {
          setItems([
            { id: 'fallback-1', title: t?.marketplace?.localDealsIn? tFormat(t.marketplace.localDealsIn, { city: city || zip }) : `Ofertas Locales en ${city || zip}`, source: t?.marketplace?.local || 'Local', sale_date: t?.marketplace?.available || 'Disponible' },
          ])
          setLoading(false)
        }
      }
    }
    
    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 10*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, t])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🛒 {t?.marketplace?.title || 'Mercado'} • {t?.common?.loading || 'Cargando...'}</p></div>)
  
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 {t?.marketplace?.title || 'Mercado'} • {t?.marketplace?.near? tFormat(t.marketplace.near, { zip }) : `Cerca de ${zip}`} • {t?.marketplace?.live || 'En Vivo'}</p>
      <p className="text-xs text-white/50 mt-1">{t?.marketplace?.infoHighway || 'Autopista de Información: Fuentes Locales + Externas'}</p>
      {loading ? <p className="text-sm mt-3 text-white/60">{t?.marketplace?.scanning || 'Escaneando datos del mercado...'}</p> : 
      items.length===0? <p className="text-sm mt-3 text-white/60">{t?.marketplace?.scanningDeals || 'Escaneando ofertas locales...'}</p> : 
      (<div className="mt-3 space-y-3">{items.map(i=>(<div key={i.id} className="bg-white/5 rounded-xl p-3"><div className="font-semibold truncate pr-2 text-xs">{i.title}</div><div className="flex gap-2 mt-1"><p className="text-xs text-white/50">{i.source}</p>{i.sale_date && <p className="text-xs text-white/40">• {i.sale_date}</p>}</div></div>))}</div>)}
    </div>
  )
}
export default MarketplacePreview
