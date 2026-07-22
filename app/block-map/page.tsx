'use client'
import { useEffect, useRef } from 'react'

export default function BlockMapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Add Leaflet CSS once
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const init = async () => {
      const L = await import('leaflet')

      // Wait for the browser to paint the container
      requestAnimationFrame(() => {
        if (!containerRef.current) return

        mapRef.current = L.map(containerRef.current, {
          center: [37.3396, -121.8611],
          zoom: 15,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
          .addTo(mapRef.current)

        L.marker([37.3396, -121.8611]).addTo(mapRef.current)

        // Force Leaflet to recalc size AFTER render
        setTimeout(() => {
          mapRef.current.invalidateSize(true)
        }, 100)
      })
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

 return (
  <div
    ref={containerRef}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999, // make sure it sits above your background
    }}
  />
)
}
