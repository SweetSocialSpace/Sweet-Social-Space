'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Biz = { id: string; name: string; category: string | null }

export function BusinessDirectory(){
  const [biz, setBiz] = useState<Biz[]>([])
  useEffect(()=>{
    const supabase = createClient()
    supabase.from('businesses').select('id,name,category').order('verified',{ascending:false}).limit(4).then(({data})=>{ if(data) setBiz(data as any) })
  },[])
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">🏢 Local Businesses</p>
      {biz.length===0? <p className="text-sm mt-3 text-white/60">No businesses yet</p> : (
        <div className="mt-3 space-y-2">
          {biz.map(b=>(
            <div key={b.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex justify-between">
              <span>{b.name}</span><span className="text-white/40">{b.category||''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessDirectory
