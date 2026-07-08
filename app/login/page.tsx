'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [address, setAddress] = useState('')
  const [zipCode, setZipCode] = useState('95122')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = supabaseBrowser()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset email sent! Check your inbox.')
      }
      setLoading(false)
      return
    }

    if (isSignUp) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            id: authData.user.id, 
            username, 
            display_name: displayName || username,
            email,
            address, 
            zip_code: zipCode,
            city: 'San Jose, CA',
            bio
          })
        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }
      }
      setMessage('Account created! You can now sign in.')
      setIsSignUp(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
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
      
      <h2>{isReset ? 'Reset Password' : isSignUp ? 'Create Your Account' : 'Sign In'}</h2>
      
      <form onSubmit={handleAuth}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
        />
        
        {!isReset && (
          <input
            type="password" placeholder="Password (min 6 characters)" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
          />
        )}
        
        {isSignUp && !isReset && (
          <>
            <input type="text" placeholder="Username – unique, no spaces" value={username}
              onChange={(e) => setUsername(e.target.value)} required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <input type="text" placeholder="Display Name – how neighbors see you" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <input type="text" placeholder="Street Address" value={address}
              onChange={(e) => setAddress(e.target.value)} required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <input type="text" placeholder="Zip Code" value={zipCode}
              onChange={(e) => setZipCode(e.target.value)} required
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8 }}
            />
            <textarea placeholder="About Me – optional" value={bio}
              onChange={(e) => setBio(e.target.value)} rows={3}
              style={{ width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ccc', borderRadius: 8, fontFamily: 'inherit' }}
            />
          </>
        )}
        
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        {message && <p style={{ color: 'green', fontSize: 14 }}>{message}</p>}
        
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 14, margin: '12px 0', background: '#007aff', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Loading...' : isReset ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        {!isReset && (
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', padding: 8 }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        )}
        
        {!isSignUp && (
          <button onClick={() => { setIsReset(!isReset); setError(''); setMessage(''); }}
            style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', padding: 8, display: 'block', width: '100%' }}
          >
            {isReset ? 'Back to Sign In' : 'Forgot Password?'}
          </button>
        )}
      </div>
    </div>
  )
}
