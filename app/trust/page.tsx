'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/lib/location-context'

export default function TrustPage() {
  const { zip, city } = useLocation()
  const [trustData, setTrustData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!zip) return
    const loadTrust = async () => {
      try {
        const res = await fetch(`/api/trust?zip=${encodeURIComponent(zip)}`)
        const data = await res.json()
        setTrustData(data)
      } catch (e) {
        console.log('Trust data error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadTrust()
  }, [zip])

  const displayArea = city || zip || 'your area'

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Trust Meter</h1>
        <p className="text-white/60">Community trust statistics for {displayArea}</p>
      </div>

      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/60">Loading trust data...</p>
        </div>
      ) : trustData ? (
        <div className="space-y-6">
          {/* Trust Score */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Community Trust Score</h2>
              <div className="text-4xl font-black text-green-400">{trustData.percent}%</div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                style={{ width: `${trustData.percent}%` }}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">
              {trustData.verified} of {trustData.total} users in {displayArea} are verified
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-blue-400">{trustData.total}</div>
              <p className="text-white/60 text-sm mt-1">Total Users</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-green-400">{trustData.verified}</div>
              <p className="text-white/60 text-sm mt-1">Verified Users</p>
            </div>
          </div>

          {/* What This Means */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-4">What This Means</h2>
            <div className="space-y-3 text-white/70 text-sm">
              <p><strong>✅ Verified Users:</strong> Users who have completed identity verification through our system</p>
              <p><strong>🔒 Secure Platform:</strong> SSL encryption, no data selling, privacy-first design</p>
              <p><strong>🏘️ Local Focus:</strong> Trust is measured within your 5-20 mile radius, not globally</p>
              <p><strong>🤝 Community Building:</strong> Higher trust scores indicate a more engaged, verified local community</p>
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-4">How to Increase Trust</h2>
            <div className="space-y-2 text-white/70 text-sm">
              <p>• Complete your profile verification</p>
              <p>• Engage positively with neighbors</p>
              <p>• Post helpful content for your community</p>
              <p>• Report suspicious activity to help keep {displayArea} safe</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white/60">Trust data unavailable for your area. Make sure your zip code is set in your profile.</p>
        </div>
      )}
    </div>
  )
}
