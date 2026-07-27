'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

// SINGLE SOURCE OF TRUTH - match what you have in Stripe
const PRICE_DISPLAY = '$29/mo'
const PRICE_CENTS = 2900

export default function ClaimBusinessPage() {
  const { zip: contextZip, city } = useLocation()
  const zip = (contextZip && contextZip.toUpperCase()!=='YOUR BLOCK' && contextZip.trim()!==''? contextZip : 'GLOBAL')
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClaim = async () => {
    if (!business.trim() ||!email.trim()) return
    setLoading(true)
    try {
      const safeZip = zip === 'GLOBAL'? 'GLOBAL' : zip
      const res = await fetch('/api/business/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: business.trim(), email: email.trim(), zip: safeZip, city: city || '', priceCents: PRICE_CENTS, body: `${business.trim()} - ${safeZip}` }),
      })
      const data = await res.json().catch(()=>({}))
      if (data.url) window.location.href = data.url
      else if (data.error) alert(data.error)
      else alert(`Claim submitted for ${business} in ${safeZip}! We'll contact ${email}`)
    } catch (e) {
      alert('Error submitting claim - please try again')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      <div className="mt-6 flex items-center justify-between">
        <Link href="/feed" className="text-white/60 hover:text-white text-sm">
          ← Back to {zip==='GLOBAL'? 'Feed' : `${zip} • ${city}`}
        </Link>
        <Link href="/feed" className="text-white/40 hover:text-white text-sm">
          Not now
        </Link>
      </div>

      <h1 className="text-3xl font-black mt-8 tracking-tight">Claim Your Business on Sweet Social Space</h1>
      <p className="text-white/60 mt-2">Own your block in {zip==='GLOBAL'? (city || 'your city') : `${city} ${zip}`} - {PRICE_DISPLAY} - Verified badge + post as business</p>

      <div className="mt-8 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 pointer-events-none" />
        <div className="relative space-y-4">
          <input
            placeholder="Business Name (e.g. Story & King)"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className="w-full p-3 rounded-xl bg-black border border-white/20 focus:border-purple-500 outline-none"
          />
          <input
            placeholder="Owner Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-black border border-white/20 focus:border-purple-500 outline-none"
          />
          <div className="text- text-white/30 uppercase tracking-widest">Zip: {zip} • {city} • GLOBAL • Auto-detected • VERTEBRAE • Independent</div>

          <button
            onClick={handleClaim}
            disabled={loading ||!business.trim() ||!email.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl font-black disabled:opacity-50 hover:scale-[1.01] transition-all"
          >
            {loading? 'Creating Stripe Checkout...' : `Claim for ${PRICE_DISPLAY} → ${zip}`}
          </button>

          <Link href="/feed" className="block text-center text-sm text-white/40 hover:text-white/70 mt-2">
            Cancel and return to feed
          </Link>

          <p className="text-xs text-white/30 text-center">Powered by Stripe - Cancel anytime • GLOBAL • {zip} • FAILSAFE</p>
        </div>
      </div>
    </div>
  )
}
