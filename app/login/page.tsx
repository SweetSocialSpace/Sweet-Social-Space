"use client"
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = supabaseBrowser()
  const send = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    })
    if (error) alert(error.message); else setSent(true)
  }
  return (
    <div className="card max-w-md">
      <h1 className="text-xl font-bold mb-2">Sign in to Sweet Social Space</h1>
      {sent ? <p>Check your email for a magic link.</p> : <>
        <input className="input mb-2" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn" onClick={send}>Send magic link</button>
      </>}
    </div>
  )
}
