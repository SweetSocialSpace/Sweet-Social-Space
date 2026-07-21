'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { createClient } from '@/lib/supabase/client'

export default function BlockMap() {
  const { zip, lat, lng, city } = useLocation()
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

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs mb-2">🗺️ BLOCK MAP • {zip} • {posts.length} LIVE PINS</div>
      <div className="w-full h- rounded-xl overflow-hidden border border-white/10 bg-black relative">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&z=14&output=embed`}
        />
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text- px-2 py-1 rounded-full border border-white/20">
          📍 {city} {zip}
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {posts.slice(0,3).map((p:any)=>(
          <div key={p.id} className="text- text-white/70 truncate flex items-center gap-1">
            <span>📍</span> {p.category?.toUpperCase()} • {p.body?.slice(0,35)} • {zip}
          </div>
        ))}
        <a href={`https://maps.google.com/?q=${mapLat},${mapLng}`} target="_blank" className="text- text-blue-400 font-bold">View larger map →</a>
      </div>
    </div>
  )
}
