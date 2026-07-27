'use client'
import dynamic from 'next/dynamic'
import { HouseErrorBoundary } from './HouseErrorBoundary'
import { useMemo } from 'react'

const MAP: Record<string, any> = {
  // explicit whitelist - Next CAN bundle - GLOBAL house-safe
  WeatherBar: () => import('./WeatherBar').then(m => m.default).catch(() => ({ default: () => null })),
  WhatsHappeningNearYou: () => import('./WhatsHappeningNearYou').then(m => m.default || m.WhatsHappeningNearYou).catch(() => ({ default: () => null })),
  VerifiedSources: () => import('./VerifiedSources').then(m => m.default || m.VerifiedSources).catch(() => ({ default: () => null })),
  UpcomingEvents: () => import('./UpcomingEvents').then(m => m.default || m.UpcomingEvents).catch(() => ({ default: () => null })),
  NearbyLiveFeed: () => import('./NearbyLiveFeed').then(m => m.default || m.NearbyLiveFeed).catch(() => ({ default: () => null })),
  CommunityAlerts: () => import('./CommunityAlerts').then(m => m.default || m.CommunityAlerts).catch(() => ({ default: () => null })),
}

export function Safe({name}:{name:string}){
  const Comp = useMemo(() => {
    try {
      const loader = (MAP as any)[name]
      if (!loader) return () => null
      return dynamic(loader, { ssr: false, loading: () => null })
    } catch { return () => null as any }
  }, [name])
  return <HouseErrorBoundary name={name}><Comp /></HouseErrorBoundary>
}
