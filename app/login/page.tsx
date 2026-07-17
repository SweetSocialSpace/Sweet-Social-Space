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
    <div className="flex items-center justify-center bg-transparent px-4 py-16 min-h- w-full">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">

        {/* Left side: New Curiosity Wording */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            Sweet Social Space
          </h1>
          <p className="text-xl font-semibold text-white/90">
            Speak Freely. Love your neighbor.
          </p>
          <div className="text-white/80 space-y-3 max-w-md mx-auto lg:mx-0">
            <p className="font-bold text-white">
              Tired of being shadowbanned for what you believe?
            </p>
            <p>
              No bots. No algorithms. No one selling your data.
              Just real people having real conversations.
            </p>
            <p className="font-medium text-white/90">
              Faith, family, and free speech are welcome here.
            </p>
          </div>
        </div>

        {/* Right side: Login box */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="p-8 space-y-6 bg-white rounded-lg shadow-md border">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Log in to your account</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="text-center text-sm space-y-2">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
