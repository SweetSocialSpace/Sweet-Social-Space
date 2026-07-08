'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isRecovery, setIsRecovery] = useState(false)
  const router = useRouter()
  const supabase = supabaseBrowser()

  useEffect(() => {
    // Check if this is a password recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      }
    })
    
    // Also check URL hash for recovery tokens
    if (window.location.hash.includes('type=recovery')) {
      setIsRecovery(true)
    }

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated! You can now log in with your new password.')
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  if (!isRecovery) {
    return (
      <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, fontFamily: 'system-ui', textAlign: 'center' }}>
        <h2>Invalid Reset Link</h2>
        <p>This page only works from a password reset email link.</p>
        <button onClick={() => router.push('/login')}
          style={{ padding: 12, background: '#007aff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h2>Set Your New Password</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>You're resetting your password. Enter a new one below.</p>
      <form onSubmit={handleUpdate}>
        <input
          type="password" 
          placeholder="New password (min 6 chars)" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required
          style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
        />
        {message && <p style={{ color: message.includes('updated') ? 'green' : 'red', fontSize: 14 }}>{message}</p>}
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 14, margin: '12px 0', background: '#007aff', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600 }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
