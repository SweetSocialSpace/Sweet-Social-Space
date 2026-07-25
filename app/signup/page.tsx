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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // FORCED — global — no empty profiles
    if (!displayName ||!zip ||!city ||!country) {
      setMsg('We need your block — Name, Zip/Postal, City, Country required so we show neighbors within 10 miles of YOU, wherever in world you are.')
      return
    }

    setMsg('Creating account...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          zip_code: zip,
          city: city,
          country: country
        }
      }
    })

    if (error) {
      setMsg(error.message)
      return
    }

    // Create profile with THEIR zip — not 95122 — whatever they typed is truth global
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        id: data.user.id,
        display_name: displayName,
        zip_code: zip, // GLOBAL — SW1A 0AA or 400001 or 95122 — their truth
        city: city,
        country: country,
        email: email
      })

      if (profileError) {
        // Try alternate schema if user_id fails
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          zip_code: zip,
          city: city,
          country: country,
          email: email
        })
      }
    }

    setMsg('Account created! Check email to confirm, then sign in.')
    setTimeout(() => router.push('/login'), 1500)
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')` }} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            Facebook shows you the world.<br/>We show you your block.
          </h1>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-semibold drop-shadow">
            Your neighbor has a free couch. Another needs a job. Someone 3 houses down just posted an alert. You missed it scrolling people 3,000 miles away.
          </p>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            Sweet Social Space is private to neighbors within 10 miles of YOU — wherever you are in the world. No robots deciding what you see. No shadowbans for your faith. Just real neighbors, right now.
          </p>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">
            Speak Freely. Love Your Neighbor.
          </p>
        </div>

        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center">Join Your Block</h2>
          <p className="text-white/60 text-center text-sm mb-6 mt-2">Takes 10 seconds. Free forever.</p>
          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />

            <div className="pt-2 border-t border-white/10">
              <p className="text- font-black tracking-widest text-white/50 mb-2 uppercase">Where is your block? (Required — Global)</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={zip} onChange={e=>setZip(e.target.value)} placeholder="Zip / Postal — e.g. 95122 or SW1A 0AA or 400001" className="w-full p-3 rounded-xl bg-white text-black font-semibold col-span-2" required />
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="City — e.g. San Jose" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
                <input type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country — e.g. USA or UK" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-full mt-2">
              Sign up — See Your Block
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account? <Link href="/login" className="text-white font-bold underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
