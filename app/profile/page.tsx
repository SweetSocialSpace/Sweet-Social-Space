'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage(){
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
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
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setMsg('Not logged in'); setSaving(false); return }
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      username: profile.username.toLowerCase().replace(/[^a-z0-9_]/g,''),
      display_name: profile.display_name,
      bio: profile.bio,
      zip: profile.zip,
      cross_street: profile.cross_street,
      private_address: profile.private_address,
      interests: profile.interests,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    if(error){ setMsg('Error: '+error.message) } else {
      setMsg('Saved! Returning to feed...')
      setTimeout(()=> router.push('/'), 1000) // <-- goes back to feed
    }
    setSaving(false)
  }

  const title = profile.display_name || (profile.username? `@${profile.username}` : 'Your Profile')

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center px-4 py-6 gap-6">
      <div className="hidden lg:block w- shrink-0"><div className="sticky top-24 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 h-48 flex items-center justify-center"><span className="text-white/30 text-xs">Your Photos</span></div></div>

      <div className="w-full max-w- bg-black/40 backdrop-blur-xl rounded- border border-white/10 shadow-2xl flex flex-col max-h- overflow-hidden">
        {/* NEW HEADER WITH BACK BUTTON */}
        <div className="p-4 pb-3 shrink-0 border-b border-white/5 flex items-center justify-between">
          <button onClick={()=>router.push('/')} className="text-white/60 hover:text-white text-xs font-bold px-2 py-1 rounded-full bg-white/5 border border-white/10">← Feed</button>
          <h1 className="text-sm font-black text-white truncate">{title}</h1>
          <div className="w-"></div>
        </div>

        <div className="p-5 pb-2 shrink-0">
          <p className="text-white/50 text-">{profile.username? `@${profile.username} • Neighbors in ${profile.zip} see this` : `What neighbors in ${profile.zip} see`}</p>
          <div className="flex gap-1.5 mt-3">
            <button onClick={()=>setTab('home')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='home'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Home</button>
            <button onClick={()=>setTab('listings')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='listings'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Listings</button>
            <button onClick={()=>setTab('posts')} className={`px-3 py-1 rounded-full text- font-bold border ${tab==='posts'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Posts</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={profile.username} onChange={e=>setProfile({...profile, username:e.target.value})} placeholder="username (public)" className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30" />
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} placeholder="Display Name" className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white" />
          </div>
          <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-16 text-sm text-white resize-none" placeholder="Bio" />
          <div className="grid grid-cols-2 gap-2">
            <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Zip" />
            <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Cross street" />
          </div>
          <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" placeholder="Private address" />
          <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} placeholder="Interests, skills..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-20 text-sm text-white placeholder:text-white/30 resize-none" />
        </div>

        <div className="p-4 shrink-0 border-t border-white/5">
          {msg && <p className="text- text-center mb-2 text-white/70">{msg}</p>}
          <div className="flex gap-2">
            <button onClick={()=>router.push('/')} className="flex-1 bg-white/10 py-2.5 rounded-xl font-bold text-white text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] bg-blue-600/90 py-2.5 rounded-xl font-black text-white text-sm">{saving?'SAVING...':'SAVE & GO TO FEED'}</button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w- shrink-0"><div className="sticky top-24 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 h-48 flex items-center justify-center"><span className="text-white/30 text-xs">Extra Content</span></div></div>
    </div>
  )
}
