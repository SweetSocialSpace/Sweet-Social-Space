'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/feed')
    } 
    
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` }
      })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    }

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/update-password`,
      })
      if (error) setMessage(error.message)
      else setMessage('Password reset email sent!')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sweet Social Space</h1>
        <p className="text-center text-gray-600 mb-6">Speak Freely. Love your neighbor.</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          
          {mode !== 'reset' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 
             mode === 'login' ? 'Log In' : 
             mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <div className="mt-6 text-center text-sm space-y-2">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('signup')} className="text-gray-600 hover:underline block w-full">
                Need an account? Sign Up
              </button>
              <button onClick={() => setMode('reset')} className="text-gray-600 hover:underline block w-full">
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('login')} className="text-gray-600 hover:underline">
              Already have an account? Log In
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="text-gray-600 hover:underline">
              Back to Log In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
