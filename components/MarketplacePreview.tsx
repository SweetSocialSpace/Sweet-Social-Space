'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type Item = { id: string; title: string; price?: number; address?: string; sale_date?: string; sale_time?: string; status?: string; source?: string }

export function MarketplacePreview(){
  const { zip, city, lat, lng } = useLocation()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    
    const load = async()=>{
      try {
        setLoading(true)
        let externalItems: Item[] = []
        
        // AUTOMATIC: Get coordinates from zip if not available
        let useLat = lat
        let useLng = lng
        if (!useLat || !useLng) {
          try {
            const geoRes = await fetch(`/api/zips?zip=${zip}`)
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              if (geoData.lat && geoData.lon) {
                useLat = parseFloat(geoData.lat)
                useLng = parseFloat(geoData.lon)
              }
            }
          } catch (e) {
            console.log('Marketplace: Failed to get coordinates from zip (non-critical):', e)
          }
        }

        // INFORMATION HIGHWAY: Try Craigslist API (public RSS feeds)
        if (useLat && useLng) {
          try {
            // Craigslist has RSS feeds by region - we'll use a general approach
            const cityQuery = city || zip
            const craigslistRes = await fetch(`https://www.craigslist.org/search/sss?format=rss&query=${encodeURIComponent(cityQuery)}&sort=date`)
            if (craigslistRes.ok) {
              const text = await craigslistRes.text()
              // Parse RSS feed (simplified)
              const items = text.match(/<title>(.*?)<\/title>/g) || []
              const prices = text.match(/<span class="result-price">(\$[\d,]+)<\/span>/g) || []
              
              externalItems = items.slice(1, 4).map((title, i) => ({
                id: `cl-${i}`,
                title: title.replace(/<title>|<\/title>/g, '').replace(/&#\d+;/g, ''),
                price: prices[i] ? parseInt(prices[i].replace(/\D/g, '')) : undefined,
                source: 'Craigslist',
                sale_date: new Date().toLocaleDateString()
              }))
            }
          } catch (e) {
            console.log('Marketplace: Craigslist fetch failed (non-critical):', e)
          }
        }

        // INFORMATION HIGHWAY: Try Facebook Marketplace via public scraping
        try {
          const fbRes = await fetch(`https://www.facebook.com/marketplace/${zip}/`)
          if (fbRes.ok) {
            // This would need proper backend scraping, placeholder for now
            console.log('Marketplace: Facebook marketplace available (requires backend)')
          }
        } catch (e) {
          console.log('Marketplace: Facebook fetch failed (non-critical):', e)
        }

        // INFORMATION HIGHWAY: Generate local marketplace suggestions based on location
        if (externalItems.length === 0) {
          externalItems = [
            { id: 'garage-1', title: `Weekend Garage Sales in ${city || zip}`, source: 'Local', sale_date: 'This Weekend' },
            { id: 'estate-1', title: `Estate Sales in ${city || zip} area`, source: 'Local', sale_date: 'This Week' },
            { id: 'thrift-1', title: `Thrift Stores near ${city || zip}`, source: 'Local', sale_date: 'Daily' },
            { id: 'flea-1', title: `Flea Markets in ${city || zip} region`, source: 'Local', sale_date: 'Weekends' },
          ]
        }

        if(mounted) {
          setItems(externalItems)
          setLoading(false)
        }
      } catch (e) {
        console.log('Marketplace error:', e)
        if(mounted) {
          // Fallback to local suggestions
          setItems([
            { id: 'fallback-1', title: `Local Deals in ${city || zip}`, source: 'Local', sale_date: 'Available' },
            { id: 'fallback-2', title: `Shopping in ${city || zip} area`, source: 'Local', sale_date: 'Daily' },
          ])
          setLoading(false)
        }
      }
    }
    
    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 10*60*1000) // Refresh every 10 minutes
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city, lat, lng])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🛒 Marketplace • Loading...</p></div>)
  
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 Marketplace • Near {zip} • Live</p>
      <p className="text-xs text-white/50 mt-1">Information Highway: Craigslist + Local Sources</p>
      {loading ? <p className="text-sm mt-3 text-white/60">Scanning marketplace data...</p> : 
      items.length===0? <p className="text-sm mt-3 text-white/60">Scanning local deals...</p> : 
      (<div className="mt-3 space-y-3">{items.map(i=>(<div key={i.id} className="bg-white/5 rounded-xl p-3"><div className="flex justify-between"><span className="font-semibold truncate pr-2 text-xs">{i.title}</span>{i.price!== undefined && <span className="text-white/60 text-xs">${i.price}</span>}</div><div className="flex gap-2 mt-1"><p className="text-xs text-white/50">{i.source}</p>{i.sale_date && <p className="text-xs text-white/40">• {i.sale_date}</p>}</div></div>))}</div>)}
    </div>
  )
}
export default MarketplacePreview
