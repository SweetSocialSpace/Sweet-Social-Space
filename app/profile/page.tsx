'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage(){
  const [p, setP] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(()=>{ 
    (async()=>{
      const {data:{user}} = await supabase.auth.getUser()
      if(!user) return
      const {data} = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if(data) setP(data)
    })()
  },[])

  const save = async()=>{
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({...p, id: user?.id, updated_at: new Date()})
    setSaving(false)
    alert('Profile saved!')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black/40 rounded-2xl border border-white/10 text-white mt-10">
      <h1 className="text-2xl font-bold">Your Subscriber Profile</h1>
      <p className="text-white/60 text-sm mt-1">This is what neighbors in {p.zip_code || '95122'} see about you</p>
      
      <div className="mt-6 space-y-4">
        <input value={p.display_name||''} onChange={e=>setP({...p, display_name:e.target.value})} placeholder="Display Name" className="w-full p-3 rounded-xl bg-white/10 border border-white/10"/>
        
        <textarea value={p.bio||''} onChange={e=>setP({...p, bio:e.target.value})} placeholder="About you - add as much as you want! Hobbies, family, what you're looking for in the neighborhood..." rows={5} className="w-full p-3 rounded-xl bg-white/10 border border-white/10"/>
        
        <div className="grid grid-cols-2 gap-3">
          <input value={p.zip_code||''} onChange={e=>setP({...p, zip_code:e.target.value})} placeholder="Zip - REQUIRED" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 ring-1 ring-blue-500/50"/>
          <input value={p.neighborhood||''} onChange={e=>setP({...p, neighborhood:e.target.value})} placeholder="Neighborhood (Alum Rock, etc)" className="w-full p-3 rounded-xl bg-white/10 border border-white/10"/>
        </div>
        
        <input value={p.address||''} onChange={e=>setP({...p, address:e.target.value})} placeholder="Street Address (optional, private - only for verification)" className="w-full p-3 rounded-xl bg-white/10 border border-white/10"/>
        
        <textarea value={p.interests||''} onChange={e=>setP({...p, interests:e.target.value})} placeholder="Interests, skills you can share, things you need..." rows={3} className="w-full p-3 rounded-xl bg-white/10 border border-white/10"/>
        
        <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-bold">{saving?'Saving...':'SAVE PROFILE'}</button>
      </div>
    </div>
  )
}
