'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = { id: string; title: string; price_cents: number }

export function MarketplacePreview(){
  const [items, setItems] = useState<Item[]>([])

  useEffect(()=>{
    const supabase = createClient()
    supabase.from('marketplace_listings').select('id,title,price_cents').eq('status','active').order('created_at',{ascending:false}).limit(3).then(({data})=>{
      if(data) setItems(data as any)
    })
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 Marketplace</p>
      <p className="text- text-white/50 mt-1">Near 95122</p>
      {items.length===0? <p className="text-sm mt-3 text-white/60">No listings yet</p> : (
        <div className="mt-3 space-y-2">
          {items.map(i=>(
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
