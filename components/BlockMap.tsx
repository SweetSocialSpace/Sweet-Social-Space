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

      <div className="w-full h- rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative group">
        {/* Static map image - never blocked */}
        <img
          src={`https://staticmap.openstreetmap.de/staticmap.php?center=${mapLat},${mapLng}&zoom=14&size=400x300&markers=${mapLat},${mapLng},red-pushpin`}
          alt={`Map of ${zip}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback to OSM tile image
            (e.target as HTMLImageElement).src = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=300&center=lonlat:${mapLng},${mapLat}&zoom=14&apiKey=not-needed`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2 bg-black text-white text- px-3 py-1.5 rounded-full border border-white/20 font-black">
          📍 {city} {zip} • {posts.length} pins
        </div>
        <a href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`} target="_blank" className="absolute top-2 right-2 bg-white text-black text- px-3 py-1.5 rounded-full font-black hover:bg-yellow-400 transition">
          Open Map
        </a>
      </div>

      <div className="mt-3 space-y-1.5 max-h- overflow-y-auto">
        <div className="text- font-black text-white/90">📍 San Jose {zip}</div>
        {posts.slice(0,4).map((p:any)=>(
          <div key={p.id} className="text- text-white/60 truncate flex gap-1.5">
            <span className="text-pink-400">📍</span>
            <span className="font-bold">{p.category?.toUpperCase()}</span>
            <span className="truncate">• {p.body?.slice(0,40)} • {zip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
