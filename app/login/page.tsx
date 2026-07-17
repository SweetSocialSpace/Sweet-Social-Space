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

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setMsg('Signing in...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMsg(error.message)
    } else {
      router.push('/feed')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-10">
      <div className="max-w- w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">

        {/* LEFT - SEO curiosity description - this was missing */}
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            Your Neighborhood.<br/>Your Voice.<br/>Your Space.
          </h1>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-semibold drop-shadow">
            Sweet Social Space is a neighborhood-first community platform.
            Own your code, own your speech. No algorithms, no shadowbans,
            no Big Tech filters. Just real neighbors within 10-20 miles of 95122
            sharing alerts, free stuff, faith, and what's actually happening near you.
          </p>
          <p className="mt-4 text-base text-white/70">
            Chronological feed. Speak Freely vent wall. Local alerts, marketplace,
            business directory, and emergency updates. Built for San Jose, built for you.
            Speak Freely. Love your neighbor. Ask yourself What would Jesus do?
          </p>
        </div>

        {/* RIGHT - login only, NO magic link */}
        className="w-full max-w-md bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          <h2 className="text-3xl font-black text-white text-center mb-2">Welcome Back</h2>
          <p className="text-white/60 text-center text-sm mb-6">Sweet Social Space - San Jose</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded-xl bg-white text-black font-semibold"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 rounded-xl bg-white text-black font-semibold"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-full">SIGN IN</button>
          </form>

          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg">{msg}</p>}

          <p className="mt-6 text-center text-sm text-white/60">
            No account? <Link href="/signup" className="text-white font-bold underline">Sign up</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
