'use client'
import { useLocation } from '@/lib/location-context'
export default function FaithPage(){
  const { zip } = useLocation()
  return <div className="text-white p-10">Faith posts near {zip || 'your area'}</div>
}
