'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage(){
  const supabase = createClient()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [profile, setProfile] = useState({
    display_name: 'Sweet Social Space',
    bio: 'Owner and creator',
    zip: '95122',
    cross_street: 'Quimby rd',
    private_address: '1722 Quimby Road/private',
    interests: ''
  })

  const handleSave = async() => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setMsg('Not logged in'); setSaving(false); return }
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
     ...profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    setMsg(error? 'Error: '+error.message : 'Saved!')
    setSaving(false)
    setTimeout(()=>setMsg(''), 2000)
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center px-4 py-8 gap-6">

      {/* LEFT SIDE RAIL - for pictures / extra content - shows on desktop */}
      <div className="hidden lg:block w- shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 h-48 flex items-center justify-center">
            <span className="text-white/30 text-xs">Your Photos</span>
          </div>
        </div>
      </div>

      {/* CENTERED PROFILE BOX - shrunk and contained */}
      <div className="w-full max-w- bg-black/40 backdrop-blur-xl rounded- border border-white/10 shadow-2xl flex flex-col max-h- overflow-hidden">
        <div className="p-5 pb-3 shrink-0 border-b border-white/5">
          <h1 className="text-lg font-black text-white">Your Subscriber Profile</h1>
          <p className="text-white/50 text- mt-1">This is what neighbors in {profile.zip} see about you</p>
          <div className="flex gap-1.5 mt-3">
            <button onClick={()=>setTab('home')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='home'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Home</button>
            <button onClick={()=>setTab('listings')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='listings'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Listings</button>
            <button onClick={()=>setTab('posts')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='posts'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Posts</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:bg-white/10 focus:outline-none" />
          <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-16 text-sm text-white focus:bg-white/10 focus:outline-none resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
            <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
          </div>
          <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
          <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} placeholder="Interests, skills..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-20 text-sm text-white placeholder:text-white/30 focus:bg-white/10 focus:outline-none resize-none" />
        </div>

        <div className="p-4 shrink-0 border-t border-white/5">
          {msg && <p className="text- text-center mb-2 text-white/60">{msg}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600/90 py-2.5 rounded-xl font-black text-white text-sm">{saving?'SAVING...':'SAVE PROFILE'}</button>
        </div>
      </div>

      {/* RIGHT SIDE RAIL - for pictures / extra content */}
      <div className="hidden lg:block w- shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 h-48 flex items-center justify-center">
            <span className="text-white/30 text-xs">Extra Content</span>
          </div>
        </div>
      </div>

    </div>
  )
}
