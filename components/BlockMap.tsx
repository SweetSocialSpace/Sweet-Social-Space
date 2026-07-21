'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { createClient } from '@/lib/supabase/client'

export default function BlockMap() {
  const { zip, lat, lng } = useLocation()
  const [posts, setPosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('posts').select('*').limit(20).order('created_at',{ascending:false})
      if (data) setPosts(data)
    })()
  }, [zip])

  const mapLat = lat || 37.3382
  const mapLng = lng || -121.8863
  const delta = 0.02
  const bbox = `${mapLng - delta},${mapLat - delta},${mapLng + delta},${mapLat + delta}`
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapLat},${mapLng}`

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs mb-2">BLOCK MAP {zip} {posts.length} LIVE PINS</div>
      <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative" style={{height: '280px'}}>
        <iframe src={embedUrl} className="w-full h-full border-0" loading="lazy" />
        <a href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`} target="_blank" className="absolute top-2 right-2 bg-white text-black text-xs px-3 py-1 rounded-full font-black">
          Open Map
        </a>
      </div>
      <div className="mt-3 space-y-1">
        {posts.slice(0,4).map((p:any)=>(
          <div key={p.id} className="text-xs text-white/60 truncate">
            {p.category} {p.body?.slice(0,45)} {zip}
          </div>
        ))}
      </div>
    </div>
  )
}
