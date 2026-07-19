'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

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
  try {
    const {data:{user}} = await supabase.auth.getUser()
    if(!user) throw new Error('Not logged in')
    
    const {error} = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: p.display_name,
      bio: p.bio,
      zip_code: p.zip_code || '95122',
      neighborhood: p.neighborhood,
      address: p.address,
      interests: p.interests,
      email: user.email,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
    
    if(error) throw error
    
    // Success - go back to feed
    window.location.href = '/feed'
  } catch(e:any){
    alert('Save failed: ' + e.message)
    console.error(e)
  } finally {
    setSaving(false)
  }
}

 const inputStyle = "w-full p-3 rounded-xl bg-white/15 text-white font-black placeholder:text-white/60 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
const areaStyle = "w-full p-3 rounded-xl bg-black/50 text-white font-bold placeholder:text-white/50 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm"
  return (
    <div className="max-w-2xl mx-auto p-6 bg-black/60 rounded-2xl border border-white/20 text-white mt-10 backdrop-blur-md">
      <h1 className="text-2xl font-black text-white">Your Subscriber Profile</h1>
      <p className="text-white font-semibold text-sm mt-1">This is what neighbors in {p.zip_code || '95122'} see about you</p>
      
      <div className="mt-6 space-y-4">
        <input value={p.display_name||''} onChange={e=>setP({...p, display_name:e.target.value})} placeholder="Display Name" className={inputStyle}/>
        
        <textarea value={p.bio||''} onChange={e=>setP({...p, bio:e.target.value})} placeholder="About you - add as much as you want! Hobbies, family, what you're looking for..." rows={5} className={areaStyle}/>
        
        <div className="grid grid-cols-2 gap-3">
          <input value={p.zip_code||''} onChange={e=>setP({...p, zip_code:e.target.value})} placeholder="Zip - REQUIRED" className={inputStyle + " ring-2 ring-blue-500"}/>
          <input value={p.neighborhood||''} onChange={e=>setP({...p, neighborhood:e.target.value})} placeholder="Neighborhood (Alum Rock, etc)" className={inputStyle}/>
        </div>
        
        <input value={p.address||''} onChange={e=>setP({...p, address:e.target.value})} placeholder="Street Address (optional, private)" className={inputStyle}/>
        
        <textarea value={p.interests||''} onChange={e=>setP({...p, interests:e.target.value})} placeholder="Interests, skills you can share, things you need..." rows={3} className={areaStyle}/>
        
        <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-black text-white text-lg tracking-wide">{saving?'Saving...':'SAVE PROFILE'}</button>
      </div>
    </div>
  )
}
