'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage(){
  const supabase = createClient()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
  const [profile, setProfile] = useState({ display_name: 'Sweet Social Space', bio: 'Owner and creator', zip: '95122', cross_street: 'Quimby rd', private_address: '1722 Quimby Road/private', interests: '' })
  const [myListings, setMyListings] = useState<any[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])

  useEffect(()=>{
    const load = async() => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      const { data: listings } = await supabase.from('marketplace').select('*').eq('user_id', user.id).eq('status','active').order('created_at', {ascending:false})
      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).eq('status','active').order('created_at', {ascending:false})
      if(listings) setMyListings(listings)
      if(posts) setMyPosts(posts)
    }
    load()
  },[])

  return (
    <div className="min-h-screen w-full flex justify-center pt-4 pb-6 px-3">
      <div className="w-full max-w- bg-black/40 backdrop-blur-xl rounded- border border-white/10 p-4 flex flex-col max-h-">
        <h1 className="text-xl font-black text-white">Your Subscriber Profile</h1>
        <p className="text-white/50 text- mb-3">This is what neighbors in {profile.zip} see about you</p>

        <div className="flex gap-1.5 mb-3">
          <button onClick={()=>setTab('home')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='home'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Home</button>
          <button onClick={()=>setTab('listings')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='listings'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Listings ({myListings.length})</button>
          <button onClick={()=>setTab('posts')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tab==='posts'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/60'}`}>My Posts ({myPosts.length})</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {tab==='home' && (
          <>
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:bg-white/10 focus:outline-none" />
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 h-20 text-sm text-white focus:bg-white/10 focus:outline-none resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" />
              <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>
            <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-white" />
            <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} placeholder="Interests, skills..." className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 h-20 text-sm text-white placeholder:text-white/30 focus:bg-white/10 focus:outline-none resize-none" />
          </>
        )}
        {tab!=='home' && <p className="text-white/40 text-xs text-center py-10">Nothing here yet</p>}
        </div>

        <button className="mt-3 w-full bg-blue-600/90 backdrop-blur-md py-3 rounded-xl font-black text-white text-sm">SAVE PROFILE</button>
      </div>
    </div>
  )
}
