'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'


export default function ProfilePage(){
  const supabase = createClient()
  const [tab, setTab] = useState<'home'|'listings'|'posts'>('home')
  const [profile, setProfile] = useState({ display_name: '', bio: '', zip: '95122', cross_street: '', private_address: '', interests: '' })
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

  const deleteListing = async(id: string) => {
    await supabase.from('marketplace').update({ status: 'deleted' }).eq('id', id)
    setMyListings(prev => prev.filter(i => i.id!== id))
  }
  const markSold = async(id: string) => {
    await supabase.from('marketplace').update({ status: 'sold' }).eq('id', id)
    setMyListings(prev => prev.filter(i => i.id!== id))
  }

  return (
    <div className="min-h-screen w-full relative flex justify-center pt-8 pb-20"
         style={{
           backgroundImage: `url(${wallpaper.src})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed',
           backgroundColor: '#000'
         }}>

      <div className="relative z-10 w-full max-w-2xl bg-black/30 backdrop-blur-xl rounded- border border-white/10 p-6 mx-4">
        <h1 className="text-2xl font-black text-white">Your Subscriber Profile</h1>
        <p className="text-white/60 text-sm mb-6">This is what neighbors in {profile.zip} see about you • Your home base</p>

        <div className="flex gap-2 mb-6">
          <button onClick={()=>setTab('home')} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==='home'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/70'}`}>My Home</button>
          <button onClick={()=>setTab('listings')} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==='listings'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/70'}`}>My Listings ({myListings.length})</button>
          <button onClick={()=>setTab('posts')} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==='posts'?'bg-white/20 border-white/30 text-white':'bg-white/5 border-white/10 text-white/70'}`}>My Posts ({myPosts.length})</button>
        </div>

        {tab==='home' && (
          <div className="space-y-4">
            <input value={profile.display_name} onChange={e=>setProfile({...profile, display_name:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 font-bold text-white placeholder:text-white/40 focus:bg-white/10 focus:outline-none" placeholder="Sweet Social Space" />
            <textarea value={profile.bio} onChange={e=>setProfile({...profile, bio:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 h-32 text-white placeholder:text-white/40 focus:bg-white/10 focus:outline-none resize-none" placeholder="Owner and creator of this platform" />
            <div className="grid grid-cols-2 gap-3">
              <input value={profile.zip} onChange={e=>setProfile({...profile, zip:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white" placeholder="95122" />
              <input value={profile.cross_street} onChange={e=>setProfile({...profile, cross_street:e.target.value})} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white" placeholder="Quimby rd" />
            </div>
            <input value={profile.private_address} onChange={e=>setProfile({...profile, private_address:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white" placeholder="1722 Quimby Road/private" />
            <textarea value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 h-24 text-white placeholder:text-white/40 focus:bg-white/10 focus:outline-none resize-none" placeholder="Interests, skills... what can you share with the block?" />
            <button className="w-full bg-blue-600/80 backdrop-blur-md py-4 rounded-xl font-black text-white">SAVE PROFILE</button>
          </div>
        )}

        {tab==='listings' && (
          <div className="space-y-3">
            {myListings.map(item=>(
              <div key={item.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex justify-between items-center">
                <div><p className="font-bold text-sm text-white">{item.title}</p><p className="text-xs text-white/50">${item.price}</p></div>
                <div className="flex gap-2"><button onClick={()=>markSold(item.id)} className="text-xs bg-yellow-600/70 px-3 py-1.5 rounded-full text-white">Sold</button><button onClick={()=>deleteListing(item.id)} className="text-xs bg-red-600/70 px-3 py-1.5 rounded-full text-white">Delete</button></div>
              </div>
            ))}
          </div>
        )}

        {tab==='posts' && (
          <div className="space-y-3">
            {myPosts.map(post=>(
              <div key={post.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4"><p className="text-sm text-white/90">{post.body?.slice(0,120)}</p><button onClick={async()=>{await supabase.from('posts').update({status:'deleted'}).eq('id', post.id); setMyPosts(p=>p.filter(x=>x.id!==post.id))}} className="mt-3 text-xs bg-red-600/70 px-3 py-1.5 rounded-full text-white">Delete</button></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
