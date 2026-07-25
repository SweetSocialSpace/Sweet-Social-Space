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
      if(listings) setMyListings(listings.filter((l:any)=>l.status==='active'))
      if(posts) setMyPosts(posts.filter((p:any)=>p.status==='active'))
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
    // THIS KEEPS YOUR THEME - never remove this wrapper
    <div className="min-h-screen w-full bg-[#0a0a0a] relative flex justify-center pt-10 pb-20"
         style={{
           backgroundImage: `url('https://i.ibb.co/3Wq3Q2y/gold-drip-hearts.png')`, // your teardrops+hearts image
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      {/* Dark overlay so form is readable but backdrop shows through */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Your card - with backdrop-blur so teardrops show behind it */}
      <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-xl rounded- border border-white/10 p-6 shadow-2xl mx-4">
        <h1 className="text-2xl font-black text-white">Your Subscriber Profile</h1>
        <p className="text-white/60 text-sm mb-6">This is what neighbors in {profile.zip} see about you • Your home base</p>

        <div className="flex gap-2 mb-6">
          <button onClick={()=>setTab('home')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab==='home'?'bg-white text-black':'bg-white/10 text-white hover:bg-white/20'}`}>My Home</button>
          <button onClick={()=>setTab('listings')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab==='listings'?'bg-white text-black':'bg-white/10 text-white hover:bg-white/20'}`}>My Listings ({myListings.length})</button>
          <button onClick={()=>setTab('posts')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab==='posts'?'bg-white text-black':'bg-white/10 text-white hover:bg-white/20'}`}>My Posts ({myPosts.length})</button>
        </div>

        {tab==='home' && (
          <div className="space-y-4">
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 font-bold text-white placeholder:text-white/40" placeholder="Display Name" />
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 h-32 text-white placeholder:text-white/40" placeholder="Owner and creator of this platform" />
            <div className="grid grid-cols-2 gap-3">
              <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl p-4 text-white" placeholder="ZIP 95122" />
              <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl p-4 text-white" placeholder="Cross Street Quimby rd" />
            </div>
            <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white" placeholder="Private - 1722 Quimby Road/private - never shown" />
            <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 h-24 text-white placeholder:text-white/40" placeholder="Interests, skills... what can you share with the block?" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black text-white">SAVE PROFILE</button>
          </div>
        )}

        {tab==='listings' && (
          <div className="space-y-3">
            {myListings.length===0? <p className="text-white/50 text-sm py-10 text-center">No listings yet. When you post a couch or garage sale, it appears here so you can delete it when sold.</p> :
              myListings.map(item=>(
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div><p className="font-bold text-sm text-white">{item.title}</p><p className="text-xs text-white/50">${item.price} • {item.status}</p></div>
                  <div className="flex gap-2"><button onClick={()=>markSold(item.id)} className="text-xs bg-yellow-600 px-3 py-1 rounded-full text-white">Sold</button><button onClick={()=>deleteListing(item.id)} className="text-xs bg-red-600 px-3 py-1 rounded-full text-white">Delete</button></div>
                </div>
              ))}
          </div>
        )}

        {tab==='posts' && (
          <div className="space-y-3">
            {myPosts.length===0? <p className="text-white/50 text-sm py-10 text-center">No posts yet.</p> : myPosts.map(post=>(
              <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-sm text-white">{post.body?.slice(0,120)}</p><button onClick={async()=>{await supabase.from('posts').update({status:'deleted'}).eq('id', post.id); setMyPosts(p=>p.filter(x=>x.id!==post.id))}} className="mt-2 text-xs bg-red-600 px-3 py-1 rounded-full text-white">Delete from Feed</button></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
