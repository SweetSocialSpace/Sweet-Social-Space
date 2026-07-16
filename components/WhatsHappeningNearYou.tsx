'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Post = { id: string; body: string; tag: string | null; created_at: string }

export function WhatsHappeningNearYou(){
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const supabase = createClient()
    const load = async()=>{
      const {data}= await supabase.from('posts').select('id,body,tag,created_at').eq('zip_code','95122').order('created_at',{ascending:false}).limit(4)
      if(data) setPosts(data as any)
      setLoading(false)
    }
    load()
  },[])

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 What's happening near you</p>
      <p className="text- text-white/50 mt-1">Near 95122</p>
      {loading? <p className="text-sm mt-3 text-white/60">Loading...</p> : posts.length===0? (
        <p className="text-sm mt-3 text-white/70">Nothing posted near you yet — be first!</p>
      ):(
        <div className="mt-3 space-y-2">
          {posts.map(p=>(
            <div key={p.id} className="bg-white/5 rounded-xl p-2.5">
              <p className="text-xs text-white/90 line-clamp-2">{p.body}</p>
              {p.tag && <p className="text- text-white/40 mt-1">#{p.tag}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WhatsHappeningNearYou
