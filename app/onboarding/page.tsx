'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/lib/location-context'

export default function Onboarding() {
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { zip: detectedZip, city, country } = useLocation()

  useEffect(() => {
    if (detectedZip && detectedZip.toUpperCase()!=='YOUR BLOCK' && detectedZip.trim()!=='' &&!zip) {
      setZip(detectedZip)
    }
  }, [detectedZip])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (parseInt(age) < 13) { setError('Sweet Social Space is 13+ only.'); setLoading(false); return }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not signed in'); setLoading(false); return }

      let safeZip = (zip && zip.toUpperCase()!=='YOUR BLOCK' && zip.trim()!==''? zip.trim() : detectedZip)
      if (!safeZip || safeZip.toUpperCase()==='YOUR BLOCK' || safeZip==='') safeZip = 'GLOBAL'

      let finalCity = city || ''
      if (safeZip === 'GLOBAL') {
        try {
          const ip = await fetch('https://ipapi.co/json/').then(r=>r.json()).catch(()=>null)
          if (ip?.postal) { safeZip = ip.postal; finalCity = ip.city || finalCity }
        } catch {}
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        user_id: user.id,
        username: username.trim(),
        age: parseInt(age),
        zip_code: safeZip,
        zip: safeZip,
        city: finalCity,
        country: country || 'US',
        body: `${username} - ${safeZip} ${finalCity}`,
        email: user.email || ''
      } as any, { onConflict: 'id' })

      if (error) { setError(error.message); setLoading(false); return }
      router.push('/feed')
    } catch (err:any) {
      setError(err.message || 'Failed to join')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      <form onSubmit={handleSubmit} className="relative bg-white/[0.08] backdrop-blur-2xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/15">
        <h1 className="text-2xl font-black text-white mb-2">Welcome to Sweet Social Space</h1>
        <p className="text-white/60 mb-6">Let’s get you set up with your neighbors in <span className="text-white font-bold">{city || 'your area'}</span></p>
        <input className="w-full p-3 border border-white/20 rounded-xl mb-4 bg-black text-white" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className="w-full p-3 border border-white/20 rounded-xl mb-4 bg-black text-white" placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
        <input className="w-full p-3 border border-white/20 rounded-xl mb-6 bg-black text-white font-bold" placeholder={detectedZip? `ZIP - ${detectedZip}` : 'ZIP Code'} value={zip} onChange={(e) => setZip(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full font-black disabled:opacity-50">{loading? 'Joining...' : 'Join Your Neighborhood'}</button>
        {error && <p className="text-red-400 mt-4 bg-red-900/20 p-2 rounded">{error}</p>}
      </form>
    </div>
  )
}
