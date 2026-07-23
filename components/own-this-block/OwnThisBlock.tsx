'use client'
import { useLocation } from '@/lib/location-context'

export function OwnThisBlock() {
  const { zip } = useLocation()
  
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 border-2 border-black">
      <div className="text-black font-black text-sm">OWN THIS BLOCK? 💰</div>
      <div className="text-black/80 text-xs mt-1">Pin your business in {zip} for $29/mo</div>
      <a href="/business/claim" className="mt-3 block bg-black text-white text-xs font-black px-4 py-2 rounded-full text-center">
        CLAIM {zip} →
      </a>
    </div>
  )
}

export default OwnThisBlock
