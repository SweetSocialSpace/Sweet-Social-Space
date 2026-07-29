'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserLocation = {
  latitude: number | null
  longitude: number | null
  state_code: string | null
  country_code: string | null
  location_label: string | null
  zip: string | null
  city: string | null
}

const EMPTY: UserLocation = {
  latitude: null, longitude: null, state_code: null, country_code: null, location_label: null, zip: null, city: null
}

async function reverseGeocode(lat: number, lng: number){
  try{
    const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
    if(!r.ok) return {state_code:null,country_code:null,label:null,zip:null,city:null}
    const j:any=await r.json()
    const country=(j.countryCode||'').toUpperCase()||null
    const sub:string=j.principalSubdivisionCode||''
    const state_code=sub.includes('-')?sub.split('-')[1]:(j.principalSubdivision||null)
    const city=j.city||j.locality||''
    const zip=j.postcode||null
    const label=[city,state_code,country].filter(Boolean).join(', ')||null
    return {state_code:state_code||null,country_code:country,label,city:city||null,zip:zip||null}
  }catch{return {state_code:null,country_code:null,label:null,zip:null,city:null}}
}

export function useUserLocation(userId: string | undefined) {
  const [loc,setLoc]=useState<UserLocation>(EMPTY)
  const [ready,setReady]=useState(false)
  const [prompting,setPrompting]=useState(false)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{
    if(!userId){setReady(true);return}
    let cancelled=false
    ;(async()=>{
      try{
        const supabase=createClient()
        const {data}=await (supabase as any).rpc('get_my_private_profile')
        if(cancelled) return
        const row=(Array.isArray(data)?data[0]:data)??{}
        setLoc({
          latitude:row.latitude??null,
          longitude:row.longitude??null,
          state_code:row.state_code??null,
          country_code:row.country_code??null,
          location_label:row.location_label??null,
          zip:row.zip_code||row.zip||null,
          city:row.city||null
        })
      }catch{}finally{if(!cancelled) setReady(true)}
    })()
    return()=>{cancelled=true}
  },[userId])

  const saveLocation=useCallback(async(next:UserLocation)=>{
    try{
      setLoc(next)
      if(!userId) return
      const supabase=createClient()
      const safeZip=(next.zip&&next.zip.toUpperCase()!=='YOUR BLOCK'&&next.zip!==''?next.zip:'GLOBAL')
      await (supabase as any).from('profiles').update({
        latitude:next.latitude,
        longitude:next.longitude,
        state_code:next.state_code,
        country_code:next.country_code,
        location_label:next.location_label,
        zip_code:safeZip,
        zip:safeZip,
        city:next.city||'',
        body:`${next.city||''} ${safeZip} - location`
      }).eq('user_id',userId)
    }catch{}
  },[userId])

  const requestGeolocation=useCallback(async()=>{
    try{
      if(typeof window==='undefined'||!('geolocation' in navigator)){setError("Browser doesn't support location.");return}
      setError(null);setPrompting(true)
      const pos=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:300000}))
      const lat=pos.coords.latitude;const lng=pos.coords.longitude
      const geo=await reverseGeocode(lat,lng)
      await saveLocation({latitude:lat,longitude:lng,state_code:geo.state_code,country_code:geo.country_code,location_label:geo.label,zip:geo.zip,city:geo.city})
    }catch(e:any){try{setError(e?.message||"Couldn't get location.")}catch{}}finally{try{setPrompting(false)}catch{}}
  },[saveLocation])

  useEffect(()=>{
    try{
      if(!ready) return
      if(loc.latitude!==null&&loc.longitude!==null) return
      if(prompting) return
      if(typeof window==='undefined') return
      let hasTried=null;try{hasTried=sessionStorage.getItem('auto-geo-tried')}catch{}
      if(hasTried) return
      try{sessionStorage.setItem('auto-geo-tried','1')}catch{}
      requestGeolocation()
    }catch{}
  },[ready,loc.latitude,loc.longitude,prompting,requestGeolocation])

  return {loc,ready,prompting,error,requestGeolocation,saveLocation}
}

export function milesBetween(lat1:number,lng1:number,lat2:number,lng2:number):number{
  try{const toRad=(d:number)=>(d*Math.PI)/180;const R=3958.7613;const dLat=toRad(lat2-lat1);const dLng=toRad(lng2-lng1);const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(a))}catch{return 0}
}
