'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage(){
  const supabase = createClient()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
  const [profile, setProfile] = useState({ display_name: 'Sweet Social Space', bio: 'Owner and creator of this platform', zip: '95122', cross_street: 'Quimby rd', private_address: '1722 Quimby Road/private', interests: '' })
  const [myListings, setMyListings] = useState<any[]>([])
  const [myPosts, setMyPosts] = useState<any[]>([])

  useEffect(()=>{
    const load = async() => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      const { data: listings } = await supabase.from('marketplace').select('*').eq('user_id', user.id).order('created_at', {ascending:false})
      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', {ascending:false})
      if(listings) setMyListings(listings)
      if(posts) setMyPosts(posts)
    }
    load()
  },[])

  const deleteListing = async(id: string) => {
    await supabase.from('marketplace').update({ status: 'deleted' }).eq('id', id)
    setMyListings(prev => prev.filter(i => i.id!== id))
  }
  const markSold = async(id: string) => {
    await supabase.from('marketplace').update({ status: 'sold' }).eq('id', id)
    setMyListings(prev => prev.filter(i => i.id!== id))
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex justify-center" style={{backgroundImage: `url('/bg-drip.png')`, backgroundSize: 'cover'}}>
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl rounded- border border-white/10 p-6">
        <h1 className="text-2xl font-black">Your Subscriber Profile</h1>
        <p className="text-white/60 text-sm mb-4">This is what neighbors in {profile.zip} see about you • Your home base</p>

        <div className="flex gap-2 mb-6">
          <button onClick={()=>setTab('home')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab==='home'?'bg-white text-black':'bg-white/10'}`}>My Home</button>
          <button onClick={()=>setTab('listings')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab==='listings'?'bg-white text-black':'bg-white/10'}`}>My Listings ({myListings.length})</button>
          <button onClick={()=>setTab('posts')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab==='posts'?'bg-white text-black':'bg-white/10'}`}>My Posts ({myPosts.length})</button>
        </div>

        {tab==='home' && (
          <div className="space-y-4">
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/10 rounded-xl p-4 font-bold" placeholder="Display Name" />
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-black rounded-xl p-4 h-32" placeholder="Owner and creator of this platform - Tell neighbors about you" />
            <div className="grid grid-cols-2 gap-3">
              <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/10 rounded-xl p-4" placeholder="ZIP 95122" />
              <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/10 rounded-xl p-4" placeholder="Cross Street Quimby rd" />
            </div>
            <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/10 rounded-xl p-4" placeholder="Private - 1722 Quimby Road - never shown publicly" />
            <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} className="w-full bg-black rounded-xl p-4 h-24" placeholder="Interests, skills... what can you share with the block?" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black">SAVE PROFILE</button>
          </div>
        )}

        {tab==='listings' && (
          <div className="space-y-3">
            {myListings.length===0? <p className="text-white/50 text-sm py-10 text-center">No listings yet. When you post a Free Couch or Garage Sale, it will show up here and you can delete it when sold.</p> :
              myListings.map(item=>(
                <div key={item.id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-white/50">${item.price} • {item.zip_code} • {item.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>markSold(item.id)} className="text-xs bg-yellow-600 px-3 py-1 rounded-full">Sold</button>
                    <button onClick={()=>deleteListing(item.id)} className="text-xs bg-red-600 px-3 py-1 rounded-full">Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab==='posts' && (
          <div className="space-y-3">
            {myPosts.map(post=>(
              <div key={post.id} className="bg-white/5 rounded-xl p-4">
                <p className="text-sm">{post.body?.slice(0,120)}</p>
                <button onClick={async()=>{await supabase.from('posts').update({status:'deleted'}).eq('id', post.id); setMyPosts(p=>p.filter(x=>x.id!==post.id))}} className="mt-2 text-xs bg-red-600 px-3 py-1 rounded-full">Delete from Feed</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
