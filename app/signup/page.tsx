'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGE_NAMES, useLanguage } from '@/lib/language-context'
import { useTranslations, tFormat } from '@/lib/translations'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const t = useTranslations() as any

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [radius, setRadius] = useState('5')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const lookupZip = async (zipValue: string) => {
    if (!zipValue || zipValue.trim().length < 3) return
    try {
      const res = await fetch(`/api/zips?zip=${encodeURIComponent(zipValue.trim())}`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null)
      if (!res) return
      if (res?.city && res.city !== 'your area') setCity(res.city)
      if (res?.state || res?.country) setCountry(res.country || res.state || country)
    } catch {}
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !zip.trim() || !city.trim() || !country.trim()) {
      setMsg(t?.auth?.errors?.required || t?.auth?.signup?.errorGeneric || 'Name, Zip, City, Country required.')
      return
    }
    setLoading(true)
    setMsg(t?.auth?.signup?.creating || 'Creating account...')

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { 
            display_name: displayName.trim(), 
            username: displayName.trim(), 
            zip_code: zip.trim(), 
            city: city.trim(), 
            country: country.trim(),
            preferred_language: language,
            radius_mi: radius,
            lat: null,
            lon: null
          },
          emailRedirectTo: origin ? `${origin}/login` : undefined
        }
      })
      
      if (error) throw error

      if (!data.session) {
        setMsg(t?.auth?.signup?.checkEmail || 'Account created! Check your email to confirm, then sign in. Check spam folder too.')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      setMsg(t?.auth?.signup?.success || 'Account created! Taking you to your area feed...')
      router.push('/feed')
      router.refresh()

    } catch (err: any) {
      setMsg(err?.message || t?.auth?.signup?.errorGeneric || 'Signup failed. Check console (F12).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/golden_droplet_heart_wallpaper.jpg')` }} />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div className="text-left">
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-xl">
            {t?.auth?.marketing?.title || 'Facebook shows you the world. We show you your area.'}
          </h1>
          <p className="mt-6 text-lg text-white/90 font-semibold">
            {t?.auth?.marketing?.feature1 || 'Your neighbor has a free couch. Another needs a job. Someone nearby just posted an update.'}
          </p>
          <p className="mt-4 text-base text-white/70">
            {tFormat(t?.auth?.marketing?.description || 'Sweet Social Space is personalized to your area within {radius} miles of YOU', { radius }) || `Sweet Social Space is personalized to your area within ${radius} miles of YOU — wherever you are in the world.`}
          </p>
          <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4">
            <p className="text-sm font-bold text-white">📍 {t?.auth?.signup?.whyLocationTitle || 'Why we need your location:'}</p>
            <ul className="text-sm text-white/80 mt-2 space-y-1">
              <li>• {t?.auth?.signup?.why1 || 'Show you posts from your actual neighborhood'}</li>
              <li>• {t?.auth?.signup?.why2 || 'Give you accurate local weather & alerts'}</li>
              <li>• {t?.auth?.signup?.why3 || 'Connect you with nearby events & businesses'}</li>
              <li>• {t?.auth?.signup?.why4 || 'Keep your community safe and relevant'}</li>
            </ul>
          </div>
          <p className="mt-6 text-sm font-bold text-white/50 tracking-widest uppercase">{t?.auth?.marketing?.tagline || 'Speak Freely. Love Your Neighbor.'}</p>
        </div>
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-white text-center mb-4">{t?.auth?.signup?.title || t?.auth?.welcome || 'Join Your Area'}</h2>
          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={t?.auth?.signup?.nameLabel ? `${t.auth.signup.nameLabel} *` : 'Your name *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t?.auth?.signup?.emailLabel ? `${t.auth.signup.emailLabel} *` : 'Your email address *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t?.auth?.signup?.passwordLabel ? `${t.auth.signup.passwordLabel} *` : 'Create a password *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs font-black tracking-widest text-white/50 mb-2 uppercase">{t?.auth?.signup?.locationSection || 'Where are you? (Required)'}</p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-3">
                <p className="text-xs text-blue-200 font-semibold">🔒 {t?.auth?.signup?.privacyTitle || 'Your Privacy Protected'}</p>
                <p className="text-xs text-white/70 mt-1">{t?.auth?.signup?.privacyDesc || 'We use your zip code (not GPS tracking) to show you posts, weather, and alerts near you. Your exact address is never shared.'}</p>
              </div>
              <input type="text" value={zip} onChange={e=>{setZip(e.target.value); lookupZip(e.target.value)}} onBlur={e=>lookupZip(e.target.value)} placeholder={t?.auth?.signup?.zipLabel ? `${t.auth.signup.zipLabel} *` : 'Zip / Postal Code *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="mt-3">
                  <label className="text-xs font-black tracking-widest text-white/50 uppercase">
                    {t?.auth?.languageLabel || 'Preferred language'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      try { setLanguage(e.target.value as any) } catch {}
                    }}
                    className="w-full mt-1 p-3 rounded-xl bg-white text-black font-semibold"
                  >
                    {Object.entries(LANGUAGE_NAMES || {}).map(([code, name]) => (
                      <option key={code} value={code}>{name as string}</option>
                    ))}
                  </select>
                </div>
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder={t?.auth?.signup?.cityLabel ? `${t.auth.signup.cityLabel} *` : 'City *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
                <input type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder={t?.auth?.signup?.countryLabel ? `${t.auth.signup.countryLabel} *` : 'Country *'} className="w-full p-3 rounded-xl bg-white text-black font-semibold" required />
              </div>
              <div className="mt-3">
                <label className="text-xs font-black tracking-widest text-white/50 uppercase">{t?.auth?.feedRadius?.label || 'Feed radius'}</label>
                <select value={radius} onChange={e=>setRadius(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-white text-black font-semibold">
                  <option value="5">{t?.auth?.feedRadius?.['5miles'] || '5 miles'}</option>
                  <option value="10">{t?.auth?.feedRadius?.['10miles'] || '10 miles'}</option>
                  <option value="15">{t?.auth?.feedRadius?.['15miles'] || '15 miles'}</option>
                  <option value="20">{t?.auth?.feedRadius?.['20miles'] || '20 miles'}</option>
                </select>
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-3 rounded-full mt-2">
              {loading ? (t?.auth?.signup?.creating || 'Creating...') : (t?.auth?.signup?.submit || 'Sign up — See Your Area Feed')}
            </button>
          </form>
          {msg && <p className="mt-4 text-center text-sm text-white bg-white/10 p-2 rounded-lg break-words">{msg}</p>}
          <p className="mt-6 text-center text-sm text-white/60">{t?.auth?.signup?.hasAccount || 'Already have an account?'} <Link href="/login" className="text-white font-bold underline">{t?.auth?.signIn || 'Sign in'}</Link></p>
        </div>
      </div>
    </div>
  )
}
