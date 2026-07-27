'use client'
import { useEffect, useState } from 'react'
import { getBlockTruth } from './storage'
import { BLOCK_CONFIG } from './config'

type BlockTruth = { zip: string; city: string; lat: number; lng: number }

export function useBlock() {
  const [block, setBlock] = useState<BlockTruth & { loading: boolean }>({ 
    zip: '', city: '', lat: 0, lng: 0, loading: true 
  })
  
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const b = await getBlockTruth()
        if (cancelled) return
        
        // House never dies - never allow literal placeholder, force real zip
        let safeZip = b?.zip || ''
        if (safeZip === (BLOCK_CONFIG as any)?.NEVER_SHOW) safeZip = ''

        const safeBlock = { 
          zip: safeZip, 
          city: b?.city || '', 
          lat: b?.lat || 0, 
          lng: b?.lng || 0, 
          loading: false 
        }
        
        setBlock(safeBlock)

        if (typeof window !== 'undefined' && safeZip) {
          try {
            localStorage.setItem('user_zip', safeZip)
            if (safeBlock.city) localStorage.setItem('user_city', safeBlock.city)
          } catch {}
        }
      } catch {
        if (!cancelled) setBlock({ zip: '', city: '', lat: 0, lng: 0, loading: false })
      }
    })()
    return () => { cancelled = true }
  }, [])

  return block // every component gets same truth, can't override - global, house-safe
}
