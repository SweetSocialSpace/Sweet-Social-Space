'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getBlockTruth } from './storage'

type BlockState = { zip: string; city: string; lat: number; lng: number; loading: boolean }

const Ctx = createContext<BlockState & { setBlock: (b: Partial<BlockState>) => void }>({
  zip: '', city: '', lat: 0, lng: 0, loading: true, setBlock: () => {}
})

export function BlockSystemProvider({ children }: { children: React.ReactNode }) {
  const [block, setBlockState] = useState<BlockState>({ zip: '', city: '', lat: 0, lng: 0, loading: true })
  
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const b = await getBlockTruth()
        if (!cancelled) setBlockState({ ...b, loading: false })
      } catch {
        if (!cancelled) setBlockState({ zip: '', city: '', lat: 0, lng: 0, loading: false })
      }
    })()
    return () => { cancelled = true }
  }, [])
  
  const setBlock = (b: Partial<BlockState>) => {
    try {
      const safeZip = (b as any)?.zip?.trim() || ''
      // Never allow literal placeholder
      if (safeZip.toUpperCase() === 'YOUR BLOCK') return
      setBlockState({ zip: safeZip, city: (b as any)?.city || '', lat: (b as any)?.lat || 0, lng: (b as any)?.lng || 0, loading: false })
      if (typeof window !== 'undefined' && safeZip) {
        try {
          localStorage.setItem('user_zip', safeZip)
          if ((b as any)?.city) localStorage.setItem('user_city', (b as any).city)
        } catch {}
      }
    } catch {}
  }

  return <Ctx.Provider value={{ ...block, setBlock }}>{children}</Ctx.Provider>
}

export const useBlockSystem = () => {
  try {
    return useContext(Ctx)
  } catch {
    return { zip: '', city: '', lat: 0, lng: 0, loading: false, setBlock: () => {} }
  }
}
