'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('Signing in...')
    // FIXED: was signUpWithPassword, should be signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMsg(error.message)
    } else {
      router.push('/feed')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10 bg-[#0a0a0a]">
      {/* TEARDROP BACKGROUND - GUARANTEED ON BOTH PAGES */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/teardrops-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">

        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            Your Neighborhood.<br/>Your Voice.<br/>Your Space.
          </h1>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-semibold drop-shadow">
            Sweet Social Space is a neighborhood-first community platform.
            Own your code, own your speech. No algorithms, no shadowbans,
            no Big Tech filters. Just real neighbors within 10-20 miles of you
            sharing alerts, free stuff, faith, and what is actually happening near you.
          </p>
          <p className="mt-4 text-base text-white/70">
            Chronological feed. Speak Freely vent wall. Local alerts, marketplace,
            business directory, and emergency updates. Built for your neighborhood, built for you.
            Speak Freely. Love your neighbor. Ask yourself What would Jesus do?
          </p>
        </div>

        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center mb-2">Welcome Back</h2>
          <p className="text-white/60 text-center text-sm mb-6">Sweet Social Space - Your Neighborhood</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-white/80">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="Your email address"
                className="mt-1 w-full p-3 rounded-xl bg-white text-black font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Your password"
                className="mt-1 w-full p-3 rounded-xl bg-white text-black font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full transition">
              SIGN IN
            </button>
          </form>

          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg">{msg}</p>}

          <p className="mt-6 text-center text-sm text-white/60">
            No account? <Link href="/signup" className="text-white font-bold underline">Sign up</Link>
          </p>
          <p className="text-center text- text-white/40 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy. We never sell your data.
          </p>
        </div>

      </div>
    </div>
  )
}
