'use client'
import { useState } from 'react'
import { useLocation } from '@/lib/location-context'

export default function ClaimBusinessPage() {
  const { zip } = useLocation()
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClaim = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/business/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: business, email, zip })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url // Stripe checkout
      else alert(data.error || 'Claim submitted - we will review')
    } catch (e) {
      alert('Error submitting claim')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mt-10">Claim Your Business on Sweet Social Space</h1>
      <p className="text-white/60 mt-2">Own your block in {zip || 'your city'} - $29/mo - Verified badge + post as business</p>

      <div className="mt-8 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <input
          placeholder="Business Name (e.g. Story & King)"
          value={business}
          onChange={e=>setBusiness(e.target.value)}
          className="w-full p-3 rounded-xl bg-black border border-white/20"
        />
        <input
          placeholder="Owner Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-black border border-white/20"
        />
        <div className="text-xs text-white/40">Zip: {zip} (auto-detected)</div>

        <button
          onClick={handleClaim}
          disabled={loading ||!business ||!email}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl font-black disabled:opacity-50"
        >
          {loading? 'Creating Stripe Checkout...' : 'Claim for $29/mo →'}
        </button>

        <p className="text- text-white/30 text-center">Powered by Stripe - Cancel anytime</p>
      </div>
    </div>
  )
}
