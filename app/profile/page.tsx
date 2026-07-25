'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage(){
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    zip: '95122',
    cross_street: '',
    private_address: '',
    interests: ''
  })

  useEffect(()=>{
    const load = async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if(data) setProfile({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        zip: data.zip || data.zip_code || '95122',
        cross_street: data.cross_street || '',
        private_address: data.private_address || '',
        interests: data.interests || ''
      })
    }
    load()
  },[])

  const handleSave = async() => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setMsg('Not logged in'); setSaving(false); return }
    const cleanUsername = profile.username.trim().toLowerCase()
    const cleanDisplayName = profile.display_name.trim()
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      username: cleanUsername,
      display_name: cleanDisplayName,
      bio: profile.bio,
      zip: profile.zip,
      cross_street: profile.cross_street,
      private_address: profile.private_address,
      interests: profile.interests,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    if(error){ setMsg('Error: '+error.message) } else {
      setMsg('Saved!')
      setTimeout(()=> router.push('/feed'), 600)
    }
    setSaving(false)
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center px-16 py-16 gap-12">
      {/* LEFT - MUCH BIGGER NOW */}
      <div className="hidden xl:block w- shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h- flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 text-sm">Your Photos</span>
            <span className="text-white/20 text-">Bigger photo area now</span>
          </div>
          <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-4 h- flex items-center justify-center">
            <span className="text-white/20 text-xs">More content</span>
          </div>
        </div>
      </div>

      {/* CENTER - TINY NOW */}
      <div className="w-full max-w- bg-black/70 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl flex flex-col max-h- overflow-hidden scale-90">
        <div className="p-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
          <button onClick={()=>router.push('/feed')} className="text- font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/50">← Feed</button>
          <h1 className="text- font-black text-white/90 truncate max-w-">{profile.display_name || 'Profile'}</h1>
          <div className="w-"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5">
          <div>
            <label className="text- text-white/60 font-bold uppercase tracking-wider px-0.5">Your Name (public)</label>
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} placeholder="Sweet Social Space" className="w-full bg-white/10 border border-white/15 rounded-md p-1.5 text- font-bold text-white placeholder:text-white/20 focus:outline-none h-7" />
          </div>

          <div>
            <label className="text- text-white/25 px-0.5">Username (private)</label>
            <input value={profile.username} onChange={e=>setProfile({...profile, username:e.target.value})} placeholder="sweetsocialspace" className="w-full bg-white/[0.03] border border-white/5 rounded-md p-1 text- text-white/40 h-6" />
          </div>

          <div>
            <label className="text- text-white/25 px-0.5">Bio</label>
            <input value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-md p-1 text- text-white h-6" placeholder="Owner and creator" />
          </div>

          <div className="grid grid-cols-2 gap-1">
            <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/[0.03] border border-white/5 rounded-md p-1 text- text-white h-6" placeholder="Zip" />
            <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/[0.03] border border-white/5 rounded-md p-1 text- text-white h-6" placeholder="Cross" />
          </div>
          <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} placeholder="Private address" className="w-full bg-white/[0.03] border border-white/5 rounded-md p-1 text- text-white/30 h-6" />
        </div>

        <div className="p-2 border-t border-white/5 shrink-0 bg-black/20">
          {msg && <p className="text- text-center mb-1 text-white/50">{msg}</p>}
          <div className="flex gap-1">
            <button onClick={()=>router.push('/feed')} className="flex-1 bg-white/5 py-1 rounded-md text- font-bold text-white/60">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] bg-blue-600 py-1 rounded-md text- font-black text-white">{saving?'...':'SAVE'}</button>
          </div>
        </div>
      </div>

      {/* RIGHT - MUCH BIGGER NOW */}
      <div className="hidden xl:block w- shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h- flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 text-sm">Extra Content</span>
            <span className="text-white/20 text-">Bigger content area now</span>
          </div>
          <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-4 h- flex items-center justify-center">
            <span className="text-white/20 text-xs">More content</span>
          </div>
        </div>
      </div>
    </div>
  )
}
