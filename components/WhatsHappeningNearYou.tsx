'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Post = { id: string; body: string; tag: string | null; created_at: string }

export function WhatsHappeningNearYou(){
  const [posts, setPosts] = useState<Post[]>([])
  const [livePosts, setLivePosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const supabase = createClient()
    let mounted = true

    const fetchLivePlaces = async () => {
      try {
        // Free OpenStreetMap Overpass - real places near 95122, no key needed
        const query = `[out:json][timeout:25];(node(around:10000,37.3361,-121.8111)[amenity];way(around:10000,37.3361,-121.8111)[amenity];);out 10;`
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' }
        })
        const json = await res.json()
        if(mounted && json.elements && json.elements.length > 0){
          const places: Post[] = json.elements.filter((el:any)=>el.tags?.name).slice(0,4).map((el:any, i:number)=>({
            id: `live-${el.id || i}`,
            body: `${el.tags.name} — ${el.tags.amenity || 'spot'} near 95122 is open`,
            tag: el.tags.amenity || 'nearby',
            created_at: new Date().toISOString()
          }))
          setLivePosts(places)
        }
      } catch {}
      if(mounted) setLoading(false)
    }

    const load = async()=>{
      const {data}= await supabase.from('posts').select('id,body,tag,created_at').eq('zip_code','95122').order('created_at',{ascending:false}).limit(4)
      if(mounted && data && data.length > 0){
        setPosts(data as any)
        setLoading(false)
      } else {
        // No posts - auto-grab from internet for 95122
        fetchLivePlaces()
      }
    }
    load()
    const id = setInterval(load, 20*60*1000) // auto-refresh every 20 min
    return ()=>{ mounted = false; clearInterval(id) }
  },[])

  const display = posts.length > 0? posts : livePosts

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 text-white">
      <p className="font-bold">📍 What's happening near you</p>
      <p className="text-xs text-white/50 mt-1">Near 95122 • Live</p>
      {loading? <p className="text-sm mt-3 text-white/60">Loading...</p> : display.length===0? (
        <p className="text-sm mt-3 text-white/70">Nothing posted near you yet — be first!</p>
      ):(
        <div className="mt-3 space-y-2">
          {display.map(p=>(
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
