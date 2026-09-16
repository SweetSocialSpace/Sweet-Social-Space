'use client'
import dynamic from 'next/dynamic'
import { HouseErrorBoundary } from './HouseErrorBoundary'

const WeatherBar = dynamic(() => import('./WeatherBar'), { ssr: false, loading: () => null })
const WhatsHappeningNearYou = dynamic(() => import('./WhatsHappeningNearYou'), { ssr: false, loading: () => null })
const VerifiedSources = dynamic(() => import('./VerifiedSources'), { ssr: false, loading: () => null })
const UpcomingEvents = dynamic(() => import('./UpcomingEvents'), { ssr: false, loading: () => null })

export function Safe({name}:{name: string}){
  const MAP: Record<string, any> = {
    WeatherBar,
    WhatsHappeningNearYou,
    VerifiedSources,
    UpcomingEvents,
  }
  const Comp = MAP[name]
  if (!Comp) return null
  return <HouseErrorBoundary name={name}><Comp /></HouseErrorBoundary>
}
