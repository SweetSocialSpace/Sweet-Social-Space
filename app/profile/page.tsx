'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const ZIP_MAP: Record<string,string> = {
  "95122": "Quimby/Tully, East San Jose",
  "95116": "Alum Rock / Little Portugal",
  "95127": "Berryessa / Alum Rock Foothills",
  "95118": "Cambrian Park",
  "95123": "Blossom Valley",
  "95125": "Willow Glen",
  "95126": "West San Jose / Rose Garden",
  "95128": "West San Jose",
  "95112": "Downtown San Jose",
  "95113": "Downtown San Jose",
  "95110": "North San Jose / Japantown",
  "95131": "Berryessa",
  "95132": "Berryessa / Alum Rock",
  "95133": "Berryessa / Mayfair",
  "95148": "Evergreen / East San Jose",
  "95121": "Evergreen",
  "95120": "Almaden Valley",
  "95002": "Alviso",
}

function ProfileContent(){
  const [p, setP] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const required = searchParams.get('required')

  useEffect(()=>{
    (async()=>{
      const {data:{user}} = await supabase.auth.getUser()
      if(!user) return
      const {data} = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if(data) setP(data)
    })()
  },[])

  const zipToNeighborhood = (zip: string) => {
    if (zip.length < 5) return
    const clean = zip.trim()
    if (ZIP_MAP[clean]) {
      setP((prev:any) => {
        if (!prev.neighborhood || prev.neighborhood === '') {
          return {...prev, neighborhood: ZIP_MAP[clean]}
        }
        return prev
      })
    } else if (clean.length === 5) {
      // if not in our map, just put San Jose, CA for any 951xx
      if (clean.startsWith('951')) {
        setP((prev:any) => {
          if (!prev.neighborhood || prev.neighborhood === '') {
            return {...prev, neighborhood: "San Jose, CA"}
          }
          return prev
        })
      }
    }
  }

  const save = async()=>{
    setSaving(true)
    try {
      const {data:{user}} = await supabase.auth.getUser()
      if(!user) throw new Error('Not logged in')
      const {error} = await supabase.from('profiles').upsert({
        id: user.id,
        username: p.display_name || user.email?.split('@')[0] || 'user',
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
      window.location.href = '/feed'
    } catch(e:any){
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = "w-full p-3 rounded-xl bg-white/15 text-white font-black placeholder:text-white/60 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
  const areaStyle = "w-full p-3 rounded-xl bg-black/50 text-white font-bold placeholder:text-white/50 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm"

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black/60 rounded-2xl border border-white/20 text-white mt-10 backdrop-blur-md">
      {required && (
        <div className="bg-red-600/90 text-white p-3 rounded-xl mb-4 font-bold text-center border-2 border-white">
          ⚠️ You must complete your profile (Name + Zip Code) to access the feed!
        </div>
      )}
      <h1 className="text-2xl font-black text-white">Your Subscriber Profile</h1>
      <p className="text-white font-semibold text-sm mt-1">This is what neighbors in {p.zip_code || '95122'} see about you</p>
      <div className="mt-6 space-y-4">
        <input value={p.display_name||''} onChange={e=>setP({...p, display_name:e.target.value})} placeholder="Display Name" className={inputStyle}/>
        <textarea value={p.bio||''} onChange={e=>setP({...p, bio:e.target.value})} placeholder="About you - add as much as you want!" rows={5} className={areaStyle}/>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={p.zip_code||''}
            onChange={e=>{
              const z = e.target.value
              setP((prev:any)=>({...prev, zip_code:z}))
              zipToNeighborhood(z)
            }}
            placeholder="Zip - REQUIRED"
            className={inputStyle + " ring-2 ring-blue-500"}
          />
          <input value={p.neighborhood||''} onChange={e=>setP({...p, neighborhood:e.target.value})} placeholder="Neighborhood - auto-fills!" className={inputStyle}/>
        </div>
        <input value={p.address||''} onChange={e=>setP({...p, address:e.target.value})} placeholder="Street Address" className={inputStyle}/>
        <textarea value={p.interests||''} onChange={e=>setP({...p, interests:e.target.value})} placeholder="Interests, skills..." rows={3} className={areaStyle}/>
        <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-black text-white text-lg">{saving?'Saving...':'SAVE PROFILE'}</button>
      </div>
    </div>
  )
}

export default function ProfilePage(){
  return <Suspense fallback={<div className="text-white p-10">Loading profile...</div>}><ProfileContent /></Suspense>
}
