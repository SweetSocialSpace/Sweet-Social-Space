'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddressGate() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [stateRegion, setStateRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user?? null)
    })
  }, [supabase])

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
      } catch {
        setLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [user, supabase])

  if (!loaded) return null
  if (!open) return null
  return null
}
