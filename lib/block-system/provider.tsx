'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getBlockTruth } from './storage'

const Ctx = createContext({ zip: '', city: '', lat: 0, lng: 0, loading: true, setBlock: (b:any)=>{} })

export function BlockSystemProvider({ children }: any) {
  const [block, setBlockState] = useState({ zip: '', city: '', lat: 0, lng: 0, loading: true })
  
  useEffect(() => { getBlockTruth().then(b => setBlockState({ ...b, loading: false })) }, [])
  
  const setBlock = (b:any) => {
    setBlockState({ ...b, loading: false })
    localStorage.setItem('user_zip', b.zip)
  }

  return <Ctx.Provider value={{ ...block, setBlock }}>{children}</Ctx.Provider>
}

export const useBlockSystem = () => useContext(Ctx)
