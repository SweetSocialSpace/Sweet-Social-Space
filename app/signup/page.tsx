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
  const [msg, setMsg] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('Creating account...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else router.push('/login')
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" 
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        
        {/* THIS IS THE NEW GLOBAL COPY */}
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
          
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-full">
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
