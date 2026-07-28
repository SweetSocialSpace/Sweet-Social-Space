'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocation } from '@/lib/location-context'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const { zip, city } = useLocation()
  
  // GLOBAL VERTEBRAE - never show hardwired 95122 to guests
  const isRealZip = zip && zip !== '' && zip.toUpperCase() !== 'YOUR BLOCK' && zip !== 'GLOBAL' && /^\d{5}$/.test(zip)
  const displayZip = isRealZip ? zip : 'your block'
  const displayCity = city && city !== '' ? city : 'your neighborhood'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(`Signing you in to ${displayZip}...`)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setMsg(error.message); return }
      if (data?.user) {
        try {
          if (isRealZip) {
            await supabase.from('profiles').update({ 
              zip_code: zip, 
              zip: zip, 
              city: city || '' 
            } as any).eq('id', data.user.id)
          }
        } catch {}
      }
      router.push('/feed')
    } catch (err:any) { setMsg(err.message || 'Login failed') }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')` }} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            Facebook shows you the world.<br/>We show you {displayZip === 'your block' ? 'your block' : `your block in ${displayZip}`}.
          </h1>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-semibold drop-shadow">
            Your neighbor in {displayCity} has a free couch. Another needs a job. Someone 3 houses down just posted an alert. You missed it scrolling people 3,000 miles away.
          </p>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            Sweet Social Space is private to neighbors within 10 miles of YOU — wherever you are in the world — GLOBAL • LIVE. No robots deciding what you see. No shadowbans for your faith. Just real neighbors, right now.
          </p>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">
            Speak Freely. Love Your Neighbor. • GLOBAL • VERTEBRAE • Independent
          </p>
        </div>

        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center">Welcome Home, Neighbor.</h2>
          <p className="text-white/80 text-center text-sm mb-6 mt-2 font-semibold">
            {isRealZip ? `Your block in ${displayZip} missed you.` : 'Your block missed you.'} {displayCity !== 'your neighborhood' ? `${displayCity} •` : ''} GLOBAL • LIVE
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full">
              SIGN IN — See Your Block {isRealZip ? `in ${displayZip}` : ''}
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">
            No account? <Link href="/signup" className="text-white font-bold underline">Join your block {isRealZip ? `in ${displayZip}` : ''} — free • GLOBAL</Link>
          </p>
          <div className="text-white/20 uppercase tracking-widest text-center mt-4 text-sm">GLOBAL • {isRealZip ? `${displayZip} • ${displayCity} •` : ''} VERTEBRAE • FAILSAFE</div>
        </div>
      </div>
    </div>
  )
}
