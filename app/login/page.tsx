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
      setMsg('Success! Going to feed...')
      router.push('/feed')
      router.refresh()
    }
  }

  const handleMagicLink = async () => {
    if (!email) { setMsg('Enter your email first'); return }
    setMsg('Sending magic link...')
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: `${window.location.origin}/feed` } 
    })
    if (error) setMsg(error.message)
    else setMsg('Check your email for the magic link!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-8">
        <h1 className="text-3xl font-black text-white text-center mb-2">Welcome Back</h1>
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

        <button onClick={handleMagicLink} className="w-full mt-3 bg-white text-black font-black py-3 rounded-full">SEND MAGIC LINK</button>
        
        {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg">{msg}</p>}

        <p className="mt-6 text-center text-sm text-white/60">
          No account? <Link href="/signup" className="text-white font-bold underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
