'use client'
import { useLocation } from '@/lib/location-context'
export default function TrustPage(){
  const { city } = useLocation()
  return <div className="text-white p-10">Trust • {city || 'your area'} - Verified sources per RULES</div>
}
