'use client'
import dynamic from 'next/dynamic'
import { HouseErrorBoundary } from './HouseErrorBoundary'

const MAP = {
  WeatherBar: dynamic(() => import('./WeatherBar'), { ssr: false, loading: () => null }),
  WhatsHappeningNearYou: dynamic(() => import('./WhatsHappeningNearYou'), { ssr: false, loading: () => null }),
  VerifiedSources: dynamic(() => import('./VerifiedSources'), { ssr: false, loading: () => null }),
  UpcomingEvents: dynamic(() => import('./UpcomingEvents'), { ssr: false, loading: () => null }),
} as const

export function Safe({name}:{name: keyof typeof MAP}){
  const Comp = MAP[name]
  if (!Comp) return null
  return <HouseErrorBoundary name={name}><Comp /></HouseErrorBoundary>
}
