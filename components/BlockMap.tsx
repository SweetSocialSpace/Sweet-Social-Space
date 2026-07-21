'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'
import { createClient } from '@/lib/supabase/client'

function latLngToTile(lat:number, lng:number, z:number){
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, z))
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI/180) + 1/Math.cos(lat * Math.PI/180)) / Math.PI) /2 * Math.pow(2, z))
  return {x,y}
}

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
  const z = 14
  const center = latLngToTile(mapLat, mapLng, z)
  const tiles = []
  for(let dx=-1; dx<=1; dx++){
    for(let dy=-1; dy<=1; dy++){
      tiles.push({x:center.x+dx, y:center.y+dy, key:`${dx}-${dy}`})
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-3">
      <div className="text-white font-black text-xs mb-2">BLOCK MAP {zip} {posts.length} LIVE PINS</div>
      <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative" style={{height:'280px'}}>
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full" style={{height:'280px'}}>
          {tiles.map(t=>(
            <img key={t.key} src={`https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png`} alt="" className="w-full h-full object-cover" loading="lazy" />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600 w-4 h-4 rounded-full border-2 border-white shadow-xl animate-pulse" />
        </div>
        <div className="absolute bottom-2 left-2 bg-black text-white text-xs px-3 py-1 rounded-full border border-white/20 font-black">
          San Jose {zip} {posts.length} pins
        </div>
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
