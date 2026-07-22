'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLocation } from '@/hooks/useLocation' // your spine hook

export default function AddBusiness(){
  const { lat, lng, address } = useLocation() // global - uses USER location
  const [form, setForm] = useState({business_name:'', address:'', type:'shop', description:''})
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  const save = async () => {
    if(!form.business_name){ setMsg('Please enter a business name'); return }
    
    const finalLat = lat || 0
    const finalLng = lng || 0
    const finalAddress = form.address || address?.formatted || ''

    const { error } = await supabase.from('block_businesses').insert([{
      business_name: form.business_name,
      address: finalAddress,
      type: form.type,
      description: form.description,
      lat: finalLat,
      lng: finalLng
    }])
    if(error) setMsg('Save Error: '+error.message)
    else setMsg(`✅ Pinned! ${form.business_name} live on /block-map`)
  }

  return (
    <div style={{maxWidth:520, margin:'40px auto', padding:20, background:'white', borderRadius:12, color:'black'}}>
      <h1 style={{fontWeight:'bold', fontSize:22}}>Add Business to Block Map</h1>
      <p style={{fontSize:12, color:'#666', marginBottom:10}}>📍 Pinning to your current location: {address?.formatted || 'Detecting...'}</p>
      <input placeholder="Business Name" value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <input placeholder="Street Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{width:'100%', padding:10, margin:'6px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <button onClick={save} style={{width:'100%', padding:12, background:'black', color:'white', borderRadius:8, marginTop:10}}>Pin to Block Map</button>
      <p style={{marginTop:12, fontWeight:'bold', color: msg.includes('✅')?'green':'black'}}>{msg}</p>
      <a href="/block-map" style={{display:'block', marginTop:15, textAlign:'center'}}>← View Map</a>
    </div>
  )
}
