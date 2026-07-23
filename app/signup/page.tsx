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
      if (event === 'SIGNED_IN' && session) router.push('/feed')
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="min-h-screen relative bg-[#0d0a06] overflow-hidden">
      {/* PERSISTENT GOLDEN TEARDROP BACKDROP - your asset */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/sweet-bg.png')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT: HOOK ONLY */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[0.9]">
              Your Block Is<br />
              <span className="text-amber-400">Talking Without You.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Inside: What's actually happening within 5 miles of you. Live. Real. No algorithm.
            </p>
            <p className="text-sm text-amber-400 font-bold">
              See what you missed. Enter your block.
            </p>
          </div>

          {/* RIGHT: SIGNUP - no lecture */}
          <div className="w-full lg:w-">
            <div className="bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-8">
              <h2 className="text-xl font-black text-white text-center mb-6">Create your account</h2>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: { brand: '#f59e0b', brandAccent: '#d97706', inputBackground: 'white', inputText: 'black' },
                      radii: { borderRadiusButton: '9999px', inputBorderRadius: '12px' }
                    }
                  },
                  style: { anchor: { display: 'none' }, button: { fontWeight: '900' } }
                }}
                providers={[]}
                view="sign_up"
                showLinks={false}
              />
              <div className="text-center mt-6">
                <Link href="/login" className="text-xs text-white/50 hover:text-amber-400">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
