'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [zipCode, setZipCode] = useState('95122')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // SIGN UP FLOW
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username, zip_code: zipCode } // Store in auth.users metadata
        }
      })
      
      if (error) {
        setMessage(error.message)
      } else {
        // Create profile row immediately after signup
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: username,
            zip_code: zipCode
          })
        }
        setMessage('Check your email for the confirmation link!')
      }
    } else {
      // SIGN IN FLOW
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setMessage(error.message)
      } else {
        router.push('/')
      }
    }
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-md mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Sweet Social Space</h1>
      <p className="text-center mb-8 text-gray-600">Talk to your neighbors in San Jose</p>
      
      <div className="border rounded p-6">
        <div className="flex mb-6 border-b">
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 pb-2 ${!isSignUp ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 pb-2 ${isSignUp ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mb-3"
          />
          
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2 border rounded mb-3"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="w-full p-2 border rounded mb-3"
              />
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </div>
    </main>
  )
}
