'use client'
import { useEffect, useState } from 'react'
import { getBlockTruth } from './storage'
import { BLOCK_CONFIG } from './config'

export function useBlock() {
  const [block, setBlock] = useState({ zip: '', city: '', lat: 0, lng: 0, loading: true })
  
  useEffect(() => {
    getBlockTruth().then(b => {
      // NEVER allow YOUR BLOCK literal — forces real zip
      if (b.zip === BLOCK_CONFIG.NEVER_SHOW) b.zip = ''
      setBlock({ ...b, loading: false })
      if (b.zip) {
        localStorage.setItem('user_zip', b.zip)
        if (b.city) localStorage.setItem('user_city', b.city)
      }
    })
  }, [])

  return block // every component gets same truth, can't override
}
