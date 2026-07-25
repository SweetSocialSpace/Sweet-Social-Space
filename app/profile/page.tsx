'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage(){
  const supabase = createClient()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState({
    display_name: 'Sweet Social Space',
    bio: 'Owner and creator',
    zip: '95122',
    cross_street: 'Quimby rd',
    private_address: '1722 Quimby Road/private',
    interests: ''
  })

  // Load existing profile
  useEffect(()=>{
    const load = async() => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if(data) setProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        zip: data.zip || '95122',
        cross_street: data.cross_street || '',
        private_address: data.private_address || '',
        interests: data.interests || ''
      })
    }
    load()
  },[])

  const handleSave = async() => {
    setSaving(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) { setMessage('Not logged in'); setSaving(false); return }

      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: profile.display_name,
        bio: profile.bio,
        zip: profile.zip,
        cross_street: profile.cross_street,
        private_address: profile.private_address,
        interests: profile.interests,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      if(error) throw error
      setMessage('Profile saved!')
      setTimeout(()=>setMessage(''), 2000)
    } catch(e:any) {
      setMessage('Error: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center items-start pt-10 pb-10 px-4">
      <div className="w-full max-w- bg-black/40 backdrop-blur-xl rounded- border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-">
        <div className="p-6 pb-3 shrink-0">
          <h1 className="text-xl font-black text-white">Your Subscriber Profile</h1>
          <p className="text-white/50 text-xs mt-1">This is what neighbors in {profile.zip} see about you</p>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>setTab('home')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='home'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Home</button>
            <button onClick={()=>setTab('listings')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='listings'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Listings</button>
            <button onClick={()=>setTab('posts')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='posts'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Posts</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3">
          <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:bg-white/10 focus:outline-none" placeholder="Display Name" />
          <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 h-20 text-sm text-white focus:bg-white/10 focus:outline-none resize-none" placeholder="Bio" />
          <div className="grid grid-cols-2 gap-3">
            <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Zip" />
            <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Cross Street" />
          </div>
          <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Private Address" />
          <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} placeholder="Interests, skills..." className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 h-24 text-sm text-white placeholder:text-white/30 focus:bg-white/10 focus:outline-none resize-none" />
        </div>

        <div className="p-4 pt-3 shrink-0">
          {message && <p className="text-xs text-center mb-2 text-white/70">{message}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600/90 backdrop-blur-md py-3 rounded-xl font-black text-white text-sm hover:bg-blue-600 disabled:opacity-50">
            {saving? 'SAVING...' : 'SAVE PROFILE'}
          </button>
        </div>
      </div>
    </div>
  )
}
