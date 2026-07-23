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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if they have a profile
        const { data: profile } = await supabase.from('profiles').select('zip_code, display_name').eq('id', session.user.id).single()
        if (!profile ||!profile.zip_code ||!profile.display_name) {
          router.push('/profile?required=1')
        } else {
          router.push('/feed')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      {/* Golden honey-drop background - same as login/feed */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-"></div>
        <div className="absolute bottom-20 right-20 w- h- bg-yellow-600/20 rounded-full blur-"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w- h- bg-amber-400/10 rounded-full blur-"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">

          {/* Left side: WHY we need info */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
              Make This Block<br />
              <span className="text-amber-400">Your Home.</span>
            </h1>

            <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 text-left space-y-4">
              <p className="text-white font-black text-sm">The more you give, the better it works:</p>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-amber-400">✓</span>
                  <div>
                    <span className="text-white font-bold">Zip + Radius (Required)</span>
                    <span className="text-white/60"> — Unlocks YOUR feed, YOUR Block Map, YOUR weather. Without it, we show you nothing.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-amber-400">✓</span>
                  <div>
                    <span className="text-white font-bold">Display Name (Required)</span>
                    <span className="text-white/60"> — Neighbors trust real names, not bots.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-white/40">○</span>
                  <div>
                    <span className="text-white/80 font-bold">Cross Streets + Interests (Optional)</span>
                    <span className="text-white/50"> — Unlock garage sales 5 blocks away, free couches, faith posts you care about. Your location stays private — we only show "Near 95122".</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-white/40">
                  We never sell your data. No algorithms. No shadowbans. You control what you share. More info = more accurate block.
                </p>
              </div>
            </div>

            <p className="text-white/60 text-sm">
              Free for neighbors. Own a business? Claim your block for <span className="text-amber-400 font-black">$29/mo</span> — you pick your budget.
            </p>
          </div>

          {/* Right side: Signup box */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-black/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl w-full">
              <h2 className="text-2xl font-black text-white mb-2 text-center">Create your account</h2>
              <p className="text-white/60 text-xs text-center mb-6">Step 1 of 2 — Then make your profile your home</p>

              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#f59e0b',
                        brandAccent: '#d97706',
                        inputBackground: 'white',
                        inputText: 'black',
                      },
                      radii: {
                        borderRadiusButton: '9999px',
                        inputBorderRadius: '12px',
                      }
                    }
                  },
                  style: {
                    anchor: { display: 'none' },
                    button: { fontWeight: '900', padding: '12px' },
                  }
                }}
                providers={[]}
                view="sign_up"
                showLinks={false}
              />

              <div className="text-center text-sm mt-6">
                <Link href="/login" className="text-amber-400 hover:text-amber-300 font-bold">
                  Already have an account? Sign in →
                </Link>
              </div>

              <p className="text- text-white/30 mt-6 text-center">
                By signing up, you agree to our Terms and Privacy. Speak Freely. Love your neighbor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
