'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AddBusiness(){
  const [form, setForm] = useState({business_name:'', address:'', type:'shop', description:'', lat:'', lng:''})
  const [msg, setMsg] = useState('')
  const [locating, setLocating] = useState(true)
  const supabase = createClient()

  // Get USER location - no more 37.3369 hardcoded
  useEffect(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        setForm(f=>({...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString()}))
        setLocating(false)
      }, ()=>{
        setLocating(false)
      })
    } else {
      setLocating(false)
    }
  },[])

  const save = async () => {
    if(!form.business_name){ setMsg('Please enter a business name'); return }
    const latNum = parseFloat(form.lat)
    const lngNum = parseFloat(form.lng)
    if(isNaN(latNum) || isNaN(lngNum)){ setMsg('Waiting for location or enter lat/lng manually'); return }

    const { error } = await supabase.from('block_businesses').insert([{
      business_name: form.business_name,
      address: form.address,
      type: form.type,
      description: form.description,
      lat: latNum,
      lng: lngNum
    }])
    if(error) setMsg('Save Error: '+error.message)
    else setMsg(`✅ Pinned! ${form.business_name} live on /block-map`)
  }

  return (
    <div style={{maxWidth:520, margin:'40px auto', padding:20, background:'white', borderRadius:12, color:'black'}}>
      <h1 style={{fontWeight:'bold', fontSize:22}}>Add Business to Block Map</h1>
      <p style={{fontSize:12, color:'#666', marginBottom:10}}>{locating ? '📍 Detecting your location...' : `📍 Pinning to: ${form.lat.slice(0,7)}, ${form.lng.slice(0,8)}`}</p>
      <input placeholder="Business Name" value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <input placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Lat (auto)" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})} style={{flex:1, padding:10, border:'1px solid #ccc', borderRadius:6}}/>
        <input placeholder="Lng (auto)" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})} style={{flex:1, padding:10, border:'1px solid #ccc', borderRadius:6}}/>
      </div>
      <button onClick={save} style={{width:'100%', padding:12, background:'black', color:'white', borderRadius:8, marginTop:10}}>Pin to Block Map</button>
      <p style={{marginTop:12, fontWeight:'bold', color: msg.includes('✅')?'green':'black'}}>{msg}</p>
      <a href="/block-map" style={{display:'block', marginTop:15, textAlign:'center'}}>← View Map</a>
    </div>
  )
}
