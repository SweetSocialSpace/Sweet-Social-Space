'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/feed')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white"> {/* ← Changed: was bg-gray-500 */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md"> {/* ← Matches signup card */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sweet Social Space</h1>
          <p className="text-gray-600 mt-2">Speak Freely. Love your neighbor.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your password"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md disabled:opacity-50" 
            {/* ↑ Changed: was bg-black, now bg-green-500 like signup */}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center text-sm space-y-2">
          <Link href="/signup" className="text-blue-600 hover:underline">
            Need an account? Sign Up
          </Link>
          <br />
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By logging in, you agree to our Terms of Service and Privacy Policy. We never sell your data.
        </p>
      </div>
    </div>
  )
}
