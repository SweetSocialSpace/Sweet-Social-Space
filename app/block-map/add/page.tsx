'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AddBusiness(){
  const [form, setForm] = useState({business_name:'', address:'', type:'shop', description:'', lat:'', lng:''})
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  const tryGeocode = async () => {
    setMsg('Trying to find...')
    try{
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(form.address)}`)
      const data = await res.json()
      if(data[0]){
        setForm(f=>({...f, lat: data[0].lat, lng: data[0].lon}))
        setMsg(`Found: ${data[0].lat}, ${data[0].lon} - now hit Pin`)
      } else setMsg('Not found - paste lat/lng from Google Maps below')
    }catch{ setMsg('Geocode blocked - paste lat/lng manually') }
  }

  const save = async () => {
    if(!form.lat || !form.lng){ setMsg('Need lat & lng - hit Try Find or paste from Google'); return }
    const { error } = await supabase.from('block_businesses').insert([{
      business_name: form.business_name,
      address: form.address,
      type: form.type,
      description: form.description,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng)
    }])
    if(error) setMsg('Save Error: '+error.message)
    else setMsg(`✅ Pinned! ${form.business_name} live on /block-map`)
  }

  return (
    <div style={{maxWidth:520, margin:'40px auto', padding:20, background:'white', borderRadius:12, color:'black'}}>
      <h1 style={{fontWeight:'bold', fontSize:22}}>Add Business to Block Map</h1>
      <p style={{fontSize:12}}>Tip: Get lat/lng from Google Maps - right-click pin → copy coordinates</p>
      
      <input placeholder="Business Name" value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <input placeholder="999 Story Rd, San Jose, CA 95122" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Lat - 37.336" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})} style={{flex:1, padding:10, border:'1px solid #ccc', borderRadius:6}}/>
        <input placeholder="Lng - -121.86" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})} style={{flex:1, padding:10, border:'1px solid #ccc', borderRadius:6}}/>
      </div>

      <div style={{display:'flex', gap:8, marginTop:10}}>
        <button onClick={tryGeocode} style={{flex:1, padding:12, background:'#eee', borderRadius:8}}>Try Auto-Find</button>
        <button onClick={save} style={{flex:1, padding:12, background:'black', color:'white', borderRadius:8}}>Pin to Block Map</button>
      </div>

      <p style={{marginTop:12, fontWeight:'bold', color: msg.includes('✅')?'green':'black'}}>{msg}</p>
      <div style={{marginTop:10, fontSize:12, background:'#f5f5f5', padding:8, borderRadius:6}}>
        For Story & King use: Lat <b>37.3369</b> Lng <b>-121.8563</b>
      </div>
      <a href="/block-map" style={{display:'block', marginTop:15, textAlign:'center'}}>← View Map</a>
    </div>
  )
}
