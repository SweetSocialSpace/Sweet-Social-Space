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

    // FIXED: Keep spaces! No more crushing together
    const cleanUsername = profile.username.trim().toLowerCase()
    const cleanDisplayName = profile.display_name.trim() // KEEPS SPACES like "Harry S Sweet"

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
      setTimeout(()=> router.push('/feed'), 800)
    }
    setSaving(false)
  }

  const title = profile.display_name || 'Your Profile'

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center px-12 py-12 gap-10">
      <div className="hidden xl:block w- shrink-0">
        <div className="sticky top-24 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h- flex items-center justify-center">
          <span className="text-white/20 text-xs">Your Photos</span>
        </div>
      </div>

      <div className="w-full max-w- bg-black/60 backdrop-blur-2xl rounded- border border-white/10 shadow-2xl flex flex-col max-h- overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b border-white/5 shrink-0">
          <button onClick={()=>router.push('/feed')} className="text- font-bold px-2 py-1 rounded-full bg-white/10 text-white/60">← Feed</button>
          <h1 className="text- font-black text-white truncate">{title}</h1>
          <div className="w-"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          <div>
            <label className="text- text-white font-bold px-1">Your Name (public) • What neighbors see</label>
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} placeholder="Harry S Sweet" className="w-full bg-white/15 border border-white/20 rounded-lg p-2.5 text- font-bold text-white placeholder:text-white/30 focus:outline-none focus:bg-white/20" />
            <p className="text- text-white/30 px-1 mt-0.5">Keeps spaces - type exactly how you want it shown</p>
          </div>

          <div>
            <label className="text- text-white/30 px-1">Username (private - not shown)</label>
            <input value={profile.username} onChange={e=>setProfile({...profile, username:e.target.value})} placeholder="harry95122" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text- text-white/60 placeholder:text-white/20 focus:outline-none" />
          </div>

          <div>
            <label className="text- text-white/30 px-1">Bio - public</label>
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 h-12 text- text-white resize-none focus:outline-none" placeholder="Owner and creator" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} placeholder="Zip" className="bg-white/5 border border-white/10 rounded-lg p-2 text- text-white" />
            <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} placeholder="Cross street" className="bg-white/5 border border-white/10 rounded-lg p-2 text- text-white" />
          </div>
          <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} placeholder="Private address - never shown" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text- text-white/50" />
        </div>

        <div className="p-2.5 border-t border-white/5 shrink-0">
          {msg && <p className="text- text-center mb-1.5 text-white/60">{msg}</p>}
          <div className="flex gap-1.5">
            <button onClick={()=>router.push('/feed')} className="flex-1 bg-white/10 py-1.5 rounded-lg text- font-bold text-white">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] bg-blue-600 py-1.5 rounded-lg text- font-black text-white">{saving?'SAVING...':'SAVE & GO TO FEED'}</button>
          </div>
        </div>
      </div>

      <div className="hidden xl:block w- shrink-0">
        <div className="sticky top-24 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h- flex items-center justify-center">
          <span className="text-white/20 text-xs">Extra Content</span>
        </div>
      </div>
    </div>
  )
}
