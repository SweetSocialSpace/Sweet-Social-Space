'use client'
import { useEffect, useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function TheDrop() {
  const { zip } = useLocation()
  const [drop, setDrop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!zip || zip === 'GLOBAL') {
      setLoading(false)
      return
    }
    const fetchDrop = async () => {
      try {
        const res = await fetch(`/api/drop?zip=${encodeURIComponent(zip)}`)
        const json = await res.json()
        setDrop(json.drop)
      } finally {
        setLoading(false)
      }
    }
    fetchDrop()
    const id = setInterval(fetchDrop, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [zip])

  if (!zip || zip === 'GLOBAL') return null

  return (
    <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-black text-sm tracking-wider">The Drop • 10AM</h3>
        <span className="bg-white text-black text- font-black px-2 py-1 rounded-full">LIVE</span>
      </div>

      {loading? (
        <p className="text-white/50 text-sm">Loading today's drop...</p>
      ) : drop? (
        <>
          <p className="text-white font-bold text-base leading-tight">{drop.title}</p>
          <p className="text-white/70 text-sm">{drop.description}</p>
          {drop.business_name && <p className="text-white/40 text-xs">From: {drop.business_name}</p>}
          {drop.claim_url && (
            <a href={drop.claim_url} target="_blank" className="block w-full bg-white text-black text-center py-3 rounded-xl font-black text-sm hover:bg-white/90">
              Claim →
            </a>
          )}
        </>
      ) : (
        <>
          <p className="text-white/60 text-sm">No drop yet today - Be first to sponsor tomorrow's drop!</p>
          <button className="w-full bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm">
            Sponsor Tomorrow — $25
          </button>
        </>
      )}
    </div>
  )
}
