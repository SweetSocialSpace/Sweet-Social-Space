'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

type Item = { id: string; title: string; source?: string; sale_date?: string }

export function MarketplacePreview(){
  const { zip, city } = useLocation()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!zip) return
    let mounted = true
    
    const load = async()=>{
      try {
        setLoading(true)
        // Use backend API to bypass CSP
        const res = await fetch(`/api/marketplace?zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city || '')}`)
        if (res.ok) {
          const data = await res.json()
          if(mounted) {
            setItems(data.items || [])
            setLoading(false)
          }
        }
      } catch (e) {
        console.log('Marketplace error:', e)
        if(mounted) {
          setItems([
            { id: 'fallback-1', title: `Local Deals in ${city || zip}`, source: 'Local', sale_date: 'Available' },
          ])
          setLoading(false)
        }
      }
    }
    
    load()
    const id = setInterval(()=>{ try { load() } catch {} }, 10*60*1000)
    return ()=>{ mounted = false; try { clearInterval(id) } catch {} }
  },[zip, city])

  if (!zip) return (<div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white"><p className="font-bold">🛒 Marketplace • Loading...</p></div>)
  
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 Marketplace • Near {zip} • Live</p>
      <p className="text-xs text-white/50 mt-1">Information Highway: Local + External Sources</p>
      {loading ? <p className="text-sm mt-3 text-white/60">Scanning marketplace data...</p> : 
      items.length===0? <p className="text-sm mt-3 text-white/60">Scanning local deals...</p> : 
      (<div className="mt-3 space-y-3">{items.map(i=>(<div key={i.id} className="bg-white/5 rounded-xl p-3"><div className="font-semibold truncate pr-2 text-xs">{i.title}</div><div className="flex gap-2 mt-1"><p className="text-xs text-white/50">{i.source}</p>{i.sale_date && <p className="text-xs text-white/40">• {i.sale_date}</p>}</div></div>))}</div>)}
    </div>
  )
}
export default MarketplacePreview
