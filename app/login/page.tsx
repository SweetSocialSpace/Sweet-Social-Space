'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations, tFormat } from '@/lib/translations'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const t = useTranslations() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(t?.auth?.login?.signingIn || 'Signing you in...')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setMsg(error.message); return }
      router.push('/feed')
      router.refresh()
    } catch (err:any) { setMsg(err.message || t?.auth?.login?.errorGeneric || 'Login failed') }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')` }} />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            {t?.auth?.marketing?.title || t?.auth?.login?.marketingTitle || 'Facebook shows you the world. We show you your area.'}
            <br/>
            {t?.auth?.marketing?.subtitle2 || 'We show you your Neighborhood.'}
          </h1>
          <p className="mt-6 text-lg text-white/90 leading-relaxed font-semibold drop-shadow">
            {t?.auth?.marketing?.feature1 || t?.auth?.login?.marketingDesc1 || 'Your neighbor has a free couch. Another needs a job.'}
          </p>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            {tFormat(
              t?.auth?.marketing?.description || t?.auth?.login?.marketingDesc2, 
              { radius: '5,10,15,20' }
            ) || `Sweet Social Space is personalized to your area within 5,10,15,20 miles of YOU`}
          </p>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">
            {t?.auth?.marketing?.tagline || t?.auth?.login?.tagline || 'Speak Freely. Love Your Neighbor.'}
          </p>
        </div>
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center">{t?.auth?.login?.title || 'Welcome Home, Neighbor.'}</h2>
          <p className="text-white/80 text-center text-sm mb-6 mt-2 font-semibold">{t?.auth?.login?.subtitle || 'Your Neighbors missed you.'}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t?.auth?.login?.emailLabel || t?.auth?.emailPlaceholder || 'Your email address'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t?.auth?.login?.passwordLabel || t?.auth?.passwordPlaceholder || 'Your password'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-full">
              {t?.auth?.login?.signInButton || 'SIGN IN — See Your Neighborhood !'}
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg break-words">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">
            {t?.auth?.login?.noAccount || 'No account?'} <Link href="/signup" className="text-white font-bold underline">{t?.auth?.login?.signUpLink || 'Join your Neighbors — free'}</Link>
          </p>
          <div className="text-white/20 uppercase tracking-widest text-center mt-4 text-sm">{t?.auth?.login?.privacy || 'WE care about your privacy • FAILSAFE'}</div>
        </div>
      </div>
    </div>
  )
}
