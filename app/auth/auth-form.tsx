'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/lib/location-context'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { zip, city, country } = useLocation()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const safeZip = (zip && zip.toUpperCase()!=='YOUR BLOCK' && zip.trim()!=='' )? zip : 'GLOBAL'
      const safeCity = city || ''

      const { data, error } = isSignUp
       ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: { zip_code: safeZip, zip: safeZip, city: safeCity, country: country || 'US' }
            }
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password })

      if (error) throw error

      if (isSignUp && data?.user) {
        try {
          let finalZip = safeZip
          let finalCity = safeCity
          if (safeZip === 'GLOBAL') {
            try {
              const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
              if (ip?.postal) { finalZip = ip.postal; finalCity = ip.city || '' }
            } catch {}
          }
          // GLOBAL FIX: no 95122 hardcoat - save what we have - GLOBAL allowed
          await supabase.from('profiles').upsert({
            id: data.user.id,
            user_id: data.user.id,
            zip_code: finalZip,
            zip: finalZip,
            city: finalCity,
            country: country || 'US',
            email: email.trim()
          } as any, { onConflict: 'id' })
        } catch {}
      }

      router.push('/feed')
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="text-white/30 text- uppercase tracking-widest text-center">GLOBAL • {zip} • {city} • Auto-detected • Vertebrae</div>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700" required />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">{loading? 'Loading...' : isSignUp? `Sign Up in ${zip}` : 'Sign In'}</button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-gray-400 text-sm hover:text-white">{isSignUp? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</button>
    </form>
  )
}
