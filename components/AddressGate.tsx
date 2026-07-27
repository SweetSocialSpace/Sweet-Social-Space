'use client'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
useEffect(() => {
  if (!user) return
  let cancelled = false
  ;(async () => {
    try {
      const { data } = await (supabase as any).rpc('get_my_private_profile')
      if (cancelled) return
      const p = (Array.isArray(data)? data[0] : data)?? {}
      setStreet(p.street?? '')
      setCity(p.city?? '')
      setStateRegion(p.state_code?? '')
      setPostalCode(p.postal_code?? '')
      setCountry(p.country?? '')
      setOpen(false)
      setLoaded(true)
    } catch { setLoaded(true) }
  })()
  return () => { cancelled = true }
}, [user])
