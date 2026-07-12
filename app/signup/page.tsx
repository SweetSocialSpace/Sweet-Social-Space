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
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left side: Description */}
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

          {/* Right side: Signup box */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-white p-8 rounded-lg shadow-md w-full">
              <h2 className="text-2xl font-bold mb-6 text-center">Create your account</h2>
              
              <Auth
                supabaseClient={supabase}
                appearance={{ 
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#10b981',
                        brandAccent: '#059669'
                      }
                    }
                  },
                  style: { anchor: { display: 'none' } }
                }}
                providers={[]}
                view="sign_up"
                showLinks={false}
              />
              
              <div className="text-center text-sm mt-4">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy. 
                We never sell your data.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-6 text-center text-sm text-gray-500 border-t">
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
