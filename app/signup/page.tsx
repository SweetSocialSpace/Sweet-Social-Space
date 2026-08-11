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
  const [radius, setRadius] = useState('5')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // AUTO-FILL city/country from internet via zip - GLOBAL automation
  const lookupZip = async (zipValue: string) => {
    if (!zipValue || zipValue.length < 3) return
    try {
      const res = await fetch(`/api/zips?zip=${zipValue.trim()}`, { cache: 'no-store' }).then(r=>r.json())
      if (res?.city && res.city !== 'your area') setCity(res.city)
      if (res?.state || res?.country) setCountry(res.country || res.state || country)
    } catch {}
  }

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
            country: country.trim(),
            radius_mi: radius,
            lat: null, // will be filled by /api/zips on backend
            lon: null
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      
      if (error) throw error

      if (!data.session) {
        setMsg('Account created! Check your email to confirm, then sign in. Check spam folder too.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      setMsg('Account created! Taking you to your area feed...')
      router.push('/feed')
      router.refresh()

    } catch (err: any) {
      setMsg(err.message || 'Signup failed. Check console (F12).')
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
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">Facebook shows you the world.<br/>We show you your area.</h1>
          <p className="mt-6 text-lg text-white/90 font-semibold">Your neighbor has a free couch. Another needs a job. Someone nearby just posted an update.</p>
         <p className="mt-4 text-base text-white/70">Sweet Social Space is personalized to your area within {radius} miles of YOU — wherever you are in the world. Local feed, local focus.</p>
          <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4">
            <p className="text-sm font-bold text-white">📍 Why we need your location:</p>
            <ul className="text-sm text-white/80 mt-2 space-y-1">
              <li>• Show you posts from your actual neighborhood</li>
              <li>• Give you accurate local weather & alerts</li>
              <li>• Connect you with nearby events & businesses</li>
              <li>• Keep your community safe and relevant</li>
            </ul>
          </div>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">Speak Freely. Love Your Neighbor.</p>
        </div>
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center mb-4">Join Your Area</h2>
          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs font-black tracking-widest text-white/50 mb-2 uppercase">Where are you? (Required — Global)</p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-3">
                <p className="text-xs text-blue-200 font-semibold">🔒 Your Privacy Protected</p>
                <p className="text-xs text-white/70 mt-1">We use your zip code (not GPS tracking) to show you posts, weather, and alerts near you. Your exact address is never shared.</p>
              </div>
              <input type="text" value={zip} onChange={e=>{setZip(e.target.value); lookupZip(e.target.value)}} onBlur={e=>lookupZip(e.target.value)} placeholder="Zip / Postal Code *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="City *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
                <input type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country *" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              </div>
              <div className="mt-3">
                <label className="text-xs font-black tracking-widest text-white/50 uppercase">Feed radius</label>
                <select value={radius} onChange={e=>setRadius(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-white text-black font-semibold">
                  <option value="5">5 miles</option>
                  <option value="10">10 miles</option>
                  <option value="15">15 miles</option>
                  <option value="20">20 miles</option>
                </select>
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-3 rounded-full mt-2">
              {loading ? 'Creating...' : 'Sign up — See Your Area Feed'}
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg break-words">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">Already have an account? <Link href="/login" className="text-white font-bold underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
