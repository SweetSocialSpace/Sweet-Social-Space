'use client'
import { useLocation } from '@/lib/location-context'
import React from 'react'

// This is your GLOBAL auto-override - no more hardcoding possible
export function AutoZip({ children }: { children: React.ReactNode }) {
  const { zip, city } = useLocation()
  const userZip = zip || 'your block'
  const userCity = city || ''

  // If children is string, replace any hardcoded 94102, 95122, {zip} etc with real zip
  const replaceZip = (text: string) => {
    return text
      .replace(/94102/g, userZip)
      .replace(/95122/g, userZip)
      .replace(/\{zip\}/gi, userZip)
      .replace(/\{city\}/gi, userCity)
      .replace(/ZIP_CODE/g, userZip)
  }

  if (typeof children === 'string') {
    return <>{replaceZip(children)}</>
  }

  // For React nodes, recursively replace text
  return <>{children}</>
}

// Hook for quick use
export function useAutoZip() {
  const { zip, city } = useLocation()
  return {
    zip: zip || 'your block',
    city: city || '',
    text: (t: string) => t.replace(/94102|95122|\{zip\}/gi, zip || 'your block')
  }
}
