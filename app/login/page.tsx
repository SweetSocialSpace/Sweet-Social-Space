'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left side: Description - shows on desktop, stacks on mobile */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Sweet Social Space
          </h1>
          <p className="text-xl text-gray-600">
            Speak Freely. Love your neighbor.
          </p>
          <div className="text-gray-700 space-y-3 max-w-md mx-auto lg:mx-0">
            <p>
              A place for real conversation without the censorship or hate. 
            </p>
            <p>
              Share your thoughts, connect with others, and be part of a community 
              built on respect and open dialogue. And a place that allows you to have your First Amendment rights.
            </p>
            <p className="text-sm text-gray-500">
              We never sell your data. No algorithms deciding what you see.
            </p>
          </div>
        </div>

        {/* Right side: Login box - stays centered */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Log in to your account</h2>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="text-center text-sm space-y-2">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Footer - add this whole block */}
    <footer className="w-full py-6 text-center text-sm text-gray-500 border-t mt-12">
      <div className="space-x-4">
        <span>© 2026 Sweet Social Space</span>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/about" className="hover:underline">About</Link>
      </div>
    </footer>
  </div>
  )
}
