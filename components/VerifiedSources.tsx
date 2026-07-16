'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type V = { id: string; title: string }

export function VerifiedSources(){
  const [vs, setVs] = useState<V[]>([])
  useEffect(()=>{
    const supabase = createClient()
    supabase.from('verified_updates').select('id,title').order('created_at',{ascending:false}).limit(3).then(({data})=>{ if(data) setVs(data as any) })
  },[])
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">✅ Verified Sources</p>
      {vs.length===0? <p className="text-sm mt-3 text-white/60">No verified orgs yet — apply!</p> : (
        <div className="mt-3 space-y-2">
          {vs.map(v=>(
            <div key={v.id} className="bg-white/5 rounded-xl p-2.5 text-xs flex items-center gap-2">
              <span>✅</span><span className="truncate">{v.title}</span>
            </div>
          ))}
        </div>
      )}
      <a href="/apply-verification" className="mt-3 inline-block text- bg-white text-black px-3 py-1 rounded-full font-bold">Apply for verification</a>
    </div>
  )
}

export default VerifiedSources
