'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUp() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/feed')
      }
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Join Sweet Social Space</h1>
        
        {/* Auth component is isolated in its own div */}
        <div>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: { anchor: { display: 'none' } }
            }}
            providers={[]}
            view="sign_up"
            showLinks={false}
          />
        </div>
        
        {/* REAL LINKS - outside the Auth wrapper so clicks work */}
        <div className="text-center text-sm mt-4 space-y-2">
          <Link href="/login" className="block text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
          <Link href="/forgot-password" className="block text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy. We never sell your data.
        </p>
      </div>
    </div>
  )
}
