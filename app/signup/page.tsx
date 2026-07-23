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
        const { data: profile } = await supabase.from('profiles').select('zip_code, display_name').eq('id', session.user.id).single()
        if (!profile || !profile.zip_code || !profile.display_name) {
          router.push('/profile?required=1')
        } else {
          router.push('/feed')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0d0a06]">
      {/* PERSISTENT BACKDROP - Same as login and feed */}
      <div className="absolute inset-0 z-0">
        {/* Use your actual asset from /public - this is the golden teardrop hearts */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('/sweet-bg.png')`, // <-- PUT YOUR GOLDEN TEARDROP IMAGE HERE in /public folder
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Fallback if image not found - subtle amber glow, not brown blob */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-black/80 to-black"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
              Make This Block<br />
              <span className="text-amber-400">Your Home.</span>
            </h1>
            <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 text-left space-y-4">
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
                    {/* FIXED: No more 95122 - now global neutral */}
                    <span className="text-white/50"> — Unlock garage sales 5 blocks away, free couches, faith posts you care about. Your location stays private — we only show "Near your area".</span>
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

          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl w-full">
              <h2 className="text-2xl font-black text-white mb-2 text-center">Create your account</h2>
              <p className="text-white/60 text-xs text-center mb-6">Step 1 of 2 — Then make your profile your home</p>
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
                  style: { anchor: { display: 'none' }, button: { fontWeight: '900', padding: '12px' } }
                }}
                providers={[]}
                view="sign_up"
                showLinks={false}
              />
              <div className="text-center text-sm mt-6">
                <Link href="/login" className="text-amber-400 hover:text-amber-300 font-bold">Already have an account? Sign in →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
