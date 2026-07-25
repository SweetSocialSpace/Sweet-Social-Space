'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !zip.trim() || !city.trim() || !country.trim()) {
      setMsg('Name, Zip, City, Country required.')
      return
    }
    setLoading(true)
    setMsg('Creating account...')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { 
            display_name: displayName.trim(), 
            username: displayName.trim(), 
            zip_code: zip.trim(), 
            city: city.trim(), 
            country: country.trim() 
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      console.log('SUPABASE SIGNUP RESPONSE:', data, error)
      
      if (error) {
        throw error
      }

      // If email confirmation is ON, data.session will be null
      if (!data.session) {
        setMsg('Account created! Check your email to confirm, then sign in. Check spam folder too.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      setMsg('Account created! Taking you to your block...')
      router.push('/')
      router.refresh()

    } catch (err: any) {
      console.error('SIGNUP FAILED:', err)
      setMsg(err.message || 'Signup failed. Check console (F12) for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')` }} />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">Facebook shows you the world.<br/>We show you your block.</h1>
          <p className="mt-6 text-lg text-white/90 font-semibold">Your neighbor has a free couch. Another needs a job. Someone 3 houses down just posted an alert.</p>
          <p className="mt-4 text-base text-white/70">Sweet Social Space is private to neighbors within 10 miles of YOU — wherever you are in the world.</p>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">Speak Freely. Love Your Neighbor.</p>
        </div>
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center mb-4">Join Your Block</h2>
          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs font-black tracking-widest text-white/50 mb-2 uppercase">Where is your block? (Required — Global)</p>
              <input type="text" value={zip} onChange={e=>setZip(e.target.value)} placeholder="Zip / Postal Code *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="City *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
                <input type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-3 rounded-full mt-2">
              {loading ? 'Creating...' : 'Sign up — See Your Block'}
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg break-words">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">Already have an account? <Link href="/login" className="text-white font-bold underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
