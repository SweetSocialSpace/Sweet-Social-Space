'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [address, setAddress] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { data: authData, error: authError } = await supabaseBrowser.auth.signUp({
        email,
        password,
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      
      if (authData.user) {
        const { error: profileError } = await supabaseBrowser
          .from('profiles')
          .insert({ 
            id: authData.user.id, 
            username, 
            address, 
            zip_code: zipCode,
            bio
          })
        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }
      }
      alert('Account created! You can log in now.')
      setIsSignUp(false)
    } else {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>Sweet Social Space</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>For San Jose neighbors</p>
      
      <h2>{isSignUp ? 'Create Your Account' : 'Sign In'}</h2>
      
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
        />
        
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Username – how neighbors see you"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <input
              type="text"
              placeholder="Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <textarea
              placeholder="About Me – optional: Tell neighbors who you are"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8, fontFamily: 'inherit' }}
            />
          </>
        )}
        
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: 14, margin: '12px 0', background: '#007aff', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600 }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      <button 
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', width: '100%' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}
