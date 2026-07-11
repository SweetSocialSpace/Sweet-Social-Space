'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll port these files later from Lovable
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { useAuth } from '@/hooks/useAuth'

// Stub hook - replace with real one when we port hooks/useAuth.ts
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  return { user }
}

// Stub Dialog components - replace with shadcn/ui when installed
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">{children}</div>
}
function DialogContent({ children, className = '', onPointerDownOutside, onEscapeKeyDown }: any) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-xl ${className}`}>
      {children}
    </div>
  )
}
function DialogHeader({ children }: any) {
  return <div className="mb-4">{children}</div>
}
function DialogTitle({ children }: any) {
  return <h2 className="font-display text-lg font-semibold">{children}</h2>
}
function DialogDescription({ children }: any) {
  return <p className="mt-1 text-sm text-muted-foreground">{children}</p>
}

// Stub Input
function Input(props: any) {
  return <input {...props} className={`w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ${props.className || ''}`} />
}

// Stub Button
function Button({ variant = 'default', className = '', children,...props }: any) {
  const base = 'rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50'
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-secondary',
  }
  return (
    <button {...props} className={`${base} ${variants[variant as keyof typeof variants] || variants.default} ${className}`}>
      {children}
    </button>
  )
}

const schema = z.object({
  street: z.string().trim().max(120).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  state: z.string().trim().max(60).optional().or(z.literal('')),
  postal_code: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().max(60).optional().or(z.literal('')),
})

export function AddressGate() {
  const { user } = useAuth()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [stateRegion, setStateRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const { data } = await (supabase as any).rpc('get_my_private_profile')
      if (cancelled) return
      const p = (Array.isArray(data)? data[0] : data)?? {}
      setStreet(p.street?? '')
      setCity(p.city?? '')
      setStateRegion(p.state_code?? '')
      setPostalCode(p.postal_code?? '')
      setCountry(p.country?? '')
      setOpen(false) // Don't force open if they have data
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [user, supabase])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = schema.safeParse({ street, city, state: stateRegion, postal_code: postalCode, country })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    if (!user) return
    setBusy(true)
    try {
      const locationLabel = [parsed.data.city, parsed.data.state, parsed.data.country].filter(Boolean).join(', ')
      const zip = parsed.data.postal_code || null
      const { error: upErr } = await supabase
  .from('profiles')
  .update({
          street: parsed.data.street || null,
          city: parsed.data.city || null,
          state_code: parsed.data.state || null,
          postal_code: zip,
          zip_code: zip,
          country: parsed.data.country || null,
          location_label: locationLabel || null,
        } as any)
  .eq('user_id', user.id)
      if (upErr) {
        setError(upErr.message)
        return
      }
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (!loaded ||!open) return null

  return (
    <Dialog open={open} onOpenChange={() => { /* required, block close */ }}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e: any) => e.preventDefault()} onEscapeKeyDown={(e: any) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add your ZIP code</DialogTitle>
          <DialogDescription>
            We only use your ZIP to show local posts. You can skip this for now.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="ZIP / Postal code (optional)" maxLength={20} />
          <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address (optional)" maxLength={120} />
          <div className="grid grid-cols-2 gap-2">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" maxLength={80} />
            <Input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State (optional)" maxLength={60} />
          </div>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (optional)" maxLength={60} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy? 'Saving…' : 'Save and continue'}
          </Button>
          <Button type="button" variant="ghost" disabled={busy} className="w-full" onClick={() => setOpen(false)}>
            Skip for now
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
