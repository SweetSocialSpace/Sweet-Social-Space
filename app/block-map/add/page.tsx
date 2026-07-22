'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AddBusiness(){
  const [form, setForm] = useState({business_name:'', address:'', type:'restaurant', description:''})
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  const geocodeAndSave = async () => {
    setMsg('Finding address...')
    // Free geocode from OpenStreetMap
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`)
    const data = await res.json()
    if(!data[0]){ setMsg('Address not found, try full address with city'); return }
    
    const lat = parseFloat(data[0].lat)
    const lng = parseFloat(data[0].lon)

    const { error } = await supabase.from('block_businesses').insert([{...form, lat, lng}])
    if(error) setMsg('Error: '+error.message)
    else {
      setMsg(`Pinned! ${form.business_name} at ${lat}, ${lng} - now live on /block-map`)
      setForm({business_name:'', address:'', type:'restaurant', description:''})
    }
  }

  return (
    <div style={{maxWidth:500, margin:'50px auto', padding:20, background:'white', borderRadius:12, color:'black'}}>
      <h1 style={{fontSize:24, fontWeight:'bold'}}>Add Business to Block Map</h1>
      <p style={{fontSize:12, marginBottom:20}}>This auto-pins to your full-screen map. Safe - doesn't touch map code.</p>
      
      <input placeholder="Business Name" value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <input placeholder="Full Address - 123 Main St, Capitola, CA" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0'}}>
        <option value="restaurant">Restaurant</option>
        <option value="for sale">For Sale</option>
        <option value="service">Service</option>
        <option value="shop">Shop</option>
      </select>
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>

      <button onClick={geocodeAndSave} style={{width:'100%', padding:12, background:'black', color:'white', borderRadius:8, marginTop:10}}>Pin to Block Map</button>
      <p style={{marginTop:15, fontWeight:'bold'}}>{msg}</p>
      <a href="/block-map" style={{display:'block', marginTop:20, textAlign:'center'}}>← View Map</a>
    </div>
  )
}
