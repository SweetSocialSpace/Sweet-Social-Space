'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = supabaseBrowser()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated! Redirecting...')
      setTimeout(() => router.push('/'), 1500)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h2>Set New Password</h2>
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
