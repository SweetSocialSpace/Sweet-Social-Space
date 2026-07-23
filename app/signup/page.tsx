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
    <div className="min-h-screen relative overflow-hidden bg-[#1a1207]">
      {/* SAME BACKDROP AS YOUR LOGIN - Picture 1 */}
      <div className="absolute inset-0 z-0">
        <img src="/sweet-bg.png" alt="" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT: HOOK - from picture 2, but on top of golden backdrop from picture 1 */}
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] drop-shadow-2xl">
              Your<br />Block Is<br />
              <span className="text-amber-400">Talking<br />Without You.</span>
            </h1>
            <p className="text-lg text-white/90 max-w-sm leading-relaxed drop-shadow-lg">
              Inside: What's actually happening within 5 miles of you. Live. Real. No algorithm.
            </p>
            <p className="text-sm font-black text-amber-400">
              See what you missed. Enter your block.
            </p>
          </div>

          {/* RIGHT: SAME CARD STYLE AS LOGIN */}
          <div className="w-full lg:w-">
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
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
                <Link href="/login" className="text-xs text-white/60 hover:text-amber-400">
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
