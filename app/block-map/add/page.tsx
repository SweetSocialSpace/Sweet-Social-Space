'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AddBusiness(){
  const [form, setForm] = useState({business_name:'', address:'', type:'restaurant', description:''})
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  const geocodeAndSave = async () => {
    try{
      if(!form.business_name || !form.address){ setMsg('Need name + address'); return }
      setMsg('Finding address...')
      
      // Use a CORS-friendly geocoder
      const url = `https://geocode.maps.co/search?q=${encodeURIComponent(form.address)}`
      const res = await fetch(url)
      const data = await res.json()
      
      if(!data || !data[0]){ setMsg('Address not found - try "999 Story Rd, San Jose, CA, USA"'); return }
      
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      setMsg(`Found: ${lat}, ${lng} - Saving...`)

      const { error } = await supabase.from('block_businesses').insert([{...form, lat, lng}])
      if(error){
        // If table doesn't exist, show that
        if(error.message.includes('does not exist')){
          setMsg('Need to create table first - go to Supabase SQL and run the create table command I gave you')
        } else {
          setMsg('Save Error: '+error.message + ' - check RLS policies, allow insert')
        }
      } else {
        setMsg(`✅ Pinned! ${form.business_name} now live on /block-map`)
        setForm({business_name:'', address:'', type:'restaurant', description:''})
      }
    }catch(e:any){
      setMsg('Geocode failed: '+ e.message + ' - try full address with zip')
    }
  }

  return (
    <div style={{maxWidth:500, margin:'50px auto', padding:20, background:'white', borderRadius:12, color:'black'}}>
      <h1 style={{fontSize:24, fontWeight:'bold'}}>Add Business to Block Map</h1>
      <input placeholder="Business Name" value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <input placeholder="999 Story Rd, San Jose, CA 95122" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0'}}>
        <option value="restaurant">Restaurant</option>
        <option value="for sale">For Sale</option>
        <option value="service">Service</option>
        <option value="shop">Shop</option>
      </select>
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{width:'100%', padding:10, margin:'8px 0', border:'1px solid #ccc', borderRadius:6}}/>
      <button onClick={geocodeAndSave} style={{width:'100%', padding:12, background:'black', color:'white', borderRadius:8, marginTop:10}}>Pin to Block Map</button>
      <p style={{marginTop:15, fontWeight:'bold', color: msg.includes('✅') ? 'green' : 'black'}}>{msg}</p>
      <a href="/block-map" style={{display:'block', marginTop:20, textAlign:'center'}}>← View Map</a>
    </div>
  )
}
