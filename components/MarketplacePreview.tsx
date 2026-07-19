'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  id: string;
  title: string;
  price?: number;
  address?: string;
  sale_date?: string;
  sale_time?: string;
}

export function MarketplacePreview(){
  const [items, setItems] = useState<Item[]>([])

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true
    const load = async()=>{
      const {data} = await supabase
     .from('marketplace')
     .select('id,title,price,address,sale_date,sale_time')
     .order('created_at',{ascending:false})
     .limit(10)
      if(mounted && data) setItems(data as any)
    }
    load()
    const id = setInterval(load, 2*60*1000)
    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🛒 Marketplace • Near 95122 • Live</p>
      {items.length===0? <p className="text-sm mt-3 text-white/60">No listings yet - post a garage sale!</p> : (
        <div className="mt-3 space-y-3">
          {items.map(i=>(
            <div key={i.id} className="bg-white/5 rounded-xl p-3">
              <div className="flex justify-between">
                <span className="font-semibold truncate pr-2 text-xs">{i.title}</span>
                {i.price!== undefined && <span className="text-white/60 text-xs">${i.price}</span>}
              </div>
              {i.sale_date && <p className="text- text-white/50 mt-1.5">📅 {i.sale_date} {i.sale_time || ''}</p>}
              {i.address && (
                <div className="mt-2.5">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(i.address)}`} target="_blank" className="inline-flex text- bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full">
                    📍 Map to {i.address}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default MarketplacePreview
