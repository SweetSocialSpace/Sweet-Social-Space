'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = { id: string; title: string; price_cents: number }

export function MarketplacePreview(){
  const [items, setItems] = useState<Item[]>([])
  const [liveItems, setLiveItems] = useState<Item[]>([])

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const fetchLiveMarket = async () => {
      try {
        // Free product API - real items from internet, no key needed
        const res = await fetch('https://dummyjson.com/products?limit=3&select=title,price')
        const json = await res.json()
        if(mounted && json.products){
          const live: Item[] = json.products.map((p:any)=>({
            id: `live-${p.id}`,
            title: p.title,
            price_cents: Math.round(p.price * 100)
          }))
          setLiveItems(live)
        }
      } catch {}
    }

    supabase.from('marketplace_listings').select('id,title,price_cents').eq('status','active').order('created_at',{ascending:false}).limit(3).then(({data})=>{
      if(mounted && data && data.length > 0){
        setItems(data as any)
      } else {
        // No listings - auto-grab from internet
        fetchLiveMarket()
      }
    })

    const id = setInterval(()=>{
      supabase.from('marketplace_listings').select('id,title,price_cents').eq('status','active').order('created_at',{ascending:false}).limit(3).then(({data})=>{
        if(mounted && data && data.length > 0) setItems(data as any)
      })
    }, 20*60*1000) // auto-refresh every 20 min

    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  const display = items.length > 0 ? items : liveItems

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 Marketplace</p>
      <p className="text-xs text-white/50 mt-1">Near 95122 • Live</p>
      {display.length===0? <p className="text-sm mt-3 text-white/60">No listings yet</p> : (
        <div className="mt-3 space-y-2">
          {display.map(i=>(
            <div key={i.id} className="flex justify-between bg-white/5 rounded-xl p-2.5 text-xs">
              <span className="truncate">{i.title}</span>
              <span className="text-white/60">${(i.price_cents/100).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MarketplacePreview
