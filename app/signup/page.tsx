'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async() => {
    const { error } = await supabase.auth.signUp({ email, password })
    if(!error) router.push('/login')
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-black/30 backdrop-blur-xl rounded- border border-white/10 p-6">
        <h1 className="text-2xl font-black text-white mb-6">Join Your Block</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-3 text-white" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 text-white" />
        <button onClick={handleSignup} className="w-full bg-blue-600/80 py-4 rounded-xl font-black text-white">SIGN UP</button>
      </div>
    </div>
  )
}
