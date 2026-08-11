'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/lib/location-context'
import { useLocationScope } from '@/hooks/useLocationScope'
import DeleteAccount from '@/app/components/DeleteAccount'

export default function ProfilePage(){
  const supabase = createClient()
  const router = useRouter()
  const { setLoc } = useLocation()
  const { setManualLocation } = useLocationScope()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    zip: '',
    cross_street: '',
    private_address: '',
    interests: ''
  })

  useEffect(()=>{
    const load = async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      let { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      if (!data) {
        const res = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        data = res.data
      }
      if(data) setProfile({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        zip: data.zip || data.zip_code || '',
        cross_street: data.cross_street || '',
        private_address: data.private_address || '',
        interests: data.interests || ''
      })
    }
    load()
  },[])

  const handleSave = async() => {
    setSaving(true)
    setMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setMsg('Not logged in'); setSaving(false); return }
    if(!profile.zip.trim()){ setMsg('Zip required'); setSaving(false); return }

    const cleanUsername = profile.username.trim().toLowerCase().replace(/\s+/g,'') || `user_${user.id.slice(0,8)}`
    const zipClean = profile.zip.trim()

    let lat: number | null = null
    let lng: number | null = null
    let cityName = ''
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zipClean)}&format=json&limit=1`, {
        headers: { 'Accept': 'application/json' }
      })
      const geoData = await geoRes.json()
      if (geoData && geoData[0]) {
        lat = parseFloat(geoData[0].lat)
        lng = parseFloat(geoData[0].lon)
        cityName = geoData[0].display_name || ''
      }
    } catch {}

    try {
      let { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        id: user.id,
        username: cleanUsername,
        display_name: profile.display_name.trim(),
        bio: profile.bio,
        zip: zipClean,
        zip_code: zipClean,
        cross_street: profile.cross_street,
        private_address: profile.private_address,
        interests: profile.interests,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      if (error && error.message.includes('username_key')) {
        const retry = await supabase.from('profiles').upsert({
          user_id: user.id,
          id: user.id,
          username: `${cleanUsername}_${user.id.slice(0,4)}`,
          display_name: profile.display_name.trim(),
          bio: profile.bio,
          zip: zipClean,
          zip_code: zipClean,
          cross_street: profile.cross_street,
          private_address: profile.private_address,
          interests: profile.interests,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        error = retry.error as any
      }
      if (error) throw error

      if (lat!== null && lng!== null) {
        await supabase.from('profiles').update({
          latitude: lat,
          longitude: lng,
          city: cityName || profile.cross_street || ''
        }).eq('user_id', user.id)
        
        // Update location scope with coordinates for radius-based filtering
        await setManualLocation({ 
          latitude: lat, 
          longitude: lng, 
          location_label: cityName || zipClean 
        })
      }

      setLoc({ zip: zipClean, city: cityName || '', country: '', lat: lat || 0, lng: lng || 0 })
      setMsg('Saved! Taking you to your feed...')
      window.location.href = '/feed'

    } catch (e:any) {
      setMsg('Error: ' + e.message)
      setSaving(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center px-4 py-8 gap-6">
      <div className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-32 flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 text-sm">Your Photos</span>
            <span className="text-white/20 text-xs">Coming soon</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <button onClick={()=> window.location.href='/feed'} className="text-sm font-bold px-3 py-1.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20">← Feed</button>
          <h1 className="text-lg font-black text-white truncate">@{profile.username || 'yourname'} • {profile.zip || 'GLOBAL'}</h1>
          <div className="w-16"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            
            <label className="text-xs text-white font-bold uppercase tracking-wider">Username • Public</label>
            <input value={profile.username} onChange={e=>setProfile({...profile, username:e.target.value})} placeholder="Choose a username" className="w-full bg-white border border-white/20 rounded-xl p-3 text-sm font-black text-black mt-1" />
            <p className="text-xs text-white/40 mt-1">Shown on feed. Be anonymous if you want.</p>
          </div>

          <div>
            <label className="text-xs text-white/40">Real Name • Private</label>
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} placeholder="Your name - private" className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white/80 mt-1" />
            <p className="text-xs text-white/20 mt-1">Only you see this.</p>
          </div>

          <div>
            <label className="text-xs text-white/40">Bio</label>
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white mt-1 h-20 resize-none" placeholder="Tell neighbors about you" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 font-bold">Zip Code • Works Anywhere</label>
              <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="w-full bg-white border border-white/20 rounded-xl p-3 text-sm text-black font-black mt-1" placeholder="ZIP Code" />
              <p className="text-xs text-white/30 mt-1">See content within 5-20 miles of {profile.zip || 'your area'}</p>
            </div>
            <div>
              <label className="text-xs text-white/40">Cross Street</label>
              <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white mt-1" placeholder="Near Main St" />
            </div>
          </div>

          <div>
            <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} placeholder="Private address — never public" className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-white/50" />
          </div>

          <DeleteAccount />
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 bg-black/40">
          {msg && <p className="text-sm text-center mb-3 text-green-300">{msg}</p>}
          <div className="flex gap-3">
            <button onClick={()=> window.location.href='/feed'} className="flex-1 bg-white/10 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] bg-white text-black py-3 rounded-xl text-sm font-black hover:bg-white/90 disabled:opacity-50">{saving?'Saving...':'SAVE'}</button>
          </div>
        </div>
      </div>

      <div className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-32 flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 text-sm">Extra Content</span>
            <span className="text-white/20 text-xs">More soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
